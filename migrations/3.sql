
-- Migration 3: Sistema de Pagamentos e Despesas Extras

-- Tabela para controle de pagamentos efetivados
CREATE TABLE IF NOT EXISTS pagamentos_efetivados (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  competencia_id INTEGER NOT NULL,
  centro_custo_id INTEGER,
  tipo_referencia TEXT NOT NULL CHECK (tipo_referencia IN ('previsao_item', 'despesa_extra', 'taxa_geral')),
  referencia_id INTEGER,
  descricao TEXT NOT NULL,
  categoria TEXT NOT NULL,
  valor_previsto REAL NOT NULL,
  valor_pago REAL,
  data_vencimento DATE,
  data_pagamento DATE,
  status TEXT NOT NULL CHECK (status IN ('pendente', 'pago', 'atrasado', 'cancelado')) DEFAULT 'pendente',
  forma_pagamento TEXT,
  comprovante_url TEXT,
  observacoes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela para despesas extras/não previstas
CREATE TABLE IF NOT EXISTS despesas_extras (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  competencia_id INTEGER NOT NULL,
  centro_custo_id INTEGER,
  categoria TEXT NOT NULL,
  descricao TEXT NOT NULL,
  valor REAL NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('extraordinaria', 'nao_prevista', 'variacao')) DEFAULT 'nao_prevista',
  data_ocorrencia DATE,
  justificativa TEXT,
  aprovado BOOLEAN DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Adicionar campos para dados bancários e faturamento nos centros de custo
ALTER TABLE centros_custo ADD COLUMN cnpj TEXT;
ALTER TABLE centros_custo ADD COLUMN razao_social TEXT;
ALTER TABLE centros_custo ADD COLUMN contato TEXT;
ALTER TABLE centros_custo ADD COLUMN email TEXT;
ALTER TABLE centros_custo ADD COLUMN telefone TEXT;
ALTER TABLE centros_custo ADD COLUMN percentual_rateio REAL;
ALTER TABLE centros_custo ADD COLUMN data_vencimento_padrao INTEGER DEFAULT 10;

-- Tabela para histórico de comparação (projetado x executado)
CREATE TABLE IF NOT EXISTS historico_comparacao (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  competencia_id INTEGER NOT NULL,
  centro_custo_id INTEGER,
  categoria TEXT NOT NULL,
  total_previsto REAL NOT NULL,
  total_executado REAL NOT NULL,
  diferenca REAL NOT NULL,
  percentual_variacao REAL NOT NULL,
  observacoes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela para alertas e notificações
CREATE TABLE IF NOT EXISTS alertas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  competencia_id INTEGER NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('variacao_alta', 'atraso_pagamento', 'despesa_extra', 'meta_atingida')),
  severidade TEXT NOT NULL CHECK (severidade IN ('baixa', 'media', 'alta', 'critica')) DEFAULT 'media',
  titulo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  valor_relacionado REAL,
  lido BOOLEAN DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_pagamentos_competencia ON pagamentos_efetivados(competencia_id);
CREATE INDEX IF NOT EXISTS idx_pagamentos_centro_custo ON pagamentos_efetivados(centro_custo_id);
CREATE INDEX IF NOT EXISTS idx_pagamentos_status ON pagamentos_efetivados(status);
CREATE INDEX IF NOT EXISTS idx_despesas_extras_competencia ON despesas_extras(competencia_id);
CREATE INDEX IF NOT EXISTS idx_despesas_extras_centro_custo ON despesas_extras(centro_custo_id);
CREATE INDEX IF NOT EXISTS idx_historico_competencia ON historico_comparacao(competencia_id);
CREATE INDEX IF NOT EXISTS idx_alertas_competencia ON alertas(competencia_id);
CREATE INDEX IF NOT EXISTS idx_alertas_lido ON alertas(lido);

-- Inserir dados de exemplo para centros de custo
INSERT OR IGNORE INTO centros_custo (nome, condominio_id, area_m2, endereco, cnpj, razao_social, ativo) 
VALUES ('SUDENE', 1, 3197.64, 'Pavimentos Térreo, 5°, 7°, 8°, 9°, 10°, 11°, 12°, 13° e 14°', '00.000.000/0001-00', 'SUPERINTENDÊNCIA DO DESENVOLVIMENTO DO NORDESTE', 1);

INSERT OR IGNORE INTO centros_custo (nome, condominio_id, area_m2, endereco, ativo) 
VALUES ('SOUZA & MACEDO', 1, 156.835, '50% da área total do 6º andar', 1);

INSERT OR IGNORE INTO centros_custo (nome, condominio_id, area_m2, endereco, ativo) 
VALUES ('BRITO E SOBRAL', 1, 156.835, '50% da área total do 6º andar', 1);
