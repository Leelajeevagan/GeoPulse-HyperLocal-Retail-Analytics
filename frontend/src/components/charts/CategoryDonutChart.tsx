import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { CategoryShareItem } from '../../types';

interface Props {
  data: CategoryShareItem[];
}

export const CategoryDonutChart: React.FC<Props> = ({ data }) => {
  const totalVisits = data.reduce((acc, curr) => acc + curr.visits, 0);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-card flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            Category Footfall Share
          </h3>
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300">
            4 Categories
          </span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Distribution of customer inflows across primary retail product segments.
        </p>
      </div>

      <div className="relative h-56 my-2">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={88}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload as CategoryShareItem;
                  return (
                    <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700 p-2.5 rounded-xl shadow-xl text-xs text-white">
                      <div className="font-bold flex items-center gap-1.5" style={{ color: item.color }}>
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                        {item.name}
                      </div>
                      <div className="mt-1 font-mono text-[11px] space-y-0.5">
                        <div>Share: <b>{item.value}%</b></div>
                        <div>Visits: <b>{item.visits.toLocaleString()}</b></div>
                        <div className="text-emerald-400">YoY Growth: <b>{item.growth}</b></div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center Donut Label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xl font-extrabold text-slate-900 dark:text-white font-mono leading-none">
            3.84M
          </span>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold mt-0.5">
            Total Visits
          </span>
        </div>
      </div>

      {/* Legend & Breakdown List */}
      <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
        {data.map((cat) => (
          <div key={cat.name} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
              <span className="font-medium text-slate-800 dark:text-slate-200 truncate">{cat.name}</span>
            </div>
            <div className="text-right shrink-0">
              <span className="font-bold font-mono text-slate-900 dark:text-white">{cat.value}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

