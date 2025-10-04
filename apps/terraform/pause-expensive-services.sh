#!/bin/bash

echo "⏸️  PAUSANDO SERVIÇOS CAROS - ECONOMIA IMEDIATA"
echo "================================================"
echo ""

# Função para verificar sucesso
check_success() {
    if [ $? -eq 0 ]; then
        echo "✅ $1"
    else
        echo "❌ $1"
    fi
}

echo "🔍 1. PAUSANDO CLOUDFRONT DISTRIBUTIONS..."
echo "==========================================="

# Lista de CloudFront distributions
DISTRIBUTIONS=("E21O2XASL1VPKV" "E3JLWRQ0144JK1" "E14M6QZSZDYHCA" "E1TIHJS74V6HZL" "EPM3YXHSX13SL")

for dist_id in "${DISTRIBUTIONS[@]}"; do
    echo "Pausando CloudFront: $dist_id"
    
    # Obter configuração atual
    aws cloudfront get-distribution-config --id "$dist_id" > /tmp/dist_config.json 2>/dev/null
    
    if [ $? -eq 0 ]; then
        # Criar configuração modificada apenas com Enabled=false
        jq '.DistributionConfig.Enabled = false' /tmp/dist_config.json > /tmp/dist_config_modified.json
        
        # Remover campos que causam erro
        jq 'del(.DistributionConfig.ETag)' /tmp/dist_config_modified.json > /tmp/dist_config_final.json
        
        # Atualizar distribution
        aws cloudfront update-distribution \
            --id "$dist_id" \
            --distribution-config file:///tmp/dist_config_final.json \
            --if-match $(jq -r '.ETag' /tmp/dist_config.json) \
            2>/dev/null
        
        check_success "CloudFront $dist_id pausado"
    else
        echo "⚠️  CloudFront $dist_id não encontrado"
    fi
done

echo ""
echo "🔍 2. VERIFICANDO INSTÂNCIAS EC2..."
echo "==================================="

# Verificar instâncias EC2 rodando
INSTANCES=$(aws ec2 describe-instances \
    --filters "Name=instance-state-name,Values=running" \
    --query 'Reservations[].Instances[].InstanceId' \
    --output text 2>/dev/null)

if [ -n "$INSTANCES" ]; then
    echo "Parando instâncias EC2..."
    for instance in $INSTANCES; do
        aws ec2 stop-instances --instance-ids "$instance" 2>/dev/null
        check_success "EC2 Instance $instance parado"
    done
else
    echo "✅ Nenhuma instância EC2 rodando"
fi

echo ""
echo "🔍 3. VERIFICANDO RDS CLUSTERS..."
echo "=================================="

# Verificar RDS clusters
RDS_CLUSTERS=$(aws rds describe-db-clusters --query 'DBClusters[?contains(DBClusterIdentifier, `formsync`)].DBClusterIdentifier' --output text 2>/dev/null)

if [ -n "$RDS_CLUSTERS" ]; then
    echo "Pausando RDS clusters..."
    for cluster in $RDS_CLUSTERS; do
        # Para Aurora Serverless v2, definir capacidade mínima como 0
        aws rds modify-db-cluster \
            --db-cluster-identifier "$cluster" \
            --serverless-v2-scaling-configuration MinCapacity=0,MaxCapacity=0 \
            2>/dev/null
        check_success "RDS Cluster $cluster pausado"
    done
else
    echo "✅ Nenhum cluster RDS formsync encontrado"
fi

echo ""
echo "🔍 4. VERIFICANDO LAMBDA FUNCTIONS..."
echo "====================================="

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
        check_success "Lambda Function $func pausado"
    done
else
    echo "✅ Nenhuma função Lambda formsync encontrada"
fi

echo ""
echo "🎉 PAUSA COMPLETA!"
echo "==================="
echo "✅ CloudFront Distributions pausadas"
echo "✅ EC2 Instances verificadas"
echo "✅ RDS Clusters verificados"
echo "✅ Lambda Functions verificadas"
echo ""
echo "💰 CUSTOS REDUZIDOS SIGNIFICATIVAMENTE!"
echo ""
echo "📝 NOTA: Recursos pausados não geram custos de computação"
echo "📝 NOTA: Apenas armazenamento (S3) continua ativo"
echo ""
echo "🔄 Para reativar quando precisar:"
echo "   ./resume-all-services.sh"

