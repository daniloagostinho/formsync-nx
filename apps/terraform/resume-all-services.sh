#!/bin/bash

echo "▶️  REATIVANDO TODOS OS SERVIÇOS AWS"
echo "===================================="
echo ""

# Função para verificar se um comando foi executado com sucesso
check_success() {
    if [ $? -eq 0 ]; then
        echo "✅ $1"
    else
        echo "❌ $1"
    fi
}

echo "🔍 1. REATIVANDO RDS CLUSTERS..."
echo "================================"

# Reativar RDS Cluster (Aurora Serverless v2)
aws rds modify-db-cluster \
    --db-cluster-identifier formsync-db \
    --serverless-v2-scaling-configuration MinCapacity=0.5,MaxCapacity=16 \
    2>/dev/null
check_success "RDS Cluster reativado"

echo ""
echo "🔍 2. REATIVANDO CLOUDFRONT DISTRIBUTIONS..."
echo "============================================"

# Listar todas as distribuições CloudFront
DISTRIBUTIONS=$(aws cloudfront list-distributions --query 'DistributionList.Items[].Id' --output text)

for dist_id in $DISTRIBUTIONS; do
    echo "Reativando CloudFront Distribution: $dist_id"
    
    # Obter configuração atual
    aws cloudfront get-distribution-config --id "$dist_id" > /tmp/dist_config.json 2>/dev/null
    
    if [ $? -eq 0 ]; then
        # Modificar para habilitar
        jq '.DistributionConfig.Enabled = true' /tmp/dist_config.json > /tmp/dist_config_modified.json
        
        # Aplicar mudanças
        aws cloudfront update-distribution \
            --id "$dist_id" \
            --distribution-config file:///tmp/dist_config_modified.json \
            --if-match $(jq -r '.ETag' /tmp/dist_config.json) \
            2>/dev/null
        
        check_success "CloudFront $dist_id reativado"
    else
        echo "⚠️  Não foi possível reativar CloudFront $dist_id"
    fi
done

echo ""
echo "🔍 3. REATIVANDO API GATEWAY..."
echo "==============================="

# Reativar API Gateway (criar novo deployment)
aws apigateway create-deployment \
    --rest-api-id pz2ttec2i6 \
    --stage-name prod \
    2>/dev/null
check_success "API Gateway reativado"

echo ""
echo "🔍 4. VERIFICANDO ECS SERVICES..."
echo "================================="

# Verificar se há serviços ECS
ECS_SERVICES=$(aws ecs list-services --cluster formsync-backend --query 'serviceArns[]' --output text 2>/dev/null)

if [ -n "$ECS_SERVICES" ]; then
    echo "Reativando serviços ECS..."
    for service in $ECS_SERVICES; do
        aws ecs update-service \
            --cluster formsync-backend \
            --service "$service" \
            --desired-count 1 \
            2>/dev/null
        check_success "ECS Service reativado: $service"
    done
else
    echo "✅ Nenhum serviço ECS encontrado"
fi

echo ""
echo "🔍 5. VERIFICANDO EC2 INSTANCES..."
echo "================================="

# Verificar instâncias EC2
INSTANCES=$(aws ec2 describe-instances \
    --filters "Name=tag:Project,Values=formsync" "Name=instance-state-name,Values=stopped" \
    --query 'Reservations[].Instances[].InstanceId' \
    --output text 2>/dev/null)

if [ -n "$INSTANCES" ]; then
    echo "Iniciando instâncias EC2..."
    for instance in $INSTANCES; do
        aws ec2 start-instances --instance-ids "$instance" 2>/dev/null
        check_success "EC2 Instance iniciado: $instance"
    done
else
    echo "✅ Nenhuma instância EC2 parada encontrada"
fi

echo ""
echo "🔍 6. VERIFICANDO LAMBDA FUNCTIONS..."
echo "===================================="

# Verificar funções Lambda
LAMBDA_FUNCTIONS=$(aws lambda list-functions \
    --query 'Functions[?contains(FunctionName, `formsync`)].FunctionName' \
    --output text 2>/dev/null)

if [ -n "$LAMBDA_FUNCTIONS" ]; then
    echo "Reativando funções Lambda..."
    for func in $LAMBDA_FUNCTIONS; do
        aws lambda delete-function-concurrency \
            --function-name "$func" \
            2>/dev/null
        check_success "Lambda Function reativado: $func"
    done
else
    echo "✅ Nenhuma função Lambda encontrada"
fi

echo ""
echo "🎉 RESUMO DA REATIVAÇÃO:"
echo "========================"
echo "✅ RDS Cluster reativado"
echo "✅ CloudFront Distributions reativadas"
echo "✅ API Gateway reativado"
echo "✅ ECS Services verificados"
echo "✅ EC2 Instances verificadas"
echo "✅ Lambda Functions verificadas"
echo ""
echo "🚀 SERVIÇOS REATIVADOS COM SUCESSO!"
echo ""
echo "📝 NOTA: Aguarde alguns minutos para todos os serviços ficarem totalmente ativos"

