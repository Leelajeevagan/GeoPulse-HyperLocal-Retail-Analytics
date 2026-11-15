import React, { useState } from 'react';
import {
  Users,
  Store as StoreIcon,
  DollarSign,
  Compass,
  Flame,
  TrendingUp,
  AlertOctagon,
  ArrowUpRight,
  ShieldAlert,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { KpiCard } from '../components/common/KpiCard';
import { AlertBanner } from '../components/common/AlertBanner';
import { GeospatialDemandMap } from '../components/maps/GeospatialDemandMap';
import { FootfallSalesCorrelationChart } from '../components/charts/FootfallSalesCorrelationChart';
import { CategoryDonutChart } from '../components/charts/CategoryDonutChart';
import {
  Store,
  Competitor,
  SpatialAlert,
  ZonePerformance,
  OverviewKpisData,
  SalesCorrelationData,
  CategoryShareItem,
} from '../types';

interface OverviewPageProps {
  kpis: OverviewKpisData | null;
  stores: Store[];
  competitors: Competitor[];
  alerts: SpatialAlert[];
  topZones: ZonePerformance[];
  salesCorrelation: SalesCorrelationData | null;
  categoryShare: CategoryShareItem[];
  onDispatchAlert: (id: number) => void;
  onDismissAlert: (id: number) => void;
  onSelectStore: (store: Store) => void;
  selectedStore: Store | null;
  onNavigateToLocation: (zoneName?: string) => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({
  kpis,
  stores,
  competitors,
  alerts,
  topZones,
  salesCorrelation,
  categoryShare,
  onDispatchAlert,
  onDismissAlert,
  onSelectStore,
  selectedStore,
  onNavigateToLocation,
}) => {
  const [dispatchingId, setDispatchingId] = useState<number | null>(null);

  const handleDispatch = async (id: number) => {
    setDispatchingId(id);
    await onDispatchAlert(id);
    setDispatchingId(null);
  };

  const activeAlerts = alerts.filter((a) => a.status !== 'Dismissed');

  return (
    <div className="space-y-6">
      {/* Page Title & Status Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Network Command Overview
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
              Live Mesh Stream
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time multi-district spatial telemetry, retail footfall elasticity, and predictive catchment dynamics across Greater Boston.
          </p>
        </div>

        {/* Live System Banner */}
        <div className="flex items-center gap-2 self-start sm:self-auto px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-xs text-slate-600 dark:text-slate-300">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Synthesizing <b>42 Nodes</b> • Telemetry Latency: <b>32ms</b></span>
        </div>
      </div>

      {/* 5 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        <KpiCard
          title="Total Customer Visits"
          value={kpis?.total_customer_visits ? kpis.total_customer_visits.toLocaleString('en-US') : '3,842,910'}
          change={kpis?.total_customer_visits_pct || 14.2}
          subtext="vs. prior 30-day cycle"
          icon={Users}
          sparkline={kpis?.visits_sparkline}
          colorScheme="teal"
        />

        <KpiCard
          title="Stores Monitored"
          value={kpis?.stores_monitored_status || '42 Active'}
          change={kpis?.network_health_pct ? Number(((kpis.network_health_pct - 95)).toFixed(1)) : 3.4}
          subtext="99.2% network uptime SLA"
          icon={StoreIcon}
          sparkline={kpis?.stores_sparkline}
          colorScheme="blue"
          badge="100% Operational"
        />

        <KpiCard
          title="Tracked Revenue"
          value={kpis?.tracked_revenue_formatted || '$28.45M'}
          change={kpis?.tracked_revenue_pct || 8.6}
          subtext="Cross-correlated with POS"
          icon={DollarSign}
          sparkline={kpis?.revenue_sparkline}
          colorScheme="emerald"
        />

        <KpiCard
          title="Avg Footfall Density"
          value={kpis?.average_footfall_density || 184}
          unit={kpis?.footfall_density_unit || 'p/100m²'}
          change={kpis?.footfall_density_pct || 5.3}
          subtext="vs. Boston metro baseline"
          icon={Compass}
          sparkline={kpis?.density_sparkline}
          colorScheme="indigo"
        />

        <KpiCard
          title="Prime Hotspots"
          value={kpis?.prime_hotspots ? (typeof kpis.prime_hotspots === 'string' && kpis.prime_hotspots.includes(' ') ? kpis.prime_hotspots.split(' ')[0] : kpis.prime_hotspots) : '12'}
          unit="Identified"
          change={kpis?.prime_hotspots_pct || 25.0}
          subtext={kpis?.prime_hotspots_sub || '3 emerging micro-zones'}
          icon={Flame}
          sparkline={kpis?.hotspots_sparkline}
          colorScheme="amber"
          badge="High Velocity"
        />
      </div>

      {/* Main Geospatial Demand Mesh Map */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Compass className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>Geospatial Demand Mesh & Store Locations</span>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/50">
                Zero API Key Required • Free OSM Engine
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Interactive Leaflet GIS map with 42 store locations, heatmaps, isochrones, and zero external API key requirements.
            </p>
          </div>

          <button
            onClick={() => onNavigateToLocation()}
            className="text-xs font-semibold text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 flex items-center gap-1 transition-colors"
          >
            <span>Deep Location Analytics</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <GeospatialDemandMap
          stores={stores}
          competitors={competitors}
          onSelectStore={onSelectStore}
          selectedStore={selectedStore}
        />
      </div>

      {/* Middle Row: Top Performing Zones & Anomalies / Spatial Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Top Performing Zones (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-card flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Top Performing Retail Zones
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200/60 dark:border-teal-800/40">
                  {topZones.length} Key Districts
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Ranked by aggregated customer visits, gross realized revenue, and capacity utilization.
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 shrink-0">
              Boston Metro
            </span>
          </div>

          {/* Table Container without awkward empty space */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="py-2.5 px-3">Rank & Zone</th>
                  <th className="py-2.5 px-3">Stores</th>
                  <th className="py-2.5 px-3">Customer Visits</th>
                  <th className="py-2.5 px-3">Revenue MTD</th>
                  <th className="py-2.5 px-3">Capacity</th>
                  <th className="py-2.5 px-3 text-right">YoY Growth</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans">
                {topZones.map((z, idx) => (
                  <tr
                    key={z.id}
                    onClick={() => onNavigateToLocation(z.zone_name)}
                    className="hover:bg-teal-50/40 dark:hover:bg-slate-800/60 cursor-pointer transition-colors group"
                  >
                    <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-black flex items-center justify-center font-mono">
                        {idx + 1}
                      </span>
                      <span className="group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                        {z.zone_name}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                      {z.store_count || (idx < 2 ? 8 : 5)} nodes
                    </td>
                    <td className="py-2.5 px-3 font-mono font-semibold text-slate-800 dark:text-slate-200">
                      {z.customer_visits.toLocaleString('en-US')}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900 dark:text-white">
                      ${(z.revenue / 1000000).toFixed(2)}M
                    </td>
                    <td className="py-2.5 px-3 font-mono">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shrink-0">
                          <div
                            className="h-full bg-teal-500 rounded-full transition-all"
                            style={{ width: `${Math.min(100, z.capacity_utilization)}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                          {z.capacity_utilization}%
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      +{z.yoy_performance}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer Bar */}
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Aggregated across Greater Boston commercial retail nodes</span>
            <button
              onClick={() => onNavigateToLocation()}
              className="text-teal-600 hover:text-teal-700 dark:text-teal-400 font-bold flex items-center gap-1 transition-colors"
            >
              Analyze All Zones <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Anomalies and Spatial Alerts (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-card flex flex-col">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-500" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Anomalies & Spatial Alerts
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                {activeAlerts.length} Active
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Algorithmic detection of understaffing spikes, cannibalization friction, and surge volumes.
            </p>

            <div className="space-y-3">
              {activeAlerts.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  All active alerts have been dispatched or dismissed. Systems nominal.
                </div>
              ) : (
                activeAlerts.map((alt) => (
                  <AlertBanner
                    key={alt.id}
                    alert={alt}
                    onDispatch={handleDispatch}
                    onDismiss={onDismissAlert}
                    isDispatching={dispatchingId === alt.id}
                  />
                ))
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Automated Telemetry Daemon</span>
            <span className="font-mono text-emerald-500">Live Listening • Port 8000</span>
          </div>
        </div>
      </div>

      {/* Bottom Row: Footfall vs Realized Sales Correlation & Category Footfall Share */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <FootfallSalesCorrelationChart data={salesCorrelation} />
        </div>
        <div className="lg:col-span-4">
          <CategoryDonutChart data={categoryShare} />
        </div>
      </div>
    </div>
  );
};

