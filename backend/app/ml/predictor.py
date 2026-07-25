import joblib
import numpy as np
import os
from typing import List, Dict, Any

class DiseasePredictor:
    def __init__(self):
        self.model = None
        self.feature_names = None
        self._load_model()
    
    def _load_model(self):
        base_dir = os.path.dirname(__file__)
        model_path = os.path.join(base_dir, "models", "xgboost_model.pkl")
        features_path = os.path.join(base_dir, "models", "feature_names.pkl")
        label_encoder_path = os.path.join(base_dir, "models", "label_encoder.pkl")
        
        if os.path.exists(model_path):
            self.model = joblib.load(model_path)
            self.feature_names = joblib.load(features_path)
            if os.path.exists(label_encoder_path):
                self.label_encoder = joblib.load(label_encoder_path)
            else:
                self.label_encoder = None
        else:
            print("Warning: Model not found. Run trainer.py first.")
            self.feature_names = []
            self.label_encoder = None
    
    def predict(self, symptoms: List[str]) -> Dict[str, Any]:
        if self.model is None:
            return {
                "predicted_disease": "Unknown (Model not trained)",
                "confidence_score": 0.0,
                "risk_level": "low",
                "top_features": []
            }
        
        # Create feature vector
        features = {name: 0 for name in self.feature_names}
        for symptom in symptoms:
            symptom_clean = symptom.lower().strip().replace(" ", "_")
            if symptom_clean in features:
                features[symptom_clean] = 1
        
        X = np.array([list(features.values())])
        proba = self.model.predict_proba(X)[0]
        pred_idx = np.argmax(proba)
        
        # Decode predicted class index to label
        if self.label_encoder is not None:
            disease = self.label_encoder.inverse_transform([self.model.classes_[pred_idx]])[0]
        else:
            disease = self.model.classes_[pred_idx]
            
        confidence = float(proba[pred_idx])
        
        # Risk level
        if confidence >= 0.8:
            risk = "critical"
        elif confidence >= 0.6:
            risk = "high"
        elif confidence >= 0.4:
            risk = "moderate"
        else:
            risk = "low"
        
        # Get top features (non-zero symptoms)
        top_features = [
            {"feature": name, "importance": 1.0} 
            for name, val in features.items() if val == 1
        ]
        top_features.sort(key=lambda x: x["importance"], reverse=True)
        
        # Recommended action
        actions = {
            "critical": "Seek immediate medical attention. This prediction indicates high risk.",
            "high": "Consult a doctor within 24 hours. Monitor symptoms closely.",
            "moderate": "Schedule a routine checkup. Monitor symptoms for changes.",
            "low": "Self-care may be sufficient. Consult doctor if symptoms worsen."
        }
        
        return {
            "predicted_disease": disease,
            "confidence_score": round(confidence, 4),
            "risk_level": risk,
            "top_features": top_features[:10],
            "recommended_action": actions[risk]
        }

predictor = DiseasePredictor()