import { useState } from 'react';
import { X, Download, Maximize2 } from 'lucide-react';
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
                ? 'inset-4'
                : 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] h-[85vh] max-w-5xl'
            }`}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <h2 className="text-lg font-bold">{title}</h2>
                <span className="px-2 py-1 bg-white/20 rounded text-xs font-medium">
                  Preview
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  title={isFullscreen ? 'Sair da tela cheia' : 'Tela cheia'}
                >
                  <Maximize2 className="w-5 h-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onDownload}
                  className="px-4 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Baixar</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>
            </div>

            {/* Content */}
            <div className="h-[calc(100%-4rem)] overflow-y-auto bg-gray-100 p-8">
              <div className="max-w-4xl mx-auto bg-white shadow-lg">
                <div 
                  dangerouslySetInnerHTML={{ __html: htmlContent }}
                  className="document-preview"
                />
              </div>
            </div>
          </motion.div>

          <style>{`
            .document-preview {
              padding: 2rem;
              font-family: Arial, sans-serif;
            }
            
            .document-preview table {
              width: 100%;
              border-collapse: collapse;
              margin: 1rem 0;
            }
            
            .document-preview th,
            .document-preview td {
              padding: 0.5rem;
              border: 1px solid #ddd;
              text-align: left;
            }
            
            .document-preview th {
              background-color: #f3f4f6;
              font-weight: 600;
            }
          `}</style>
        </>
      )}
    </AnimatePresence>
  );
}
