import { Hono } from "hono";
import { 
  type PagamentoEfetuado,
  type DespesaExtra,
  type ComparacaoProjetadoExecutado
} from "../shared/previsao-types";

const pagamentosApp = new Hono<{ Bindings: Env }>();

// Listar pagamentos de uma competência
pagamentosApp.get('/competencia/:competenciaId', async (c) => {
  const competenciaId = c.req.param('competenciaId');
  const centroCustoId = c.req.query('centroCustoId');
  const db = c.env.DB;
  
  let query = `
    SELECT * FROM pagamentos_efetivados 
    WHERE competencia_id = ?
  `;
  const params: any[] = [competenciaId];
  
  if (centroCustoId) {
    query += ' AND centro_custo_id = ?';
    params.push(centroCustoId);
  }
  
  query += ' ORDER BY data_vencimento, created_at';
  
  const pagamentos = await db.prepare(query).bind(...params).all();
  return c.json(pagamentos.results);
});

// Registrar pagamento
pagamentosApp.post('/', async (c) => {
  const dados = await c.req.json();
  const db = c.env.DB;
  
  const result = await db.prepare(`
    INSERT INTO pagamentos_efetivados (
      competencia_id, centro_custo_id, tipo_referencia, referencia_id,
      descricao, categoria, valor_previsto, valor_pago, data_vencimento,
      data_pagamento, status, forma_pagamento, observacoes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    dados.competencia_id,
    dados.centro_custo_id || null,
    dados.tipo_referencia,
    dados.referencia_id || null,
    dados.descricao,
    dados.categoria,
    dados.valor_previsto,
    dados.valor_pago || null,
    dados.data_vencimento || null,
    dados.data_pagamento || null,
    dados.status || 'pendente',
    dados.forma_pagamento || null,
    dados.observacoes || null
  ).run();
  
  const novoPagamento = await db.prepare(
    'SELECT * FROM pagamentos_efetivados WHERE id = ?'
  ).bind(result.meta.last_row_id).first();
  
  return c.json(novoPagamento);
});

// Atualizar pagamento
pagamentosApp.put('/:id', async (c) => {
  const id = c.req.param('id');
  const dados = await c.req.json();
  const db = c.env.DB;
  
  await db.prepare(`
    UPDATE pagamentos_efetivados 
    SET valor_pago = ?, data_pagamento = ?, status = ?, 
        forma_pagamento = ?, observacoes = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(
    dados.valor_pago,
    dados.data_pagamento,
    dados.status,
    dados.forma_pagamento || null,
    dados.observacoes || null,
    id
  ).run();
  
  const pagamentoAtualizado = await db.prepare(
    'SELECT * FROM pagamentos_efetivados WHERE id = ?'
  ).bind(id).first();
  
  return c.json(pagamentoAtualizado);
});

// Deletar pagamento
pagamentosApp.delete('/:id', async (c) => {
  const id = c.req.param('id');
  const db = c.env.DB;
  
  await db.prepare('DELETE FROM pagamentos_efetivados WHERE id = ?').bind(id).run();
  return c.json({ success: true });
});

// Gerar pagamentos a partir dos itens de previsão
pagamentosApp.post('/gerar-da-previsao', async (c) => {
  const { competenciaId, centroCustoId, dataVencimento } = await c.req.json();
  const db = c.env.DB;
  
  // Buscar itens de previsão
  const itens = await db.prepare(
    'SELECT * FROM previsao_itens WHERE competencia_id = ?'
  ).bind(competenciaId).all();
  
  // Buscar itens de centro de custo se especificado
  let itensCentroCusto: any[] = [];
  if (centroCustoId) {
    const result = await db.prepare(
      'SELECT * FROM centro_custo_itens WHERE competencia_id = ? AND centro_custo_id = ?'
    ).bind(competenciaId, centroCustoId).all();
    itensCentroCusto = result.results as any[];
  }
  
  // Criar pagamentos para cada item
  const pagamentosCriados: any[] = [];
  
  for (const item of itens.results as any[]) {
    const result = await db.prepare(`
      INSERT INTO pagamentos_efetivados (
        competencia_id, tipo_referencia, referencia_id,
        descricao, categoria, valor_previsto, data_vencimento, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      competenciaId,
      'previsao_item',
      item.id,
      item.descricao,
      item.categoria,
      item.valor,
      dataVencimento,
      'pendente'
    ).run();
    
    pagamentosCriados.push(result.meta.last_row_id);
  }
  
  // Criar pagamentos para itens de centro de custo
  if (centroCustoId) {
    for (const item of itensCentroCusto) {
      const result = await db.prepare(`
        INSERT INTO pagamentos_efetivados (
          competencia_id, centro_custo_id, tipo_referencia, referencia_id,
          descricao, categoria, valor_previsto, data_vencimento, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        competenciaId,
        centroCustoId,
        'previsao_item',
        item.id,
        item.descricao,
        item.categoria,
        item.valor,
        dataVencimento,
        'pendente'
      ).run();
      
      pagamentosCriados.push(result.meta.last_row_id);
    }
  }
  
  return c.json({ 
    success: true, 
    quantidadeGerada: pagamentosCriados.length,
    ids: pagamentosCriados
  });
});

// Comparação projetado x executado
pagamentosApp.get('/comparacao/:competenciaId', async (c) => {
  const competenciaId = c.req.param('competenciaId');
  const centroCustoId = c.req.query('centroCustoId');
  const db = c.env.DB;
  
  // Buscar itens de previsão
  const itens = await db.prepare(
    'SELECT * FROM previsao_itens WHERE competencia_id = ?'
  ).bind(competenciaId).all();
  
  // Buscar pagamentos efetivados
  let queryPagamentos = `
    SELECT * FROM pagamentos_efetivados 
    WHERE competencia_id = ?
  `;
  const paramsPagamentos: any[] = [competenciaId];
  
  if (centroCustoId) {
    queryPagamentos += ' AND centro_custo_id = ?';
    paramsPagamentos.push(centroCustoId);
  }
  
  const pagamentos = await db.prepare(queryPagamentos).bind(...paramsPagamentos).all();
  
  // Buscar despesas extras
  let queryExtras = `
    SELECT * FROM despesas_extras 
    WHERE competencia_id = ?
  `;
  const paramsExtras: any[] = [competenciaId];
  
  if (centroCustoId) {
    queryExtras += ' AND centro_custo_id = ?';
    paramsExtras.push(centroCustoId);
  }
  
  const despesasExtras = await db.prepare(queryExtras).bind(...paramsExtras).all();
  
  // Calcular totais por categoria
  const categorias: Record<string, any> = {};
  
  // Valores previstos
  (itens.results as any[]).forEach((item: any) => {
    if (!categorias[item.categoria]) {
      categorias[item.categoria] = {
        categoria: item.categoria,
        total_previsto: 0,
        total_executado: 0,
        diferenca: 0,
        percentual_variacao: 0,
        status: 'dentro'
      };
    }
    categorias[item.categoria].total_previsto += item.valor;
  });
  
  // Valores executados (pagos)
  (pagamentos.results as any[]).forEach((pag: any) => {
    if (pag.status === 'pago' && pag.valor_pago) {
      if (!categorias[pag.categoria]) {
        categorias[pag.categoria] = {
          categoria: pag.categoria,
          total_previsto: 0,
          total_executado: 0,
          diferenca: 0,
          percentual_variacao: 0,
          status: 'dentro'
        };
      }
      categorias[pag.categoria].total_executado += pag.valor_pago;
    }
  });
  
  // Adicionar despesas extras
  (despesasExtras.results as any[]).forEach((extra: any) => {
    const cat = extra.categoria || 'Não Previstas';
    if (!categorias[cat]) {
      categorias[cat] = {
        categoria: cat,
        total_previsto: 0,
        total_executado: 0,
        diferenca: 0,
        percentual_variacao: 0,
        status: 'dentro'
      };
    }
    categorias[cat].total_executado += extra.valor;
  });
  
  // Calcular diferenças e variações
  Object.values(categorias).forEach((cat: any) => {
    cat.diferenca = cat.total_executado - cat.total_previsto;
    cat.percentual_variacao = cat.total_previsto > 0 
      ? (cat.diferenca / cat.total_previsto) * 100 
      : 0;
    
    if (cat.percentual_variacao > 10) {
      cat.status = 'acima';
    } else if (cat.percentual_variacao < -10) {
      cat.status = 'abaixo';
    } else {
      cat.status = 'dentro';
    }
  });
  
  // Calcular totais gerais
  const totalPrevisto = Object.values(categorias).reduce((sum: number, cat: any) => sum + cat.total_previsto, 0);
  const totalExecutado = Object.values(categorias).reduce((sum: number, cat: any) => sum + cat.total_executado, 0);
  const diferencaTotal = totalExecutado - totalPrevisto;
  const percentualVariacaoTotal = totalPrevisto > 0 ? (diferencaTotal / totalPrevisto) * 100 : 0;
  
  return c.json({
    categorias: Object.values(categorias),
    resumo: {
      total_previsto: totalPrevisto,
      total_executado: totalExecutado,
      diferenca: diferencaTotal,
      percentual_variacao: percentualVariacaoTotal,
      status: percentualVariacaoTotal > 10 ? 'acima' : percentualVariacaoTotal < -10 ? 'abaixo' : 'dentro'
    }
  });
});

// Despesas Extras
pagamentosApp.get('/despesas-extras/:competenciaId', async (c) => {
  const competenciaId = c.req.param('competenciaId');
  const centroCustoId = c.req.query('centroCustoId');
  const db = c.env.DB;
  
  let query = `
    SELECT * FROM despesas_extras 
    WHERE competencia_id = ?
  `;
  const params: any[] = [competenciaId];
  
  if (centroCustoId) {
    query += ' AND centro_custo_id = ?';
    params.push(centroCustoId);
  }
  
  query += ' ORDER BY data_ocorrencia DESC, created_at DESC';
  
  const despesas = await db.prepare(query).bind(...params).all();
  return c.json(despesas.results);
});

pagamentosApp.post('/despesas-extras', async (c) => {
  const dados = await c.req.json();
  const db = c.env.DB;
  
  const result = await db.prepare(`
    INSERT INTO despesas_extras (
      competencia_id, centro_custo_id, categoria, descricao,
      valor, tipo, data_ocorrencia, justificativa, aprovado
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    dados.competencia_id,
    dados.centro_custo_id || null,
    dados.categoria,
    dados.descricao,
    dados.valor,
    dados.tipo || 'nao_prevista',
    dados.data_ocorrencia || null,
    dados.justificativa || null,
    dados.aprovado || 0
  ).run();
  
  const novaDespesa = await db.prepare(
    'SELECT * FROM despesas_extras WHERE id = ?'
  ).bind(result.meta.last_row_id).first();
  
  return c.json(novaDespesa);
});

pagamentosApp.put('/despesas-extras/:id', async (c) => {
  const id = c.req.param('id');
  const dados = await c.req.json();
  const db = c.env.DB;
  
  await db.prepare(`
    UPDATE despesas_extras 
    SET categoria = ?, descricao = ?, valor = ?, tipo = ?,
        data_ocorrencia = ?, justificativa = ?, aprovado = ?,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(
    dados.categoria,
    dados.descricao,
    dados.valor,
    dados.tipo,
    dados.data_ocorrencia || null,
    dados.justificativa || null,
    dados.aprovado,
    id
  ).run();
  
  const despesaAtualizada = await db.prepare(
    'SELECT * FROM despesas_extras WHERE id = ?'
  ).bind(id).first();
  
  return c.json(despesaAtualizada);
});

pagamentosApp.delete('/despesas-extras/:id', async (c) => {
  const id = c.req.param('id');
  const db = c.env.DB;
  
  await db.prepare('DELETE FROM despesas_extras WHERE id = ?').bind(id).run();
  return c.json({ success: true });
});

export default pagamentosApp;
