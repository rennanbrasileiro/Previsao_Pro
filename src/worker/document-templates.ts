import { formatCurrencyBR, formatNumberBR, getCompetenciaText } from "../shared/previsao-types";

// Estilos base para todos os documentos
const BASE_STYLES = `
  <style>
    @page {
      size: A4;
      margin: 0;
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      line-height: 1.6;
      color: #1a1a1a;
      background: white;
    }
    
    .document-container {
      width: 210mm;
      min-height: 297mm;
      padding: 2cm 2.5cm;
      margin: 0 auto;
      background: white;
    }
    
    .header {
      text-align: center;
      padding-bottom: 20px;
      border-bottom: 3px solid #1e40af;
      margin-bottom: 30px;
    }
    
    .logo {
      font-size: 24pt;
      font-weight: 900;
      color: #1e40af;
      letter-spacing: 1px;
      margin-bottom: 8px;
      text-transform: uppercase;
    }
    
    .endereco {
      font-size: 9pt;
      color: #4b5563;
      margin-bottom: 15px;
      line-height: 1.4;
    }
    
    .titulo-principal {
      font-size: 16pt;
      font-weight: 800;
      color: #111827;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 2px solid #93c5fd;
      padding-bottom: 8px;
      margin-top: 15px;
    }
    
    .secao {
      margin: 25px 0;
      page-break-inside: avoid;
    }
    
    .secao-titulo {
      font-size: 12pt;
      font-weight: 700;
      color: #1e40af;
      text-transform: uppercase;
      border-left: 4px solid #1e40af;
      padding-left: 12px;
      margin: 20px 0 15px 0;
      letter-spacing: 0.5px;
    }
    
    .item-linha {
      display: flex;
      justify-content: space-between;
      padding: 8px 12px;
      border-bottom: 1px solid #e5e7eb;
      transition: background 0.2s;
    }
    
    .item-linha:hover {
      background-color: #f9fafb;
    }
    
    .item-descricao {
      flex: 1;
      color: #374151;
      font-size: 10.5pt;
    }
    
    .item-valor {
      font-weight: 600;
      color: #111827;
      min-width: 140px;
      text-align: right;
      font-size: 10.5pt;
    }
    
    .total-secao {
      background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
      padding: 12px 15px;
      margin: 15px 0;
      border-left: 4px solid #2563eb;
      border-radius: 4px;
      font-weight: 700;
      color: #1e40af;
      text-align: right;
      font-size: 11pt;
    }
    
    .calculo-pagamento {
      background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
      border: 2px solid #0ea5e9;
      border-radius: 8px;
      padding: 20px;
      margin: 30px 0;
    }
    
    .calculo-linha {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      font-size: 11pt;
      color: #0f172a;
    }
    
    .calculo-linha.destaque {
      background: linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%);
      color: white;
      padding: 15px 20px;
      border-radius: 6px;
      margin-top: 15px;
      font-size: 12pt;
      font-weight: 800;
      box-shadow: 0 4px 6px rgba(30, 64, 175, 0.3);
    }
    
    .divisao-proporcional {
      margin-top: 30px;
    }
    
    .divisao-proporcional table {
      width: 100%;
      border-collapse: collapse;
      border: 2px solid #1e40af;
      border-radius: 8px;
      overflow: hidden;
    }
    
    .divisao-proporcional th,
    .divisao-proporcional td {
      padding: 12px 15px;
      text-align: left;
      border-bottom: 1px solid #e5e7eb;
    }
    
    .divisao-proporcional th {
      background: linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%);
      color: white;
      font-weight: 700;
      font-size: 10.5pt;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .divisao-proporcional td {
      background: white;
      font-size: 10.5pt;
    }
    
    .divisao-proporcional tr:last-child td {
      border-bottom: none;
    }
    
    .divisao-proporcional td.valor {
      text-align: right;
      font-weight: 600;
      color: #1e40af;
    }
    
    .nota-explicativa {
      background: #fef3c7;
      border: 2px solid #fbbf24;
      border-radius: 8px;
      padding: 15px 20px;
      margin-top: 25px;
      font-size: 10pt;
      line-height: 1.8;
      color: #78350f;
    }
    
    .nota-explicativa strong {
      display: block;
      color: #92400e;
      margin-bottom: 8px;
      font-size: 11pt;
    }
    
    .rodape {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #e5e7eb;
      text-align: center;
      font-size: 9pt;
      color: #6b7280;
    }
    
    .fatura-info {
      background: white;
      border: 3px solid #1e40af;
      border-radius: 8px;
      padding: 20px;
      margin: 25px 0;
    }
    
    .fatura-info table {
      width: 100%;
    }
    
    .fatura-info td {
      padding: 10px;
      border-bottom: 1px solid #e5e7eb;
    }
    
    .fatura-info td:first-child {
      font-weight: 700;
      color: #1e40af;
      width: 35%;
      background: #f0f9ff;
    }
    
    .fatura-info td:last-child {
      color: #111827;
    }
    
    .valor-destaque {
      font-size: 16pt;
      font-weight: 800;
      color: #dc2626;
    }
    
    .dados-pagamento {
      background: #f0fdf4;
      border: 2px solid #22c55e;
      border-radius: 8px;
      padding: 20px;
      margin: 25px 0;
    }
    
    .dados-pagamento h3 {
      color: #15803d;
      font-size: 12pt;
      font-weight: 700;
      margin-bottom: 15px;
      text-transform: uppercase;
    }
    
    .dados-pagamento table {
      width: 100%;
    }
    
    .dados-pagamento td {
      padding: 8px 10px;
      font-size: 10pt;
    }
    
    .dados-pagamento td:first-child {
      font-weight: 600;
      color: #166534;
      width: 30%;
    }
    
    .assinatura {
      margin-top: 50px;
      text-align: center;
    }
    
    .linha-assinatura {
      border-top: 2px solid #111827;
      width: 350px;
      margin: 50px auto 15px auto;
    }
    
    @media print {
      .document-container {
        padding: 1.5cm 2cm;
      }
      
      body {
        print-color-adjust: exact;
        -webkit-print-color-adjust: exact;
      }
      
      .secao {
        page-break-inside: avoid;
      }
    }
  </style>
`;

export function gerarDocumentoCondominio(dados: any): string {
  const { competencia, itens, totaisPorCategoria, somatorioDespesas, acrescimo, somatarioTaxaGeral, rateioUnidades, condominio } = dados;
  
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Previsão de Despesas Condomínio - ${getCompetenciaText(competencia.mes, competencia.ano)}</title>
    ${BASE_STYLES}
</head>
<body>
  <div class="document-container">
    <div class="header">
      <div class="logo">${condominio.nome || 'SOUZA MELO TOWER'}</div>
      <div class="endereco">
        ${condominio.endereco || 'Av. Eng. Domingos Ferreira, 1967 - Boa Viagem - Recife-PE CEP: 51.111-021'}
      </div>
      <div class="titulo-principal">
        PREVISÃO DE DESPESAS CONDOMÍNIO<br>
        ${getCompetenciaText(competencia.mes, competencia.ano).toUpperCase()}
      </div>
    </div>

    ${['Despesas de Pessoal', 'Contratos Mensais', 'Despesas Concessionárias (Estimado)', 'Despesas Anuais (Estimado)', 'Despesas Mensais Variáveis (Estimado)'].map(categoria => {
      const itensCategoria = itens?.filter((item: any) => item.categoria === categoria) || [];
      if (itensCategoria.length === 0) return '';
      
      return `
        <div class="secao">
          <div class="secao-titulo">${categoria.toUpperCase()}</div>
          ${itensCategoria.map((item: any) => `
            <div class="item-linha">
              <div class="item-descricao">${item.descricao}</div>
              <div class="item-valor">${formatCurrencyBR(item.valor)}</div>
            </div>
          `).join('')}
          <div class="total-secao">TOTAL: ${formatCurrencyBR(totaisPorCategoria[categoria] || 0)}</div>
        </div>
      `;
    }).join('')}

    <div class="calculo-pagamento">
      <div class="secao-titulo">CÁLCULO PARA PAGAMENTO</div>
      <div class="calculo-linha">
        <span>SOMATÓRIO DE TODAS AS DESPESAS:</span>
        <span><strong>${formatCurrencyBR(somatorioDespesas)}</strong></span>
      </div>
      <div class="calculo-linha">
        <span>ACRÉSCIMO ${formatNumberBR(competencia.acrescimo_percentual)}%:</span>
        <span><strong>${formatCurrencyBR(acrescimo)}</strong></span>
      </div>
      <div class="calculo-linha">
        <span>TAXA DE CONDOMÍNIO GERAL (${formatNumberBR(competencia.area_total_m2)}m²):</span>
        <span><strong>R$ ${formatNumberBR(dados.taxaGeral)}/m²</strong></span>
      </div>
      <div class="calculo-linha destaque">
        <span>SOMATÓRIO DA TAXA DE CONDOMÍNIO GERAL:</span>
        <span>${formatCurrencyBR(somatarioTaxaGeral)}</span>
      </div>
    </div>

    <div class="divisao-proporcional">
      <div class="secao-titulo">DIVISÃO PROPORCIONAL PARA PAGAMENTO</div>
      <table>
        <thead>
          <tr>
            <th>Centro de Custo</th>
            <th style="text-align: right;">Área (m²)</th>
            <th style="text-align: right;">Valor Proporcional</th>
          </tr>
        </thead>
        <tbody>
          ${rateioUnidades.map((item: any) => `
            <tr>
              <td>${item.nome}</td>
              <td class="valor">${formatNumberBR(item.area_m2)}</td>
              <td class="valor">${formatCurrencyBR(item.valor)}</td>
            </tr>
          `).join('')}
          <tr style="font-weight: 700; background: #eff6ff;">
            <td>TOTAL</td>
            <td class="valor">${formatNumberBR(competencia.area_total_m2)}</td>
            <td class="valor">${formatCurrencyBR(somatarioTaxaGeral)}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="rodape">
      Documento gerado em ${new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
    </div>
  </div>
</body>
</html>`;
}

export function gerarDocumentoCentroCusto(dados: any): string {
  const { competencia, condominio } = dados;
  
  let centroCusto = dados.centrosCusto?.find((c: any) => c.centro.nome === 'SUDENE');
  if (!centroCusto && dados.centrosCusto?.length > 0) {
    centroCusto = dados.centrosCusto[0];
  }
  if (!centroCusto) return '<html><body><h1>Nenhum centro de custo encontrado</h1></body></html>';
  
  const itensPessoal = centroCusto.itens.filter((i: any) => i.categoria === 'Pessoal');
  const itensContratos = centroCusto.itens.filter((i: any) => i.categoria === 'Contratos');
  const itensVariaveis = centroCusto.itens.filter((i: any) => i.categoria === 'Variáveis');
  
  const totalPessoal = itensPessoal.reduce((s: number, i: any) => s + i.valor, 0);
  const totalContratos = itensContratos.reduce((s: number, i: any) => s + i.valor, 0);
  const totalVariaveis = itensVariaveis.reduce((s: number, i: any) => s + i.valor, 0);
  
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Previsão de Despesas ${centroCusto.centro.nome} - ${getCompetenciaText(competencia.mes, competencia.ano)}</title>
    ${BASE_STYLES}
</head>
<body>
  <div class="document-container">
    <div class="header">
      <div class="logo">${condominio.nome || 'SOUZA MELO TOWER'}</div>
      <div class="endereco">
        ${condominio.endereco || 'Av. Eng. Domingos Ferreira, 1967 - Boa Viagem - Recife-PE CEP: 51.111-021'}
      </div>
      <div class="titulo-principal">
        PREVISÃO DE DESPESAS ${centroCusto.centro.nome.toUpperCase()}<br>
        ${getCompetenciaText(competencia.mes, competencia.ano).toUpperCase()}
      </div>
    </div>

    ${itensPessoal.length > 0 ? `
    <div class="secao">
      <div class="secao-titulo">DESPESAS DE PESSOAL</div>
      ${itensPessoal.map((item: any) => `
        <div class="item-linha">
          <div class="item-descricao">${item.descricao}</div>
          <div class="item-valor">${formatCurrencyBR(item.valor)}</div>
        </div>
      `).join('')}
      <div class="total-secao">TOTAL: ${formatCurrencyBR(totalPessoal)}</div>
    </div>
    ` : ''}

    ${itensContratos.length > 0 ? `
    <div class="secao">
      <div class="secao-titulo">CONTRATOS MENSAIS</div>
      ${itensContratos.map((item: any) => `
        <div class="item-linha">
          <div class="item-descricao">${item.descricao}</div>
          <div class="item-valor">${formatCurrencyBR(item.valor)}</div>
        </div>
      `).join('')}
      <div class="total-secao">TOTAL CONTRATOS MENSAIS: ${formatCurrencyBR(totalContratos)}</div>
    </div>
    ` : ''}

    ${itensVariaveis.length > 0 ? `
    <div class="secao">
      <div class="secao-titulo">DESPESAS VARIÁVEIS</div>
      ${itensVariaveis.map((item: any) => `
        <div class="item-linha">
          <div class="item-descricao">${item.descricao}</div>
          <div class="item-valor">${formatCurrencyBR(item.valor)}</div>
        </div>
      `).join('')}
      <div class="total-secao">TOTAL DESPESAS VARIÁVEIS: ${formatCurrencyBR(totalVariaveis)}</div>
    </div>
    ` : ''}

    <div class="calculo-pagamento">
      <div class="secao-titulo">CÁLCULO PARA PAGAMENTO</div>
      <div class="calculo-linha">
        <span>SOMATÓRIO DAS DESPESAS ${centroCusto.centro.nome.toUpperCase()}:</span>
        <span><strong>${formatCurrencyBR(centroCusto.somatorioCentro)}</strong></span>
      </div>
      <div class="calculo-linha">
        <span>VALOR PROPORCIONAL À TAXA DE CONDOMÍNIO GERAL m² ${centroCusto.centro.nome.toUpperCase()}:</span>
        <span><strong>${formatCurrencyBR(centroCusto.proporcionalTaxa)}</strong></span>
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

    <div class="rodape">
      Documento gerado em ${new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
    </div>
  </div>
</body>
</html>`;
}

export function gerarDocumentoFatura(dados: any): string {
  const { competencia, condominio } = dados;
  
  let centroCusto = dados.centrosCusto?.find((c: any) => c.centro.nome === 'SUDENE');
  if (!centroCusto && dados.centrosCusto?.length > 0) {
    centroCusto = dados.centrosCusto[0];
  }
  if (!centroCusto) return '<html><body><h1>Nenhum centro de custo encontrado</h1></body></html>';
  
  const dataVencimento = `10/${String(competencia.mes).padStart(2, '0')}/${competencia.ano}`;
  const numeroFatura = String(competencia.id).padStart(6, '0');
  
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Fatura de Condomínio - ${centroCusto.centro.nome} - ${getCompetenciaText(competencia.mes, competencia.ano)}</title>
    ${BASE_STYLES}
</head>
<body>
  <div class="document-container">
    <div class="header">
      <div class="logo">${condominio.nome || 'SOUZA MELO TOWER'}</div>
      <div class="titulo-principal">FATURA DE CONDOMÍNIO</div>
    </div>

    <div class="fatura-info">
      <table>
        <tr>
          <td>FATURA N°</td>
          <td><strong>${numeroFatura}</strong></td>
        </tr>
        <tr>
          <td>COMPETÊNCIA</td>
          <td><strong>${getCompetenciaText(competencia.mes, competencia.ano).toUpperCase()}</strong></td>
        </tr>
        <tr>
          <td>VENCIMENTO</td>
          <td><strong>${dataVencimento}</strong></td>
        </tr>
        <tr>
          <td>VALOR MENSAL</td>
          <td class="valor-destaque">${formatCurrencyBR(centroCusto.valorTotal)}</td>
        </tr>
      </table>
    </div>

    <div class="secao">
      <p style="margin-bottom: 15px; line-height: 1.8; font-size: 11pt;">
        Prezado(a) <strong>${centroCusto.centro.razao_social || centroCusto.centro.nome}</strong>,
      </p>
      
      <p style="margin-bottom: 15px; line-height: 1.8; font-size: 11pt;">
        Através deste, solicitamos o pagamento da taxa condominial referente ao <strong>MÊS DE ${getCompetenciaText(competencia.mes, competencia.ano).toUpperCase()}</strong>, 
        no valor de <strong>${formatCurrencyBR(centroCusto.valorTotal)}</strong>, 
        referente à área em uso: <strong>${centroCusto.centro.endereco || 'Área total de ' + formatNumberBR(centroCusto.centro.area_m2) + 'm²'}</strong>.
      </p>
      
      <p style="margin-bottom: 20px; line-height: 1.8; font-size: 11pt;">
        O referido pagamento deverá ser realizado através de depósito na conta corrente abaixo:
      </p>
    </div>

    <div class="dados-pagamento">
      <h3>DADOS PARA PAGAMENTO</h3>
      <table>
        <tr>
          <td>FAVORECIDO:</td>
          <td><strong>CONDOMÍNIO EDIF. SOUZA MELO TOWER</strong></td>
        </tr>
        <tr>
          <td>BANCO:</td>
          <td><strong>CAIXA ECONÔMICA FEDERAL</strong></td>
        </tr>
        <tr>
          <td>AGÊNCIA:</td>
          <td><strong>3018</strong></td>
        </tr>
        <tr>
          <td>CONTA CORRENTE:</td>
          <td><strong>1934-9</strong></td>
        </tr>
        <tr>
          <td>CNPJ:</td>
          <td><strong>${condominio.cnpj || '25.184.237/0001-09'}</strong></td>
        </tr>
      </table>
    </div>

    <div class="assinatura">
      <p style="margin-bottom: 10px; font-size: 10.5pt;">
        Recife - PE, ${new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
      </p>
      <div class="linha-assinatura"></div>
      <p style="font-weight: 700; font-size: 11pt; margin-bottom: 5px;">CONDOMÍNIO EDIF. SOUZA MELO TOWER</p>
      <p style="font-size: 10pt; color: #6b7280;">CNPJ: ${condominio.cnpj || '25.184.237/0001-09'}</p>
    </div>

    <div class="rodape">
      ${condominio.endereco || 'Av. Engenheiro Domingos Ferreira, n.º 1967 - Boa Viagem - Recife - PE'}
    </div>
  </div>
</body>
</html>`;
}
