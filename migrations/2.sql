
-- Tabela para controlar competências (mês/ano) de previsões
CREATE TABLE competencias (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  mes INTEGER NOT NULL,
  ano INTEGER NOT NULL,
  condominio_id INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('rascunho', 'fechado')) DEFAULT 'rascunho',
  area_total_m2 REAL NOT NULL,
  taxa_m2 REAL,
  acrescimo_percentual REAL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(mes, ano, condominio_id)
);

-- Tabela para itens de previsão por categoria
CREATE TABLE previsao_itens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  competencia_id INTEGER NOT NULL,
  categoria TEXT NOT NULL CHECK (categoria IN (
    'Despesas de Pessoal', 
    'Contratos Mensais', 
    'Despesas Concessionárias (Estimado)', 
    'Despesas Anuais (Estimado)', 
    'Despesas Mensais Variáveis (Estimado)'
  )),
  descricao TEXT NOT NULL,
  valor REAL NOT NULL,
  observacoes TEXT,
  ordem INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela para centros de custo (ex: SUDENE)
CREATE TABLE centros_custo (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  condominio_id INTEGER NOT NULL,
  area_m2 REAL NOT NULL,
  endereco TEXT,
  cnpj TEXT,
  ativo BOOLEAN DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela para itens específicos de centros de custo
CREATE TABLE centro_custo_itens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  competencia_id INTEGER NOT NULL,
  centro_custo_id INTEGER NOT NULL,
  categoria TEXT NOT NULL CHECK (categoria IN ('Pessoal', 'Contratos', 'Variáveis')),
  descricao TEXT NOT NULL,
  valor REAL NOT NULL,
  ordem INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela para auditoria de mudanças
CREATE TABLE auditoria_previsao (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  competencia_id INTEGER NOT NULL,
  tabela TEXT NOT NULL,
  registro_id INTEGER NOT NULL,
  campo TEXT NOT NULL,
  valor_anterior TEXT,
  valor_novo TEXT,
  usuario TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para performance
CREATE INDEX idx_competencias_mes_ano ON competencias(mes, ano, condominio_id);
CREATE INDEX idx_previsao_itens_competencia ON previsao_itens(competencia_id);
CREATE INDEX idx_centro_custo_itens_competencia ON centro_custo_itens(competencia_id);
CREATE INDEX idx_auditoria_competencia ON auditoria_previsao(competencia_id);
