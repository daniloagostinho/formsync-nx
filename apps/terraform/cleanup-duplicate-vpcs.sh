#!/bin/bash

# Script para limpar VPCs duplicadas do FormSync
# Remove VPCs que foram criadas quando o pipeline deu problema

set -e

echo "🧹 Limpeza de VPCs Duplicadas do FormSync"
echo "=========================================="
echo ""

# Verificar se AWS CLI está configurado
if ! aws sts get-caller-identity >/dev/null 2>&1; then
    echo "❌ Erro: AWS CLI não está configurado"
    exit 1
fi

echo "🔍 Listando VPCs existentes..."
echo ""

# Listar todas as VPCs
aws ec2 describe-vpcs --query 'Vpcs[*].[VpcId,Tags[?Key==`Name`].Value|[0],CidrBlock,State,IsDefault]' --output table

echo ""
echo "📊 Identificando VPCs do FormSync para remoção..."

# Encontrar VPCs do FormSync (não padrão)
VPC_IDS=$(aws ec2 describe-vpcs --query 'Vpcs[?IsDefault==`false` && contains(Tags[?Key==`Name`].Value, `formsync-vpc`)].VpcId' --output text)

if [ -z "$VPC_IDS" ]; then
    echo "⚠️  Nenhuma VPC do FormSync encontrada"
    exit 0
fi

echo "🎯 VPCs do FormSync encontradas:"
for vpc_id in $VPC_IDS; do
    echo "  - $vpc_id"
done

echo ""
echo "⚠️  ATENÇÃO: Este script irá deletar as VPCs do FormSync encontradas."
echo "   Certifique-se de que não há recursos importantes nelas."
echo ""

read -p "Deseja continuar com a remoção? (y/n): " confirm

if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
    echo "❌ Operação cancelada pelo usuário"
    exit 0
fi

echo ""
echo "🗑️  Iniciando remoção das VPCs..."

for vpc_id in $VPC_IDS; do
    echo ""
    echo "🔍 Processando VPC: $vpc_id"
    
    # Verificar recursos na VPC
    echo "  📋 Verificando recursos na VPC..."
    
    # Verificar subnets
    SUBNETS=$(aws ec2 describe-subnets --filters "Name=vpc-id,Values=$vpc_id" --query 'length(Subnets)')
    echo "    Subnets: $SUBNETS"
    
    # Verificar instâncias EC2
    INSTANCES=$(aws ec2 describe-instances --filters "Name=vpc-id,Values=$vpc_id" --query 'length(Reservations[].Instances[?State.Name!=`terminated`])')
    echo "    Instâncias EC2: $INSTANCES"
    
    # Verificar Load Balancers
    LBS=$(aws elbv2 describe-load-balancers --query "length(LoadBalancers[?VpcId=='$vpc_id'])")
    echo "    Load Balancers: $LBS"
    
    # Verificar NAT Gateways
    NAT_GATEWAYS=$(aws ec2 describe-nat-gateways --filter "Name=vpc-id,Values=$vpc_id" --query 'length(NatGateways[?State!=`deleted`])')
    echo "    NAT Gateways: $NAT_GATEWAYS"
    
    # Verificar Internet Gateways
    IGW=$(aws ec2 describe-internet-gateways --filters "Name=attachment.vpc-id,Values=$vpc_id" --query 'length(InternetGateways)')
    echo "    Internet Gateways: $IGW"
    
    if [ "$SUBNETS" -gt 0 ] || [ "$INSTANCES" -gt 0 ] || [ "$LBS" -gt 0 ] || [ "$NAT_GATEWAYS" -gt 0 ]; then
        echo "  ⚠️  VPC $vpc_id tem recursos associados. Removendo recursos primeiro..."
        
        # Remover NAT Gateways primeiro
        if [ "$NAT_GATEWAYS" -gt 0 ]; then
            echo "    🗑️  Removendo NAT Gateways..."
            NAT_GW_IDS=$(aws ec2 describe-nat-gateways --filter "Name=vpc-id,Values=$vpc_id" --query 'NatGateways[?State!=`deleted`].NatGatewayId' --output text)
            for nat_gw_id in $NAT_GW_IDS; do
                echo "      Removendo NAT Gateway: $nat_gw_id"
                aws ec2 delete-nat-gateway --nat-gateway-id "$nat_gw_id"
            done
        fi
        
        # Aguardar NAT Gateways serem removidos
        if [ "$NAT_GATEWAYS" -gt 0 ]; then
            echo "    ⏳ Aguardando NAT Gateways serem removidos..."
            sleep 30
        fi
        
        # Remover subnets
        if [ "$SUBNETS" -gt 0 ]; then
            echo "    🗑️  Removendo subnets..."
            SUBNET_IDS=$(aws ec2 describe-subnets --filters "Name=vpc-id,Values=$vpc_id" --query 'Subnets[].SubnetId' --output text)
            for subnet_id in $SUBNET_IDS; do
                echo "      Removendo subnet: $subnet_id"
                aws ec2 delete-subnet --subnet-id "$subnet_id"
            done
        fi
        
        # Desanexar e remover Internet Gateway
        if [ "$IGW" -gt 0 ]; then
            echo "    🗑️  Removendo Internet Gateway..."
            IGW_ID=$(aws ec2 describe-internet-gateways --filters "Name=attachment.vpc-id,Values=$vpc_id" --query 'InternetGateways[0].InternetGatewayId' --output text)
            if [ "$IGW_ID" != "None" ] && [ "$IGW_ID" != "null" ]; then
                echo "      Desanexando Internet Gateway: $IGW_ID"
                aws ec2 detach-internet-gateway --internet-gateway-id "$IGW_ID" --vpc-id "$vpc_id"
                echo "      Removendo Internet Gateway: $IGW_ID"
                aws ec2 delete-internet-gateway --internet-gateway-id "$IGW_ID"
            fi
        fi
    fi
    
    # Remover VPC
    echo "  🗑️  Removendo VPC: $vpc_id"
    if aws ec2 delete-vpc --vpc-id "$vpc_id"; then
        echo "  ✅ VPC $vpc_id removida com sucesso!"
    else
        echo "  ❌ Erro ao remover VPC $vpc_id"
    fi
done

echo ""
echo "🔍 Verificando VPCs restantes..."
aws ec2 describe-vpcs --query 'Vpcs[*].[VpcId,Tags[?Key==`Name`].Value|[0],CidrBlock,State,IsDefault]' --output table

echo ""
echo "✅ Limpeza concluída!"
echo ""
echo "📋 Próximos passos:"
echo "1. Execute 'terraform plan' para verificar se o problema de VPC foi resolvido"
echo "2. Se tudo estiver OK, execute 'terraform apply'"
echo ""
echo "💡 Agora você deve ter espaço suficiente para criar uma nova VPC"
