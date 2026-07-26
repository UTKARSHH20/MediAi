import shap
import joblib
import numpy as np
import os
from typing import List, Dict, Any

class SHAPExplainer:
    def __init__(self):
        self.explainer = None
        self.model = None
        self.feature_names = None
        self._load()
    
    def _load(self):
        base_dir = os.path.dirname(__file__)
        model_path = os.path.join(base_dir, "models", "xgboost_model.pkl")
        features_path = os.path.join(base_dir, "models", "feature_names.pkl")
        
        try:
            if os.path.exists(model_path):
                self.model = joblib.load(model_path)
                self.feature_names = joblib.load(features_path)
                self.explainer = shap.TreeExplainer(self.model)
        except Exception as e:
            print(f"Explainer failed to load models: {e}. Retraining dynamically...")
            from app.ml.trainer import train_models
            train_models()
            self.model = joblib.load(model_path)
            self.feature_names = joblib.load(features_path)
            self.explainer = shap.TreeExplainer(self.model)
    
    def explain(self, symptoms: List[str]) -> Dict[str, Any]:
        if self.explainer is None:
            return {"shap_values": {}, "base_value": 0}
        
        features = {name: 0 for name in self.feature_names}
        for symptom in symptoms:
            symptom_clean = symptom.lower().strip().replace(" ", "_")
            if symptom_clean in features:
                features[symptom_clean] = 1
        
        X = np.array([list(features.values())])
        shap_values = self.explainer.shap_values(X)
        
        # For multi-class, get SHAP for predicted class
        if isinstance(shap_values, list):
            pred = self.model.predict(X)[0]
            class_idx = list(self.model.classes_).index(pred)
            shap_vals = shap_values[class_idx][0]
        elif len(shap_values.shape) == 3:
            pred = self.model.predict(X)[0]
            class_idx = list(self.model.classes_).index(pred)
            shap_vals = shap_values[0, :, class_idx]
        else:
            shap_vals = shap_values[0]
        
        # Format as dict
        shap_dict = {
            name: float(val) 
            for name, val in zip(self.feature_names, shap_vals)
            if val != 0
        }
        shap_dict = dict(sorted(shap_dict.items(), key=lambda x: abs(x[1]), reverse=True)[:10])
        
        return {
            "shap_values": shap_dict,
            "base_value": float(self.explainer.expected_value[0] if isinstance(self.explainer.expected_value, list) else self.explainer.expected_value)
        }

explainer = SHAPExplainer()