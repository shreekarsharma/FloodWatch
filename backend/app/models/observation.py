from sqlalchemy import Column, Date, Float, Integer

from app.database import Base


class Observation(Base):
    __tablename__ = "observations"

    id = Column(Integer, primary_key=True, index=True)
    observation_date = Column(Date, nullable=False, index=True)
    discharge = Column(Float, nullable=True)
    rainfall = Column(Float, nullable=True)
    soil_moisture = Column(Float, nullable=True)
    temperature = Column(Float, nullable=True)
    evapotranspiration = Column(Float, nullable=True)
    storage = Column(Float, nullable=True)