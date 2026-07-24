from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.models import Prediction
from app.auth.dependencies import get_current_user
from typing import Dict, Any
from datetime import datetime, timedelta

router = APIRouter()

@router.get("/stats")
def get_stats(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    total = db.query(Prediction).filter(Prediction.user_id == current_user.id).count()
    critical = db.query(Prediction).filter(
        Prediction.user_id == current_user.id,
        Prediction.risk_level == "critical"
    ).count()
    high = db.query(Prediction).filter(
        Prediction.user_id == current_user.id,
        Prediction.risk_level == "high"
    ).count()
    
    # Mock accuracy for now
    accuracy = 0.89
    
    recent = db.query(Prediction).filter(
        Prediction.user_id == current_user.id
    ).order_by(Prediction.created_at.desc()).limit(5).all()
    
    return {
        "total_predictions": total,
        "critical_cases": critical,
        "high_risk_cases": high,
        "accuracy_rate": accuracy,
        "recent_predictions": [
            {
                "id": p.id,
                "disease": p.predicted_disease,
                "confidence": p.confidence_score,
                "risk": p.risk_level,
                "date": p.created_at
            } for p in recent
        ]
    }

@router.get("/trends")
def get_trends(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    # Return mock trend data for last 30 days
    from datetime import datetime, timedelta
    data = []
    for i in range(30):
        date = datetime.utcnow() - timedelta(days=i)
        data.append({
            "date": date.strftime("%Y-%m-%d"),
            "predictions": (i % 5) + 1,
            "critical": 1 if i % 7 == 0 else 0
        })
    return list(reversed(data))

@router.get("/disease-distribution")
def get_disease_distribution(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    results = db.query(
        Prediction.predicted_disease,
        func.count(Prediction.id).label("count")
    ).filter(Prediction.user_id == current_user.id).group_by(Prediction.predicted_disease).all()
    
    return [
        {"disease": r.predicted_disease, "count": r.count}
        for r in results
    ]