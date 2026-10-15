from sqlalchemy import Column, DateTime, ForeignKey, Integer, String

from app.database import Base


class EventDifficulty(Base):
    __tablename__ = "event_difficulty"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("flood_events.episode_id"), nullable=False, index=True)
    horizon_days = Column(Integer, nullable=False)
    difficulty_level = Column(String(10), nullable=False)
    created_at = Column(DateTime, nullable=True)
    