import os
import json
import uuid
import datetime
import pandas as pd
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.models.models import Store, ExportLedger

EXPORTS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "exports"))
os.makedirs(EXPORTS_DIR, exist_ok=True)

def generate_report_file(db: Session, request_data: Dict[str, Any]) -> ExportLedger:
    format_type = request_data.get("output_format", "CSV").upper()
    title = request_data.get("title", "GeoPulse_Spatial_Report")
    clean_title = "".join(c if c.isalnum() else "_" for c in title)
    timestamp_str = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    report_id = f"REP-{datetime.datetime.now().year}-{uuid.uuid4().hex[:6].upper()}"
    
    stores = db.query(Store).all()
    stores_data = []
    for s in stores:
        stores_data.append({
            "Store_Code": s.code,
            "Store_Name": s.name,
            "Category": s.category,
            "Format": s.format,
            "Zone": s.zone,
            "Address": s.address,
            "Latitude": s.latitude,
            "Longitude": s.longitude,
            "Square_Footage": s.square_footage,
            "Employee_Count": s.employee_count,
            "Daily_Footfall": s.daily_footfall,
            "Real_Time_Footfall": s.real_time_footfall,
            "Capture_Ratio_Pct": s.pedestrian_capture_ratio,
            "Pressure_Index": s.footfall_pressure_index,
            "Competitor_Pressure": s.competitor_pressure,
            "Cannibalization_Pct": s.cannibalization_pct,
            "Capacity_Utilization": s.capacity_utilization,
            "Opportunity_Score": s.opportunity_score,
            "Peak_Window": s.peak_window,
            "Gross_Sales_Daily": s.gross_sales_daily,
            "Gross_Sales_MTD": s.gross_sales_mtd,
            "Conversion_Rate": s.conversion_rate,
            "Avg_Dwell_Mins": s.average_dwell_time
        })
        
    df = pd.DataFrame(stores_data)
    
    if format_type == "CSV":
        filename = f"{clean_title}_{timestamp_str}.csv"
        file_path = os.path.join(EXPORTS_DIR, filename)
        df.to_csv(file_path, index=False)
        category = "Spatial CSV Export"
        
    elif format_type == "GEOJSON":
        filename = f"{clean_title}_{timestamp_str}.geojson"
        file_path = os.path.join(EXPORTS_DIR, filename)
        features = []
        for s in stores:
            features.append({
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [s.longitude, s.latitude]
                },
                "properties": {
                    "code": s.code,
                    "name": s.name,
                    "zone": s.zone,
                    "category": s.category,
                    "daily_footfall": s.daily_footfall,
                    "capacity_utilization": s.capacity_utilization,
                    "pressure_index": s.footfall_pressure_index
                }
            })
        geojson_doc = {
            "type": "FeatureCollection",
            "metadata": {
                "generated_at": datetime.datetime.now().isoformat(),
                "report_id": report_id,
                "title": title
            },
            "features": features
        }
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(geojson_doc, f, indent=2)
        category = "Geospatial GeoJSON"
        
    elif format_type == "PARQUET":
        filename = f"{clean_title}_{timestamp_str}.parquet"
        file_path = os.path.join(EXPORTS_DIR, filename)
        df.to_parquet(file_path, index=False)
        category = "Telemetry Parquet"
        
    else: # Default to PDF
        filename = f"{clean_title}_{timestamp_str}.pdf"
        file_path = os.path.join(EXPORTS_DIR, filename)
        try:
            from reportlab.lib.pagesizes import letter
            from reportlab.pdfgen import canvas
            from reportlab.lib import colors
            
            c = canvas.Canvas(file_path, pagesize=letter)
            c.setFont("Helvetica-Bold", 18)
            c.setFillColor(colors.HexColor("#0f172a"))
            c.drawString(50, 750, "GeoPulse – Enterprise Retail Spatial Intelligence")
            
            c.setFont("Helvetica-Bold", 12)
            c.setFillColor(colors.HexColor("#0d9488"))
            c.drawString(50, 730, f"Report ID: {report_id}  |  Generated: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
            
            c.setStrokeColor(colors.HexColor("#cbd5e1"))
            c.line(50, 720, 560, 720)
            
            c.setFont("Helvetica", 10)
            c.setFillColor(colors.HexColor("#334155"))
            c.drawString(50, 695, f"Spatial Scope: {request_data.get('store_cluster', 'All Retail Nodes')}")
            c.drawString(50, 680, f"Aggregation Window: {request_data.get('aggregation_period', '7-Day Aggregation')}")
            c.drawString(50, 665, f"Mesh Resolution: {request_data.get('spatial_mesh', 'Hexagonal H3')}")
            c.drawString(50, 650, f"Selected Metrics: {', '.join(request_data.get('metrics', ['Footfall', 'Sales']))}")
            
            c.setFont("Helvetica-Bold", 11)
            c.setFillColor(colors.HexColor("#0f172a"))
            c.drawString(50, 620, "Monitored Retail Venues Summary (Top Nodes):")
            
            # Draw Table Header
            c.setFillColor(colors.HexColor("#f1f5f9"))
            c.rect(50, 595, 510, 20, fill=1, stroke=0)
            c.setFillColor(colors.HexColor("#0f172a"))
            c.setFont("Helvetica-Bold", 9)
            c.drawString(55, 602, "Code")
            c.drawString(130, 602, "Store Name")
            c.drawString(270, 602, "Zone")
            c.drawString(350, 602, "Daily Footfall")
            c.drawString(440, 602, "Gross Sales MTD")
            c.drawString(520, 602, "Cap %")
            
            y = 575
            c.setFont("Helvetica", 9)
            for s in stores[:16]:
                c.setFillColor(colors.HexColor("#334155"))
                c.drawString(55, y, s.code)
                c.drawString(130, y, s.name[:22])
                c.drawString(270, y, s.zone[:14])
                c.drawString(350, y, f"{s.daily_footfall:,}")
                c.drawString(440, y, f"${s.gross_sales_mtd:,.0f}")
                c.drawString(520, y, f"{s.capacity_utilization}%")
                y -= 22
                
            c.setFont("Helvetica-Oblique", 8)
            c.setFillColor(colors.HexColor("#64748b"))
            c.drawString(50, 40, "Confidential – GeoPulse Spatial Telemetry & Analytics Platform. All rights reserved.")
            c.save()
        except Exception:
            # Fallback text based document if reportlab fails
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(f"GeoPulse Retail Intelligence - Report {report_id}\n")
                f.write(f"Title: {title}\nDate: {datetime.datetime.now()}\n\n")
                f.write(df.to_string())
        category = "Executive Strategy PDF"

    file_size = os.path.getsize(file_path)
    size_formatted = f"{file_size / 1024:.1f} KB" if file_size < 1024 * 1024 else f"{file_size / (1024*1024):.2f} MB"
    
    ledger_entry = ExportLedger(
        report_id=report_id,
        filename=filename,
        category=category,
        file_format=format_type,
        timestamp=datetime.datetime.now(),
        file_size_bytes=file_size,
        file_size_formatted=size_formatted,
        generated_by=request_data.get("generated_by", "Spatial Telemetry Service"),
        status="Ready",
        download_url=f"/api/reports/download/{report_id}"
    )
    
    db.add(ledger_entry)
    db.commit()
    db.refresh(ledger_entry)
    return ledger_entry

