import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  unit?: string;
  change?: number;
  changeLabel?: string;
  subtext?: string;
  icon: LucideIcon;
  sparkline?: number[];
  colorScheme?: 'teal' | 'emerald' | 'blue' | 'indigo' | 'amber';
  badge?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  unit,
  change,
  changeLabel = 'vs prev period',
  subtext,
  icon: Icon,
  sparkline,
  colorScheme = 'teal',
  badge,
}) => {
  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;

  // Sparkline SVG generator (placed cleanly in middle row next to value)
  const renderSparkline = () => {
    if (!sparkline || sparkline.length < 2) return null;
    const min = Math.min(...sparkline);
    const max = Math.max(...sparkline) || 1;
    const range = max - min || 1;
    const width = 64;
    const height = 26;

    const points = sparkline
      .map((val, idx) => {
        const x = (idx / (sparkline.length - 1)) * width;
        const y = height - ((val - min) / range) * (height - 6) - 3;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');

    const strokeColors = {
      teal: '#0d9488',
      emerald: '#10b981',
      blue: '#3b82f6',
      indigo: '#6366f1',
      amber: '#f59e0b',
    };

    const strokeColor = isNegative ? '#ef4444' : strokeColors[colorScheme] || '#0d9488';

    return (
      <svg width={width} height={height} className="overflow-visible shrink-0 ml-2" aria-hidden="true">
        <polyline
          fill="none"
          stroke={strokeColor}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
      </svg>
    );
  };

  const schemeColors = {
    teal: 'bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300 border-teal-200 dark:border-teal-800',
    emerald: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    blue: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    indigo: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
    amber: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-card hover:shadow-card-hover transition-all duration-200 flex flex-col justify-between min-h-[160px]">
      {/* Top Header: Title & Distinct Icon */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 leading-snug">
            {title}
          </h4>
          <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 shadow-sm ${schemeColors[colorScheme]}`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>

        {/* Middle Row: Large Value + Unit + Optional Status Badge + Sparkline */}
        <div className="flex items-center justify-between gap-2 mt-1">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className="text-2xl sm:text-[28px] font-black tracking-tight text-slate-950 dark:text-white font-mono leading-none">
              {value}
            </span>
            {unit && (
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 font-sans">
                {unit}
              </span>
            )}
            {badge && (
              <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-extrabold bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-200 rounded-full border border-teal-300 dark:border-teal-700 shrink-0">
                {badge}
              </span>
            )}
          </div>

          {/* Sparkline placed safely in middle row */}
          {sparkline && renderSparkline()}
        </div>
      </div>

      {/* Bottom Row: Full-Width High-Contrast Subtext (No Truncation) */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-2">
        {change !== undefined && (
          <span
            className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-lg shrink-0 ${
              isPositive
                ? 'text-emerald-800 bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300/50 dark:border-emerald-800/60'
                : isNegative
                ? 'text-rose-800 bg-rose-100 dark:bg-rose-950 dark:text-rose-300 border border-rose-300/50 dark:border-rose-800/60'
                : 'text-slate-700 bg-slate-100 dark:text-slate-300 dark:bg-slate-800'
            }`}
          >
            {isPositive ? (
              <TrendingUp className="w-3.5 h-3.5" />
            ) : isNegative ? (
              <TrendingDown className="w-3.5 h-3.5" />
            ) : (
              <Minus className="w-3.5 h-3.5" />
            )}
            {change > 0 ? `+${change}%` : `${change}%`}
          </span>
        )}

        <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 leading-tight">
          {subtext || changeLabel}
        </p>
      </div>
    </div>
  );
};
