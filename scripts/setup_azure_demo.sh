#!/bin/bash
set -e

echo "Ensuring you are logged into Azure CLI..."
az account show >/dev/null || az login

RG="aegis-demo-rg3"
LOCATION="westus2"
RAND_STR=$RANDOM
STORAGE_REGULATED="regulateddata${RAND_STR}"
STORAGE_PUBLIC="publicarchive${RAND_STR}"
STORAGE_UNOBSERVED="unobserved${RAND_STR}"

echo "Creating Resource Group $RG in $LOCATION..."
az group create --name $RG --location $LOCATION

echo "Creating Network Security Group 'legacy-admin-ingress'..."
az network nsg create --resource-group $RG --name legacy-admin-ingress
az network nsg rule create \
    --resource-group $RG \
    --nsg-name legacy-admin-ingress \
    --name Allow-SSH \
    --priority 100 \
    --source-address-prefixes Internet \
    --destination-port-ranges 22 \
    --access Allow \
    --protocol Tcp \
    --description "Legacy admin ingress from any IP"

echo "Creating VNET and Subnets..."
az network vnet create --resource-group $RG --name demo-vnet --address-prefix 10.0.0.0/16
az network vnet subnet create --resource-group $RG --vnet-name demo-vnet --name public-subnet --address-prefixes 10.0.1.0/24 --network-security-group legacy-admin-ingress
az network vnet subnet create --resource-group $RG --vnet-name demo-vnet --name private-subnet --address-prefixes 10.0.2.0/24

echo "Creating Storage Accounts..."
# 1. Regulated Data (Private, secure transport)
az storage account create \
    --name $STORAGE_REGULATED \
    --resource-group $RG \
    --location $LOCATION \
    --sku Standard_LRS \
    --public-network-access Disabled \
    --https-only true

# 2. Public Export Archive (Public, insecure transport)
az storage account create \
    --name $STORAGE_PUBLIC \
    --resource-group $RG \
    --location $LOCATION \
    --sku Standard_LRS \
    --allow-blob-public-access true \
    --https-only false

# 3. Unobserved Bucket
az storage account create \
    --name $STORAGE_UNOBSERVED \
    --resource-group $RG \
    --location $LOCATION \
    --sku Standard_LRS

echo "Creating Workloads (Static Web Apps)..."
# We bypass VM capacity issues by using Azure Static Web Apps instead
# 1. customer-api (Internet reachable, system-assigned identity)
CUSTOMER_API="customer-api-${RAND_STR}"
az staticwebapp create --name $CUSTOMER_API --resource-group $RG --location $LOCATION --sku Standard
az staticwebapp identity assign --name $CUSTOMER_API --resource-group $RG

# 2. internal-build-worker (Simulated private worker)
WORKER="internal-worker-${RAND_STR}"
az staticwebapp create --name $WORKER --resource-group $RG --location $LOCATION --sku Standard

echo "Configuring Identity & Access (Risk Path)..."
# Get the Managed Identity Principal ID of the customer-api Static Web App
echo "Fetching Managed Identity for customer-api..."
SP_ID=$(az staticwebapp identity show --name $CUSTOMER_API --resource-group $RG --query "principalId" --output tsv | tr -d '\r')

# Get the Resource ID of the regulated storage account
STORAGE_ID=$(az storage account show --name $STORAGE_REGULATED --resource-group $RG --query "id" --output tsv | tr -d '\r')

# Grant the Managed Identity "Storage Blob Data Contributor" role on the regulated storage account
echo "Assigning Storage Blob Data Contributor role to customer-api identity on $STORAGE_REGULATED..."
az role assignment create \
    --assignee-object-id $SP_ID \
    --assignee-principal-type ServicePrincipal \
    --role "Storage Blob Data Contributor" \
    --scope $STORAGE_ID

echo "Setting up Dormant Contractor User..."
echo "Note: Creating Azure AD users requires User Administrator privileges."
DOMAIN=$(az ad signed-in-user show --query userPrincipalName -o tsv | cut -d'@' -f2)
UPN="dormant-contractor@${DOMAIN}"

echo "To create the dormant contractor identity, run:"
echo "az ad user create --display-name \"Dormant Contractor\" --password \"TempPassw0rd123!\" --user-principal-name $UPN"

echo "========================================================================="
echo "Azure Demo Environment Provisioned Successfully!"
echo "Resource Group: $RG"
echo "Regulated Storage: $STORAGE_REGULATED"
echo "Public Storage: $STORAGE_PUBLIC"
echo "========================================================================="
