import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Building2, 
  Calculator, 
  DollarSign, 
  FileText, 
  Users,
  Target,
  Calendar,
  Download,
  RefreshCw
} from 'lucide-react';
import AnalyticsCard from '../components/AnalyticsCard';
import AdvancedChart from '../components/AdvancedChart';
import TrendAnalysis from '../components/TrendAnalysis';
import SmartInsights from '../components/SmartInsights';
import { useAPI, formatCurrency, formatNumber } from '../hooks/useAPI';
import { Condominio } from '../../shared/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Dashboard() {
  const [selectedCondominio, setSelectedCondominio] = useState<number>(1);
  const [timeRange, setTimeRange] = useState<'3m' | '6m' | '12m' | 'ytd'>('6m');
  const [chartType, setChartType] = useState<'line' | 'area' | 'bar'>('area');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: condominios } = useAPI<Condominio[]>('/api/condominios');
  const { data: competencias } = useAPI<any[]>(`/api/previsoes/competencias?condominioId=${selectedCondominio}`);
  const { refetch: refetchDashboard } = useAPI<any>(`/api/dashboard/analytics?condominioId=${selectedCondominio}&range=${timeRange}`);

  const condominio = condominios?.find(c => c.id === selectedCondominio);

  // Dados simulados para demonstração (em produção, viriam da API)
  const monthlyData = [
    { name: 'Jan', value: 45000, previous: 42000 },
    { name: 'Fev', value: 48000, previous: 45000 },
    { name: 'Mar', value: 52000, previous: 49000 },
    { name: 'Abr', value: 49000, previous: 52000 },
    { name: 'Mai', value: 55000, previous: 48000 },
    { name: 'Jun', value: 58000, previous: 55000 },
  ];

  const categoryData = [
    { name: 'Pessoal', value: 25000 },
    { name: 'Contratos', value: 18000 },
    { name: 'Concessionárias', value: 8000 },
    { name: 'Variáveis', value: 5000 },
    { name: 'Anuais', value: 2000 },
  ];

  const trendData = [
    { period: 'Dez/2023', value: 42000, change: 0, changePercent: 0 },
    { period: 'Jan/2024', value: 45000, change: 3000, changePercent: 7.1 },
    { period: 'Fev/2024', value: 48000, change: 3000, changePercent: 6.7 },
    { period: 'Mar/2024', value: 52000, change: 4000, changePercent: 8.3 },
    { period: 'Abr/2024', value: 49000, change: -3000, changePercent: -5.8 },
    { period: 'Mai/2024', value: 55000, change: 6000, changePercent: 12.2 },
    { period: 'Jun/2024', value: 58000, change: 3000, changePercent: 5.5 },
  ];

  const insights = [
    {
      id: '1',
      type: 'warning' as const,
      title: 'Aumento nas Despesas de Pessoal',
      description: 'Houve um aumento de 12% nas despesas de pessoal comparado ao mês anterior. Verificar novos contratos ou reajustes.',
      value: 3000,
      action: 'Analisar Detalhes',
      priority: 'high' as const
    },
    {
      id: '2',
      type: 'success' as const,
      title: 'Meta Mensal Atingida',
      description: 'O valor arrecadado este mês está 5% acima da meta estabelecida. Excelente desempenho!',
      value: 2500,
      action: 'Ver Relatório',
      priority: 'medium' as const
    },
    {
      id: '3',
      type: 'tip' as const,
      title: 'Oportunidade de Economia',
      description: 'Identificamos que algumas despesas de concessionárias podem ser renegociadas, gerando economia de até 8%.',
      value: 1200,
      action: 'Ver Sugestões',
      priority: 'medium' as const
    },
    {
      id: '4',
      type: 'info' as const,
      title: 'Previsão para Próximo Mês',
      description: 'Com base no histórico, o próximo mês deve ter um custo 3% menor devido à sazonalidade.',
      priority: 'low' as const
    }
  ];

  const kpis = [
    {
      title: 'Total Mensal',
      value: formatCurrency(58000),
      change: '+5.5% vs mês anterior',
      changeType: 'positive' as const,
      icon: DollarSign,
      gradient: 'bg-gradient-to-br from-green-500 via-green-600 to-green-700',
      description: 'Receita total do condomínio',
      trend: [45000, 48000, 52000, 49000, 55000, 58000]
    },
    {
      title: 'Taxa por m²',
      value: `R$ ${formatNumber(12.50)}`,
      change: '+2.1% vs mês anterior',
      changeType: 'positive' as const,
      icon: Calculator,
      gradient: 'bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700',
      description: 'Valor por metro quadrado',
      trend: [11.8, 12.0, 12.3, 12.1, 12.4, 12.5]
    },
    {
      title: 'Área Total',
      value: condominio ? `${formatNumber(condominio.area_total_m2)} m²` : '0 m²',
      icon: Building2,
      gradient: 'bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700',
      description: 'Área do empreendimento'
    },
    {
      title: 'Unidades Ativas',
      value: '24',
      change: '+1 nova unidade',
      changeType: 'positive' as const,
      icon: Users,
      gradient: 'bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700',
      description: 'Unidades ocupadas',
      trend: [22, 22, 23, 23, 23, 24]
    }
  ];

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetchDashboard();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handleExport = () => {
    // Implementar exportação de dados
    console.log('Exportando dados do dashboard...');
  };

  return (
    <div className="space-y-8">
      {/* Header Avançado */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-white/80 via-white/70 to-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/60 p-8"
      >
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-2">
              Dashboard Inteligente
            </h1>
            <p className="text-slate-600 text-lg">
              Análise completa - {format(new Date(), "MMMM 'de' yyyy", { locale: ptBR })}
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            {/* Filtros */}
            <select
              value={selectedCondominio}
              onChange={(e) => setSelectedCondominio(Number(e.target.value))}
              className="px-4 py-2 border border-slate-300 rounded-xl bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {condominios?.map((cond) => (
                <option key={cond.id} value={cond.id}>
                  {cond.nome}
                </option>
              ))}
            </select>

            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="px-4 py-2 border border-slate-300 rounded-xl bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="3m">Últimos 3 meses</option>
              <option value="6m">Últimos 6 meses</option>
              <option value="12m">Últimos 12 meses</option>
              <option value="ytd">Ano atual</option>
            </select>

            <select
              value={chartType}
              onChange={(e) => setChartType(e.target.value as any)}
              className="px-4 py-2 border border-slate-300 rounded-xl bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="line">Linha</option>
              <option value="area">Área</option>
              <option value="bar">Barras</option>
            </select>

            {/* Ações */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Atualizar</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleExport}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Exportar</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* KPIs Avançados */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, index) => (
          <AnalyticsCard
            key={index}
            title={kpi.title}
            value={kpi.value}
            change={kpi.change}
            changeType={kpi.changeType}
            icon={kpi.icon}
            gradient={kpi.gradient}
            description={kpi.description}
            trend={kpi.trend}
          />
        ))}
      </div>

      {/* Gráficos e Análises */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Evolução Mensal */}
        <AdvancedChart
          title="Evolução das Despesas Mensais"
          data={monthlyData}
          type={chartType}
          height={350}
          color="#3B82F6"
          showComparison={true}
        />

        {/* Distribuição por Categoria */}
        <AdvancedChart
          title="Distribuição por Categoria"
          data={categoryData}
          type="pie"
          height={350}
        />
      </div>

      {/* Análises Avançadas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Análise de Tendências */}
        <TrendAnalysis
          title="Análise de Tendências Mensais"
          data={trendData}
          threshold={60000}
          target={55000}
        />

        {/* Insights Inteligentes */}
        <SmartInsights insights={insights} />
      </div>

      {/* Seção de Competências */}
      {competencias && competencias.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/60 p-8"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-blue-600" />
              Competências Recentes
            </h2>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span>Ver Todas</span>
            </motion.button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {competencias.slice(0, 6).map((comp: any, index: number) => (
              <motion.div
                key={comp.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ scale: 1.02, y: -2 }}
                className="p-4 bg-gradient-to-br from-white/80 to-white/60 rounded-xl border border-white/40 shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-slate-900">
                    {String(comp.mes).padStart(2, '0')}/{comp.ano}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    comp.status === 'fechado' 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {comp.status === 'fechado' ? 'Fechado' : 'Ativo'}
                  </span>
                </div>
                {comp.taxa_m2 && (
                  <div className="space-y-2">
                    <p className="text-sm text-slate-600">
                      Taxa: <span className="font-semibold text-blue-600">R$ {comp.taxa_m2.toFixed(2)}/m²</span>
                    </p>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min((comp.taxa_m2 / 15) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Resumo Consolidado */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-slate-50 via-blue-50 to-purple-50 rounded-2xl p-8 shadow-lg"
      >
        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
          <Target className="w-5 h-5 mr-2 text-blue-600" />
          Resumo Consolidado do Período
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="p-4 bg-white/80 rounded-xl shadow-md">
              <p className="text-sm text-slate-600 mb-1">Receita Total</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(348000)}</p>
              <p className="text-xs text-green-600 mt-1">↗ +8.2% vs período anterior</p>
            </div>
          </div>
          <div className="text-center">
            <div className="p-4 bg-white/80 rounded-xl shadow-md">
              <p className="text-sm text-slate-600 mb-1">Média Mensal</p>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(58000)}</p>
              <p className="text-xs text-blue-600 mt-1">Estável</p>
            </div>
          </div>
          <div className="text-center">
            <div className="p-4 bg-white/80 rounded-xl shadow-md">
              <p className="text-sm text-slate-600 mb-1">Taxa Média</p>
              <p className="text-2xl font-bold text-purple-600">R$ 12.35</p>
              <p className="text-xs text-purple-600 mt-1">Por m²</p>
            </div>
          </div>
          <div className="text-center">
            <div className="p-4 bg-white/80 rounded-xl shadow-md">
              <p className="text-sm text-slate-600 mb-1">Eficiência</p>
              <p className="text-2xl font-bold text-orange-600">94.5%</p>
              <p className="text-xs text-orange-600 mt-1">Meta: 90%</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
