"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList, Cell } from 'recharts';

interface BarChartData {
  nome: string;
  totalLeads: number;
}

interface CustomBarChartProps {
  data: BarChartData[];
  title?: string;
  color?: string;
}

export function CustomBarChart({ data, title, color = "#10B981" }: CustomBarChartProps) {
  // Ordena por total de leads (desc) e limita ao Top 10
  const rankedData = [...data]
    .sort((a, b) => b.totalLeads - a.totalLeads)
    .slice(0, 10)
    .map((item, index) => ({
      ...item,
      rank: index + 1,
      rankLabel: `#${index + 1} ${item.nome}`,
    }));

  const getFillByRank = (rank: number) => {
    if (rank === 1) return 'url(#rankGold)';
    if (rank === 2) return 'url(#rankSilver)';
    if (rank === 3) return 'url(#rankBronze)';
    return 'url(#rankGreen)';
  };

  return (
    <div className="w-full h-80">
      {title && (
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
          {title}
        </h3>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={rankedData}
          layout="vertical"
          margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
        >
          <defs>
            <linearGradient id="rankGold" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#FBBF24" />
            </linearGradient>
            <linearGradient id="rankSilver" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#9CA3AF" />
              <stop offset="100%" stopColor="#D1D5DB" />
            </linearGradient>
            <linearGradient id="rankBronze" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#B45309" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>
            <linearGradient id="rankGreen" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={color} />
              <stop offset="100%" stopColor="#34D399" />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
          <YAxis
            dataKey="rankLabel"
            type="category"
            width={140}
            tick={{ fontSize: 12 }}
            className="text-sm text-gray-700 dark:text-gray-300"
          />
          <XAxis type="number" className="text-sm text-gray-700 dark:text-gray-300" />
          <Tooltip
            formatter={(value: number, _name, item: any) => [
              `${value} leads`,
              item?.payload?.rank === 1 ? '🏆 Líder' : 'Leads'
            ]}
            labelFormatter={(label: string) => label}
            contentStyle={{
              backgroundColor: 'var(--background)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
            }}
          />

          <Bar dataKey="totalLeads" radius={[8, 8, 8, 8]} isAnimationActive>
            {rankedData.map((entry, idx) => (
              <Cell key={`cell-${idx}`} fill={getFillByRank(entry.rank)} />
            ))}
            <LabelList
              dataKey="totalLeads"
              position="right"
              formatter={(label) => (typeof label === 'number' ? `${label}` : String(label ?? ''))}
              className="text-sm"
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}