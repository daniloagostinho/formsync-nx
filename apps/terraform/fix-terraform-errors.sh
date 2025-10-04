#!/bin/bash

# Script principal para resolver erros do Terraform
# Este script executa todos os passos necessários para corrigir os problemas

set -e

echo "🚀 FormSync - Correção de Erros do Terraform"
echo "=============================================="
echo ""

# Verificar se estamos no diretório correto
if [ ! -f "terraform.tfvars" ]; then
    echo "❌ Erro: Execute este script no diretório terraform/"
    exit 1
fi

# Verificar se AWS CLI está configurado
if ! aws sts get-caller-identity >/dev/null 2>&1; then
    echo "❌ Erro: AWS CLI não está configurado ou não tem permissões"
    echo "💡 Execute: aws configure"
    exit 1
fi

echo "✅ AWS CLI configurado corretamente"
echo ""

# Tornar scripts executáveis
chmod +x import-existing-resources.sh
chmod +x fix-vpc-limit.sh

echo "📋 Problemas identificados:"
echo "1. Recursos já existem na AWS (IAM roles, policies, ECR, CloudWatch)"
echo "2. Limite de VPC excedido"
echo ""

echo "🎯 Soluções disponíveis:"
echo "1. Importar recursos existentes"
echo "2. Resolver problema de VPC"
echo "3. Executar terraform plan para verificar"
echo ""

read -p "Deseja executar todas as correções automaticamente? (y/n): " auto_fix

if [ "$auto_fix" = "y" ] || [ "$auto_fix" = "Y" ]; then
    echo ""
    echo "🔧 Executando correções automáticas..."
    echo ""
    
    # Passo 1: Importar recursos existentes
    echo "📥 Passo 1: Importando recursos existentes..."
    ./import-existing-resources.sh
    
    echo ""
    echo "🔍 Passo 2: Verificando VPCs..."
    ./fix-vpc-limit.sh
    
    echo ""
    echo "📊 Passo 3: Executando terraform plan..."
    terraform plan
    
    echo ""
    echo "✅ Correções aplicadas!"
    echo ""
    echo "📋 Próximos passos:"
    echo "1. Se o terraform plan mostrar diferenças, ajuste a configuração"
    echo "2. Execute 'terraform apply' quando estiver satisfeito"
    echo "3. Se ainda houver problemas de VPC, use o arquivo vpc-existing.tf.example"
    
else
    echo ""
    echo "🎛️  Modo interativo selecionado"
    echo ""
    echo "Escolha uma opção:"
    echo "1. Importar recursos existentes"
    echo "2. Resolver problema de VPC"
    echo "3. Executar terraform plan"
    echo "4. Sair"
    echo ""
    
    read -p "Digite sua escolha (1-4): " choice
    
    case $choice in
        1)
            echo "📥 Importando recursos existentes..."
            ./import-existing-resources.sh
            ;;
        2)
            echo "🔍 Resolvendo problema de VPC..."
            ./fix-vpc-limit.sh
            ;;
        3)
            echo "📊 Executando terraform plan..."
            terraform plan
            ;;
        4)
            echo "👋 Saindo..."
            exit 0
            ;;
        *)
            echo "❌ Opção inválida"
            exit 1
            ;;
    esac
fi

echo ""
echo "🎉 Script concluído!"
echo ""
echo "💡 Dicas importantes:"
echo "- Sempre execute 'terraform plan' antes de 'terraform apply'"
echo "- Se houver diferenças após importar, ajuste a configuração"
echo "- Para VPC, considere usar uma existente em vez de criar nova"
echo "- Mantenha backups do estado do Terraform"
