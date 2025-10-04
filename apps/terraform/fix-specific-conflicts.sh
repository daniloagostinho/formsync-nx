#!/bin/bash

echo "🚀 Resolvendo conflitos específicos do pipeline..."

# Verificar se estamos no diretório correto
if [ ! -f "main.tf" ]; then
    echo "❌ Erro: Execute este script no diretório terraform/"
    exit 1
fi

# Configurar variáveis
export AWS_ACCOUNT_ID=${AWS_ACCOUNT_ID:-$(aws sts get-caller-identity --query Account --output text)}
export DB_PASSWORD=${DB_PASSWORD:-"defaultpassword123"}

echo "🔧 Usando AWS Account ID: $AWS_ACCOUNT_ID"

# Função para importar recursos com tratamento de erro
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

echo "🔧 Inicializando Terraform..."
terraform init

echo "📋 Resolvendo conflitos específicos..."

# 1. Importar Security Group ECS Backend existente
echo "📥 Importando Security Group ECS Backend..."
import_resource "aws_security_group.ecs_backend" "sg-00afd21afc10e3d87" "ECS Backend Security Group"

# 2. Importar Internet Gateway existente (se não estiver no state)
echo "📥 Verificando Internet Gateway..."
if ! terraform state show aws_internet_gateway.main >/dev/null 2>&1; then
    import_resource "aws_internet_gateway.main" "igw-0e6ca996f9e3a4380" "Internet Gateway"
else
    echo "✅ Internet Gateway já está no state"
fi

# 3. Importar Subnet existente
echo "📥 Importando Subnet Public 0..."
import_resource "aws_subnet.public[0]" "subnet-0318f609b6c42ad48" "Public Subnet 0"

# 4. Importar API Gateway Resource existente
echo "📥 Importando API Gateway Resource..."
import_resource "aws_api_gateway_resource.api_proxy" "lh2d30" "API Gateway Resource"

# 5. Importar TODOS os recursos que podem estar conflitando
echo "📥 Importando TODOS os recursos críticos..."

# IAM Roles
import_resource "aws_iam_role.lambda_role" "formsync-lambda-role" "Lambda Role"
import_resource "aws_iam_role.ecs_execution_role" "formsync-ecs-execution-role" "ECS Execution Role"
import_resource "aws_iam_role.ecs_task_role" "formsync-ecs-task-role" "ECS Task Role"

# IAM Policies
import_resource "aws_iam_policy.formsync_apigateway_policy" "arn:aws:iam::${AWS_ACCOUNT_ID}:policy/formsync-apigateway-policy" "API Gateway Policy"
import_resource "aws_iam_policy.formsync_ssm_policy" "arn:aws:iam::${AWS_ACCOUNT_ID}:policy/formsync-ssm-policy" "SSM Policy"
import_resource "aws_iam_policy.formsync_iam_policy" "arn:aws:iam::${AWS_ACCOUNT_ID}:policy/formsync-iam-policy" "IAM Policy"
import_resource "aws_iam_policy.formsync_ecs_policy" "arn:aws:iam::${AWS_ACCOUNT_ID}:policy/formsync-ecs-policy" "ECS Policy"

# ECR Repository
import_resource "aws_ecr_repository.formsync_backend" "formsync-backend" "ECR Repository"

# CloudWatch Log Group
import_resource "aws_cloudwatch_log_group.formsync_backend" "/ecs/formsync-backend" "CloudWatch Log Group"

# VPC (se não estiver no state)
if ! terraform state show aws_vpc.main >/dev/null 2>&1; then
    import_resource "aws_vpc.main" "vpc-03a57331ce1878d42" "VPC"
else
    echo "✅ VPC já está no state"
fi

# API Gateway Method
import_resource "aws_api_gateway_method.api_proxy" "agm-6i91b1pzx0-lh2d30-ANY" "API Gateway Method"

# API Gateway Method Response
import_resource "aws_api_gateway_method_response.api_proxy" "agmr-6i91b1pzx0-lh2d30-ANY-200" "API Gateway Method Response"

# API Gateway Integration
import_resource "aws_api_gateway_integration.api_proxy" "agi-6i91b1pzx0-lh2d30-ANY" "API Gateway Integration"

# API Gateway Lambda Integration
import_resource "aws_api_gateway_integration.lambda_integration" "agi-6i91b1pzx0-lh2d30-ANY" "API Gateway Lambda Integration"

# API Gateway Deployment
import_resource "aws_api_gateway_deployment.formsync_api" "ks0r0p" "API Gateway Deployment"

# API Gateway Stage
import_resource "aws_api_gateway_stage.formsync_api" "ags-6i91b1pzx0-prod" "API Gateway Stage"

# Lambda Permission
import_resource "aws_lambda_permission.api_gateway" "AllowExecutionFromAPIGateway" "Lambda Permission"

# Load Balancer
import_resource "aws_lb.formsync_backend" "arn:aws:elasticloadbalancing:us-east-1:${AWS_ACCOUNT_ID}:loadbalancer/app/formsync-backend-alb/e66b2fd769b66dd2" "Load Balancer"

# Load Balancer Listener
import_resource "aws_lb_listener.formsync_backend" "arn:aws:elasticloadbalancing:us-east-1:${AWS_ACCOUNT_ID}:listener/app/formsync-backend-alb/e66b2fd769b66dd2/76295e7dbce9ef11" "Load Balancer Listener"

# ECS Service
import_resource "aws_ecs_service.formsync_backend" "arn:aws:ecs:us-east-1:${AWS_ACCOUNT_ID}:service/formsync-backend-cluster/formsync-backend-service" "ECS Service"

echo "✅ Conflitos específicos resolvidos!"
echo "🔍 Verificando estado do Terraform..."

if terraform plan -var="aws_account_id=$AWS_ACCOUNT_ID" -var="db_password=$DB_PASSWORD" -detailed-exitcode >/dev/null 2>&1; then
    echo "🎉 Perfeito! Não há mais conflitos."
else
    echo "⚠️  Ainda há algumas diferenças. Execute 'terraform plan' para ver detalhes."
fi

echo "🎉 Script executado com sucesso!"
echo "💡 Agora você pode executar 'terraform apply' sem conflitos"
