# 💰 Estimativa de Custos AWS - FormSync (OTIMIZADO)

## 📊 CUSTOS MENSALIS ESTIMADOS (USD) - MÁXIMO R$ 100/MÊS

### 🗄️ **RDS Serverless v2 (Aurora PostgreSQL)**
- **Tipo:** Aurora Serverless v2
- **Min/Max ACU:** 0.5 ACU (muito barato)
- **Paga apenas quando usa**
- **Custo:** ~$5-10/mês

### 🌐 **API Gateway (substitui ALB + ECS)**
- **Tipo:** REST API Gateway
- **Requests:** Pay-per-request
- **Custo:** ~$1-3/mês (para desenvolvimento)

### 📦 **S3 + CloudFront**
- **S3 Storage:** ~$0.50-1/mês
- **CloudFront:** ~$1-3/mês (dependendo do tráfego)
- **Total S3+CF:** ~$1.50-4/mês

### 🔒 **VPC (sem NAT Gateway)**
- **VPC:** Gratuito
- **Internet Gateway:** Gratuito
- **Subnets:** Gratuito
- **Custo:** ~$0/mês

### 📊 **CloudWatch Logs**
- **Retenção:** 7 dias
- **Custo:** ~$0.50-2/mês

### 🔐 **SSM Parameter Store**
- **Parâmetros:** ~$0.10/mês

---

## 💵 **TOTAL ESTIMADO MENSAL (OTIMIZADO)**

| Serviço | Custo (USD) | Custo (BRL) |
|---------|-------------|-------------|
| RDS Serverless | $5-10 | R$ 25-50 |
| API Gateway | $1-3 | R$ 5-15 |
| S3 + CloudFront | $1.50-4 | R$ 7.50-20 |
| VPC | $0 | R$ 0 |
| CloudWatch | $0.50-2 | R$ 2.50-10 |
| SSM | $0.10 | R$ 0.50 |
| **TOTAL** | **$8-19** | **R$ 40-95** |

## 🎯 **OTIMIZAÇÕES APLICADAS**

✅ **RDS:** Instância mínima, backup reduzido, sem encryption  
✅ **ECS:** CPU/Memory reduzidos, 1 instância apenas  
✅ **NAT Gateway:** Reduzido de 2 para 1  
✅ **CloudWatch:** Retenção reduzida de 30 para 7 dias  
✅ **Container Insights:** Desabilitado  
✅ **CloudFront:** PriceClass_100 (mais econômico)  

## 📈 **ESCALABILIDADE**

- **Tráfego baixo:** R$ 450-580/mês
- **Tráfego médio:** R$ 800-1200/mês
- **Tráfego alto:** R$ 1500-2500/mês

## ⚠️ **OBSERVAÇÕES**

- Custos podem variar conforme uso real
- RDS é o maior custo (pode ser substituído por RDS Serverless se necessário)
- ECS pode escalar automaticamente conforme demanda
- CloudFront tem custos por transferência de dados
