# Guia de Correção de Erros do Terraform

Este guia resolve os erros específicos encontrados no pipeline do FormSync.

## 🚨 Problemas Identificados

### 1. Recursos Já Existem (EntityAlreadyExists)
- **IAM Roles**: `formsync-lambda-role`, `formsync-ecs-execution-role`, `formsync-ecs-task-role`
- **IAM Policies**: `formsync-apigateway-policy`, `formsync-ssm-policy`, `formsync-iam-policy`, `formsync-ecs-policy`
- **ECR Repository**: `formsync-backend`
- **CloudWatch Log Group**: `/ecs/formsync-backend`

### 2. Limite de VPC Excedido
- **Erro**: `VpcLimitExceeded: The maximum number of VPCs has been reached`

## 🛠️ Soluções

### Solução Rápida (Recomendada)

Execute o script principal:

```bash
cd terraform/
chmod +x fix-terraform-errors.sh
./fix-terraform-errors.sh
```

### Solução Manual

#### Passo 1: Importar Recursos Existentes

```bash
# Tornar script executável
chmod +x import-existing-resources.sh

# Executar importação
./import-existing-resources.sh
```

#### Passo 2: Resolver Problema de VPC

```bash
# Tornar script executável
chmod +x fix-vpc-limit.sh

# Executar correção de VPC
./fix-vpc-limit.sh
```

#### Passo 3: Verificar Estado

```bash
terraform plan
```

## 📋 Comandos de Importação Individual

Se preferir importar manualmente:

```bash
# IAM Roles
terraform import aws_iam_role.lambda_role formsync-lambda-role
terraform import aws_iam_role.ecs_execution_role formsync-ecs-execution-role
terraform import aws_iam_role.ecs_task_role formsync-ecs-task-role

# IAM Policies
terraform import aws_iam_policy.formsync_apigateway_policy arn:aws:iam::503561419285:policy/formsync-apigateway-policy
terraform import aws_iam_policy.formsync_ssm_policy arn:aws:iam::503561419285:policy/formsync-ssm-policy
terraform import aws_iam_policy.formsync_iam_policy arn:aws:iam::503561419285:policy/formsync-iam-policy
terraform import aws_iam_policy.formsync_ecs_policy arn:aws:iam::503561419285:policy/formsync-ecs-policy

# ECR Repository
terraform import aws_ecr_repository.formsync_backend formsync-backend

# CloudWatch Log Group
terraform import aws_cloudwatch_log_group.formsync_backend /ecs/formsync-backend
```

## 🔧 Opções para VPC

### Opção 1: Deletar VPCs Não Utilizadas

```bash
# Listar VPCs
aws ec2 describe-vpcs --query 'Vpcs[*].[VpcId,Tags[?Key==`Name`].Value|[0],CidrBlock,State]' --output table

# Deletar VPC específica (substitua vpc-xxxxxxxxx)
aws ec2 delete-vpc --vpc-id vpc-xxxxxxxxx
```

### Opção 2: Usar VPC Existente

1. Copie o arquivo `vpc-existing.tf.example` para `vpc-existing.tf`
2. Modifique o data source para usar sua VPC:

```hcl
data "aws_vpc" "existing" {
  filter {
    name   = "tag:Name"
    values = ["default"]  # ou nome da sua VPC
  }
}
```

3. Substitua todas as referências de `aws_vpc.main.id` por `data.aws_vpc.existing.id`

### Opção 3: Solicitar Aumento de Quota

1. Acesse [AWS Service Quotas](https://console.aws.amazon.com/servicequotas/home/services/vpc/quotas)
2. Procure por "VPC"
3. Solicite aumento do limite

## 🔍 Verificação Pós-Correção

Após aplicar as correções:

```bash
# Verificar estado
terraform plan

# Se tudo estiver OK, aplicar
terraform apply
```

## ⚠️ Avisos Importantes

1. **Backup**: Sempre faça backup do estado do Terraform antes de importar
2. **Verificação**: Execute `terraform plan` após cada importação
3. **Diferenças**: Se houver diferenças após importar, ajuste a configuração
4. **VPC**: Deletar VPCs pode afetar outros recursos

## 🆘 Troubleshooting

### Erro: "Resource already exists"
- Execute o comando de importação correspondente

### Erro: "VpcLimitExceeded"
- Use uma das opções de VPC acima

### Erro: "Access Denied"
- Verifique permissões do AWS CLI
- Execute `aws configure` se necessário

### Diferenças no terraform plan
- Compare a configuração com o recurso real
- Ajuste tags, políticas ou outras configurações conforme necessário

## 📞 Suporte

Se encontrar problemas:

1. Verifique os logs do script
2. Execute `terraform plan` para identificar diferenças
3. Consulte a documentação do AWS Terraform Provider
4. Verifique permissões IAM

---

**Última atualização**: $(date)
**Versão**: 1.0
