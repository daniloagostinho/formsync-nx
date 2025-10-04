-- Criação de todas as tabelas do sistema FormSync
-- Este script deve ser executado APENAS UMA VEZ para criar a estrutura inicial

-- 1. Tabela de usuários
CREATE TABLE IF NOT EXISTS usuarios (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha TEXT NOT NULL,
    foto_base64 TEXT,
    plano VARCHAR(50) NOT NULL DEFAULT 'PESSOAL'
);

-- 2. Tabela de planos
CREATE TABLE IF NOT EXISTS planos (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    preco DECIMAL(10,2) NOT NULL,
    moeda VARCHAR(3) DEFAULT 'BRL',
    recursos TEXT,
    ativo BOOLEAN DEFAULT true
);

-- 3. Tabela de assinaturas
CREATE TABLE IF NOT EXISTS assinaturas (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT NOT NULL REFERENCES usuarios(id),
    plano_id BIGINT NOT NULL REFERENCES planos(id),
    stripe_subscription_id VARCHAR(255) UNIQUE,
    stripe_customer_id VARCHAR(255),
    status VARCHAR(50) NOT NULL,
    data_inicio TIMESTAMP NOT NULL,
    data_fim TIMESTAMP,
    data_cancelamento TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabela de templates
CREATE TABLE IF NOT EXISTS templates (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT NOT NULL REFERENCES usuarios(id),
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    html_content TEXT NOT NULL,
    css_content TEXT,
    js_content TEXT,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Tabela de campos do template
CREATE TABLE IF NOT EXISTS campos_template (
    id BIGSERIAL PRIMARY KEY,
    template_id BIGINT NOT NULL REFERENCES templates(id),
    nome VARCHAR(100) NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    label VARCHAR(255),
    placeholder VARCHAR(255),
    obrigatorio BOOLEAN DEFAULT false,
    ordem INTEGER DEFAULT 0,
    opcoes TEXT,
    validacoes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Tabela de mapeamento de campos
CREATE TABLE IF NOT EXISTS mapeamento_campo (
    id BIGSERIAL PRIMARY KEY,
    campo_template_id BIGINT NOT NULL REFERENCES campos_template(id),
    nome_original VARCHAR(100) NOT NULL,
    nome_mapeado VARCHAR(100) NOT NULL,
    tipo_mapeamento VARCHAR(50) NOT NULL,
    configuracao TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Tabela de códigos de login
CREATE TABLE IF NOT EXISTS codigos_login (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    codigo VARCHAR(10) NOT NULL,
    usado BOOLEAN DEFAULT false,
    expira_em TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Tabela de configurações de notificação
CREATE TABLE IF NOT EXISTS configuracao_notificacao (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT NOT NULL REFERENCES usuarios(id),
    tipo VARCHAR(50) NOT NULL,
    ativo BOOLEAN DEFAULT true,
    configuracao TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. Tabela de notificações de vencimento
CREATE TABLE IF NOT EXISTS notificacao_vencimento (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT NOT NULL REFERENCES usuarios(id),
    assinatura_id BIGINT NOT NULL REFERENCES assinaturas(id),
    tipo VARCHAR(50) NOT NULL,
    enviada BOOLEAN DEFAULT false,
    data_envio TIMESTAMP,
    data_vencimento TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. Tabela de analytics de campos
CREATE TABLE IF NOT EXISTS campo_analytics (
    id BIGSERIAL PRIMARY KEY,
    campo_template_id BIGINT NOT NULL REFERENCES campos_template(id),
    total_preenchimentos INTEGER DEFAULT 0,
    taxa_preenchimento DECIMAL(5,2) DEFAULT 0,
    tempo_medio_preenchimento INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 11. Tabela de preenchimentos analytics
CREATE TABLE IF NOT EXISTS preenchimento_analytics (
    id BIGSERIAL PRIMARY KEY,
    campo_template_id BIGINT NOT NULL REFERENCES campos_template(id),
    data_preenchimento TIMESTAMP NOT NULL,
    tempo_preenchimento INTEGER,
    dispositivo VARCHAR(100),
    navegador VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 12. Tabela de histórico de preenchimentos
CREATE TABLE IF NOT EXISTS historico_preenchimento (
    id BIGSERIAL PRIMARY KEY,
    template_id BIGINT NOT NULL REFERENCES templates(id),
    dados_preenchidos TEXT NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_assinaturas_usuario ON assinaturas(usuario_id);
CREATE INDEX IF NOT EXISTS idx_assinaturas_stripe ON assinaturas(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_templates_usuario ON templates(usuario_id);
CREATE INDEX IF NOT EXISTS idx_campos_template_template ON campos_template(template_id);
CREATE INDEX IF NOT EXISTS idx_codigos_login_email ON codigos_login(email);
CREATE INDEX IF NOT EXISTS idx_codigos_login_codigo ON codigos_login(codigo);
CREATE INDEX IF NOT EXISTS idx_notificacoes_usuario ON notificacao_vencimento(usuario_id);
CREATE INDEX IF NOT EXISTS idx_analytics_campo ON campo_analytics(campo_template_id);
CREATE INDEX IF NOT EXISTS idx_preenchimentos_campo ON preenchimento_analytics(campo_template_id);
CREATE INDEX IF NOT EXISTS idx_historico_template ON historico_preenchimento(template_id);

-- Inserir dados iniciais dos planos (simplificado)
INSERT INTO planos (nome, descricao, preco, recursos) VALUES
('PESSOAL', 'Plano pessoal gratuito', 0.00, 'formularios: 1, campos: 10, respostas: 100'),
('PROFISSIONAL_MENSAL', 'Plano profissional mensal', 29.90, 'formularios: 10, campos: 100, respostas: 1000, analytics: true'),
('PROFISSIONAL_ANUAL', 'Plano profissional anual', 299.00, 'formularios: 10, campos: 100, respostas: 1000, analytics: true, desconto: 17%'),
('EMPRESARIAL_MENSAL', 'Plano empresarial mensal', 99.90, 'formularios: 100, campos: 1000, respostas: 10000, analytics: true, suporte: true'),
('EMPRESARIAL_ANUAL', 'Plano empresarial anual', 999.00, 'formularios: 100, campos: 1000, respostas: 10000, analytics: true, suporte: true, desconto: 17%');
