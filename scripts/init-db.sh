#!/bin/bash

echo "🚀 Inicializando banco de dados..."

# Verificar se wrangler está instalado
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler não encontrado. Instale com: npm install -g wrangler"
    exit 1
fi

# Aplicar migrations
echo "📦 Aplicando migrations..."

# Migration 1
echo "  ➜ Executando migration 1..."
wrangler d1 execute DB --local --file=./migrations/1.sql

# Migration 2
echo "  ➜ Executando migration 2..."
wrangler d1 execute DB --local --file=./migrations/2.sql

# Migration 3
echo "  ➜ Executando migration 3..."
wrangler d1 execute DB --local --file=./migrations/3.sql

# Migration 4 (Seed data)
echo "  ➜ Executando migration 4 (seed data)..."
wrangler d1 execute DB --local --file=./migrations/4_seed_data.sql

echo "✅ Banco de dados inicializado com sucesso!"
echo ""
echo "📊 Dados de exemplo criados:"
echo "  - Condomínio: SOUZA MELO TOWER"
echo "  - Centros de Custo: SUDENE, SOUZA & MACEDO, BRITO E SOBRAL"
echo "  - Competência: Novembro/2025"
echo "  - Itens de previsão completos"
echo "  - Despesas extraordinárias da SUDENE"
echo ""
echo "🌐 Inicie o servidor com: npm run dev"
