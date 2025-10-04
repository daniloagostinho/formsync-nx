#!/bin/bash

# Script para iniciar o FormSync Backend em modo LOCAL com variáveis de ambiente

echo "🚀 Iniciando FormSync Backend em modo LOCAL..."
echo "🔧 Carregando variáveis de ambiente..."

# Carregar variáveis de ambiente do arquivo env.local
if [ -f "env.local" ]; then
    echo "📄 Carregando variáveis de env.local..."
    export $(cat env.local | grep -v '^#' | xargs)
else
    echo "⚠️  Arquivo env.local não encontrado. Usando valores padrão..."
    export DB_PASSWORD=postgres123
    export SPRING_DATASOURCE_USERNAME=postgres
    export SPRING_DATASOURCE_PASSWORD=postgres123
    export MAIL_USERNAME=""
    export MAIL_PASSWORD=""
    export STRIPE_SECRET_KEY=""
    export STRIPE_PUBLISHABLE_KEY=""
    export STRIPE_WEBHOOK_SECRET=""
fi

echo "🔧 Iniciando aplicação com perfil 'local'..."
echo "💡 Para parar a aplicação, pressione Ctrl+C"

# Executar a aplicação
./mvnw spring-boot:run -Dspring-boot.run.profiles=local
