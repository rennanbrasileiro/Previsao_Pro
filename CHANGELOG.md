# 📝 Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [Não Lançado]

### Planejado
- Integração com sistemas de pagamento online
- Aplicativo mobile
- Exportação para Excel
- Notificações por email
- Dashboard para síndicos
- Relatórios personalizáveis

---

## [2.0.0] - 2025-01-18

### 🎉 Primeira Versão Major

Esta é a primeira versão completa e funcional do PrevisãoPro, incluindo todas as funcionalidades essenciais para gestão condominial profissional.

### Adicionado

#### Sistema de Pagamentos
- Sistema completo de controle de pagamentos efetivados
- Status de pagamentos: pendente, pago, atrasado, cancelado
- Geração automática de pagamentos a partir da previsão
- Registro de valor previsto vs valor pago
- Data de vencimento e data de pagamento
- Forma de pagamento e comprovante
- Observações e notas

#### Comparação Projetado x Executado
- Comparação automática entre valores previstos e executados
- Cálculo de diferença em R$ e percentual
- Classificação por status (dentro, acima, abaixo)
- Visualização em tabela e gráficos
- Alertas automáticos para variações significativas
- Resumo consolidado por categoria

#### Sistema de Alertas
- Alertas automáticos de variação alta (> 10%)
- Notificações de pagamentos atrasados
- Alertas de despesas extras não aprovadas
- 4 níveis de severidade (baixa, média, alta, crítica)
- Widget de alertas no header
- Marcar como lido individual ou em massa
- Contador visual de alertas não lidos

#### Despesas Extras
- Registro de despesas não previstas
- Despesas extraordinárias planejadas
- Variações de valores
- Sistema de aprovação
- Justificativas obrigatórias
- Vínculo com competência e centro de custo

#### Sistema de Documentos Profissional
- **Gerador visual de documentos** com interface moderna
- **4 tipos de documentos:**
  - Previsão de Condomínio
  - Previsão por Centro de Custo
  - Fatura de Condomínio
  - Balancete Consolidado
- **Templates HTML profissionais** com design aprimorado
- **4 ações por documento:**
  - Visualizar (preview inline)
  - Abrir em nova aba
  - Imprimir
  - Download
- **Preview melhorado** com modal fullscreen
- Formatação A4 perfeita (210mm x 297mm)
- Margens corretas (2cm a 2.5cm)
- Quebra de página inteligente
- Cores corporativas consistentes
- Print-friendly (preserva cores e formatação)

#### Componentes Reutilizáveis
- **KPICard** - Card de métricas com mini gráfico
- **AlertCard** - Card de alertas com 4 tipos
- **StatusBadge** - Badge de status com 8 variações
- **LoadingState** - Estados de carregamento com skeleton
- **DocumentGenerator** - Gerador visual de documentos
- **DocumentPreview** - Preview de documentos com modal
- **RealtimeCalculator** - Calculadora em tempo real
- **AlertsWidget** - Widget de alertas no header
- **AdvancedCharts** - 5 tipos de gráficos avançados

#### Calculadora em Tempo Real
- Atualização instantânea de valores
- Visual moderno com gradientes
- Barra de progresso do acréscimo
- Alertas automáticos (taxa > R$ 20/m², despesas > R$ 100k)
- Todas as métricas principais visíveis
- Integrado no formulário de previsão

#### Gráficos Avançados
- **EvolutionChart** - Evolução mensal com área
- **CategoryComparison** - Comparação por categoria com barras
- **DistributionChart** - Distribuição percentual com pizza
- **VariationRadar** - Radar de variações multidimensional
- **TrendLine** - Linha de tendência customizável

#### API de Relatórios
- Relatório consolidado (JSON/HTML)
- Relatório comparativo entre períodos
- Relatório por centro de custo
- Performance e histórico
- Geração automática de HTML

#### Melhorias no Banco de Dados
- 4 novas tabelas:
  - `pagamentos_efetivados`
  - `despesas_extras`
  - `historico_comparacao`
  - `alertas`
- 8 novos índices para performance
- Campos adicionais em `centros_custo`:
  - cnpj, razao_social
  - contato, email, telefone
  - percentual_rateio
  - data_vencimento_padrao
- Dados de exemplo completos (seed data)

#### Documentação
- **DOCUMENTATION.md** - Documentação técnica completa (100+ páginas)
- **CONTRIBUTING.md** - Guia de contribuição detalhado
- **CHANGELOG.md** - Este arquivo
- README.md atualizado com badges e links
- Comentários inline no código
- JSDoc em funções complexas

### Melhorado

#### UX/UI
- Interface visual modernizada
- Animações suaves com Framer Motion
- Gradientes e efeitos visuais
- Hover effects profissionais
- Loading states em todos os componentes
- Skeleton screens para carregamento
- Feedback visual imediato
- Design responsivo aprimorado

#### Performance
- Índices otimizados no banco
- Lazy loading de componentes
- Memoization de cálculos pesados
- Queries SQL otimizadas
- Cache de dados quando possível

#### Cálculos
- Validação rigorosa de todos os cálculos
- Distribuição proporcional correta
- Arredondamentos consistentes
- Formatação BR (R$, %)
- Cálculos em tempo real

#### Documentos
- Layout profissional idêntico aos PDFs originais
- Margens e espaçamentos corretos
- Tipografia legível
- Cores corporativas
- Quebra de página inteligente
- Tabelas formatadas
- Headers e footers apropriados

### Corrigido
- Cálculo de taxa por m² agora considera área total correta
- Rateio proporcional agora soma exatamente 100%
- Formatação de moeda brasileira consistente
- Quebra de página em documentos longos
- Margens de documentos PDF
- Performance em listas grandes
- Memory leaks em componentes
- CORS em produção
- Validação de formulários
- Mensagens de erro mais claras

### Removido
- Funções antigas de geração de documentos
- Código duplicado
- Dependências não utilizadas
- Console.logs de debug
- Comentários obsoletos

---

## [1.0.0] - 2024-11-15

### Lançamento Inicial

#### Adicionado
- Sistema básico de previsões de custos
- CRUD de condomínios
- CRUD de competências
- CRUD de itens de previsão
- Cálculo de taxa por m²
- Rateio proporcional básico
- Geração de documentos HTML simples
- Dashboard básico
- Listagem de balancetes

#### Funcionalidades Principais
- Criar e gerenciar condomínios
- Criar previsões mensais (competências)
- Adicionar itens de despesa por categoria
- Calcular automaticamente taxa por m²
- Visualizar divisão proporcional
- Gerar documento HTML básico
- Status rascunho/fechado

#### Tecnologias Base
- React 19 + TypeScript
- Hono (Cloudflare Workers)
- SQLite (Cloudflare D1)
- Tailwind CSS
- Vite

---

## Tipos de Mudanças

- `Adicionado` para novas funcionalidades
- `Melhorado` para mudanças em funcionalidades existentes
- `Descontinuado` para funcionalidades que serão removidas
- `Removido` para funcionalidades removidas
- `Corrigido` para correções de bugs
- `Segurança` para vulnerabilidades

---

## Versionamento

Este projeto segue [Semantic Versioning](https://semver.org/lang/pt-BR/):

- **MAJOR** (X.0.0): Mudanças incompatíveis com versões anteriores
- **MINOR** (0.X.0): Novas funcionalidades compatíveis
- **PATCH** (0.0.X): Correções de bugs compatíveis

### Exemplos:
- `1.0.0` → `2.0.0`: Breaking changes (nova versão major)
- `1.0.0` → `1.1.0`: Nova feature (versão minor)
- `1.0.0` → `1.0.1`: Bug fix (versão patch)

---

## Roadmap

### v2.1.0 (Q1 2025)
- [ ] Sistema de notificações por email
- [ ] Exportação para Excel
- [ ] Importação de planilhas
- [ ] API pública documentada
- [ ] Webhooks

### v2.2.0 (Q2 2025)
- [ ] Aplicativo mobile (React Native)
- [ ] Dashboard para síndicos
- [ ] Relatórios personalizáveis
- [ ] Gráficos de tendências anuais
- [ ] Sistema de backup automático

### v3.0.0 (Q3 2025)
- [ ] Multi-tenancy
- [ ] Integração com bancos
- [ ] Pagamento online
- [ ] Assinatura eletrônica
- [ ] Portal do condômino

---

## Como Contribuir

Veja [CONTRIBUTING.md](CONTRIBUTING.md) para detalhes sobre como contribuir com o projeto.

---

## Suporte

Para questões e suporte:
- 📧 Email: suporte@previsaopro.com
- 💬 GitHub Issues
- 📚 [Documentação](DOCUMENTATION.md)

---

**Última atualização:** 2025-01-18
**Versão atual:** 2.0.0
