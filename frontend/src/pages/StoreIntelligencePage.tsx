import React, { useState } from 'react';
import {
  Store as StoreIcon,
  Search,
  Sparkles,
  ShieldAlert,
  Users,
  Compass,
  ArrowUpRight,
  TrendingUp,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { Store } from '../types';

interface Props {
  stores: Store[];
  onSelectStore: (store: Store) => void;
}

export const StoreIntelligencePage: React.FC<Props> = ({ stores, onSelectStore }) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');

  const filtered = stores.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.code.toLowerCase().includes(search.toLowerCase()) ||
      s.zone.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'All Categories' || s.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Store Intelligence & Catchment Health Matrix
          </h1>
          <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
            Node Scorecard
          </span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Store-by-store algorithmic health indices, competitor defense scoring, and staff-to-footfall ratios.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-card flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none"
          >
            <option value="All Categories">All Categories</option>
            <option value="Apparel">Apparel</option>
            <option value="Electronics">Electronics</option>
            <option value="Food & Beverage">Food & Beverage</option>
            <option value="Specialty & Beauty">Specialty & Beauty</option>
          </select>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by store or code..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
          />
        </div>
      </div>

      {/* Stores Grid Scorecards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((store) => (
          <div
            key={store.id}
            onClick={() => onSelectStore(store)}
            className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-card hover:shadow-card-hover hover:border-teal-400/50 transition-all duration-200 cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300">
                      {store.format}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">{store.code}</span>
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-1 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                    {store.name}
                  </h3>
                  <p className="text-[11px] text-slate-400 truncate max-w-[240px]">
                    {store.address}
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-sm font-extrabold font-mono text-amber-500">
                    {store.opportunity_score}
                    <span className="text-[10px] text-slate-400 font-sans">/100</span>
                  </div>
                  <div className="text-[9px] font-bold uppercase text-slate-400">
                    Health Index
                  </div>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
                <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <div className="text-[9px] font-semibold text-slate-400 uppercase">Daily Footfall</div>
                  <div className="text-xs font-bold font-mono text-teal-600 dark:text-teal-400 mt-0.5">
                    {store.daily_footfall.toLocaleString()}
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <div className="text-[9px] font-semibold text-slate-400 uppercase">Capacity %</div>
                  <div className="text-xs font-bold font-mono text-slate-900 dark:text-white mt-0.5">
                    {store.capacity_utilization}%
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <div className="text-[9px] font-semibold text-slate-400 uppercase">Cannibal.</div>
                  <div className="text-xs font-bold font-mono text-rose-500 mt-0.5">
                    {store.cannibalization_pct}%
                  </div>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
                <span>Staff: <b>{store.employee_count} active</b></span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">{store.movement_trend}</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-teal-600 dark:text-teal-400">
              <span>View Deep Spatial Profile</span>
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

