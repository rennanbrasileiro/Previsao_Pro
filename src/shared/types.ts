import z from "zod";

// Schema para Condomínio
export const CondominioSchema = z.object({
  id: z.number(),
  nome: z.string(),
  cnpj: z.string().nullable(),
  tipo: z.enum(['residencial', 'comercial', 'misto']),
  endereco: z.string().nullable(),
  area_total_m2: z.number(),
  ativo: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Condominio = z.infer<typeof CondominioSchema>;

// Schema para Unidade
export const UnidadeSchema = z.object({
  id: z.number(),
  condominio_id: z.number(),
  identificacao: z.string(),
  area_m2: z.number(),
  inquilino_id: z.number().nullable(),
  ativo: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Unidade = z.infer<typeof UnidadeSchema>;

// Schema para Inquilino
export const InquilinoSchema = z.object({
  id: z.number(),
  nome_razao: z.string(),
  cnpj_cpf: z.string().nullable(),
  contato: z.string().nullable(),
  data_inicio: z.string().nullable(),
  data_fim: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Inquilino = z.infer<typeof InquilinoSchema>;

// Schema para Categoria
export const CategoriaSchema = z.object({
  id: z.number(),
  nome: z.string(),
  tipo: z.enum(['pessoal', 'contratos', 'variavel', 'concessionaria', 'extra', 'reforma', 'outros', 'taxa']),
  descricao: z.string().nullable(),
  ativo: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Categoria = z.infer<typeof CategoriaSchema>;

// Schema para Item de Despesa
export const ItemDespesaSchema = z.object({
  id: z.number(),
  categoria_id: z.number(),
  fornecedor_id: z.number().nullable(),
  descricao: z.string(),
  periodicidade: z.enum(['mensal', 'anual', 'eventual']),
  valor_base: z.number(),
  indice_reajuste: z.string().nullable(),
  mes_referencia: z.number().nullable(),
  rateavel: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type ItemDespesa = z.infer<typeof ItemDespesaSchema>;

// Schema para Balancete
export const BalanceteSchema = z.object({
  id: z.number(),
  condominio_id: z.number(),
  mes: z.number(),
  ano: z.number(),
  consolidado_json: z.string().nullable(),
  taxa_m2: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Balancete = z.infer<typeof BalanceteSchema>;

// Schema para dados consolidados do balancete
export const DadosBalanceteSchema = z.object({
  totaisPorCategoria: z.record(z.number()),
  taxaM2: z.number(),
  totalMensal: z.number(),
  rateio: z.array(z.object({
    unidadeId: z.number(),
    identificacao: z.string(),
    inquilino: z.string().nullable(),
    areaM2: z.number(),
    valorCondominial: z.number(),
    valorCentroCusto: z.number(),
    valorTotal: z.number(),
  })),
});

export type DadosBalancete = z.infer<typeof DadosBalanceteSchema>;

// Schema para relatório do inquilino
export const RelatorioInquilinoSchema = z.object({
  inquilino: InquilinoSchema,
  unidades: z.array(UnidadeSchema),
  parcelaCondominial: z.number(),
  servicosDedicados: z.number(),
  valorTotal: z.number(),
  detalhamento: z.array(z.object({
    categoria: z.string(),
    valor: z.number(),
    rateio: z.string(),
  })),
});

export type RelatorioInquilino = z.infer<typeof RelatorioInquilinoSchema>;
