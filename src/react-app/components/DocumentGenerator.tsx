import { useState } from 'react';
import { FileText, Download, Printer, ExternalLink, Eye, FileType, Building2, Receipt } from 'lucide-react';
import { motion } from 'framer-motion';
import DocumentPreview from './DocumentPreview';

interface CentroCusto {
  id: number;
  nome: string;
  area_m2: number;
}

interface DocumentGeneratorProps {
  competenciaId: number;
  centrosCusto: CentroCusto[];
}

type DocumentType = 'condominio' | 'centro_custo' | 'fatura' | 'balancete';
type DocumentFormat = 'html' | 'pdf';

export default function DocumentGenerator({ competenciaId, centrosCusto }: DocumentGeneratorProps) {
  const [selectedType, setSelectedType] = useState<DocumentType>('condominio');
  const [selectedFormat, setSelectedFormat] = useState<DocumentFormat>('html');
  const [selectedCentro, setSelectedCentro] = useState<number | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewContent, setPreviewContent] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const documentTypes = [
    {
      type: 'condominio' as DocumentType,
      label: 'Previsão Condomínio',
      icon: Building2,
      description: 'Previsão completa do condomínio com todas as despesas',
      color: 'from-blue-500 to-blue-600'
    },
    {
      type: 'centro_custo' as DocumentType,
      label: 'Previsão Centro de Custo',
      icon: FileType,
      description: 'Previsão específica por centro de custo',
      color: 'from-purple-500 to-purple-600',
      requiresCentro: true
    },
    {
      type: 'fatura' as DocumentType,
      label: 'Fatura de Condomínio',
      icon: Receipt,
      description: 'Fatura para cobrança do centro de custo',
      color: 'from-green-500 to-green-600',
      requiresCentro: true
    },
    {
      type: 'balancete' as DocumentType,
      label: 'Balancete Consolidado',
      icon: FileText,
      description: 'Balancete mensal consolidado',
      color: 'from-orange-500 to-orange-600'
    }
  ];

  const handleGenerateDocument = async (action: 'preview' | 'download' | 'print' | 'newtab') => {
    setIsGenerating(true);
    
    try {
      let url = '';
      
      if (selectedType === 'condominio') {
        url = `/api/previsoes/download?competenciaId=${competenciaId}&tipo=condominio&formato=${selectedFormat}`;
      } else if (selectedType === 'centro_custo' && selectedCentro) {
        url = `/api/previsoes/download?competenciaId=${competenciaId}&tipo=centro_custo&centroCustoId=${selectedCentro}&formato=${selectedFormat}`;
      } else if (selectedType === 'fatura' && selectedCentro) {
        url = `/api/previsoes/download?competenciaId=${competenciaId}&tipo=fatura&centroCustoId=${selectedCentro}&formato=${selectedFormat}`;
      } else if (selectedType === 'balancete') {
        url = `/api/previsoes/download?competenciaId=${competenciaId}&tipo=balancete&formato=${selectedFormat}`;
      }

      if (!url) {
        alert('Selecione um centro de custo para este tipo de documento');
        setIsGenerating(false);
        return;
      }

      if (action === 'preview') {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Erro ao carregar pré-visualização');
        const html = await response.text();
        setPreviewContent(html);
        setPreviewTitle(documentTypes.find(d => d.type === selectedType)?.label || 'Documento');
        setShowPreview(true);
      } else if (action === 'newtab') {
        window.open(url, '_blank');
      } else if (action === 'print') {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Erro ao carregar documento para impressão');
        const html = await response.text();
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(html);
          printWindow.document.close();
          printWindow.onload = () => {
            printWindow.print();
          };
        }
      } else if (action === 'download') {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Erro ao baixar documento');
        const blob = await response.blob();
        const downloadUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `${selectedType}_${competenciaId}.${selectedFormat}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(downloadUrl);
      }
    } catch (error) {
      console.error('Erro ao gerar documento:', error);
      alert('Erro ao gerar documento. Tente novamente.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleToggleCentro = (centroId: number) => {
    setSelectedCentro((prev) => (prev === centroId ? null : centroId));
  };

  const currentDocType = documentTypes.find(d => d.type === selectedType);
  const requiresCentro = currentDocType?.requiresCentro;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/60 p-8"
      >
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Gerador de Documentos</h2>
            <p className="text-sm text-slate-600">Gere e visualize documentos profissionais</p>
          </div>
        </div>

        {/* Seleção do Tipo de Documento */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-slate-700 mb-3">
            Tipo de Documento
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {documentTypes.map((docType) => {
              const Icon = docType.icon;
              const isSelected = selectedType === docType.type;
              
              return (
                <motion.button
                  key={docType.type}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setSelectedType(docType.type);
                    setSelectedCentro(null);
                  }}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                  }`}
                >
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${docType.color} w-fit mb-3`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-1">{docType.label}</h3>
                  <p className="text-xs text-slate-600">{docType.description}</p>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Seleção de Centro de Custo */}
        {requiresCentro && centrosCusto.length > 0 && (
          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              Selecione o Centro de Custo
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {centrosCusto.map((centro) => {
                const isSelected = selectedCentro === centro.id;
                
                return (
                  <motion.button
                    key={centro.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleToggleCentro(centro.id)}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      isSelected
                        ? 'border-green-500 bg-green-50 shadow-md'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-slate-900">{centro.nome}</h4>
                        <p className="text-sm text-slate-600">{centro.area_m2.toLocaleString('pt-BR')} m²</p>
                      </div>
                      {isSelected && (
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <Eye className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        )}

        {requiresCentro && centrosCusto.length === 0 && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
            Nenhum centro de custo ativo encontrado para esta competência. Cadastre um centro de custo para gerar este tipo de documento.
          </div>
        )}

        {/* Seleção do Formato */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-slate-700 mb-3">
            Formato
          </label>
          <div className="flex space-x-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedFormat('html')}
              className={`flex-1 px-6 py-3 rounded-xl border-2 font-semibold transition-all ${
                selectedFormat === 'html'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
              }`}
            >
              HTML
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedFormat('pdf')}
              className={`flex-1 px-6 py-3 rounded-xl border-2 font-semibold transition-all ${
                selectedFormat === 'pdf'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
              }`}
            >
              PDF
            </motion.button>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleGenerateDocument('preview')}
            disabled={isGenerating || (requiresCentro && !selectedCentro)}
            className="flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Eye className="w-5 h-5" />
            <span>Visualizar</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleGenerateDocument('newtab')}
            disabled={isGenerating || (requiresCentro && !selectedCentro)}
            className="flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <ExternalLink className="w-5 h-5" />
            <span>Nova Aba</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleGenerateDocument('print')}
            disabled={isGenerating || (requiresCentro && !selectedCentro)}
            className="flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Printer className="w-5 h-5" />
            <span>Imprimir</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleGenerateDocument('download')}
            disabled={isGenerating || (requiresCentro && !selectedCentro)}
            className="flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Download className="w-5 h-5" />
            <span>Download</span>
          </motion.button>
        </div>

        {/* Informações adicionais */}
        {requiresCentro && !selectedCentro && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
            <p className="text-sm text-yellow-800">
              ⚠️ Selecione um centro de custo para gerar este tipo de documento.
            </p>
          </div>
        )}
      </motion.div>

      {/* Preview Modal */}
      <DocumentPreview
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        htmlContent={previewContent}
        title={previewTitle}
        onDownload={() => handleGenerateDocument('download')}
      />
    </>
  );
}
