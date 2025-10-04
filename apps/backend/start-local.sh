#!/bin/bash

# Script para iniciar o backend em modo local
echo "🚀 Iniciando FormSync Backend em modo LOCAL..."

# Verificar se o Maven está disponível
if ! command -v ./mvnw &> /dev/null; then
    echo "❌ Maven wrapper não encontrado. Execute este script do diretório raiz do projeto."
    exit 1
fi

# Verificar se a porta 8080 está livre
if lsof -i :8080 > /dev/null 2>&1; then
    echo "⚠️  Porta 8080 já está em uso."
    echo "💡 Pare o processo que está usando a porta 8080 ou use uma porta diferente."
    echo "   Para ver qual processo está usando: lsof -i :8080"
    echo "   Para matar o processo: lsof -ti :8080 | xargs kill -9"
    read -p "Deseja continuar mesmo assim? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "🔧 Iniciando aplicação com perfil 'local'..."
echo "💡 Para parar a aplicação, pressione Ctrl+C"

# Iniciar a aplicação com perfil local
./mvnw spring-boot:run -Dspring-boot.run.profiles=local -Dspring-boot.run.jvmArguments="-Xmx512m -Xms256m"
