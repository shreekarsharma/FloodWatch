from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.flood_event import FloodEvent

router = APIRouter(prefix="/api/flood-events", tags=["Flood Events"])


@router.get("/")
def get_flood_events(db: Session = Depends(get_db)):
    events = db.query(FloodEvent).order_by(FloodEvent.episode_id).all()

    return [
        {
            "episode_id": event.episode_id,
            "start_date": event.start_date,
            "end_date": event.end_date,
            "duration_days": event.duration_days,
            "peak_discharge": event.peak_discharge,
            "peak_date": event.peak_date,
        }
        for event in events
    ]