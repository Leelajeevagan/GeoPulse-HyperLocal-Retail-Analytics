from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict, Any

router = APIRouter(prefix="/api/settings", tags=["Settings"])

class SystemSettings(BaseModel):
    map_tile_provider: str = "CartoDB Dark Matter"
    telemetry_refresh_interval_sec: int = 30
    s3_bucket_name: str = "geopulse-retail-telemetry-prod"
    aws_region: str = "us-east-1"
    webhook_url: str = "https://hooks.slack.com/services/GEOPULSE/ALERTS/DEPLOY"
    understaffing_threshold_pct: int = 35
    cannibalization_threshold_pct: int = 15

# In-memory settings state
CURRENT_SETTINGS = SystemSettings()

@router.get("")
def get_settings():
    return CURRENT_SETTINGS

@router.post("")
def update_settings(settings: SystemSettings):
    global CURRENT_SETTINGS
    CURRENT_SETTINGS = settings
    return {"status": "success", "settings": CURRENT_SETTINGS}

