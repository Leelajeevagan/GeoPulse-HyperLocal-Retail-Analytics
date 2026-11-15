import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { MacroTrajectoryItem } from '../../types';
import { TrendingUp, CloudRain, Sun } from 'lucide-react';

interface Props {
  data: MacroTrajectoryItem[];
  summary?: any;
}

export const MacroTrajectoryChart: React.FC<Props> = ({ data, summary }) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-card">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Macro Trend & Period Comparative Trajectory
            </h3>
            <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
              +{summary?.net_growth_pct || 12.4}% Period Growth
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Comparative footfall curve tracking 14-day aggregated cycle vs. prior benchmark.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
            <span className="w-3 h-0.5 bg-teal-500 rounded-full" />
            <span>Current Period</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <span className="w-3 h-0.5 bg-slate-400 border-dashed border-t-2" />
            <span>Previous Period</span>
          </div>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 10, right: 20, bottom: 20, left: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800" />
            <XAxis
              dataKey="date"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              dy={10}
            />
            <YAxis
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload as MacroTrajectoryItem;
                  return (
                    <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700 p-3 rounded-xl shadow-xl text-xs text-white">
                      <div className="font-bold text-teal-300 flex items-center justify-between gap-3">
                        <span>{item.date}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                          {item.weather}
                        </span>
                      </div>
                      <div className="mt-2 space-y-1 font-mono">
                        <div className="flex justify-between gap-4">
                          <span className="text-slate-400">Current Period:</span>
                          <span className="text-teal-400 font-bold">
                            {item.current_period.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-slate-400">Previous Period:</span>
                          <span className="text-slate-300 font-bold">
                            {item.previous_period.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between gap-4 pt-1 border-t border-slate-800">
                          <span className="text-slate-400">Variance:</span>
                          <span className="text-emerald-400 font-bold">
                            +{item.variance_pct}%
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Line
              type="monotone"
              dataKey="current_period"
              name="Current Period"
              stroke="#0d9488"
              strokeWidth={3}
              dot={{ r: 4, fill: '#0d9488' }}
              activeDot={{ r: 7 }}
            />
            <Line
              type="monotone"
              dataKey="previous_period"
              name="Previous Period"
              stroke="#94a3b8"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ r: 3, fill: '#94a3b8' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

