import { useState, useEffect } from 'react';
import { Plus, Save, Trash2, Lock, Unlock, Calculator, Eye, Edit3 } from 'lucide-react';
import { 
  PrevisaoItem, 
  Competencia, 
  CATEGORIAS_PREVISAO,
  formatCurrencyBR,
  formatNumberBR 
} from '../../shared/previsao-types';

interface PrevisaoFormProps {
  competencia: Competencia;
  itens: PrevisaoItem[];
  onSave: (itens: PrevisaoItem[], competencia: Partial<Competencia>) => Promise<void>;
  onCalcular: () => Promise<void>;
  loading?: boolean;
}

export default function PrevisaoForm({ competencia, itens, onSave, onCalcular, loading }: PrevisaoFormProps) {
  const [editingItens, setEditingItens] = useState<PrevisaoItem[]>([]);
  const [editingCompetencia, setEditingCompetencia] = useState<Partial<Competencia>>({});
  const [novoItem, setNovoItem] = useState<{
    categoria: string;
    descricao: string;
    valor: string;
    observacoes: string;
  }>({
    categoria: CATEGORIAS_PREVISAO[0],
    descricao: '',
    valor: '',
    observacoes: ''
  });
  const [modoVisualizacao, setModoVisualizacao] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(CATEGORIAS_PREVISAO));

  useEffect(() => {
    setEditingItens([...itens]);
    setEditingCompetencia({
      taxa_m2: competencia.taxa_m2,
      acrescimo_percentual: competencia.acrescimo_percentual,
      area_total_m2: competencia.area_total_m2
    });
  }, [itens, competencia]);

  const handleAddItem = () => {
    if (!novoItem.descricao || !novoItem.valor) return;

    const newItem: PrevisaoItem = {
      id: Date.now(), // ID temporário
      competencia_id: competencia.id,
      categoria: novoItem.categoria as any,
      descricao: novoItem.descricao,
      valor: parseFloat(novoItem.valor.replace(/[.,]/g, (match: string) => match === ',' ? '.' : '')),
      observacoes: novoItem.observacoes || null,
      ordem: editingItens.filter(i => i.categoria === novoItem.categoria).length + 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setEditingItens([...editingItens, newItem]);
    setNovoItem({
      categoria: novoItem.categoria,
      descricao: '',
      valor: '',
      observacoes: ''
    });
  };

  const handleUpdateItem = (index: number, field: keyof PrevisaoItem, value: any) => {
    const updated = [...editingItens];
    if (field === 'valor') {
      const numericValue = parseFloat(value.replace(/[.,]/g, (match: string) => match === ',' ? '.' : '')) || 0;
      updated[index] = { ...updated[index], [field]: numericValue };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setEditingItens(updated);
  };

  const handleDeleteItem = (index: number) => {
    const updated = editingItens.filter((_, i) => i !== index);
    setEditingItens(updated);
  };

  const handleSave = async () => {
    await onSave(editingItens, editingCompetencia);
  };

  const calcularTotaisPorCategoria = () => {
    const totais: Record<string, number> = {};
    CATEGORIAS_PREVISAO.forEach(cat => {
      totais[cat] = editingItens
        .filter(item => item.categoria === cat)
        .reduce((sum, item) => sum + item.valor, 0);
    });
    return totais;
  };

  const handleUpdateCompetencia = (field: string, value: string) => {
    const numericValue = parseFloat(value.replace(/[.,]/g, (match: string) => match === ',' ? '.' : '')) || 0;
    setEditingCompetencia({
      ...editingCompetencia,
      [field]: numericValue
    });
  };

  const toggleCategory = (categoria: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoria)) {
      newExpanded.delete(categoria);
    } else {
      newExpanded.add(categoria);
    }
    setExpandedCategories(newExpanded);
  };

  const somatorioDespesas = editingItens.reduce((sum, item) => sum + item.valor, 0);
  const acrescimo = somatorioDespesas * ((editingCompetencia.acrescimo_percentual || 0) / 100);
  const totalComAcrescimo = somatorioDespesas + acrescimo;
  const taxaCalculada = totalComAcrescimo / (editingCompetencia.area_total_m2 || 1);

  const totaisPorCategoria = calcularTotaisPorCategoria();

  const isReadonly = competencia.status === 'fechado';

  return (
    <div className="space-y-8">
      {/* Cabeçalho com informações da competência */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/60 p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Previsão de Despesas - {competencia.mes.toString().padStart(2, '0')}/{competencia.ano}
            </h2>
            <div className="flex items-center mt-2">
              {competencia.status === 'fechado' ? (
                <span className="flex items-center text-red-600 bg-red-50 px-3 py-1 rounded-full text-sm">
                  <Lock className="w-4 h-4 mr-1" />
                  Competência Fechada
                </span>
              ) : (
                <span className="flex items-center text-green-600 bg-green-50 px-3 py-1 rounded-full text-sm">
                  <Unlock className="w-4 h-4 mr-1" />
                  Rascunho
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setModoVisualizacao(!modoVisualizacao)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                modoVisualizacao 
                  ? 'bg-slate-600 text-white hover:bg-slate-700' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {modoVisualizacao ? <Edit3 className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span>{modoVisualizacao ? 'Editar' : 'Visualizar'}</span>
            </button>
            <button
              onClick={onCalcular}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Calculator className="w-4 h-4" />
              <span>Recalcular</span>
            </button>
            {!isReadonly && !modoVisualizacao && (
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-lg disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>Salvar Alterações</span>
              </button>
            )}
          </div>
        </div>

        {/* Parâmetros gerais */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-50 p-4 rounded-xl">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Área Total do Condomínio (m²)
            </label>
            <input
              type="text"
              value={formatNumberBR(editingCompetencia.area_total_m2 || 0)}
              onChange={(e) => handleUpdateCompetencia('area_total_m2', e.target.value)}
              disabled={isReadonly || modoVisualizacao}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-100 font-mono"
            />
          </div>
          <div className="bg-slate-50 p-4 rounded-xl">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Acréscimo Percentual (%)
            </label>
            <input
              type="text"
              value={formatNumberBR(editingCompetencia.acrescimo_percentual || 0)}
              onChange={(e) => handleUpdateCompetencia('acrescimo_percentual', e.target.value)}
              disabled={isReadonly || modoVisualizacao}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-100 font-mono"
            />
          </div>
          <div className="bg-blue-50 p-4 rounded-xl">
            <label className="block text-sm font-medium text-blue-700 mb-2">
              Taxa Calculada (R$/m²)
            </label>
            <input
              type="text"
              value={formatCurrencyBR(taxaCalculada)}
              disabled
              className="w-full px-3 py-2 border border-blue-300 rounded-lg bg-blue-100 text-blue-800 font-bold font-mono"
            />
          </div>
        </div>
      </div>

      {/* Resumo financeiro */}
      <div className="bg-gradient-to-r from-blue-50 via-blue-100 to-blue-50 rounded-2xl p-6 shadow-lg">
        <h3 className="text-lg font-bold text-blue-900 mb-4">Resumo Financeiro Consolidado</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-white/70 rounded-xl">
            <p className="text-sm text-blue-700 mb-1">Somatório Despesas</p>
            <p className="text-xl font-bold text-blue-900">{formatCurrencyBR(somatorioDespesas)}</p>
          </div>
          <div className="text-center p-4 bg-white/70 rounded-xl">
            <p className="text-sm text-blue-700 mb-1">Acréscimo {editingCompetencia.acrescimo_percentual}%</p>
            <p className="text-xl font-bold text-green-700">{formatCurrencyBR(acrescimo)}</p>
          </div>
          <div className="text-center p-4 bg-white/70 rounded-xl">
            <p className="text-sm text-blue-700 mb-1">Total Geral</p>
            <p className="text-xl font-bold text-purple-700">{formatCurrencyBR(totalComAcrescimo)}</p>
          </div>
          <div className="text-center p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl">
            <p className="text-sm mb-1">Taxa por m²</p>
            <p className="text-xl font-bold">R$ {formatNumberBR(taxaCalculada)}</p>
          </div>
        </div>
      </div>

      {/* Itens por categoria */}
      {CATEGORIAS_PREVISAO.map(categoria => {
        const isExpanded = expandedCategories.has(categoria);
        const itensCategoria = editingItens.filter(item => item.categoria === categoria);
        const totalCategoria = totaisPorCategoria[categoria] || 0;

        return (
          <div key={categoria} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/60 overflow-hidden">
            <div 
              className="flex justify-between items-center p-6 bg-gradient-to-r from-slate-50 to-slate-100 cursor-pointer hover:from-slate-100 hover:to-slate-200 transition-all"
              onClick={() => toggleCategory(categoria)}
            >
              <h3 className="text-lg font-bold text-slate-900">{categoria}</h3>
              <div className="flex items-center space-x-4">
                <div className="text-lg font-bold text-blue-600">
                  {formatCurrencyBR(totalCategoria)}
                </div>
                <div className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {isExpanded && (
              <div className="p-6">
                {/* Lista de itens da categoria */}
                <div className="space-y-3 mb-4">
                  {itensCategoria.map((item) => {
                    const globalIndex = editingItens.findIndex(i => i.id === item.id);
                    return (
                      <div key={item.id} className="flex items-center space-x-3 p-4 bg-slate-50/80 rounded-xl hover:bg-slate-100/80 transition-colors">
                        <div className="flex-1">
                          <input
                            type="text"
                            value={item.descricao}
                            onChange={(e) => handleUpdateItem(globalIndex, 'descricao', e.target.value)}
                            disabled={isReadonly || modoVisualizacao}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-100"
                            placeholder="Descrição do item"
                          />
                        </div>
                        <div className="w-36">
                          <input
                            type="text"
                            value={formatCurrencyBR(item.valor)}
                            onChange={(e) => handleUpdateItem(globalIndex, 'valor', e.target.value)}
                            disabled={isReadonly || modoVisualizacao}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-100 font-mono"
                            placeholder="R$ 0,00"
                          />
                        </div>
                        {!isReadonly && !modoVisualizacao && (
                          <button
                            onClick={() => handleDeleteItem(globalIndex)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Remover item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Adicionar novo item */}
                {!isReadonly && !modoVisualizacao && (
                  <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border-2 border-dashed border-blue-300">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={novoItem.categoria === categoria ? novoItem.descricao : ''}
                        onChange={(e) => setNovoItem({ ...novoItem, categoria, descricao: e.target.value })}
                        className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Nova descrição..."
                      />
                    </div>
                    <div className="w-36">
                      <input
                        type="text"
                        value={novoItem.categoria === categoria ? novoItem.valor : ''}
                        onChange={(e) => setNovoItem({ ...novoItem, categoria, valor: e.target.value })}
                        className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                        placeholder="R$ 0,00"
                      />
                    </div>
                    <button
                      onClick={handleAddItem}
                      disabled={!novoItem.descricao || !novoItem.valor || novoItem.categoria !== categoria}
                      className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Adicionar item"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Botão de ação flutuante para salvar */}
      {!isReadonly && !modoVisualizacao && (
        <div className="fixed bottom-8 right-8 z-50">
          <button
            onClick={handleSave}
            disabled={loading}
            className="bg-gradient-to-r from-green-600 to-green-700 text-white p-4 rounded-full shadow-2xl hover:from-green-700 hover:to-green-800 transition-all transform hover:scale-105 disabled:opacity-50"
            title="Salvar todas as alterações"
          >
            <Save className="w-6 h-6" />
          </button>
        </div>
      )}
    </div>
  );
}
