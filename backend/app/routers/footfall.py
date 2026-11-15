from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from app.database.connection import get_db
from app.models.models import Store
from app.schemas.schemas import StoreOut
from app.services.analytics_service import (
    get_macro_trajectory_data,
    get_weekly_visiting_heatmap
)

router = APIRouter(prefix="/api/footfall", tags=["Footfall Analysis"])

@router.get("/kpis")
def get_footfall_kpis():
    return {
        "daily_footfall": 142850,
        "daily_footfall_pct": 12.4,
        "daily_footfall_sub": "vs. previous week average",
        "peak_hourly_rate": 14200,
        "peak_hourly_sub": "17:30 EST Commuter Wave",
        "mobility_split_pedestrian": 68,
        "mobility_split_transit": 32,
        "mobility_split_label": "68% Pedestrian / 32% Transit & Vehicle",
        "atmospheric_elasticity": 18.2,
        "atmospheric_elasticity_sub": "+18.2% on Clear Weather Days",
        "average_dwell_time": 42.6,
        "average_dwell_time_sub": "+4.1 min dwell expansion"
    }

@router.get("/macro-trajectory")
def get_macro_trajectory():
    return get_macro_trajectory_data()

@router.get("/weekly-heatmap")
def get_weekly_heatmap():
    return get_weekly_visiting_heatmap()

@router.get("/temporal-deepdive")
def get_temporal_deepdive():
    return {
        "morning_rush": {
            "window": "07:30 - 09:30",
            "volume_share_pct": 22.4,
            "avg_hourly_inflow": 8200,
            "dominant_persona": "Transit Commuters & Early Risers",
            "velocity": "High Velocity / Low Dwell"
        },
        "midday_lunch_wave": {
            "window": "12:00 - 14:00",
            "volume_share_pct": 31.2,
            "avg_hourly_inflow": 12400,
            "dominant_persona": "Office Workers & Shoppers",
            "velocity": "Moderate Velocity / High Food Conversion"
        },
        "evening_commuter_peak": {
            "window": "17:00 - 19:30",
            "volume_share_pct": 38.6,
            "avg_hourly_inflow": 14200,
            "dominant_persona": "After-work Browsers & Diners",
            "velocity": "Extended Dwell / High Basket Value"
        },
        "weekend_surge": {
            "volume_delta_pct": 44.8,
            "average_dwell_minutes": 52.4,
            "cross_shopping_rate_pct": 64.0
        }
    }

@router.get("/venues", response_model=Dict[str, Any])
def get_monitored_venues(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=50),
    sort_by: str = "daily_footfall",
    order: str = "desc",
    zone: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Store)
    if zone and zone != "All Zones":
        query = query.filter(Store.zone == zone)
    if search:
        s = f"%{search}%"
        query = query.filter(
            (Store.name.ilike(s)) |
            (Store.code.ilike(s)) |
            (Store.zone.ilike(s)) |
            (Store.category.ilike(s))
        )
        
    total_count = query.count()
    
    # Sorting
    sort_column = getattr(Store, sort_by, Store.daily_footfall)
    if order == "desc":
        query = query.order_by(sort_column.desc())
    else:
        query = query.order_by(sort_column.asc())
        
    venues = query.offset((page - 1) * page_size).limit(page_size).all()
    
    items = []
    for v in venues:
        items.append({
            "id": v.id,
            "code": v.code,
            "name": v.name,
            "zone": v.zone,
            "category": v.category,
            "format": v.format,
            "daily_footfall": v.daily_footfall,
            "peak_window": v.peak_window,
            "movement_trend": v.movement_trend,
            "capacity_utilization": v.capacity_utilization,
            "opportunity_score": v.opportunity_score,
            "sales_mtd": v.gross_sales_mtd,
            "conversion_rate": v.conversion_rate
        })
        
    return {
        "items": items,
        "total": total_count,
        "page": page,
        "page_size": page_size,
        "total_pages": (total_count + page_size - 1) // page_size
    }

