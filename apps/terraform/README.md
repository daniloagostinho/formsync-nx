# FormSync Infrastructure

Este diretório contém a infraestrutura como código (IaC) para o projeto FormSync usando Terraform.

## Estrutura

- `main.tf` - Configuração principal do Terraform
- `variables.tf` - Variáveis do Terraform
- `outputs.tf` - Outputs do Terraform
- `vpc.tf` - Configuração da VPC e subnets
- `terraform.tfvars.example` - Exemplo de configuração

## Como usar

1. Copie o arquivo de exemplo:
   ```bash
   cp terraform.tfvars.example terraform.tfvars
   ```

2. Edite o arquivo `terraform.tfvars` com suas configurações

3. Inicialize o Terraform:
   ```bash
   terraform init
   ```

4. Planeje as mudanças:
   ```bash
   terraform plan
   ```

5. Aplique as mudanças:
   ```bash
   terraform apply
   ```

## Recursos criados

- VPC com subnets públicas e privadas
- Internet Gateway
- NAT Gateways
- Route Tables
- Security Groups (quando adicionados)

## Notas

- Certifique-se de ter as credenciais AWS configuradas
- O Terraform criará recursos na região especificada
- Sempre revise o plano antes de aplicar
