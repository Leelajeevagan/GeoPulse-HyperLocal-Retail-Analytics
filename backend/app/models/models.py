from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.connection import Base

class Store(Base):
    __tablename__ = "stores"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, index=True)
    name = Column(String(150), nullable=False)
    brand = Column(String(100), default="GeoPulse Retail")
    category = Column(String(100))
    format = Column(String(50))
    zone = Column(String(100), index=True)
    territory = Column(String(100), default="Greater Boston Metro Area", index=True)
    address = Column(String(255))
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    square_footage = Column(Integer)
    employee_count = Column(Integer)
    real_time_footfall = Column(Integer, default=0)
    daily_footfall = Column(Integer, default=0)
    weekly_footfall = Column(Integer, default=0)
    pedestrian_capture_ratio = Column(Float, default=0.0)
    footfall_pressure_index = Column(Integer, default=50)
    competitor_pressure = Column(String(50), default="Moderate")
    cannibalization_pct = Column(Float, default=0.0)
    capacity_utilization = Column(Float, default=75.0)
    opportunity_score = Column(Integer, default=80)
    peak_window = Column(String(50), default="12:00 - 14:00")
    movement_trend = Column(String(50), default="+5.0%")
    gross_sales_mtd = Column(Float, default=0.0)
    gross_sales_daily = Column(Float, default=0.0)
    conversion_rate = Column(Float, default=15.0)
    average_dwell_time = Column(Float, default=25.0)

    competitors = relationship("Competitor", back_populates="store", cascade="all, delete-orphan")
    alerts = relationship("SpatialAlert", back_populates="store")
    gate_conversions = relationship("GateConversion", back_populates="store")

class Competitor(Base):
    __tablename__ = "competitors"

    id = Column(Integer, primary_key=True, index=True)
    store_id = Column(Integer, ForeignKey("stores.id"), nullable=True)
    name = Column(String(150), nullable=False)
    brand = Column(String(100))
    category = Column(String(100))
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    distance_meters = Column(Integer, default=300)
    pressure_level = Column(String(50), default="Moderate")

    store = relationship("Store", back_populates="competitors")

class TransitHub(Base):
    __tablename__ = "transit_hubs"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    hub_type = Column(String(50), default="Subway / Train")
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    daily_ridership = Column(Integer, default=25000)
    lines_served = Column(String(150))

class SpatialAlert(Base):
    __tablename__ = "spatial_alerts"

    id = Column(Integer, primary_key=True, index=True)
    store_id = Column(Integer, ForeignKey("stores.id"), nullable=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    alert_type = Column(String(50), default="Footfall Surge")
    severity = Column(String(50), default="Warning")
    status = Column(String(50), default="Active")
    created_at = Column(DateTime, default=datetime.utcnow)
    zone = Column(String(100))
    impact_metric = Column(String(100))

    store = relationship("Store", back_populates="alerts")

class ZonePerformance(Base):
    __tablename__ = "zone_performances"

    id = Column(Integer, primary_key=True, index=True)
    zone_name = Column(String(100), nullable=False)
    territory = Column(String(100), default="Greater Boston Metro Area")
    customer_visits = Column(Integer, default=0)
    revenue = Column(Float, default=0.0)
    capacity_utilization = Column(Float, default=75.0)
    yoy_performance = Column(Float, default=10.0)
    store_count = Column(Integer, default=4)
    latitude = Column(Float, default=42.3550)
    longitude = Column(Float, default=-71.0600)

class GateConversion(Base):
    __tablename__ = "gate_conversions"

    id = Column(Integer, primary_key=True, index=True)
    store_id = Column(Integer, ForeignKey("stores.id"), nullable=False)
    gate_name = Column(String(100), nullable=False)
    total_inflows = Column(Integer, default=0)
    store_capture_pct = Column(Float, default=0.0)
    performance_score = Column(String(50), default="Optimal")

    store = relationship("Store", back_populates="gate_conversions")

class ExportLedger(Base):
    __tablename__ = "export_ledgers"

    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(String(50), unique=True, index=True)
    filename = Column(String(200), nullable=False)
    category = Column(String(100))
    file_format = Column(String(50), default="PDF")
    timestamp = Column(DateTime, default=datetime.utcnow)
    file_size_bytes = Column(Integer, default=0)
    file_size_formatted = Column(String(50), default="1.2 MB")
    generated_by = Column(String(100), default="Spatial Telemetry Daemon")
    status = Column(String(50), default="Completed")
    download_url = Column(String(255))
