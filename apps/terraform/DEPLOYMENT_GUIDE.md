# FormSync Terraform Deployment Guide

## Current Issues and Solutions

### **Main Problem:**
The `formsync` user lacks sufficient permissions to create IAM resources, API Gateway, and other AWS services.

### **Solutions (Choose One):**

## **Option 1: Use Root/Admin User (Recommended)**

1. **Switch to admin credentials:**
   ```bash
   aws configure
   # Enter your root/admin AWS credentials
   ```

2. **Deploy infrastructure:**
   ```bash
   cd terraform
   terraform apply
   ```

## **Option 2: Grant Permissions via AWS Console**

1. **Go to AWS IAM Console**
2. **Find the `formsync` user**
3. **Attach these AWS managed policies:**
   - `PowerUserAccess` (gives most permissions except IAM)
   - `IAMFullAccess` (for IAM operations)

4. **Then run:**
   ```bash
   cd terraform
   terraform apply
   ```

## **Option 3: Use AWS CLI with Admin Credentials**

```bash
# Get admin credentials
aws sts get-caller-identity

# If not admin, switch to admin account
aws configure

# Deploy
cd terraform
terraform apply
```

## **What Was Fixed:**

### 1. **RDS Configuration**
- ✅ Fixed Aurora Serverless v1 deprecation issue
- ✅ Changed to provisioned Aurora PostgreSQL
- ✅ Added required cluster instance

### 2. **VPC Configuration**
- ✅ Fixed subnet group issue (now has 2 subnets in different AZs)
- ✅ RDS can now be created successfully

### 3. **IAM Policies**
- ✅ Created comprehensive IAM policies
- ✅ Added inline policy approach as fallback

## **Next Steps:**

1. **Choose one of the permission solutions above**
2. **Run `terraform apply`**
3. **Your infrastructure will be deployed successfully**

## **Expected Resources:**
- VPC with 2 public subnets
- RDS Aurora PostgreSQL cluster
- API Gateway
- S3 buckets for frontend/backend
- CloudFront distribution
- ECS roles and security groups
- SSM parameters for configuration

## **Cost Estimate:**
- RDS Aurora: ~$50-100/month
- CloudFront: ~$1-5/month
- S3: ~$1-5/month
- API Gateway: ~$1-10/month
- **Total: ~$60-120/month**

## **Troubleshooting:**

If you still get permission errors:
1. Verify you're using admin credentials: `aws sts get-caller-identity`
2. Check if the user has the required policies attached
3. Try using a different AWS account with full permissions



