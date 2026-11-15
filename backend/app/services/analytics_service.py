import datetime
import math
import random
from typing import Dict, List, Any

def get_overview_kpis() -> Dict[str, Any]:
    return {
        "total_customer_visits": 3842910,
        "total_customer_visits_pct": 14.2,
        "visits_sparkline": [98, 102, 106, 115, 122, 130, 142, 138, 145, 158, 164, 180],
        
        "stores_monitored": 42,
        "stores_monitored_status": "42 Active",
        "network_health_pct": 98.4,
        "stores_sparkline": [40, 40, 41, 41, 42, 42, 42, 42, 42, 42, 42, 42],
        
        "tracked_revenue": 28.45,
        "tracked_revenue_formatted": "$28.45M",
        "tracked_revenue_pct": 8.6,
        "revenue_sparkline": [22.1, 22.8, 23.4, 24.1, 24.9, 25.8, 26.2, 26.9, 27.5, 28.1, 28.3, 28.45],
        
        "average_footfall_density": 184,
        "footfall_density_unit": "p/100m²",
        "footfall_density_pct": 5.3,
        "density_sparkline": [162, 165, 170, 172, 175, 174, 178, 180, 182, 181, 183, 184],
        
        "prime_hotspots": 12,
        "prime_hotspots_sub": "3 Emerging",
        "prime_hotspots_pct": 25.0,
        "hotspots_sparkline": [8, 8, 9, 9, 10, 10, 11, 11, 11, 12, 12, 12]
    }

def get_footfall_sales_correlation() -> Dict[str, Any]:
    # 30-day realistic timeline with weekend surges and strong correlation (r=0.892)
    data = []
    base_date = datetime.date.today() - datetime.timedelta(days=29)
    days_of_week = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    
    for i in range(30):
        current_date = base_date + datetime.timedelta(days=i)
        dow = current_date.weekday()
        day_name = days_of_week[dow]
        is_weekend = dow in [4, 5, 6] # Fri, Sat, Sun
        
        # Base footfall with weekend spikes
        base_ff = 92000 if not is_weekend else 145000
        noise = random.randint(-4000, 4000)
        footfall = base_ff + noise + (i * 800) # upward trend
        
        # Gross sales closely correlated (approx $7.2 per footfall customer on avg)
        sales = round((footfall * random.uniform(6.8, 7.6)) / 1000, 2) # in thousands
        
        data.append({
            "date": current_date.strftime("%b %d"),
            "full_date": str(current_date),
            "day": day_name,
            "footfall": footfall,
            "sales_k": sales,
            "is_weekend": is_weekend,
            "conversion_rate": round(random.uniform(22.5, 27.8), 1)
        })
        
    return {
        "correlation_coefficient": 0.892,
        "correlation_strength": "Strong Positive (r = 0.892)",
        "optimal_conversion_window": "14:00 - 18:30 EST",
        "weekend_surge_multiplier": "+44.8%",
        "series": data
    }

def get_category_footfall_share() -> List[Dict[str, Any]]:
    return [
        {"name": "Apparel", "value": 34, "color": "#0d9488", "visits": 1306589, "growth": "+12.4%"},
        {"name": "Electronics", "value": 28, "color": "#06b6d4", "visits": 1076014, "growth": "+16.8%"},
        {"name": "Food & Beverage", "value": 24, "color": "#10b981", "visits": 922298, "growth": "+8.2%"},
        {"name": "Specialty & Beauty", "value": 14, "color": "#6366f1", "visits": 538007, "growth": "+19.5%"}
    ]

def get_weekly_visiting_heatmap() -> List[Dict[str, Any]]:
    days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    matrix = []
    
    # 24 hours per day (00:00 to 23:00)
    for day_idx, day in enumerate(days):
        day_cells = []
        is_weekend = day in ["Sat", "Sun"]
        
        for hour in range(24):
            # Model retail footfall distribution
            if hour < 6:
                intensity = random.randint(20, 80)
                level = "Low"
            elif 6 <= hour < 10:
                intensity = random.randint(280, 750) if not is_weekend else random.randint(180, 450)
                level = "Moderate"
            elif 11 <= hour <= 14: # Lunch Wave
                intensity = random.randint(950, 1650) if not is_weekend else random.randint(1400, 2100)
                level = "High" if intensity < 1500 else "Severe Surge"
            elif 15 <= hour <= 16:
                intensity = random.randint(700, 1100)
                level = "Moderate"
            elif 17 <= hour <= 20: # Evening Peak
                intensity = random.randint(1300, 2450)
                level = "Severe Surge" if intensity > 1800 else "High"
            else: # Night
                intensity = random.randint(120, 480)
                level = "Low"
                
            day_cells.append({
                "day": day,
                "hour": hour,
                "hour_label": f"{hour:02d}:00",
                "intensity": intensity,
                "density_level": level,
                "traffic_index": min(100, int(intensity / 25))
            })
        matrix.append({"day": day, "hours": day_cells})
        
    return matrix

def get_hourly_pedestrian_profile(store_id: int = 1) -> List[Dict[str, Any]]:
    # 24-hour profile with commuter and lunch peaks
    data = []
    for h in range(24):
        if h < 6:
            count = random.randint(40, 120)
        elif 6 <= h < 9:
            count = random.randint(450, 920)
        elif 9 <= h < 11:
            count = random.randint(850, 1150)
        elif 11 <= h <= 14: # Lunch wave
            count = random.randint(1600, 2250)
        elif 14 < h < 17:
            count = random.randint(1100, 1450)
        elif 17 <= h <= 19: # Commuter peak
            count = random.randint(1850, 2600)
        elif 19 < h <= 21:
            count = random.randint(980, 1400)
        else:
            count = random.randint(180, 450)
            
        data.append({
            "hour": f"{h:02d}:00",
            "volume": count,
            "baseline": int(count * 0.88),
            "is_lunch_wave": 11 <= h <= 14,
            "is_commuter_peak": 17 <= h <= 19
        })
    return data

def get_macro_trajectory_data() -> Dict[str, Any]:
    # 14 days comparative: Current period vs Previous period
    points = []
    base_date = datetime.date.today() - datetime.timedelta(days=13)
    
    for i in range(14):
        dt = base_date + datetime.timedelta(days=i)
        is_weekend = dt.weekday() in [5, 6]
        
        current_val = random.randint(118000, 146000) if not is_weekend else random.randint(162000, 198000)
        prev_val = int(current_val * random.uniform(0.86, 0.93))
        
        points.append({
            "date": dt.strftime("%a %d"),
            "current_period": current_val,
            "previous_period": prev_val,
            "variance_pct": round(((current_val - prev_val) / prev_val) * 100, 1),
            "weather": "Clear" if i % 3 != 0 else "Precipitation"
        })
        
    return {
        "summary": {
            "current_period_total": sum(p["current_period"] for p in points),
            "previous_period_total": sum(p["previous_period"] for p in points),
            "net_growth_pct": 12.4,
            "peak_day": "Saturday Oct 24",
            "peak_hourly_rate": 14200
        },
        "trajectory": points
    }

def get_demand_mesh_polygons() -> Dict[str, Any]:
    # Boston Retail Zones Polygon Boundaries & Isochrones in GeoJSON
    # Center around Back Bay, Downtown, Seaport, Kendall, Harvard
    features = [
        {
            "type": "Feature",
            "properties": {
                "name": "Back Bay High-Density Retail Zone",
                "zone_id": "ZONE-BB",
                "demand_density": 94,
                "fill_color": "#0d9488",
                "footfall_index": "Severe Surge",
                "active_stores": 5
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [[
                    [-71.0890, 42.3480],
                    [-71.0740, 42.3465],
                    [-71.0725, 42.3525],
                    [-71.0875, 42.3540],
                    [-71.0890, 42.3480]
                ]]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "name": "Downtown Crossing Pedestrian Corridor",
                "zone_id": "ZONE-DT",
                "demand_density": 91,
                "fill_color": "#06b6d4",
                "footfall_index": "High",
                "active_stores": 5
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [[
                    [-71.0640, 42.3520],
                    [-71.0550, 42.3510],
                    [-71.0565, 42.3585],
                    [-71.0655, 42.3590],
                    [-71.0640, 42.3520]
                ]]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "name": "Seaport Waterfront District",
                "zone_id": "ZONE-SP",
                "demand_density": 87,
                "fill_color": "#10b981",
                "footfall_index": "High",
                "active_stores": 4
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [[
                    [-71.0480, 42.3485],
                    [-71.0370, 42.3480],
                    [-71.0390, 42.3555],
                    [-71.0500, 42.3560],
                    [-71.0480, 42.3485]
                ]]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "name": "Kendall Innovation Square",
                "zone_id": "ZONE-KD",
                "demand_density": 82,
                "fill_color": "#6366f1",
                "footfall_index": "Moderate",
                "active_stores": 4
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [[
                    [-71.0920, 42.3600],
                    [-71.0820, 42.3595],
                    [-71.0835, 42.3655],
                    [-71.0935, 42.3660],
                    [-71.0920, 42.3600]
                ]]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "name": "Harvard Square Historic Mesh",
                "zone_id": "ZONE-HV",
                "demand_density": 78,
                "fill_color": "#f59e0b",
                "footfall_index": "Moderate",
                "active_stores": 4
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [[
                    [-71.1245, 42.3705],
                    [-71.1155, 42.3700],
                    [-71.1165, 42.3760],
                    [-71.1255, 42.3765],
                    [-71.1245, 42.3705]
                ]]
            }
        }
    ]
    
    return {
        "type": "FeatureCollection",
        "features": features
    }

def get_walking_isochrones(lat: float = 42.3499, lng: float = -71.0825) -> Dict[str, Any]:
    # Returns 5-min, 10-min, 15-min walking radii circles/polygons
    radii = [
        {"minutes": 5, "meters": 400, "color": "#0d9488", "opacity": 0.35, "label": "5-Min Walking Isochrone (400m)"},
        {"minutes": 10, "meters": 800, "color": "#06b6d4", "opacity": 0.22, "label": "10-Min Walking Isochrone (800m)"},
        {"minutes": 15, "meters": 1200, "color": "#6366f1", "opacity": 0.12, "label": "15-Min Walking Isochrone (1.2km)"}
    ]
    return {
        "center": [lat, lng],
        "isochrones": radii
    }

def get_origin_destination_flows() -> List[Dict[str, Any]]:
    # Customer mobility flows from Transit Hubs to Retail Nodes
    return [
        {
            "from_name": "South Station Intermodal",
            "from_coords": [42.3522, -71.0552],
            "to_name": "Downtown Crossing Hub",
            "to_coords": [42.3555, -71.0601],
            "volume_daily": 34500,
            "mode": "Pedestrian & Transfer",
            "avg_transit_minutes": 7.4
        },
        {
            "from_name": "Back Bay Station",
            "from_coords": [42.3473, -71.0757],
            "to_name": "Back Bay Flagship (Boylston)",
            "to_coords": [42.3499, -71.0825],
            "volume_daily": 28900,
            "mode": "Pedestrian",
            "avg_transit_minutes": 5.2
        },
        {
            "from_name": "Park Street Station",
            "from_coords": [42.3564, -71.0624],
            "to_name": "Downtown Crossing Hub",
            "to_coords": [42.3555, -71.0601],
            "volume_daily": 42100,
            "mode": "Pedestrian Concourse",
            "avg_transit_minutes": 3.8
        },
        {
            "from_name": "Kendall / MIT Station",
            "from_coords": [42.3625, -71.0861],
            "to_name": "Kendall Tech Showcase",
            "to_coords": [42.3625, -71.0862],
            "volume_daily": 19400,
            "mode": "Direct Inflow",
            "avg_transit_minutes": 1.5
        },
        {
            "from_name": "Harvard Square Station",
            "from_coords": [42.3734, -71.1190],
            "to_name": "Harvard Square Heritage",
            "to_coords": [42.3736, -71.1189],
            "volume_daily": 26800,
            "mode": "Plaza Inflow",
            "avg_transit_minutes": 2.1
        }
    ]

