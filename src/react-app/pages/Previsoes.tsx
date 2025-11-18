import React, { useState, useEffect } from 'react';
import { Calendar, FileText, Download, Plus, Lock } from 'lucide-react';
import PrevisaoForm from '../components/PrevisaoForm';
import DocumentGenerator from '../components/DocumentGenerator';
import { 
  Competencia, 
  PrevisaoItem, 
  PrevisaoConsolidada,
  MESES,
  getCompetenciaText,
  formatCurrencyBR 
} from '../../shared/previsao-types';
import { useAPI, apiPost } from '../hooks/useAPI';

export default function Previsoes() {
  const [selectedCondominio, setSelectedCondominio] = useState<number>(1);
  const [selectedCompetencia, setSelectedCompetencia] = useState<number | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { data: condominios } = useAPI<any[]>('/api/condominios');
  const { data: competencias, refetch: refetchCompetencias } = useAPI<Competencia[]>(
    `/api/previsoes/competencias?condominioId=${selectedCondominio}`
  );
  
  const competencia = competencias?.find(c => c.id === selectedCompetencia);
  
  const { data: itens, refetch: refetchItens } = useAPI<PrevisaoItem[]>(
    selectedCompetencia ? `/api/previsoes/itens?competenciaId=${selectedCompetencia}` : ''
  );

  const { data: previsaoConsolidada, refetch: refetchConsolidada } = useAPI<PrevisaoConsolidada>(
    selectedCompetencia ? `/api/previsoes/consolidada?competenciaId=${selectedCompetencia}` : ''
  );

  const { data: centrosCusto } = useAPI<any[]>(
    `/api/centros-custo?condominioId=${selectedCondominio}`
  );

  // Selecionar primeira competência automaticamente
  useEffect(() => {
    if (competencias?.length && !selectedCompetencia) {
      setSelectedCompetencia(competencias[0].id);
    }
  }, [competencias, selectedCompetencia]);

  // Debug: log dos dados para verificar se estão chegando
  useEffect(() => {
    console.log('Debug - competencia:', competencia);
    console.log('Debug - itens:', itens);
    console.log('Debug - selectedCompetencia:', selectedCompetencia);
  }, [competencia, itens, selectedCompetencia]);

  const handleSaveItens = async (novosItens: PrevisaoItem[], dadosCompetencia: Partial<Competencia>) => {
    try {
      await apiPost('/api/previsoes/salvar', {
        competenciaId: selectedCompetencia,
        itens: novosItens,
        competencia: dadosCompetencia
      });
      refetchItens();
      refetchConsolidada();
      refetchCompetencias();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar previsão. Tente novamente.');
    }
  };

  const handleRecalcular = async () => {
    try {
      await apiPost('/api/previsoes/recalcular', { competenciaId: selectedCompetencia });
      refetchConsolidada();
      refetchCompetencias();
    } catch (error) {
      console.error('Erro ao recalcular:', error);
      alert('Erro ao recalcular previsão. Tente novamente.');
    }
  };

  const handleCreateCompetencia = async (mes: number, ano: number) => {
    try {
      const response = await apiPost<{ id: number }>('/api/previsoes/competencias', {
        condominioId: selectedCondominio,
        mes,
        ano
      });
      setSelectedCompetencia(response.id);
      refetchCompetencias();
      setShowCreateModal(false);
    } catch (error) {
      console.error('Erro ao criar competência:', error);
      alert('Erro ao criar competência. Tente novamente.');
    }
  };

  const handleFecharCompetencia = async () => {
    if (!confirm('Deseja fechar esta competência? Não será mais possível editá-la.')) return;
    
    try {
      await apiPost('/api/previsoes/fechar', { competenciaId: selectedCompetencia });
      refetchCompetencias();
      alert('Competência fechada com sucesso!');
    } catch (error) {
      console.error('Erro ao fechar competência:', error);
      alert('Erro ao fechar competência. Tente novamente.');
    }
  };

  const handleDownloadDocument = async (tipo: 'condominio' | 'centro_custo' | 'fatura' | 'balancete', formato: 'pdf' | 'html' = 'pdf') => {
    try {
      const params = new URLSearchParams({
        competenciaId: selectedCompetencia!.toString(),
        tipo,
        formato
      });
      
      const response = await fetch(`/api/previsoes/download?${params}`);
      
      if (!response.ok) throw new Error('Erro ao gerar documento');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      const competenciaText = competencia ? getCompetenciaText(competencia.mes, competencia.ano) : '';
      const nomeArquivo = `${tipo}-${competenciaText}.${formato}`;
      a.download = nomeArquivo;
      
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Erro ao fazer download:', error);
      alert('Erro ao gerar documento. Tente novamente.');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/60 p-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Previsões de Custos</h1>
            <p className="text-slate-600">Gestão completa de previsões mensais e balancetes</p>
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
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Nova Competência</span>
            </button>
          </div>
        </div>
      </div>

      {/* Lista de Competências */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/60 p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Competências Disponíveis</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {competencias?.map((comp) => (
            <button
              key={comp.id}
              onClick={() => setSelectedCompetencia(comp.id)}
              className={`p-4 rounded-xl border transition-all duration-200 text-left ${
                selectedCompetencia === comp.id
                  ? 'bg-blue-100 border-blue-500 shadow-lg'
                  : 'bg-white/50 border-slate-200 hover:bg-white/80'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-slate-900">{getCompetenciaText(comp.mes, comp.ano)}</h3>
                <div className="flex items-center">
                  {comp.status === 'fechado' ? (
                    <Lock className="w-4 h-4 text-red-600" />
                  ) : (
                    <Calendar className="w-4 h-4 text-green-600" />
                  )}
                </div>
              </div>
              <p className="text-sm text-slate-600">
                Status: <span className={comp.status === 'fechado' ? 'text-red-600' : 'text-green-600'}>
                  {comp.status === 'fechado' ? 'Fechado' : 'Rascunho'}
                </span>
              </p>
              {comp.taxa_m2 && (
                <p className="text-sm text-slate-600">
                  Taxa: R$ {comp.taxa_m2.toFixed(2)}/m²
                </p>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Formulário de Previsão */}
      {selectedCompetencia && (
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/60 p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">
            {competencia ? `Editando ${getCompetenciaText(competencia.mes, competencia.ano)}` : 'Carregando...'}
          </h2>
          {competencia && itens ? (
            <PrevisaoForm
              competencia={competencia}
              itens={itens}
              onSave={handleSaveItens}
              onCalcular={handleRecalcular}
            />
          ) : (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-slate-600 mt-2">Carregando dados da previsão...</p>
            </div>
          )}
        </div>
      )}

      {/* Ações e Fechamento da Competência */}
      {competencia && competencia.status === 'rascunho' && (
        <div className="bg-gradient-to-r from-red-50 to-orange-50 backdrop-blur-sm rounded-2xl shadow-lg border-2 border-red-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-red-900 mb-1">Competência em Rascunho</h3>
              <p className="text-sm text-red-700">Esta competência ainda não foi fechada. Feche para bloquear edições.</p>
            </div>
            <button
              onClick={handleFecharCompetencia}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all shadow-lg font-semibold"
            >
              <Lock className="w-5 h-5" />
              <span>Fechar Competência</span>
            </button>
          </div>
        </div>
      )}

      {/* Gerador de Documentos */}
      {selectedCompetencia && centrosCusto && (
        <DocumentGenerator 
          competenciaId={selectedCompetencia}
          centrosCusto={centrosCusto}
        />
      )}

      {/* Seção antiga removida - substituída pelo DocumentGenerator */}
      {false && competencia && previsaoConsolidada && (
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/60 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Documento A - Previsão Condomínio */}
            <div className="p-4 bg-blue-50 rounded-xl">
              <h3 className="font-bold text-blue-900 mb-2">Previsão Condomínio</h3>
              <p className="text-sm text-blue-700 mb-3">Documento completo do condomínio</p>
              <div className="space-y-2">
                <button
                  onClick={() => handleDownloadDocument('condominio', 'pdf')}
                  className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>PDF</span>
                </button>
                <button
                  onClick={() => handleDownloadDocument('condominio', 'html')}
                  className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                >
                  <FileText className="w-4 h-4" />
                  <span>HTML</span>
                </button>
              </div>
            </div>

            {/* Documento B - Centro de Custo */}
            <div className="p-4 bg-green-50 rounded-xl">
              <h3 className="font-bold text-green-900 mb-2">Centros de Custo</h3>
              <p className="text-sm text-green-700 mb-3">Previsão específica por centro</p>
              <div className="space-y-2">
                <button
                  onClick={() => handleDownloadDocument('centro_custo', 'pdf')}
                  className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>PDF</span>
                </button>
                <button
                  onClick={() => handleDownloadDocument('centro_custo', 'html')}
                  className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                >
                  <FileText className="w-4 h-4" />
                  <span>HTML</span>
                </button>
              </div>
            </div>

            {/* Documento C - Fatura */}
            <div className="p-4 bg-purple-50 rounded-xl">
              <h3 className="font-bold text-purple-900 mb-2">Solicitação Fatura</h3>
              <p className="text-sm text-purple-700 mb-3">Demonstrativo de faturamento</p>
              <div className="space-y-2">
                <button
                  onClick={() => handleDownloadDocument('fatura', 'pdf')}
                  className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>PDF</span>
                </button>
                <button
                  onClick={() => handleDownloadDocument('fatura', 'html')}
                  className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm"
                >
                  <FileText className="w-4 h-4" />
                  <span>HTML</span>
                </button>
              </div>
            </div>

            {/* Balancete Consolidado */}
            <div className="p-4 bg-orange-50 rounded-xl">
              <h3 className="font-bold text-orange-900 mb-2">Balancete Consolidado</h3>
              <p className="text-sm text-orange-700 mb-3">Relatório final consolidado</p>
              <div className="space-y-2">
                <button
                  onClick={() => handleDownloadDocument('balancete', 'pdf')}
                  className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>PDF</span>
                </button>
                <button
                  onClick={() => handleDownloadDocument('balancete', 'html')}
                  className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm"
                >
                  <FileText className="w-4 h-4" />
                  <span>HTML</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview dos Totais */}
      {previsaoConsolidada && (
        <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Resumo Consolidado</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-sm text-slate-600">Somatório Despesas</p>
              <p className="text-xl font-bold text-slate-900">{formatCurrencyBR(previsaoConsolidada.somatorioDespesas)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-slate-600">Acréscimo</p>
              <p className="text-xl font-bold text-slate-900">{formatCurrencyBR(previsaoConsolidada.acrescimo)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-slate-600">Taxa Geral</p>
              <p className="text-xl font-bold text-slate-900">{formatCurrencyBR(previsaoConsolidada.somatarioTaxaGeral)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-slate-600">Taxa por m²</p>
              <p className="text-xl font-bold text-blue-600">R$ {previsaoConsolidada.taxaGeral.toFixed(2)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Modal para criar nova competência */}
      {showCreateModal && (
        <CreateCompetenciaModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateCompetencia}
        />
      )}
    </div>
  );
}

// Modal para criar nova competência
function CreateCompetenciaModal({ 
  onClose, 
  onCreate 
}: { 
  onClose: () => void; 
  onCreate: (mes: number, ano: number) => Promise<void>; 
}) {
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [ano, setAno] = useState(new Date().getFullYear());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onCreate(mes, ano);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Nova Competência</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Mês</label>
            <select
              value={mes}
              onChange={(e) => setMes(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {MESES.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Ano</label>
            <input
              type="number"
              value={ano}
              onChange={(e) => setAno(Number(e.target.value))}
              min="2024"
              max="2030"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Criar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
