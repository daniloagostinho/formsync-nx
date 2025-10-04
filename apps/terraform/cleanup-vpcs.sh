#!/bin/bash

# Script para limpar VPCs existentes e criar uma nova
# ATENÇÃO: Este script remove TODAS as VPCs não-default!

set -e

echo "🧹 FormSync - Limpeza de VPCs"
echo "=============================="

# Verificar se estamos no diretório correto
if [ ! -f "terraform.tfstate" ] && [ ! -f "main.tf" ]; then
    echo "❌ Erro: Execute este script no diretório terraform/"
    echo "💡 Dica: cd apps/terraform && ./cleanup-vpcs.sh"
    exit 1
fi

echo "🔍 Listando VPCs existentes..."
aws ec2 describe-vpcs --query 'Vpcs[*].[VpcId,State,Tags[?Key==`Name`].Value|[0],IsDefault]' --output table

echo ""
echo "⚠️  ATENÇÃO: Este script irá remover TODAS as VPCs não-default!"
echo "📋 VPCs que serão removidas:"

# Listar VPCs não-default
NON_DEFAULT_VPCS=$(aws ec2 describe-vpcs --query 'Vpcs[?IsDefault==`false`].VpcId' --output text)

if [ -z "$NON_DEFAULT_VPCS" ]; then
    echo "✅ Nenhuma VPC não-default encontrada. Nada para remover."
    exit 0
fi

echo "$NON_DEFAULT_VPCS" | tr '\t' '\n' | while read vpc_id; do
    if [ -n "$vpc_id" ]; then
        echo "  - $vpc_id"
    fi
done

echo ""
read -p "🤔 Deseja continuar? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Operação cancelada pelo usuário."
    exit 1
fi

echo ""
echo "🗑️  Removendo VPCs existentes..."

# Função para remover recursos de uma VPC
cleanup_vpc_resources() {
    local vpc_id=$1
    echo "🧹 Limpando recursos da VPC: $vpc_id"
    
    # 1. Remover Security Groups (exceto default)
    echo "  📋 Removendo Security Groups..."
    aws ec2 describe-security-groups --filters "Name=vpc-id,Values=$vpc_id" --query 'SecurityGroups[?GroupName!=`default`].GroupId' --output text | tr '\t' '\n' | while read sg_id; do
        if [ -n "$sg_id" ]; then
            echo "    🗑️  Removendo Security Group: $sg_id"
            aws ec2 delete-security-group --group-id "$sg_id" 2>/dev/null || echo "    ⚠️  Não foi possível remover $sg_id (pode estar em uso)"
        fi
    done
    
    # 2. Remover Subnets
    echo "  📋 Removendo Subnets..."
    aws ec2 describe-subnets --filters "Name=vpc-id,Values=$vpc_id" --query 'Subnets[].SubnetId' --output text | tr '\t' '\n' | while read subnet_id; do
        if [ -n "$subnet_id" ]; then
            echo "    🗑️  Removendo Subnet: $subnet_id"
            aws ec2 delete-subnet --subnet-id "$subnet_id" 2>/dev/null || echo "    ⚠️  Não foi possível remover $subnet_id (pode estar em uso)"
        fi
    done
    
    # 3. Remover Internet Gateways
    echo "  📋 Removendo Internet Gateways..."
    aws ec2 describe-internet-gateways --filters "Name=attachment.vpc-id,Values=$vpc_id" --query 'InternetGateways[].InternetGatewayId' --output text | tr '\t' '\n' | while read igw_id; do
        if [ -n "$igw_id" ]; then
            echo "    🗑️  Desanexando e removendo Internet Gateway: $igw_id"
            aws ec2 detach-internet-gateway --internet-gateway-id "$igw_id" --vpc-id "$vpc_id" 2>/dev/null || true
            aws ec2 delete-internet-gateway --internet-gateway-id "$igw_id" 2>/dev/null || echo "    ⚠️  Não foi possível remover $igw_id"
        fi
    done
    
    # 4. Remover Route Tables (exceto main)
    echo "  📋 Removendo Route Tables..."
    aws ec2 describe-route-tables --filters "Name=vpc-id,Values=$vpc_id" --query 'RouteTables[?Associations[0].Main!=`true`].RouteTableId' --output text | tr '\t' '\n' | while read rt_id; do
        if [ -n "$rt_id" ]; then
            echo "    🗑️  Removendo Route Table: $rt_id"
            aws ec2 delete-route-table --route-table-id "$rt_id" 2>/dev/null || echo "    ⚠️  Não foi possível remover $rt_id"
        fi
    done
    
    # 5. Remover NAT Gateways
    echo "  📋 Removendo NAT Gateways..."
    aws ec2 describe-nat-gateways --filter "Name=vpc-id,Values=$vpc_id" --query 'NatGateways[?State!=`deleted`].NatGatewayId' --output text | tr '\t' '\n' | while read nat_id; do
        if [ -n "$nat_id" ]; then
            echo "    🗑️  Removendo NAT Gateway: $nat_id"
            aws ec2 delete-nat-gateway --nat-gateway-id "$nat_id" 2>/dev/null || echo "    ⚠️  Não foi possível remover $nat_id"
        fi
    done
    
    # 6. Remover VPC Endpoints
    echo "  📋 Removendo VPC Endpoints..."
    aws ec2 describe-vpc-endpoints --filters "Name=vpc-id,Values=$vpc_id" --query 'VpcEndpoints[].VpcEndpointId' --output text | tr '\t' '\n' | while read endpoint_id; do
        if [ -n "$endpoint_id" ]; then
            echo "    🗑️  Removendo VPC Endpoint: $endpoint_id"
            aws ec2 delete-vpc-endpoint --vpc-endpoint-id "$endpoint_id" 2>/dev/null || echo "    ⚠️  Não foi possível remover $endpoint_id"
        fi
    done
}

# Processar cada VPC não-default
echo "$NON_DEFAULT_VPCS" | tr '\t' '\n' | while read vpc_id; do
    if [ -n "$vpc_id" ]; then
        cleanup_vpc_resources "$vpc_id"
        
        # Aguardar um pouco para os recursos serem removidos
        echo "  ⏳ Aguardando recursos serem removidos..."
        sleep 10
        
        # Remover a VPC
        echo "  🗑️  Removendo VPC: $vpc_id"
        aws ec2 delete-vpc --vpc-id "$vpc_id" 2>/dev/null || echo "  ⚠️  Não foi possível remover VPC $vpc_id (pode ter recursos dependentes)"
    fi
done

echo ""
echo "✅ Limpeza concluída!"
echo "🔍 Verificando VPCs restantes..."
aws ec2 describe-vpcs --query 'Vpcs[*].[VpcId,State,Tags[?Key==`Name`].Value|[0],IsDefault]' --output table

echo ""
echo "🎉 Script executado com sucesso!"
echo "💡 Agora você pode executar 'terraform apply' para criar a nova VPC"
