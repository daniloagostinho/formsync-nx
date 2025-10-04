#!/bin/bash

# Script rápido para resolver conflitos do Terraform
# Execute localmente primeiro para testar

set -e

echo "🚀 FormSync - Quick Fix para conflitos do Terraform"
echo "=================================================="

# Verificar se estamos no diretório correto
if [ ! -f "terraform.tfstate" ]; then
    echo "❌ Execute este script no diretório apps/terraform/"
    exit 1
fi

echo "🔍 Verificando recursos existentes..."

# 1. Importar IAM Roles (mais comuns)
echo "📋 Importando IAM Roles..."
terraform import aws_iam_role.lambda_role formsync-lambda-role || echo "⚠️  Lambda role já importada"
terraform import aws_iam_role.ecs_execution_role formsync-ecs-execution-role || echo "⚠️  ECS execution role já importada"
terraform import aws_iam_role.ecs_task_role formsync-ecs-task-role || echo "⚠️  ECS task role já importada"

# 2. Importar IAM Policies
echo "📋 Importando IAM Policies..."
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
terraform import aws_iam_policy.formsync_apigateway_policy "arn:aws:iam::${ACCOUNT_ID}:policy/formsync-apigateway-policy" || echo "⚠️  API Gateway policy já importada"
terraform import aws_iam_policy.formsync_ssm_policy "arn:aws:iam::${ACCOUNT_ID}:policy/formsync-ssm-policy" || echo "⚠️  SSM policy já importada"
terraform import aws_iam_policy.formsync_iam_policy "arn:aws:iam::${ACCOUNT_ID}:policy/formsync-iam-policy" || echo "⚠️  IAM policy já importada"
terraform import aws_iam_policy.formsync_ecs_policy "arn:aws:iam::${ACCOUNT_ID}:policy/formsync-ecs-policy" || echo "⚠️  ECS policy já importada"

# 3. Importar ECR Repository
echo "📋 Importando ECR Repository..."
terraform import aws_ecr_repository.formsync_backend formsync-backend || echo "⚠️  ECR repository já importada"

# 4. Importar CloudWatch Log Group
echo "📋 Importando CloudWatch Log Group..."
terraform import aws_cloudwatch_log_group.formsync_backend "/ecs/formsync-backend" || echo "⚠️  CloudWatch log group já importada"

# 5. Importar Target Group (se existir)
echo "📋 Importando Target Group..."
TARGET_GROUP_ARN=$(aws elbv2 describe-target-groups --names formsync-backend-tg --query 'TargetGroups[0].TargetGroupArn' --output text 2>/dev/null || echo "None")
if [ "$TARGET_GROUP_ARN" != "None" ] && [ -n "$TARGET_GROUP_ARN" ]; then
    terraform import aws_lb_target_group.formsync_backend "$TARGET_GROUP_ARN" || echo "⚠️  Target group já importada"
else
    echo "⚠️  Target group não encontrado"
fi

# 6. Importar DB Subnet Group
echo "📋 Importando DB Subnet Group..."
terraform import aws_db_subnet_group.formsync_db formsync-db-subnet-group || echo "⚠️  DB subnet group já importada"

echo ""
echo "✅ Importação concluída!"
echo "🔍 Verificando estado do Terraform..."
echo ""

# Verificar se há erros
if terraform plan -detailed-exitcode >/dev/null 2>&1; then
    echo "🎉 Perfeito! Não há mais conflitos."
    echo "💡 Agora você pode executar: terraform apply"
else
    echo "⚠️  Ainda há algumas diferenças. Execute 'terraform plan' para ver detalhes."
fi

echo ""
echo "🚀 Script executado com sucesso!"
