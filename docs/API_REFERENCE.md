# GeoPulse REST API Reference Contract

Version: `1.0.0` | Base Path: `/api`

---

## 1. Health & System
* `GET /`: Service metadata, API version, and documentation endpoints.
* `GET /api/health`: Uptime monitoring, database connectivity, and monitored node count.

## 2. Overview Dashboard (`/api/overview`)
* `GET /api/overview/kpis`: 5 executive KPI summary cards (Customer visits, revenue, density, hotspots).
* `GET /api/overview/live-feed`: Real-time streaming simulation ticker and randomized store door-sensor deltas.
* `GET /api/overview/sales-correlation`: 30-day footfall vs. POS revenue cross-correlation series.
* `GET /api/overview/category-share`: Retail category share breakdown (Apparel, Tech, F&B, Specialty).
* `GET /api/overview/demand-mesh`: GeoJSON polygon demand mesh covering Boston commercial zones.
* `POST /api/overview/simulate-surge`: Trigger synthetic footfall surge in a specific commercial zone.
* `POST /api/overview/alerts/{alert_id}/dispatch`: Dispatch emergency staff reallocation to mitigate surge.
* `POST /api/overview/alerts/{alert_id}/dismiss`: Acknowledge and dismiss active spatial anomaly alert.

## 3. Location Analytics (`/api/locations`)
* `GET /api/locations/stores`: Filterable list of all 42 monitored retail nodes.
* `GET /api/locations/stores/{store_id}`: Full store profile, square footage, capture ratio, dwell time.
* `GET /api/locations/competitors`: Competitor locations with distance and competitive pressure index.
* `GET /api/locations/transit-hubs`: MBTA transit terminals, commuter rail stations, and daily ridership.
* `GET /api/locations/demographics`: Socio-economic indicators (median household income, spending index).

## 4. Footfall & Mobility (`/api/footfall`, `/api/mobility`)
* `GET /api/footfall/macro-trajectory`: Current vs. previous period comparative footfall trajectory.
* `GET /api/footfall/weekly-heatmap`: 7x24 hourly matrix (168 cells) for footfall intensity heatmaps.
* `GET /api/mobility/flow-vectors`: Origin-Destination vectors from MBTA terminals to retail nodes.
* `GET /api/mobility/modal-split`: Transportation mode breakdown (Pedestrian, Transit, Rideshare).

## 5. Predictive Forecasting (`/api/forecast`)
* `GET /api/forecast/7day/{store_id}`: Store 7-day diurnal footfall forecast with weather impact & 95% CI.
* `GET /api/forecast/network`: Macro network-wide 7-day predictive aggregate trajectory.
* `GET /api/forecast/cannibalization`: Inter-store catchment overlap and revenue-at-risk matrix.

## 6. Reports & Exports (`/api/reports`)
* `GET /api/reports/templates`: Pre-packaged report templates (Executive Summary, OD Flow, Cannibalization).
* `GET /api/reports/ledger`: Paginated audit log of generated telemetry files.
* `POST /api/reports/generate`: Generate customized report in PDF, CSV, GeoJSON, or Parquet format.
* `GET /api/reports/download/{report_id}`: Stream generated report file directly to client.
