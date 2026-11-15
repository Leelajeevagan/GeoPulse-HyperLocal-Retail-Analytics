import React, { useState, useEffect } from 'react';
import {
  Users,
  Clock,
  Navigation,
  CloudSun,
  Search,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Sparkles,
  Calendar,
  Layers
} from 'lucide-react';
import { KpiCard } from '../components/common/KpiCard';
import { MacroTrajectoryChart } from '../components/charts/MacroTrajectoryChart';
import { WeeklyVisitingHeatmap } from '../components/charts/WeeklyVisitingHeatmap';
import {
  getFootfallKpis,
  getMacroTrajectory,
  getWeeklyHeatmap,
  getTemporalDeepdive,
  getMonitoredVenues
} from '../services/api';
import { HeatmapDay, MacroTrajectoryItem } from '../types';

interface Props {
  onSelectStore?: (storeId: number) => void;
}

export const FootfallAnalysisPage: React.FC<Props> = ({ onSelectStore }) => {
  const [kpis, setKpis] = useState<any>(null);
  const [trajectoryData, setTrajectoryData] = useState<MacroTrajectoryItem[]>([]);
  const [trajectorySummary, setTrajectorySummary] = useState<any>(null);
  const [heatmapData, setHeatmapData] = useState<HeatmapDay[]>([]);
  const [temporalData, setTemporalData] = useState<any>(null);

  // Monitored Retail Venues Table State
  const [venues, setVenues] = useState<any[]>([]);
  const [totalVenues, setTotalVenues] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState('daily_footfall');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [zoneFilter, setZoneFilter] = useState('All Zones');
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingVenues, setLoadingVenues] = useState(false);

  useEffect(() => {
    getFootfallKpis().then(setKpis).catch(console.error);
    getMacroTrajectory().then((res) => {
      setTrajectoryData(res.trajectory);
      setTrajectorySummary(res.summary);
    }).catch(console.error);
    getWeeklyHeatmap().then(setHeatmapData).catch(console.error);
    getTemporalDeepdive().then(setTemporalData).catch(console.error);
  }, []);

  const fetchVenues = () => {
    setLoadingVenues(true);
    getMonitoredVenues({
      page,
      page_size: pageSize,
      sort_by: sortBy,
      order: sortOrder,
      zone: zoneFilter,
      search: searchQuery,
    })
      .then((res) => {
        setVenues(res.items);
        setTotalVenues(res.total);
      })
      .catch(console.error)
      .finally(() => setLoadingVenues(false));
  };

  useEffect(() => {
    fetchVenues();
  }, [page, pageSize, sortBy, sortOrder, zoneFilter, searchQuery]);

  const handleSort = (col: string) => {
    if (sortBy === col) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(col);
      setSortOrder('desc');
    }
  };

  const totalPages = Math.ceil(totalVenues / pageSize) || 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Footfall Analysis & Pedestrian Velocity
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
              Temporal Telemetry
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Macro-level customer trajectories, 7x24 density heatmaps, and venue-by-venue throughput benchmarking.
          </p>
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Daily Footfall"
          value={kpis?.daily_footfall ? kpis.daily_footfall.toLocaleString() : '142,850'}
          change={kpis?.daily_footfall_pct || 12.4}
          subtext="vs. prior week 7-day average"
          icon={Users}
          colorScheme="teal"
          sparkline={[118, 122, 128, 134, 131, 138, 142]}
        />

        <KpiCard
          title="Peak Hourly Rate"
          value={kpis ? `${kpis.peak_hourly_rate.toLocaleString()}/hr` : '14,200/hr'}
          change={8.2}
          subtext={kpis?.peak_hourly_sub || '17:30 EST Commuter Peak'}
          icon={Clock}
          colorScheme="blue"
          sparkline={[10, 11, 12, 13, 14.2]}
        />

        <KpiCard
          title="Mobility Split"
          value={kpis?.mobility_split_label || '68% Walk / 32% Transit'}
          change={4.1}
          subtext="Pedestrian corridor dominant"
          icon={Navigation}
          colorScheme="emerald"
        />

        <KpiCard
          title="Atmospheric Elasticity"
          value={kpis?.atmospheric_elasticity_sub || '+18.2% on Clear Weather Days'}
          change={18.2}
          subtext="Weather sensitivity coefficient"
          icon={CloudSun}
          colorScheme="amber"
          badge="High Impact"
        />
      </div>

      {/* Macro Trajectory Chart */}
      <MacroTrajectoryChart data={trajectoryData} summary={trajectorySummary} />

      {/* Weekly Visiting Hours Heatmap (7x24) */}
      <WeeklyVisitingHeatmap data={heatmapData} />

      {/* Temporal Deep-Dive Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              Temporal Deep-Dive & Diurnal Waves
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Breakdown of customer velocity personas, morning transit spikes, lunch waves, and weekend expansion.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300">
            Average Dwell Time: <b>42.6 minutes (+4.1 min)</b>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Morning Rush */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Morning Rush
              </span>
              <span className="text-xs font-bold text-teal-600 dark:text-teal-400 font-mono">
                22.4% Share
              </span>
            </div>
            <div className="text-base font-extrabold text-slate-900 dark:text-white mt-1">
              07:30 - 09:30 EST
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-300 mt-2">
              Transit commuters & early risers. High velocity, focused quick-basket visits.
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-700 text-[11px] text-slate-500 font-mono">
              Inflow Rate: 8,200 p/hr
            </div>
          </div>

          {/* Midday Activity */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Midday Activity
              </span>
              <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400 font-mono">
                31.2% Share
              </span>
            </div>
            <div className="text-base font-extrabold text-slate-900 dark:text-white mt-1">
              12:00 - 14:00 EST
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-300 mt-2">
              Office workers & lunch browsers. High food & beverage cross-conversion rate.
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-700 text-[11px] text-slate-500 font-mono">
              Inflow Rate: 12,400 p/hr
            </div>
          </div>

          {/* Evening Peak */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Evening Peak
              </span>
              <span className="text-xs font-bold text-rose-600 dark:text-rose-400 font-mono">
                38.6% Share
              </span>
            </div>
            <div className="text-base font-extrabold text-slate-900 dark:text-white mt-1">
              17:00 - 19:30 EST
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-300 mt-2">
              Commuter wave & leisure shopping. Longest dwell duration and highest realized ticket size.
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-700 text-[11px] text-slate-500 font-mono">
              Inflow Rate: 14,200 p/hr
            </div>
          </div>

          {/* Weekend Surge */}
          <div className="p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/40">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                Weekend Surge
              </span>
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 font-mono">
                +44.8% Volume
              </span>
            </div>
            <div className="text-base font-extrabold text-emerald-900 dark:text-emerald-100 mt-1">
              Saturday & Sunday
            </div>
            <div className="text-xs text-emerald-800/80 dark:text-emerald-300/80 mt-2">
              Extended dwell averaging 52.4 minutes. Multi-brand cross-shopping reaches 64.0%.
            </div>
            <div className="mt-3 pt-2 border-t border-emerald-200/60 dark:border-emerald-800 text-[11px] text-emerald-700 dark:text-emerald-300 font-mono">
              Peak Day: Saturday
            </div>
          </div>
        </div>
      </div>

      {/* Monitored Retail Venues Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-card overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Monitored Retail Venues Table
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Comprehensive telemetry ledger across all active Boston stores with capacity and opportunity ranking.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Zone Filter */}
            <select
              value={zoneFilter}
              onChange={(e) => {
                setZoneFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="All Zones">All Zones</option>
              <option value="Back Bay">Back Bay</option>
              <option value="Downtown Crossing">Downtown Crossing</option>
              <option value="Seaport">Seaport</option>
              <option value="Kendall Sq">Kendall Sq</option>
              <option value="Harvard Sq">Harvard Sq</option>
              <option value="Assembly Row">Assembly Row</option>
              <option value="Fenway">Fenway</option>
            </select>

            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Search venue or code..."
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-teal-500 w-48 sm:w-56"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/75 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px] font-bold border-b border-slate-100 dark:border-slate-800">
                <th
                  onClick={() => handleSort('name')}
                  className="py-3 px-4 cursor-pointer hover:text-teal-600"
                >
                  <div className="flex items-center gap-1.5">
                    Store Name & Code <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('zone')}
                  className="py-3 px-3 cursor-pointer hover:text-teal-600"
                >
                  <div className="flex items-center gap-1.5">
                    District <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('daily_footfall')}
                  className="py-3 px-3 cursor-pointer hover:text-teal-600"
                >
                  <div className="flex items-center gap-1.5">
                    Daily Footfall <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3">Peak Window</th>
                <th className="py-3 px-3">Movement Trend</th>
                <th
                  onClick={() => handleSort('capacity_utilization')}
                  className="py-3 px-3 cursor-pointer hover:text-teal-600"
                >
                  <div className="flex items-center gap-1.5">
                    Capacity % <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('opportunity_score')}
                  className="py-3 px-4 text-right cursor-pointer hover:text-teal-600"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    Opportunity Score <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans">
              {venues.map((v) => (
                <tr
                  key={v.id}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                    <div>{v.name}</div>
                    <div className="text-[10px] font-mono text-slate-400">{v.code} • {v.category}</div>
                  </td>
                  <td className="py-3.5 px-3 text-slate-700 dark:text-slate-300 font-medium">
                    {v.zone}
                  </td>
                  <td className="py-3.5 px-3 font-mono font-bold text-teal-600 dark:text-teal-400">
                    {v.daily_footfall.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-3 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                    {v.peak_window}
                  </td>
                  <td className="py-3.5 px-3 text-emerald-600 dark:text-emerald-400 font-semibold font-mono">
                    {v.movement_trend}
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-teal-500 rounded-full"
                          style={{ width: `${v.capacity_utilization}%` }}
                        />
                      </div>
                      <span className="font-mono text-slate-700 dark:text-slate-300">
                        {v.capacity_utilization}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono">
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/40">
                      {v.opportunity_score} / 100
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <div>
            Showing <b>{venues.length}</b> of <b>{totalVenues}</b> retail venues
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono text-xs">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

