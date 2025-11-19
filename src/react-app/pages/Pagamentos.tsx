import { useState, useEffect } from 'react';
import { Check, X, Clock, AlertCircle, Plus } from 'lucide-react';
import { useAPI, apiPost, formatCurrency } from '../hooks/useAPI';
import { Competencia, PagamentoEfetuado, ComparacaoProjetadoExecutado } from '../../shared/previsao-types';
import { motion } from 'framer-motion';

export default function Pagamentos() {
  const [selectedCondominio, setSelectedCondominio] = useState<number>(1);
  const [selectedCompetencia, setSelectedCompetencia] = useState<number | null>(null);
  const [selectedCentroCusto, setSelectedCentroCusto] = useState<number | null>(null);

  const { data: condominios } = useAPI<any[]>('/api/condominios');
  const { data: competencias } = useAPI<Competencia[]>(
    `/api/previsoes/competencias?condominioId=${selectedCondominio}`
  );
  const { data: centrosCusto } = useAPI<any[]>(
    `/api/centros-custo?condominioId=${selectedCondominio}`
  );

  const { data: pagamentos, refetch: refetchPagamentos } = useAPI<PagamentoEfetuado[]>(
    selectedCompetencia 
      ? `/api/pagamentos/competencia/${selectedCompetencia}${selectedCentroCusto ? `?centroCustoId=${selectedCentroCusto}` : ''}`
      : ''
  );

  const { data: comparacao, refetch: refetchComparacao } = useAPI<any>(
    selectedCompetencia
      ? `/api/pagamentos/comparacao/${selectedCompetencia}${selectedCentroCusto ? `?centroCustoId=${selectedCentroCusto}` : ''}`
      : ''
  );

  // Selecionar primeira competência
  useEffect(() => {
    if (competencias?.length && !selectedCompetencia) {
      setSelectedCompetencia(competencias[0].id);
    }
  }, [competencias, selectedCompetencia]);

  const handleMarcarComoPago = async (pagamentoId: number, valorPago: number) => {
    try {
      await apiPost(`/api/pagamentos/${pagamentoId}`, {
        valor_pago: valorPago,
        data_pagamento: new Date().toISOString().split('T')[0],
        status: 'pago'
      });
      refetchPagamentos();
      refetchComparacao();
    } catch (error) {
      console.error('Erro ao marcar pagamento:', error);
      alert('Erro ao atualizar pagamento');
    }
  };

  const handleGerarPagamentos = async () => {
    if (!selectedCompetencia) return;
    
    try {
      await apiPost('/api/pagamentos/gerar-da-previsao', {
        competenciaId: selectedCompetencia,
        centroCustoId: selectedCentroCusto,
        dataVencimento: new Date().toISOString().split('T')[0]
      });
      refetchPagamentos();
      alert('Pagamentos gerados com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar pagamentos:', error);
      alert('Erro ao gerar pagamentos');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pago': return 'bg-green-100 text-green-800';
      case 'pendente': return 'bg-yellow-100 text-yellow-800';
      case 'atrasado': return 'bg-red-100 text-red-800';
      case 'cancelado': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pago': return <Check className="w-4 h-4" />;
      case 'pendente': return <Clock className="w-4 h-4" />;
      case 'atrasado': return <AlertCircle className="w-4 h-4" />;
      case 'cancelado': return <X className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  // Calcular resumos
  const totalPrevisto = pagamentos?.reduce((sum, p) => sum + p.valor_previsto, 0) || 0;
  const totalPago = pagamentos?.filter(p => p.status === 'pago').reduce((sum, p) => sum + (p.valor_pago || 0), 0) || 0;
  const totalPendente = pagamentos?.filter(p => p.status === 'pendente').reduce((sum, p) => sum + p.valor_previsto, 0) || 0;
  const totalAtrasado = pagamentos?.filter(p => p.status === 'atrasado').reduce((sum, p) => sum + p.valor_previsto, 0) || 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/60 p-8"
      >
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Gestão de Pagamentos</h1>
            <p className="text-slate-600">Controle de pagamentos efetivados e comparação projetado x executado</p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={selectedCondominio}
              onChange={(e) => setSelectedCondominio(Number(e.target.value))}
              className="px-4 py-2 border border-slate-300 rounded-lg bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-blue-500"
            >
              {condominios?.map((cond) => (
                <option key={cond.id} value={cond.id}>{cond.nome}</option>
              ))}
            </select>
            
            <select
              value={selectedCompetencia || ''}
              onChange={(e) => setSelectedCompetencia(Number(e.target.value))}
              className="px-4 py-2 border border-slate-300 rounded-lg bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecione a competência</option>
              {competencias?.map((comp) => (
                <option key={comp.id} value={comp.id}>
                  {String(comp.mes).padStart(2, '0')}/{comp.ano}
                </option>
              ))}
            </select>

            <select
              value={selectedCentroCusto || ''}
              onChange={(e) => setSelectedCentroCusto(e.target.value ? Number(e.target.value) : null)}
              className="px-4 py-2 border border-slate-300 rounded-lg bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos os centros de custo</option>
              {centrosCusto?.map((cc) => (
                <option key={cc.id} value={cc.id}>{cc.nome}</option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      {/* KPIs de Resumo */}
      {selectedCompetencia && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg"
          >
            <h3 className="text-sm font-semibold opacity-90 mb-2">Total Previsto</h3>
            <p className="text-3xl font-bold">{formatCurrency(totalPrevisto)}</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg"
          >
            <h3 className="text-sm font-semibold opacity-90 mb-2">Total Pago</h3>
            <p className="text-3xl font-bold">{formatCurrency(totalPago)}</p>
            <p className="text-sm opacity-80 mt-1">
              {totalPrevisto > 0 ? `${((totalPago / totalPrevisto) * 100).toFixed(1)}%` : '0%'}
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-6 text-white shadow-lg"
          >
            <h3 className="text-sm font-semibold opacity-90 mb-2">Pendente</h3>
            <p className="text-3xl font-bold">{formatCurrency(totalPendente)}</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white shadow-lg"
          >
            <h3 className="text-sm font-semibold opacity-90 mb-2">Atrasado</h3>
            <p className="text-3xl font-bold">{formatCurrency(totalAtrasado)}</p>
          </motion.div>
        </div>
      )}

      {/* Comparação Projetado x Executado */}
      {comparacao && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/60 p-8"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Projetado x Executado</h2>
            <div className={`px-4 py-2 rounded-lg font-bold ${
              comparacao.resumo.status === 'dentro' ? 'bg-green-100 text-green-800' :
              comparacao.resumo.status === 'acima' ? 'bg-red-100 text-red-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              {comparacao.resumo.percentual_variacao > 0 ? '+' : ''}
              {comparacao.resumo.percentual_variacao.toFixed(1)}%
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-slate-200">
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Categoria</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-700">Previsto</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-700">Executado</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-700">Diferença</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-700">Variação %</th>
                  <th className="text-center py-3 px-4 font-semibold text-slate-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {comparacao.categorias.map((cat: ComparacaoProjetadoExecutado, index: number) => (
                  <tr key={index} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4 font-medium text-slate-900">{cat.categoria}</td>
                    <td className="py-3 px-4 text-right text-slate-700">{formatCurrency(cat.total_previsto)}</td>
                    <td className="py-3 px-4 text-right text-slate-700 font-semibold">{formatCurrency(cat.total_executado)}</td>
                    <td className={`py-3 px-4 text-right font-semibold ${
                      cat.diferenca > 0 ? 'text-red-600' : cat.diferenca < 0 ? 'text-green-600' : 'text-slate-600'
                    }`}>
                      {cat.diferenca > 0 ? '+' : ''}{formatCurrency(cat.diferenca)}
                    </td>
                    <td className={`py-3 px-4 text-right font-bold ${
                      cat.percentual_variacao > 10 ? 'text-red-600' : 
                      cat.percentual_variacao < -10 ? 'text-green-600' : 
                      'text-slate-600'
                    }`}>
                      {cat.percentual_variacao > 0 ? '+' : ''}{cat.percentual_variacao.toFixed(1)}%
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        cat.status === 'dentro' ? 'bg-green-100 text-green-800' :
                        cat.status === 'acima' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {cat.status === 'dentro' ? 'No Previsto' : cat.status === 'acima' ? 'Acima' : 'Abaixo'}
                      </span>
                    </td>
                  </tr>
                ))}
                <tr className="border-t-2 border-slate-300 bg-slate-50 font-bold">
                  <td className="py-3 px-4">TOTAL GERAL</td>
                  <td className="py-3 px-4 text-right">{formatCurrency(comparacao.resumo.total_previsto)}</td>
                  <td className="py-3 px-4 text-right">{formatCurrency(comparacao.resumo.total_executado)}</td>
                  <td className={`py-3 px-4 text-right ${
                    comparacao.resumo.diferenca > 0 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {comparacao.resumo.diferenca > 0 ? '+' : ''}{formatCurrency(comparacao.resumo.diferenca)}
                  </td>
                  <td className={`py-3 px-4 text-right ${
                    comparacao.resumo.percentual_variacao > 10 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {comparacao.resumo.percentual_variacao > 0 ? '+' : ''}{comparacao.resumo.percentual_variacao.toFixed(1)}%
                  </td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Lista de Pagamentos */}
      {selectedCompetencia && pagamentos && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/60 p-8"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Lista de Pagamentos</h2>
            <button
              onClick={handleGerarPagamentos}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              <span>Gerar da Previsão</span>
            </button>
          </div>

          <div className="space-y-3">
            {pagamentos.map((pag) => (
              <div key={pag.id} className="bg-white rounded-lg p-4 border border-slate-200 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1 ${getStatusColor(pag.status)}`}>
                        {getStatusIcon(pag.status)}
                        <span>{pag.status.toUpperCase()}</span>
                      </span>
                      <span className="text-sm text-slate-600">{pag.categoria}</span>
                    </div>
                    <h3 className="font-semibold text-slate-900">{pag.descricao}</h3>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-slate-600">
                      <span>Previsto: <strong>{formatCurrency(pag.valor_previsto)}</strong></span>
                      {pag.valor_pago && (
                        <span>Pago: <strong className="text-green-600">{formatCurrency(pag.valor_pago)}</strong></span>
                      )}
                      {pag.data_vencimento && (
                        <span>Venc: {new Date(pag.data_vencimento).toLocaleDateString('pt-BR')}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {pag.status === 'pendente' && (
                      <button
                        onClick={() => handleMarcarComoPago(pag.id, pag.valor_previsto)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                      >
                        Marcar como Pago
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
