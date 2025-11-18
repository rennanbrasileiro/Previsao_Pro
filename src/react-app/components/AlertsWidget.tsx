import { useState, useEffect } from 'react';
import { Bell, X, Check, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAPI, apiPost } from '../hooks/useAPI';
import AlertCard from './AlertCard';

interface Alert {
  id: number;
  competencia_id: number;
  tipo: string;
  severidade: string;
  titulo: string;
  descricao: string;
  valor_relacionado: number | null;
  lido: boolean;
  created_at: string;
}

interface AlertsWidgetProps {
  competenciaId: number | null;
}

export default function AlertsWidget({ competenciaId }: AlertsWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dismissedAlerts, setDismissedAlerts] = useState<number[]>([]);

  const { data: alertas, refetch } = useAPI<Alert[]>(
    competenciaId ? `/api/alertas/${competenciaId}?lido=false` : ''
  );

  const alertasVisiveis = alertas?.filter(a => !dismissedAlerts.includes(a.id)) || [];
  const alertasNaoLidos = alertasVisiveis.length;

  const handleDismiss = async (id: number) => {
    try {
      await apiPost(`/api/alertas/${id}/marcar-lido`, {});
      setDismissedAlerts([...dismissedAlerts, id]);
      refetch();
    } catch (error) {
      console.error('Erro ao marcar alerta como lido:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!competenciaId) return;
    try {
      await apiPost(`/api/alertas/marcar-todos-lidos/${competenciaId}`, {});
      setDismissedAlerts([]);
      refetch();
    } catch (error) {
      console.error('Erro ao marcar todos como lidos:', error);
    }
  };

  const getAlertType = (severidade: string): 'success' | 'warning' | 'error' | 'info' => {
    switch (severidade) {
      case 'critica':
        return 'error';
      case 'alta':
        return 'error';
      case 'media':
        return 'warning';
      case 'baixa':
        return 'info';
      default:
        return 'info';
    }
  };

  if (!competenciaId) return null;

  return (
    <div className="relative">
      {/* Botão de Notificação */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-all border border-slate-200"
      >
        <Bell className="w-5 h-5 text-slate-700" />
        {alertasNaoLidos > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
          >
            {alertasNaoLidos > 9 ? '9+' : alertasNaoLidos}
          </motion.span>
        )}
      </motion.button>

      {/* Painel de Alertas */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/20 z-40"
            />

            {/* Painel */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute right-0 top-12 w-96 max-h-[600px] bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="p-4 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-purple-50">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5 text-blue-600" />
                    <span>Alertas</span>
                  </h3>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 hover:bg-white/50 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4 text-slate-600" />
                  </button>
                </div>
                {alertasNaoLidos > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1"
                  >
                    <Check className="w-3 h-3" />
                    <span>Marcar todos como lidos</span>
                  </button>
                )}
              </div>

              {/* Lista de Alertas */}
              <div className="overflow-y-auto max-h-[500px]">
                {alertasVisiveis.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Check className="w-8 h-8 text-green-600" />
                    </div>
                    <p className="text-slate-600 font-medium">Tudo certo!</p>
                    <p className="text-sm text-slate-500 mt-1">Não há alertas no momento</p>
                  </div>
                ) : (
                  <div className="p-3 space-y-3">
                    {alertasVisiveis.map((alerta) => (
                      <AlertCard
                        key={alerta.id}
                        type={getAlertType(alerta.severidade)}
                        title={alerta.titulo}
                        message={alerta.descricao}
                        onDismiss={() => handleDismiss(alerta.id)}
                        showIcon={true}
                      />
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
