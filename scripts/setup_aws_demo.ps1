# aegis-aws-demo-setup.ps1
# Creates intentionally vulnerable AWS resources for AEGIS Cloud Risk Capstone evaluation.
# WARNING: DO NOT RUN THIS IN A PRODUCTION ACCOUNT. THIS WILL CREATE SEVERE SECURITY RISKS.

Write-Host "Setting up AWS AEGIS Demo Environment..."

# 1. IAM Risks (IAM001, IAM002, IAM003)
Write-Host "Creating over-privileged and non-MFA IAM users..."
aws iam create-user --user-name aegis-overpriv-user
aws iam attach-user-policy --user-name aegis-overpriv-user --policy-arn arn:aws:iam::aws:policy/AdministratorAccess

aws iam create-user --user-name aegis-nomfa-user
aws iam create-login-profile --user-name aegis-nomfa-user --password "AegisDemoPassword123!" --password-reset-required

aws iam create-user --user-name aegis-dormant-user

# 2. Networking (NET001, EXP001)
Write-Host "Creating open Security Group..."
$VPC_ID = aws ec2 describe-vpcs --query 'Vpcs[?isDefault==`true`].VpcId' --output text
$SG_ID = aws ec2 create-security-group --group-name aegis-open-sg --description "Open management ports" --vpc-id $VPC_ID --query 'GroupId' --output text
aws ec2 authorize-security-group-ingress --group-id $SG_ID --protocol tcp --port 22 --cidr 0.0.0.0/0
aws ec2 authorize-security-group-ingress --group-id $SG_ID --protocol tcp --port 3389 --cidr 0.0.0.0/0

# 3. Compute & Workloads (WRK001, WRK002)
Write-Host "Launching unmonitored and exposed EC2 instance..."
$AMI_ID = aws ec2 describe-images --owners amazon --filters "Name=name,Values=amzn2-ami-hvm-2.0.????????.?-x86_64-gp2" "Name=state,Values=available" --query "sort_by(Images, &CreationDate)[-1].ImageId" --output text
$SUBNET_ID = aws ec2 describe-subnets --filters "Name=vpc-id,Values=$VPC_ID" --query 'Subnets[0].SubnetId' --output text

aws ec2 run-instances `
    --image-id $AMI_ID `
    --count 1 `
    --instance-type t2.micro `
    --security-group-ids $SG_ID `
    --subnet-id $SUBNET_ID `
    --associate-public-ip-address `
    --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=aegis-vuln-workload}]'

# 4. Storage (STO001, STO002, STO003, STO004, DSPM001)
Write-Host "Creating publicly accessible, unencrypted S3 bucket..."
$RAND1 = Get-Random -Maximum 100000
$RAND2 = Get-Random -Maximum 100000
$BUCKET_NAME = "aegis-demo-bucket-$RAND1$RAND2"
aws s3api create-bucket --bucket $BUCKET_NAME --region us-east-1
aws s3api delete-public-access-block --bucket $BUCKET_NAME

# Apply an anonymous public read policy
$policy = @"
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::$BUCKET_NAME/*"
        }
    ]
}
"@
$policy | Out-File -FilePath "$env:TEMP\public-policy.json" -Encoding ASCII
aws s3api put-bucket-policy --bucket $BUCKET_NAME --policy file:///$env:TEMP/public-policy.json

# Upload mock PII to simulate DSPM001
$piiData = "Name,SSN,CreditCard`nJohn Doe,000-00-0000,4111-1111-1111-1111"
$piiData | Out-File -FilePath "$env:TEMP\mock_pii.csv" -Encoding ASCII
aws s3 cp "$env:TEMP\mock_pii.csv" "s3://$BUCKET_NAME/customers/mock_pii.csv"

# 5. Databases (DB001)
Write-Host "Creating unencrypted RDS database..."
aws rds create-db-instance `
    --db-instance-identifier aegis-unencrypted-db `
    --db-instance-class db.t3.micro `
    --engine mysql `
    --master-username admin `
    --master-user-password "AegisDemoDbPass123!" `
    --allocated-storage 20 `
    --no-storage-encrypted `
    --publicly-accessible

Write-Host "AWS Demo Environment provisioning triggered successfully!"
Write-Host "Note: RDS and EC2 instances may take a few minutes to fully start."
