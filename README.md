# 🚀 **FormSync NX Monorepo**

> **Sistema completo de sincronização de formulários com arquitetura moderna e CI/CD automatizado**

## 📋 **Visão Geral**

O FormSync é um sistema full-stack que permite capturar, gerenciar e sincronizar formulários web através de extensões de navegador, frontend Angular e backend Spring Boot, tudo orquestrado com NX em um monorepo unificado.

## 🏗️ **Arquitetura do Monorepo**

```
formsync-nx/
├── apps/
│   ├── front/                    # 🌐 Angular Frontend
│   ├── backend/                  # 🚀 Spring Boot Backend
│   ├── chrome-extension/         # 🌐 Chrome Extension
│   ├── firefox-extension/        # 🦊 Firefox Extension
│   └── terraform/                # 🏗️ Infrastructure as Code
├── libs/
│   ├── shared-types/             # 📝 TypeScript Types
│   ├── shared-utils/             # 🔧 Utilities
│   └── shared-ui/                # 🎨 UI Components
└── tools/                        # 🛠️ Build Tools
```

## 🚀 **Quick Start**

### **Pré-requisitos**
- Node.js 20+
- Java 21+
- Docker
- AWS CLI
- Terraform

### **Instalação**
```bash
# Clone o repositório
git clone <repository-url>
cd formsync-nx

# Instalar dependências
npm install

# Verificar instalação
nx list
```

### **Desenvolvimento Local**
```bash
# Servir frontend
nx serve front

# Servir backend
nx serve backend

# Build todos os projetos
nx run-many --target=build --all
```

## 🎯 **Projetos**

### **🌐 Frontend (Angular)**
- **Tecnologia**: Angular 20+ com Angular Material
- **Localização**: `apps/front/`
- **Comandos**:
  ```bash
  nx serve front          # Desenvolvimento
  nx build front          # Build produção
  nx test front           # Testes
  nx lint front           # Lint
  ```

### **🚀 Backend (Spring Boot)**
- **Tecnologia**: Spring Boot + Java 21
- **Localização**: `apps/backend/`
- **Comandos**:
  ```bash
  nx serve backend        # Desenvolvimento
  nx build backend        # Build Maven
  nx test backend         # Testes
  nx run backend:docker-build  # Docker build
  ```

### **🔌 Extensões de Navegador**
- **Chrome Extension**: `apps/chrome-extension/`
- **Firefox Extension**: `apps/firefox-extension/`
- **Comandos**:
  ```bash
  nx build chrome-extension      # Build Chrome
  nx build firefox-extension    # Build Firefox
  nx run chrome-extension:package   # Package Chrome
  nx run firefox-extension:package  # Package Firefox
  ```

### **🏗️ Infraestrutura (Terraform)**
- **Localização**: `apps/terraform/`
- **Comandos**:
  ```bash
  nx run terraform:init    # Inicializar
  nx run terraform:plan    # Ver plano
  nx run terraform:apply   # Aplicar
  nx run terraform:deploy  # Deploy completo
  ```

## 📦 **Bibliotecas Compartilhadas**

### **📝 shared-types**
- Interfaces TypeScript compartilhadas
- Tipos para User, FormData, FormResponse, etc.
- Usado em frontend, backend e extensões

### **🔧 shared-utils**
- Utilitários comuns
- Validação, formatação, debounce, etc.
- Funções reutilizáveis

### **🎨 shared-ui**
- Componentes UI compartilhados
- Design system unificado

## 🔄 **CI/CD Pipeline**

O pipeline automatizado executa:

1. **Build & Test** - Build e teste de projetos afetados
2. **Deploy Infrastructure** - Terraform apply
3. **Deploy Frontend** - Build Angular + Deploy S3 + CloudFront
4. **Deploy Backend** - Build Docker + Push ECR + Update ECS
5. **Build Extensions** - Package Chrome/Firefox extensions

### **Comandos de Deploy**
```bash
# Deploy completo
npm run deploy:all

# Deploy por categoria
npm run deploy:infra      # Infraestrutura
npm run deploy:frontend   # Frontend
npm run deploy:backend    # Backend
npm run deploy:extensions # Extensões
```

## 🎯 **Comandos Essenciais**

### **Desenvolvimento**
```bash
# Servir projetos
nx serve front
nx serve backend

# Build projetos afetados
nx affected --target=build

# Testar projetos afetados
nx affected --target=test
```

### **Deploy**
```bash
# Deploy infraestrutura
nx run terraform:deploy

# Deploy frontend
nx run front:deploy

# Deploy backend
nx run backend:deploy
```

### **Visualização**
```bash
# Gráfico de dependências
nx graph

# Projetos afetados
nx affected:graph
```

## 🏗️ **Infraestrutura AWS**

### **Serviços Utilizados**
- **S3 + CloudFront**: Frontend Angular
- **ECS Fargate**: Backend Spring Boot
- **RDS Aurora**: PostgreSQL
- **API Gateway**: Proxy para backend
- **ECR**: Registry Docker

### **Deploy de Infraestrutura**
```bash
# Deploy completo
nx run terraform:deploy

# Comandos individuais
nx run terraform:init
nx run terraform:plan
nx run terraform:apply
```

## 🐳 **Docker**

### **Desenvolvimento Local**
```bash
# Backend com Docker Compose
cd apps/backend
docker-compose up -d
```

### **Produção**
```bash
# Build imagem Docker
nx run backend:docker-build

# Push para ECR
nx run backend:docker-push
```

## 📚 **Documentação**

- **[Guia de Comandos NX](./NX_COMMANDS_GUIDE.md)** - Comandos completos
- **[Arquitetura Detalhada](./arquitetura-diagrama.md)** - Diagrama da arquitetura
- **[Setup Local](./setup.md)** - Configuração de desenvolvimento

## 🛠️ **Scripts NPM**

```bash
# Build
npm run build              # Build todos
npm run build:affected     # Build afetados

# Test
npm run test              # Teste todos
npm run test:affected     # Teste afetados

# Lint
npm run lint              # Lint todos
npm run lint:affected     # Lint afetados

# Serve
npm run serve             # Servir todos
npm run serve:front       # Servir frontend
npm run serve:backend     # Servir backend

# Deploy
npm run deploy:all        # Deploy completo
npm run deploy:infra      # Deploy infraestrutura
npm run deploy:frontend   # Deploy frontend
npm run deploy:backend    # Deploy backend
npm run deploy:extensions # Deploy extensões

# Utilitários
npm run format            # Formatar código
npm run graph             # Gráfico de dependências
npm run reset             # Resetar cache
```

## 🎯 **Fluxos de Trabalho**

### **Desenvolvimento Diário**
1. `nx affected:graph` - Ver mudanças
2. `nx affected --target=build` - Build inteligente
3. `nx serve front` - Desenvolvimento frontend
4. `nx serve backend` - Desenvolvimento backend

### **Antes do Commit**
1. `nx format:write` - Formatar código
2. `nx affected --target=lint` - Lint
3. `nx affected --target=test` - Testes
4. `nx affected --target=build` - Build

### **Deploy Produção**
1. `nx run terraform:deploy` - Infraestrutura
2. `nx run front:deploy` - Frontend
3. `nx run backend:deploy` - Backend
4. `nx run-many --target=deploy --projects=chrome-extension,firefox-extension` - Extensões

## 🆘 **Troubleshooting**

### **Problemas Comuns**
```bash
# Resetar cache
nx reset

# Ver dependências
nx graph

# Debug verbose
nx build front --verbose
```

### **Comandos de Debug**
```bash
# Ver informações do projeto
nx show project front

# Ver configuração de target
nx show project front --web

# Executar sem cache
nx build front --skip-nx-cache
```

## 📈 **Benefícios do NX**

✅ **Build Inteligente** - Só executa o que mudou  
✅ **Cache Distribuído** - Builds mais rápidos  
✅ **Dependências Automáticas** - Ordem de execução correta  
✅ **Paralelização** - Execução simultânea  
✅ **Visualização** - Gráfico de dependências  
✅ **CI/CD Otimizado** - Pipelines eficientes  

## 🤝 **Contribuição**

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📄 **Licença**

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🎉 **Conclusão**

O FormSync NX Monorepo oferece uma arquitetura moderna, escalável e eficiente para desenvolvimento full-stack. Com NX, você tem:

- **Orquestração unificada** de todos os projetos
- **Build inteligente** que executa apenas o necessário
- **CI/CD otimizado** com pipelines eficientes
- **Desenvolvimento local** simplificado
- **Deploy automatizado** de toda a stack

**Comece agora**: `nx serve front` e `nx serve backend` para desenvolvimento local!

