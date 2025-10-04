#!/bin/bash

# Script mais agressivo para limpar VPCs com dependências
# Remove todos os recursos possíveis antes de deletar a VPC

set -e

echo "🔥 Limpeza Forçada de VPCs do FormSync"
echo "======================================"
echo ""

# Listar VPCs do FormSync
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
echo "⚠️  ATENÇÃO: Este script irá remover FORÇADAMENTE todas as VPCs do FormSync"
echo "   e todos os recursos associados (Security Groups, Route Tables, etc.)"
echo ""

read -p "Deseja continuar? (y/n): " confirm

if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
    echo "❌ Operação cancelada"
    exit 0
fi

for vpc_id in $VPC_IDS; do
    echo ""
    echo "🔥 Processando VPC: $vpc_id"
    
    # 1. Remover Security Groups (exceto default)
    echo "  🗑️  Removendo Security Groups..."
    SG_IDS=$(aws ec2 describe-security-groups --filters "Name=vpc-id,Values=$vpc_id" --query 'SecurityGroups[?GroupName!=`default`].GroupId' --output text)
    for sg_id in $SG_IDS; do
        echo "    Removendo Security Group: $sg_id"
        aws ec2 delete-security-group --group-id "$sg_id" 2>/dev/null || echo "    ⚠️  Não foi possível remover $sg_id"
    done
    
    # 2. Remover Route Tables (exceto main)
    echo "  🗑️  Removendo Route Tables..."
    RT_IDS=$(aws ec2 describe-route-tables --filters "Name=vpc-id,Values=$vpc_id" --query 'RouteTables[?Associations[0].Main!=`true`].RouteTableId' --output text)
    for rt_id in $RT_IDS; do
        echo "    Removendo Route Table: $rt_id"
        aws ec2 delete-route-table --route-table-id "$rt_id" 2>/dev/null || echo "    ⚠️  Não foi possível remover $rt_id"
    done
    
    # 3. Remover Network ACLs (exceto default)
    echo "  🗑️  Removendo Network ACLs..."
    NACL_IDS=$(aws ec2 describe-network-acls --filters "Name=vpc-id,Values=$vpc_id" --query 'NetworkAcls[?IsDefault!=`true`].NetworkAclId' --output text)
    for nacl_id in $NACL_IDS; do
        echo "    Removendo Network ACL: $nacl_id"
        aws ec2 delete-network-acl --network-acl-id "$nacl_id" 2>/dev/null || echo "    ⚠️  Não foi possível remover $nacl_id"
    done
    
    # 4. Remover Subnets
    echo "  🗑️  Removendo Subnets..."
    SUBNET_IDS=$(aws ec2 describe-subnets --filters "Name=vpc-id,Values=$vpc_id" --query 'Subnets[].SubnetId' --output text)
    for subnet_id in $SUBNET_IDS; do
        echo "    Removendo Subnet: $subnet_id"
        aws ec2 delete-subnet --subnet-id "$subnet_id" 2>/dev/null || echo "    ⚠️  Não foi possível remover $subnet_id"
    done
    
    # 5. Remover NAT Gateways
    echo "  🗑️  Removendo NAT Gateways..."
    NAT_GW_IDS=$(aws ec2 describe-nat-gateways --filter "Name=vpc-id,Values=$vpc_id" --query 'NatGateways[?State!=`deleted`].NatGatewayId' --output text)
    for nat_gw_id in $NAT_GW_IDS; do
        echo "    Removendo NAT Gateway: $nat_gw_id"
        aws ec2 delete-nat-gateway --nat-gateway-id "$nat_gw_id"
    done
    
    # 6. Aguardar NAT Gateways serem removidos
    if [ ! -z "$NAT_GW_IDS" ]; then
        echo "    ⏳ Aguardando NAT Gateways serem removidos..."
        sleep 60
    fi
    
    # 7. Desanexar e remover Internet Gateways
    echo "  🗑️  Removendo Internet Gateways..."
    IGW_IDS=$(aws ec2 describe-internet-gateways --filters "Name=attachment.vpc-id,Values=$vpc_id" --query 'InternetGateways[].InternetGatewayId' --output text)
    for igw_id in $IGW_IDS; do
        echo "    Desanexando Internet Gateway: $igw_id"
        aws ec2 detach-internet-gateway --internet-gateway-id "$igw_id" --vpc-id "$vpc_id" 2>/dev/null || echo "    ⚠️  Não foi possível desanexar $igw_id"
        echo "    Removendo Internet Gateway: $igw_id"
        aws ec2 delete-internet-gateway --internet-gateway-id "$igw_id" 2>/dev/null || echo "    ⚠️  Não foi possível remover $igw_id"
    done
    
    # 8. Remover VPC Endpoints
    echo "  🗑️  Removendo VPC Endpoints..."
    VPCE_IDS=$(aws ec2 describe-vpc-endpoints --filters "Name=vpc-id,Values=$vpc_id" --query 'VpcEndpoints[].VpcEndpointId' --output text)
    for vpce_id in $VPCE_IDS; do
        echo "    Removendo VPC Endpoint: $vpce_id"
        aws ec2 delete-vpc-endpoint --vpc-endpoint-id "$vpce_id" 2>/dev/null || echo "    ⚠️  Não foi possível remover $vpce_id"
    done
    
    # 9. Aguardar um pouco antes de tentar remover a VPC
    echo "  ⏳ Aguardando recursos serem removidos..."
    sleep 10
    
    # 10. Tentar remover a VPC
    echo "  🗑️  Removendo VPC: $vpc_id"
    if aws ec2 delete-vpc --vpc-id "$vpc_id"; then
        echo "  ✅ VPC $vpc_id removida com sucesso!"
    else
        echo "  ❌ Ainda não foi possível remover VPC $vpc_id"
        echo "  💡 Pode haver recursos que precisam ser removidos manualmente"
    fi
done

echo ""
echo "🔍 Verificando VPCs restantes..."
aws ec2 describe-vpcs --query 'Vpcs[*].[VpcId,Tags[?Key==`Name`].Value|[0],CidrBlock,State,IsDefault]' --output table

echo ""
echo "✅ Limpeza forçada concluída!"
echo ""
echo "📋 Próximos passos:"
echo "1. Execute 'terraform plan' para verificar se o problema foi resolvido"
echo "2. Se ainda houver problemas, pode ser necessário aguardar alguns minutos"
echo "   para que a AWS processe completamente a remoção"
