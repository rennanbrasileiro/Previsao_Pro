import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

interface ChartCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

function ChartCard({ title, description, children }: ChartCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/60"
    >
      <div className="mb-4">
        <h3 className="text-lg font-bold text-slate-900">{title}</h3>
        {description && (
          <p className="text-sm text-slate-600 mt-1">{description}</p>
        )}
      </div>
      {children}
    </motion.div>
  );
}

interface EvolutionChartProps {
  data: Array<{ mes: string; previsto: number; executado: number }>;
}

export function EvolutionChart({ data }: EvolutionChartProps) {
  return (
    <ChartCard
      title="Evolução Mensal"
      description="Comparação projetado x executado ao longo do tempo"
    >
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorPrevisto" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorExecutado" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="mes" stroke="#64748b" />
          <YAxis stroke="#64748b" />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #e2e8f0',
              borderRadius: '8px'
            }}
          />
          <Legend />
          <Area
            type="monotone"
            dataKey="previsto"
            stroke="#3b82f6"
            fillOpacity={1}
            fill="url(#colorPrevisto)"
            name="Previsto"
          />
          <Area
            type="monotone"
            dataKey="executado"
            stroke="#10b981"
            fillOpacity={1}
            fill="url(#colorExecutado)"
            name="Executado"
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

interface CategoryComparisonProps {
  data: Array<{ categoria: string; previsto: number; executado: number }>;
}

export function CategoryComparison({ data }: CategoryComparisonProps) {
  return (
    <ChartCard
      title="Comparação por Categoria"
      description="Distribuição de despesas por categoria"
    >
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="categoria" stroke="#64748b" angle={-45} textAnchor="end" height={100} />
          <YAxis stroke="#64748b" />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #e2e8f0',
              borderRadius: '8px'
            }}
          />
          <Legend />
          <Bar dataKey="previsto" fill="#3b82f6" name="Previsto" radius={[8, 8, 0, 0]} />
          <Bar dataKey="executado" fill="#10b981" name="Executado" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

interface DistributionChartProps {
  data: Array<{ name: string; value: number }>;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export function DistributionChart({ data }: DistributionChartProps) {
  return (
    <ChartCard
      title="Distribuição de Despesas"
      description="Proporção de cada categoria no total"
    >
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #e2e8f0',
              borderRadius: '8px'
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

interface VariationRadarProps {
  data: Array<{ categoria: string; variacao: number; maxVariacao: number }>;
}

export function VariationRadar({ data }: VariationRadarProps) {
  return (
    <ChartCard
      title="Radar de Variações"
      description="Análise multidimensional de variações percentuais"
    >
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart data={data}>
          <PolarGrid stroke="#e2e8f0" />
          <PolarAngleAxis dataKey="categoria" stroke="#64748b" />
          <PolarRadiusAxis stroke="#64748b" />
          <Radar
            name="Variação %"
            dataKey="variacao"
            stroke="#8b5cf6"
            fill="#8b5cf6"
            fillOpacity={0.6}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #e2e8f0',
              borderRadius: '8px'
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

interface TrendLineProps {
  data: Array<{ mes: string; valor: number }>;
  title: string;
  description?: string;
  color?: string;
}

export function TrendLine({ data, title, description, color = '#3b82f6' }: TrendLineProps) {
  return (
    <ChartCard title={title} description={description}>
      <ResponsiveContainer width="100%" height={150}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="mes" stroke="#64748b" />
          <YAxis stroke="#64748b" />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #e2e8f0',
              borderRadius: '8px'
            }}
          />
          <Line
            type="monotone"
            dataKey="valor"
            stroke={color}
            strokeWidth={3}
            dot={{ fill: color, r: 6 }}
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
