#!/bin/bash

# Script para importar recursos existentes do AWS para o Terraform
# Execute este script no diretório terraform/

set -e

echo "🚀 Iniciando importação de recursos existentes do AWS..."

# Verificar se estamos no diretório correto
if [ ! -f "terraform.tfvars" ]; then
    echo "❌ Erro: Execute este script no diretório terraform/"
    exit 1
fi

# Definir variáveis diretamente
PROJECT_NAME="formsync"
AWS_ACCOUNT_ID="503561419285"
AWS_REGION="us-east-1"

echo "📋 Importando recursos para o projeto: $PROJECT_NAME"
echo "🏢 AWS Account ID: $AWS_ACCOUNT_ID"
echo "🌍 AWS Region: $AWS_REGION"

# Função para executar import com tratamento de erro
import_resource() {
    local resource_type=$1
    local resource_name=$2
    local aws_resource_id=$3
    
    echo "📥 Importando $resource_type: $resource_name"
    
    if terraform import "$resource_type" "$aws_resource_id" 2>/dev/null; then
        echo "✅ Sucesso: $resource_name importado"
    else
        echo "⚠️  Aviso: $resource_name pode já estar importado ou não existir"
    fi
}

echo ""
echo "🔐 Importando IAM Roles..."

# IAM Roles
import_resource "aws_iam_role.lambda_role" "formsync-lambda-role" "formsync-lambda-role"
import_resource "aws_iam_role.ecs_execution_role" "formsync-ecs-execution-role" "formsync-ecs-execution-role"
import_resource "aws_iam_role.ecs_task_role" "formsync-ecs-task-role" "formsync-ecs-task-role"

echo ""
echo "📜 Importando IAM Policies..."

# IAM Policies
import_resource "aws_iam_policy.formsync_apigateway_policy" "formsync-apigateway-policy" "arn:aws:iam::${AWS_ACCOUNT_ID}:policy/formsync-apigateway-policy"
import_resource "aws_iam_policy.formsync_ssm_policy" "formsync-ssm-policy" "arn:aws:iam::${AWS_ACCOUNT_ID}:policy/formsync-ssm-policy"
import_resource "aws_iam_policy.formsync_iam_policy" "formsync-iam-policy" "arn:aws:iam::${AWS_ACCOUNT_ID}:policy/formsync-iam-policy"
import_resource "aws_iam_policy.formsync_ecs_policy" "formsync-ecs-policy" "arn:aws:iam::${AWS_ACCOUNT_ID}:policy/formsync-ecs-policy"

echo ""
echo "🐳 Importando ECR Repository..."

# ECR Repository
import_resource "aws_ecr_repository.formsync_backend" "formsync-backend" "formsync-backend"

echo ""
echo "📊 Importando CloudWatch Log Group..."

# CloudWatch Log Group
import_resource "aws_cloudwatch_log_group.formsync_backend" "/ecs/formsync-backend" "/ecs/formsync-backend"

echo ""
echo "🔍 Verificando VPCs existentes..."

# Listar VPCs existentes
echo "VPCs existentes na sua conta:"
aws ec2 describe-vpcs --query 'Vpcs[*].[VpcId,Tags[?Key==`Name`].Value|[0],CidrBlock,State]' --output table

echo ""
echo "📋 Próximos passos:"
echo "1. Execute 'terraform plan' para verificar se há diferenças"
echo "2. Se houver diferenças, ajuste a configuração do Terraform"
echo "3. Para resolver o limite de VPC, você pode:"
echo "   - Deletar VPCs não utilizadas no console AWS"
echo "   - Ou usar uma VPC existente modificando o arquivo vpc.tf"
echo ""
echo "💡 Para usar uma VPC existente, descomente e configure o data source em vpc.tf:"
echo "   data \"aws_vpc\" \"existing\" {"
echo "     filter {"
echo "       name   = \"tag:Name\""
echo "       values = [\"nome-da-sua-vpc\"]"
echo "     }"
echo "   }"

echo ""
echo "✅ Importação concluída!"
echo "🚀 Execute 'terraform plan' para verificar o estado atual"
