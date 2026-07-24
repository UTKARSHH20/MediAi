from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class UserCreate(BaseModel):
    email: str
    password: str = Field(..., min_length=6)
    full_name: str
    role: str = "patient"

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    created_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class PatientCreate(BaseModel):
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    blood_type: Optional[str] = None
    height_cm: Optional[float] = None
    weight_kg: Optional[float] = None
    medical_history: Optional[Dict[str, Any]] = {}
    allergies: Optional[List[str]] = []
    medications: Optional[List[str]] = []

class PatientResponse(BaseModel):
    id: str
    user_id: str
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    blood_type: Optional[str] = None
    height_cm: Optional[float] = None
    weight_kg: Optional[float] = None
    created_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class SymptomPredictionRequest(BaseModel):
    symptoms: List[str]
    patient_id: Optional[str] = None

class SymptomPredictionResponse(BaseModel):
    id: str
    predicted_disease: str
    confidence_score: float
    risk_level: str
    top_features: List[Dict[str, Any]]
    recommended_action: str
    created_at: datetime

class DashboardStats(BaseModel):
    total_predictions: int
    critical_cases: int
    high_risk_cases: int
    accuracy_rate: float
    recent_predictions: List[Dict[str, Any]]