import { Check, Clock, X, AlertCircle, Lock, Unlock } from 'lucide-react';

interface StatusBadgeProps {
  status: 'pago' | 'pendente' | 'atrasado' | 'cancelado' | 'fechado' | 'rascunho' | 'aprovado' | 'rejeitado';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export default function StatusBadge({ status, size = 'md', showIcon = true }: StatusBadgeProps) {
  const getConfig = () => {
    switch (status) {
      case 'pago':
      case 'aprovado':
        return {
          bg: 'bg-green-100',
          text: 'text-green-800',
          border: 'border-green-200',
          icon: <Check className="w-3.5 h-3.5" />,
          label: status === 'pago' ? 'Pago' : 'Aprovado'
        };
      case 'pendente':
      case 'rascunho':
        return {
          bg: 'bg-yellow-100',
          text: 'text-yellow-800',
          border: 'border-yellow-200',
          icon: <Clock className="w-3.5 h-3.5" />,
          label: status === 'pendente' ? 'Pendente' : 'Rascunho'
        };
      case 'atrasado':
        return {
          bg: 'bg-red-100',
          text: 'text-red-800',
          border: 'border-red-200',
          icon: <AlertCircle className="w-3.5 h-3.5" />,
          label: 'Atrasado'
        };
      case 'cancelado':
      case 'rejeitado':
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-800',
          border: 'border-gray-200',
          icon: <X className="w-3.5 h-3.5" />,
          label: status === 'cancelado' ? 'Cancelado' : 'Rejeitado'
        };
      case 'fechado':
        return {
          bg: 'bg-blue-100',
          text: 'text-blue-800',
          border: 'border-blue-200',
          icon: <Lock className="w-3.5 h-3.5" />,
          label: 'Fechado'
        };
      default:
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-800',
          border: 'border-gray-200',
          icon: <Unlock className="w-3.5 h-3.5" />,
          label: 'Desconhecido'
        };
    }
  };

  const config = getConfig();
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm'
  };

  return (
    <span
      className={`inline-flex items-center space-x-1 ${sizeClasses[size]} font-semibold rounded-full border ${config.bg} ${config.text} ${config.border}`}
    >
      {showIcon && config.icon}
      <span>{config.label}</span>
    </span>
  );
}
