from sqlalchemy import Column, Date, Float, Integer

from app.database import Base


class FloodEvent(Base):
    __tablename__ = "flood_events"

    id = Column(Integer, primary_key=True, index=True)
    episode_id = Column(Integer, unique=True, nullable=False, index=True)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    duration_days = Column(Integer, nullable=False)
    peak_discharge = Column(Float, nullable=False)
    peak_date = Column(Date, nullable=False)