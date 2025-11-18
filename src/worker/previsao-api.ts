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
import { 
  gerarDocumentoCondominio, 
  gerarDocumentoCentroCusto, 
  gerarDocumentoFatura 
} from "./document-templates";

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

// Funções antigas de geração de documentos removidas
// Agora usando document-templates.ts para templates melhorados
/* FUNÇÕES ANTIGAS REMOVIDAS:
 * - gerarDocumentoCondominio
 * - gerarDocumentoCentroCusto  
 * - gerarDocumentoFatura
 * Agora importadas de document-templates.ts
 */

function _PLACEHOLDER_OLD_FUNCTION(dados: PrevisaoConsolidada): string {
  // Função removida - usar gerarDocumentoCondominio de document-templates.ts
  return '<html><body>Função removida - usar document-templates.ts</body></html>';
}

function _PLACEHOLDER_gerarDocumentoCentroCusto(dados: PrevisaoConsolidada): string {
  // Função removida - usar gerarDocumentoCentroCusto de document-templates.ts
  return '<html><body>Função removida - usar document-templates.ts</body></html>';
}
    <style>
        @page { size: A4; margin: 2cm; }
        body { 
            font-family: Arial, sans-serif; 
            margin: 0; 
            padding: 20px;
            line-height: 1.4;
            font-size: 11pt;
            color: #000;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #000;
            padding-bottom: 15px;
        }
        .logo {
            font-size: 20pt;
            font-weight: bold;
            color: #1a5490;
            margin-bottom: 5px;
        }
        .endereco {
            font-size: 9pt;
            color: #333;
            margin-bottom: 15px;
        }
        .titulo-principal {
            font-size: 14pt;
            font-weight: bold;
            text-decoration: underline;
            margin: 15px 0;
        }
        .secao {
            margin: 20px 0;
            page-break-inside: avoid;
        }
        .secao-titulo {
            font-size: 11pt;
            font-weight: bold;
            text-decoration: underline;
            margin: 15px 0 10px 0;
        }
        .item-linha {
            display: flex;
            justify-content: space-between;
            padding: 3px 0;
            border-bottom: 1px dotted #ccc;
        }
        .item-descricao {
            flex: 1;
            padding-right: 10px;
        }
        .item-valor {
            text-align: right;
            min-width: 120px;
            font-weight: 500;
        }
        .total-secao {
            font-weight: bold;
            margin: 10px 0;
            padding: 8px;
            background-color: #f0f0f0;
            text-align: right;
            border: 1px solid #ccc;
        }
        .calculo-pagamento {
            margin: 25px 0;
            padding: 15px;
            background-color: #f8f9fa;
            border: 2px solid #333;
        }
        .calculo-linha {
            display: flex;
            justify-content: space-between;
            padding: 5px 0;
            font-size: 11pt;
        }
        .calculo-linha.destaque {
            font-weight: bold;
            font-size: 12pt;
            border-top: 2px solid #000;
            border-bottom: 2px solid #000;
            padding: 10px 0;
            margin-top: 10px;
        }
        .nota-explicativa {
            margin-top: 20px;
            padding: 15px;
            background-color: #fff9e6;
            border: 1px solid #e0d090;
            border-radius: 5px;
        }
        .nota-explicativa strong {
            display: block;
            margin-bottom: 8px;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">SOUZA MELO TOWER</div>
        <div class="endereco">CONDOMÍNIO DO EDIFÍCIO SOUZA MELO TOWER / ${dados.condominio.endereco || 'Av. Eng. Domingos Ferreira, 1967 - Boa Viagem - Recife-PE'}</div>
        <div class="titulo-principal">PREVISÃO DE DESPESAS ${centroCusto.centro.nome.toUpperCase()} - ${getCompetenciaText(competencia.mes, competencia.ano).toUpperCase()}</div>
    </div>

    <div class="secao">
        <div class="secao-titulo">DESPESAS DE PESSOAL</div>
        ${itensPessoal.map(item => `
            <div class="item-linha">
                <div class="item-descricao">${item.descricao}</div>
                <div class="item-valor">${formatCurrencyBR(item.valor)}</div>
            </div>
        `).join('')}
        <div class="total-secao">TOTAL: ${formatCurrencyBR(totalPessoal)}</div>
    </div>

    <div class="secao">
        <div class="secao-titulo">CONTRATOS MENSAIS</div>
        ${itensContratos.map(item => `
            <div class="item-linha">
                <div class="item-descricao">${item.descricao}</div>
                <div class="item-valor">${formatCurrencyBR(item.valor)}</div>
            </div>
        `).join('')}
        <div class="total-secao">TOTAL CONTRATOS MENSAIS: ${formatCurrencyBR(totalContratos)}</div>
    </div>

    <div class="secao">
        <div class="secao-titulo">DESPESAS VARIÁVEIS</div>
        ${itensVariaveis.map(item => `
            <div class="item-linha">
                <div class="item-descricao">${item.descricao}</div>
                <div class="item-valor">${formatCurrencyBR(item.valor)}</div>
            </div>
        `).join('')}
        <div class="total-secao">TOTAL DESPESAS VARIÁVEIS: ${formatCurrencyBR(totalVariaveis)}</div>
    </div>

    <div class="calculo-pagamento">
        <div class="secao-titulo">CÁLCULO PARA PAGAMENTO</div>
        <div class="calculo-linha">
            <span>SOMATÓRIO DAS DESPESAS ${centroCusto.centro.nome.toUpperCase()}:</span>
            <span>${formatCurrencyBR(centroCusto.somatorioCentro)}</span>
        </div>
        <div class="calculo-linha">
            <span>VALOR PROPORCIONAL À TAXA DE CONDOMÍNIO GERAL m² ${centroCusto.centro.nome.toUpperCase()}:</span>
            <span>${formatCurrencyBR(centroCusto.proporcionalTaxa)}</span>
        </div>
        <div class="calculo-linha destaque">
            <span>SOMATÓRIO DA TAXA DE CONDOMÍNIO PROPORCIONAL - ${centroCusto.centro.nome.toUpperCase()}:</span>
            <span>${formatCurrencyBR(centroCusto.valorTotal)}</span>
        </div>
    </div>

    <div class="nota-explicativa">
        <strong>Nota explicativa:</strong>
        (SOMATÓRIO DAS DESPESAS ${centroCusto.centro.nome.toUpperCase()}) + (VALOR PROPORCIONAL À TAXA DE CONDOMÍNIO GERAL m² ${centroCusto.centro.nome.toUpperCase()})
        <br><br>
        Área ${centroCusto.centro.nome}: ${formatNumberBR(centroCusto.centro.area_m2)} m²
        ${centroCusto.centro.endereco ? `<br>Referência: ${centroCusto.centro.endereco}` : ''}
    </div>
</body>
</html>`;
}

function gerarDocumentoFatura(dados: PrevisaoConsolidada): string {
  const { competencia } = dados;
  
  // Pegar o primeiro centro de custo ou SUDENE especificamente
  let centroCusto = dados.centrosCusto.find(c => c.centro.nome === 'SUDENE');
  if (!centroCusto && dados.centrosCusto.length > 0) {
    centroCusto = dados.centrosCusto[0];
  }
  if (!centroCusto) return '<html><body>Nenhum centro de custo encontrado</body></html>';
  
  // Calcular data de vencimento (dia 10 do mês da competência)
  const dataVencimento = `10/${String(competencia.mes).padStart(2, '0')}/${competencia.ano}`;
  const valorPorExtenso = converterValorParaExtenso(centroCusto.valorTotal);
  
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Fatura de Condomínio - ${centroCusto.centro.nome} - ${getCompetenciaText(competencia.mes, competencia.ano)}</title>
    <style>
        @page { size: A4; margin: 2cm; }
        body { 
            font-family: Arial, sans-serif; 
            margin: 0; 
            padding: 30px;
            line-height: 1.6;
            font-size: 11pt;
            color: #000;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #000;
            padding-bottom: 20px;
        }
        .logo {
            font-size: 22pt;
            font-weight: bold;
            color: #1a5490;
            margin-bottom: 10px;
        }
        .titulo-fatura {
            font-size: 16pt;
            font-weight: bold;
            margin: 20px 0;
        }
        .info-fatura {
            border: 2px solid #000;
            padding: 15px;
            margin: 20px 0;
        }
        .info-fatura table {
            width: 100%;
            border-collapse: collapse;
        }
        .info-fatura td {
            padding: 8px;
            border: 1px solid #333;
        }
        .info-fatura td:first-child {
            font-weight: bold;
            width: 30%;
            background-color: #f0f0f0;
        }
        .corpo-texto {
            margin: 25px 0;
            text-align: justify;
            line-height: 1.8;
        }
        .dados-pagamento {
            margin: 25px 0;
            padding: 15px;
            background-color: #f8f9fa;
            border: 1px solid #ccc;
        }
        .dados-pagamento h3 {
            margin: 0 0 10px 0;
            font-size: 12pt;
        }
        .dados-pagamento table {
            width: 100%;
            margin-top: 10px;
        }
        .dados-pagamento td {
            padding: 5px 10px;
        }
        .dados-pagamento td:first-child {
            font-weight: bold;
            width: 30%;
        }
        .rodape {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 1px solid #ccc;
            text-align: center;
        }
        .assinatura {
            margin-top: 30px;
            text-align: center;
        }
        .linha-assinatura {
            border-top: 1px solid #000;
            width: 300px;
            margin: 50px auto 10px auto;
        }
        .valor-destaque {
            font-size: 14pt;
            font-weight: bold;
            color: #c00;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">SOUZA MELO TOWER</div>
        <div class="titulo-fatura">FATURA DE CONDOMÍNIO</div>
    </div>

    <div class="info-fatura">
        <table>
            <tr>
                <td>FATURA N°</td>
                <td>${competencia.id.toString().padStart(6, '0')}</td>
            </tr>
            <tr>
                <td>VENCIMENTO</td>
                <td>${dataVencimento}</td>
            </tr>
            <tr>
                <td>VALOR MENSAL</td>
                <td class="valor-destaque">${formatCurrencyBR(centroCusto.valorTotal)}</td>
            </tr>
        </table>
    </div>

    <div class="corpo-texto">
        <p>Prezado(a) <strong>${centroCusto.centro.razao_social || centroCusto.centro.nome}</strong>,</p>
        
        <p>Através deste, solicitamos o pagamento da taxa condominial referente ao <strong>MÊS DE ${getCompetenciaText(competencia.mes, competencia.ano).toUpperCase()}</strong>, 
        no valor de <strong>${formatCurrencyBR(centroCusto.valorTotal)}</strong> (${valorPorExtenso}), 
        referente à área em uso, a saber: <strong>${centroCusto.centro.endereco || 'Área total de ' + formatNumberBR(centroCusto.centro.area_m2) + 'm²'}</strong>.</p>
        
        <p>O referido pagamento deverá ser pago através de depósito na conta corrente abaixo:</p>
    </div>

    <div class="dados-pagamento">
        <h3>DADOS PARA PAGAMENTO</h3>
        <table>
            <tr>
                <td>FAVORECIDO:</td>
                <td>CONDOMÍNIO EDIF. SOUZA MELO TOWER</td>
            </tr>
            <tr>
                <td>BANCO:</td>
                <td>CAIXA ECONÔMICA FEDERAL</td>
            </tr>
            <tr>
                <td>AG:</td>
                <td>3018</td>
            </tr>
            <tr>
                <td>C/C:</td>
                <td>1934-9</td>
            </tr>
            <tr>
                <td>CNPJ:</td>
                <td>${dados.condominio.cnpj || '25.184.237/0001-09'}</td>
            </tr>
        </table>
    </div>

    <div class="assinatura">
        <p>Recife - PE, ${new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
        <div class="linha-assinatura"></div>
        <p><strong>CONDOMÍNIO EDIF. SOUZA MELO TOWER</strong></p>
        <p>CNPJ: ${dados.condominio.cnpj || '25.184.237/0001-09'}</p>
    </div>

    <div class="rodape">
        <p style="font-size: 9pt;">${dados.condominio.endereco || 'Av. Engenheiro Domingos Ferreira, n.º 1967 - Boa Viagem - Recife - PE'}</p>
    </div>
</body>
</html>`;
}

// Função auxiliar para converter valor para extenso (simplificada)
function converterValorParaExtenso(valor: number): string {
  // Implementação simplificada - em produção usar biblioteca especializada
  const parteInteira = Math.floor(valor);
  const parteDecimal = Math.round((valor - parteInteira) * 100);
  
  // Apenas uma implementação básica para o exemplo
  return `${parteInteira.toLocaleString('pt-BR')} reais e ${parteDecimal.toString().padStart(2, '0')} centavos`;
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
