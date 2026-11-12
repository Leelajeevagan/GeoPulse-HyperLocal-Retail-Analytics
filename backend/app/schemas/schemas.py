from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class StoreOut(BaseModel):
    id: int
    code: str
    name: str
    brand: Optional[str] = "GeoPulse Retail"
    category: Optional[str]
    format: Optional[str]
    zone: str
    territory: str
    address: Optional[str]
    latitude: float
    longitude: float
    square_footage: Optional[int]
    employee_count: Optional[int]
    real_time_footfall: int
    daily_footfall: int
    weekly_footfall: int
    pedestrian_capture_ratio: float
    footfall_pressure_index: int
    competitor_pressure: str
    cannibalization_pct: float
    capacity_utilization: float
    opportunity_score: int
    peak_window: str
    movement_trend: str
    gross_sales_mtd: float
    gross_sales_daily: float
    conversion_rate: float
    average_dwell_time: float

    class Config:
        from_attributes = True

class CompetitorOut(BaseModel):
    id: int
    store_id: Optional[int]
    name: str
    brand: Optional[str]
    category: Optional[str]
    latitude: float
    longitude: float
    distance_meters: int
    pressure_level: str

    class Config:
        from_attributes = True

class TransitHubOut(BaseModel):
    id: int
    name: str
    hub_type: str
    latitude: float
    longitude: float
    daily_ridership: int
    lines_served: Optional[str]

    class Config:
        from_attributes = True

class SpatialAlertOut(BaseModel):
    id: int
    store_id: Optional[int]
    title: str
    description: str
    alert_type: str
    severity: str
    status: str
    created_at: datetime
    zone: Optional[str]
    impact_metric: Optional[str]

    class Config:
        from_attributes = True

class ZonePerformanceOut(BaseModel):
    id: int
    zone_name: str
    territory: Optional[str] = "Greater Boston Metro Area"
    customer_visits: int
    revenue: float
    capacity_utilization: float
    yoy_performance: float
    store_count: Optional[int] = 4
    latitude: Optional[float] = 42.3550
    longitude: Optional[float] = -71.0600

    class Config:
        from_attributes = True

class GateConversionOut(BaseModel):
    id: int
    store_id: int
    gate_name: str
    total_inflows: int
    store_capture_pct: float
    performance_score: str

    class Config:
        from_attributes = True

class ExportLedgerOut(BaseModel):
    id: int
    report_id: str
    filename: str
    category: Optional[str]
    file_format: str
    timestamp: datetime
    file_size_bytes: int
    file_size_formatted: str
    generated_by: str
    status: str
    download_url: Optional[str]

    class Config:
        from_attributes = True

class CustomReportRequest(BaseModel):
    title: Optional[str] = "Spatial Telemetry Report"
    category: Optional[str] = "Footfall & Revenue"
    store_cluster: Optional[str] = "All Boston Retail Nodes"
    spatial_mesh: Optional[str] = "Hexagonal H3 (Res 9)"
    aggregation_period: Optional[str] = "7-Day Aggregated Cycle"
    output_format: Optional[str] = "PDF"
    export_destination: Optional[str] = "Local Download"
    selected_metrics: Optional[List[str]] = []

class OverviewKpis(BaseModel):
    total_customer_visits: int
    total_customer_visits_pct: float
    stores_monitored: int
    stores_monitored_status: str
    network_health_pct: float
    tracked_revenue: float
    tracked_revenue_formatted: str
    tracked_revenue_pct: float
    average_footfall_density: int
    footfall_density_unit: str
    footfall_density_pct: float
    prime_hotspots: str
    prime_hotspots_sub: str
    prime_hotspots_pct: float
    visits_sparkline: List[int]
    revenue_sparkline: List[float]
    density_sparkline: List[int]
    hotspots_sparkline: List[int]
    stores_sparkline: List[int]
