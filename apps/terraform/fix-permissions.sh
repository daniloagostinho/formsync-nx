#!/bin/bash

# Script to fix IAM permissions for formsync user
# This script attaches the necessary policies to the formsync user

echo "Fixing IAM permissions for formsync user..."

# Get the AWS account ID
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo "AWS Account ID: $AWS_ACCOUNT_ID"

# Attach policies to formsync user
echo "Attaching API Gateway policy..."
aws iam attach-user-policy \
    --user-name formsync \
    --policy-arn arn:aws:iam::$AWS_ACCOUNT_ID:policy/formsync-apigateway-policy

echo "Attaching SSM policy..."
aws iam attach-user-policy \
    --user-name formsync \
    --policy-arn arn:aws:iam::$AWS_ACCOUNT_ID:policy/formsync-ssm-policy

echo "Attaching IAM policy..."
aws iam attach-user-policy \
    --user-name formsync \
    --policy-arn arn:aws:iam::$AWS_ACCOUNT_ID:policy/formsync-iam-policy

echo "Attaching ECS policy..."
aws iam attach-user-policy \
    --user-name formsync \
    --policy-arn arn:aws:iam::$AWS_ACCOUNT_ID:policy/formsync-ecs-policy

echo "Permissions fixed! You can now run terraform apply again."



