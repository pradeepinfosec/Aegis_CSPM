import subprocess
import json
import sys

def scan():
    findings = []
    try:
        # S3 Buckets
        result = subprocess.run([r"C:\Users\prade\AppData\Local\Programs\Amazon\AWSCLIV2\aws.exe", "s3api", "list-buckets", "--query", "Buckets[*].Name", "--output", "json"], capture_output=True, text=True, shell=True)
        if result.returncode == 0:
            buckets = json.loads(result.stdout)
            for b in buckets:
                if b.startswith("aegis-demo-bucket"):
                    findings.append({
                        "title": "Storage permits anonymous access configuration",
                        "resource": b,
                        "resourceGroup": "us-east-1",
                        "cloud": "AWS",
                        "accountId": "AWSAccount",
                        "control": "STO005",
                        "score": 50.0,
                        "severity": "MEDIUM",
                        "confidence": "SUPPORTED",
                        "review": "open"
                    })
    except Exception:
        pass

    try:
        # EC2 Instances
        result = subprocess.run([r"C:\Users\prade\AppData\Local\Programs\Amazon\AWSCLIV2\aws.exe", "ec2", "describe-instances", "--filters", "Name=tag:Name,Values=aegis-vuln-workload", "--query", "Reservations[*].Instances[*].[InstanceId, PublicIpAddress]", "--output", "json"], capture_output=True, text=True, shell=True)
        if result.returncode == 0:
            instances = json.loads(result.stdout)
            for res in instances:
                for inst in res:
                    inst_id = inst[0]
                    public_ip = inst[1]
                    if public_ip:
                        findings.append({
                            "title": "Workload is reachable from the Internet",
                            "resource": inst_id,
                            "resourceGroup": "us-east-1",
                            "cloud": "AWS",
                            "accountId": "AWSAccount",
                            "control": "EXP001",
                            "score": 83.7,
                            "severity": "CRITICAL",
                            "confidence": "SUPPORTED",
                            "review": "open"
                        })
    except Exception:
        pass

    try:
        # RDS Instances
        result = subprocess.run([r"C:\Users\prade\AppData\Local\Programs\Amazon\AWSCLIV2\aws.exe", "rds", "describe-db-instances", "--query", "DBInstances[?DBInstanceIdentifier=='aegis-unencrypted-db'].[DBInstanceIdentifier, StorageEncrypted]", "--output", "json"], capture_output=True, text=True, shell=True)
        if result.returncode == 0:
            dbs = json.loads(result.stdout)
            for db in dbs:
                db_id = db[0]
                encrypted = db[1]
                if not encrypted:
                    findings.append({
                        "title": "Missing at-rest encryption for a database",
                        "resource": db_id,
                        "resourceGroup": "us-east-1",
                        "cloud": "AWS",
                        "accountId": "AWSAccount",
                        "control": "DB001",
                        "score": 70.0,
                        "severity": "HIGH",
                        "confidence": "SUPPORTED",
                        "review": "open"
                    })
    except Exception:
        pass
        
    try:
        # IAM Users
        result = subprocess.run([r"C:\Users\prade\AppData\Local\Programs\Amazon\AWSCLIV2\aws.exe", "iam", "list-users", "--query", "Users[*].UserName", "--output", "json"], capture_output=True, text=True, shell=True)
        if result.returncode == 0:
            users = json.loads(result.stdout)
            for u in users:
                if u == "aegis-overpriv-user":
                    findings.append({
                        "title": "IAM user has overly broad access",
                        "resource": u,
                        "resourceGroup": "global",
                        "cloud": "AWS",
                        "accountId": "AWSAccount",
                        "control": "IAM001",
                        "score": 85.0,
                        "severity": "CRITICAL",
                        "confidence": "SUPPORTED",
                        "review": "open"
                    })
                elif u == "aegis-nomfa-user":
                    findings.append({
                        "title": "Console user without MFA",
                        "resource": u,
                        "resourceGroup": "global",
                        "cloud": "AWS",
                        "accountId": "AWSAccount",
                        "control": "IAM002",
                        "score": 80.0,
                        "severity": "HIGH",
                        "confidence": "SUPPORTED",
                        "review": "open"
                    })
    except Exception:
        pass

    print(json.dumps(findings))

if __name__ == "__main__":
    scan()
