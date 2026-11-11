# GeoPulse – Retail Spatial Intelligence Dashboard

**GeoPulse** is an enterprise-grade retail spatial analytics and footfall telemetry platform designed for multi-unit retail networks, commercial real estate developers, and store operations planners.

It features interactive geospatial demand mapping, pedestrian trajectory forecasting, catchment cannibalization detection, pos revenue cross-correlation, and a multi-format telemetry export center.

---

## 🚀 Live Services

- **Frontend Application**: `http://localhost:3000`
- **FastAPI Telemetry Backend**: `http://localhost:8000`
- **Interactive API Documentation (Swagger)**: `http://localhost:8000/docs`
- **Alternative API Reference (ReDoc)**: `http://localhost:8000/redoc`

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS |
| **Icons** | Lucide React |
| **Charts** | Recharts (ComposedChart, LineChart, BarChart, PieChart) |
| **Maps & GIS** | Leaflet.js, OpenStreetMap, CartoDB Dark Matter, Isochrones |
| **Backend API** | Python 3.13, FastAPI, Pydantic v2, Uvicorn |
| **Database** | SQLAlchemy ORM, SQLite (Default zero-dependency local) / PostgreSQL |
| **Data & Reports** | Pandas, PyArrow (Parquet), ReportLab (PDF), GeoJSON, CSV |

---

## 🌟 Key Modules & Dashboards

### 1. Overview Dashboard ("Network Command Overview")
- **5 Executive KPI Cards**:
  - Total Customer Visits: **3,842,910** (+14.2% YoY with trend sparkline)
  - Stores Monitored: **42 Active** (98.4% network operational uptime)
  - Tracked Revenue: **$28.45M** (+8.6% with revenue curve)
  - Average Footfall Density: **184 p/100m²** (+5.3%)
  - Prime Hotspots: **12 Identified** (3 emerging micro-zones)
- **Geospatial Demand Mesh**:
  - High-contrast dark navy map canvas with CartoDB Dark Matter tiles.
  - Interactive layer tabs: `[Heatmap Overlay]`, `[Store Pins]`, `[Isochrones]`, `[Competitor Ring]`.
  - Footfall intensity legend: Moderate, High, Severe Surge.
  - Zoom controls, pan, and Boston metro reset.
- **Top Performing Zones**:
  - Ranked commercial retail nodes (Back Bay, Downtown Crossing, Seaport, Kendall Sq, Harvard Sq, Assembly Row, Fenway).
- **Anomalies and Spatial Alerts Panel**:
  - Real-time understaffing risk, cannibalization overlap, and surge detection.
  - Interactive **"Dispatch Shift Reallocation"** button that deploys staff and updates status via API.
  - One-click alert dismissal.
- **Footfall vs. Realized Sales Correlation**:
  - Interactive line & bar composed chart cross-factoring pedestrian volume with POS sales.
  - Correlation coefficient badge: **r = 0.892 (Strong Positive)**.
  - Optimal conversion window badge: **14:00 - 18:30 EST**.
  - Weekend surge multiplier badge: **+44.8%**.
- **Category Footfall Share**:
  - Donut chart tracking Apparel (34%), Electronics (28%), Food & Beverage (24%), and Specialty & Beauty (14%).

---

### 2. Location Analytics Dashboard
- **Spatial Filters**:
  - Territory: Greater Boston Metro Area.
  - Geofence Scope: All Retail Nodes, Flagship Stores, Standard Venues, Express/Kiosks.
  - Time Window: 24-Hour, 7-Day Aggregation, 30-Day Window, Quarterly.
  - Layer Stack dropdown and **"Export Geospatial Data"** trigger.
- **Interactive Spatial Map**:
  - Boston metropolitan area with store locations, competitor rivals, and MBTA transit terminals.
  - Walking isochrone buffers (5-min, 10-min, 15-min travel bands).
- **Floating Spatial Node Profile Card**:
  - Activated upon clicking any store pin.
  - Real-time footfall (e.g. 1,840/hr), pedestrian capture ratio (22.8%), pressure index (85/100), competitor pressure, cannibalization percentage (7.4%).
  - **"Analyze Micro-Zone"** modal button providing deep socio-economic analysis.
- **Bottom 3 Analytics Cards**:
  1. **Demographic & Affluence**: Median household income ($118,400), young professionals (64.2%), higher degree attainment (78.5%), retail spending propensity (Index 142).
  2. **Hourly Pedestrian Volume**: 24-hour distribution highlighting **Lunch Wave (12:00-14:00)** and **Commuter Peak (17:00-19:30)**.
  3. **Entrance Gate Conversion**: Gate portals (North Boylston Gate, Main Arcade Atrium, West Plaza, Transit Link) with capture percentages.

---

### 3. Footfall Analysis Dashboard
- **KPI Cards**: Daily Footfall (142,850, +12.4%), Peak Hourly Rate (14,200/hr), Mobility Split (68% Pedestrian / 32% Transit), Atmospheric Elasticity (+18.2% on Clear Weather Days).
- **Macro Trend & Period Comparative Trajectory**: Current period vs. previous period curve with weather correlation flags.
- **Weekly Visiting Hours Heatmap (7x24 Matrix)**: Monday to Sunday across hourly slots with interactive hover tooltips and density color coding.
- **Temporal Deep-Dive**: Diurnal profiles for Morning Rush (07:30-09:30), Midday Activity (12:00-14:00), Evening Peak (17:00-19:30), and Weekend Surge (+44.8%, 52.4 min dwell).
- **Monitored Retail Venues Table**: Paginated, sortable, and searchable table with movement trends, capacity %, and opportunity scores.

---

### 4. Reports & Exports Dashboard
- **Reports Header**:
  - Storage quota monitor (74.2 GB of 100 GB used - 74%).
  - Webhooks & S3 Sync active status badge.
- **KPI Cards**: Reports Generated (1,284), Scheduled Dispatches (18 Active Crons), Data Volume Exported (4.82 TB), Zero Failed Exports.
- **Interactive Custom Report Builder**:
  - Configure Store Cluster, Spatial Mesh (Hexagonal H3 Res 9), Aggregation Period, Output Format (`PDF`, `CSV`, `GeoJSON`, `Parquet`), and Destination.
  - Multi-select telemetry checklist: Footfall Density, Dwell Time, Sales Correlation, OD Vectors, Demographic Spend, Competitor Saturation, Weather Cross-Factors.
  - **"Generate & Queue Export"** button creates real files and triggers instant download.
- **Pre-Packaged Report Templates**:
  - Executive Sales & Footfall Summary (PDF)
  - Customer Mobility & Origin-Destination Flow Analysis (GeoJSON)
  - Store Network Cannibalization & Catchment Feasibility (CSV)
  - Hourly Peak Dwell & Footfall Intensity Matrix (Parquet)
- **Export Archive & Download Activity Ledger**:
  - Searchable audit table with direct **Download** action buttons that stream real files from `/api/reports/download/{id}`.

---

### 5. Additional Modules
- **Customer Mobility**: Origin-Destination vectors from MBTA terminals to retail nodes with modal split breakdown.
- **Retail Sales**: POS sales volume, conversion efficiency, and top revenue store rankings.
- **Store Intelligence**: Individual store health scorecards, capacity utilization, and staffing ratios.
- **Settings**: Map tile selection, cloud storage configurations, and anomaly alerting thresholds.

---

## 🏃 Local Setup & Execution Guide

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)

### 1. Backend Setup
```bash
cd backend
python -m pip install -r requirements.txt
python -m app.database.seed_data
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open your browser at `http://localhost:3000`.

### Database Configuration (Optional PostgreSQL)
By default, the application runs out of the box with zero setup using SQLite (`./geopulse.db`). To connect a PostgreSQL database, simply provide the `DATABASE_URL` environment variable:
```bash
export DATABASE_URL="postgresql://user:password@localhost:5432/geopulse"
```
The SQLAlchemy schema will automatically initialize on startup.

