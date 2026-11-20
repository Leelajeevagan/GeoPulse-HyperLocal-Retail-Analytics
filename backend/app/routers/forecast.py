from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from app.database.connection import get_db
from app.models.models import Store
from app.services.forecast_service import (
    generate_store_7day_forecast,
    calculate_catchment_cannibalization
)

router = APIRouter(prefix="/api/forecast", tags=["Predictive Forecasting"])

@router.get("/7day/{store_id}")
def get_store_forecast(store_id: int, db: Session = Depends(get_db)):
    """Fetch 7-day diurnal footfall prediction with weather elasticities and confidence intervals."""
    store = db.query(Store).filter(Store.id == store_id).first()
    if not store:
        raise HTTPException(status_code=404, detail=f"Store with ID {store_id} not found")
    return generate_store_7day_forecast(store)

@router.get("/network")
def get_network_macro_forecast(db: Session = Depends(get_db)):
    """Generate network-wide 7-day predictive aggregate footfall trajectory."""
    stores = db.query(Store).all()
    if not stores:
        raise HTTPException(status_code=404, detail="No active retail nodes available for forecasting")

    # Aggregate individual store forecasts
    aggregate_series: Dict[str, Dict[str, Any]] = {}
    total_projected_visits = 0
    total_projected_revenue = 0.0

    for s in stores:
        f = generate_store_7day_forecast(s)
        total_projected_visits += f["total_7day_projected_footfall"]
        total_projected_revenue += f["projected_weekly_revenue_est"]
        for pt in f["series"]:
            d = pt["date"]
            if d not in aggregate_series:
                aggregate_series[d] = {
                    "date": d,
                    "day_name": pt["day_name"],
                    "projected_footfall": 0,
                    "lower_bound": 0,
                    "upper_bound": 0,
                    "projected_sales_k": 0.0,
                    "weather_condition": pt["weather_condition"],
                    "is_weekend": pt["is_weekend"]
                }
            aggregate_series[d]["projected_footfall"] += pt["projected_footfall"]
            aggregate_series[d]["lower_bound"] += pt["lower_bound"]
            aggregate_series[d]["upper_bound"] += pt["upper_bound"]
            aggregate_series[d]["projected_sales_k"] = round(aggregate_series[d]["projected_sales_k"] + pt["projected_sales_k"], 2)

    return {
        "nodes_monitored": len(stores),
        "total_7day_network_footfall": total_projected_visits,
        "total_7day_network_revenue_k": round(total_projected_revenue, 2),
        "average_daily_footfall": round(total_projected_visits / 7, 0),
        "forecast_horizon_days": 7,
        "series": list(aggregate_series.values())
    }

@router.get("/cannibalization")
def get_network_cannibalization(db: Session = Depends(get_db)):
    """Fetch spatial cannibalization risk matrix and overlapping catchment analysis."""
    return calculate_catchment_cannibalization(db)
