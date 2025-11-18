import z from "zod";

// Schema para Competência
export const CompetenciaSchema = z.object({
  id: z.number(),
  mes: z.number().min(1).max(12),
  ano: z.number(),
  condominio_id: z.number(),
  status: z.enum(['rascunho', 'fechado']),
  area_total_m2: z.number(),
  taxa_m2: z.number().nullable(),
  acrescimo_percentual: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Competencia = z.infer<typeof CompetenciaSchema>;

// Schema para Item de Previsão
export const PrevisaoItemSchema = z.object({
  id: z.number(),
  competencia_id: z.number(),
  categoria: z.enum([
    'Despesas de Pessoal',
    'Contratos Mensais',
    'Despesas Concessionárias (Estimado)',
    'Despesas Anuais (Estimado)',
    'Despesas Mensais Variáveis (Estimado)'
  ]),
  descricao: z.string(),
  valor: z.number(),
  observacoes: z.string().nullable(),
  ordem: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type PrevisaoItem = z.infer<typeof PrevisaoItemSchema>;

// Schema para Centro de Custo
export const CentroCustoSchema = z.object({
  id: z.number(),
  nome: z.string(),
  condominio_id: z.number(),
  area_m2: z.number(),
  endereco: z.string().nullable(),
  cnpj: z.string().nullable(),
  ativo: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type CentroCusto = z.infer<typeof CentroCustoSchema>;

// Schema para Item de Centro de Custo
export const CentroCustoItemSchema = z.object({
  id: z.number(),
  competencia_id: z.number(),
  centro_custo_id: z.number(),
  categoria: z.enum(['Pessoal', 'Contratos', 'Variáveis']),
  descricao: z.string(),
  valor: z.number(),
  ordem: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type CentroCustoItem = z.infer<typeof CentroCustoItemSchema>;

// Schema para dados consolidados da previsão
export const PrevisaoConsolidadaSchema = z.object({
  competencia: CompetenciaSchema,
  condominio: z.object({
    nome: z.string(),
    endereco: z.string().nullable(),
    cnpj: z.string().nullable(),
  }),
  itens: z.array(PrevisaoItemSchema).optional(),
  totaisPorCategoria: z.record(z.number()),
  somatorioDespesas: z.number(),
  acrescimo: z.number(),
  taxaGeral: z.number(),
  somatarioTaxaGeral: z.number(),
  rateioUnidades: z.array(z.object({
    nome: z.string(),
    area_m2: z.number(),
    valor: z.number(),
  })),
  centrosCusto: z.array(z.object({
    centro: CentroCustoSchema,
    itens: z.array(CentroCustoItemSchema),
    somatorioCentro: z.number(),
    proporcionalTaxa: z.number(),
    valorTotal: z.number(),
  })),
});

export type PrevisaoConsolidada = z.infer<typeof PrevisaoConsolidadaSchema>;

// Schema para auditoria
export const AuditoriaSchema = z.object({
  id: z.number(),
  competencia_id: z.number(),
  tabela: z.string(),
  registro_id: z.number(),
  campo: z.string(),
  valor_anterior: z.string().nullable(),
  valor_novo: z.string(),
  usuario: z.string().nullable(),
  timestamp: z.string(),
});

export type Auditoria = z.infer<typeof AuditoriaSchema>;

// Schema para Pagamentos Efetivados
export const PagamentoEfetuadoSchema = z.object({
  id: z.number(),
  competencia_id: z.number(),
  centro_custo_id: z.number().nullable(),
  tipo_referencia: z.enum(['previsao_item', 'despesa_extra', 'taxa_geral']),
  referencia_id: z.number().nullable(),
  descricao: z.string(),
  categoria: z.string(),
  valor_previsto: z.number(),
  valor_pago: z.number().nullable(),
  data_vencimento: z.string().nullable(),
  data_pagamento: z.string().nullable(),
  status: z.enum(['pendente', 'pago', 'atrasado', 'cancelado']),
  forma_pagamento: z.string().nullable(),
  comprovante_url: z.string().nullable(),
  observacoes: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type PagamentoEfetuado = z.infer<typeof PagamentoEfetuadoSchema>;

// Schema para Despesas Extras
export const DespesaExtraSchema = z.object({
  id: z.number(),
  competencia_id: z.number(),
  centro_custo_id: z.number().nullable(),
  categoria: z.string(),
  descricao: z.string(),
  valor: z.number(),
  tipo: z.enum(['extraordinaria', 'nao_prevista', 'variacao']),
  data_ocorrencia: z.string().nullable(),
  justificativa: z.string().nullable(),
  aprovado: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type DespesaExtra = z.infer<typeof DespesaExtraSchema>;

// Schema para Comparação Projetado x Executado
export const ComparacaoProjetadoExecutadoSchema = z.object({
  categoria: z.string(),
  total_previsto: z.number(),
  total_executado: z.number(),
  diferenca: z.number(),
  percentual_variacao: z.number(),
  status: z.enum(['dentro', 'acima', 'abaixo']),
});

export type ComparacaoProjetadoExecutado = z.infer<typeof ComparacaoProjetadoExecutadoSchema>;

// Schema para Alertas
export const AlertaSchema = z.object({
  id: z.number(),
  competencia_id: z.number(),
  tipo: z.enum(['variacao_alta', 'atraso_pagamento', 'despesa_extra', 'meta_atingida']),
  severidade: z.enum(['baixa', 'media', 'alta', 'critica']),
  titulo: z.string(),
  descricao: z.string(),
  valor_relacionado: z.number().nullable(),
  lido: z.boolean(),
  created_at: z.string(),
});

export type Alerta = z.infer<typeof AlertaSchema>;

// Categorias fixas para previsão
export const CATEGORIAS_PREVISAO = [
  'Despesas de Pessoal',
  'Contratos Mensais',
  'Despesas Concessionárias (Estimado)',
  'Despesas Anuais (Estimado)',
  'Despesas Mensais Variáveis (Estimado)'
] as const;

export const CATEGORIAS_CENTRO_CUSTO = [
  'Pessoal',
  'Contratos',
  'Variáveis'
] as const;

// Meses em português
export const MESES = [
  { value: 1, label: 'JANEIRO' },
  { value: 2, label: 'FEVEREIRO' },
  { value: 3, label: 'MARÇO' },
  { value: 4, label: 'ABRIL' },
  { value: 5, label: 'MAIO' },
  { value: 6, label: 'JUNHO' },
  { value: 7, label: 'JULHO' },
  { value: 8, label: 'AGOSTO' },
  { value: 9, label: 'SETEMBRO' },
  { value: 10, label: 'OUTUBRO' },
  { value: 11, label: 'NOVEMBRO' },
  { value: 12, label: 'DEZEMBRO' },
] as const;

// Funções utilitárias
export function formatCurrencyBR(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatNumberBR(value: number, decimals: number = 2): string {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function getCompetenciaText(mes: number, ano: number): string {
  const mesNome = MESES.find(m => m.value === mes)?.label || '';
  return `${mesNome}/${ano}`;
}

export function calcularRateio(areaUnidade: number, areaTotalCondominio: number, valorTotal: number): number {
  return (areaUnidade / areaTotalCondominio) * valorTotal;
}
