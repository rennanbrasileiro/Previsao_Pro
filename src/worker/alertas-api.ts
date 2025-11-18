import { Hono } from "hono";

const alertasApp = new Hono<{ Bindings: Env }>();

// Gerar alertas automaticamente baseado em comparação
alertasApp.post('/gerar/:competenciaId', async (c) => {
  const competenciaId = c.req.param('competenciaId');
  const db = c.env.DB;
  
  try {
    // Buscar comparação projetado x executado
    const itens = await db.prepare(
      'SELECT * FROM previsao_itens WHERE competencia_id = ?'
    ).bind(competenciaId).all();
    
    const pagamentos = await db.prepare(
      'SELECT * FROM pagamentos_efetivados WHERE competencia_id = ?'
    ).bind(competenciaId).all();
    
    const despesasExtras = await db.prepare(
      'SELECT * FROM despesas_extras WHERE competencia_id = ?'
    ).bind(competenciaId).all();
    
    // Calcular totais por categoria
    const categorias: Record<string, any> = {};
    
    (itens.results as any[]).forEach((item: any) => {
      if (!categorias[item.categoria]) {
        categorias[item.categoria] = { previsto: 0, executado: 0 };
      }
      categorias[item.categoria].previsto += item.valor;
    });
    
    (pagamentos.results as any[]).forEach((pag: any) => {
      if (pag.status === 'pago' && pag.valor_pago) {
        if (!categorias[pag.categoria]) {
          categorias[pag.categoria] = { previsto: 0, executado: 0 };
        }
        categorias[pag.categoria].executado += pag.valor_pago;
      }
    });
    
    // Gerar alertas
    const alertasGerados = [];
    
    // Alerta de variação alta (>10%)
    for (const [categoria, valores] of Object.entries(categorias)) {
      const diferenca = valores.executado - valores.previsto;
      const variacao = valores.previsto > 0 ? (diferenca / valores.previsto) * 100 : 0;
      
      if (Math.abs(variacao) > 10) {
        const result = await db.prepare(`
          INSERT INTO alertas (
            competencia_id, tipo, severidade, titulo, descricao, valor_relacionado
          ) VALUES (?, ?, ?, ?, ?, ?)
        `).bind(
          competenciaId,
          'variacao_alta',
          Math.abs(variacao) > 20 ? 'alta' : 'media',
          `Variação significativa em ${categoria}`,
          `A categoria ${categoria} teve uma variação de ${variacao.toFixed(1)}% em relação ao previsto.`,
          diferenca
        ).run();
        
        alertasGerados.push(result.meta.last_row_id);
      }
    }
    
    // Alerta de pagamentos atrasados
    const hoje = new Date().toISOString().split('T')[0];
    const atrasados = (pagamentos.results as any[]).filter((p: any) => 
      p.status === 'pendente' && p.data_vencimento && p.data_vencimento < hoje
    );
    
    if (atrasados.length > 0) {
      const totalAtrasado = atrasados.reduce((sum: number, p: any) => sum + p.valor_previsto, 0);
      const result = await db.prepare(`
        INSERT INTO alertas (
          competencia_id, tipo, severidade, titulo, descricao, valor_relacionado
        ) VALUES (?, ?, ?, ?, ?, ?)
      `).bind(
        competenciaId,
        'atraso_pagamento',
        atrasados.length > 5 ? 'critica' : 'alta',
        `${atrasados.length} pagamento(s) atrasado(s)`,
        `Existem ${atrasados.length} pagamentos pendentes com vencimento ultrapassado.`,
        totalAtrasado
      ).run();
      
      alertasGerados.push(result.meta.last_row_id);
    }
    
    // Alerta de despesas extras não aprovadas
    const naoAprovadas = (despesasExtras.results as any[]).filter((d: any) => !d.aprovado);
    
    if (naoAprovadas.length > 0) {
      const totalNaoAprovado = naoAprovadas.reduce((sum: number, d: any) => sum + d.valor, 0);
      const result = await db.prepare(`
        INSERT INTO alertas (
          competencia_id, tipo, severidade, titulo, descricao, valor_relacionado
        ) VALUES (?, ?, ?, ?, ?, ?)
      `).bind(
        competenciaId,
        'despesa_extra',
        'media',
        `${naoAprovadas.length} despesa(s) extra(s) aguardando aprovação`,
        `Existem despesas extraordinárias no valor total de R$ ${totalNaoAprovado.toFixed(2)} aguardando aprovação.`,
        totalNaoAprovado
      ).run();
      
      alertasGerados.push(result.meta.last_row_id);
    }
    
    return c.json({
      success: true,
      alertasGerados: alertasGerados.length,
      ids: alertasGerados
    });
  } catch (error) {
    console.error('Erro ao gerar alertas:', error);
    return c.json({ error: 'Erro ao gerar alertas' }, 500);
  }
});

// Listar alertas
alertasApp.get('/:competenciaId', async (c) => {
  const competenciaId = c.req.param('competenciaId');
  const lido = c.req.query('lido');
  const db = c.env.DB;
  
  let query = 'SELECT * FROM alertas WHERE competencia_id = ?';
  const params: any[] = [competenciaId];
  
  if (lido !== undefined) {
    query += ' AND lido = ?';
    params.push(lido === 'true' ? 1 : 0);
  }
  
  query += ' ORDER BY created_at DESC';
  
  const alertas = await db.prepare(query).bind(...params).all();
  return c.json(alertas.results);
});

// Marcar alerta como lido
alertasApp.put('/:id/marcar-lido', async (c) => {
  const id = c.req.param('id');
  const db = c.env.DB;
  
  await db.prepare('UPDATE alertas SET lido = 1 WHERE id = ?').bind(id).run();
  
  return c.json({ success: true });
});

// Marcar todos como lidos
alertasApp.put('/marcar-todos-lidos/:competenciaId', async (c) => {
  const competenciaId = c.req.param('competenciaId');
  const db = c.env.DB;
  
  await db.prepare('UPDATE alertas SET lido = 1 WHERE competencia_id = ?').bind(competenciaId).run();
  
  return c.json({ success: true });
});

// Deletar alerta
alertasApp.delete('/:id', async (c) => {
  const id = c.req.param('id');
  const db = c.env.DB;
  
  await db.prepare('DELETE FROM alertas WHERE id = ?').bind(id).run();
  
  return c.json({ success: true });
});

export default alertasApp;
