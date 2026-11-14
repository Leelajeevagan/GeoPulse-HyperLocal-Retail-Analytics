import {
  Store,
  Competitor,
  TransitHub,
  SpatialAlert,
  ZonePerformance,
  GateConversion,
  ExportLedgerItem,
  OverviewKpisData,
  SalesCorrelationData,
  CategoryShareItem,
  HourlyVolumeItem,
  HeatmapDay,
  MacroTrajectoryItem,
  DemographicsData,
  ReportTemplate
} from '../types';

// Dynamic API Base URL resolution:
// 1. User-customized localStorage override
// 2. Vite environment variable (import.meta.env.VITE_API_URL)
// 3. Fallback to '/api' (proxied by Vite) or direct 'http://127.0.0.1:8000/api'
export const getApiBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    const custom = localStorage.getItem('geopulse_api_base');
    if (custom) return custom.replace(/\/+$/, '');
  }
  const envUrl = (import.meta as any).env?.VITE_API_URL;
  if (envUrl) return envUrl.replace(/\/+$/, '');
  return '/api';
};

export const setApiBaseUrl = (url: string) => {
  if (typeof window !== 'undefined') {
    if (!url || url.trim() === '/api') {
      localStorage.removeItem('geopulse_api_base');
    } else {
      localStorage.setItem('geopulse_api_base', url.trim().replace(/\/+$/, ''));
    }
  }
};

async function fetchJson<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const base = getApiBaseUrl();
  const url = `${base}${endpoint}`;
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });
    if (!response.ok) {
      throw new Error(`API error ${response.status}: ${response.statusText}`);
    }
    return response.json();
  } catch (error) {
    // If relative /api failed (e.g. running outside vite proxy), fallback to direct port 8000
    if (base === '/api') {
      const fallbackUrl = `http://127.0.0.1:8000/api${endpoint}`;
      const fbResponse = await fetch(fallbackUrl, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });
      if (!fbResponse.ok) {
        throw new Error(`API fallback error ${fbResponse.status}: ${fbResponse.statusText}`);
      }
      return fbResponse.json();
    }
    throw error;
  }
}

// Health probe to test API connectivity & latency
export const checkApiHealth = async (testUrl?: string): Promise<{ connected: boolean; latencyMs: number; statusText: string }> => {
  const start = performance.now();
  const base = testUrl ? testUrl.replace(/\/+$/, '') : getApiBaseUrl();
  try {
    const healthEndpoint = base.endsWith('/api') ? `${base.replace(/\/api$/, '')}/api/health` : `${base}/health`;
    const res = await fetch(healthEndpoint);
    const latencyMs = Math.round(performance.now() - start);
    if (res.ok) {
      return { connected: true, latencyMs, statusText: 'Connected & Healthy' };
    }
    return { connected: false, latencyMs, statusText: `HTTP ${res.status} Error` };
  } catch (err: any) {
    // Also try direct 127.0.0.1:8000
    try {
      const directRes = await fetch('http://127.0.0.1:8000/api/health');
      const latencyMs = Math.round(performance.now() - start);
      if (directRes.ok) {
        return { connected: true, latencyMs, statusText: 'Connected (Direct Port 8000)' };
      }
    } catch {}
    return { connected: false, latencyMs: 0, statusText: err.message || 'Connection Refused' };
  }
};

// Overview API
export const getOverviewKpis = () => fetchJson<OverviewKpisData>('/overview/kpis');
export const getLiveFeed = () => fetchJson<{
  timestamp: string;
  total_customer_visits: number;
  tracked_revenue: number;
  tracked_revenue_formatted: string;
  inflow_velocity_per_sec: number;
  sales_velocity_per_sec: number;
  active_alerts_count: number;
  store_updates: Array<{ store_id: number; code: string; name: string; real_time_footfall: number; daily_footfall: number; delta: number }>;
  network_status: string;
}>('/overview/live-feed');
export const triggerSimulatedSurge = () => fetchJson<{ status: string; message: string; store?: string; zone?: string; alert_id?: number }>('/overview/simulate-surge', {
  method: 'POST',
});
export const getTopZones = () => fetchJson<ZonePerformance[]>('/overview/top-zones');
export const getAlerts = () => fetchJson<SpatialAlert[]>('/overview/alerts');
export const dispatchAlert = (alertId: number) =>
  fetchJson<{ status: string; message: string; alert_id: number }>(`/overview/alerts/${alertId}/dispatch`, {
    method: 'POST',
  });
export const dismissAlert = (alertId: number) =>
  fetchJson<{ status: string; message: string; alert_id: number }>(`/overview/alerts/${alertId}/dismiss`, {
    method: 'POST',
  });
export const getSalesCorrelation = () => fetchJson<SalesCorrelationData>('/overview/sales-correlation');
export const getCategoryShare = () => fetchJson<CategoryShareItem[]>('/overview/category-share');
export const getDemandMesh = () => fetchJson<any>('/overview/demand-mesh');

// Location Analytics API
export const getStores = (params?: { territory?: string; zone?: string; category?: string; format?: string; search?: string }) => {
  const query = new URLSearchParams();
  if (params?.territory) query.append('territory', params.territory);
  if (params?.zone) query.append('zone', params.zone);
  if (params?.category) query.append('category', params.category);
  if (params?.format) query.append('format', params.format);
  if (params?.search) query.append('search', params.search);
  const qStr = query.toString();
  return fetchJson<Store[]>(`/locations/stores${qStr ? `?${qStr}` : ''}`);
};

export const getStoreDetail = (storeId: number) => fetchJson<Store>(`/locations/stores/${storeId}`);
export const getCompetitors = () => fetchJson<Competitor[]>('/locations/competitors');
export const getTransitHubs = () => fetchJson<TransitHub[]>('/locations/transit-hubs');
export const getDemographics = (territory?: string, zone?: string) => {
  const query = new URLSearchParams();
  if (territory) query.append('territory', territory);
  if (zone) query.append('zone', zone);
  const qStr = query.toString();
  return fetchJson<DemographicsData>(`/locations/demographics${qStr ? `?${qStr}` : ''}`);
};
export const getHourlyVolume = (storeId: number = 1) => fetchJson<HourlyVolumeItem[]>(`/locations/hourly-volume/${storeId}`);
export const getGateConversions = (storeId: number = 1) => fetchJson<GateConversion[]>(`/locations/gate-conversion/${storeId}`);
export const getIsochrones = (storeId: number = 1) => fetchJson<any>(`/locations/isochrones/${storeId}`);

// Footfall Analysis API
export const getFootfallKpis = () => fetchJson<any>('/footfall/kpis');
export const getMacroTrajectory = () => fetchJson<{ summary: any; trajectory: MacroTrajectoryItem[] }>('/footfall/macro-trajectory');
export const getWeeklyHeatmap = () => fetchJson<HeatmapDay[]>('/footfall/weekly-heatmap');
export const getTemporalDeepdive = () => fetchJson<any>('/footfall/temporal-deepdive');
export const getMonitoredVenues = (params?: { page?: number; page_size?: number; sort_by?: string; order?: string; zone?: string; search?: string }) => {
  const query = new URLSearchParams();
  if (params?.page) query.append('page', params.page.toString());
  if (params?.page_size) query.append('page_size', params.page_size.toString());
  if (params?.sort_by) query.append('sort_by', params.sort_by);
  if (params?.order) query.append('order', params.order);
  if (params?.zone) query.append('zone', params.zone);
  if (params?.search) query.append('search', params.search);
  const qStr = query.toString();
  return fetchJson<{ items: any[]; total: number; page: number; page_size: number; total_pages: number }>(`/footfall/venues${qStr ? `?${qStr}` : ''}`);
};

// Customer Mobility API
export const getMobilityFlows = () => fetchJson<any[]>('/mobility/flows');
export const getModalSplit = () => fetchJson<any[]>('/mobility/modal-split');

// Reports & Exports API
export const getReportsKpis = () => fetchJson<any>('/reports/kpis');
export const getReportTemplates = () => fetchJson<ReportTemplate[]>('/reports/templates');
export const getExportLedger = (params?: { page?: number; page_size?: number; search?: string; format_filter?: string }) => {
  const query = new URLSearchParams();
  if (params?.page) query.append('page', params.page.toString());
  if (params?.page_size) query.append('page_size', params.page_size.toString());
  if (params?.search) query.append('search', params.search);
  if (params?.format_filter) query.append('format_filter', params.format_filter);
  const qStr = query.toString();
  return fetchJson<{ items: ExportLedgerItem[]; total: number; page: number; page_size: number; total_pages: number }>(`/reports/ledger${qStr ? `?${qStr}` : ''}`);
};

export const generateCustomReport = (payload: {
  title?: string;
  store_cluster: string;
  spatial_mesh: string;
  aggregation_period: string;
  output_format: string;
  export_destination: string;
  metrics: string[];
}) =>
  fetchJson<ExportLedgerItem>('/reports/generate', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const triggerQuickExport = (templateId: string, format?: string) => {
  const query = format ? `?format=${format}` : '';
  return fetchJson<ExportLedgerItem>(`/reports/quick-export/${templateId}${query}`, {
    method: 'POST',
  });
};

export const downloadReportUrl = (reportId: string) => {
  const base = getApiBaseUrl();
  if (base.startsWith('http')) {
    return `${base}/reports/download/${reportId}`;
  }
  return `http://127.0.0.1:8000/api/reports/download/${reportId}`;
};

// Settings API
export const getSettings = () => fetchJson<any>('/settings');
export const updateSettings = (payload: any) =>
  fetchJson<any>('/settings', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
