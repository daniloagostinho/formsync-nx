# Permission Fix Guide for FormSync Terraform

## Issues Identified

1. **IAM Permission Issues**: The `formsync` user lacks permissions for:
   - API Gateway operations (`apigateway:PUT`)
   - IAM role creation (`iam:CreateRole`)
   - SSM parameter creation (`ssm:PutParameter`)

2. **RDS Subnet Group Issue**: Only 1 subnet in 1 AZ, but RDS requires at least 2 AZs

## Solutions Applied

### 1. Fixed VPC Configuration
- Updated `variables.tf` to use 2 public subnets instead of 1
- This ensures RDS has subnets in at least 2 availability zones

### 2. Added IAM Policies
- Created comprehensive IAM policies in `iam.tf`:
  - `formsync-apigateway-policy`: Full API Gateway access
  - `formsync-ssm-policy`: SSM parameter management
  - `formsync-iam-policy`: IAM role management
  - `formsync-ecs-policy`: ECS and related services access

### 3. Created Permission Fix Script
- `fix-permissions.sh`: Script to attach policies to formsync user

## How to Fix

### Step 1: Apply Terraform Changes
```bash
cd terraform
terraform plan
terraform apply
```

This will create the IAM policies but may still fail due to permission issues.

### Step 2: Run Permission Fix Script
```bash
./fix-permissions.sh
```

This script will attach the created policies to the formsync user.

### Step 3: Re-run Terraform
```bash
terraform apply
```

## Alternative Manual Fix

If the script doesn't work, manually attach policies via AWS CLI:

```bash
# Get your account ID
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

# Attach each policy
aws iam attach-user-policy --user-name formsync --policy-arn arn:aws:iam::$AWS_ACCOUNT_ID:policy/formsync-apigateway-policy
aws iam attach-user-policy --user-name formsync --policy-arn arn:aws:iam::$AWS_ACCOUNT_ID:policy/formsync-ssm-policy
aws iam attach-user-policy --user-name formsync --policy-arn arn:aws:iam::$AWS_ACCOUNT_ID:policy/formsync-iam-policy
aws iam attach-user-policy --user-name formsync --policy-arn arn:aws:iam::$AWS_ACCOUNT_ID:policy/formsync-ecs-policy
```

## What Was Changed

1. **terraform/variables.tf**: Added second public subnet
2. **terraform/iam.tf**: Added comprehensive IAM policies
3. **terraform/fix-permissions.sh**: Created permission fix script
4. **terraform/PERMISSION_FIX_GUIDE.md**: This guide

## Next Steps

After fixing permissions, your Terraform should deploy successfully with:
- 2 public subnets in different AZs
- RDS database with proper subnet group
- API Gateway with proper permissions
- ECS roles with necessary policies
- SSM parameters for configuration



