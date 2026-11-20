import os
import sys
import pytest

backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database.connection import Base, get_db
from app.models.models import Store, Competitor, TransitHub, ZonePerformance, ExportLedger
from app.main import app

TEST_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    
    # Create sample store
    store = Store(
        id=1,
        code="BOS-BB-01",
        name="Back Bay Flagship",
        category="Apparel",
        format="Flagship",
        zone="Back Bay Commercial",
        territory="Greater Boston Metro Area",
        latitude=42.3498,
        longitude=-71.0825,
        real_time_footfall=1200,
        daily_footfall=15000
    )
    db.add(store)
    
    # Create sample competitor
    comp = Competitor(
        id=1,
        name="Nordstrom Newbury",
        brand="Nordstrom",
        category="Apparel",
        latitude=42.3502,
        longitude=-71.0815,
        pressure_level="High"
    )
    db.add(comp)
    
    # Create sample transit hub
    hub = TransitHub(
        id=1,
        name="Back Bay MBTA Station",
        hub_type="Subway & Commuter Rail",
        latitude=42.3473,
        longitude=-71.0757,
        daily_ridership=25000,
        lines_served="Orange Line, Commuter Rail"
    )
    db.add(hub)
    
    # Create sample zone performance
    zone = ZonePerformance(
        id=1,
        zone_name="Back Bay Commercial",
        territory="Greater Boston Metro Area",
        customer_visits=942800,
        revenue=8.42,
        store_count=9
    )
    db.add(zone)
    
    # Create sample export ledger
    ledger = ExportLedger(
        id=1,
        report_id="EXP-TEST-001",
        filename="Automated_Test_Report.csv",
        category="Footfall Summary",
        file_format="CSV",
        file_size_bytes=15360,
        file_size_formatted="15 KB",
        generated_by="Spatial Telemetry Daemon",
        status="Completed",
        download_url="/api/reports/download/EXP-TEST-001"
    )
    db.add(ledger)
    
    db.commit()
    db.close()
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def client():
    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
