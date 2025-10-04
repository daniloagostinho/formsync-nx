# 🚀 **Guia Completo de Comandos NX - FormSync**

## 📋 **Visão Geral**

Este guia contém todos os comandos essenciais para trabalhar com o monorepo FormSync usando NX. Os comandos estão organizados por categoria para facilitar o uso.

---

## 🏗️ **Comandos de Build**

### **Build Todos os Projetos**
```bash
# Build todos os projetos
npm run build
# ou
nx run-many --target=build --all

# Build apenas projetos afetados (recomendado)
npm run build:affected
# ou
nx affected --target=build
```

### **Build Projetos Específicos**
```bash
# Build frontend Angular
nx build front

# Build backend Spring Boot
nx build backend

# Build extensões
nx build chrome-extension
nx build firefox-extension

# Build bibliotecas compartilhadas
nx build shared-types
nx build shared-utils
```

### **Build com Configurações**
```bash
# Build frontend para produção
nx build front --configuration=production

# Build frontend para desenvolvimento
nx build front --configuration=development
```

---

## 🧪 **Comandos de Teste**

### **Testar Todos os Projetos**
```bash
# Testar todos os projetos
npm run test
# ou
nx run-many --target=test --all

# Testar apenas projetos afetados (recomendado)
npm run test:affected
# ou
nx affected --target=test
```

### **Testar Projetos Específicos**
```bash
# Testar frontend
nx test front

# Testar backend
nx test backend

# Testar bibliotecas
nx test shared-types
nx test shared-utils
```

---

## 🔍 **Comandos de Lint**

### **Lint Todos os Projetos**
```bash
# Lint todos os projetos
npm run lint
# ou
nx run-many --target=lint --all

# Lint apenas projetos afetados (recomendado)
npm run lint:affected
# ou
nx affected --target=lint
```

### **Lint Projetos Específicos**
```bash
# Lint frontend
nx lint front

# Lint backend
nx lint backend
```

---

## 🚀 **Comandos de Servir/Desenvolvimento**

### **Servir Todos os Projetos**
```bash
# Servir todos os projetos
npm run serve
# ou
nx run-many --target=serve --all
```

### **Servir Projetos Específicos**
```bash
# Servir frontend Angular
npm run serve:front
# ou
nx serve front

# Servir backend Spring Boot
npm run serve:backend
# ou
nx serve backend
```

### **Servir com Configurações**
```bash
# Servir frontend em modo desenvolvimento
nx serve front --configuration=development

# Servir frontend em modo produção
nx serve front --configuration=production
```

---

## 🚀 **Comandos de Deploy**

### **Deploy Completo**
```bash
# Deploy de todos os projetos
npm run deploy:all
# ou
nx run-many --target=deploy --all
```

### **Deploy por Categoria**
```bash
# Deploy infraestrutura (Terraform)
npm run deploy:infra
# ou
nx run terraform:deploy

# Deploy frontend
npm run deploy:frontend
# ou
nx run front:deploy

# Deploy backend
npm run deploy:backend
# ou
nx run backend:deploy

# Deploy extensões
npm run deploy:extensions
# ou
nx run-many --target=deploy --projects=chrome-extension,firefox-extension
```

### **Deploy Projetos Específicos**
```bash
# Deploy extensão Chrome
nx run chrome-extension:deploy

# Deploy extensão Firefox
nx run firefox-extension:deploy
```

---

## 🏗️ **Comandos de Infraestrutura (Terraform)**

### **Comandos Básicos**
```bash
# Inicializar Terraform
nx run terraform:init

# Validar configuração
nx run terraform:validate

# Formatar código
nx run terraform:format

# Ver plano de execução
nx run terraform:plan

# Aplicar mudanças
nx run terraform:apply

# Destruir infraestrutura
nx run terraform:destroy

# Ver outputs
nx run terraform:output
```

### **Deploy Completo de Infraestrutura**
```bash
# Deploy completo (init + validate + plan + apply)
nx run terraform:deploy
```

---

## 🐳 **Comandos de Docker (Backend)**

### **Build e Push**
```bash
# Build imagem Docker
nx run backend:docker-build

# Push para ECR
nx run backend:docker-push

# Deploy completo (build + push)
nx run backend:deploy
```

---

## 📦 **Comandos de Extensões**

### **Build e Package**
```bash
# Build extensão Chrome
nx build chrome-extension

# Package extensão Chrome
nx run chrome-extension:package

# Deploy extensão Chrome
nx run chrome-extension:deploy

# Build extensão Firefox
nx build firefox-extension

# Package extensão Firefox
nx run firefox-extension:package

# Deploy extensão Firefox
nx run firefox-extension:deploy
```

---

## 🔧 **Comandos de Formatação**

### **Formatação de Código**
```bash
# Formatar todo o código
npm run format
# ou
nx format:write

# Verificar formatação
npm run format:check
# ou
nx format:check
```

---

## 📊 **Comandos de Visualização**

### **Gráfico de Dependências**
```bash
# Abrir gráfico interativo
npm run graph
# ou
nx graph

# Gerar gráfico estático
nx graph --file=graph.html
```

### **Informações do Workspace**
```bash
# Listar todos os projetos
nx list

# Ver informações de um projeto
nx show project front
nx show project backend

# Ver configuração de um target
nx show project front --web
```

---

## 🎯 **Comandos de Projetos Afetados**

### **Trabalhar com Mudanças**
```bash
# Ver projetos afetados
nx affected:graph

# Build apenas projetos afetados
nx affected --target=build

# Testar apenas projetos afetados
nx affected --target=test

# Lint apenas projetos afetados
nx affected --target=lint

# Deploy apenas projetos afetados
nx affected --target=deploy
```

### **Comparar com Branch**
```bash
# Comparar com branch main
nx affected --target=build --base=main

# Comparar com commit específico
nx affected --target=build --base=abc123
```

---

## 🔄 **Comandos de Reset e Limpeza**

### **Limpeza de Cache**
```bash
# Resetar cache do NX
npm run reset
# ou
nx reset

# Limpar cache específico
nx reset --clear-cache
```

---

## 🚀 **Fluxos de Trabalho Recomendados**

### **Desenvolvimento Diário**
```bash
# 1. Verificar projetos afetados
nx affected:graph

# 2. Build apenas o que mudou
nx affected --target=build

# 3. Testar apenas o que mudou
nx affected --target=test

# 4. Servir para desenvolvimento
nx serve front
nx serve backend
```

### **Antes do Commit**
```bash
# 1. Formatar código
nx format:write

# 2. Lint todos os projetos afetados
nx affected --target=lint

# 3. Testar todos os projetos afetados
nx affected --target=test

# 4. Build todos os projetos afetados
nx affected --target=build
```

### **Deploy para Produção**
```bash
# 1. Deploy infraestrutura primeiro
nx run terraform:deploy

# 2. Deploy frontend
nx run front:deploy

# 3. Deploy backend
nx run backend:deploy

# 4. Deploy extensões
nx run-many --target=deploy --projects=chrome-extension,firefox-extension
```

### **Deploy Completo**
```bash
# Deploy tudo de uma vez
nx run-many --target=deploy --all
```

---

## 🎯 **Dicas e Truques**

### **Paralelização**
```bash
# Executar comandos em paralelo (mais rápido)
nx run-many --target=build --all --parallel=3
nx affected --target=test --parallel=3
```

### **Filtros por Tags**
```bash
# Executar apenas projetos com tag 'frontend'
nx run-many --target=build --projects=tag:frontend

# Executar apenas projetos com tag 'backend'
nx run-many --target=test --projects=tag:backend
```

### **Configurações Personalizadas**
```bash
# Usar configuração específica
nx build front --configuration=staging

# Passar variáveis de ambiente
AWS_REGION=us-west-2 nx run terraform:deploy
```

---

## 🆘 **Comandos de Troubleshooting**

### **Problemas Comuns**
```bash
# Verificar dependências
nx graph

# Resetar cache
nx reset

# Ver logs detalhados
nx build front --verbose

# Verificar configuração
nx show project front
```

### **Debug**
```bash
# Executar com debug
nx build front --verbose --skip-nx-cache

# Ver informações de execução
nx run-many --target=build --all --verbose
```

---

## 📚 **Recursos Adicionais**

- **Documentação NX**: https://nx.dev/
- **Comandos NX**: `nx --help`
- **Ajuda específica**: `nx build --help`
- **Gráfico interativo**: `nx graph`

---

## 🎉 **Conclusão**

Este guia cobre todos os comandos essenciais para trabalhar com o monorepo FormSync. Use os comandos de "affected" sempre que possível para maior eficiência, e lembre-se de que o NX é inteligente o suficiente para executar apenas o que precisa ser executado!

**Comandos mais usados:**
- `nx affected --target=build` - Build inteligente
- `nx serve front` - Desenvolvimento frontend
- `nx serve backend` - Desenvolvimento backend
- `nx run terraform:deploy` - Deploy infraestrutura
- `nx graph` - Visualizar dependências

