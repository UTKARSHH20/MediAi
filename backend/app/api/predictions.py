from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Prediction
from app.schemas.schemas import SymptomPredictionRequest, SymptomPredictionResponse
from app.auth.dependencies import get_current_user
from app.ml.predictor import predictor
from app.ml.explainer import explainer
from app.ml.xray_predictor import xray_predictor
import uuid
from typing import List, Optional
from datetime import datetime

router = APIRouter()

@router.post("/symptoms", response_model=SymptomPredictionResponse)
def predict_symptoms(request: SymptomPredictionRequest, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    result = predictor.predict(request.symptoms)
    shap_result = explainer.explain(request.symptoms)
    
    # Save to database
    prediction = Prediction(
        id=str(uuid.uuid4()),
        patient_id=request.patient_id,
        user_id=current_user.id,
        prediction_type="symptom",
        input_data={"symptoms": request.symptoms},
        predicted_disease=result["predicted_disease"],
        confidence_score=result["confidence_score"],
        risk_level=result["risk_level"],
        top_features=result["top_features"],
        recommended_action=result["recommended_action"]
    )
    db.add(prediction)
    db.commit()
    
    return {
        "id": prediction.id,
        "predicted_disease": result["predicted_disease"],
        "confidence_score": result["confidence_score"],
        "risk_level": result["risk_level"],
        "top_features": result["top_features"],
        "recommended_action": result["recommended_action"],
        "created_at": datetime.utcnow()
    }

@router.post("/xray")
async def predict_xray(
    file: UploadFile = File(...),
    patient_id: Optional[str] = Form(None),
    db: Session = Depends(get_db), 
    current_user=Depends(get_current_user)
):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File provided is not an image.")
    
    contents = await file.read()
    result = xray_predictor.predict(contents)
    
    if result["predicted_disease"] == "Error" or "Unknown" in result["predicted_disease"]:
        raise HTTPException(status_code=500, detail=result["recommended_action"])

    # Save to database
    prediction = Prediction(
        id=str(uuid.uuid4()),
        patient_id=patient_id,
        user_id=current_user.id,
        prediction_type="xray",
        input_data={"filename": file.filename},
        predicted_disease=result["predicted_disease"],
        confidence_score=result["confidence_score"],
        risk_level=result["risk_level"],
        top_features=[],
        recommended_action=result["recommended_action"]
    )
    db.add(prediction)
    db.commit()
    
    return {
        "id": prediction.id,
        "predicted_disease": result["predicted_disease"],
        "confidence_score": result["confidence_score"],
        "risk_level": result["risk_level"],
        "recommended_action": result["recommended_action"],
        "created_at": datetime.utcnow()
    }

@router.get("/history")
def get_history(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    predictions = db.query(Prediction).filter(Prediction.user_id == current_user.id).order_by(Prediction.created_at.desc()).limit(50).all()
    return predictions