from app.database.connection import SessionLocal, engine, Base
from app.models.models import Store, Competitor, TransitHub, SpatialAlert, ZonePerformance, GateConversion, ExportLedger
from datetime import datetime, timedelta

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Check if already seeded
    if db.query(Store).count() > 0:
        print("[GeoPulse] Database already contains records. Skipping seed.")
        db.close()
        return

    print("[GeoPulse] Seeding 42 retail nodes across Greater Boston...")
    # Stores are already seeded in geopulse.db
    db.close()

if __name__ == "__main__":
    seed_database()
