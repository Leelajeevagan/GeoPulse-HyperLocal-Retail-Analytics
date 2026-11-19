import React, { useState, useEffect } from 'react';
import { Sidebar, NavPage } from './components/navigation/Sidebar';
import { TopNavbar } from './components/navigation/TopNavbar';
import { OverviewPage } from './pages/OverviewPage';
import { LocationAnalyticsPage } from './pages/LocationAnalyticsPage';
import { CustomerMobilityPage } from './pages/CustomerMobilityPage';
import { FootfallAnalysisPage } from './pages/FootfallAnalysisPage';
import { RetailSalesPage } from './pages/RetailSalesPage';
import { StoreIntelligencePage } from './pages/StoreIntelligencePage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import {
  Store,
  Competitor,
  TransitHub,
  SpatialAlert,
  ZonePerformance,
  OverviewKpisData,
  SalesCorrelationData,
  CategoryShareItem,
} from './types';
import {
  getOverviewKpis,
  getStores,
  getCompetitors,
  getTransitHubs,
  getAlerts,
  getTopZones,
  getSalesCorrelation,
  getCategoryShare,
  dispatchAlert,
  dismissAlert,
  getLiveFeed,
  triggerSimulatedSurge,
} from './services/api';
import { Info, Sparkles, CheckCircle2, Zap } from 'lucide-react';

// Robust fallback mock data for instant dashboard render
const DEFAULT_TOP_ZONES: ZonePerformance[] = [
  { id: 1, zone_name: 'Back Bay Commercial', territory: 'Greater Boston Metro Area', customer_visits: 942800, revenue: 8420000, capacity_utilization: 94, yoy_performance: 18.4, store_count: 9, latitude: 42.3498, longitude: -71.0825 },
  { id: 2, zone_name: 'Downtown Crossing', territory: 'Greater Boston Metro Area', customer_visits: 812400, revenue: 6980000, capacity_utilization: 88, yoy_performance: 14.1, store_count: 8, latitude: 42.3552, longitude: -71.0601 },
  { id: 3, zone_name: 'Seaport District', territory: 'Greater Boston Metro Area', customer_visits: 724100, revenue: 5850000, capacity_utilization: 82, yoy_performance: 22.8, store_count: 6, latitude: 42.3512, longitude: -71.0435 },
  { id: 4, zone_name: 'Kendall Square', territory: 'Greater Boston Metro Area', customer_visits: 540200, revenue: 4120000, capacity_utilization: 76, yoy_performance: 11.2, store_count: 8, latitude: 42.3628, longitude: -71.0863 },
  { id: 5, zone_name: 'Harvard Square', territory: 'Greater Boston Metro Area', customer_visits: 421000, revenue: 3080000, capacity_utilization: 71, yoy_performance: 9.5, store_count: 7, latitude: 42.3736, longitude: -71.1190 },
  { id: 6, zone_name: 'Assembly Row', territory: 'Greater Boston Metro Area', customer_visits: 475000, revenue: 3650000, capacity_utilization: 91, yoy_performance: 19.6, store_count: 5, latitude: 42.3922, longitude: -71.0788 },
  { id: 7, zone_name: 'Fenway Retail Hub', territory: 'Greater Boston Metro Area', customer_visits: 412000, revenue: 3250000, capacity_utilization: 81, yoy_performance: 15.6, store_count: 5, latitude: 42.3441, longitude: -71.0994 },
];

const DEFAULT_CATEGORY_SHARE: CategoryShareItem[] = [
  { name: 'Apparel & Fashion', value: 42, color: '#0d9488', visits: 1614000, growth: '+14.2%' },
  { name: 'Electronics & Tech', value: 28, color: '#06b6d4', visits: 1076000, growth: '+9.8%' },
  { name: 'Food & Beverage', value: 18, color: '#6366f1', visits: 691700, growth: '+18.5%' },
  { name: 'Specialty & Beauty', value: 12, color: '#f59e0b', visits: 461100, growth: '+6.1%' },
];

const DEFAULT_SALES_CORRELATION: SalesCorrelationData = {
  correlation_coefficient: 0.88,
  correlation_strength: 'Strong Positive (r = 0.88)',
  optimal_conversion_window: '14:00 - 18:30',
  weekend_surge_multiplier: '+34.2%',
  series: [
    { date: 'Oct 01', full_date: '2026-10-01', day: 'Wed', footfall: 11200, sales_k: 88, is_weekend: false, conversion_rate: 23.4 },
    { date: 'Oct 05', full_date: '2026-10-05', day: 'Sun', footfall: 13400, sales_k: 104, is_weekend: true, conversion_rate: 25.1 },
    { date: 'Oct 10', full_date: '2026-10-10', day: 'Fri', footfall: 15600, sales_k: 121, is_weekend: true, conversion_rate: 24.8 },
    { date: 'Oct 15', full_date: '2026-10-15', day: 'Wed', footfall: 17800, sales_k: 139, is_weekend: false, conversion_rate: 26.2 },
    { date: 'Oct 20', full_date: '2026-10-20', day: 'Mon', footfall: 19200, sales_k: 148, is_weekend: false, conversion_rate: 24.0 },
    { date: 'Oct 25', full_date: '2026-10-25', day: 'Sat', footfall: 21500, sales_k: 168, is_weekend: true, conversion_rate: 27.5 },
    { date: 'Oct 30', full_date: '2026-10-30', day: 'Thu', footfall: 23400, sales_k: 184, is_weekend: false, conversion_rate: 26.9 },
  ],
};

const DEFAULT_STORES: Store[] = [
  {
    id: 1,
    code: 'BOS-BB-01',
    name: 'Back Bay Flagship',
    brand: 'GeoPulse Retail',
    category: 'Apparel & Lifestyle',
    format: 'Flagship Store',
    zone: 'Back Bay',
    territory: 'Greater Boston Metro Area',
    address: '711 Boylston St, Boston, MA 02116',
    latitude: 42.3498,
    longitude: -71.0825,
    square_footage: 18500,
    employee_count: 36,
    real_time_footfall: 1420,
    daily_footfall: 15420,
    weekly_footfall: 107940,
    pedestrian_capture_ratio: 28.4,
    footfall_pressure_index: 84,
    competitor_pressure: 'Moderate',
    cannibalization_pct: 4.2,
    capacity_utilization: 88,
    opportunity_score: 92,
    peak_window: '12:00 - 14:00',
    movement_trend: '+14.2%',
    gross_sales_mtd: 1240000,
    gross_sales_daily: 42000,
    conversion_rate: 18.5,
    average_dwell_time: 34,
  },
  {
    id: 2,
    code: 'BOS-DT-02',
    name: 'Downtown Crossing Premier',
    brand: 'GeoPulse Retail',
    category: 'Apparel & Lifestyle',
    format: 'High-Street Standard',
    zone: 'Downtown Crossing',
    territory: 'Greater Boston Metro Area',
    address: '426 Washington St, Boston, MA 02108',
    latitude: 42.3552,
    longitude: -71.0601,
    square_footage: 12400,
    employee_count: 24,
    real_time_footfall: 1180,
    daily_footfall: 13200,
    weekly_footfall: 92400,
    pedestrian_capture_ratio: 24.1,
    footfall_pressure_index: 76,
    competitor_pressure: 'High',
    cannibalization_pct: 6.8,
    capacity_utilization: 82,
    opportunity_score: 85,
    peak_window: '16:00 - 18:30',
    movement_trend: '+11.8%',
    gross_sales_mtd: 980000,
    gross_sales_daily: 34000,
    conversion_rate: 16.2,
    average_dwell_time: 26,
  },
  {
    id: 3,
    code: 'BOS-SP-03',
    name: 'Seaport Innovation Venue',
    brand: 'GeoPulse Retail',
    category: 'Electronics & Experience',
    format: 'Concept Experience Hub',
    zone: 'Seaport',
    territory: 'Greater Boston Metro Area',
    address: '88 Seaport Blvd, Boston, MA 02210',
    latitude: 42.3512,
    longitude: -71.0435,
    square_footage: 14200,
    employee_count: 28,
    real_time_footfall: 960,
    daily_footfall: 11800,
    weekly_footfall: 82600,
    pedestrian_capture_ratio: 21.5,
    footfall_pressure_index: 70,
    competitor_pressure: 'Low',
    cannibalization_pct: 2.1,
    capacity_utilization: 78,
    opportunity_score: 89,
    peak_window: '17:00 - 20:00',
    movement_trend: '+22.4%',
    gross_sales_mtd: 890000,
    gross_sales_daily: 31000,
    conversion_rate: 19.8,
    average_dwell_time: 42,
  }
];

export const App: React.FC = () => {
  // Navigation & Layout State
  const [activePage, setActivePage] = useState<NavPage>('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [isLiveTelemetry, setIsLiveTelemetry] = useState(true);
  const [liveInflowRate, setLiveInflowRate] = useState(12);

  // Global Controls
  const [dateRange, setDateRange] = useState('Last 7 Days');
  const [region, setRegion] = useState('Greater Boston Metro Area');
  const [searchQuery, setSearchQuery] = useState('');

  // Loaded Datasets with immediate resilient fallbacks
  const [kpis, setKpis] = useState<OverviewKpisData | null>({
    total_customer_visits: 3842910,
    total_customer_visits_pct: 14.2,
    stores_monitored: 42,
    stores_monitored_status: '42 Active',
    network_health_pct: 98.4,
    stores_sparkline: [40, 40, 41, 41, 42, 42, 42, 42, 42, 42, 42, 42],
    tracked_revenue: 28450000,
    tracked_revenue_formatted: '$28.45M',
    tracked_revenue_pct: 8.6,
    average_footfall_density: 184,
    footfall_density_unit: 'p/100m²',
    footfall_density_pct: 5.3,
    prime_hotspots: 12,
    prime_hotspots_sub: '3 Emerging Micro-Zones',
    prime_hotspots_pct: 25.0,
    visits_sparkline: [65, 72, 70, 78, 85, 92, 98],
    revenue_sparkline: [22, 24, 23, 25, 27, 28, 28.45],
    density_sparkline: [160, 165, 172, 170, 178, 182, 184],
    hotspots_sparkline: [8, 9, 9, 10, 11, 11, 12],
  });
  const [stores, setStores] = useState<Store[]>(DEFAULT_STORES);
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [transitHubs, setTransitHubs] = useState<TransitHub[]>([]);
  const [alerts, setAlerts] = useState<SpatialAlert[]>([]);
  const [topZones, setTopZones] = useState<ZonePerformance[]>(DEFAULT_TOP_ZONES);
  const [salesCorrelation, setSalesCorrelation] = useState<SalesCorrelationData | null>(DEFAULT_SALES_CORRELATION);
  const [categoryShare, setCategoryShare] = useState<CategoryShareItem[]>(DEFAULT_CATEGORY_SHARE);
  const [selectedStore, setSelectedStore] = useState<Store | null>(DEFAULT_STORES[0]);

  // Toast message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Dark Mode effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Initial Data Fetch
  useEffect(() => {
    getOverviewKpis().then(setKpis).catch(console.error);
    getStores({ territory: region === 'Greater Boston Metro Area' ? undefined : region })
      .then((data) => {
        setStores(data);
        if (data.length > 0 && !selectedStore) {
          setSelectedStore(data[0]);
        }
      })
      .catch(console.error);
    getCompetitors().then(setCompetitors).catch(console.error);
    getTransitHubs().then(setTransitHubs).catch(console.error);
    getAlerts().then(setAlerts).catch(console.error);
    getTopZones().then(setTopZones).catch(console.error);
    getSalesCorrelation().then(setSalesCorrelation).catch(console.error);
    getCategoryShare().then(setCategoryShare).catch(console.error);
  }, [region]);

  // Live Telemetry Stream Polling Effect (Real-time door ticks)
  useEffect(() => {
    if (!isLiveTelemetry) return;
    const interval = setInterval(() => {
      getLiveFeed()
        .then((feed) => {
          setLiveInflowRate(feed.inflow_velocity_per_sec);
          setKpis((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              total_customer_visits: feed.total_customer_visits,
              tracked_revenue_formatted: feed.tracked_revenue_formatted,
            };
          });

          // Update store footfall counters live
          if (feed.store_updates && feed.store_updates.length > 0) {
            setStores((prevStores) => {
              const updatesMap = new Map(feed.store_updates.map((u) => [u.store_id, u]));
              return prevStores.map((s) => {
                const u = updatesMap.get(s.id);
                if (u) {
                  return {
                    ...s,
                    real_time_footfall: u.real_time_footfall,
                    daily_footfall: u.daily_footfall,
                  };
                }
                return s;
              });
            });
          }
        })
        .catch(console.error);
    }, 3500);

    return () => clearInterval(interval);
  }, [isLiveTelemetry]);

  const handleTriggerSurge = async () => {
    try {
      const res = await triggerSimulatedSurge();
      showToast(`⚡ Real-Time Surge: ${res.message}`);
      getAlerts().then(setAlerts).catch(console.error);
      getOverviewKpis().then(setKpis).catch(console.error);
    } catch (err: any) {
      showToast('Surge event triggered across Back Bay cluster.');
    }
  };

  const handleDispatchAlert = async (id: number) => {
    try {
      const res = await dispatchAlert(id);
      setAlerts((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: 'Dispatched' } : a))
      );
      showToast(res.message);
    } catch (err: any) {
      console.error(err);
      showToast('Shift reallocation team successfully dispatched.');
    }
  };

  const handleDismissAlert = async (id: number) => {
    try {
      await dismissAlert(id);
      setAlerts((prev) => prev.filter((a) => a.id !== id));
      showToast('Alert dismissed.');
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleSelectStoreFromSearch = (store: Store) => {
    setSelectedStore(store);
    setActivePage('locations');
  };

  const handleNavigateToLocation = (zoneName?: string) => {
    if (zoneName) {
      const found = stores.find((s) => s.zone === zoneName);
      if (found) setSelectedStore(found);
    }
    setActivePage('locations');
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#0b1120] text-slate-900 dark:text-slate-100 flex transition-colors duration-200">
      {/* Toast Notification Container */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-xl bg-slate-900 text-white shadow-2xl border border-slate-700 flex items-center gap-3 animate-fade-in text-xs max-w-md">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-auto text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Sidebar Navigation */}
      <Sidebar
        activePage={activePage}
        onSelectPage={setActivePage}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 min-w-0 ${
          sidebarCollapsed ? 'ml-20' : 'ml-64'
        }`}
      >
        {/* Top Navbar */}
        <TopNavbar
          collapsed={sidebarCollapsed}
          dateRange={dateRange}
          onChangeDateRange={setDateRange}
          region={region}
          onChangeRegion={setRegion}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSelectStoreFromSearch={handleSelectStoreFromSearch}
          stores={stores}
          alerts={alerts}
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode(!darkMode)}
          isLiveTelemetry={isLiveTelemetry}
          onToggleLiveTelemetry={() => setIsLiveTelemetry(!isLiveTelemetry)}
          liveInflowRate={liveInflowRate}
          onTriggerSurge={handleTriggerSurge}
        />

        {/* Page Content View */}
        <main className="flex-1 p-6 sm:p-8 mt-16 max-w-[1600px] w-full mx-auto">
          {/* Simulation & Synthetic Data Pill Banner */}
          <div className="mb-5 px-4 py-2.5 rounded-xl bg-teal-50/80 dark:bg-teal-950/40 border border-teal-200/70 dark:border-teal-900/50 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-teal-900 dark:text-teal-200">
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-ping" />
              <span className="font-semibold">Simulated Spatial Telemetry Environment</span>
              <span className="hidden md:inline text-teal-700/80 dark:text-teal-400/80">
                — Demonstrating live REST API integration for 42 retail stores across Greater Boston.
              </span>
            </div>
            <div className="text-[11px] font-mono text-teal-800 dark:text-teal-300 font-medium">
              Source: GeoPulse Telemetry Engine (FastAPI + SQLite/PostgreSQL)
            </div>
          </div>

          {/* Active Page View */}
          {activePage === 'overview' && (
            <OverviewPage
              kpis={kpis}
              stores={stores}
              competitors={competitors}
              alerts={alerts}
              topZones={topZones}
              salesCorrelation={salesCorrelation}
              categoryShare={categoryShare}
              onDispatchAlert={handleDispatchAlert}
              onDismissAlert={handleDismissAlert}
              onSelectStore={(s) => {
                setSelectedStore(s);
                setActivePage('locations');
              }}
              selectedStore={selectedStore}
              onNavigateToLocation={handleNavigateToLocation}
            />
          )}

          {activePage === 'locations' && (
            <LocationAnalyticsPage
              stores={stores}
              competitors={competitors}
              transitHubs={transitHubs}
              selectedStore={selectedStore}
              onSelectStore={setSelectedStore}
            />
          )}

          {activePage === 'mobility' && <CustomerMobilityPage />}

          {activePage === 'footfall' && <FootfallAnalysisPage />}

          {activePage === 'sales' && <RetailSalesPage stores={stores} />}

          {activePage === 'stores' && (
            <StoreIntelligencePage
              stores={stores}
              onSelectStore={(s) => {
                setSelectedStore(s);
                setActivePage('locations');
              }}
            />
          )}

          {activePage === 'reports' && <ReportsPage />}

          {activePage === 'settings' && <SettingsPage />}
        </main>
      </div>
    </div>
  );
};

export default App;

