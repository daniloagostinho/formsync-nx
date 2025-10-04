#!/bin/bash

echo "🔍 VERIFICANDO SE TUDO FOI DELETADO"
echo "===================================="
echo ""

echo "🔍 1. VERIFICANDO TERRAFORM STATE..."
echo "====================================="
if [ -f "terraform.tfstate" ]; then
    echo "❌ Terraform state ainda existe"
    echo "💡 Execute: terraform destroy -auto-approve"
else
    echo "✅ Terraform state limpo"
fi

echo ""
echo "🔍 2. VERIFICANDO S3 BUCKETS..."
echo "==============================="
BUCKETS=$(aws s3 ls | grep formsync | wc -l)
if [ "$BUCKETS" -gt 0 ]; then
    echo "❌ Ainda existem $BUCKETS buckets formsync:"
    aws s3 ls | grep formsync
else
    echo "✅ Nenhum bucket formsync encontrado"
fi

echo ""
echo "🔍 3. VERIFICANDO CLOUDFRONT..."
echo "==============================="
DISTRIBUTIONS=$(aws cloudfront list-distributions --query 'DistributionList.Items | length(@)' --output text 2>/dev/null)
if [ "$DISTRIBUTIONS" -gt 0 ]; then
    echo "❌ Ainda existem $DISTRIBUTIONS distribuições CloudFront"
    aws cloudfront list-distributions --query 'DistributionList.Items[].{Id:Id,DomainName:DomainName}' --output table
else
    echo "✅ Nenhuma distribuição CloudFront encontrada"
fi

echo ""
echo "🔍 4. VERIFICANDO API GATEWAY..."
echo "================================="
APIS=$(aws apigateway get-rest-apis --query 'items | length(@)' --output text 2>/dev/null)
if [ "$APIS" -gt 0 ]; then
    echo "❌ Ainda existem $APIS APIs Gateway"
    aws apigateway get-rest-apis --query 'items[].{Name:name,Id:id}' --output table
else
    echo "✅ Nenhuma API Gateway encontrada"
fi

echo ""
echo "🔍 5. VERIFICANDO VPCs..."
echo "========================="
VPCS=$(aws ec2 describe-vpcs --query 'Vpcs[?Tags[?Key==`Project` && Value==`formsync`]] | length(@)' --output text 2>/dev/null)
if [ "$VPCS" -gt 0 ]; then
    echo "❌ Ainda existem $VPCS VPCs formsync"
    aws ec2 describe-vpcs --query 'Vpcs[?Tags[?Key==`Project` && Value==`formsync`]].[VpcId,Tags[?Key==`Name`].Value|[0]]' --output table
else
    echo "✅ Nenhuma VPC formsync encontrada"
fi

echo ""
echo "🔍 6. VERIFICANDO RDS..."
echo "========================"
RDS_CLUSTERS=$(aws rds describe-db-clusters --query 'DBClusters[?contains(DBClusterIdentifier, `formsync`)] | length(@)' --output text 2>/dev/null)
if [ "$RDS_CLUSTERS" -gt 0 ]; then
    echo "❌ Ainda existem $RDS_CLUSTERS clusters RDS formsync"
    aws rds describe-db-clusters --query 'DBClusters[?contains(DBClusterIdentifier, `formsync`)].DBClusterIdentifier' --output table
else
    echo "✅ Nenhum cluster RDS formsync encontrado"
fi

echo ""
echo "🔍 7. VERIFICANDO IAM ROLES..."
echo "=============================="
ROLES=$(aws iam list-roles --query 'Roles[?contains(RoleName, `formsync`)] | length(@)' --output text 2>/dev/null)
if [ "$ROLES" -gt 0 ]; then
    echo "❌ Ainda existem $ROLES roles formsync"
    aws iam list-roles --query 'Roles[?contains(RoleName, `formsync`)].RoleName' --output table
else
    echo "✅ Nenhuma role formsync encontrada"
fi

echo ""
echo "🔍 8. VERIFICANDO SSM PARAMETERS..."
echo "==================================="
PARAMS=$(aws ssm describe-parameters --query 'Parameters[?contains(Name, `formsync`)] | length(@)' --output text 2>/dev/null)
if [ "$PARAMS" -gt 0 ]; then
    echo "❌ Ainda existem $PARAMS parâmetros SSM formsync"
    aws ssm describe-parameters --query 'Parameters[?contains(Name, `formsync`)].Name' --output table
else
    echo "✅ Nenhum parâmetro SSM formsync encontrado"
fi

echo ""
echo "💰 RESUMO DA VERIFICAÇÃO:"
echo "========================="
echo "📊 Se todos os itens acima mostram ✅, você está 100% limpo!"
echo "📊 Se algum item mostra ❌, ainda há recursos gerando custos"
echo ""
echo "🔄 Para recriar tudo quando precisar:"
echo "   terraform apply"

