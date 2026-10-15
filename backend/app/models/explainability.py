from sqlalchemy import Column, Float, ForeignKey, Integer, String

from app.database import Base


class ExplainabilityResult(Base):
    __tablename__ = "explainability_results"

    id = Column(Integer, primary_key=True, index=True)
    horizon_days = Column(Integer, nullable=False)
    feature_name = Column(String(100), nullable=False)
    importance_value = Column(Float, nullable=False)