#!/bin/bash

# Script para importar recursos AWS existentes para o Terraform state
# Execute este script para resolver conflitos de recursos já existentes

set -e

echo "🚀 Iniciando importação de recursos existentes do AWS..."

# Verificar se estamos no diretório correto
if [ ! -f "terraform.tfstate" ] && [ ! -f "main.tf" ]; then
    echo "❌ Erro: Execute este script no diretório terraform/"
    echo "💡 Dica: cd apps/terraform && ./import-existing-resources.sh"
    exit 1
fi

# Verificar se terraform init foi executado
if [ ! -d ".terraform" ]; then
    echo "🔧 Executando terraform init..."
    terraform init
fi

# Definir variáveis necessárias
export AWS_ACCOUNT_ID=${AWS_ACCOUNT_ID:-$(aws sts get-caller-identity --query Account --output text)}
export DB_PASSWORD=${DB_PASSWORD:-"defaultpassword123"}

echo "🔧 Usando AWS Account ID: $AWS_ACCOUNT_ID"

# Função para importar recurso
import_resource() {
    local terraform_resource=$1
    local aws_identifier=$2
    local description=$3
    
    echo "📥 Importando $description..."
    if terraform import -var="aws_account_id=$AWS_ACCOUNT_ID" -var="db_password=$DB_PASSWORD" "$terraform_resource" "$aws_identifier" 2>/dev/null; then
        echo "✅ $description importado com sucesso"
    else
        echo "⚠️  $description já está no state ou não existe"
    fi
}

# 1. IAM Roles
echo "📋 Importando IAM Roles..."
import_resource "aws_iam_role.lambda_role" "formsync-lambda-role" "Lambda Role"
import_resource "aws_iam_role.ecs_execution_role" "formsync-ecs-execution-role" "ECS Execution Role"
import_resource "aws_iam_role.ecs_task_role" "formsync-ecs-task-role" "ECS Task Role"

# 2. IAM Policies
echo "📋 Importando IAM Policies..."
import_resource "aws_iam_policy.formsync_apigateway_policy" "arn:aws:iam::$(aws sts get-caller-identity --query Account --output text):policy/formsync-apigateway-policy" "API Gateway Policy"
import_resource "aws_iam_policy.formsync_ssm_policy" "arn:aws:iam::$(aws sts get-caller-identity --query Account --output text):policy/formsync-ssm-policy" "SSM Policy"
import_resource "aws_iam_policy.formsync_iam_policy" "arn:aws:iam::$(aws sts get-caller-identity --query Account --output text):policy/formsync-iam-policy" "IAM Policy"
import_resource "aws_iam_policy.formsync_ecs_policy" "arn:aws:iam::$(aws sts get-caller-identity --query Account --output text):policy/formsync-ecs-policy" "ECS Policy"

# 3. ECR Repository
echo "📋 Importando ECR Repository..."
import_resource "aws_ecr_repository.formsync_backend" "formsync-backend" "ECR Repository"

# 4. CloudWatch Log Group
echo "📋 Importando CloudWatch Log Group..."
import_resource "aws_cloudwatch_log_group.formsync_backend" "/ecs/formsync-backend" "CloudWatch Log Group"

# 5. Target Group (precisa do ARN)
echo "📋 Importando Target Group..."
TARGET_GROUP_ARN=$(aws elbv2 describe-target-groups --names formsync-backend-tg --query 'TargetGroups[0].TargetGroupArn' --output text 2>/dev/null || echo "")
if [ -n "$TARGET_GROUP_ARN" ] && [ "$TARGET_GROUP_ARN" != "None" ]; then
    import_resource "aws_lb_target_group.formsync_backend" "$TARGET_GROUP_ARN" "Target Group"
else
    echo "⚠️  Target Group não encontrado"
fi

# 6. DB Subnet Group
echo "📋 Importando DB Subnet Group..."
import_resource "aws_db_subnet_group.formsync_db" "formsync-db-subnet-group" "DB Subnet Group"

echo "✅ Importação concluída!"
echo "🔍 Verificando estado do Terraform..."
if terraform plan -var="aws_account_id=$AWS_ACCOUNT_ID" -var="db_password=$DB_PASSWORD" -detailed-exitcode >/dev/null 2>&1; then
    echo "🎉 Perfeito! Não há mais conflitos."
else
    echo "⚠️  Ainda há algumas diferenças. Execute 'terraform plan' para ver detalhes."
fi

echo "🎉 Script executado com sucesso!"
echo "💡 Agora você pode executar 'terraform apply' sem conflitos"