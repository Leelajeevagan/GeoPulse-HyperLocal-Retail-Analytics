import React, { useState, useEffect } from 'react';
import {
  Layers,
  Download,
  Filter,
  DollarSign,
  GraduationCap,
  Users,
  Compass,
  Sparkles,
  TrendingUp,
  Clock,
  DoorOpen,
  MapPin,
  CheckCircle2,
  ChevronDown,
  Info
} from 'lucide-react';
import { LocationAnalyticsMap } from '../components/maps/LocationAnalyticsMap';
import { HourlyPedestrianChart } from '../components/charts/HourlyPedestrianChart';
import { Modal } from '../components/common/Modal';
import {
  Store,
  Competitor,
  TransitHub,
  DemographicsData,
  HourlyVolumeItem,
  GateConversion
} from '../types';
import {
  getDemographics,
  getHourlyVolume,
  getGateConversions,
  triggerQuickExport,
  downloadReportUrl
} from '../services/api';

interface LocationAnalyticsPageProps {
  stores: Store[];
  competitors: Competitor[];
  transitHubs: TransitHub[];
  selectedStore: Store | null;
  onSelectStore: (store: Store) => void;
}

export const LocationAnalyticsPage: React.FC<LocationAnalyticsPageProps> = ({
  stores,
  competitors,
  transitHubs,
  selectedStore,
  onSelectStore,
}) => {
  // Filters
  const [territory, setTerritory] = useState('Greater Boston Metro Area');
  const [geofenceScope, setGeofenceScope] = useState('All Retail Nodes');
  const [timeWindow, setTimeWindow] = useState('7-Day Aggregation');

  // Layer Toggles
  const [showIsochrones, setShowIsochrones] = useState(true);
  const [showCompetitors, setShowCompetitors] = useState(true);
  const [showTransit, setShowTransit] = useState(true);
  const [showLayerMenu, setShowLayerMenu] = useState(false);

  // Bottom Analytics Card Data
  const [demographics, setDemographics] = useState<DemographicsData | null>(null);
  const [hourlyVolume, setHourlyVolume] = useState<HourlyVolumeItem[]>([]);
  const [gateConversions, setGateConversions] = useState<GateConversion[]>([]);

  // Micro-zone modal state
  const [microZoneModalStore, setMicroZoneModalStore] = useState<Store | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const activeStore = selectedStore || stores[0];

  useEffect(() => {
    if (!activeStore) return;
    // Load store-specific or zone-specific telemetry
    getDemographics(territory, activeStore.zone).then(setDemographics).catch(console.error);
    getHourlyVolume(activeStore.id).then(setHourlyVolume).catch(console.error);
    getGateConversions(activeStore.id).then(setGateConversions).catch(console.error);
  }, [activeStore, territory]);

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const result = await triggerQuickExport('tpl-mobility-od', 'GEOJSON');
      window.open(downloadReportUrl(result.report_id), '_blank');
    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Location Analytics & Spatial Profile
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
              Micro-Node Intelligence
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Deep spatial telemetry, isochrone catchment polygons, pedestrian capture rates, and entrance gate conversions.
          </p>
        </div>
      </div>

      {/* Filter Control Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Territory */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Territory
            </label>
            <select
              value={territory}
              onChange={(e) => setTerritory(e.target.value)}
              className="px-3 py-1.5 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="Greater Boston Metro Area">Greater Boston Metro Area</option>
              <option value="Back Bay">Back Bay Core</option>
              <option value="Downtown Crossing">Downtown Crossing</option>
              <option value="Seaport">Seaport Innovation Hub</option>
              <option value="Kendall Sq">Kendall Sq</option>
              <option value="Harvard Sq">Harvard Sq</option>
            </select>
          </div>

          {/* Geofence Scope */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Geofence Scope
            </label>
            <select
              value={geofenceScope}
              onChange={(e) => setGeofenceScope(e.target.value)}
              className="px-3 py-1.5 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="All Retail Nodes">All Retail Nodes (42)</option>
              <option value="Flagship Stores">Flagship Stores Only</option>
              <option value="Standard Stores">Standard Venues Only</option>
              <option value="Express & Kiosks">Express & Kiosks</option>
            </select>
          </div>

          {/* Time Window */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Time Window
            </label>
            <select
              value={timeWindow}
              onChange={(e) => setTimeWindow(e.target.value)}
              className="px-3 py-1.5 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="24-Hour Real-Time">24-Hour Real-Time</option>
              <option value="7-Day Aggregation">7-Day Aggregation</option>
              <option value="30-Day Window">30-Day Window</option>
              <option value="Quarterly">Quarterly</option>
            </select>
          </div>
        </div>

        {/* Action Buttons: Layer Stack & Export */}
        <div className="flex items-center gap-2.5 relative">
          <div className="relative">
            <button
              onClick={() => setShowLayerMenu(!showLayerMenu)}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-2 transition-colors"
            >
              <Layers className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>Layer Stack</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {showLayerMenu && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-3 z-30 space-y-2 text-xs">
                <div className="font-bold text-[10px] uppercase tracking-wider text-slate-400 mb-1">
                  Toggle Geospatial Overlays
                </div>
                <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={showIsochrones}
                    onChange={(e) => setShowIsochrones(e.target.checked)}
                    className="rounded text-teal-600 focus:ring-0"
                  />
                  <span>Walking Isochrones (5-15m)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={showCompetitors}
                    onChange={(e) => setShowCompetitors(e.target.checked)}
                    className="rounded text-teal-600 focus:ring-0"
                  />
                  <span>Competitor Locations</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={showTransit}
                    onChange={(e) => setShowTransit(e.target.checked)}
                    className="rounded text-teal-600 focus:ring-0"
                  />
                  <span>MBTA Transit Hubs</span>
                </label>
              </div>
            )}
          </div>

          <button
            onClick={handleExportData}
            disabled={isExporting}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-teal-600 dark:hover:bg-teal-500 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'Exporting...' : 'Export Geospatial Data'}</span>
          </button>
        </div>
      </div>

      {/* Map Section with Floating Spatial Node Profile */}
      <LocationAnalyticsMap
        stores={stores}
        competitors={competitors}
        transitHubs={transitHubs}
        selectedStore={activeStore}
        onSelectStore={onSelectStore}
        onAnalyzeMicroZone={(s) => setMicroZoneModalStore(s)}
        showIsochrones={showIsochrones}
        showCompetitors={showCompetitors}
        showTransit={showTransit}
      />

      {/* 3 Bottom Analytics Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card 1: Demographic & Affluence */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Demographic & Affluence
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                Census Block
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Micro-catchment socio-economic telemetry for {activeStore?.zone || 'Back Bay'}.
            </p>

            <div className="space-y-3.5">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Median Household Income</div>
                  <div className="text-lg font-extrabold text-slate-900 dark:text-white font-mono mt-0.5">
                    {demographics?.median_household_income_fmt || '$118,400'}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">+14.5% vs Metro</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Young Professionals</div>
                  <div className="text-base font-extrabold text-slate-900 dark:text-white font-mono mt-0.5">
                    {demographics?.young_professionals_pct || 64.2}%
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">Ages 22 - 38</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Higher Degree Attain.</div>
                  <div className="text-base font-extrabold text-slate-900 dark:text-white font-mono mt-0.5">
                    {demographics?.higher_degree_pct || 78.5}%
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">Bachelor's or Postgrad</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-100 dark:border-teal-900/40">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-teal-900 dark:text-teal-200">
                    Retail Spending Propensity
                  </span>
                  <span className="text-xs font-bold text-teal-700 dark:text-teal-300 font-mono">
                    Index {demographics?.retail_propensity_index || 142}
                  </span>
                </div>
                <p className="text-[11px] text-teal-800/80 dark:text-teal-300/80 mt-1">
                  {demographics?.retail_propensity_label || 'High Propensity (Index 142)'} — Daytime population: {demographics?.daytime_population?.toLocaleString() || '76,900'}.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
            Source: U.S. Census ACS 5-Year + Spatial GeoPulse Mesh
          </div>
        </div>

        {/* Card 2: Hourly Pedestrian Volume */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                Hourly Pedestrian Volume
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-300">
                24-Hour Profile
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
              Temporal throughput curve highlighting lunch waves and commuter velocity peaks.
            </p>

            <HourlyPedestrianChart data={hourlyVolume} />

            <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-cyan-50 dark:bg-cyan-950/40 text-cyan-900 dark:text-cyan-300">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 shrink-0" />
                <div className="min-w-0">
                  <div className="font-bold text-[11px]">Lunch Wave</div>
                  <div className="text-[10px] opacity-80">12:00 - 14:00 EST</div>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-300">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
                <div className="min-w-0">
                  <div className="font-bold text-[11px]">Commuter Peak</div>
                  <div className="text-[10px] opacity-80">17:00 - 19:30 EST</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Peak Hourly Velocity:</span>
            <span className="font-bold font-mono text-slate-900 dark:text-white">2,600 visitors/hr</span>
          </div>
        </div>

        {/* Card 3: Entrance Gate Conversion */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <DoorOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Entrance Gate Conversion
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300">
                4 Gate Portals
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Pedestrian inflow portal attribution and direct store capture conversion ratios.
            </p>

            <div className="space-y-3">
              {gateConversions.map((gate) => (
                <div
                  key={gate.id}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800/80"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 dark:text-white">
                      {gate.gate_name}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300">
                      {gate.performance_score}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-2 text-xs">
                    <span className="text-slate-500 dark:text-slate-400">Total Inflows:</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                      {gate.total_inflows.toLocaleString()} pedestrians
                    </span>
                  </div>

                  <div className="mt-1.5 flex items-center gap-2">
                    <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-teal-500 rounded-full"
                        style={{ width: `${gate.store_capture_pct * 2.5}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-bold font-mono text-teal-600 dark:text-teal-400">
                      {gate.store_capture_pct}% capture
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Optimal Inflow Portal:</span>
            <span className="font-bold text-teal-600 dark:text-teal-400">Transit Concourse Link (31.8%)</span>
          </div>
        </div>
      </div>

      {/* Micro-Zone Analysis Modal */}
      {microZoneModalStore && (
        <Modal
          isOpen={!!microZoneModalStore}
          onClose={() => setMicroZoneModalStore(null)}
          title={`Micro-Zone Spatial Telemetry: ${microZoneModalStore.name}`}
          subtitle={`Node Code: ${microZoneModalStore.code} • Zone: ${microZoneModalStore.zone} • Format: ${microZoneModalStore.format}`}
          maxWidth="max-w-3xl"
        >
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <div className="text-[10px] font-bold uppercase text-slate-400">Real-Time Footfall</div>
                <div className="text-xl font-black text-teal-600 dark:text-teal-400 font-mono mt-1">
                  {microZoneModalStore.real_time_footfall.toLocaleString()}
                  <span className="text-xs font-sans text-slate-400 ml-1">visitors/hr</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1">Capacity: {microZoneModalStore.capacity_utilization}%</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <div className="text-[10px] font-bold uppercase text-slate-400">Capture Ratio</div>
                <div className="text-xl font-black text-white font-mono mt-1">
                  {microZoneModalStore.pedestrian_capture_ratio}%
                </div>
                <div className="text-[11px] text-emerald-500 mt-1">High Propensity Node</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <div className="text-[10px] font-bold uppercase text-slate-400">Gross Sales MTD</div>
                <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1">
                  ${(microZoneModalStore.gross_sales_mtd / 1000).toFixed(0)}k
                </div>
                <div className="text-[11px] text-slate-500 mt-1">Avg Dwell: {microZoneModalStore.average_dwell_time}m</div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 text-white space-y-2">
              <h4 className="font-bold text-sm text-teal-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Algorithmic Micro-Zone Recommendation
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Based on current 15-minute isochrone boundary data, <b>{microZoneModalStore.name}</b> captures 22.8% of pedestrian throughput exiting the adjacent MBTA terminal. Competitor pressure from nearby retail points indicates an opportunity to extend evening window hours to capture the 17:30 - 19:30 commuter surge.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setMicroZoneModalStore(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
              >
                Close Profile
              </button>
              <button
                onClick={() => {
                  handleExportData();
                  setMicroZoneModalStore(null);
                }}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Export Node Telemetry (GeoJSON)
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

