import random
import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.database.connection import get_db
from app.models.models import Store, SpatialAlert, ZonePerformance
from app.schemas.schemas import OverviewKpis, SpatialAlertOut, ZonePerformanceOut
from app.services.analytics_service import (
    get_overview_kpis,
    get_footfall_sales_correlation,
    get_category_footfall_share,
    get_demand_mesh_polygons
)

router = APIRouter(prefix="/api/overview", tags=["Overview"])

# Persistent live simulation telemetry state
SIMULATION_STATE = {
    "extra_visits": 0,
    "extra_revenue": 0.0,
    "last_surge_zone": None,
    "last_tick": datetime.datetime.now()
}

@router.get("/kpis", response_model=OverviewKpis)
def get_kpis():
    data = get_overview_kpis()
    data["total_customer_visits"] += SIMULATION_STATE["extra_visits"]
    data["tracked_revenue"] = round(data["tracked_revenue"] + (SIMULATION_STATE["extra_revenue"] / 1000000), 2)
    data["tracked_revenue_formatted"] = f"${data['tracked_revenue']:.2f}M"
    return data

@router.get("/live-feed")
def get_live_feed(db: Session = Depends(get_db)):
    # Advance real-time ticks
    tick_inflow = random.randint(4, 18)
    tick_sales = tick_inflow * random.uniform(6.5, 9.2)
    
    SIMULATION_STATE["extra_visits"] += tick_inflow
    SIMULATION_STATE["extra_revenue"] += tick_sales
    
    total_visits = 3842910 + SIMULATION_STATE["extra_visits"]
    total_revenue = 28.45 + (SIMULATION_STATE["extra_revenue"] / 1000000)
    
    # Store updates: randomly perturb 3 store footfalls to simulate live door sensors
    active_stores = db.query(Store).limit(8).all()
    store_updates = []
    for s in active_stores:
        delta = random.randint(-5, 12)
        s.real_time_footfall = max(200, s.real_time_footfall + delta)
        s.daily_footfall += max(0, delta)
        store_updates.append({
            "store_id": s.id,
            "code": s.code,
            "name": s.name,
            "real_time_footfall": s.real_time_footfall,
            "daily_footfall": s.daily_footfall,
            "delta": delta
        })
    db.commit()

    active_alerts_count = db.query(SpatialAlert).filter(SpatialAlert.status == "Active").count()

    return {
        "timestamp": datetime.datetime.now().isoformat(),
        "total_customer_visits": total_visits,
        "tracked_revenue": round(total_revenue, 3),
        "tracked_revenue_formatted": f"${total_revenue:.2f}M",
        "inflow_velocity_per_sec": tick_inflow,
        "sales_velocity_per_sec": round(tick_sales, 2),
        "active_alerts_count": active_alerts_count,
        "store_updates": store_updates,
        "network_status": "Healthy • 42 Nodes Streaming"
    }

@router.post("/simulate-surge")
def trigger_simulated_surge(db: Session = Depends(get_db)):
    zones = ["Back Bay Core", "Downtown Crossing", "Seaport Innovation", "Kendall Sq"]
    target_zone = random.choice(zones)
    store = db.query(Store).filter(Store.zone.ilike(f"%{target_zone[:6]}%")).first()
    
    surge_visits = random.randint(400, 850)
    SIMULATION_STATE["extra_visits"] += surge_visits
    SIMULATION_STATE["extra_revenue"] += surge_visits * 8.4
    
    if store:
        store.real_time_footfall += surge_visits
        store.capacity_utilization = min(99.0, store.capacity_utilization + 8.5)
        
        # Create a new alert
        new_alert = SpatialAlert(
            store_id=store.id,
            title=f"Live Surge Detected at {store.name}",
            description=f"Sensors registered +{surge_visits} visitor surge within 180 seconds. Cashier line pressure increasing. Reallocation recommended.",
            alert_type="Footfall Surge",
            severity="Critical" if store.capacity_utilization > 92 else "Warning",
            status="Active",
            created_at=datetime.datetime.now(),
            zone=store.zone,
            impact_metric=f"+{surge_visits} Live Surge"
        )
        db.add(new_alert)
        db.commit()
        db.refresh(new_alert)
        
        return {
            "status": "surge_triggered",
            "message": f"Real-time footfall surge synthesized for {store.name} (+{surge_visits} visitors)",
            "store": store.name,
            "zone": store.zone,
            "alert_id": new_alert.id
        }
    return {"status": "ok", "message": "Surge simulated"}

@router.get("/top-zones", response_model=List[ZonePerformanceOut])
def get_top_zones(db: Session = Depends(get_db)):
    zones = db.query(ZonePerformance).order_by(ZonePerformance.customer_visits.desc()).all()
    return zones

@router.get("/alerts", response_model=List[SpatialAlertOut])
def get_alerts(db: Session = Depends(get_db)):
    return db.query(SpatialAlert).filter(SpatialAlert.status != "Dismissed").order_by(SpatialAlert.created_at.desc()).all()

@router.post("/alerts/{alert_id}/dispatch")
def dispatch_alert(alert_id: int, db: Session = Depends(get_db)):
    alert = db.query(SpatialAlert).filter(SpatialAlert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    alert.status = "Dispatched"
    db.commit()
    return {
        "status": "success",
        "message": f"Shift reallocation team dispatched to {alert.zone}. Staff optimization deployed.",
        "alert_id": alert_id
    }

@router.post("/alerts/{alert_id}/dismiss")
def dismiss_alert(alert_id: int, db: Session = Depends(get_db)):
    alert = db.query(SpatialAlert).filter(SpatialAlert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    alert.status = "Dismissed"
    db.commit()
    return {"status": "success", "message": "Alert dismissed", "alert_id": alert_id}

@router.get("/sales-correlation")
def get_sales_correlation():
    return get_footfall_sales_correlation()

@router.get("/category-share")
def get_category_share():
    return get_category_footfall_share()

@router.get("/demand-mesh")
def get_demand_mesh():
    return get_demand_mesh_polygons()
