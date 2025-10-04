#!/bin/bash

echo "📊 STATUS ATUAL DOS SERVIÇOS AWS"
echo "================================"
echo ""

echo "🔍 1. RDS CLUSTERS:"
echo "==================="
aws rds describe-db-clusters --query 'DBClusters[?contains(DBClusterIdentifier, `formsync`)].{ID:DBClusterIdentifier,Status:Status,Engine:Engine}' --output table 2>/dev/null || echo "❌ Erro ao verificar RDS"

echo ""
echo "🔍 2. CLOUDFRONT DISTRIBUTIONS:"
echo "==============================="
aws cloudfront list-distributions --query 'DistributionList.Items[].{Id:Id,DomainName:DomainName,Status:Status,Enabled:DistributionConfig.Enabled}' --output table 2>/dev/null || echo "❌ Erro ao verificar CloudFront"

echo ""
echo "🔍 3. API GATEWAY:"
echo "=================="
aws apigateway get-rest-apis --query 'items[?contains(name, `formsync`)].{Name:name,Id:id,CreatedDate:createdDate}' --output table 2>/dev/null || echo "❌ Erro ao verificar API Gateway"

echo ""
echo "🔍 4. ECS SERVICES:"
echo "==================="
aws ecs list-services --cluster formsync-backend --query 'serviceArns[]' --output text 2>/dev/null | while read service; do
    if [ -n "$service" ]; then
        aws ecs describe-services --cluster formsync-backend --services "$service" --query 'services[0].{Name:serviceName,Status:status,RunningCount:runningCount,DesiredCount:desiredCount}' --output table
    fi
done || echo "✅ Nenhum serviço ECS ativo"

echo ""
echo "🔍 5. EC2 INSTANCES:"
echo "===================="
aws ec2 describe-instances \
    --filters "Name=tag:Project,Values=formsync" \
    --query 'Reservations[].Instances[].[InstanceId,State.Name,InstanceType,Tags[?Key==`Name`].Value|[0]]' \
    --output table 2>/dev/null || echo "✅ Nenhuma instância EC2 encontrada"

echo ""
echo "🔍 6. LAMBDA FUNCTIONS:"
echo "======================="
aws lambda list-functions \
    --query 'Functions[?contains(FunctionName, `formsync`)].{Name:FunctionName,Runtime:Runtime,State:State}' \
    --output table 2>/dev/null || echo "✅ Nenhuma função Lambda encontrada"

echo ""
echo "🔍 7. S3 BUCKETS (CUSTOS):"
echo "=========================="
aws s3 ls | grep formsync | wc -l | xargs echo "Total de buckets formsync:"
aws s3 ls | grep formsync

echo ""
echo "💰 ESTIMATIVA DE CUSTOS:"
echo "========================"
echo "📊 Para pausar todos os serviços e economizar custos:"
echo "   ./pause-all-services.sh"
echo ""
echo "📊 Para reativar quando precisar:"
echo "   ./resume-all-services.sh"
echo ""
echo "📊 Para limpar buckets duplicados:"
echo "   ./cleanup-buckets.sh"

