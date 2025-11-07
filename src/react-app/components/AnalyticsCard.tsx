import { motion } from 'framer-motion';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface AnalyticsCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  gradient: string;
  description?: string;
  trend?: number[];
  isLoading?: boolean;
}

export default function AnalyticsCard({ 
  title, 
  value, 
  change, 
  changeType = 'neutral', 
  icon: Icon, 
  gradient,
  description,
  trend,
  isLoading 
}: AnalyticsCardProps) {
  const getTrendIcon = () => {
    switch (changeType) {
      case 'positive': return TrendingUp;
      case 'negative': return TrendingDown;
      default: return Minus;
    }
  };

  const TrendIcon = getTrendIcon();

  const getChangeColor = () => {
    switch (changeType) {
      case 'positive': return 'text-green-600';
      case 'negative': return 'text-red-600';
      default: return 'text-slate-600';
    }
  };

  const getMiniChart = () => {
    if (!trend || trend.length === 0) return null;
    
    const max = Math.max(...trend);
    const min = Math.min(...trend);
    const range = max - min || 1;
    
    return (
      <svg className="w-full h-8 mt-2" viewBox={`0 0 ${trend.length * 10} 40`}>
        <path
          d={trend.map((value, index) => {
            const x = index * 10;
            const y = 40 - ((value - min) / range) * 30;
            return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
          }).join(' ')}
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          className="text-white/70"
        />
      </svg>
    );
  };

  if (isLoading) {
    return (
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-white/40 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-slate-200 rounded w-1/2 mb-2"></div>
          <div className="h-8 bg-slate-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-slate-200 rounded w-1/3"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className="relative overflow-hidden"
    >
      <div className={`${gradient} rounded-2xl shadow-xl border border-white/20 p-6 text-white relative overflow-hidden`}>
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white transform translate-x-8 -translate-y-8"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white transform -translate-x-4 translate-y-4"></div>
        </div>
        
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <Icon className="w-6 h-6" />
            </div>
            {change && (
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
                className={`flex items-center space-x-1 px-2 py-1 rounded-full bg-white/20 backdrop-blur-sm text-sm ${getChangeColor()}`}
              >
                <TrendIcon className="w-3 h-3" />
                <span>{change}</span>
              </motion.div>
            )}
          </div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="text-sm font-medium text-white/90 mb-1">{title}</h3>
            <div className="text-2xl font-bold mb-1">{value}</div>
            {description && (
              <p className="text-xs text-white/80">{description}</p>
            )}
          </motion.div>
          
          {trend && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-3"
            >
              {getMiniChart()}
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
