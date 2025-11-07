import { useState } from 'react';
import { Calculator, Download, FileText, RefreshCw } from 'lucide-react';
import { useAPI, apiPost, formatCurrency, formatNumber } from '../hooks/useAPI';
import { Condominio, DadosBalancete } from '../../shared/types';

export default function Balancetes() {
  const [selectedCondominio, setSelectedCondominio] = useState<number>(1);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [isCalculating, setIsCalculating] = useState(false);

  const { data: condominios } = useAPI<Condominio[]>('/api/condominios');
  const { data: balancete, loading: loadingBalancete, refetch } = useAPI<DadosBalancete>(
    `/api/balancetes?condominioId=${selectedCondominio}&mes=${selectedMonth}&ano=${selectedYear}`
  );

  const handleCalculateBalancete = async () => {
    try {
      setIsCalculating(true);
      await apiPost('/api/balancetes/calcular', {
        condominioId: selectedCondominio,
        mes: selectedMonth,
        ano: selectedYear
      });
      refetch();
    } catch (error) {
      console.error('Erro ao calcular balancete:', error);
      alert('Erro ao calcular balancete. Tente novamente.');
    } finally {
      setIsCalculating(false);
    }
  };

  const handleDownloadPDF = () => {
    // Simular download PDF
    const element = document.createElement('a');
    const file = new Blob([generatePDFContent()], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `balancete-${selectedMonth}-${selectedYear}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleDownloadCSV = () => {
    if (!balancete) return;
    
    const csvContent = generateCSVContent();
    const element = document.createElement('a');
    const file = new Blob([csvContent], { type: 'text/csv' });
    element.href = URL.createObjectURL(file);
    element.download = `balancete-${selectedMonth}-${selectedYear}.csv`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const generatePDFContent = (): string => {
    if (!balancete) return '';
    
    const condominio = condominios?.find(c => c.id === selectedCondominio);
    
    return `
BALANCETE MENSAL - ${condominio?.nome || 'Condomínio'}
Período: ${selectedMonth.toString().padStart(2, '0')}/${selectedYear}

RESUMO EXECUTIVO
================
Taxa por m²: R$ ${formatNumber(balancete.taxaM2)}
Total Mensal: ${formatCurrency(balancete.totalMensal)}

DESPESAS POR CATEGORIA
======================
${Object.entries(balancete.totaisPorCategoria)
  .map(([categoria, valor]) => `${categoria}: ${formatCurrency(valor)}`)
  .join('\n')}

RATEIO POR UNIDADE
==================
${balancete.rateio
  .map(item => `${item.identificacao} - ${item.inquilino || 'Vago'} - ${formatNumber(item.areaM2)} m² - ${formatCurrency(item.valorTotal)}`)
  .join('\n')}
`;
  };

  const generateCSVContent = (): string => {
    if (!balancete) return '';
    
    const header = 'Unidade,Inquilino,Area_m2,Valor_Condominial,Valor_Centro_Custo,Valor_Total\n';
    const rows = balancete.rateio
      .map(item => `"${item.identificacao}","${item.inquilino || 'Vago'}",${item.areaM2},${item.valorCondominial},${item.valorCentroCusto},${item.valorTotal}`)
      .join('\n');
    
    return header + rows;
  };

  const months = [
    { value: 1, label: 'Janeiro' },
    { value: 2, label: 'Fevereiro' },
    { value: 3, label: 'Março' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Maio' },
    { value: 6, label: 'Junho' },
    { value: 7, label: 'Julho' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Setembro' },
    { value: 10, label: 'Outubro' },
    { value: 11, label: 'Novembro' },
    { value: 12, label: 'Dezembro' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/60 p-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Balancetes</h1>
            <p className="text-slate-600">Gestão de balancetes mensais e previsões</p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={selectedCondominio}
              onChange={(e) => setSelectedCondominio(Number(e.target.value))}
              className="px-4 py-2 border border-slate-300 rounded-lg bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {condominios?.map((cond) => (
                <option key={cond.id} value={cond.id}>
                  {cond.nome}
                </option>
              ))}
            </select>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="px-4 py-2 border border-slate-300 rounded-lg bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {months.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-4 py-2 border border-slate-300 rounded-lg bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={2024}>2024</option>
              <option value={2025}>2025</option>
            </select>
          </div>
        </div>
      </div>

      {/* Ações */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/60 p-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleCalculateBalancete}
              disabled={isCalculating}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg shadow-blue-500/25 disabled:opacity-50"
            >
              {isCalculating ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <Calculator className="w-5 h-5" />
              )}
              <span>{isCalculating ? 'Calculando...' : 'Calcular Balancete'}</span>
            </button>
          </div>
          
          {balancete && (
            <div className="flex items-center space-x-2">
              <button
                onClick={handleDownloadPDF}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>PDF</span>
              </button>
              <button
                onClick={handleDownloadCSV}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>CSV</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Conteúdo do Balancete */}
      {loadingBalancete ? (
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/60 p-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      ) : balancete ? (
        <div className="space-y-8">
          {/* Resumo Executivo */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/60 p-8">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-blue-600" />
              Resumo Executivo
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6">
                <h3 className="text-sm font-semibold text-blue-700 mb-2">Taxa por m²</h3>
                <p className="text-2xl font-bold text-blue-900">R$ {formatNumber(balancete.taxaM2)}</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6">
                <h3 className="text-sm font-semibold text-green-700 mb-2">Total Mensal</h3>
                <p className="text-2xl font-bold text-green-900">{formatCurrency(balancete.totalMensal)}</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6">
                <h3 className="text-sm font-semibold text-purple-700 mb-2">Unidades</h3>
                <p className="text-2xl font-bold text-purple-900">{balancete.rateio.length}</p>
              </div>
            </div>
          </div>

          {/* Despesas por Categoria */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/60 p-8">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Despesas por Categoria</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(balancete.totaisPorCategoria).map(([categoria, valor]) => (
                <div key={categoria} className="bg-slate-50/80 rounded-xl p-4 border border-slate-200/60">
                  <h3 className="font-semibold text-slate-800 mb-1">{categoria}</h3>
                  <p className="text-xl font-bold text-blue-600">{formatCurrency(valor)}</p>
                  <p className="text-sm text-slate-600 mt-1">
                    {((valor / balancete.totalMensal) * 100).toFixed(1)}% do total
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Rateio por Unidade */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/60 p-8">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Rateio por Unidade</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Unidade</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Inquilino</th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-700">Área (m²)</th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-700">Valor Condominial</th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-700">Centro de Custo</th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-700">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {balancete.rateio.map((item) => (
                    <tr key={item.unidadeId} className="border-b border-slate-100 hover:bg-slate-50/80">
                      <td className="py-3 px-4 font-medium text-slate-900">{item.identificacao}</td>
                      <td className="py-3 px-4 text-slate-700">{item.inquilino || 'Vago'}</td>
                      <td className="py-3 px-4 text-right text-slate-700">{formatNumber(item.areaM2)}</td>
                      <td className="py-3 px-4 text-right font-medium text-slate-900">
                        {formatCurrency(item.valorCondominial)}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-700">
                        {formatCurrency(item.valorCentroCusto)}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-blue-600">
                        {formatCurrency(item.valorTotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/60 p-8">
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-700 mb-2">Nenhum balancete encontrado</h3>
            <p className="text-slate-600 mb-6">
              Não há balancete para o período selecionado. Clique em "Calcular Balancete" para gerar.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
