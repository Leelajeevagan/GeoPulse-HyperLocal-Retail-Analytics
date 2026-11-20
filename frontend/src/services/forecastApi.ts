export interface ForecastPoint {
  date: string;
  day_name: string;
  projected_footfall: number;
  lower_bound: number;
  upper_bound: number;
  projected_sales_k: number;
  weather_condition: string;
  weather_elasticity_pct: number;
  confidence_score?: number;
  is_weekend: boolean;
}

export interface StoreForecastResponse {
  store_id: number;
  store_code: string;
  store_name: string;
  zone: string;
  baseline_daily_footfall: number;
  total_7day_projected_footfall: number;
  projected_weekly_revenue_est: number;
  forecast_model: string;
  generated_at: string;
  series: ForecastPoint[];
}

export interface NetworkForecastResponse {
  nodes_monitored: number;
  total_7day_network_footfall: number;
  total_7day_network_revenue_k: number;
  average_daily_footfall: number;
  forecast_horizon_days: number;
  series: ForecastPoint[];
}

export interface CannibalizationPair {
  store_a: { id: number; code: string; name: string; zone: string };
  store_b: { id: number; code: string; name: string; zone: string };
  distance_meters: number;
  overlap_severity: 'Severe Overlap' | 'Moderate Risk' | 'Low Intercept';
  cannibalization_pct: number;
  estimated_revenue_at_risk_mtd: number;
  recommendation: string;
}

export interface CannibalizationResponse {
  total_store_pairs_analyzed: number;
  high_risk_overlapping_clusters: number;
  total_pairs_with_overlap: number;
  total_revenue_at_risk_mtd: number;
  catchment_radius_meters: number;
  overlapping_pairs: CannibalizationPair[];
}

const API_BASE = '/api';

export async function fetchStoreForecast(storeId: number): Promise<StoreForecastResponse> {
  const res = await fetch(`${API_BASE}/forecast/7day/${storeId}`);
  if (!res.ok) throw new Error(`Failed to fetch forecast for store ${storeId}`);
  return res.json();
}

export async function fetchNetworkForecast(): Promise<NetworkForecastResponse> {
  const res = await fetch(`${API_BASE}/forecast/network`);
  if (!res.ok) throw new Error('Failed to fetch network forecast');
  return res.json();
}

export async function fetchCannibalizationMatrix(): Promise<CannibalizationResponse> {
  const res = await fetch(`${API_BASE}/forecast/cannibalization`);
  if (!res.ok) throw new Error('Failed to fetch cannibalization matrix');
  return res.json();
}
