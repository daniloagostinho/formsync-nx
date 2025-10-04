#!/bin/bash

echo "🧹 LIMPEZA DE BUCKETS S3 - ECONOMIA DE CUSTOS"
echo "=============================================="

# Buckets para deletar
BUCKETS_TO_DELETE=(
    "formsync-backend-5fx2o5rz"
    "formsync-frontend-5fx2o5rz"
    "formsync-backend-9dv7k14d"
    "formsync-frontend-9dv7k14d"
    "formsync-backend-dudccqv4"
    "formsync-frontend-dudccqv4"
    "formsync-backend-gqbma9zh"
    "formsync-frontend-gqbma9zh"
    "formsync-backend-hp4jkmhy"
    "formsync-frontend-hp4jkmhy"
    "formsync-backend-kiny7rvv"
    "formsync-frontend-kiny7rvv"
)

echo "📋 Buckets que serão deletados:"
for bucket in "${BUCKETS_TO_DELETE[@]}"; do
    echo "  - $bucket"
done

echo ""
echo "⚠️  ATENÇÃO: Esta operação é IRREVERSÍVEL!"
echo "💰 Você economizará aproximadamente 80% dos custos de S3"
echo ""

read -p "Deseja continuar? (y/N): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🗑️  Iniciando limpeza..."
    
    for bucket in "${BUCKETS_TO_DELETE[@]}"; do
        echo "Deletando bucket: $bucket"
        
        # Verificar se o bucket existe
        if aws s3 ls "s3://$bucket" 2>/dev/null; then
            # Deletar todos os objetos primeiro
            aws s3 rm "s3://$bucket" --recursive
            
            # Deletar o bucket
            aws s3api delete-bucket --bucket "$bucket"
            
            if [ $? -eq 0 ]; then
                echo "✅ Bucket $bucket deletado com sucesso"
            else
                echo "❌ Erro ao deletar bucket $bucket"
            fi
        else
            echo "⚠️  Bucket $bucket não existe ou já foi deletado"
        fi
        
        echo ""
    done
    
    echo "🎉 Limpeza concluída!"
    echo "💰 Você economizou aproximadamente 80% dos custos de S3"
    
else
    echo "❌ Operação cancelada"
fi

echo ""
echo "📊 Buckets restantes (ativos):"
echo "  ✅ formsync-frontend-mr6zfe1c (Terraform)"
echo "  ✅ formsync-backend-mr6zfe1c (Terraform)"
echo "  ✅ formsync.com.br-static-prod (Produção)"

