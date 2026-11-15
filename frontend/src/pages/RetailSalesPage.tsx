import React from 'react';
import {
  BadgeDollarSign,
  TrendingUp,
  Percent,
  ShoppingBag,
  ArrowUpRight,
  Sparkles,
  BarChart2
} from 'lucide-react';
import { Store } from '../types';
import { KpiCard } from '../components/common/KpiCard';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell
} from 'recharts';

interface Props {
  stores: Store[];
}

export const RetailSalesPage: React.FC<Props> = ({ stores }) => {
  const top10Sales = [...stores]
    .sort((a, b) => b.gross_sales_mtd - a.gross_sales_mtd)
    .slice(0, 8);

  const chartData = top10Sales.map((s) => ({
    name: s.name.replace(' Flagship', '').replace(' Specialty', ''),
    sales_k: Math.round(s.gross_sales_mtd / 1000),
    footfall: s.daily_footfall,
    conversion: s.conversion_rate,
  }));

  const totalMtdSales = stores.reduce((acc, s) => acc + s.gross_sales_mtd, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Retail Sales & POS Financial Telemetry
          </h1>
          <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            Realized POS Feed
          </span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Financial performance analysis, basket size conversion efficiency, and gross sales correlation across all 42 stores.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Tracked Revenue"
          value={`$${(totalMtdSales / 1000000).toFixed(2)}M`}
          change={8.6}
          subtext="Month to date gross POS volume"
          icon={BadgeDollarSign}
          colorScheme="emerald"
          sparkline={[22.4, 23.5, 24.8, 26.1, 28.45]}
        />

        <KpiCard
          title="Average Conversion Rate"
          value="24.8%"
          change={2.3}
          subtext="Footfall to checkout completion"
          icon={Percent}
          colorScheme="teal"
          sparkline={[21.2, 22.0, 23.4, 24.1, 24.8]}
        />

        <KpiCard
          title="Avg Transaction Basket"
          value="$78.40"
          change={5.9}
          subtext="+ $4.40 vs previous period"
          icon={ShoppingBag}
          colorScheme="blue"
          sparkline={[70, 72, 74, 76, 78.4]}
        />

        <KpiCard
          title="Revenue per Sq Foot"
          value="$138 / sqft"
          change={11.2}
          subtext="Top 10% benchmark: $210/sqft"
          icon={BarChart2}
          colorScheme="indigo"
          badge="High Efficiency"
        />
      </div>

      {/* Top 8 Revenue Stores Bar Chart */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Top 8 Revenue Producing Venues (Month to Date)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Gross sales volume in thousands USD ($k) alongside conversion efficiencies.
            </p>
          </div>
          <span className="text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400">
            Top Node: Downtown Crossing Hub ($1,250k)
          </span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 20, bottom: 25, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800" vertical={false} />
              <XAxis dataKey="name" stroke="#64748b" fontSize={10} interval={0} angle={-15} textAnchor="end" />
              <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v) => `$${v}k`} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload;
                    return (
                      <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700 p-3 rounded-xl shadow-xl text-xs text-white">
                        <div className="font-bold text-emerald-400">{item.name}</div>
                        <div className="mt-1 font-mono text-[11px] space-y-1">
                          <div>Gross Sales MTD: <b>${item.sales_k}k</b></div>
                          <div>Daily Footfall: <b>{item.footfall.toLocaleString()} visitors</b></div>
                          <div className="text-amber-300">Conversion Rate: <b>{item.conversion}%</b></div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="sales_k" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

