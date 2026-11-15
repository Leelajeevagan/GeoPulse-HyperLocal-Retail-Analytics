import os
from fastapi import APIRouter, Depends, HTTPException, Query, Response
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from app.database.connection import get_db
from app.models.models import ExportLedger
from app.schemas.schemas import ExportLedgerOut, CustomReportRequest
from app.services.export_service import generate_report_file, EXPORTS_DIR

router = APIRouter(prefix="/api/reports", tags=["Reports & Exports"])

@router.get("/kpis")
def get_reports_kpis(db: Session = Depends(get_db)):
    total_generated = db.query(ExportLedger).count()
    return {
        "reports_generated": total_generated + 1280,
        "reports_generated_growth": "+24.8% vs last month",
        "scheduled_dispatches": 18,
        "scheduled_dispatches_sub": "18 Active Automated Crons",
        "data_volume_exported": "4.82 TB",
        "data_volume_growth": "+380 GB this week",
        "failed_exports": 0,
        "sla_uptime": "99.98% Pipeline SLA",
        "storage_quota_used_gb": 74.2,
        "storage_quota_total_gb": 100.0,
        "storage_quota_pct": 74.2,
        "s3_sync_status": "Connected & Synced",
        "s3_last_synced": "4 minutes ago (us-east-1-telemetry)"
    }

@router.get("/templates")
def get_report_templates():
    return [
        {
            "id": "tpl-exec-sales",
            "title": "Executive Sales & Footfall Summary",
            "category": "Executive Strategy",
            "description": "High-level synthesis of pedestrian volume, realized revenue, capture efficiency, and cross-district profitability across all 42 store nodes.",
            "formats": ["PDF", "CSV", "GeoJSON"],
            "recommended_format": "PDF",
            "default_cluster": "All Retail Nodes",
            "metrics": ["Footfall Density", "Sales Correlation", "Capacity Utilization"]
        },
        {
            "id": "tpl-mobility-od",
            "title": "Customer Mobility & Origin-Destination Flow Analysis",
            "category": "Customer Mobility",
            "description": "Spatial vectors connecting MBTA transit terminals, commuter stations, and parking arteries directly to retail entrance portals.",
            "formats": ["GeoJSON", "CSV", "Parquet"],
            "recommended_format": "GeoJSON",
            "default_cluster": "Core Downtown Corridor",
            "metrics": ["Origin-Destination Vectors", "Dwell Time Distribution"]
        },
        {
            "id": "tpl-cannibalization",
            "title": "Store Network Cannibalization & Catchment Feasibility",
            "category": "Real Estate Optimization",
            "description": "Quantifies overlap percentages between adjacent boutique formats, micro-catchment boundary friction, and estimated sales displacement.",
            "formats": ["PDF", "CSV"],
            "recommended_format": "CSV",
            "default_cluster": "Back Bay & Fenway",
            "metrics": ["Competitor Proximity Saturation", "Cannibalization Overlap"]
        },
        {
            "id": "tpl-peak-dwell",
            "title": "Hourly Peak Dwell & Footfall Intensity Matrix",
            "category": "Store Operations",
            "description": "Granular 24-hour heat telemetry, lunch surge durations, commuter throughput, and atmospheric elasticity cross-factored with weather.",
            "formats": ["CSV", "Parquet", "PDF"],
            "recommended_format": "Parquet",
            "default_cluster": "All 42 Monitored Venues",
            "metrics": ["Footfall Density", "Dwell Time Distribution", "Weather Cross-Factors"]
        }
    ]

@router.get("/ledger")
def get_export_ledger(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=50),
    search: Optional[str] = None,
    format_filter: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(ExportLedger)
    if format_filter and format_filter != "All Formats":
        query = query.filter(ExportLedger.file_format == format_filter)
    if search:
        s = f"%{search}%"
        query = query.filter(
            (ExportLedger.filename.ilike(s)) |
            (ExportLedger.report_id.ilike(s)) |
            (ExportLedger.category.ilike(s)) |
            (ExportLedger.generated_by.ilike(s))
        )
        
    total_count = query.count()
    records = query.order_by(ExportLedger.timestamp.desc()).offset((page - 1) * page_size).limit(page_size).all()
    
    return {
        "items": [
            {
                "id": r.id,
                "report_id": r.report_id,
                "filename": r.filename,
                "category": r.category,
                "file_format": r.file_format,
                "timestamp": r.timestamp.strftime("%Y-%m-%d %H:%M:%S") if r.timestamp else "",
                "file_size_formatted": r.file_size_formatted,
                "generated_by": r.generated_by,
                "status": r.status,
                "download_url": f"/api/reports/download/{r.report_id}"
            }
            for r in records
        ],
        "total": total_count,
        "page": page,
        "page_size": page_size,
        "total_pages": (total_count + page_size - 1) // page_size
    }

@router.post("/generate", response_model=ExportLedgerOut)
def create_custom_report(payload: CustomReportRequest, db: Session = Depends(get_db)):
    ledger_entry = generate_report_file(db, {
        "title": payload.title,
        "store_cluster": payload.store_cluster,
        "spatial_mesh": payload.spatial_mesh,
        "aggregation_period": payload.aggregation_period,
        "output_format": payload.output_format,
        "export_destination": payload.export_destination,
        "metrics": payload.metrics,
        "generated_by": "Enterprise Intelligence User"
    })
    return ledger_entry

@router.post("/quick-export/{template_id}", response_model=ExportLedgerOut)
def quick_export(template_id: str, format: Optional[str] = None, db: Session = Depends(get_db)):
    template_titles = {
        "tpl-exec-sales": ("Executive_Sales_Footfall_Summary", "PDF"),
        "tpl-mobility-od": ("Customer_Mobility_OD_Flow", "GEOJSON"),
        "tpl-cannibalization": ("Store_Network_Cannibalization_Catchment", "CSV"),
        "tpl-peak-dwell": ("Hourly_Peak_Dwell_Intensity_Matrix", "PARQUET")
    }
    title, def_format = template_titles.get(template_id, ("GeoPulse_Report", "CSV"))
    chosen_format = format or def_format
    
    ledger_entry = generate_report_file(db, {
        "title": title,
        "store_cluster": "All Retail Nodes",
        "aggregation_period": "7-Day Aggregation",
        "output_format": chosen_format,
        "generated_by": "One-Click Quick Export"
    })
    return ledger_entry

@router.get("/download/{report_id}")
def download_report(report_id: str, db: Session = Depends(get_db)):
    ledger = db.query(ExportLedger).filter(ExportLedger.report_id == report_id).first()
    if not ledger:
        raise HTTPException(status_code=404, detail="Report ID not found")
        
    file_path = os.path.join(EXPORTS_DIR, ledger.filename)
    if not os.path.exists(file_path):
        # Generate on the fly if preseeded
        generate_report_file(db, {
            "title": ledger.filename.rsplit(".", 1)[0],
            "output_format": ledger.file_format,
            "generated_by": ledger.generated_by
        })
        # Check again
        matching_files = [f for f in os.listdir(EXPORTS_DIR) if f.startswith(ledger.filename.rsplit(".", 1)[0][:15])]
        if matching_files:
            file_path = os.path.join(EXPORTS_DIR, matching_files[0])
        else:
            raise HTTPException(status_code=404, detail="Export file could not be generated")
            
    media_types = {
        "PDF": "application/pdf",
        "CSV": "text/csv",
        "GEOJSON": "application/geo+json",
        "PARQUET": "application/octet-stream"
    }
    media_type = media_types.get(ledger.file_format.upper(), "application/octet-stream")
    
    return FileResponse(
        path=file_path,
        filename=ledger.filename,
        media_type=media_type,
        headers={"Content-Disposition": f'attachment; filename="{ledger.filename}"'}
    )

