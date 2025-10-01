"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface LineChartData {
  data: string;
  leads: number;
}

interface CustomLineChartProps {
  data: LineChartData[];
  title?: string;
  color?: string;
}

export function CustomLineChart({ data, title, color = "#3B82F6" }: CustomLineChartProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit' 
    });
  };

  return (
    <div className="w-full h-80">
      {title && (
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
          {title}
        </h3>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
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
            dataKey="data" 
            tickFormatter={formatDate}
            className="text-sm text-gray-600 dark:text-gray-400"
          />
          <YAxis className="text-sm text-gray-600 dark:text-gray-400" />
          <Tooltip 
            labelFormatter={(value) => `Data: ${formatDate(value as string)}`}
            formatter={(value) => [`${value} leads`, 'Leads']}
            contentStyle={{
              backgroundColor: 'var(--background)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
            }}
          />
          <Line 
            type="monotone" 
            dataKey="leads" 
            stroke={color} 
            strokeWidth={2}
            dot={{ fill: color, strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: color, strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}