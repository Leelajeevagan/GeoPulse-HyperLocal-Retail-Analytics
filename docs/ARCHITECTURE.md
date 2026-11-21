# GeoPulse System Architecture & Technical Specifications

## 1. Executive Architecture Overview

GeoPulse is an enterprise-grade retail spatial analytics and footfall telemetry platform. It integrates IoT store sensors, transit terminal inflows, and point-of-sale (POS) revenue streams into a unified geospatial intelligence dashboard.

```
+-------------------------------------------------------------------------+
|                           CLIENT LAYER                                  |
|  React 18 + Vite + TypeScript + Tailwind CSS + Leaflet GIS + Recharts   |
+-------------------------------------------------------------------------+
                                    |
                           HTTP / REST API (JSON)
                                    v
+-------------------------------------------------------------------------+
|                           API GATEWAY / NGINX                           |
|      Reverse Proxy - SSL Termination - Rate Limiting - Static Assets    |
+-------------------------------------------------------------------------+
                                    |
                           ASGI / Uvicorn (Port 8000)
                                    v
+-------------------------------------------------------------------------+
|                         APPLICATION LAYER (FastAPI)                     |
|  * Overview Router (/api/overview)       * Location Router (/api/locations)|
|  * Footfall Router (/api/footfall)       * Mobility Router (/api/mobility) |
|  * Reports Router (/api/reports)         * Forecast Router (/api/forecast) |
|  * Settings Router (/api/settings)       * Analytics & Export Services     |
+-------------------------------------------------------------------------+
                                    |
                        SQLAlchemy 2.0 ORM Engine
                                    v
+-------------------------------------------------------------------------+
|                          PERSISTENCE LAYER                              |
|  * SQLite (Development default) / PostgreSQL (Production)               |
|  * Tables: Stores, Competitors, TransitHubs, SpatialAlerts,            |
|            ZonePerformances, GateConversions, ExportLedgers             |
+-------------------------------------------------------------------------+
```

---

## 2. Core Subsystems

### A. Geospatial Demand & Isochrone Engine
* **Coordinate Reference**: WGS84 (EPSG:4326) coordinate system.
* **Catchment Buffer Calculation**: Haversine distance calculations and multi-polygon isochrone bands (5-min, 10-min, 15-min walking buffers).
* **Cannibalization Matrix**: Inter-store proximity detection within 1,200m buffer thresholds with product category overlap factoring.

### B. Predictive Telemetry & Forecasting Pipeline
* **7-Day Diurnal Projection**: Time-series extrapolation factoring day-of-week trends and weekend shopping surge multipliers.
* **Atmospheric Elasticity Model**: Weather cross-factors (Clear Sky +14%, Rain -18%, Snow -32%) adjusting pedestrian inflow expectations.
* **Confidence Bands**: 95% Confidence Interval (±7.5%) envelope calculation for pedestrian footfall and POS revenue estimation.

### C. Multi-Format Telemetry Export Center
* **Asynchronous Export Generation**: Streaming report creation into PDF (ReportLab), CSV, GeoJSON, and Apache Parquet (PyArrow).
* **Audit Ledger**: Complete historical export tracking with checksums, byte formatting, and download streaming tokens.
