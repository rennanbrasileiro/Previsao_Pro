import { motion } from 'framer-motion';
import { Calculator, TrendingUp, AlertCircle } from 'lucide-react';
import { formatCurrencyBR, formatNumberBR } from '../../shared/previsao-types';

interface RealtimeCalculatorProps {
  somatorioDespesas: number;
  acrescimoPercentual: number;
  areaTotal: number;
}

export default function RealtimeCalculator({
  somatorioDespesas,
  acrescimoPercentual,
  areaTotal
}: RealtimeCalculatorProps) {
  const acrescimo = somatorioDespesas * (acrescimoPercentual / 100);
  const totalComAcrescimo = somatorioDespesas + acrescimo;
  const taxaPorM2 = areaTotal > 0 ? totalComAcrescimo / areaTotal : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-2xl p-6 shadow-lg border-2 border-blue-200"
    >
      <div className="flex items-center space-x-2 mb-4">
        <div className="p-2 bg-blue-600 rounded-lg">
          <Calculator className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">Calculadora em Tempo Real</h3>
      </div>

      <div className="space-y-4">
        {/* Somatório de Despesas */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-blue-100"
        >
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-slate-600">Somatório de Despesas</span>
            <span className="text-xl font-bold text-slate-900">{formatCurrencyBR(somatorioDespesas)}</span>
          </div>
        </motion.div>

        {/* Acréscimo */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-purple-100"
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-slate-600">
              Acréscimo {formatNumberBR(acrescimoPercentual)}%
            </span>
            <span className="text-xl font-bold text-purple-600">{formatCurrencyBR(acrescimo)}</span>
          </div>
          <div className="w-full bg-purple-100 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(acrescimoPercentual, 100)}%` }}
              transition={{ duration: 0.5 }}
              className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full"
            />
          </div>
        </motion.div>

        {/* Total com Acréscimo */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-4 shadow-md"
        >
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-white/90">Total Geral</span>
            <span className="text-2xl font-bold text-white">{formatCurrencyBR(totalComAcrescimo)}</span>
          </div>
        </motion.div>

        {/* Área Total e Taxa */}
        <div className="grid grid-cols-2 gap-3">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-green-100"
          >
            <div className="text-xs text-slate-500 mb-1">Área Total</div>
            <div className="text-lg font-bold text-slate-900">{formatNumberBR(areaTotal)} m²</div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-200"
          >
            <div className="text-xs text-green-600 font-semibold mb-1 flex items-center space-x-1">
              <TrendingUp className="w-3 h-3" />
              <span>Taxa por m²</span>
            </div>
            <div className="text-lg font-bold text-green-700">R$ {formatNumberBR(taxaPorM2)}</div>
          </motion.div>
        </div>

        {/* Alertas */}
        {taxaPorM2 > 20 && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start space-x-2"
          >
            <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-yellow-800">
              <strong>Atenção:</strong> Taxa acima de R$ 20,00/m². Revise as despesas.
            </div>
          </motion.div>
        )}

        {somatorioDespesas > 100000 && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start space-x-2"
          >
            <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-blue-800">
              <strong>Info:</strong> Despesas ultrapassam R$ 100.000. Considere otimizações.
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
