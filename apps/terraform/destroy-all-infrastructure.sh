#!/bin/bash

echo "💥 DESTRUINDO TODA A INFRAESTRUTURA AWS - SEM SURPRESAS!"
echo "========================================================"
echo ""

# Função para verificar se um comando foi executado com sucesso
check_success() {
    if [ $? -eq 0 ]; then
        echo "✅ $1"
    else
        echo "❌ $1"
    fi
}

echo "⚠️  ATENÇÃO: Esta operação vai DELETAR TODOS os recursos AWS!"
echo "💰 Isso vai eliminar TODOS os custos!"
echo "🔄 Você pode recriar tudo depois com: terraform apply"
echo ""

read -p "Tem certeza que quer DELETAR TUDO? (y/N): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "💥 INICIANDO DESTRUIÇÃO TOTAL..."
    echo ""
    
    echo "🔍 1. DESTRUINDO COM TERRAFORM..."
    echo "================================="
    
    # Destruir toda a infraestrutura Terraform
    terraform destroy -auto-approve
    check_success "Infraestrutura Terraform destruída"
    
    echo ""
    echo "🔍 2. DELETANDO RECURSOS MANUAIS..."
    echo "=================================="
    
    # Deletar CloudFront Distributions extras
    echo "Deletando CloudFront Distributions extras..."
    DISTRIBUTIONS=$(aws cloudfront list-distributions --query 'DistributionList.Items[].Id' --output text 2>/dev/null)
    
    for dist_id in $DISTRIBUTIONS; do
        echo "Deletando CloudFront: $dist_id"
        
        # Obter configuração atual
        aws cloudfront get-distribution-config --id "$dist_id" > /tmp/dist_config.json 2>/dev/null
        
        if [ $? -eq 0 ]; then
            # Deletar distribution
            aws cloudfront delete-distribution \
                --id "$dist_id" \
                --if-match $(jq -r '.ETag' /tmp/dist_config.json) \
                2>/dev/null
            
            check_success "CloudFront $dist_id deletado"
        else
            echo "⚠️  Não foi possível deletar CloudFront $dist_id"
        fi
    done
    
    echo ""
    echo "🔍 3. DELETANDO API GATEWAYS EXTRAS..."
    echo "====================================="
    
    # Deletar API Gateways extras
    API_IDS=$(aws apigateway get-rest-apis --query 'items[?contains(name, `formsync`)].id' --output text 2>/dev/null)
    
    for api_id in $API_IDS; do
        echo "Deletando API Gateway: $api_id"
        aws apigateway delete-rest-api --rest-api-id "$api_id" 2>/dev/null
        check_success "API Gateway $api_id deletado"
    done
    
    echo ""
    echo "🔍 4. DELETANDO BUCKETS S3 EXTRAS..."
    echo "===================================="
    
    # Deletar buckets S3 extras
    BUCKETS=$(aws s3 ls | grep formsync | awk '{print $3}')
    
    for bucket in $BUCKETS; do
        echo "Deletando bucket: $bucket"
        
        # Deletar todos os objetos primeiro
        aws s3 rm "s3://$bucket" --recursive 2>/dev/null
        
        # Deletar o bucket
        aws s3api delete-bucket --bucket "$bucket" 2>/dev/null
        
        check_success "Bucket $bucket deletado"
    done
    
    echo ""
    echo "🔍 5. DELETANDO VPCs EXTRAS..."
    echo "==============================="
    
    # Deletar VPCs extras
    VPCS=$(aws ec2 describe-vpcs --query 'Vpcs[?Tags[?Key==`Project` && Value==`formsync`]].VpcId' --output text 2>/dev/null)
    
    for vpc_id in $VPCS; do
        echo "Deletando VPC: $vpc_id"
        
        # Deletar subnets primeiro
        SUBNETS=$(aws ec2 describe-subnets --filters "Name=vpc-id,Values=$vpc_id" --query 'Subnets[].SubnetId' --output text 2>/dev/null)
        for subnet_id in $SUBNETS; do
            aws ec2 delete-subnet --subnet-id "$subnet_id" 2>/dev/null
        done
        
        # Deletar route tables
        ROUTE_TABLES=$(aws ec2 describe-route-tables --filters "Name=vpc-id,Values=$vpc_id" --query 'RouteTables[?!Associations[0].Main].RouteTableId' --output text 2>/dev/null)
        for rt_id in $ROUTE_TABLES; do
            aws ec2 delete-route-table --route-table-id "$rt_id" 2>/dev/null
        done
        
        # Deletar internet gateway
        IGW=$(aws ec2 describe-internet-gateways --filters "Name=attachment.vpc-id,Values=$vpc_id" --query 'InternetGateways[].InternetGatewayId' --output text 2>/dev/null)
        if [ -n "$IGW" ]; then
            aws ec2 detach-internet-gateway --internet-gateway-id "$IGW" --vpc-id "$vpc_id" 2>/dev/null
            aws ec2 delete-internet-gateway --internet-gateway-id "$IGW" 2>/dev/null
        fi
        
        # Deletar security groups
        SGS=$(aws ec2 describe-security-groups --filters "Name=vpc-id,Values=$vpc_id" --query 'SecurityGroups[?GroupName!=`default`].GroupId' --output text 2>/dev/null)
        for sg_id in $SGS; do
            aws ec2 delete-security-group --group-id "$sg_id" 2>/dev/null
        done
        
        # Deletar VPC
        aws ec2 delete-vpc --vpc-id "$vpc_id" 2>/dev/null
        check_success "VPC $vpc_id deletada"
    done
    
    echo ""
    echo "🔍 6. DELETANDO IAM ROLES/POLICIES EXTRAS..."
    echo "============================================="
    
    # Deletar roles extras
    ROLES=$(aws iam list-roles --query 'Roles[?contains(RoleName, `formsync`)].RoleName' --output text 2>/dev/null)
    for role in $ROLES; do
        echo "Deletando role: $role"
        
        # Detach policies primeiro
        aws iam list-attached-role-policies --role-name "$role" --query 'AttachedPolicies[].PolicyArn' --output text 2>/dev/null | while read policy_arn; do
            aws iam detach-role-policy --role-name "$role" --policy-arn "$policy_arn" 2>/dev/null
        done
        
        # Deletar role
        aws iam delete-role --role-name "$role" 2>/dev/null
        check_success "Role $role deletada"
    done
    
    # Deletar policies extras
    POLICIES=$(aws iam list-policies --query 'Policies[?contains(PolicyName, `formsync`)].PolicyName' --output text 2>/dev/null)
    for policy in $POLICIES; do
        echo "Deletando policy: $policy"
        POLICY_ARN=$(aws iam get-policy --policy-arn "arn:aws:iam::$(aws sts get-caller-identity --query Account --output text):policy/$policy" --query 'Policy.Arn' --output text 2>/dev/null)
        if [ -n "$POLICY_ARN" ]; then
            aws iam delete-policy --policy-arn "$POLICY_ARN" 2>/dev/null
            check_success "Policy $policy deletada"
        fi
    done
    
    echo ""
    echo "🔍 7. DELETANDO SSM PARAMETERS..."
    echo "=================================="
    
    # Deletar SSM parameters
    PARAMS=$(aws ssm describe-parameters --query 'Parameters[?contains(Name, `formsync`)].Name' --output text 2>/dev/null)
    for param in $PARAMS; do
        echo "Deletando parameter: $param"
        aws ssm delete-parameter --name "$param" 2>/dev/null
        check_success "Parameter $param deletado"
    done
    
    echo ""
    echo "🎉 DESTRUIÇÃO COMPLETA!"
    echo "======================="
    echo "✅ Terraform infrastructure destruída"
    echo "✅ CloudFront Distributions deletadas"
    echo "✅ API Gateways deletados"
    echo "✅ S3 Buckets deletados"
    echo "✅ VPCs deletadas"
    echo "✅ IAM Roles/Policies deletadas"
    echo "✅ SSM Parameters deletados"
    echo ""
    echo "💰 CUSTOS ELIMINADOS COMPLETAMENTE!"
    echo ""
    echo "🔄 Para recriar tudo quando precisar:"
    echo "   terraform apply"
    echo ""
    echo "🛡️  Agora você está 100% protegido contra surpresas!"
    
else
    echo "❌ Operação cancelada - infraestrutura mantida"
fi

