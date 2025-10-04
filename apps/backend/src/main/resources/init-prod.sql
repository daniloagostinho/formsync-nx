-- Script de inicialização para PRODUÇÃO
-- Este arquivo é executado durante o deploy para configurar o banco de dados

-- Verificar se as tabelas existem e criar se necessário
DO $$
BEGIN
    -- Criar tabela de usuários se não existir
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'usuarios') THEN
        CREATE TABLE usuarios (
            id BIGSERIAL PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            senha VARCHAR(255) NOT NULL,
            nome VARCHAR(255) NOT NULL,
            data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            ativo BOOLEAN DEFAULT true
        );
        RAISE NOTICE 'Tabela usuarios criada';
    END IF;

    -- Criar tabela de templates se não existir
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'templates') THEN
        CREATE TABLE templates (
            id BIGSERIAL PRIMARY KEY,
            nome VARCHAR(255) NOT NULL,
            descricao TEXT,
            usuario_id BIGINT REFERENCES usuarios(id),
            data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            ativo BOOLEAN DEFAULT true
        );
        RAISE NOTICE 'Tabela templates criada';
    END IF;

    -- Criar tabela de campos de template se não existir
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'campos_template') THEN
        CREATE TABLE campos_template (
            id BIGSERIAL PRIMARY KEY,
            template_id BIGINT REFERENCES templates(id),
            nome VARCHAR(255) NOT NULL,
            tipo VARCHAR(50) NOT NULL,
            obrigatorio BOOLEAN DEFAULT false,
            ordem INTEGER DEFAULT 0
        );
        RAISE NOTICE 'Tabela campos_template criada';
    END IF;

    -- Criar tabela de preenchimentos se não existir
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'preenchimentos') THEN
        CREATE TABLE preenchimentos (
            id BIGSERIAL PRIMARY KEY,
            template_id BIGINT REFERENCES templates(id),
            usuario_id BIGINT REFERENCES usuarios(id),
            dados JSONB NOT NULL,
            data_preenchimento TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        RAISE NOTICE 'Tabela preenchimentos criada';
    END IF;

    -- Criar índices para performance
    IF NOT EXISTS (SELECT FROM pg_indexes WHERE indexname = 'idx_usuarios_email') THEN
        CREATE INDEX idx_usuarios_email ON usuarios(email);
        RAISE NOTICE 'Índice idx_usuarios_email criado';
    END IF;

    IF NOT EXISTS (SELECT FROM pg_indexes WHERE indexname = 'idx_templates_usuario') THEN
        CREATE INDEX idx_templates_usuario ON templates(usuario_id);
        RAISE NOTICE 'Índice idx_templates_usuario criado';
    END IF;

    IF NOT EXISTS (SELECT FROM pg_indexes WHERE indexname = 'idx_campos_template_template') THEN
        CREATE INDEX idx_campos_template_template ON campos_template(template_id);
        RAISE NOTICE 'Índice idx_campos_template_template criado';
    END IF;

    IF NOT EXISTS (SELECT FROM pg_indexes WHERE indexname = 'idx_preenchimentos_template') THEN
        CREATE INDEX idx_preenchimentos_template ON preenchimentos(template_id);
        RAISE NOTICE 'Índice idx_preenchimentos_template criado';
    END IF;

    RAISE NOTICE 'Script de inicialização concluído com sucesso!';
END $$;

-- Verificar status das tabelas
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

