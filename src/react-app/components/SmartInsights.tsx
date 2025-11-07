import { motion } from 'framer-motion';
import { 
  Lightbulb, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  DollarSign,
  Zap
} from 'lucide-react';
import { formatCurrency } from '../hooks/useAPI';

interface Insight {
  id: string;
  type: 'success' | 'warning' | 'info' | 'tip';
  title: string;
  description: string;
  value?: number;
  action?: string;
  priority: 'high' | 'medium' | 'low';
}

interface SmartInsightsProps {
  insights: Insight[];
  isLoading?: boolean;
}

export default function SmartInsights({ insights, isLoading }: SmartInsightsProps) {
  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'success': return CheckCircle;
      case 'warning': return AlertTriangle;
      case 'info': return Info;
      case 'tip': return Lightbulb;
      default: return Info;
    }
  };

  const getInsightColors = (type: string) => {
    switch (type) {
      case 'success': return {
        bg: 'bg-green-50',
        border: 'border-green-200',
        icon: 'text-green-600',
        title: 'text-green-900',
        text: 'text-green-800'
      };
      case 'warning': return {
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        icon: 'text-amber-600',
        title: 'text-amber-900',
        text: 'text-amber-800'
      };
      case 'info': return {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        icon: 'text-blue-600',
        title: 'text-blue-900',
        text: 'text-blue-800'
      };
      case 'tip': return {
        bg: 'bg-purple-50',
        border: 'border-purple-200',
        icon: 'text-purple-600',
        title: 'text-purple-900',
        text: 'text-purple-800'
      };
      default: return {
        bg: 'bg-slate-50',
        border: 'border-slate-200',
        icon: 'text-slate-600',
        title: 'text-slate-900',
        text: 'text-slate-800'
      };
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high': return { text: 'Alta', color: 'bg-red-100 text-red-800' };
      case 'medium': return { text: 'Média', color: 'bg-yellow-100 text-yellow-800' };
      case 'low': return { text: 'Baixa', color: 'bg-green-100 text-green-800' };
      default: return { text: 'Normal', color: 'bg-slate-100 text-slate-800' };
    }
  };

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/60 p-6"
      >
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Insights Inteligentes</h2>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse p-4 bg-slate-50 rounded-xl">
              <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-slate-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </motion.div>
    );
  }

  // Ordenar insights por prioridade
  const sortedInsights = [...insights].sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/60 p-6"
    >
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-3 bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl">
          <Zap className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Insights Inteligentes</h2>
          <p className="text-sm text-slate-600">Análises automáticas dos seus dados</p>
        </div>
      </div>

      {sortedInsights.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-600">Tudo parece estar funcionando bem!</p>
          <p className="text-sm text-slate-500 mt-1">Não há insights importantes no momento.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedInsights.map((insight, index) => {
            const Icon = getInsightIcon(insight.type);
            const colors = getInsightColors(insight.type);
            const priority = getPriorityBadge(insight.priority);

            return (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ scale: 1.02 }}
                className={`p-4 rounded-xl border ${colors.bg} ${colors.border} transition-transform cursor-pointer`}
              >
                <div className="flex items-start space-x-4">
                  <div className={`p-2 bg-white rounded-lg ${colors.icon}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className={`font-semibold ${colors.title}`}>{insight.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${priority.color}`}>
                        {priority.text}
                      </span>
                    </div>
                    
                    <p className={`text-sm ${colors.text} mb-3`}>
                      {insight.description}
                    </p>
                    
                    {insight.value && (
                      <div className="flex items-center space-x-2 mb-3">
                        <DollarSign className={`w-4 h-4 ${colors.icon}`} />
                        <span className={`font-bold ${colors.title}`}>
                          {formatCurrency(insight.value)}
                        </span>
                      </div>
                    )}
                    
                    {insight.action && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`text-sm font-medium px-4 py-2 rounded-lg bg-white ${colors.icon} hover:bg-opacity-80 transition-colors`}
                      >
                        {insight.action}
                      </motion.button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Summary */}
      {sortedInsights.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 p-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl"
        >
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-slate-900">Resumo</h4>
              <p className="text-sm text-slate-600">
                {sortedInsights.length} insight{sortedInsights.length !== 1 ? 's' : ''} encontrado{sortedInsights.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex space-x-2">
              {['high', 'medium', 'low'].map(priority => {
                const count = sortedInsights.filter(i => i.priority === priority).length;
                if (count === 0) return null;
                
                const badge = getPriorityBadge(priority);
                return (
                  <span key={priority} className={`px-2 py-1 rounded-full text-xs ${badge.color}`}>
                    {count} {badge.text.toLowerCase()}
                  </span>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
