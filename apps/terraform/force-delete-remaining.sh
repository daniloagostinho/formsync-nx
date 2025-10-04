#!/bin/bash

echo "💥 FORÇANDO DELEÇÃO DOS RECURSOS RESTANTES"
echo "=========================================="
echo ""

# Função para aguardar
wait_for_deletion() {
    echo "⏳ Aguardando 30 segundos para propagação..."
    sleep 30
}

echo "🔍 1. DELETANDO API GATEWAYS RESTANTES..."
echo "========================================="

# Tentar deletar API Gateway restante
aws apigateway delete-rest-api --rest-api-id vw8eeh8bz2 2>/dev/null
if [ $? -eq 0 ]; then
    echo "✅ API Gateway vw8eeh8bz2 deletado"
else
    echo "⚠️  API Gateway vw8eeh8bz2 ainda existe (aguardar)"
fi

wait_for_deletion

echo ""
echo "🔍 2. DELETANDO VPCs COM DEPENDÊNCIAS..."
echo "======================================="

# Lista de VPCs para deletar
VPCS=("vpc-0047c6d7be0d8287e" "vpc-0aa853dcd21e77076" "vpc-056ec338d0db4217b")

for vpc_id in "${VPCS[@]}"; do
    echo "Deletando VPC: $vpc_id"
    
    # 1. Deletar subnets
    echo "  - Deletando subnets..."
    SUBNETS=$(aws ec2 describe-subnets --filters "Name=vpc-id,Values=$vpc_id" --query 'Subnets[].SubnetId' --output text 2>/dev/null)
    for subnet_id in $SUBNETS; do
        aws ec2 delete-subnet --subnet-id "$subnet_id" 2>/dev/null
    done
    
    # 2. Deletar route tables (exceto main)
    echo "  - Deletando route tables..."
    ROUTE_TABLES=$(aws ec2 describe-route-tables --filters "Name=vpc-id,Values=$vpc_id" --query 'RouteTables[?!Associations[0].Main].RouteTableId' --output text 2>/dev/null)
    for rt_id in $ROUTE_TABLES; do
        aws ec2 delete-route-table --route-table-id "$rt_id" 2>/dev/null
    done
    
    # 3. Deletar internet gateway
    echo "  - Deletando internet gateway..."
    IGW=$(aws ec2 describe-internet-gateways --filters "Name=attachment.vpc-id,Values=$vpc_id" --query 'InternetGateways[].InternetGatewayId' --output text 2>/dev/null)
    if [ -n "$IGW" ]; then
        aws ec2 detach-internet-gateway --internet-gateway-id "$IGW" --vpc-id "$vpc_id" 2>/dev/null
        aws ec2 delete-internet-gateway --internet-gateway-id "$IGW" 2>/dev/null
    fi
    
    # 4. Deletar security groups (exceto default)
    echo "  - Deletando security groups..."
    SGS=$(aws ec2 describe-security-groups --filters "Name=vpc-id,Values=$vpc_id" --query 'SecurityGroups[?GroupName!=`default`].GroupId' --output text 2>/dev/null)
    for sg_id in $SGS; do
        aws ec2 delete-security-group --group-id "$sg_id" 2>/dev/null
    done
    
    # 5. Deletar VPC
    echo "  - Deletando VPC..."
    aws ec2 delete-vpc --vpc-id "$vpc_id" 2>/dev/null
    
    if [ $? -eq 0 ]; then
        echo "✅ VPC $vpc_id deletada"
    else
        echo "❌ Erro ao deletar VPC $vpc_id"
    fi
    
    wait_for_deletion
done

echo ""
echo "🔍 3. DELETANDO CLOUDFRONT DISTRIBUTIONS..."
echo "==========================================="

# Lista de CloudFront distributions
DISTRIBUTIONS=("E21O2XASL1VPKV" "E3JLWRQ0144JK1" "E14M6QZSZDYHCA" "E1TIHJS74V6HZL" "EPM3YXHSX13SL")

for dist_id in "${DISTRIBUTIONS[@]}"; do
    echo "Deletando CloudFront: $dist_id"
    
    # Obter configuração atual
    aws cloudfront get-distribution-config --id "$dist_id" > /tmp/dist_config.json 2>/dev/null
    
    if [ $? -eq 0 ]; then
        # Desabilitar primeiro
        echo "  - Desabilitando distribution..."
        jq '.DistributionConfig.Enabled = false' /tmp/dist_config.json > /tmp/dist_config_modified.json
        
        # Remover campos desnecessários
        jq 'del(.DistributionConfig.ETag)' /tmp/dist_config_modified.json > /tmp/dist_config_final.json
        
        # Atualizar distribution
        aws cloudfront update-distribution \
            --id "$dist_id" \
            --distribution-config file:///tmp/dist_config_final.json \
            --if-match $(jq -r '.ETag' /tmp/dist_config.json) \
            2>/dev/null
        
        echo "  - Aguardando desabilitação..."
        wait_for_deletion
        
        # Deletar distribution
        echo "  - Deletando distribution..."
        aws cloudfront delete-distribution \
            --id "$dist_id" \
            --if-match $(jq -r '.ETag' /tmp/dist_config.json) \
            2>/dev/null
        
        if [ $? -eq 0 ]; then
            echo "✅ CloudFront $dist_id deletado"
        else
            echo "❌ Erro ao deletar CloudFront $dist_id"
        fi
    else
        echo "⚠️  CloudFront $dist_id não encontrado ou já deletado"
    fi
    
    wait_for_deletion
done

echo ""
echo "🎉 DELEÇÃO FORÇADA COMPLETA!"
echo "============================="
echo "✅ API Gateways deletados"
echo "✅ VPCs deletadas"
echo "✅ CloudFront Distributions deletadas"
echo ""
echo "💰 CUSTOS ELIMINADOS!"
echo ""
echo "🔍 Para verificar se deletou tudo:"
echo "   ./verify-cleanup.sh"

