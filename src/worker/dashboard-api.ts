import { Hono } from "hono";
import type { Env } from './env';

const dashboardApp = new Hono<{ Bindings: Env }>();

// Analytics endpoint
dashboardApp.get('/analytics', async (c) => {
  const condominioId = c.req.query('condominioId');
  const range = c.req.query('range') || '6m';
  const db = c.env.DB;
  
  if (!condominioId) {
    return c.json({ error: 'condominioId é obrigatório' }, 400);
  }

  try {
    const condominio = await db.prepare('SELECT * FROM condominios WHERE id = ?').bind(condominioId).first();
    if (!condominio) {
      return c.json({ error: 'Condomínio não encontrado' }, 404);
    }

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    
    let startYear = currentYear;
    let startMonth = currentMonth;
    
    switch (range) {
      case '3m':
        startMonth = Math.max(1, currentMonth - 3);
        if (startMonth > currentMonth) {
          startYear--;
          startMonth = 12 + startMonth - currentMonth;
        }
        break;
      case '6m':
        startMonth = Math.max(1, currentMonth - 6);
        if (startMonth > currentMonth) {
          startYear--;
          startMonth = 12 + startMonth - currentMonth;
        }
        break;
      case '12m':
        startYear = currentYear - 1;
        break;
      case 'ytd':
        startMonth = 1;
        break;
    }

    const competencias = await db.prepare(`
      SELECT * FROM competencias 
      WHERE condominio_id = ? 
        AND ((ano > ?) OR (ano = ? AND mes >= ?))
        AND ((ano < ?) OR (ano = ? AND mes <= ?))
      ORDER BY ano, mes
    `).bind(
      condominioId, 
      startYear, startYear, startMonth,
      currentYear, currentYear, currentMonth
    ).all();

    const analyticsData = {
      condominio,
      periodo: {
        inicio: `${startMonth}/${startYear}`,
        fim: `${currentMonth}/${currentYear}`,
        range
      },
      competencias: competencias.results,
      resumo: {
        totalCompetencias: competencias.results.length,
        competenciasFechadas: (competencias.results as any[]).filter(c => c.status === 'fechado').length,
        taxaMedia: 0,
        variacao: 0
      },
      evolucaoMensal: [] as any[],
      categorias: {} as Record<string, any>,
      insights: [] as any[]
    };

    if (competencias.results.length > 0) {
      const taxas = (competencias.results as any[])
        .filter(c => c.taxa_m2)
        .map(c => c.taxa_m2);
      
      if (taxas.length > 0) {
        analyticsData.resumo.taxaMedia = taxas.reduce((sum, taxa) => sum + taxa, 0) / taxas.length;
        
        if (taxas.length > 1) {
          const ultimaTaxa = taxas[taxas.length - 1];
          const penultimaTaxa = taxas[taxas.length - 2];
          analyticsData.resumo.variacao = ((ultimaTaxa - penultimaTaxa) / penultimaTaxa) * 100;
        }
      }
    }

    const evolucaoMensal: any[] = [];
    const categorias: Record<string, any> = {};
    
    for (const comp of competencias.results as any[]) {
      const itens = await db.prepare(
        'SELECT * FROM previsao_itens WHERE competencia_id = ?'
      ).bind(comp.id).all();
      
      const totalMensal = (itens.results as any[]).reduce((sum, item) => sum + item.valor, 0);
      const acrescimo = totalMensal * (comp.acrescimo_percentual / 100);
      const totalComAcrescimo = totalMensal + acrescimo;
      
      evolucaoMensal.push({
        periodo: `${comp.mes.toString().padStart(2, '0')}/${comp.ano}`,
        mes: comp.mes,
        ano: comp.ano,
        valor: totalComAcrescimo,
        taxa: comp.taxa_m2 || 0,
        status: comp.status
      });
      
      for (const item of itens.results as any[]) {
        if (!categorias[item.categoria]) {
          categorias[item.categoria] = {
            total: 0,
            media: 0,
            count: 0,
            evolucao: []
          };
        }
        categorias[item.categoria].total += item.valor;
        categorias[item.categoria].count++;
      }
    }

    Object.keys(categorias).forEach(categoria => {
      const cat = categorias[categoria];
      cat.media = cat.total / cat.count;
    });

    analyticsData.evolucaoMensal = evolucaoMensal;
    analyticsData.categorias = categorias;
    analyticsData.insights = gerarInsights(analyticsData);

    return c.json(analyticsData);
  } catch (error) {
    console.error('Erro ao buscar analytics:', error);
    return c.json({ error: 'Erro interno do servidor' }, 500);
  }
});

// Comparação entre períodos
dashboardApp.get('/comparacao', async (c) => {
  const condominioId = c.req.query('condominioId');
  const periodo1 = c.req.query('periodo1');
  const periodo2 = c.req.query('periodo2');
  const db = c.env.DB;
  
  if (!condominioId || !periodo1 || !periodo2) {
    return c.json({ error: 'Parâmetros obrigatórios: condominioId, periodo1, periodo2' }, 400);
  }

  try {
    const [mes1, ano1] = periodo1.split('/').map(Number);
    const [mes2, ano2] = periodo2.split('/').map(Number);

    const comp1 = await db.prepare(
      'SELECT * FROM competencias WHERE condominio_id = ? AND mes = ? AND ano = ?'
    ).bind(condominioId, mes1, ano1).first();
    
    const comp2 = await db.prepare(
      'SELECT * FROM competencias WHERE condominio_id = ? AND mes = ? AND ano = ?'
    ).bind(condominioId, mes2, ano2).first();

    if (!comp1 || !comp2) {
      return c.json({ error: 'Uma ou ambas as competências não foram encontradas' }, 404);
    }

    const itens1 = await db.prepare(
      'SELECT * FROM previsao_itens WHERE competencia_id = ?'
    ).bind((comp1 as any).id).all();
    
    const itens2 = await db.prepare(
      'SELECT * FROM previsao_itens WHERE competencia_id = ?'
    ).bind((comp2 as any).id).all();

    const total1 = (itens1.results as any[]).reduce((sum, item) => sum + item.valor, 0);
    const total2 = (itens2.results as any[]).reduce((sum, item) => sum + item.valor, 0);
    
    const variacao = total2 > 0 ? ((total1 - total2) / total2) * 100 : 0;

    const categorias1: Record<string, number> = {};
    const categorias2: Record<string, number> = {};
    
    (itens1.results as any[]).forEach((item: any) => {
      if (!categorias1[item.categoria]) categorias1[item.categoria] = 0;
      categorias1[item.categoria] += item.valor;
    });
    
    (itens2.results as any[]).forEach((item: any) => {
      if (!categorias2[item.categoria]) categorias2[item.categoria] = 0;
      categorias2[item.categoria] += item.valor;
    });

    const comparacaoCategorias: any[] = [];
    const todasCategorias = new Set([...Object.keys(categorias1), ...Object.keys(categorias2)]);
    
    todasCategorias.forEach(categoria => {
      const valor1 = categorias1[categoria] || 0;
      const valor2 = categorias2[categoria] || 0;
      const varCategoria = valor2 > 0 ? ((valor1 - valor2) / valor2) * 100 : 0;
      
      comparacaoCategorias.push({
        categoria,
        periodo1: valor1,
        periodo2: valor2,
        variacao: varCategoria,
        diferenca: valor1 - valor2
      });
    });

    const comparacao = {
      periodo1: {
        mes: mes1,
        ano: ano1,
        competencia: comp1,
        total: total1,
        itens: itens1.results
      },
      periodo2: {
        mes: mes2,
        ano: ano2,
        competencia: comp2,
        total: total2,
        itens: itens2.results
      },
      analise: {
        variacao,
        diferenca: total1 - total2,
        categoria_maior_variacao: comparacaoCategorias.reduce((maior, atual) => 
          Math.abs(atual.variacao) > Math.abs(maior.variacao) ? atual : maior
        ),
        tendencia: variacao > 5 ? 'alta' : variacao < -5 ? 'baixa' : 'estavel'
      },
      categorias: comparacaoCategorias.sort((a, b) => Math.abs(b.variacao) - Math.abs(a.variacao))
    };

    return c.json(comparacao);
  } catch (error) {
    console.error('Erro ao comparar períodos:', error);
    return c.json({ error: 'Erro interno do servidor' }, 500);
  }
});

function gerarInsights(dados: any) {
  const insights: any[] = [];
  
  if (dados.resumo.variacao > 10) {
    insights.push({
      id: 'crescimento_alto',
      type: 'warning',
      title: 'Crescimento Acelerado',
      description: `As despesas aumentaram ${dados.resumo.variacao.toFixed(1)}% no último período.`,
      value: dados.resumo.variacao,
      priority: 'high',
      action: 'Analisar Detalhes'
    });
  }
  
  const percFechadas = (dados.resumo.competenciasFechadas / dados.resumo.totalCompetencias) * 100;
  if (percFechadas < 50) {
    insights.push({
      id: 'competencias_abertas',
      type: 'tip',
      title: 'Competências em Aberto',
      description: `${dados.resumo.totalCompetencias - dados.resumo.competenciasFechadas} competências ainda em rascunho.`,
      priority: 'low',
      action: 'Revisar Competências'
    });
  }
  
  return insights;
}

export default dashboardApp;
