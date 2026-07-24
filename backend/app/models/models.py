from sqlalchemy import Column, String, DateTime, Float, JSON, ForeignKey, Enum
from sqlalchemy.dialects.sqlite import TEXT
from app.database import Base
import uuid
from datetime import datetime

class User(Base):
    __tablename__ = "users"
    id = Column(TEXT, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), default="patient")  # patient, doctor, admin
    is_active = Column(String(10), default="true")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Patient(Base):
    __tablename__ = "patients"
    id = Column(TEXT, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(TEXT, ForeignKey("users.id"), nullable=False)
    date_of_birth = Column(String(50), nullable=True)
    gender = Column(String(20), nullable=True)
    blood_type = Column(String(10), nullable=True)
    height_cm = Column(Float, nullable=True)
    weight_kg = Column(Float, nullable=True)
    medical_history = Column(JSON, default=dict)
    allergies = Column(JSON, default=list)
    medications = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)

class Prediction(Base):
    __tablename__ = "predictions"
    id = Column(TEXT, primary_key=True, default=lambda: str(uuid.uuid4()))
    patient_id = Column(TEXT, ForeignKey("patients.id"), nullable=True)
    user_id = Column(TEXT, ForeignKey("users.id"), nullable=False)
    model_version = Column(String(50), default="v1.0")
    prediction_type = Column(String(50), default="symptom")  # symptom, lab, image, multimodal
    input_data = Column(JSON, default=dict)
    predicted_disease = Column(String(255), nullable=False)
    confidence_score = Column(Float, nullable=False)
    risk_level = Column(String(50), nullable=False)  # low, moderate, high, critical
    top_features = Column(JSON, default=list)
    recommended_action = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)