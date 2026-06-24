# 📘 PrevisãoPro - Documentação Técnica Completa

## 📑 Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura do Sistema](#arquitetura-do-sistema)
3. [Stack Tecnológico](#stack-tecnológico)
4. [Estrutura de Pastas](#estrutura-de-pastas)
5. [Banco de Dados](#banco-de-dados)
6. [APIs e Endpoints](#apis-e-endpoints)
7. [Componentes Frontend](#componentes-frontend)
8. [Funcionalidades Principais](#funcionalidades-principais)
9. [Fluxos de Dados](#fluxos-de-dados)
10. [Cálculos e Fórmulas](#cálculos-e-fórmulas)
11. [Sistema de Documentos](#sistema-de-documentos)
12. [Guia de Desenvolvimento](#guia-de-desenvolvimento)

---

## 🎯 Visão Geral

### O que é o PrevisãoPro?

PrevisãoPro é um sistema completo de gestão condominial que permite:
- Criar e gerenciar previsões de custos mensais
- Calcular automaticamente taxas proporcionais por m²
- Gerar documentos profissionais (PDF/HTML)
- Acompanhar pagamentos efetivados
- Comparar valores projetados vs executados
- Gerenciar múltiplos centros de custo
- Registrar despesas extras e não previstas
- Emitir alertas automáticos de variações

### Público-alvo

- Síndicos de condomínios
- Administradoras condominiais
- Contadores e gestores financeiros
- Centros de custo (inquilinos comerciais)

---

## 🏗️ Arquitetura do Sistema

### Arquitetura Geral

```
┌─────────────────┐
│   Frontend      │  React 19 + TypeScript + Vite
│   (Port 5173)   │  - Pages, Components, Hooks
└────────┬────────┘
         │ HTTP/REST
         ▼
┌─────────────────┐
│   Backend       │  Hono (Cloudflare Workers)
│   (Port 8787)   │  - APIs, Business Logic
└────────┬────────┘
         │ SQL
         ▼
┌─────────────────┐
│   Database      │  SQLite (Cloudflare D1)
│                 │  - Tables, Relations, Indexes
└─────────────────┘
```

### Camadas da Aplicação

**1. Camada de Apresentação (Frontend)**
- React 19 com TypeScript
- Tailwind CSS para estilização
- Framer Motion para animações
- Recharts para gráficos
- React Router para navegação

**2. Camada de API (Backend)**
- Hono (framework web minimalista)
- RESTful API design
- Validação com Zod
- CORS habilitado

**3. Camada de Dados (Database)**
- SQLite (via Cloudflare D1)
- 14 tabelas relacionais
- Índices otimizados
- Triggers e constraints

---

## 🛠️ Stack Tecnológico

### Frontend

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| React | 19.x | Framework UI |
| TypeScript | 5.x | Type Safety |
| Vite | 7.x | Build Tool |
| Tailwind CSS | 3.x | Styling |
| Framer Motion | 11.x | Animations |
| Recharts | 2.x | Charts |
| Lucide React | Latest | Icons |
| React Router | 7.x | Navigation |

### Backend

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| Hono | Latest | Web Framework |
| Cloudflare Workers | - | Runtime |
| Zod | Latest | Validation |

### Database

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| SQLite | 3.x | Database |
| Cloudflare D1 | - | Hosting |

### DevOps

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| Wrangler | 4.x | Deployment |
| ESLint | Latest | Linting |
| npm/yarn | Latest | Package Manager |

---

## 📁 Estrutura de Pastas

```
/app
├── README.md                          # Documentação principal
├── DOCUMENTATION.md                   # Este arquivo
├── package.json                       # Dependências
├── vite.config.ts                     # Configuração Vite
├── tailwind.config.js                 # Configuração Tailwind
├── wrangler.json                      # Configuração Cloudflare
│
├── migrations/                        # Migrations do banco
│   ├── 1.sql                         # Schema inicial
│   ├── 2.sql                         # Categorias e auditoria
│   ├── 3.sql                         # Sistema de pagamentos
│   └── 4_seed_data.sql               # Dados de exemplo
│
├── scripts/                           # Scripts utilitários
│   └── init-db.sh                    # Inicializar banco
│
├── src/
│   ├── shared/                        # Código compartilhado
│   │   ├── types.ts                  # Types globais
│   │   └── previsao-types.ts         # Types de previsão
│   │
│   ├── worker/                        # Backend (Hono)
│   │   ├── index.ts                  # Entry point
│   │   ├── previsao-api.ts           # API de previsões
│   │   ├── pagamentos-api.ts         # API de pagamentos
│   │   ├── dashboard-api.ts          # API de dashboard
│   │   ├── alertas-api.ts            # API de alertas
│   │   ├── relatorios-api.ts         # API de relatórios
│   │   └── document-templates.ts     # Templates de documentos
│   │
│   └── react-app/                     # Frontend (React)
│       ├── App.tsx                   # Componente raiz
│       ├── main.tsx                  # Entry point
│       │
│       ├── pages/                    # Páginas principais
│       │   ├── Dashboard.tsx         # Dashboard principal
│       │   ├── Previsoes.tsx         # Gestão de previsões
│       │   ├── Pagamentos.tsx        # Gestão de pagamentos
│       │   └── Balancetes.tsx        # Balancetes
│       │
│       ├── components/               # Componentes reutilizáveis
│       │   ├── Layout.tsx            # Layout principal
│       │   ├── KPICard.tsx           # Card de KPI
│       │   ├── AlertCard.tsx         # Card de alerta
│       │   ├── StatusBadge.tsx       # Badge de status
│       │   ├── LoadingState.tsx      # Estados de loading
│       │   ├── AlertsWidget.tsx      # Widget de alertas
│       │   ├── DocumentGenerator.tsx # Gerador de documentos
│       │   ├── DocumentPreview.tsx   # Preview de documentos
│       │   ├── RealtimeCalculator.tsx # Calculadora em tempo real
│       │   ├── AdvancedCharts.tsx    # Gráficos avançados
│       │   ├── PrevisaoForm.tsx      # Formulário de previsão
│       │   └── PrevisaoFormAdvanced.tsx # Form avançado
│       │
│       └── hooks/                    # Custom hooks
│           └── useAPI.ts             # Hook para API calls
│
└── public/                            # Assets estáticos
    └── assets/                        # Imagens, fontes, etc
```

---

## 💾 Banco de Dados

### Diagrama ER (Entidade-Relacionamento)

```
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│  condominios │──┬──<│ competencias │>──┬──│   itens      │
└──────────────┘  │   └──────────────┘   │  └──────────────┘
                  │                      │
                  │                      └──┐
                  │                         │
                  │   ┌──────────────┐     │
                  └──<│centros_custo │>────┘
                      └──────────────┘
                            │
                            ├──> centro_custo_itens
                            ├──> pagamentos_efetivados
                            └──> despesas_extras
```

### Tabelas Principais

#### 1. **condominios**
```sql
CREATE TABLE condominios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  cnpj TEXT,
  tipo TEXT CHECK (tipo IN ('residencial', 'comercial', 'misto')),
  endereco TEXT,
  area_total_m2 REAL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ativo BOOLEAN DEFAULT 1
);
```

**Propósito:** Armazena informações básicas dos condomínios.

**Campos importantes:**
- `area_total_m2`: Usado para calcular taxa por m²
- `tipo`: Define regras específicas por tipo
- `ativo`: Soft delete

#### 2. **competencias**
```sql
CREATE TABLE competencias (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  mes INTEGER NOT NULL CHECK (mes BETWEEN 1 AND 12),
  ano INTEGER NOT NULL,
  condominio_id INTEGER NOT NULL,
  status TEXT CHECK (status IN ('rascunho', 'fechado')) DEFAULT 'rascunho',
  area_total_m2 REAL NOT NULL,
  taxa_m2 REAL,
  acrescimo_percentual REAL DEFAULT 10,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (condominio_id) REFERENCES condominios(id)
);
```

**Propósito:** Representa um período de previsão (mês/ano).

**Campos importantes:**
- `mes` + `ano`: Identificam o período único
- `status`: 'rascunho' permite edição, 'fechado' bloqueia
- `acrescimo_percentual`: Padrão 10%
- `taxa_m2`: Calculada automaticamente

#### 3. **previsao_itens**
```sql
CREATE TABLE previsao_itens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  competencia_id INTEGER NOT NULL,
  categoria TEXT NOT NULL,
  descricao TEXT NOT NULL,
  valor REAL NOT NULL,
  ordem INTEGER DEFAULT 0,
  observacoes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (competencia_id) REFERENCES competencias(id)
);
```

**Propósito:** Itens individuais de despesa da previsão.

**Categorias fixas:**
1. Despesas de Pessoal
2. Contratos Mensais
3. Despesas Concessionárias (Estimado)
4. Despesas Anuais (Estimado)
5. Despesas Mensais Variáveis (Estimado)

#### 4. **centros_custo**
```sql
CREATE TABLE centros_custo (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  condominio_id INTEGER NOT NULL,
  area_m2 REAL NOT NULL,
  endereco TEXT,
  cnpj TEXT,
  razao_social TEXT,
  contato TEXT,
  email TEXT,
  telefone TEXT,
  percentual_rateio REAL,
  data_vencimento_padrao INTEGER DEFAULT 10,
  ativo BOOLEAN DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (condominio_id) REFERENCES condominios(id)
);
```

**Propósito:** Inquilinos ou áreas específicas do condomínio.

**Campos importantes:**
- `area_m2`: Base para cálculo proporcional
- `percentual_rateio`: Calculado automaticamente
- `cnpj` + `razao_social`: Para emissão de faturas

#### 5. **centro_custo_itens**
```sql
CREATE TABLE centro_custo_itens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  competencia_id INTEGER NOT NULL,
  centro_custo_id INTEGER NOT NULL,
  categoria TEXT NOT NULL,
  descricao TEXT NOT NULL,
  valor REAL NOT NULL,
  ordem INTEGER DEFAULT 0,
  observacoes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (competencia_id) REFERENCES competencias(id),
  FOREIGN KEY (centro_custo_id) REFERENCES centros_custo(id)
);
```

**Propósito:** Despesas específicas de cada centro de custo.

**Categorias comuns:**
- Pessoal
- Contratos
- Variáveis
- Extraordinárias

#### 6. **pagamentos_efetivados**
```sql
CREATE TABLE pagamentos_efetivados (
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
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (competencia_id) REFERENCES competencias(id)
);
```

**Propósito:** Controle de pagamentos realizados.

**Status possíveis:**
- `pendente`: Aguardando pagamento
- `pago`: Pagamento confirmado
- `atrasado`: Vencimento ultrapassado
- `cancelado`: Pagamento cancelado

#### 7. **despesas_extras**
```sql
CREATE TABLE despesas_extras (
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
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (competencia_id) REFERENCES competencias(id)
);
```

**Propósito:** Despesas não previstas ou extraordinárias.

**Tipos:**
- `extraordinaria`: Despesa planejada mas fora do orçamento regular
- `nao_prevista`: Despesa inesperada
- `variacao`: Variação de valor de item previsto

#### 8. **alertas**
```sql
CREATE TABLE alertas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  competencia_id INTEGER NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('variacao_alta', 'atraso_pagamento', 'despesa_extra', 'meta_atingida')),
  severidade TEXT NOT NULL CHECK (severidade IN ('baixa', 'media', 'alta', 'critica')) DEFAULT 'media',
  titulo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  valor_relacionado REAL,
  lido BOOLEAN DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (competencia_id) REFERENCES competencias(id)
);
```

**Propósito:** Sistema de notificações automáticas.

**Tipos de alertas:**
- `variacao_alta`: Variação > 10% entre previsto e executado
- `atraso_pagamento`: Pagamento com vencimento ultrapassado
- `despesa_extra`: Despesa extra aguardando aprovação
- `meta_atingida`: Meta orçamentária atingida

### Índices

```sql
-- Performance indexes
CREATE INDEX idx_competencias_condominio ON competencias(condominio_id);
CREATE INDEX idx_previsao_itens_competencia ON previsao_itens(competencia_id);
CREATE INDEX idx_centros_custo_condominio ON centros_custo(condominio_id);
CREATE INDEX idx_pagamentos_competencia ON pagamentos_efetivados(competencia_id);
CREATE INDEX idx_pagamentos_status ON pagamentos_efetivados(status);
CREATE INDEX idx_despesas_extras_competencia ON despesas_extras(competencia_id);
CREATE INDEX idx_alertas_competencia ON alertas(competencia_id);
CREATE INDEX idx_alertas_lido ON alertas(lido);
```

---

## 🔌 APIs e Endpoints

### Base URL
```
Development: http://localhost:8787/api
Production: https://your-worker.workers.dev/api
```

### 1. API de Condomínios

**GET `/api/condominios`**
- Retorna lista de condomínios ativos
- Response: `Array<Condominio>`

**GET `/api/condominios/:id`**
- Retorna detalhes de um condomínio
- Response: `Condominio`

**POST `/api/condominios`**
- Cria novo condomínio
- Body: `{ nome, cnpj?, tipo, endereco?, area_total_m2 }`
- Response: `Condominio`

---

### 2. API de Previsões (`/api/previsoes`)

**GET `/api/previsoes/competencias?condominioId={id}`**
- Lista competências de um condomínio
- Response: `Array<Competencia>`

**POST `/api/previsoes/competencias`**
- Cria nova competência
- Body: `{ mes, ano, condominio_id, area_total_m2, acrescimo_percentual? }`
- Response: `Competencia`

**GET `/api/previsoes/itens?competenciaId={id}`**
- Lista itens de uma competência
- Response: `Array<PrevisaoItem>`

**POST `/api/previsoes/salvar`**
- Salva ou atualiza itens de previsão
- Body: `{ competenciaId, itens: Array<PrevisaoItem>, dadosCompetencia }`
- Response: `{ success: boolean }`

**GET `/api/previsoes/consolidada?competenciaId={id}`**
- Retorna previsão consolidada com cálculos
- Response: `PrevisaoConsolidada`

**POST `/api/previsoes/calcular`**
- Recalcula valores de uma competência
- Body: `{ competenciaId }`
- Response: `{ success: boolean, taxaGeral, somatarioTaxaGeral }`

**POST `/api/previsoes/fechar/:id`**
- Fecha competência (impede edições)
- Response: `{ success: boolean }`

**GET `/api/previsoes/documento/:id?tipo={tipo}&formato={formato}&centroCustoId={id?}`**
- Gera documento (HTML ou PDF)
- Params:
  - `tipo`: 'condominio' | 'centro_custo' | 'fatura' | 'balancete'
  - `formato`: 'html' | 'pdf'
  - `centroCustoId`: Opcional, necessário para 'centro_custo' e 'fatura'
- Response: HTML ou PDF

---

### 3. API de Pagamentos (`/api/pagamentos`)

**GET `/api/pagamentos/competencia/:competenciaId?centroCustoId={id?}`**
- Lista pagamentos de uma competência
- Response: `Array<PagamentoEfetuado>`

**POST `/api/pagamentos`**
- Registra novo pagamento
- Body: `PagamentoEfetuado`
- Response: `PagamentoEfetuado`

**PUT `/api/pagamentos/:id`**
- Atualiza pagamento
- Body: `{ valor_pago, data_pagamento, status, forma_pagamento?, observacoes? }`
- Response: `PagamentoEfetuado`

**DELETE `/api/pagamentos/:id`**
- Remove pagamento
- Response: `{ success: boolean }`

**POST `/api/pagamentos/gerar-da-previsao`**
- Gera pagamentos automaticamente dos itens de previsão
- Body: `{ competenciaId, centroCustoId?, dataVencimento }`
- Response: `{ success: boolean, quantidadeGerada, ids }`

**GET `/api/pagamentos/comparacao/:competenciaId?centroCustoId={id?}`**
- Comparação projetado x executado
- Response: `{ categorias: Array<ComparacaoProjetadoExecutado>, resumo }`

**GET `/api/pagamentos/despesas-extras/:competenciaId?centroCustoId={id?}`**
- Lista despesas extras
- Response: `Array<DespesaExtra>`

**POST `/api/pagamentos/despesas-extras`**
- Registra despesa extra
- Body: `DespesaExtra`
- Response: `DespesaExtra`

---

### 4. API de Alertas (`/api/alertas`)

**POST `/api/alertas/gerar/:competenciaId`**
- Gera alertas automáticos baseado em análise
- Response: `{ success: boolean, alertasGerados, ids }`

**GET `/api/alertas/:competenciaId?lido={boolean}`**
- Lista alertas
- Response: `Array<Alerta>`

**PUT `/api/alertas/:id/marcar-lido`**
- Marca alerta como lido
- Response: `{ success: boolean }`

**PUT `/api/alertas/marcar-todos-lidos/:competenciaId`**
- Marca todos os alertas como lidos
- Response: `{ success: boolean }`

**DELETE `/api/alertas/:id`**
- Remove alerta
- Response: `{ success: boolean }`

---

### 5. API de Relatórios (`/api/relatorios`)

**GET `/api/relatorios/consolidado/:competenciaId?formato={html|json}`**
- Relatório consolidado completo
- Response: HTML ou JSON

**GET `/api/relatorios/comparativo?condominioId={id}&dataInicio={date}&dataFim={date}`**
- Relatório comparativo entre períodos
- Response: JSON

**GET `/api/relatorios/centro-custo/:centroCustoId`**
- Relatório de performance de centro de custo
- Response: JSON

---

### 6. API de Dashboard (`/api/dashboard`)

**GET `/api/dashboard/metricas?condominioId={id}`**
- Métricas principais do dashboard
- Response: JSON com KPIs

**GET `/api/dashboard/insights?condominioId={id}`**
- Insights e análises automáticas
- Response: JSON

---

### 7. API de Centros de Custo

**GET `/api/centros-custo?condominioId={id}`**
- Lista centros de custo de um condomínio
- Response: `Array<CentroCusto>`

**POST `/api/centros-custo`**
- Cria novo centro de custo
- Body: `CentroCusto`
- Response: `CentroCusto`

**PUT `/api/centros-custo/:id`**
- Atualiza centro de custo
- Response: `CentroCusto`

**DELETE `/api/centros-custo/:id`**
- Remove centro de custo (soft delete)
- Response: `{ success: boolean }`

---

## 🧩 Componentes Frontend

### Componentes de Página

#### Dashboard.tsx
**Propósito:** Tela principal com visão geral do sistema

**Features:**
- KPIs principais (Total previsto, executado, pendente, atrasado)
- Gráficos de evolução mensal
- Comparação por categoria
- Alertas não lidos
- Insights automáticos

**Props:** Nenhuma (usa hooks para dados)

**Estados:**
```typescript
selectedCondominio: number
selectedPeriodo: string
```

---

#### Previsoes.tsx
**Propósito:** Gestão completa de previsões

**Features:**
- Listagem de competências
- Criação de nova competência
- Edição de itens de previsão
- Calculadora em tempo real
- Geração de documentos
- Fechamento de competência

**Props:** Nenhuma

**Estados principais:**
```typescript
selectedCondominio: number
selectedCompetencia: number | null
showCreateModal: boolean
```

**Subcomponentes:**
- PrevisaoForm
- DocumentGenerator
- RealtimeCalculator

---

#### Pagamentos.tsx
**Propósito:** Gestão de pagamentos e comparações

**Features:**
- Lista de pagamentos com status
- Marcar como pago
- Geração automática de pagamentos
- Comparação projetado x executado
- Filtros por competência e centro de custo
- Registro de despesas extras

**Props:** Nenhuma

**Estados principais:**
```typescript
selectedCompetencia: number | null
selectedCentroCusto: number | null
```

---

### Componentes Reutilizáveis

#### KPICard.tsx
**Propósito:** Exibir métricas de forma visual

**Props:**
```typescript
interface KPICardProps {
  title: string;              // Título do KPI
  value: string | number;     // Valor principal
  change?: string;            // Variação (ex: "+15%")
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;           // Ícone do Lucide
  gradient: string;           // Classes Tailwind de gradiente
  description?: string;       // Descrição adicional
  trend?: number[];           // Array de valores para mini gráfico
  prefix?: string;            // Prefixo (ex: "R$")
  suffix?: string;            // Sufixo (ex: "/m²")
  loading?: boolean;          // Estado de carregamento
}
```

**Exemplo de uso:**
```tsx
<KPICard
  title="Total Previsto"
  value={formatCurrency(1000000)}
  change="+15%"
  changeType="positive"
  icon={DollarSign}
  gradient="bg-gradient-to-br from-blue-500 to-blue-600"
  trend={[100, 120, 110, 150, 140]}
/>
```

---

#### AlertCard.tsx
**Propósito:** Exibir alertas e notificações

**Props:**
```typescript
interface AlertCardProps {
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  onDismiss?: () => void;
  showIcon?: boolean;
}
```

---

#### StatusBadge.tsx
**Propósito:** Badge visual de status

**Props:**
```typescript
interface StatusBadgeProps {
  status: 'pago' | 'pendente' | 'atrasado' | 'cancelado' | 'fechado' | 'rascunho' | 'aprovado' | 'rejeitado';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}
```

---

#### DocumentGenerator.tsx
**Propósito:** Interface para geração de documentos

**Props:**
```typescript
interface DocumentGeneratorProps {
  competenciaId: number;
  centrosCusto: CentroCusto[];
}
```

**Features:**
- Seleção visual de tipo de documento
- Seleção de centro de custo
- Escolha de formato (HTML/PDF)
- 4 ações: Visualizar, Nova Aba, Imprimir, Download

---

#### DocumentPreview.tsx
**Propósito:** Modal de preview de documentos

**Props:**
```typescript
interface DocumentPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  htmlContent: string;
  title: string;
  onDownload: () => void;
}
```

---

#### RealtimeCalculator.tsx
**Propósito:** Calculadora visual em tempo real

**Props:**
```typescript
interface RealtimeCalculatorProps {
  somatorioDespesas: number;
  acrescimoPercentual: number;
  areaTotal: number;
}
```

**Cálculos exibidos:**
- Somatório de despesas
- Acréscimo percentual
- Total geral
- Área total
- Taxa por m²

**Alertas automáticos:**
- Taxa > R$ 20/m²
- Despesas > R$ 100.000

---

#### AlertsWidget.tsx
**Propósito:** Widget de alertas no header

**Props:**
```typescript
interface AlertsWidgetProps {
  competenciaId: number | null;
}
```

**Features:**
- Contador de alertas não lidos
- Painel dropdown com lista
- Marcar como lido
- Marcar todos como lidos
- Cores por severidade

---

### Hooks Customizados

#### useAPI.ts
**Propósito:** Hook para chamadas à API

**Funções:**
```typescript
// Buscar dados
useAPI<T>(url: string): {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

// Post
apiPost(url: string, data: any): Promise<any>

// Put
apiPut(url: string, data: any): Promise<any>

// Delete
apiDelete(url: string): Promise<any>
```

**Exemplo:**
```typescript
const { data: competencias, loading, refetch } = useAPI<Competencia[]>(
  `/api/previsoes/competencias?condominioId=${selectedCondominio}`
);
```

---

## ⚙️ Funcionalidades Principais

### 1. Gestão de Previsões

**Fluxo completo:**

1. **Criar Competência**
   - Selecionar condomínio
   - Definir mês/ano
   - Informar área total
   - Definir % de acréscimo (padrão 10%)
   - Status inicial: "rascunho"

2. **Adicionar Itens de Despesa**
   - Selecionar categoria (5 categorias fixas)
   - Informar descrição
   - Informar valor
   - Adicionar observações (opcional)
   - Definir ordem de exibição

3. **Calcular Automaticamente**
   - Sistema soma todos os itens
   - Aplica acréscimo percentual
   - Calcula taxa por m² (Total / Área)
   - Calcula rateio proporcional por centro de custo

4. **Visualizar em Tempo Real**
   - Calculadora mostra valores atualizados
   - Alertas automáticos para valores altos
   - Preview de divisão proporcional

5. **Gerar Documentos**
   - Escolher tipo de documento
   - Visualizar preview
   - Baixar, imprimir ou abrir em nova aba

6. **Fechar Competência**
   - Bloqueia edições futuras
   - Registra auditoria
   - Status muda para "fechado"

---

### 2. Gestão de Pagamentos

**Fluxo completo:**

1. **Gerar Pagamentos da Previsão**
   - Sistema cria registros de pagamento
   - Um para cada item da previsão
   - Status inicial: "pendente"
   - Data de vencimento definida

2. **Registrar Pagamentos Manualmente**
   - Adicionar despesas extras
   - Informar categoria
   - Informar valor
   - Adicionar justificativa
   - Aprovar ou não

3. **Marcar como Pago**
   - Informar valor pago (pode diferir do previsto)
   - Informar data de pagamento
   - Selecionar forma de pagamento
   - Adicionar comprovante (URL)
   - Status muda para "pago"

4. **Visualizar Comparação**
   - Tabela projetado x executado
   - Diferença em R$ e %
   - Status visual (dentro/acima/abaixo)
   - Gráficos de variação

5. **Gerenciar Alertas**
   - Sistema gera alertas automáticos
   - Variações > 10%
   - Pagamentos atrasados
   - Despesas não aprovadas

---

### 3. Sistema de Documentos

**Tipos de documentos:**

#### A) Previsão Condomínio
**Conteúdo:**
- Header com logo e endereço
- 5 seções de categorias
- Itens de despesa detalhados
- Subtotais por categoria
- Cálculo para pagamento
- Divisão proporcional em tabela

**Quando usar:**
- Apresentação geral do orçamento
- Reuniões de condomínio
- Aprovação de despesas

---

#### B) Previsão Centro de Custo
**Conteúdo:**
- Header personalizado
- Despesas específicas do centro
- 3 categorias: Pessoal, Contratos, Variáveis
- Cálculo proporcional à taxa geral
- Nota explicativa

**Quando usar:**
- Cobrança de inquilino específico
- Prestação de contas por área
- Análise de custos por centro

---

#### C) Fatura de Condomínio
**Conteúdo:**
- Dados da fatura (número, vencimento)
- Valor mensal destacado
- Carta formal de cobrança
- Dados bancários para pagamento
- Assinatura do condomínio

**Quando usar:**
- Cobrança formal
- Solicitação de pagamento
- Registro contábil

---

#### D) Balancete Consolidado
**Conteúdo:**
- Resumo executivo
- Todas as categorias
- Comparativo mensal
- Status de pagamentos

**Quando usar:**
- Fechamento mensal
- Apresentação para assembleia
- Análise gerencial

---

### 4. Comparação Projetado x Executado

**Como funciona:**

1. **Coleta de Dados**
   - Itens de previsão (valores previstos)
   - Pagamentos efetivados (valores pagos)
   - Despesas extras (valores não previstos)

2. **Cálculo de Totais**
   - Agrupa por categoria
   - Soma valores previstos
   - Soma valores executados

3. **Cálculo de Diferenças**
   ```
   Diferença = Executado - Previsto
   Variação % = (Diferença / Previsto) × 100
   ```

4. **Classificação de Status**
   - **Dentro:** -10% ≤ Variação ≤ +10%
   - **Acima:** Variação > +10%
   - **Abaixo:** Variação < -10%

5. **Visualização**
   - Tabela comparativa
   - Cores por status
   - Gráficos de variação
   - Resumo consolidado

---

### 5. Sistema de Alertas

**Tipos de alertas:**

#### Variação Alta
- **Trigger:** Variação > 10% em qualquer categoria
- **Severidade:** 
  - Alta: > 20%
  - Média: 10-20%
- **Ação:** Revisar orçamento

#### Atraso de Pagamento
- **Trigger:** Pagamento pendente com vencimento ultrapassado
- **Severidade:**
  - Crítica: > 5 pagamentos
  - Alta: 1-5 pagamentos
- **Ação:** Cobrar pagamento

#### Despesa Extra
- **Trigger:** Despesa extra não aprovada
- **Severidade:** Média
- **Ação:** Aprovar ou rejeitar

#### Meta Atingida
- **Trigger:** Meta orçamentária atingida
- **Severidade:** Baixa
- **Ação:** Celebrar ou alertar

**Geração automática:**
- Executada ao salvar previsão
- Executada ao marcar pagamento
- Executada ao adicionar despesa extra
- Pode ser gerada manualmente via API

---

## 🔢 Cálculos e Fórmulas

### 1. Taxa de Condomínio Geral

```
Somatório de Despesas = Σ (Todos os itens de previsão)

Acréscimo = Somatório × (Percentual de Acréscimo / 100)

Total Geral = Somatório + Acréscimo

Taxa por m² = Total Geral / Área Total

Somatório da Taxa Geral = Total Geral
```

**Exemplo:**
```
Despesas = R$ 54.500,00
Acréscimo 10% = R$ 5.450,00
Total = R$ 59.950,00
Área = 3.511,31 m²
Taxa = R$ 17,07/m²
```

---

### 2. Rateio Proporcional

```
Percentual do Centro = (Área do Centro / Área Total) × 100

Valor Proporcional = Total Geral × (Percentual do Centro / 100)
```

**Exemplo:**
```
SUDENE: 3.197,64 m² / 3.511,31 m² = 91,07%
Valor SUDENE = R$ 59.950,00 × 0,9107 = R$ 54.599,87
```

---

### 3. Total de Centro de Custo

```
Despesas Próprias = Σ (Itens específicos do centro)

Despesas Extraordinárias = Σ (Despesas extras do centro)

Valor Proporcional = (Área Centro / Área Total) × Taxa Geral

Total Centro = Despesas Próprias + Despesas Extraordinárias + Valor Proporcional
```

**Exemplo SUDENE:**
```
Despesas Próprias = R$ 28.803,89
Despesas Extraordinárias = R$ 22.163,25
Valor Proporcional = R$ 54.599,87
Total SUDENE = R$ 105.567,01
```

---

### 4. Variação Percentual

```
Diferença = Valor Executado - Valor Previsto

Variação % = (Diferença / Valor Previsto) × 100

Status:
  - Se Variação % > 10: "Acima"
  - Se Variação % < -10: "Abaixo"
  - Caso contrário: "Dentro"
```

**Exemplo:**
```
Previsto = R$ 10.000,00
Executado = R$ 12.500,00
Diferença = R$ 2.500,00
Variação = +25%
Status = "Acima"
```

---

### 5. Percentual Executado

```
Percentual Executado = (Total Pago / Total Previsto) × 100
```

**Exemplo:**
```
Previsto = R$ 100.000,00
Pago = R$ 85.000,00
Executado = 85%
```

---

## 📖 Guia de Desenvolvimento

### Setup Inicial

```bash
# Clonar repositório
git clone <repo-url>
cd previsao-pro

# Instalar dependências
npm install --legacy-peer-deps

# Inicializar banco de dados
chmod +x ./scripts/init-db.sh
./scripts/init-db.sh

# Iniciar desenvolvimento
npm run dev
```

### Estrutura de Branches

```
main         → Produção
develop      → Desenvolvimento
feature/*    → Novas funcionalidades
bugfix/*     → Correções
hotfix/*     → Correções urgentes
```

### Convenção de Commits

```
feat: Nova funcionalidade
fix: Correção de bug
docs: Documentação
style: Formatação
refactor: Refatoração
test: Testes
chore: Tarefas gerais
```

**Exemplos:**
```bash
git commit -m "feat: adiciona sistema de alertas automáticos"
git commit -m "fix: corrige cálculo de taxa por m²"
git commit -m "docs: atualiza documentação de APIs"
```

### Adicionar Nova Funcionalidade

**Passo a passo:**

1. **Criar migration (se necessário)**
```sql
-- /app/migrations/5_nova_funcionalidade.sql
CREATE TABLE nova_tabela (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ...
);
```

2. **Adicionar types**
```typescript
// /app/src/shared/types.ts
export interface NovoTipo {
  id: number;
  ...
}
```

3. **Criar API**
```typescript
// /app/src/worker/nova-api.ts
import { Hono } from "hono";

const novaApp = new Hono<{ Bindings: Env }>();

novaApp.get('/', async (c) => {
  // Implementação
});

export default novaApp;
```

4. **Registrar no index**
```typescript
// /app/src/worker/index.ts
import novaApp from "./nova-api";
app.route('/api/nova', novaApp);
```

5. **Criar componente**
```typescript
// /app/src/react-app/components/NovoComponente.tsx
export default function NovoComponente() {
  // Implementação
}
```

6. **Adicionar rota (se página)**
```typescript
// /app/src/react-app/App.tsx
<Route path="/novo" element={<NovaPage />} />
```

7. **Testar**
```bash
# Testar manualmente
npm run dev

# Testar com curl
curl http://localhost:8787/api/nova
```

---

### Adicionar Novo Tipo de Documento

**Passo a passo:**

1. **Criar template**
```typescript
// /app/src/worker/document-templates.ts
export function gerarNovoDocumento(dados: any): string {
  return `
<!DOCTYPE html>
<html>
  <!-- Template HTML -->
</html>`;
}
```

2. **Importar em previsao-api.ts**
```typescript
import { gerarNovoDocumento } from "./document-templates";
```

3. **Adicionar no switch de tipos**
```typescript
case 'novo_tipo':
  htmlContent = gerarNovoDocumento(dadosConsolidados);
  break;
```

4. **Adicionar no DocumentGenerator**
```typescript
{
  type: 'novo_tipo',
  label: 'Novo Documento',
  icon: FileIcon,
  description: 'Descrição do documento',
  color: 'from-color-500 to-color-600'
}
```

---

### Debug e Troubleshooting

**Problemas comuns:**

#### 1. Banco de dados não inicializado
```bash
# Solução
./scripts/init-db.sh
```

#### 2. Erro de CORS
```typescript
// Verificar em /app/src/worker/index.ts
app.use('*', cors());
```

#### 3. Tipos TypeScript incorretos
```bash
# Limpar e reinstalar
rm -rf node_modules
npm install --legacy-peer-deps
```

#### 4. Vite não compila
```bash
# Verificar versões
npm outdated

# Atualizar package.json se necessário
```

#### 5. Cálculos incorretos
```typescript
// Verificar em previsao-types.ts
export function calcularRateio(...)

// Adicionar logs
console.log('Debug:', { ... });
```

---

### Performance

**Otimizações implementadas:**

1. **Índices no banco**
   - Todos os FKs indexados
   - Campos de busca frequente indexados

2. **Lazy loading**
   - Componentes carregados sob demanda
   - Imagens lazy

3. **Memoization**
   - useMemo para cálculos pesados
   - useCallback para funções

4. **Paginação**
   - Listas grandes paginadas
   - Scroll infinito quando apropriado

5. **Cache**
   - React Query (se implementado)
   - Service Worker (se implementado)

---

### Segurança

**Medidas implementadas:**

1. **Validação de dados**
   - Zod schemas em todos os endpoints
   - Sanitização de inputs

2. **SQL Injection**
   - Prepared statements
   - Parametrização de queries

3. **CORS**
   - Configurado corretamente
   - Whitelist de origins em produção

4. **XSS**
   - React escapa automaticamente
   - dangerouslySetInnerHTML apenas em documentos

5. **CSRF**
   - Tokens em formulários sensíveis
   - SameSite cookies

---

### Testes

**Estratégia de testes:**

```typescript
// Testes unitários
describe('calcularRateio', () => {
  it('deve calcular corretamente', () => {
    const resultado = calcularRateio(...);
    expect(resultado).toBe(...);
  });
});

// Testes de integração
describe('API de previsões', () => {
  it('deve criar competência', async () => {
    const response = await fetch(...);
    expect(response.status).toBe(200);
  });
});

// Testes E2E
describe('Fluxo de previsão', () => {
  it('deve criar e visualizar previsão', () => {
    cy.visit('/previsoes');
    cy.contains('Nova Competência').click();
    // ...
  });
});
```

---

## 🚀 Deploy

### Cloudflare Workers

```bash
# Build
npm run build

# Deploy
wrangler deploy

# Configurar variáveis
wrangler secret put DATABASE_URL
```

### Vercel (Frontend)

```bash
# Conectar repositório
vercel

# Deploy
vercel --prod
```

---

## 📝 Changelog

### Versão 2.0.0 (Atual)

**Features:**
- ✅ Sistema de pagamentos efetivados
- ✅ Comparação projetado x executado
- ✅ Sistema de alertas automáticos
- ✅ Despesas extras e não previstas
- ✅ Gerador de documentos visual
- ✅ Preview de documentos inline
- ✅ Calculadora em tempo real
- ✅ Gráficos avançados
- ✅ API de relatórios
- ✅ Widget de alertas

**Improvements:**
- ✅ Templates de documentos profissionais
- ✅ Componentes reutilizáveis
- ✅ Performance otimizada
- ✅ UX melhorada
- ✅ Documentação completa

**Breaking Changes:**
- Nenhuma (primeira versão major)

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/NovaFeature`)
3. Commit suas mudanças (`git commit -m 'feat: adiciona NovaFeature'`)
4. Push para a branch (`git push origin feature/NovaFeature`)
5. Abra um Pull Request

---

## 📄 Licença

Este projeto é privado e proprietário.

---

## 👥 Time

Desenvolvido com ❤️ para gestão condominial profissional.

---

## 📞 Suporte

Para dúvidas ou suporte:
- Documentação: Este arquivo
- Issues: GitHub Issues
- Email: suporte@previsaopro.com

---

**Última atualização:** $(date)
**Versão:** 2.0.0
