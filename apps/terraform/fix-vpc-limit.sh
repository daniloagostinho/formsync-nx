#!/bin/bash

# Script para resolver o problema de limite de VPC
# Este script oferece opções para lidar com o limite de VPC

set -e

echo "🔍 Verificando VPCs na sua conta AWS..."

# Listar todas as VPCs
echo "📋 VPCs existentes:"
aws ec2 describe-vpcs --query 'Vpcs[*].[VpcId,Tags[?Key==`Name`].Value|[0],CidrBlock,State,IsDefault]' --output table

echo ""
echo "📊 Estatísticas:"
TOTAL_VPCS=$(aws ec2 describe-vpcs --query 'length(Vpcs)')
DEFAULT_VPCS=$(aws ec2 describe-vpcs --query 'length(Vpcs[?IsDefault==`true`])')
CUSTOM_VPCS=$((TOTAL_VPCS - DEFAULT_VPCS))

echo "Total de VPCs: $TOTAL_VPCS"
echo "VPCs padrão: $DEFAULT_VPCS"
echo "VPCs customizadas: $CUSTOM_VPCS"

echo ""
echo "🎯 Opções para resolver o limite de VPC:"
echo ""
echo "1. 🗑️  Deletar VPCs não utilizadas (RECOMENDADO)"
echo "2. 🔄 Usar uma VPC existente"
echo "3. 📈 Solicitar aumento de quota"
echo ""

read -p "Escolha uma opção (1-3): " choice

case $choice in
    1)
        echo ""
        echo "🗑️  Listando VPCs que podem ser deletadas (não padrão e sem recursos):"
        
        # Listar VPCs não padrão
        aws ec2 describe-vpcs --query 'Vpcs[?IsDefault==`false`].[VpcId,Tags[?Key==`Name`].Value|[0],CidrBlock,State]' --output table
        
        echo ""
        echo "⚠️  ATENÇÃO: Antes de deletar uma VPC, verifique se ela não tem recursos associados:"
        echo "   - Subnets"
        echo "   - Instâncias EC2"
        echo "   - Load Balancers"
        echo "   - NAT Gateways"
        echo "   - Security Groups"
        echo ""
        
        read -p "Digite o VPC ID que deseja deletar (ou 'cancelar' para sair): " vpc_id
        
        if [ "$vpc_id" != "cancelar" ]; then
            echo "🔍 Verificando recursos na VPC $vpc_id..."
            
            # Verificar recursos
            SUBNETS=$(aws ec2 describe-subnets --filters "Name=vpc-id,Values=$vpc_id" --query 'length(Subnets)')
            INSTANCES=$(aws ec2 describe-instances --filters "Name=vpc-id,Values=$vpc_id" --query 'length(Reservations[].Instances[?State.Name!=`terminated`])')
            LBS=$(aws elbv2 describe-load-balancers --query "length(LoadBalancers[?VpcId=='$vpc_id'])")
            
            echo "Subnets: $SUBNETS"
            echo "Instâncias EC2: $INSTANCES"
            echo "Load Balancers: $LBS"
            
            if [ "$SUBNETS" -eq 0 ] && [ "$INSTANCES" -eq 0 ] && [ "$LBS" -eq 0 ]; then
                echo "✅ VPC $vpc_id parece estar vazia. Prosseguindo com a deleção..."
                
                # Deletar Internet Gateway primeiro
                IGW_ID=$(aws ec2 describe-internet-gateways --filters "Name=attachment.vpc-id,Values=$vpc_id" --query 'InternetGateways[0].InternetGatewayId' --output text)
                if [ "$IGW_ID" != "None" ] && [ "$IGW_ID" != "null" ]; then
                    echo "🔌 Desanexando Internet Gateway $IGW_ID..."
                    aws ec2 detach-internet-gateway --internet-gateway-id "$IGW_ID" --vpc-id "$vpc_id"
                    echo "🗑️  Deletando Internet Gateway $IGW_ID..."
                    aws ec2 delete-internet-gateway --internet-gateway-id "$IGW_ID"
                fi
                
                # Deletar VPC
                echo "🗑️  Deletando VPC $vpc_id..."
                aws ec2 delete-vpc --vpc-id "$vpc_id"
                echo "✅ VPC $vpc_id deletada com sucesso!"
            else
                echo "❌ VPC $vpc_id ainda tem recursos associados. Não é possível deletar."
                echo "💡 Remova os recursos primeiro ou escolha outra VPC."
            fi
        fi
        ;;
    2)
        echo ""
        echo "🔄 Para usar uma VPC existente, você precisa:"
        echo "1. Escolher uma VPC da lista acima"
        echo "2. Modificar o arquivo vpc.tf para usar data source"
        echo ""
        echo "📝 Exemplo de modificação no vpc.tf:"
        echo ""
        echo "# Comentar a criação de VPC:"
        echo "# resource \"aws_vpc\" \"main\" { ... }"
        echo ""
        echo "# Adicionar data source:"
        echo "data \"aws_vpc\" \"existing\" {"
        echo "  filter {"
        echo "    name   = \"vpc-id\""
        echo "    values = [\"vpc-xxxxxxxxx\"]  # Substitua pelo ID da VPC"
        echo "  }"
        echo "}"
        echo ""
        echo "# Usar data.aws_vpc.existing.id onde antes usava aws_vpc.main.id"
        ;;
    3)
        echo ""
        echo "📈 Para solicitar aumento de quota:"
        echo "1. Acesse o AWS Service Quotas console"
        echo "2. Procure por 'VPC'"
        echo "3. Solicite aumento do limite de VPCs"
        echo "4. Aguarde aprovação (pode levar alguns dias)"
        echo ""
        echo "🔗 Link direto: https://console.aws.amazon.com/servicequotas/home/services/vpc/quotas"
        ;;
    *)
        echo "❌ Opção inválida"
        ;;
esac

echo ""
echo "✅ Script concluído!"
