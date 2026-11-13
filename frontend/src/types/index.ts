export interface Store {
  id: number;
  code: string;
  name: string;
  brand: string;
  category: string;
  format: string;
  zone: string;
  territory: string;
  address: string;
  latitude: float;
  longitude: float;
  square_footage: number;
  employee_count: number;
  real_time_footfall: number;
  daily_footfall: number;
  weekly_footfall: number;
  pedestrian_capture_ratio: number;
  footfall_pressure_index: number;
  competitor_pressure: string;
  cannibalization_pct: number;
  capacity_utilization: number;
  opportunity_score: number;
  peak_window: string;
  movement_trend: string;
  gross_sales_mtd: number;
  gross_sales_daily: number;
  conversion_rate: number;
  average_dwell_time: number;
}

export type float = number;

export interface Competitor {
  id: number;
  store_id: number | null;
  name: string;
  brand: string;
  category: string;
  latitude: number;
  longitude: number;
  distance_meters: number;
  pressure_level: string;
}

export interface TransitHub {
  id: number;
  name: string;
  hub_type: string;
  latitude: number;
  longitude: number;
  daily_ridership: number;
  lines_served: string;
}

export interface SpatialAlert {
  id: number;
  store_id: number | null;
  title: string;
  description: string;
  alert_type: string;
  severity: 'Critical' | 'Warning' | 'Info';
  status: 'Active' | 'Dispatched' | 'Dismissed';
  created_at: string;
  zone: string;
  impact_metric: string;
}

export interface ZonePerformance {
  id: number;
  zone_name: string;
  territory: string;
  customer_visits: number;
  revenue: number;
  capacity_utilization: number;
  yoy_performance: number;
  store_count: number;
  latitude: number;
  longitude: number;
}

export interface GateConversion {
  id: number;
  store_id: number;
  gate_name: string;
  total_inflows: number;
  store_capture_pct: number;
  performance_score: string;
}

export interface ExportLedgerItem {
  id: number;
  report_id: string;
  filename: string;
  category: string;
  file_format: string;
  timestamp: string;
  file_size_formatted: string;
  generated_by: string;
  status: string;
  download_url: string;
}

export interface OverviewKpisData {
  total_customer_visits: number;
  total_customer_visits_pct: number;
  visits_sparkline: number[];
  stores_monitored: number;
  stores_monitored_status: string;
  network_health_pct: number;
  stores_sparkline: number[];
  tracked_revenue: number;
  tracked_revenue_formatted: string;
  tracked_revenue_pct: number;
  revenue_sparkline: number[];
  average_footfall_density: number;
  footfall_density_unit: string;
  footfall_density_pct: number;
  density_sparkline: number[];
  prime_hotspots: number;
  prime_hotspots_sub: string;
  prime_hotspots_pct: number;
  hotspots_sparkline: number[];
}

export interface CorrelationItem {
  date: string;
  full_date: string;
  day: string;
  footfall: number;
  sales_k: number;
  is_weekend: boolean;
  conversion_rate: number;
}

export interface SalesCorrelationData {
  correlation_coefficient: number;
  correlation_strength: string;
  optimal_conversion_window: string;
  weekend_surge_multiplier: string;
  series: CorrelationItem[];
}

export interface CategoryShareItem {
  name: string;
  value: number;
  color: string;
  visits: number;
  growth: string;
}

export interface HourlyVolumeItem {
  hour: string;
  volume: number;
  baseline: number;
  is_lunch_wave: boolean;
  is_commuter_peak: boolean;
}

export interface HeatmapHour {
  day: string;
  hour: number;
  hour_label: string;
  intensity: number;
  density_level: string;
  traffic_index: number;
}

export interface HeatmapDay {
  day: string;
  hours: HeatmapHour[];
}

export interface MacroTrajectoryItem {
  date: string;
  current_period: number;
  previous_period: number;
  variance_pct: number;
  weather: string;
}

export interface DemographicsData {
  territory: string;
  zone: string;
  median_household_income: number;
  median_household_income_fmt: string;
  young_professionals_pct: number;
  higher_degree_pct: number;
  retail_propensity_index: number;
  retail_propensity_label: string;
  daytime_population: number;
}

export interface ReportTemplate {
  id: string;
  title: string;
  category: string;
  description: string;
  formats: string[];
  recommended_format: string;
  default_cluster: string;
  metrics: string[];
}

