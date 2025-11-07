import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Calendar, Calculator } from 'lucide-react';
import { formatCurrency } from '../hooks/useAPI';

interface TrendData {
  period: string;
  value: number;
  change?: number;
  changePercent?: number;
}

interface TrendAnalysisProps {
  title: string;
  data: TrendData[];
  threshold?: number;
  target?: number;
  isLoading?: boolean;
}

export default function TrendAnalysis({ title, data, threshold, target, isLoading }: TrendAnalysisProps) {
  if (isLoading) {
    return (
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/60 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-slate-200 rounded w-1/2 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 bg-slate-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const latest = data[data.length - 1];
  const previous = data[data.length - 2];
  const trendPercent = latest && previous ? ((latest.value - previous.value) / previous.value) * 100 : 0;

  const getTrendStatus = () => {
    if (Math.abs(trendPercent) < 2) return 'stable';
    return trendPercent > 0 ? 'up' : 'down';
  };

  const getTrendColor = () => {
    const status = getTrendStatus();
    switch (status) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-slate-600';
    }
  };

  const getTrendIcon = () => {
    const status = getTrendStatus();
    switch (status) {
      case 'up': return TrendingUp;
      case 'down': return TrendingDown;
      default: return CheckCircle;
    }
  };

  const TrendIcon = getTrendIcon();

  const getAlert = () => {
    if (!threshold) return null;
    
    if (latest && latest.value > threshold) {
      return {
        type: 'warning',
        message: `Valor acima do limite de ${formatCurrency(threshold)}`,
        icon: AlertTriangle,
        color: 'text-amber-600 bg-amber-50'
      };
    }
    
    if (target && latest && latest.value < target) {
      return {
        type: 'info',
        message: `Abaixo da meta de ${formatCurrency(target)}`,
        icon: Calculator,
        color: 'text-blue-600 bg-blue-50'
      };
    }
    
    return null;
  };

  const alert = getAlert();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/60 p-6"
    >
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-slate-900">{title}</h3>
        {latest && (
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full bg-white/60 ${getTrendColor()}`}>
            <TrendIcon className="w-4 h-4" />
            <span className="text-sm font-medium">
              {trendPercent > 0 ? '+' : ''}{trendPercent.toFixed(1)}%
            </span>
          </div>
        )}
      </div>

      {/* Alert */}
      {alert && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`flex items-center space-x-3 p-4 rounded-xl mb-6 ${alert.color}`}
        >
          <alert.icon className="w-5 h-5" />
          <span className="text-sm font-medium">{alert.message}</span>
        </motion.div>
      )}

      {/* Current Value */}
      {latest && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-6"
        >
          <div className="text-3xl font-bold text-slate-900 mb-1">
            {formatCurrency(latest.value)}
          </div>
          <div className="text-sm text-slate-600 flex items-center justify-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span>{latest.period}</span>
          </div>
        </motion.div>
      )}

      {/* Trend List */}
      <div className="space-y-3">
        {data.slice(-6).reverse().map((item, index) => {
          const isLatest = index === 0;
          const change = item.change || 0;
          const changePercent = item.changePercent || 0;
          
          return (
            <motion.div
              key={item.period}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
              className={`flex justify-between items-center p-3 rounded-xl transition-colors ${
                isLatest 
                  ? 'bg-blue-50 border border-blue-200' 
                  : 'bg-slate-50 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 rounded-full ${
                  isLatest ? 'bg-blue-600' : 'bg-slate-400'
                }`}></div>
                <span className={`text-sm ${
                  isLatest ? 'font-semibold text-blue-900' : 'text-slate-700'
                }`}>
                  {item.period}
                </span>
              </div>
              
              <div className="text-right">
                <div className={`text-sm font-medium ${
                  isLatest ? 'text-blue-900' : 'text-slate-900'
                }`}>
                  {formatCurrency(item.value)}
                </div>
                {change !== 0 && (
                  <div className={`text-xs flex items-center justify-end space-x-1 ${
                    change > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {change > 0 ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    <span>
                      {change > 0 ? '+' : ''}{formatCurrency(change)} ({changePercent > 0 ? '+' : ''}{changePercent.toFixed(1)}%)
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Target Progress */}
      {target && latest && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl"
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-slate-600">Meta</span>
            <span className="text-sm font-medium text-slate-900">{formatCurrency(target)}</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((latest.value / target) * 100, 100)}%` }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
            ></motion.div>
          </div>
          <div className="text-xs text-slate-600 mt-1">
            {((latest.value / target) * 100).toFixed(1)}% da meta alcançada
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
