import { Hono } from "hono";
import type { Env } from './env';
import { formatCurrencyBR, getCompetenciaText } from "../shared/previsao-types";

const relatoriosApp = new Hono<{ Bindings: Env }>();

// Relatório consolidado de uma competência
relatoriosApp.get('/consolidado/:competenciaId', async (c) => {
  const competenciaId = c.req.param('competenciaId');
  const formato = c.req.query('formato') || 'json';
  const db = c.env.DB;
  
  try {
    // Buscar competência
    const competencia = await db.prepare(
      'SELECT c.*, cond.nome as condominio_nome FROM competencias c JOIN condominios cond ON c.condominio_id = cond.id WHERE c.id = ?'
    ).bind(competenciaId).first();
    
    if (!competencia) {
      return c.json({ error: 'Competência não encontrada' }, 404);
    }
    
    // Buscar itens de previsão
    const itens = await db.prepare(
      'SELECT * FROM previsao_itens WHERE competencia_id = ? ORDER BY categoria, ordem'
    ).bind(competenciaId).all();
    
    // Buscar pagamentos
    const pagamentos = await db.prepare(
      'SELECT * FROM pagamentos_efetivados WHERE competencia_id = ?'
    ).bind(competenciaId).all();
    
    // Buscar despesas extras
    const despesasExtras = await db.prepare(
      'SELECT * FROM despesas_extras WHERE competencia_id = ?'
    ).bind(competenciaId).all();
    
    // Buscar centros de custo
    const centrosCusto = await db.prepare(
      'SELECT * FROM centros_custo WHERE condominio_id = ? AND ativo = 1'
    ).bind((competencia as any).condominio_id).all();
    
    // Calcular totais
    const totalPrevisto = (itens.results as any[]).reduce((sum: number, item: any) => sum + item.valor, 0);
    const totalPago = (pagamentos.results as any[])
      .filter((p: any) => p.status === 'pago')
      .reduce((sum: number, p: any) => sum + (p.valor_pago || 0), 0);
    const totalPendente = (pagamentos.results as any[])
      .filter((p: any) => p.status === 'pendente')
      .reduce((sum: number, p: any) => sum + p.valor_previsto, 0);
    const totalExtras = (despesasExtras.results as any[]).reduce((sum: number, d: any) => sum + d.valor, 0);
    
    const dados = {
      competencia: competencia as any,
      itens: itens.results,
      pagamentos: pagamentos.results,
      despesasExtras: despesasExtras.results,
      centrosCusto: centrosCusto.results,
      resumo: {
        total_previsto: totalPrevisto,
        total_pago: totalPago,
        total_pendente: totalPendente,
        total_extras: totalExtras,
        diferenca: totalPago + totalExtras - totalPrevisto,
        percentual_executado: totalPrevisto > 0 ? (totalPago / totalPrevisto) * 100 : 0
      }
    };
    
    if (formato === 'html') {
      return c.html(gerarRelatorioHTML(dados));
    }
    
    return c.json(dados);
  } catch (error) {
    console.error('Erro ao gerar relatório:', error);
    return c.json({ error: 'Erro ao gerar relatório' }, 500);
  }
});

// Relatório comparativo entre períodos
relatoriosApp.get('/comparativo', async (c) => {
  const condominioId = c.req.query('condominioId');
  const dataInicio = c.req.query('dataInicio');
  const dataFim = c.req.query('dataFim');
  const db = c.env.DB;
  
  if (!condominioId || !dataInicio || !dataFim) {
    return c.json({ error: 'Parâmetros obrigatórios: condominioId, dataInicio, dataFim' }, 400);
  }
  
  try {
    // Buscar competências no período
    const competencias = await db.prepare(`
      SELECT * FROM competencias 
      WHERE condominio_id = ? 
      ORDER BY ano, mes
    `).bind(condominioId).all();
    
    const dadosComparativos = [];
    
    for (const comp of competencias.results as any[]) {
      const itens = await db.prepare(
        'SELECT * FROM previsao_itens WHERE competencia_id = ?'
      ).bind(comp.id).all();
      
      const pagamentos = await db.prepare(
        'SELECT * FROM pagamentos_efetivados WHERE competencia_id = ? AND status = "pago"'
      ).bind(comp.id).all();
      
      const totalPrevisto = (itens.results as any[]).reduce((s: number, i: any) => s + i.valor, 0);
      const totalExecutado = (pagamentos.results as any[]).reduce((s: number, p: any) => s + (p.valor_pago || 0), 0);
      
      dadosComparativos.push({
        competencia: `${comp.mes}/${comp.ano}`,
        previsto: totalPrevisto,
        executado: totalExecutado,
        diferenca: totalExecutado - totalPrevisto,
        variacao: totalPrevisto > 0 ? ((totalExecutado - totalPrevisto) / totalPrevisto) * 100 : 0
      });
    }
    
    return c.json({
      condominio_id: condominioId,
      periodo: {
        inicio: dataInicio,
        fim: dataFim
      },
      dados: dadosComparativos,
      totais: {
        previsto: dadosComparativos.reduce((s: number, d: any) => s + d.previsto, 0),
        executado: dadosComparativos.reduce((s: number, d: any) => s + d.executado, 0),
        diferenca: dadosComparativos.reduce((s: number, d: any) => s + d.diferenca, 0)
      }
    });
  } catch (error) {
    console.error('Erro ao gerar relatório comparativo:', error);
    return c.json({ error: 'Erro ao gerar relatório' }, 500);
  }
});

// Relatório de performance por centro de custo
relatoriosApp.get('/centro-custo/:centroCustoId', async (c) => {
  const centroCustoId = c.req.param('centroCustoId');
  const db = c.env.DB;
  
  try {
    const centro = await db.prepare(
      'SELECT * FROM centros_custo WHERE id = ?'
    ).bind(centroCustoId).first();
    
    if (!centro) {
      return c.json({ error: 'Centro de custo não encontrado' }, 404);
    }
    
    // Buscar todas as competências do condomínio
    const competencias = await db.prepare(
      'SELECT * FROM competencias WHERE condominio_id = ? ORDER BY ano DESC, mes DESC'
    ).bind((centro as any).condominio_id).all();
    
    const historico = [];
    
    for (const comp of competencias.results as any[]) {
      const itens = await db.prepare(
        'SELECT * FROM centro_custo_itens WHERE competencia_id = ? AND centro_custo_id = ?'
      ).bind(comp.id, centroCustoId).all();
      
      const pagamentos = await db.prepare(
        'SELECT * FROM pagamentos_efetivados WHERE competencia_id = ? AND centro_custo_id = ?'
      ).bind(comp.id, centroCustoId).all();
      
      const totalPrevisto = (itens.results as any[]).reduce((s: number, i: any) => s + i.valor, 0);
      const totalPago = (pagamentos.results as any[])
        .filter((p: any) => p.status === 'pago')
        .reduce((s: number, p: any) => s + (p.valor_pago || 0), 0);
      
      historico.push({
        competencia: `${comp.mes}/${comp.ano}`,
        previsto: totalPrevisto,
        pago: totalPago,
        diferenca: totalPago - totalPrevisto
      });
    }
    
    return c.json({
      centro: centro,
      historico: historico,
      resumo: {
        total_previsto: historico.reduce((s: number, h: any) => s + h.previsto, 0),
        total_pago: historico.reduce((s: number, h: any) => s + h.pago, 0),
        media_mensal: historico.length > 0 
          ? historico.reduce((s: number, h: any) => s + h.pago, 0) / historico.length 
          : 0
      }
    });
  } catch (error) {
    console.error('Erro ao gerar relatório:', error);
    return c.json({ error: 'Erro ao gerar relatório' }, 500);
  }
});

// Função auxiliar para gerar HTML do relatório
function gerarRelatorioHTML(dados: any): string {
  const comp = dados.competencia;
  const resumo = dados.resumo;
  
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>Relatório Consolidado - ${getCompetenciaText(comp.mes, comp.ano)}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
        .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #000; padding-bottom: 20px; }
        .section { margin: 30px 0; }
        .section h2 { background-color: #f8f9fa; padding: 10px; border-left: 4px solid #007bff; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        th { background-color: #f8f9fa; font-weight: bold; }
        .valor { text-align: right; }
        .positivo { color: green; font-weight: bold; }
        .negativo { color: red; font-weight: bold; }
        .resumo { background-color: #e9ecef; padding: 20px; border-radius: 8px; margin: 30px 0; }
        .kpi { display: inline-block; padding: 15px 30px; margin: 10px; background: white; border-radius: 8px; text-align: center; }
        .kpi-label { font-size: 12px; color: #666; }
        .kpi-value { font-size: 24px; font-weight: bold; color: #007bff; }
    </style>
</head>
<body>
    <div class="header">
        <h1>RELATÓRIO CONSOLIDADO</h1>
        <h2>${comp.condominio_nome}</h2>
        <h3>${getCompetenciaText(comp.mes, comp.ano)}</h3>
        <p>Gerado em: ${new Date().toLocaleDateString('pt-BR')}</p>
    </div>

    <div class="resumo">
        <h2>Resumo Executivo</h2>
        <div class="kpi">
            <div class="kpi-label">Total Previsto</div>
            <div class="kpi-value">${formatCurrencyBR(resumo.total_previsto)}</div>
        </div>
        <div class="kpi">
            <div class="kpi-label">Total Executado</div>
            <div class="kpi-value">${formatCurrencyBR(resumo.total_pago)}</div>
        </div>
        <div class="kpi">
            <div class="kpi-label">Pendente</div>
            <div class="kpi-value">${formatCurrencyBR(resumo.total_pendente)}</div>
        </div>
        <div class="kpi">
            <div class="kpi-label">% Executado</div>
            <div class="kpi-value">${resumo.percentual_executado.toFixed(1)}%</div>
        </div>
    </div>

    <div class="section">
        <h2>Itens de Previsão (${dados.itens.length} itens)</h2>
        <table>
            <thead>
                <tr>
                    <th>Categoria</th>
                    <th>Descrição</th>
                    <th class="valor">Valor Previsto</th>
                </tr>
            </thead>
            <tbody>
                ${dados.itens.map((item: any) => `
                    <tr>
                        <td>${item.categoria}</td>
                        <td>${item.descricao}</td>
                        <td class="valor">${formatCurrencyBR(item.valor)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>

    <div class="section">
        <h2>Status de Pagamentos</h2>
        <table>
            <thead>
                <tr>
                    <th>Descrição</th>
                    <th>Status</th>
                    <th class="valor">Valor Previsto</th>
                    <th class="valor">Valor Pago</th>
                    <th class="valor">Diferença</th>
                </tr>
            </thead>
            <tbody>
                ${dados.pagamentos.map((pag: any) => {
                  const diferenca = (pag.valor_pago || pag.valor_previsto) - pag.valor_previsto;
                  return `
                    <tr>
                        <td>${pag.descricao}</td>
                        <td>${pag.status.toUpperCase()}</td>
                        <td class="valor">${formatCurrencyBR(pag.valor_previsto)}</td>
                        <td class="valor">${pag.valor_pago ? formatCurrencyBR(pag.valor_pago) : '-'}</td>
                        <td class="valor ${diferenca > 0 ? 'negativo' : diferenca < 0 ? 'positivo' : ''}">
                            ${pag.valor_pago ? formatCurrencyBR(Math.abs(diferenca)) : '-'}
                        </td>
                    </tr>
                  `;
                }).join('')}
            </tbody>
        </table>
    </div>

    ${dados.despesasExtras.length > 0 ? `
    <div class="section">
        <h2>Despesas Extraordinárias (${dados.despesasExtras.length} itens)</h2>
        <table>
            <thead>
                <tr>
                    <th>Descrição</th>
                    <th>Tipo</th>
                    <th class="valor">Valor</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                ${dados.despesasExtras.map((extra: any) => `
                    <tr>
                        <td>${extra.descricao}</td>
                        <td>${extra.tipo}</td>
                        <td class="valor">${formatCurrencyBR(extra.valor)}</td>
                        <td>${extra.aprovado ? 'Aprovado' : 'Pendente'}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>
    ` : ''}

    <div class="section">
        <h2>Análise Final</h2>
        <p><strong>Diferença Total:</strong> <span class="${resumo.diferenca > 0 ? 'negativo' : 'positivo'}">${formatCurrencyBR(Math.abs(resumo.diferenca))}</span></p>
        <p><strong>Conclusão:</strong> ${
          resumo.diferenca > 0 
            ? 'As despesas executadas ficaram acima do previsto.' 
            : resumo.diferenca < 0 
            ? 'As despesas executadas ficaram abaixo do previsto.' 
            : 'As despesas executadas ficaram dentro do previsto.'
        }</p>
    </div>
</body>
</html>`;
}

export default relatoriosApp;
