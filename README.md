# 🏢 PrevisãoPro - Sistema Completo de Gestão Condominial

Sistema profissional para gestão de previsões de custos, balancetes e pagamentos condominiais, com comparação projetado x executado em tempo real.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.x-61dafb)](https://react.dev/)
[![License](https://img.shields.io/badge/License-Proprietary-red)]()

## 📚 Documentação

- 📘 **[Documentação Técnica Completa](DOCUMENTATION.md)** - Arquitetura, APIs, Componentes
- 🤝 **[Guia de Contribuição](CONTRIBUTING.md)** - Como contribuir com o projeto
- 🚀 **[Guia de Deploy](docs/DEPLOY.md)** - Instruções de deployment
- 🔧 **[API Reference](docs/API.md)** - Referência completa de APIs

## 📑 Índice

- [Funcionalidades](#-funcionalidades-principais)
- [Screenshots](#-screenshots)
- [Instalação](#-instalação-e-configuração)
- [Como Usar](#-como-usar)
- [Tecnologias](#-tecnologias-utilizadas)
- [Arquitetura](#-arquitetura)
- [Contribuindo](#-contribuindo)
- [Licença](#-licença)

## ✨ Funcionalidades Principais

### 📊 Dashboard Inteligente
- KPIs visuais em tempo real
- Gráficos de evolução mensal
- Análise de tendências
- Comparação entre períodos
- Sistema de alertas automáticos

### 📝 Previsões de Custos
- Criação de competências mensais
- 5 categorias de despesas
- Cálculo automático de taxa por m²
- Múltiplos centros de custo
- Geração de documentos profissionais (PDF/HTML)
- Status: rascunho ou fechado

### 💰 Gestão de Pagamentos
- Controle de pagamentos efetivados
- Status: pendente, pago, atrasado, cancelado
- Comparação projetado x executado
- Variação percentual por categoria
- Alertas automáticos de variação

### 📑 Despesas Extras
- Registro de despesas não previstas
- Despesas extraordinárias
- Sistema de aprovação
- Impacto no orçamento total

### 🏗️ Centros de Custo
- Múltiplos centros por condomínio
- Rateio proporcional por área
- Despesas específicas por centro
- Documentos individualizados

### 📄 Documentos Profissionais
Três tipos de documentos com layout profissional:

1. **Previsão de Despesas Condomínio**
   - Todas as categorias de despesas
   - Cálculo de taxa geral
   - Divisão proporcional

2. **Previsão por Centro de Custo**
   - Despesas específicas do centro
   - Acréscimo proporcional
   - Nota explicativa

3. **Fatura de Condomínio**
   - Formato profissional de fatura
   - Dados bancários
   - Discriminação completa

## 🚀 Instalação e Configuração

### Pré-requisitos
- Node.js 20+
- npm ou yarn

### Instalação

```bash
# Clone o repositório
git clone <repo-url>
cd previsao-pro

# Instale as dependências
npm install --legacy-peer-deps

# Inicialize o banco de dados
chmod +x ./scripts/init-db.sh
./scripts/init-db.sh

# Inicie o servidor de desenvolvimento
npm run dev
```

O sistema estará disponível em `http://localhost:5173`

## 📁 Estrutura do Projeto

```
/app
├── src/
│   ├── react-app/           # Frontend React
│   │   ├── pages/           # Páginas principais
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Previsoes.tsx
│   │   │   ├── Pagamentos.tsx
│   │   │   └── Balancetes.tsx
│   │   ├── components/      # Componentes reutilizáveis
│   │   └── hooks/           # Custom hooks
│   ├── worker/              # Backend API (Hono)
│   │   ├── index.ts
│   │   ├── previsao-api.ts
│   │   ├── pagamentos-api.ts
│   │   ├── dashboard-api.ts
│   │   └── alertas-api.ts
│   └── shared/              # Types compartilhados
├── migrations/              # Migrations do banco
└── scripts/                 # Scripts utilitários
```

## 🎯 Como Usar

### 1. Dashboard
Acesse a visão geral do sistema com métricas consolidadas.

### 2. Criar Previsão
1. Vá para **Previsões**
2. Clique em **Nova Competência**
3. Selecione mês e ano
4. Adicione itens de despesa por categoria
5. Configure o acréscimo percentual
6. Salve e gere documentos

### 3. Gerenciar Pagamentos
1. Vá para **Pagamentos**
2. Selecione a competência
3. Gere pagamentos da previsão (automático)
4. Marque como pago quando efetivado
5. Acompanhe a comparação projetado x executado

### 4. Gerar Documentos
1. Na página de **Previsões**
2. Selecione a competência
3. Escolha o tipo de documento:
   - Previsão Condomínio
   - Previsão Centro de Custo
   - Fatura
   - Balancete Consolidado
4. Clique em **PDF** ou **HTML**
5. Visualize o preview antes de baixar

## 🔢 Cálculos Implementados

### Taxa Geral
```
Somatório Despesas = Σ (Todas as categorias)
Acréscimo = Somatório × (% Acréscimo / 100)
Total Geral = Somatório + Acréscimo
Taxa por m² = Total Geral / Área Total
```

### Rateio por Centro de Custo
```
Valor Proporcional = (Área Centro / Área Total) × Total Geral
```

### Total Centro de Custo
```
Total Centro = Despesas Específicas + Valor Proporcional Taxa Geral
```

### Comparação Projetado x Executado
```
Diferença = Executado - Previsto
Variação % = (Diferença / Previsto) × 100
Status:
  - Dentro: -10% a +10%
  - Acima: > +10%
  - Abaixo: < -10%
```

## 🎨 Tecnologias Utilizadas

- **Frontend:** React 19 + TypeScript
- **Backend:** Hono (Cloudflare Workers)
- **Database:** SQLite (Cloudflare D1)
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Charts:** Recharts
- **Build:** Vite
- **Icons:** Lucide React

## 📊 Dados de Exemplo

O sistema vem com dados de exemplo pré-carregados:

- **Condomínio:** SOUZA MELO TOWER
- **Área Total:** 3.511,31 m²
- **Centros de Custo:**
  - SUDENE (3.197,64 m²)
  - SOUZA & MACEDO (156,835 m²)
  - BRITO E SOBRAL (156,835 m²)
- **Competência:** Novembro/2025
- **Itens de previsão completos**
- **Despesas extraordinárias**

## 🔐 Segurança

- Validação de dados com Zod
- TypeScript para type safety
- SQL parametrizado (prevenção de SQL injection)
- CORS configurado

## 🚀 Deploy

Para deploy em produção no Cloudflare:

```bash
# Build
npm run build

# Deploy
wrangler deploy
```

## 📝 Licença

Este projeto foi desenvolvido para uso interno.

---

**Desenvolvido com ❤️ para gestão condominial profissional**
