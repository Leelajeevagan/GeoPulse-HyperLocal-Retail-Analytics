from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from app.database.connection import get_db
from app.models.models import Store, Competitor, TransitHub, GateConversion
from app.schemas.schemas import StoreOut, CompetitorOut, TransitHubOut, GateConversionOut
from app.services.analytics_service import (
    get_hourly_pedestrian_profile,
    get_walking_isochrones
)

router = APIRouter(prefix="/api/locations", tags=["Location Analytics"])

@router.get("/stores", response_model=List[StoreOut])
def get_stores(
    territory: Optional[str] = None,
    zone: Optional[str] = None,
    category: Optional[str] = None,
    format: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Store)
    if territory and territory != "All Territories":
        query = query.filter(Store.territory == territory)
    if zone and zone != "All Zones":
        query = query.filter(Store.zone == zone)
    if category and category != "All Categories":
        query = query.filter(Store.category == category)
    if format and format != "All Formats":
        query = query.filter(Store.format == format)
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (Store.name.ilike(search_filter)) |
            (Store.code.ilike(search_filter)) |
            (Store.address.ilike(search_filter)) |
            (Store.zone.ilike(search_filter))
        )
    return query.all()

@router.get("/stores/{store_id}", response_model=StoreOut)
def get_store_detail(store_id: int, db: Session = Depends(get_db)):
    store = db.query(Store).filter(Store.id == store_id).first()
    if not store:
        raise HTTPException(status_code=404, detail="Store not found")
    return store

@router.get("/competitors", response_model=List[CompetitorOut])
def get_competitors(db: Session = Depends(get_db)):
    return db.query(Competitor).all()

@router.get("/transit-hubs", response_model=List[TransitHubOut])
def get_transit_hubs(db: Session = Depends(get_db)):
    return db.query(TransitHub).all()

@router.get("/demographics")
def get_demographics(territory: str = "Greater Boston Metro Area", zone: Optional[str] = None):
    # Dynamic values based on selected zone
    if zone == "Kendall Sq":
        return {
            "territory": "Greater Boston Metro Area",
            "zone": "Kendall Sq",
            "median_household_income": 134500,
            "median_household_income_fmt": "$134,500",
            "young_professionals_pct": 72.8,
            "higher_degree_pct": 89.4,
            "retail_propensity_index": 164,
            "retail_propensity_label": "Very High Propensity",
            "daytime_population": 48200
        }
    elif zone == "Seaport":
        return {
            "territory": "Greater Boston Metro Area",
            "zone": "Seaport",
            "median_household_income": 142000,
            "median_household_income_fmt": "$142,000",
            "young_professionals_pct": 69.5,
            "higher_degree_pct": 84.1,
            "retail_propensity_index": 158,
            "retail_propensity_label": "High Spend Propensity",
            "daytime_population": 52400
        }
    return {
        "territory": "Greater Boston Metro Area",
        "zone": zone or "Back Bay Core",
        "median_household_income": 118400,
        "median_household_income_fmt": "$118,400",
        "young_professionals_pct": 64.2,
        "higher_degree_pct": 78.5,
        "retail_propensity_index": 142,
        "retail_propensity_label": "High Propensity (Index 142)",
        "daytime_population": 76900
    }

@router.get("/hourly-volume/{store_id}")
def get_hourly_volume(store_id: int):
    return get_hourly_pedestrian_profile(store_id)

@router.get("/gate-conversion/{store_id}", response_model=List[GateConversionOut])
def get_gate_conversion(store_id: int, db: Session = Depends(get_db)):
    gates = db.query(GateConversion).filter(GateConversion.store_id == store_id).all()
    if not gates:
        # Fallback to general gates
        gates = db.query(GateConversion).all()
    return gates

@router.get("/isochrones/{store_id}")
def get_isochrones(store_id: int, db: Session = Depends(get_db)):
    store = db.query(Store).filter(Store.id == store_id).first()
    if store:
        return get_walking_isochrones(store.latitude, store.longitude)
    return get_walking_isochrones()

