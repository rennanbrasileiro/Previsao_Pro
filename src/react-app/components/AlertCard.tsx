import { motion } from 'framer-motion';
import { AlertCircle, AlertTriangle, Info, CheckCircle, X } from 'lucide-react';

interface AlertCardProps {
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  onDismiss?: () => void;
  showIcon?: boolean;
}

export default function AlertCard({
  type,
  title,
  message,
  action,
  onDismiss,
  showIcon = true
}: AlertCardProps) {
  const getStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-50 border-green-200',
          icon: <CheckCircle className="w-5 h-5 text-green-600" />,
          titleColor: 'text-green-900',
          messageColor: 'text-green-700',
          buttonBg: 'bg-green-600 hover:bg-green-700'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50 border-yellow-200',
          icon: <AlertTriangle className="w-5 h-5 text-yellow-600" />,
          titleColor: 'text-yellow-900',
          messageColor: 'text-yellow-700',
          buttonBg: 'bg-yellow-600 hover:bg-yellow-700'
        };
      case 'error':
        return {
          bg: 'bg-red-50 border-red-200',
          icon: <AlertCircle className="w-5 h-5 text-red-600" />,
          titleColor: 'text-red-900',
          messageColor: 'text-red-700',
          buttonBg: 'bg-red-600 hover:bg-red-700'
        };
      case 'info':
      default:
        return {
          bg: 'bg-blue-50 border-blue-200',
          icon: <Info className="w-5 h-5 text-blue-600" />,
          titleColor: 'text-blue-900',
          messageColor: 'text-blue-700',
          buttonBg: 'bg-blue-600 hover:bg-blue-700'
        };
    }
  };

  const styles = getStyles();

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={`${styles.bg} border rounded-xl p-4 shadow-md`}
    >
      <div className="flex items-start space-x-3">
        {showIcon && (
          <div className="flex-shrink-0 mt-0.5">
            {styles.icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className={`text-sm font-semibold ${styles.titleColor} mb-1`}>
            {title}
          </h3>
          <p className={`text-sm ${styles.messageColor}`}>
            {message}
          </p>
          {action && (
            <button
              onClick={action.onClick}
              className={`mt-3 px-4 py-2 ${styles.buttonBg} text-white text-sm font-medium rounded-lg transition-colors`}
            >
              {action.label}
            </button>
          )}
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </motion.div>
  );
}
