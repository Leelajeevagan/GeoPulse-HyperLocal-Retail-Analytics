import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database.connection import engine, Base
from app.routers import overview, location_analytics, footfall, mobility, reports, settings

# Ensure database tables exist
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="GeoPulse – Retail Spatial Intelligence API",
    description="Enterprise-grade retail spatial analytics, pedestrian telemetry, and catchment dynamics platform for Greater Boston.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware allowing localhost & network frontends
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(overview.router)
app.include_router(location_analytics.router)
app.include_router(footfall.router)
app.include_router(mobility.router)
app.include_router(reports.router)
app.include_router(settings.router)

@app.get("/", tags=["Health"])
def root():
    return {
        "service": "GeoPulse Retail Spatial Intelligence API",
        "version": "1.0.0",
        "status": "Online",
        "documentation": "/docs"
    }

@app.get("/api/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "environment": "simulated_telemetry",
        "nodes_monitored": 42,
        "database": "sqlite_ready"
    }
