from sqlalchemy import Column, Integer, String, ForeignKey, Float, DateTime
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.sql import func
from app.db.session import Base

class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"))
    model_version = Column(String)
    prediction_type = Column(String) # 'symptoms' or 'image'
    input_data = Column(JSONB)
    predicted_disease = Column(String)
    confidence_score = Column(Float)
    risk_level = Column(String)
    shap_values = Column(JSONB)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
