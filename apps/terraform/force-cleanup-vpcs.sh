#!/bin/bash

# Script FORÇADO para limpar TODAS as VPCs e recursos
# ATENÇÃO: Remove TUDO relacionado ao FormSync!

set -e

echo "🔥 FormSync - Limpeza FORÇADA de VPCs"
echo "====================================="

# Verificar se estamos no diretório correto
if [ ! -f "terraform.tfstate" ] && [ ! -f "main.tf" ]; then
    echo "❌ Erro: Execute este script no diretório terraform/"
    echo "💡 Dica: cd apps/terraform && ./force-cleanup-vpcs.sh"
    exit 1
fi

echo "⚠️  ATENÇÃO: Este script irá remover TODAS as VPCs e recursos do FormSync!"
echo "🔍 Listando recursos existentes..."

# Listar VPCs
echo "📋 VPCs existentes:"
aws ec2 describe-vpcs --query 'Vpcs[*].[VpcId,State,Tags[?Key==`Name`].Value|[0],IsDefault]' --output table

# Listar Load Balancers
echo "📋 Load Balancers existentes:"
aws elbv2 describe-load-balancers --query 'LoadBalancers[*].[LoadBalancerName,LoadBalancerArn,State.Code]' --output table

# Listar ECS Clusters
echo "📋 ECS Clusters existentes:"
aws ecs list-clusters --query 'clusterArns[*]' --output table

# Listar RDS Instances
echo "📋 RDS Instances existentes:"
aws rds describe-db-instances --query 'DBInstances[*].[DBInstanceIdentifier,DBInstanceStatus,Engine]' --output table

echo ""
echo "🚨 LIMPEZA FORÇADA - REMOVENDO TUDO..."
echo ""

# 1. Remover Load Balancers
echo "🗑️  Removendo Load Balancers..."
aws elbv2 describe-load-balancers --query 'LoadBalancers[?contains(LoadBalancerName, `formsync`)].LoadBalancerArn' --output text | tr '\t' '\n' | while read lb_arn; do
    if [ -n "$lb_arn" ]; then
        echo "  🗑️  Removendo Load Balancer: $lb_arn"
        aws elbv2 delete-load-balancer --load-balancer-arn "$lb_arn" 2>/dev/null || echo "    ⚠️  Erro ao remover $lb_arn"
    fi
done

# 2. Remover Target Groups
echo "🗑️  Removendo Target Groups..."
aws elbv2 describe-target-groups --query 'TargetGroups[?contains(TargetGroupName, `formsync`)].TargetGroupArn' --output text | tr '\t' '\n' | while read tg_arn; do
    if [ -n "$tg_arn" ]; then
        echo "  🗑️  Removendo Target Group: $tg_arn"
        aws elbv2 delete-target-group --target-group-arn "$tg_arn" 2>/dev/null || echo "    ⚠️  Erro ao remover $tg_arn"
    fi
done

# 3. Remover ECS Services
echo "🗑️  Removendo ECS Services..."
aws ecs list-services --cluster formsync-cluster --query 'serviceArns[*]' --output text 2>/dev/null | tr '\t' '\n' | while read service_arn; do
    if [ -n "$service_arn" ]; then
        echo "  🗑️  Removendo ECS Service: $service_arn"
        aws ecs update-service --cluster formsync-cluster --service "$service_arn" --desired-count 0 2>/dev/null || true
        aws ecs delete-service --cluster formsync-cluster --service "$service_arn" 2>/dev/null || echo "    ⚠️  Erro ao remover $service_arn"
    fi
done

# 4. Remover ECS Tasks
echo "🗑️  Removendo ECS Tasks..."
aws ecs list-tasks --cluster formsync-cluster --query 'taskArns[*]' --output text 2>/dev/null | tr '\t' '\n' | while read task_arn; do
    if [ -n "$task_arn" ]; then
        echo "  🗑️  Parando ECS Task: $task_arn"
        aws ecs stop-task --cluster formsync-cluster --task "$task_arn" 2>/dev/null || echo "    ⚠️  Erro ao parar $task_arn"
    fi
done

# 5. Remover ECS Cluster
echo "🗑️  Removendo ECS Cluster..."
aws ecs delete-cluster --cluster formsync-cluster 2>/dev/null || echo "  ⚠️  Cluster não encontrado ou já removido"

# 6. Remover RDS Instances
echo "🗑️  Removendo RDS Instances..."
aws rds describe-db-instances --query 'DBInstances[?contains(DBInstanceIdentifier, `formsync`)].DBInstanceIdentifier' --output text | tr '\t' '\n' | while read db_id; do
    if [ -n "$db_id" ]; then
        echo "  🗑️  Removendo RDS Instance: $db_id"
        aws rds delete-db-instance --db-instance-identifier "$db_id" --skip-final-snapshot 2>/dev/null || echo "    ⚠️  Erro ao remover $db_id"
    fi
done

# 7. Remover RDS Clusters
echo "🗑️  Removendo RDS Clusters..."
aws rds describe-db-clusters --query 'DBClusters[?contains(DBClusterIdentifier, `formsync`)].DBClusterIdentifier' --output text | tr '\t' '\n' | while read cluster_id; do
    if [ -n "$cluster_id" ]; then
        echo "  🗑️  Removendo RDS Cluster: $cluster_id"
        aws rds delete-db-cluster --db-cluster-identifier "$cluster_id" --skip-final-snapshot 2>/dev/null || echo "    ⚠️  Erro ao remover $cluster_id"
    fi
done

# 8. Remover DB Subnet Groups
echo "🗑️  Removendo DB Subnet Groups..."
aws rds describe-db-subnet-groups --query 'DBSubnetGroups[?contains(DBSubnetGroupName, `formsync`)].DBSubnetGroupName' --output text | tr '\t' '\n' | while read subnet_group; do
    if [ -n "$subnet_group" ]; then
        echo "  🗑️  Removendo DB Subnet Group: $subnet_group"
        aws rds delete-db-subnet-group --db-subnet-group-name "$subnet_group" 2>/dev/null || echo "    ⚠️  Erro ao remover $subnet_group"
    fi
done

# 9. Remover VPCs (processo mais cuidadoso)
echo "🗑️  Removendo VPCs..."
aws ec2 describe-vpcs --query 'Vpcs[?IsDefault==`false`].VpcId' --output text | tr '\t' '\n' | while read vpc_id; do
    if [ -n "$vpc_id" ]; then
        echo "  🧹 Limpando VPC: $vpc_id"
        
        # Remover Security Groups
        aws ec2 describe-security-groups --filters "Name=vpc-id,Values=$vpc_id" --query 'SecurityGroups[?GroupName!=`default`].GroupId' --output text | tr '\t' '\n' | while read sg_id; do
            if [ -n "$sg_id" ]; then
                aws ec2 delete-security-group --group-id "$sg_id" 2>/dev/null || true
            fi
        done
        
        # Remover Subnets
        aws ec2 describe-subnets --filters "Name=vpc-id,Values=$vpc_id" --query 'Subnets[].SubnetId' --output text | tr '\t' '\n' | while read subnet_id; do
            if [ -n "$subnet_id" ]; then
                aws ec2 delete-subnet --subnet-id "$subnet_id" 2>/dev/null || true
            fi
        done
        
        # Remover Internet Gateways
        aws ec2 describe-internet-gateways --filters "Name=attachment.vpc-id,Values=$vpc_id" --query 'InternetGateways[].InternetGatewayId' --output text | tr '\t' '\n' | while read igw_id; do
            if [ -n "$igw_id" ]; then
                aws ec2 detach-internet-gateway --internet-gateway-id "$igw_id" --vpc-id "$vpc_id" 2>/dev/null || true
                aws ec2 delete-internet-gateway --internet-gateway-id "$igw_id" 2>/dev/null || true
            fi
        done
        
        # Remover Route Tables
        aws ec2 describe-route-tables --filters "Name=vpc-id,Values=$vpc_id" --query 'RouteTables[?Associations[0].Main!=`true`].RouteTableId' --output text | tr '\t' '\n' | while read rt_id; do
            if [ -n "$rt_id" ]; then
                aws ec2 delete-route-table --route-table-id "$rt_id" 2>/dev/null || true
            fi
        done
        
        # Remover NAT Gateways
        aws ec2 describe-nat-gateways --filter "Name=vpc-id,Values=$vpc_id" --query 'NatGateways[?State!=`deleted`].NatGatewayId' --output text | tr '\t' '\n' | while read nat_id; do
            if [ -n "$nat_id" ]; then
                aws ec2 delete-nat-gateway --nat-gateway-id "$nat_id" 2>/dev/null || true
            fi
        done
        
        # Aguardar e remover VPC
        sleep 5
        echo "    🗑️  Removendo VPC: $vpc_id"
        aws ec2 delete-vpc --vpc-id "$vpc_id" 2>/dev/null || echo "    ⚠️  Erro ao remover VPC $vpc_id"
    fi
done

# 10. Limpar Terraform State
echo "🗑️  Limpando Terraform State..."
if [ -f "terraform.tfstate" ]; then
    echo "  🗑️  Removendo terraform.tfstate"
    rm -f terraform.tfstate
fi

if [ -f "terraform.tfstate.backup" ]; then
    echo "  🗑️  Removendo terraform.tfstate.backup"
    rm -f terraform.tfstate.backup
fi

if [ -d ".terraform" ]; then
    echo "  🗑️  Removendo diretório .terraform"
    rm -rf .terraform
fi

echo ""
echo "✅ Limpeza FORÇADA concluída!"
echo "🔍 Verificando recursos restantes..."

# Verificar VPCs
echo "📋 VPCs restantes:"
aws ec2 describe-vpcs --query 'Vpcs[*].[VpcId,State,Tags[?Key==`Name`].Value|[0],IsDefault]' --output table

echo ""
echo "🎉 Limpeza FORÇADA executada com sucesso!"
echo "💡 Agora você pode executar 'terraform init && terraform apply' para criar tudo do zero"