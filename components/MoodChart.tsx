import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps
} from 'recharts';
import { format } from 'date-fns';
import { MoodEntry } from '../types';

interface MoodChartProps {
  data: MoodEntry[];
}

const CustomTooltip: React.FC<TooltipProps<number, string>> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded shadow-lg text-sm">
        <p className="font-semibold text-gray-700">{label}</p>
        <p className="text-indigo-600 font-bold">Mood: {payload[0].value}/10</p>
        {payload[0].payload.note && (
          <p className="text-gray-500 mt-1 italic max-w-xs">"{payload[0].payload.note}"</p>
        )}
      </div>
    );
  }
  return null;
};

export const MoodChart: React.FC<MoodChartProps> = ({ data }) => {
  // Process data for chart
  const chartData = data.map(entry => ({
    ...entry,
    dateStr: format(new Date(entry.timestamp), 'MMM d, h:mm a'),
  }));

  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center bg-white rounded-xl border border-gray-100">
        <p className="text-gray-400">No mood entries yet. Start chatting!</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Emotional Trends</h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis 
              dataKey="dateStr" 
              tick={{ fontSize: 10, fill: '#9ca3af' }}
              tickLine={false}
              axisLine={false}
              minTickGap={30}
            />
            <YAxis 
              domain={[0, 10]} 
              tick={{ fontSize: 12, fill: '#9ca3af' }}
              tickLine={false}
              axisLine={false}
              tickCount={6}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="#6366f1" 
              strokeWidth={3}
              dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 6 }}
              animationDuration={1000}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};