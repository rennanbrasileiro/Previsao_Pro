import { useState } from 'react';
import { X, Download, Maximize2, Minimize2, Printer, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DocumentPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  htmlContent: string;
  title: string;
  onDownload: () => void;
}

export default function DocumentPreview({
  isOpen,
  onClose,
  htmlContent,
  title,
  onDownload
}: DocumentPreviewProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  };

  const handleOpenNewTab = () => {
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(htmlContent);
      newWindow.document.close();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={`fixed z-50 bg-white rounded-2xl shadow-2xl overflow-hidden ${
              isFullscreen
                ? 'inset-2'
                : 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95vw] h-[90vh] max-w-6xl'
            }`}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 flex items-center justify-between shadow-lg">
              <div className="flex items-center space-x-3">
                <h2 className="text-lg font-bold">{title}</h2>
                <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium">
                  Preview
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleOpenNewTab}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  title="Abrir em nova aba"
                >
                  <ExternalLink className="w-5 h-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handlePrint}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  title="Imprimir"
                >
                  <Printer className="w-5 h-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  title={isFullscreen ? 'Sair da tela cheia' : 'Tela cheia'}
                >
                  {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onDownload}
                  className="px-4 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors flex items-center space-x-2 shadow-md"
                >
                  <Download className="w-4 h-4" />
                  <span>Baixar</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  title="Fechar"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>
            </div>

            {/* Content */}
            <div className="h-[calc(100%-4rem)] overflow-y-auto bg-gradient-to-br from-gray-50 to-gray-100">
              <div className="container mx-auto p-6">
                <div className="max-w-[210mm] mx-auto bg-white shadow-2xl">
                  <div 
                    dangerouslySetInnerHTML={{ __html: htmlContent }}
                    className="document-preview"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          <style>{`
            /* Estilos para o preview do documento */
            .document-preview {
              padding: 2.5cm;
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #000;
              background: white;
              min-height: 297mm; /* A4 height */
              width: 210mm; /* A4 width */
              box-sizing: border-box;
            }
            
            /* Garantir margens adequadas */
            .document-preview * {
              box-sizing: border-box;
            }
            
            /* Tabelas */
            .document-preview table {
              width: 100%;
              border-collapse: collapse;
              margin: 1.5rem 0;
              page-break-inside: avoid;
            }
            
            .document-preview th,
            .document-preview td {
              padding: 0.75rem;
              border: 1px solid #ddd;
              text-align: left;
            }
            
            .document-preview th {
              background-color: #f8f9fa;
              font-weight: 600;
              color: #1f2937;
            }
            
            .document-preview td.valor {
              text-align: right;
              font-weight: 500;
            }
            
            /* Títulos */
            .document-preview h1,
            .document-preview h2,
            .document-preview h3 {
              color: #1f2937;
              margin-bottom: 1rem;
              page-break-after: avoid;
            }
            
            .document-preview h1 {
              font-size: 1.75rem;
              font-weight: bold;
            }
            
            .document-preview h2 {
              font-size: 1.25rem;
              font-weight: bold;
            }
            
            .document-preview h3 {
              font-size: 1.1rem;
              font-weight: 600;
            }
            
            /* Parágrafos */
            .document-preview p {
              margin-bottom: 0.75rem;
            }
            
            /* Cores específicas */
            .document-preview .text-blue-600 {
              color: #2563eb;
            }
            
            .document-preview .text-green-600 {
              color: #16a34a;
            }
            
            .document-preview .text-red-600 {
              color: #dc2626;
            }
            
            /* Print styles */
            @media print {
              .document-preview {
                padding: 1.5cm;
                width: 100%;
                min-height: auto;
              }
              
              body {
                margin: 0;
                padding: 0;
              }
              
              .document-preview table {
                page-break-inside: avoid;
              }
            }
            
            /* Scrollbar customizado */
            .document-preview::-webkit-scrollbar {
              width: 8px;
            }
            
            .document-preview::-webkit-scrollbar-track {
              background: #f1f5f9;
            }
            
            .document-preview::-webkit-scrollbar-thumb {
              background: #cbd5e1;
              border-radius: 4px;
            }
            
            .document-preview::-webkit-scrollbar-thumb:hover {
              background: #94a3b8;
            }
          `}</style>
        </>
      )}
    </AnimatePresence>
  );
}
