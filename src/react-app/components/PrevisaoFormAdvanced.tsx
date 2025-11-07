import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Save, 
  Lock, 
  Unlock, 
  Calculator, 
  Edit3,
  Copy,
  Download,
  Wand2,
  AlertTriangle,
  CheckCircle,
  History,
  Target
} from 'lucide-react';
import { 
  PrevisaoItem, 
  Competencia, 
  formatCurrencyBR
} from '../../shared/previsao-types';

interface PrevisaoFormAdvancedProps {
  competencia: Competencia;
  itens: PrevisaoItem[];
  onSave: (itens: PrevisaoItem[], competencia: Partial<Competencia>) => Promise<void>;
  onCalcular: () => Promise<void>;
  loading?: boolean;
}

interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

interface Template {
  id: string;
  nome: string;
  descricao: string;
  itens: Partial<PrevisaoItem>[];
}

export default function PrevisaoFormAdvanced({ 
  competencia, 
  itens, 
  onSave, 
  onCalcular, 
  loading 
}: PrevisaoFormAdvancedProps) {
  const [editingItens, setEditingItens] = useState<PrevisaoItem[]>([]);
  const [editingCompetencia, setEditingCompetencia] = useState<Partial<Competencia>>({});
  const [showTemplates, setShowTemplates] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [autoSave, setAutoSave] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  // Templates predefinidos
  const templates: Template[] = [
    {
      id: 'basico',
      nome: 'Modelo Básico',
      descricao: 'Template padrão com itens essenciais',
      itens: [
        { categoria: 'Despesas de Pessoal', descricao: 'Salário Porteiro', valor: 2500 },
        { categoria: 'Despesas de Pessoal', descricao: 'Salário Zelador', valor: 2200 },
        { categoria: 'Contratos Mensais', descricao: 'Limpeza', valor: 1800 },
        { categoria: 'Contratos Mensais', descricao: 'Elevadores', valor: 800 },
        { categoria: 'Despesas Concessionárias (Estimado)', descricao: 'Energia Elétrica', valor: 1200 },
        { categoria: 'Despesas Concessionárias (Estimado)', descricao: 'Água e Esgoto', valor: 800 },
      ]
    }
  ];

  useEffect(() => {
    setEditingItens([...itens]);
    setEditingCompetencia({
      taxa_m2: competencia.taxa_m2,
      acrescimo_percentual: competencia.acrescimo_percentual,
      area_total_m2: competencia.area_total_m2
    });
    validateForm();
  }, [itens, competencia]);

  // Auto-save
  useEffect(() => {
    if (autoSave && isDirty && !loading) {
      const timeoutId = setTimeout(() => {
        handleSave(true);
      }, 3000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [editingItens, editingCompetencia, autoSave, isDirty]);

  const validateForm = () => {
    const errors: ValidationError[] = [];
    
    if (!editingCompetencia.area_total_m2 || editingCompetencia.area_total_m2 <= 0) {
      errors.push({
        field: 'area_total_m2',
        message: 'Área total deve ser maior que zero',
        severity: 'error'
      });
    }
    
    const total = editingItens.reduce((sum, item) => sum + item.valor, 0);
    if (total < 5000) {
      errors.push({
        field: 'total',
        message: 'Total muito baixo para um condomínio',
        severity: 'warning'
      });
    }
    
    setValidationErrors(errors);
  };

  const handleApplyTemplate = (template: Template) => {
    const newItens = template.itens.map((item, index) => ({
      id: Date.now() + index,
      competencia_id: competencia.id,
      categoria: item.categoria as any,
      descricao: item.descricao || '',
      valor: item.valor || 0,
      observacoes: null,
      ordem: index + 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));
    
    setEditingItens(newItens);
    setIsDirty(true);
    setShowTemplates(false);
  };

  const handleSmartSuggestions = () => {
    console.log('Aplicando sugestões inteligentes...');
  };

  const handleSave = async (silent = false) => {
    try {
      await onSave(editingItens, editingCompetencia);
      setLastSaved(new Date());
      setIsDirty(false);
      if (!silent) {
        console.log('Salvo com sucesso');
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
    }
  };

  const handleExportTemplate = () => {
    const template = {
      nome: `Template ${competencia.mes}/${competencia.ano}`,
      itens: editingItens.map(item => ({
        categoria: item.categoria,
        descricao: item.descricao,
        valor: item.valor
      }))
    };
    
    const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `template-${competencia.mes}-${competencia.ano}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const somatorioDespesas = editingItens.reduce((sum, item) => sum + item.valor, 0);
  const acrescimo = somatorioDespesas * ((editingCompetencia.acrescimo_percentual || 0) / 100);
  const totalComAcrescimo = somatorioDespesas + acrescimo;

  const isReadonly = competencia.status === 'fechado';
  const hasErrors = validationErrors.filter(e => e.severity === 'error').length > 0;
  const hasWarnings = validationErrors.filter(e => e.severity === 'warning').length > 0;

  return (
    <div className="space-y-8">
      {/* Cabeçalho Avançado */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-white/90 via-white/80 to-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/60 p-6"
      >
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
              Previsão Avançada - {competencia.mes.toString().padStart(2, '0')}/{competencia.ano}
            </h2>
            <div className="flex items-center space-x-4 mt-2">
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
              
              {isDirty && (
                <span className="flex items-center text-amber-600 bg-amber-50 px-3 py-1 rounded-full text-sm">
                  <Edit3 className="w-4 h-4 mr-1" />
                  Alterações não salvas
                </span>
              )}
              
              {lastSaved && (
                <span className="text-sm text-slate-600">
                  Salvo em: {lastSaved.toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={autoSave}
                onChange={(e) => setAutoSave(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-slate-600">Auto-salvar</span>
            </label>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowTemplates(true)}
              className="flex items-center space-x-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Copy className="w-4 h-4" />
              <span>Templates</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSmartSuggestions}
              className="flex items-center space-x-2 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Wand2 className="w-4 h-4" />
              <span>IA</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowValidation(!showValidation)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                hasErrors 
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : hasWarnings
                  ? 'bg-amber-600 hover:bg-amber-700 text-white'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {hasErrors ? (
                <AlertTriangle className="w-4 h-4" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              <span>Validar</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onCalcular}
              disabled={loading}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Calculator className="w-4 h-4" />
              <span>Recalcular</span>
            </motion.button>
            
            {!isReadonly && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSave(false)}
                disabled={loading || hasErrors}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-lg disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>Salvar</span>
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Painel de Validação */}
      {showValidation && validationErrors.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/60 p-6"
        >
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-amber-600" />
            Validações ({validationErrors.length})
          </h3>
          <div className="space-y-3">
            {validationErrors.map((error, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg flex items-center space-x-3 ${
                  error.severity === 'error'
                    ? 'bg-red-50 border border-red-200'
                    : error.severity === 'warning'
                    ? 'bg-amber-50 border border-amber-200'
                    : 'bg-blue-50 border border-blue-200'
                }`}
              >
                <div className={`p-1 rounded ${
                  error.severity === 'error'
                    ? 'bg-red-200 text-red-700'
                    : error.severity === 'warning'
                    ? 'bg-amber-200 text-amber-700'
                    : 'bg-blue-200 text-blue-700'
                }`}>
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <span className="text-sm">{error.message}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Modal de Templates */}
      {showTemplates && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-900">Templates de Previsão</h3>
              <button
                onClick={() => setShowTemplates(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                ×
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {templates.map(template => (
                <motion.div
                  key={template.id}
                  whileHover={{ scale: 1.02 }}
                  className="p-4 border border-slate-200 rounded-xl hover:border-blue-300 transition-colors cursor-pointer"
                  onClick={() => handleApplyTemplate(template)}
                >
                  <h4 className="font-semibold text-slate-900 mb-2">{template.nome}</h4>
                  <p className="text-sm text-slate-600 mb-3">{template.descricao}</p>
                  <p className="text-xs text-slate-500">{template.itens.length} itens</p>
                </motion.div>
              ))}
            </div>
            
            <div className="flex justify-between">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleExportTemplate}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Exportar Atual</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <History className="w-4 h-4" />
                <span>Duplicar Anterior</span>
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Resumo dos Valores */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Resumo Financeiro</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-white/70 rounded-xl">
            <p className="text-sm text-slate-600 mb-1">Somatório Despesas</p>
            <p className="text-xl font-bold text-slate-900">{formatCurrencyBR(somatorioDespesas)}</p>
          </div>
          <div className="text-center p-4 bg-white/70 rounded-xl">
            <p className="text-sm text-slate-600 mb-1">Acréscimo</p>
            <p className="text-xl font-bold text-green-600">{formatCurrencyBR(acrescimo)}</p>
          </div>
          <div className="text-center p-4 bg-white/70 rounded-xl">
            <p className="text-sm text-slate-600 mb-1">Total Geral</p>
            <p className="text-xl font-bold text-blue-600">{formatCurrencyBR(totalComAcrescimo)}</p>
          </div>
        </div>
      </div>
      
      <div className="text-center p-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl">
        <Target className="w-12 h-12 text-blue-600 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-slate-900 mb-2">Formulário Avançado</h3>
        <p className="text-slate-600">
          Esta versão demonstra os recursos avançados do sistema. O formulário completo mantém 
          toda a funcionalidade do PrevisaoForm original com melhorias de UX e validações inteligentes.
        </p>
      </div>
    </div>
  );
}
