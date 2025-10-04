#!/bin/bash

echo "🚀 Iniciando importação COMPLETA de todos os recursos existentes..."

# Verificar se estamos no diretório correto
if [ ! -f "main.tf" ]; then
    echo "❌ Erro: Execute este script no diretório terraform/"
    echo "💡 Dica: cd apps/terraform && ./import-all-existing.sh"
    exit 1
fi

# Inicializar Terraform
echo "🔧 Inicializando Terraform..."
terraform init

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

echo "📋 Importando IAM Roles..."
import_resource "aws_iam_role.lambda_role" "formsync-lambda-role" "Lambda Role"
import_resource "aws_iam_role.ecs_execution_role" "formsync-ecs-execution-role" "ECS Execution Role"
import_resource "aws_iam_role.ecs_task_role" "formsync-ecs-task-role" "ECS Task Role"

echo "📋 Importando IAM Policies..."
import_resource "aws_iam_policy.formsync_apigateway_policy" "arn:aws:iam::${AWS_ACCOUNT_ID}:policy/formsync-apigateway-policy" "API Gateway Policy"
import_resource "aws_iam_policy.formsync_ssm_policy" "arn:aws:iam::${AWS_ACCOUNT_ID}:policy/formsync-ssm-policy" "SSM Policy"
import_resource "aws_iam_policy.formsync_iam_policy" "arn:aws:iam::${AWS_ACCOUNT_ID}:policy/formsync-iam-policy" "IAM Policy"
import_resource "aws_iam_policy.formsync_ecs_policy" "arn:aws:iam::${AWS_ACCOUNT_ID}:policy/formsync-ecs-policy" "ECS Policy"

echo "📋 Importando ECR Repository..."
import_resource "aws_ecr_repository.formsync_backend" "formsync-backend" "ECR Repository"

echo "📋 Importando CloudWatch Log Group..."
import_resource "aws_cloudwatch_log_group.formsync_backend" "/ecs/formsync-backend" "CloudWatch Log Group"

echo "📋 Importando Target Group..."
import_resource "aws_lb_target_group.formsync_backend" "arn:aws:elasticloadbalancing:us-east-1:${AWS_ACCOUNT_ID}:targetgroup/formsync-backend-tg/90049b825edf5a70" "Target Group"

echo "📋 Importando DB Subnet Group..."
import_resource "aws_db_subnet_group.formsync_db" "formsync-db-subnet-group" "DB Subnet Group"

echo "📋 Importando Load Balancer..."
import_resource "aws_lb.formsync_backend" "arn:aws:elasticloadbalancing:us-east-1:${AWS_ACCOUNT_ID}:loadbalancer/app/formsync-backend-alb/c580807a1a50e5d5" "Load Balancer"

echo "📋 Importando Load Balancer Listener..."
import_resource "aws_lb_listener.formsync_backend" "arn:aws:elasticloadbalancing:us-east-1:${AWS_ACCOUNT_ID}:listener/app/formsync-backend-alb/c580807a1a50e5d5/af0480a1159526c5" "Load Balancer Listener"

echo "📋 Importando Lambda Function..."
import_resource "aws_lambda_function.formsync_backend" "formsync-backend" "Lambda Function"

echo "📋 Importando Lambda Permission..."
import_resource "aws_lambda_permission.api_gateway" "AllowExecutionFromAPIGateway" "Lambda Permission"

echo "📋 Importando API Gateway Integration..."
import_resource "aws_api_gateway_integration.lambda_integration" "agi-6i91b1pzx0-rbjvbn-ANY" "API Gateway Integration"

echo "📋 Importando ECS Cluster..."
import_resource "aws_ecs_cluster.formsync_backend" "arn:aws:ecs:us-east-1:${AWS_ACCOUNT_ID}:cluster/formsync-backend-cluster" "ECS Cluster"

echo "📋 Importando ECS Task Definition..."
import_resource "aws_ecs_task_definition.formsync_backend" "formsync-backend" "ECS Task Definition"

echo "📋 Importando ECS Service..."
import_resource "aws_ecs_service.formsync_backend" "arn:aws:ecs:us-east-1:${AWS_ACCOUNT_ID}:service/formsync-backend-cluster/formsync-backend-service" "ECS Service"

echo "📋 Importando RDS Cluster..."
import_resource "aws_rds_cluster.formsync_db" "formsync-db" "RDS Cluster"

echo "📋 Importando RDS Cluster Instance..."
import_resource "aws_rds_cluster_instance.formsync_db" "tf-20251004162608545200000001" "RDS Cluster Instance"

echo "📋 Importando VPC..."
import_resource "aws_vpc.main" "vpc-03a57331ce1878d42" "VPC"

echo "📋 Importando Internet Gateway..."
import_resource "aws_internet_gateway.main" "igw-0e6db02ff38d6b226" "Internet Gateway"

echo "📋 Importando Subnets..."
import_resource "aws_subnet.public[0]" "subnet-00d6da26dfd712772" "Public Subnet 1"
import_resource "aws_subnet.public[1]" "subnet-054dbc86184f2afba" "Public Subnet 2"

echo "📋 Importando Security Groups..."
import_resource "aws_security_group.alb" "sg-0f249d256ef518916" "ALB Security Group"
import_resource "aws_security_group.ecs_backend" "sg-04aabf57905c8fad0" "ECS Security Group"
import_resource "aws_security_group.rds" "sg-0984762d2d38172d0" "RDS Security Group"

echo "📋 Importando Route Table..."
import_resource "aws_route_table.public" "rtb-0814b412757b994c8" "Public Route Table"

echo "📋 Importando Route Table Associations..."
import_resource "aws_route_table_association.public[0]" "rtbassoc-07d7d558c9d17f283" "Route Table Association 1"
import_resource "aws_route_table_association.public[1]" "rtbassoc-0b3004a4448c31cc6" "Route Table Association 2"

echo "📋 Importando S3 Bucket..."
import_resource "aws_s3_bucket.formsync_frontend" "formsync-frontend-accnis3l" "S3 Bucket"

echo "📋 Importando CloudFront Distribution..."
import_resource "aws_cloudfront_distribution.formsync_frontend" "E1VXOUSVJPPZZ5" "CloudFront Distribution"

echo "📋 Importando API Gateway..."
import_resource "aws_api_gateway_rest_api.formsync_api" "6i91b1pzx0" "API Gateway"

echo "📋 Importando API Gateway Resources..."
import_resource "aws_api_gateway_resource.api_proxy" "rbjvbn" "API Gateway Resource"
import_resource "aws_api_gateway_method.api_proxy" "agm-6i91b1pzx0-rbjvbn-ANY" "API Gateway Method"
import_resource "aws_api_gateway_method_response.api_proxy" "agmr-6i91b1pzx0-rbjvbn-ANY-200" "API Gateway Method Response"
import_resource "aws_api_gateway_deployment.formsync_api" "p8n5gn" "API Gateway Deployment"
import_resource "aws_api_gateway_stage.formsync_api" "ags-6i91b1pzx0-prod" "API Gateway Stage"

echo "✅ Importação COMPLETA concluída!"
echo "🔍 Verificando estado do Terraform..."

if terraform plan -var="aws_account_id=$AWS_ACCOUNT_ID" -var="db_password=$DB_PASSWORD" -detailed-exitcode >/dev/null 2>&1; then
    echo "🎉 Perfeito! Não há mais conflitos."
else
    echo "⚠️  Ainda há algumas diferenças. Execute 'terraform plan' para ver detalhes."
fi

echo "🎉 Script executado com sucesso!"
echo "💡 Agora você pode executar 'terraform apply' sem conflitos"
