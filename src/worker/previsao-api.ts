import { Hono } from "hono";
import { 
  type Competencia,
  type PrevisaoItem,
  type CentroCusto,
  type CentroCustoItem,
  type PrevisaoConsolidada,
  CATEGORIAS_PREVISAO,
  getCompetenciaText,
  formatCurrencyBR,
  formatNumberBR,
  calcularRateio
} from "../shared/previsao-types";

const previsaoApp = new Hono<{ Bindings: Env }>();

// API para Competências
previsaoApp.get('/competencias', async (c) => {
  const condominioId = c.req.query('condominioId');
  const db = c.env.DB;
  
  if (!condominioId) {
    return c.json({ error: 'condominioId é obrigatório' }, 400);
  }
  
  const competencias = await db.prepare(`
    SELECT * FROM competencias 
    WHERE condominio_id = ? 
    ORDER BY ano DESC, mes DESC
  `).bind(condominioId).all();
  
  return c.json(competencias.results);
});

previsaoApp.post('/competencias', async (c) => {
  const { condominioId, mes, ano } = await c.req.json();
  const db = c.env.DB;
  
  // Verificar se já existe
  const existente = await db.prepare(
    'SELECT id FROM competencias WHERE condominio_id = ? AND mes = ? AND ano = ?'
  ).bind(condominioId, mes, ano).first();
  
  if (existente) {
    return c.json({ error: 'Competência já existe para este período' }, 400);
  }
  
  // Buscar dados do condomínio
  const condominio = await db.prepare('SELECT * FROM condominios WHERE id = ?').bind(condominioId).first();
  if (!condominio) {
    return c.json({ error: 'Condomínio não encontrado' }, 404);
  }
  
  // Criar nova competência
  const result = await db.prepare(`
    INSERT INTO competencias (mes, ano, condominio_id, area_total_m2, status)
    VALUES (?, ?, ?, ?, 'rascunho')
  `).bind(mes, ano, condominioId, condominio.area_total_m2).run();
  
  // Copiar itens da competência anterior se existir
  const competenciaAnterior = await db.prepare(`
    SELECT * FROM competencias 
    WHERE condominio_id = ? AND (ano < ? OR (ano = ? AND mes < ?))
    ORDER BY ano DESC, mes DESC 
    LIMIT 1
  `).bind(condominioId, ano, ano, mes).first();
  
  if (competenciaAnterior) {
    const itensAnteriores = await db.prepare(
      'SELECT * FROM previsao_itens WHERE competencia_id = ?'
    ).bind(competenciaAnterior.id).all();
    
    for (const item of itensAnteriores.results as any[]) {
      await db.prepare(`
        INSERT INTO previsao_itens (competencia_id, categoria, descricao, valor, observacoes, ordem)
        VALUES (?, ?, ?, ?, ?, ?)
      `).bind(result.meta.last_row_id, item.categoria, item.descricao, item.valor, item.observacoes, item.ordem).run();
    }
  }
  
  const novaCompetencia = await db.prepare('SELECT * FROM competencias WHERE id = ?').bind(result.meta.last_row_id).first();
  return c.json(novaCompetencia);
});

previsaoApp.post('/fechar', async (c) => {
  const { competenciaId } = await c.req.json();
  const db = c.env.DB;
  
  await db.prepare('UPDATE competencias SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
    .bind('fechado', competenciaId).run();
  
  return c.json({ success: true });
});

// API para Itens de Previsão
previsaoApp.get('/itens', async (c) => {
  const competenciaId = c.req.query('competenciaId');
  const db = c.env.DB;
  
  if (!competenciaId) {
    return c.json({ error: 'competenciaId é obrigatório' }, 400);
  }
  
  const itens = await db.prepare(`
    SELECT * FROM previsao_itens 
    WHERE competencia_id = ? 
    ORDER BY categoria, ordem
  `).bind(competenciaId).all();
  
  return c.json(itens.results);
});

previsaoApp.post('/salvar', async (c) => {
  const { competenciaId, itens, competencia } = await c.req.json();
  const db = c.env.DB;
  
  try {
    // Atualizar dados da competência
    if (competencia) {
      // Calcular taxa automaticamente
      const somatorioDespesas = itens.reduce((sum: number, item: any) => sum + (item.valor || 0), 0);
      const acrescimo = somatorioDespesas * ((competencia.acrescimo_percentual || 0) / 100);
      const totalComAcrescimo = somatorioDespesas + acrescimo;
      const taxaCalculada = totalComAcrescimo / (competencia.area_total_m2 || 1);
      
      await db.prepare(`
        UPDATE competencias 
        SET taxa_m2 = ?, acrescimo_percentual = ?, area_total_m2 = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(taxaCalculada, competencia.acrescimo_percentual, competencia.area_total_m2, competenciaId).run();
    }
    
    // Limpar itens existentes
    await db.prepare('DELETE FROM previsao_itens WHERE competencia_id = ?').bind(competenciaId).run();
    
    // Inserir novos itens (apenas os que têm descrição e valor)
    for (const item of itens) {
      if (!item.descricao || !item.valor) continue; // Skip items vazios
      
      await db.prepare(`
        INSERT INTO previsao_itens (competencia_id, categoria, descricao, valor, observacoes, ordem)
        VALUES (?, ?, ?, ?, ?, ?)
      `).bind(competenciaId, item.categoria, item.descricao, item.valor, item.observacoes || null, item.ordem || 0).run();
    }
    
    return c.json({ success: true });
  } catch (error) {
    console.error('Erro ao salvar previsão:', error);
    return c.json({ error: 'Erro interno do servidor' }, 500);
  }
});

// API para dados consolidados
previsaoApp.get('/consolidada', async (c) => {
  const competenciaId = c.req.query('competenciaId');
  const db = c.env.DB;
  
  if (!competenciaId) {
    return c.json({ error: 'competenciaId é obrigatório' }, 400);
  }
  
  // Buscar competência
  const competencia = await db.prepare('SELECT * FROM competencias WHERE id = ?').bind(competenciaId).first() as Competencia;
  if (!competencia) {
    return c.json({ error: 'Competência não encontrada' }, 404);
  }
  
  // Buscar condomínio
  const condominio = await db.prepare('SELECT * FROM condominios WHERE id = ?').bind(competencia.condominio_id).first();
  
  // Buscar itens de previsão
  const itens = await db.prepare('SELECT * FROM previsao_itens WHERE competencia_id = ?').bind(competenciaId).all();
  
  // Calcular totais por categoria
  const totaisPorCategoria: Record<string, number> = {};
  CATEGORIAS_PREVISAO.forEach(cat => {
    totaisPorCategoria[cat] = (itens.results as PrevisaoItem[])
      .filter(item => item.categoria === cat)
      .reduce((sum, item) => sum + item.valor, 0);
  });
  
  const somatorioDespesas = Object.values(totaisPorCategoria).reduce((sum, val) => sum + val, 0);
  const acrescimo = somatorioDespesas * (competencia.acrescimo_percentual / 100);
  const somatarioTaxaGeral = somatorioDespesas + acrescimo;
  const taxaGeral = somatarioTaxaGeral / competencia.area_total_m2;
  
  // Buscar centros de custo
  const centrosCusto = await db.prepare('SELECT * FROM centros_custo WHERE condominio_id = ? AND ativo = 1').bind(competencia.condominio_id).all();
  
  // Calcular rateio por centros de custo
  const rateioUnidades = (centrosCusto.results as CentroCusto[]).map(centro => ({
    nome: centro.nome,
    area_m2: centro.area_m2,
    valor: calcularRateio(centro.area_m2, competencia.area_total_m2, somatarioTaxaGeral)
  }));
  
  // Buscar itens específicos dos centros de custo
  const centrosCustoCompletos = [];
  for (const centro of centrosCusto.results as CentroCusto[]) {
    const itensCentro = await db.prepare(
      'SELECT * FROM centro_custo_itens WHERE competencia_id = ? AND centro_custo_id = ?'
    ).bind(competenciaId, centro.id).all();
    
    const somatorioCentro = (itensCentro.results as CentroCustoItem[]).reduce((sum, item) => sum + item.valor, 0);
    const proporcionalTaxa = calcularRateio(centro.area_m2, competencia.area_total_m2, somatarioTaxaGeral);
    
    centrosCustoCompletos.push({
      centro,
      itens: itensCentro.results as CentroCustoItem[],
      somatorioCentro,
      proporcionalTaxa,
      valorTotal: somatorioCentro + proporcionalTaxa
    });
  }
  
  const dadosConsolidados: PrevisaoConsolidada = {
    competencia,
    condominio: {
      nome: (condominio as any)?.nome || '',
      endereco: (condominio as any)?.endereco || null,
      cnpj: (condominio as any)?.cnpj || null,
    },
    totaisPorCategoria,
    somatorioDespesas,
    acrescimo,
    taxaGeral,
    somatarioTaxaGeral,
    rateioUnidades,
    centrosCusto: centrosCustoCompletos
  };
  
  return c.json(dadosConsolidados);
});

previsaoApp.post('/recalcular', async (c) => {
  const { competenciaId } = await c.req.json();
  const db = c.env.DB;
  
  // Buscar competência e itens
  const competencia = await db.prepare('SELECT * FROM competencias WHERE id = ?').bind(competenciaId).first() as Competencia;
  const itens = await db.prepare('SELECT * FROM previsao_itens WHERE competencia_id = ?').bind(competenciaId).all();
  
  // Recalcular taxa
  const somatorioDespesas = (itens.results as PrevisaoItem[]).reduce((sum, item) => sum + item.valor, 0);
  const acrescimo = somatorioDespesas * (competencia.acrescimo_percentual / 100);
  const somatarioTaxaGeral = somatorioDespesas + acrescimo;
  const taxaGeral = somatarioTaxaGeral / competencia.area_total_m2;
  
  // Atualizar competência
  await db.prepare('UPDATE competencias SET taxa_m2 = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
    .bind(taxaGeral, competenciaId).run();
  
  return c.json({ success: true, taxaGeral });
});

// API para download de documentos
previsaoApp.get('/download', async (c) => {
  const competenciaId = c.req.query('competenciaId');
  const tipo = c.req.query('tipo') as 'condominio' | 'centro_custo' | 'fatura' | 'balancete';
  const formato = c.req.query('formato') as 'pdf' | 'html' || 'html';
  
  if (!competenciaId || !tipo) {
    return c.json({ error: 'Parâmetros obrigatórios: competenciaId, tipo' }, 400);
  }
  
  try {
    // Buscar dados consolidados diretamente no banco
    const db = c.env.DB;
    
    // Buscar competência
    const competencia = await db.prepare('SELECT * FROM competencias WHERE id = ?').bind(competenciaId).first() as Competencia;
    if (!competencia) {
      return c.json({ error: 'Competência não encontrada' }, 404);
    }
    
    // Buscar condomínio
    const condominio = await db.prepare('SELECT * FROM condominios WHERE id = ?').bind(competencia.condominio_id).first();
    
    // Buscar itens de previsão
    const itens = await db.prepare('SELECT * FROM previsao_itens WHERE competencia_id = ? ORDER BY categoria, ordem').bind(competenciaId).all();
    
    // Calcular totais por categoria
    const totaisPorCategoria: Record<string, number> = {};
    CATEGORIAS_PREVISAO.forEach(cat => {
      totaisPorCategoria[cat] = (itens.results as PrevisaoItem[])
        .filter(item => item.categoria === cat)
        .reduce((sum, item) => sum + item.valor, 0);
    });
    
    const somatorioDespesas = Object.values(totaisPorCategoria).reduce((sum, val) => sum + val, 0);
    const acrescimo = somatorioDespesas * (competencia.acrescimo_percentual / 100);
    const somatarioTaxaGeral = somatorioDespesas + acrescimo;
    const taxaGeral = somatarioTaxaGeral / competencia.area_total_m2;
    
    // Buscar centros de custo
    const centrosCusto = await db.prepare('SELECT * FROM centros_custo WHERE condominio_id = ? AND ativo = 1').bind(competencia.condominio_id).all();
    
    // Calcular rateio por centros de custo
    const rateioUnidades = (centrosCusto.results as CentroCusto[]).map(centro => ({
      nome: centro.nome,
      area_m2: centro.area_m2,
      valor: calcularRateio(centro.area_m2, competencia.area_total_m2, somatarioTaxaGeral)
    }));
    
    // Buscar itens específicos dos centros de custo
    const centrosCustoCompletos = [];
    for (const centro of centrosCusto.results as CentroCusto[]) {
      const itensCentro = await db.prepare(
        'SELECT * FROM centro_custo_itens WHERE competencia_id = ? AND centro_custo_id = ?'
      ).bind(competenciaId, centro.id).all();
      
      const somatorioCentro = (itensCentro.results as CentroCustoItem[]).reduce((sum, item) => sum + item.valor, 0);
      const proporcionalTaxa = calcularRateio(centro.area_m2, competencia.area_total_m2, somatarioTaxaGeral);
      
      centrosCustoCompletos.push({
        centro,
        itens: itensCentro.results as CentroCustoItem[],
        somatorioCentro,
        proporcionalTaxa,
        valorTotal: somatorioCentro + proporcionalTaxa
      });
    }
    
    const dados: PrevisaoConsolidada = {
      competencia,
      condominio: {
        nome: (condominio as any)?.nome || '',
        endereco: (condominio as any)?.endereco || null,
        cnpj: (condominio as any)?.cnpj || null,
      },
      itens: itens.results as PrevisaoItem[],
      totaisPorCategoria,
      somatorioDespesas,
      acrescimo,
      taxaGeral,
      somatarioTaxaGeral,
      rateioUnidades,
      centrosCusto: centrosCustoCompletos
    };
    
    // Gerar conteúdo baseado no tipo
    let htmlContent = '';
    
    switch (tipo) {
      case 'condominio':
        htmlContent = gerarDocumentoCondominio(dados);
        break;
      case 'centro_custo':
        htmlContent = gerarDocumentoCentroCusto(dados);
        break;
      case 'fatura':
        htmlContent = gerarDocumentoFatura(dados);
        break;
      case 'balancete':
        htmlContent = gerarDocumentoBalancete(dados);
        break;
      default:
        return c.json({ error: 'Tipo de documento inválido' }, 400);
    }
    
    if (formato === 'html') {
      return c.html(htmlContent);
    } else {
      // Para PDF, retornar HTML que pode ser convertido
      return c.html(htmlContent, 200, {
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="${tipo}-${getCompetenciaText(dados.competencia.mes, dados.competencia.ano)}.html"`
      });
    }
  } catch (error) {
    console.error('Erro ao gerar documento:', error);
    return c.json({ error: 'Erro interno do servidor' }, 500);
  }
});

// Funções para gerar documentos
function gerarDocumentoCondominio(dados: PrevisaoConsolidada): string {
  const { competencia, itens, totaisPorCategoria, somatorioDespesas, acrescimo, somatarioTaxaGeral, rateioUnidades } = dados;
  
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Previsão de Despesas Condomínio - ${getCompetenciaText(competencia.mes, competencia.ano)}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
        .header { text-align: center; margin-bottom: 40px; }
        .categoria { margin-bottom: 30px; }
        .categoria h3 { background-color: #f8f9fa; padding: 10px; margin: 0; border-left: 4px solid #007bff; }
        .item { margin: 8px 0; padding: 8px; background-color: #f8f9fa; display: flex; justify-content: space-between; }
        .total { font-weight: bold; text-align: right; margin: 10px 0; font-size: 1.1em; background-color: #e9ecef; padding: 10px; }
        .resumo { background-color: #e9ecef; padding: 20px; margin: 20px 0; }
        .rateio { margin-top: 20px; }
        .rateio table { width: 100%; border-collapse: collapse; }
        .rateio th, .rateio td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        .rateio th { background-color: #f8f9fa; }
        .valor { text-align: right; }
    </style>
</head>
<body>
    <div class="header">
        <h1>PREVISÃO DE DESPESAS CONDOMÍNIO</h1>
        <h2>${getCompetenciaText(competencia.mes, competencia.ano)}</h2>
        <p><strong>${dados.condominio.nome}</strong></p>
        ${dados.condominio.endereco ? `<p>${dados.condominio.endereco}</p>` : ''}
        ${dados.condominio.cnpj ? `<p>CNPJ: ${dados.condominio.cnpj}</p>` : ''}
    </div>

    ${CATEGORIAS_PREVISAO.map(categoria => {
      const itensCategoria = itens?.filter(item => item.categoria === categoria) || [];
      return `
        <div class="categoria">
            <h3>${categoria}</h3>
            ${itensCategoria.map(item => `
                <div class="item">
                    <span>${item.descricao}</span>
                    <span class="valor">${formatCurrencyBR(item.valor)}</span>
                </div>
            `).join('')}
            <div class="total">TOTAL ${categoria.toUpperCase()}: ${formatCurrencyBR(totaisPorCategoria[categoria] || 0)}</div>
        </div>
      `;
    }).join('')}

    <div class="resumo">
        <div class="total">SOMATÓRIO DE TODAS AS DESPESAS: ${formatCurrencyBR(somatorioDespesas)}</div>
        <div class="total">ACRÉSCIMO ${competencia.acrescimo_percentual}%: ${formatCurrencyBR(acrescimo)}</div>
        <div class="total">Taxa Geral (${formatNumberBR(competencia.area_total_m2)} m²) = ${formatCurrencyBR(dados.taxaGeral)}/m²</div>
        <div class="total" style="font-size: 1.3em; background-color: #007bff; color: white;">SOMATÓRIO DA TAXA GERAL: ${formatCurrencyBR(somatarioTaxaGeral)}</div>
    </div>

    <div class="rateio">
        <h3>Divisão Proporcional por Centro de Custo</h3>
        <table>
            <thead>
                <tr>
                    <th>Centro de Custo</th>
                    <th>Área (m²)</th>
                    <th>Valor Proporcional</th>
                </tr>
            </thead>
            <tbody>
                ${rateioUnidades.map(item => `
                    <tr>
                        <td>${item.nome}</td>
                        <td class="valor">${formatNumberBR(item.area_m2)}</td>
                        <td class="valor">${formatCurrencyBR(item.valor)}</td>
                    </tr>
                `).join('')}
                <tr style="font-weight: bold; background-color: #f8f9fa;">
                    <td>TOTAL</td>
                    <td class="valor">${formatNumberBR(competencia.area_total_m2)}</td>
                    <td class="valor">${formatCurrencyBR(somatarioTaxaGeral)}</td>
                </tr>
            </tbody>
        </table>
    </div>
</body>
</html>`;
}

function gerarDocumentoCentroCusto(dados: PrevisaoConsolidada): string {
  const { competencia } = dados;
  
  // Gerar documento para cada centro de custo (exemplo com SUDENE)
  const sudene = dados.centrosCusto.find(c => c.centro.nome === 'SUDENE');
  if (!sudene) return 'Centro de custo SUDENE não encontrado';
  
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Previsão de Despesas SUDENE - ${getCompetenciaText(competencia.mes, competencia.ano)}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
        .header { text-align: center; margin-bottom: 40px; }
        .categoria { margin-bottom: 20px; }
        .categoria h3 { background-color: #f8f9fa; padding: 10px; margin: 0; border-left: 4px solid #28a745; }
        .total { font-weight: bold; text-align: right; margin: 10px 0; font-size: 1.1em; }
        .resumo { background-color: #e9ecef; padding: 20px; margin: 20px 0; }
        .nota { font-style: italic; margin-top: 20px; padding: 15px; background-color: #fff3cd; }
    </style>
</head>
<body>
    <div class="header">
        <h1>PREVISÃO DE DESPESAS SUDENE</h1>
        <h2>${getCompetenciaText(competencia.mes, competencia.ano)}</h2>
        <p><strong>${sudene.centro.endereco}</strong></p>
        ${sudene.centro.cnpj ? `<p>CNPJ: ${sudene.centro.cnpj}</p>` : ''}
    </div>

    <div class="categoria">
        <h3>Pessoal</h3>
        <div class="total">TOTAL: ${formatCurrencyBR(sudene.itens.filter(i => i.categoria === 'Pessoal').reduce((s, i) => s + i.valor, 0))}</div>
    </div>

    <div class="categoria">
        <h3>Contratos</h3>
        <div class="total">TOTAL: ${formatCurrencyBR(sudene.itens.filter(i => i.categoria === 'Contratos').reduce((s, i) => s + i.valor, 0))}</div>
    </div>

    <div class="categoria">
        <h3>Variáveis</h3>
        <div class="total">TOTAL: ${formatCurrencyBR(sudene.itens.filter(i => i.categoria === 'Variáveis').reduce((s, i) => s + i.valor, 0))}</div>
    </div>

    <div class="resumo">
        <div class="total">SOMATÓRIO SUDENE: ${formatCurrencyBR(sudene.somatorioCentro)}</div>
        <div class="total">Acréscimo proporcional: ${formatCurrencyBR(sudene.proporcionalTaxa)}</div>
        <div class="total" style="font-size: 1.3em; color: #007bff;">TOTAL FINAL: ${formatCurrencyBR(sudene.valorTotal)}</div>
    </div>

    <div class="nota">
        <strong>Nota Explicativa:</strong><br>
        (SOMATÓRIO DAS DESPESAS SUDENE) + (VALOR PROPORCIONAL À TAXA DE CONDOMÍNIO GERAL m² SUDENE)
        <br><br>
        Área SUDENE: ${formatNumberBR(sudene.centro.area_m2)} m²
    </div>
</body>
</html>`;
}

function gerarDocumentoFatura(dados: PrevisaoConsolidada): string {
  const { competencia } = dados;
  const sudene = dados.centrosCusto.find(c => c.centro.nome === 'SUDENE');
  
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Solicitação de Fatura - ${getCompetenciaText(competencia.mes, competencia.ano)}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
        .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #007bff; padding-bottom: 20px; }
        .info { margin: 20px 0; }
        .valor-destaque { font-size: 1.5em; font-weight: bold; color: #007bff; text-align: center; margin: 30px 0; }
        .detalhes { background-color: #f8f9fa; padding: 20px; margin: 20px 0; }
        .rodape { margin-top: 40px; border-top: 1px solid #ddd; padding-top: 20px; font-size: 0.9em; }
    </style>
</head>
<body>
    <div class="header">
        <h1>SOLICITAÇÃO DE FATURA</h1>
        <h2>Demonstrativo da Taxa Proporcional</h2>
        <p><strong>${dados.condominio.nome}</strong></p>
        ${dados.condominio.endereco ? `<p>${dados.condominio.endereco}</p>` : ''}
        ${dados.condominio.cnpj ? `<p>CNPJ: ${dados.condominio.cnpj}</p>` : ''}
    </div>

    <div class="info">
        <p><strong>Competência:</strong> ${getCompetenciaText(competencia.mes, competencia.ano)}</p>
        <p><strong>Cliente:</strong> SUDENE</p>
        ${sudene?.centro.cnpj ? `<p><strong>CNPJ Cliente:</strong> ${sudene.centro.cnpj}</p>` : ''}
    </div>

    <div class="valor-destaque">
        Valor a Faturar: ${formatCurrencyBR(sudene?.valorTotal || 0)}
    </div>

    <div class="detalhes">
        <h3>Discriminação dos Serviços</h3>
        <p><strong>Descrição:</strong> Repasse de custos + taxa condominial proporcional por m²</p>
        
        <h4>Composição do Valor:</h4>
        <ul>
            <li>Despesas específicas SUDENE: ${formatCurrencyBR(sudene?.somatorioCentro || 0)}</li>
            <li>Taxa proporcional (${formatNumberBR(sudene?.centro.area_m2 || 0)} m²): ${formatCurrencyBR(sudene?.proporcionalTaxa || 0)}</li>
        </ul>
        
        <p><strong>Taxa por m²:</strong> ${formatCurrencyBR(dados.taxaGeral)}</p>
        <p><strong>Área total do empreendimento:</strong> ${formatNumberBR(competencia.area_total_m2)} m²</p>
    </div>

    <div class="rodape">
        <p><strong>Observações:</strong></p>
        <ul>
            <li>Valor sujeito a reajustes conforme contrato</li>
            <li>Pagamento até o dia 10 do mês subsequente</li>
            <li>Documento gerado automaticamente em ${new Date().toLocaleDateString('pt-BR')}</li>
        </ul>
    </div>
</body>
</html>`;
}

function gerarDocumentoBalancete(dados: PrevisaoConsolidada): string {
  const { competencia, totaisPorCategoria, centrosCusto } = dados;
  
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Balancete Consolidado - ${getCompetenciaText(competencia.mes, competencia.ano)}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
        .header { text-align: center; margin-bottom: 40px; }
        .secao { margin: 30px 0; }
        .secao h3 { background-color: #007bff; color: white; padding: 10px; margin: 0; }
        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        th { background-color: #f8f9fa; font-weight: bold; }
        .valor { text-align: right; font-weight: bold; }
        .total-geral { background-color: #e9ecef; font-weight: bold; font-size: 1.1em; }
        .resumo { background-color: #f8f9fa; padding: 20px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="header">
        <h1>BALANCETE CONSOLIDADO</h1>
        <h2>${getCompetenciaText(competencia.mes, competencia.ano)}</h2>
        <p><strong>${dados.condominio.nome}</strong></p>
        <p>Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</p>
    </div>

    <div class="resumo">
        <h3>Resumo Executivo</h3>
        <table>
            <tr>
                <th>Métrica</th>
                <th>Valor</th>
            </tr>
            <tr>
                <td>Área Total do Condomínio</td>
                <td class="valor">${formatNumberBR(competencia.area_total_m2)} m²</td>
            </tr>
            <tr>
                <td>Taxa por m²</td>
                <td class="valor">${formatCurrencyBR(dados.taxaGeral)}</td>
            </tr>
            <tr>
                <td>Total Mensal</td>
                <td class="valor">${formatCurrencyBR(dados.somatarioTaxaGeral)}</td>
            </tr>
            <tr>
                <td>Acréscimo Aplicado</td>
                <td class="valor">${competencia.acrescimo_percentual}%</td>
            </tr>
        </table>
    </div>

    <div class="secao">
        <h3>Despesas por Categoria</h3>
        <table>
            <thead>
                <tr>
                    <th>Categoria</th>
                    <th>Valor</th>
                    <th>% do Total</th>
                </tr>
            </thead>
            <tbody>
                ${Object.entries(totaisPorCategoria).map(([categoria, valor]) => `
                    <tr>
                        <td>${categoria}</td>
                        <td class="valor">${formatCurrencyBR(valor)}</td>
                        <td class="valor">${((valor / dados.somatorioDespesas) * 100).toFixed(1)}%</td>
                    </tr>
                `).join('')}
                <tr class="total-geral">
                    <td>TOTAL DESPESAS</td>
                    <td class="valor">${formatCurrencyBR(dados.somatorioDespesas)}</td>
                    <td class="valor">100%</td>
                </tr>
            </tbody>
        </table>
    </div>

    <div class="secao">
        <h3>Rateio por Centro de Custo</h3>
        <table>
            <thead>
                <tr>
                    <th>Centro de Custo</th>
                    <th>Área (m²)</th>
                    <th>Despesas Específicas</th>
                    <th>Taxa Proporcional</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
                ${centrosCusto.map(centro => `
                    <tr>
                        <td>${centro.centro.nome}</td>
                        <td class="valor">${formatNumberBR(centro.centro.area_m2)}</td>
                        <td class="valor">${formatCurrencyBR(centro.somatorioCentro)}</td>
                        <td class="valor">${formatCurrencyBR(centro.proporcionalTaxa)}</td>
                        <td class="valor">${formatCurrencyBR(centro.valorTotal)}</td>
                    </tr>
                `).join('')}
                <tr class="total-geral">
                    <td>TOTAL</td>
                    <td class="valor">${formatNumberBR(competencia.area_total_m2)}</td>
                    <td class="valor">${formatCurrencyBR(centrosCusto.reduce((s, c) => s + c.somatorioCentro, 0))}</td>
                    <td class="valor">${formatCurrencyBR(dados.somatarioTaxaGeral)}</td>
                    <td class="valor">${formatCurrencyBR(centrosCusto.reduce((s, c) => s + c.valorTotal, 0) + dados.somatarioTaxaGeral)}</td>
                </tr>
            </tbody>
        </table>
    </div>

    <div class="secao">
        <h3>Observações</h3>
        <ul>
            <li>Documento referente à competência ${getCompetenciaText(competencia.mes, competencia.ano)}</li>
            <li>Status da competência: ${competencia.status === 'fechado' ? 'FECHADA' : 'RASCUNHO'}</li>
            <li>Valores calculados com base na área total de ${formatNumberBR(competencia.area_total_m2)} m²</li>
            <li>Taxa aplicada: ${formatCurrencyBR(dados.taxaGeral)} por m²</li>
        </ul>
    </div>
</body>
</html>`;
}

export default previsaoApp;
