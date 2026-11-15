import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { SalesCorrelationData } from '../../types';
import { Sparkles, TrendingUp, Clock } from 'lucide-react';

interface Props {
  data: SalesCorrelationData | null;
}

export const FootfallSalesCorrelationChart: React.FC<Props> = ({ data }) => {
  if (!data || !data.series) {
    return (
      <div className="h-72 flex items-center justify-center text-xs text-slate-400">
        Loading correlation trajectory...
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-card">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Footfall vs. Realized Sales Correlation
            </h3>
            <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
              r = {data.correlation_coefficient}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Tracking 30-day temporal cross-density between pedestrian volume and POS gross sales.
          </p>
        </div>

        {/* Optimal Conversion Pill & Weekend Surge Multiplier */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/60 text-xs text-slate-700 dark:text-slate-200">
            <Clock className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span>Optimal Window: <b>{data.optimal_conversion_window}</b></span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-800/60 text-xs text-emerald-800 dark:text-emerald-300 font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Weekend {data.weekend_surge_multiplier}</span>
          </div>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data.series}
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
              yAxisId="left"
              stroke="#0d9488"
              fontSize={11}
              tickLine={false}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              label={{
                value: 'Footfall Volume',
                angle: -90,
                position: 'insideLeft',
                fill: '#0d9488',
                fontSize: 11,
                dy: 40,
              }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#10b981"
              fontSize={11}
              tickLine={false}
              tickFormatter={(v) => `$${v}k`}
              label={{
                value: 'Gross Sales ($k)',
                angle: 90,
                position: 'insideRight',
                fill: '#10b981',
                fontSize: 11,
                dy: -40,
              }}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  return (
                    <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700 p-3 rounded-xl shadow-xl text-xs text-white">
                      <div className="font-bold text-teal-400">
                        {item.day}, {item.date} {item.is_weekend ? '🎉 Weekend Surge' : ''}
                      </div>
                      <div className="mt-2 space-y-1 font-mono">
                        <div className="flex justify-between gap-4">
                          <span className="text-slate-400">Footfall:</span>
                          <span className="text-teal-300 font-bold">
                            {item.footfall.toLocaleString()} visitors
                          </span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-slate-400">POS Sales:</span>
                          <span className="text-emerald-400 font-bold">
                            ${(item.sales_k * 1000).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-slate-400">Conversion Rate:</span>
                          <span className="text-amber-300 font-bold">
                            {item.conversion_rate}%
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend
              verticalAlign="top"
              align="right"
              wrapperStyle={{ paddingBottom: '10px', fontSize: '11px' }}
            />
            <Bar
              yAxisId="left"
              dataKey="footfall"
              name="Footfall Volume"
              fill="#0d9488"
              radius={[4, 4, 0, 0]}
              opacity={0.75}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="sales_k"
              name="Realized Gross Sales ($k)"
              stroke="#10b981"
              strokeWidth={2.5}
              dot={{ r: 3, fill: '#10b981' }}
              activeDot={{ r: 6 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

