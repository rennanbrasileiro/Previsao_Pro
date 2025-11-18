import { Hono } from "hono";
import { cors } from "hono/cors";
import { 
  type Condominio,
  type Balancete,
  type DadosBalancete,
  type RelatorioInquilino
} from "../shared/types";
import previsaoApp from "./previsao-api";
import dashboardApp from "./dashboard-api";
import pagamentosApp from "./pagamentos-api";

const app = new Hono<{ Bindings: Env }>();

app.use('*', cors());

// Montar rotas de previsão
app.route('/api/previsoes', previsaoApp);

// Montar rotas de dashboard
app.route('/api/dashboard', dashboardApp);

// Montar rotas de pagamentos
app.route('/api/pagamentos', pagamentosApp);

// API para Condomínios
app.get('/api/condominios', async (c) => {
  const db = c.env.DB;
  const condominios = await db.prepare('SELECT * FROM condominios WHERE ativo = 1').all();
  return c.json(condominios.results);
});

app.get('/api/condominios/:id', async (c) => {
  const id = c.req.param('id');
  const db = c.env.DB;
  const condominio = await db.prepare('SELECT * FROM condominios WHERE id = ? AND ativo = 1').bind(id).first();
  
  if (!condominio) {
    return c.json({ error: 'Condomínio não encontrado' }, 404);
  }
  
  return c.json(condominio);
});

// API para Unidades
app.get('/api/condominios/:id/unidades', async (c) => {
  const condominioId = c.req.param('id');
  const db = c.env.DB;
  
  const unidades = await db.prepare(`
    SELECT u.*, i.nome_razao as inquilino_nome 
    FROM unidades u 
    LEFT JOIN inquilinos i ON u.inquilino_id = i.id 
    WHERE u.condominio_id = ? AND u.ativo = 1
  `).bind(condominioId).all();
  
  return c.json(unidades.results);
});

// API para Categorias
app.get('/api/categorias', async (c) => {
  const db = c.env.DB;
  const categorias = await db.prepare('SELECT * FROM categorias WHERE ativo = 1 ORDER BY nome').all();
  return c.json(categorias.results);
});

// API para Centros de Custo
app.get('/api/centros-custo', async (c) => {
  const condominioId = c.req.query('condominioId');
  const db = c.env.DB;
  
  if (!condominioId) {
    return c.json({ error: 'condominioId é obrigatório' }, 400);
  }
  
  const centros = await db.prepare(
    'SELECT * FROM centros_custo WHERE condominio_id = ? AND ativo = 1 ORDER BY nome'
  ).bind(condominioId).all();
  
  return c.json(centros.results);
});

// API para Itens de Despesa
app.get('/api/itens', async (c) => {
  const categoriaId = c.req.query('categoriaId');
  const db = c.env.DB;
  
  let query = `
    SELECT i.*, c.nome as categoria_nome, f.nome as fornecedor_nome
    FROM item_despesa i
    LEFT JOIN categorias c ON i.categoria_id = c.id
    LEFT JOIN fornecedores f ON i.fornecedor_id = f.id
    WHERE 1=1
  `;
  
  const params: any[] = [];
  
  if (categoriaId) {
    query += ' AND i.categoria_id = ?';
    params.push(categoriaId);
  }
  
  query += ' ORDER BY c.nome, i.descricao';
  
  const itens = await db.prepare(query).bind(...params).all();
  return c.json(itens.results);
});

// API para gerar/calcular balancete
app.post('/api/balancetes/calcular', async (c) => {
  const { condominioId, mes, ano } = await c.req.json();
  const db = c.env.DB;
  
  // Buscar condomínio
  const condominio = await db.prepare('SELECT * FROM condominios WHERE id = ?').bind(condominioId).first() as Condominio;
  if (!condominio) {
    return c.json({ error: 'Condomínio não encontrado' }, 404);
  }
  
  // Buscar unidades ativas
  const unidades = await db.prepare(`
    SELECT u.*, i.nome_razao as inquilino_nome 
    FROM unidades u 
    LEFT JOIN inquilinos i ON u.inquilino_id = i.id 
    WHERE u.condominio_id = ? AND u.ativo = 1
  `).bind(condominioId).all();
  
  // Buscar itens de despesa e calcular totais por categoria
  const itens = await db.prepare(`
    SELECT i.*, c.nome as categoria_nome, c.tipo as categoria_tipo
    FROM item_despesa i
    JOIN categorias c ON i.categoria_id = c.id
    WHERE c.ativo = 1
  `).all();
  
  const totaisPorCategoria: Record<string, number> = {};
  let totalMensal = 0;
  
  for (const item of itens.results as any[]) {
    let valor = 0;
    
    if (item.periodicidade === 'mensal') {
      valor = item.valor_base;
    } else if (item.periodicidade === 'anual') {
      valor = item.valor_base / 12; // Rateio anual
    }
    
    const categoria = item.categoria_nome;
    if (!totaisPorCategoria[categoria]) {
      totaisPorCategoria[categoria] = 0;
    }
    totaisPorCategoria[categoria] += valor;
    totalMensal += valor;
  }
  
  // Calcular taxa por m²
  const areaTotal = unidades.results.reduce((sum: number, u: any) => sum + u.area_m2, 0);
  const taxaM2 = totalMensal / areaTotal;
  
  // Calcular rateio por unidade
  const rateio = unidades.results.map((unidade: any) => ({
    unidadeId: unidade.id,
    identificacao: unidade.identificacao,
    inquilino: unidade.inquilino_nome,
    areaM2: unidade.area_m2,
    valorCondominial: unidade.area_m2 * taxaM2,
    valorCentroCusto: 0, // Por enquanto zero, será implementado posteriormente
    valorTotal: unidade.area_m2 * taxaM2,
  }));
  
  // Preparar dados consolidados
  const dadosConsolidados: DadosBalancete = {
    totaisPorCategoria,
    taxaM2,
    totalMensal,
    rateio,
  };
  
  // Salvar ou atualizar balancete
  const balanceteExistente = await db.prepare(
    'SELECT id FROM balancetes WHERE condominio_id = ? AND mes = ? AND ano = ?'
  ).bind(condominioId, mes, ano).first();
  
  if (balanceteExistente) {
    await db.prepare(`
      UPDATE balancetes 
      SET consolidado_json = ?, taxa_m2 = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(JSON.stringify(dadosConsolidados), taxaM2, balanceteExistente.id).run();
  } else {
    await db.prepare(`
      INSERT INTO balancetes (condominio_id, mes, ano, consolidado_json, taxa_m2)
      VALUES (?, ?, ?, ?, ?)
    `).bind(condominioId, mes, ano, JSON.stringify(dadosConsolidados), taxaM2).run();
  }
  
  return c.json(dadosConsolidados);
});

// API para buscar balancete existente
app.get('/api/balancetes', async (c) => {
  const condominioId = c.req.query('condominioId');
  const mes = c.req.query('mes');
  const ano = c.req.query('ano');
  const db = c.env.DB;
  
  if (!condominioId || !mes || !ano) {
    return c.json({ error: 'Parâmetros obrigatórios: condominioId, mes, ano' }, 400);
  }
  
  const balancete = await db.prepare(
    'SELECT * FROM balancetes WHERE condominio_id = ? AND mes = ? AND ano = ?'
  ).bind(condominioId, mes, ano).first() as Balancete;
  
  if (!balancete) {
    return c.json({ error: 'Balancete não encontrado' }, 404);
  }
  
  const dadosConsolidados = JSON.parse(balancete.consolidado_json || '{}') as DadosBalancete;
  
  return c.json(dadosConsolidados);
});

// API para relatório do inquilino
app.get('/api/inquilinos/:id/relatorio', async (c) => {
  const inquilinoId = c.req.param('id');
  const mes = c.req.query('mes') || new Date().getMonth() + 1;
  const ano = c.req.query('ano') || new Date().getFullYear();
  const db = c.env.DB;
  
  // Buscar inquilino
  const inquilino = await db.prepare('SELECT * FROM inquilinos WHERE id = ?').bind(inquilinoId).first();
  if (!inquilino) {
    return c.json({ error: 'Inquilino não encontrado' }, 404);
  }
  
  // Buscar unidades do inquilino
  const unidades = await db.prepare(`
    SELECT * FROM unidades WHERE inquilino_id = ? AND ativo = 1
  `).bind(inquilinoId).all();
  
  if (!unidades.results.length) {
    return c.json({ error: 'Nenhuma unidade encontrada para este inquilino' }, 404);
  }
  
  // Calcular área total do inquilino
  const areaTotalInquilino = unidades.results.reduce((sum: number, u: any) => sum + u.area_m2, 0);
  
  // Buscar balancete do período
  const condominioId = (unidades.results[0] as any).condominio_id;
  const balancete = await db.prepare(
    'SELECT * FROM balancetes WHERE condominio_id = ? AND mes = ? AND ano = ?'
  ).bind(condominioId, mes, ano).first() as Balancete;
  
  if (!balancete) {
    return c.json({ error: 'Balancete não encontrado para o período' }, 404);
  }
  
  const dadosBalancete = JSON.parse(balancete.consolidado_json || '{}') as DadosBalancete;
  
  // Calcular parcela condominial
  const parcelaCondominial = areaTotalInquilino * dadosBalancete.taxaM2;
  
  // Por enquanto, serviços dedicados = 0 (será implementado posteriormente)
  const servicosDedicados = 0;
  
  const relatorio: RelatorioInquilino = {
    inquilino: inquilino as any,
    unidades: unidades.results as any,
    parcelaCondominial,
    servicosDedicados,
    valorTotal: parcelaCondominial + servicosDedicados,
    detalhamento: Object.entries(dadosBalancete.totaisPorCategoria).map(([categoria, valor]) => ({
      categoria,
      valor: (valor * areaTotalInquilino) / (dadosBalancete.totalMensal / dadosBalancete.taxaM2),
      rateio: `${((areaTotalInquilino / (dadosBalancete.totalMensal / dadosBalancete.taxaM2)) * 100).toFixed(2)}%`
    }))
  };
  
  return c.json(relatorio);
});

// Servir arquivos estáticos
app.get('*', async (c) => {
  return c.text('API CondoManager Pro - Endpoints disponíveis em /api/*');
});

export default app;
