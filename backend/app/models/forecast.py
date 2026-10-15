from sqlalchemy import Column, Date, Float, ForeignKey, Integer

from app.database import Base


class ForecastResult(Base):
    __tablename__ = "forecasts"

    id = Column(Integer, primary_key=True, index=True)
    episode_id = Column(
        Integer,
        ForeignKey("flood_events.episode_id"),
        nullable=True,
        index=True,
    )
    forecast_date = Column(Date, nullable=False, index=True)
    horizon_days = Column(Integer, nullable=False)
    predicted_discharge = Column(Float, nullable=False)