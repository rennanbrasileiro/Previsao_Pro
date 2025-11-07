
CREATE TABLE condominios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  cnpj TEXT,
  tipo TEXT NOT NULL CHECK (tipo IN ('residencial', 'comercial', 'misto')),
  endereco TEXT,
  area_total_m2 REAL NOT NULL,
  ativo BOOLEAN DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE unidades (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  condominio_id INTEGER NOT NULL,
  identificacao TEXT NOT NULL,
  area_m2 REAL NOT NULL,
  inquilino_id INTEGER,
  ativo BOOLEAN DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE inquilinos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome_razao TEXT NOT NULL,
  cnpj_cpf TEXT,
  contato TEXT,
  data_inicio DATE,
  data_fim DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categorias (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('pessoal', 'contratos', 'variavel', 'concessionaria', 'extra', 'reforma', 'outros', 'taxa')),
  descricao TEXT,
  ativo BOOLEAN DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE fornecedores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  cnpj TEXT,
  contato TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE item_despesa (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  categoria_id INTEGER NOT NULL,
  fornecedor_id INTEGER,
  descricao TEXT NOT NULL,
  periodicidade TEXT NOT NULL CHECK (periodicidade IN ('mensal', 'anual', 'eventual')),
  valor_base REAL NOT NULL,
  indice_reajuste TEXT,
  mes_referencia INTEGER,
  rateavel BOOLEAN DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE contratos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  fornecedor_id INTEGER NOT NULL,
  categoria_id INTEGER NOT NULL,
  valor_mensal REAL NOT NULL,
  vigencia_inicio DATE NOT NULL,
  vigencia_fim DATE,
  indice_reajuste TEXT,
  clausula_reajuste TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE projecoes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  condominio_id INTEGER NOT NULL,
  ano INTEGER NOT NULL,
  cenario TEXT NOT NULL CHECK (cenario IN ('base', 'otimista', 'conservador')),
  parametros_json TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE balancetes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  condominio_id INTEGER NOT NULL,
  mes INTEGER NOT NULL,
  ano INTEGER NOT NULL,
  consolidado_json TEXT,
  taxa_m2 REAL NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE rateio_unidade (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  balancete_id INTEGER NOT NULL,
  unidade_id INTEGER NOT NULL,
  valor_condominial REAL NOT NULL,
  valor_centro_custo REAL DEFAULT 0,
  valor_total REAL NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_unidades_condominio ON unidades(condominio_id);
CREATE INDEX idx_unidades_inquilino ON unidades(inquilino_id);
CREATE INDEX idx_item_despesa_categoria ON item_despesa(categoria_id);
CREATE INDEX idx_contratos_fornecedor ON contratos(fornecedor_id);
CREATE INDEX idx_balancetes_condominio ON balancetes(condominio_id);
CREATE INDEX idx_balancetes_periodo ON balancetes(ano, mes);
CREATE INDEX idx_rateio_balancete ON rateio_unidade(balancete_id);
