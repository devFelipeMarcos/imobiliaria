"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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
  return (
    <div className="w-full h-80">
      {title && (
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
          {title}
        </h3>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis 
            dataKey="nome" 
            className="text-sm text-gray-600 dark:text-gray-400"
            tick={{ fontSize: 12 }}
          />
          <YAxis className="text-sm text-gray-600 dark:text-gray-400" />
          <Tooltip 
            formatter={(value) => [`${value} leads`, 'Total de Leads']}
            contentStyle={{
              backgroundColor: 'var(--background)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
            }}
          />
          <Bar 
            dataKey="totalLeads" 
            fill={color}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}