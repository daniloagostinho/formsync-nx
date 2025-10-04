-- Migração V3: Adicionar colunas faltantes na tabela assinaturas
-- Data: 2025-08-25
-- Descrição: Adiciona colunas necessárias para funcionalidades de Stripe, reembolsos e auditoria

-- Adicionar colunas para funcionalidades de Stripe
ALTER TABLE assinaturas 
ADD COLUMN IF NOT EXISTS payment_intent_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS customer_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS subscription_id VARCHAR(255);

-- Adicionar colunas para reembolsos
ALTER TABLE assinaturas 
ADD COLUMN IF NOT EXISTS refund_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS refund_status VARCHAR(50),
ADD COLUMN IF NOT EXISTS refund_amount DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS refund_reason TEXT,
ADD COLUMN IF NOT EXISTS refund_processed_at TIMESTAMP;

-- Adicionar colunas para auditoria e cancelamento
ALTER TABLE assinaturas 
ADD COLUMN IF NOT EXISTS cancellation_reason TEXT,
ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS cancelled_by VARCHAR(50);

-- Adicionar colunas para controle de tentativas e próximas cobranças
ALTER TABLE assinaturas 
ADD COLUMN IF NOT EXISTS tentativas INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS ultima_tentativa TIMESTAMP,
ADD COLUMN IF NOT EXISTS data_proxima_cobranca TIMESTAMP;

-- Adicionar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_assinaturas_customer_id ON assinaturas(customer_id);
CREATE INDEX IF NOT EXISTS idx_assinaturas_subscription_id ON assinaturas(subscription_id);
CREATE INDEX IF NOT EXISTS idx_assinaturas_status ON assinaturas(status);
CREATE INDEX IF NOT EXISTS idx_assinaturas_data_inicio ON assinaturas(data_inicio);

-- Comentários para documentar as novas colunas
COMMENT ON COLUMN assinaturas.payment_intent_id IS 'ID do PaymentIntent no Stripe';
COMMENT ON COLUMN assinaturas.customer_id IS 'ID do Customer no Stripe';
COMMENT ON COLUMN assinaturas.subscription_id IS 'ID da Subscription no Stripe';
COMMENT ON COLUMN assinaturas.refund_id IS 'ID do Refund no Stripe';
COMMENT ON COLUMN assinaturas.refund_status IS 'Status do reembolso: pending, succeeded, failed, canceled';
COMMENT ON COLUMN assinaturas.refund_amount IS 'Valor do reembolso em reais';
COMMENT ON COLUMN assinaturas.refund_reason IS 'Motivo do reembolso';
COMMENT ON COLUMN assinaturas.refund_processed_at IS 'Data do processamento do reembolso';
COMMENT ON COLUMN assinaturas.cancellation_reason IS 'Motivo do cancelamento';
COMMENT ON COLUMN assinaturas.cancelled_at IS 'Data do cancelamento';
COMMENT ON COLUMN assinaturas.cancelled_by IS 'Quem cancelou: USER, ADMIN, SYSTEM';
COMMENT ON COLUMN assinaturas.tentativas IS 'Número de tentativas de cobrança';
COMMENT ON COLUMN assinaturas.ultima_tentativa IS 'Data da última tentativa de cobrança';
COMMENT ON COLUMN assinaturas.data_proxima_cobranca IS 'Data da próxima cobrança programada';
