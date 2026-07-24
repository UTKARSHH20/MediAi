from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Patient
from app.schemas.schemas import PatientCreate, PatientResponse
from app.auth.dependencies import get_current_user
import uuid
from typing import List

router = APIRouter()

@router.post("/", response_model=PatientResponse)
def create_patient(patient: PatientCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    db_patient = Patient(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        **patient.dict()
    )
    db.add(db_patient)
    db.commit()
    db.refresh(db_patient)
    return db_patient

@router.get("/", response_model=List[PatientResponse])
def get_patients(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    if current_user.role in ["doctor", "admin"]:
        return db.query(Patient).all()
    return db.query(Patient).filter(Patient.user_id == current_user.id).all()