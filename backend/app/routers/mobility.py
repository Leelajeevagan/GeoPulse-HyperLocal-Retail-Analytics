from fastapi import APIRouter
from app.services.analytics_service import get_origin_destination_flows

router = APIRouter(prefix="/api/mobility", tags=["Customer Mobility"])

@router.get("/flows")
def get_flows():
    return get_origin_destination_flows()

@router.get("/modal-split")
def get_modal_split():
    return [
        {"mode": "Pedestrian Direct Walk", "percentage": 48.5, "volume": 1864000, "color": "#0d9488"},
        {"mode": "MBTA Subway Inflow", "percentage": 32.4, "volume": 1245000, "color": "#06b6d4"},
        {"mode": "Bus & Commuter Rail", "percentage": 11.8, "volume": 453000, "color": "#6366f1"},
        {"mode": "Rideshare / Vehicle", "percentage": 7.3, "volume": 280910, "color": "#f59e0b"}
    ]

