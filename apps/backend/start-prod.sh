#!/bin/bash

# Script para iniciar o backend em modo produção
echo "🚀 Iniciando FormSync Backend em modo PRODUÇÃO..."

# Verificar se o Maven está disponível
if ! command -v ./mvnw &> /dev/null; then
    echo "❌ Maven wrapper não encontrado. Execute este script do diretório raiz do projeto."
    exit 1
fi

# Verificar se as variáveis de ambiente necessárias estão definidas
if [ -z "$DATABASE_URL" ] && [ -z "$DB_PASSWORD" ]; then
    echo "❌ Variáveis de ambiente do banco não configuradas"
    echo "💡 Configure as seguintes variáveis:"
    echo "   export DATABASE_URL='jdbc:postgresql://your_host:5432/your_database'"
    echo "   export DB_USERNAME='postgres'"
    echo "   export DB_PASSWORD='your_password'"
    echo "   export STRIPE_SECRET_KEY='sk_live_...'"
    echo "   export STRIPE_WEBHOOK_SECRET='whsec_...'"
    echo "   export STRIPE_PUBLISHABLE_KEY='pk_live_...'"
    exit 1
fi

echo "✅ Variáveis de ambiente configuradas"
echo "🔧 Iniciando aplicação com perfil 'prod'..."
echo "💡 Para parar a aplicação, pressione Ctrl+C"

# Iniciar a aplicação com perfil prod
./mvnw spring-boot:run -Dspring-boot.run.profiles=prod -Dspring-boot.run.jvmArguments="-Xmx1g -Xms512m"

