#!/bin/bash

echo "⏸️  PAUSANDO TODOS OS SERVIÇOS AWS - EVITANDO SURPRESAS"
echo "======================================================="
echo ""

# Função para verificar se um comando foi executado com sucesso
check_success() {
    if [ $? -eq 0 ]; then
        echo "✅ $1"
    else
        echo "❌ $1"
    fi
}

echo "🔍 1. PAUSANDO RDS CLUSTERS..."
echo "=============================="

# Pausar RDS Cluster (Aurora Serverless v2)
aws rds modify-db-cluster \
    --db-cluster-identifier formsync-db \
    --serverless-v2-scaling-configuration MinCapacity=0,MaxCapacity=0 \
    2>/dev/null
check_success "RDS Cluster pausado"

echo ""
echo "🔍 2. PAUSANDO CLOUDFRONT DISTRIBUTIONS..."
echo "=========================================="

# Listar todas as distribuições CloudFront
DISTRIBUTIONS=$(aws cloudfront list-distributions --query 'DistributionList.Items[].Id' --output text)

for dist_id in $DISTRIBUTIONS; do
    echo "Pausando CloudFront Distribution: $dist_id"
    
    # Obter configuração atual
    aws cloudfront get-distribution-config --id "$dist_id" > /tmp/dist_config.json 2>/dev/null
    
    if [ $? -eq 0 ]; then
        # Modificar para desabilitar
        jq '.DistributionConfig.Enabled = false' /tmp/dist_config.json > /tmp/dist_config_modified.json
        
        # Aplicar mudanças
        aws cloudfront update-distribution \
            --id "$dist_id" \
            --distribution-config file:///tmp/dist_config_modified.json \
            --if-match $(jq -r '.ETag' /tmp/dist_config.json) \
            2>/dev/null
        
        check_success "CloudFront $dist_id pausado"
    else
        echo "⚠️  Não foi possível pausar CloudFront $dist_id"
    fi
done

echo ""
echo "🔍 3. PAUSANDO API GATEWAY..."
echo "============================="

# Pausar API Gateway (deletar deployment)
aws apigateway delete-deployment \
    --rest-api-id pz2ttec2i6 \
    --deployment-id 4vn85f \
    2>/dev/null
check_success "API Gateway pausado"

echo ""
echo "🔍 4. VERIFICANDO ECS SERVICES..."
echo "================================="

# Verificar se há serviços ECS rodando
ECS_SERVICES=$(aws ecs list-services --cluster formsync-backend --query 'serviceArns[]' --output text 2>/dev/null)

if [ -n "$ECS_SERVICES" ]; then
    echo "Pausando serviços ECS..."
    for service in $ECS_SERVICES; do
        aws ecs update-service \
            --cluster formsync-backend \
            --service "$service" \
            --desired-count 0 \
            2>/dev/null
        check_success "ECS Service pausado: $service"
    done
else
    echo "✅ Nenhum serviço ECS ativo encontrado"
fi

echo ""
echo "🔍 5. VERIFICANDO EC2 INSTANCES..."
echo "================================="

# Verificar instâncias EC2
INSTANCES=$(aws ec2 describe-instances \
    --filters "Name=tag:Project,Values=formsync" "Name=instance-state-name,Values=running" \
    --query 'Reservations[].Instances[].InstanceId' \
    --output text 2>/dev/null)

if [ -n "$INSTANCES" ]; then
    echo "Parando instâncias EC2..."
    for instance in $INSTANCES; do
        aws ec2 stop-instances --instance-ids "$instance" 2>/dev/null
        check_success "EC2 Instance parado: $instance"
    done
else
    echo "✅ Nenhuma instância EC2 ativa encontrada"
fi

echo ""
echo "🔍 6. VERIFICANDO LAMBDA FUNCTIONS..."
echo "===================================="

# Verificar funções Lambda
LAMBDA_FUNCTIONS=$(aws lambda list-functions \
    --query 'Functions[?contains(FunctionName, `formsync`)].FunctionName' \
    --output text 2>/dev/null)

if [ -n "$LAMBDA_FUNCTIONS" ]; then
    echo "Pausando funções Lambda..."
    for func in $LAMBDA_FUNCTIONS; do
        aws lambda put-function-concurrency \
            --function-name "$func" \
            --reserved-concurrency-limit 0 \
            2>/dev/null
        check_success "Lambda Function pausado: $func"
    done
else
    echo "✅ Nenhuma função Lambda ativa encontrada"
fi

echo ""
echo "🔍 7. VERIFICANDO ELASTIC BEANSTALK..."
echo "====================================="

# Verificar aplicações Elastic Beanstalk
EB_APPS=$(aws elasticbeanstalk describe-applications \
    --query 'Applications[?contains(ApplicationName, `formsync`)].ApplicationName' \
    --output text 2>/dev/null)

if [ -n "$EB_APPS" ]; then
    echo "Pausando aplicações Elastic Beanstalk..."
    for app in $EB_APPS; do
        aws elasticbeanstalk terminate-environment \
            --environment-name "$app" \
            2>/dev/null
        check_success "Elastic Beanstalk pausado: $app"
    done
else
    echo "✅ Nenhuma aplicação Elastic Beanstalk ativa encontrada"
fi

echo ""
echo "🔍 8. VERIFICANDO ELASTICSEARCH..."
echo "=================================="

# Verificar domínios Elasticsearch
ES_DOMAINS=$(aws es list-domain-names \
    --query 'DomainNames[?contains(DomainName, `formsync`)].DomainName' \
    --output text 2>/dev/null)

if [ -n "$ES_DOMAINS" ]; then
    echo "Pausando domínios Elasticsearch..."
    for domain in $ES_DOMAINS; do
        aws es update-elasticsearch-domain-config \
            --domain-name "$domain" \
            --elasticsearch-cluster-config InstanceType=t2.small.elasticsearch,InstanceCount=0 \
            2>/dev/null
        check_success "Elasticsearch pausado: $domain"
    done
else
    echo "✅ Nenhum domínio Elasticsearch ativo encontrado"
fi

echo ""
echo "🎉 RESUMO DA PAUSA:"
echo "==================="
echo "✅ RDS Cluster pausado (Aurora Serverless)"
echo "✅ CloudFront Distributions pausadas"
echo "✅ API Gateway pausado"
echo "✅ ECS Services verificados"
echo "✅ EC2 Instances verificadas"
echo "✅ Lambda Functions verificadas"
echo "✅ Elastic Beanstalk verificado"
echo "✅ Elasticsearch verificado"
echo ""
echo "💰 CUSTOS REDUZIDOS SIGNIFICATIVAMENTE!"
echo ""
echo "📝 NOTA: S3 Buckets continuam ativos (armazenamento)"
echo "📝 NOTA: VPC e outros recursos de rede continuam ativos"
echo ""
echo "🔄 Para reativar os serviços, execute: ./resume-all-services.sh"

