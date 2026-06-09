// src/components/WifiCharts.tsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { HistoryPoint } from '../types/HistoryPoint';

interface WifiChartsProps {
  history: HistoryPoint[];
  uniqueNetworks: string[];
}

export default function WifiCharts({ history, uniqueNetworks }: WifiChartsProps) {
  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088FE', '#00C49F'];

  return (
    <div className="w-full min-w-0 bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
      <h2 className="text-base font-semibold text-slate-800 mb-3">
        Real-Time Signal Strength (RSSI)
      </h2>
      <div className="w-full">
        {/* Cambiado el height de 400 a 260 píxeles */}
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={history} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="time" tick={{ fontSize: 12, fill: '#64748b' }} tickLine={false} axisLine={false} />
            <YAxis
              domain={[-100, -30]}
              tick={{ fontSize: 12, fill: '#64748b' }}
              tickLine={false}
              axisLine={false}
              label={{ value: 'dBm', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
            />
            <Tooltip
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            {uniqueNetworks.map((netName, index) => (
              <Line
                key={netName}
                type="monotone"
                dataKey={netName}
                stroke={colors[index % colors.length]}
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 2 }}
                activeDot={{ r: 8, strokeWidth: 0 }}
                connectNulls={true}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}