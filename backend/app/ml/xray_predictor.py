import os
import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image
import io

class XRayPredictor:
    def __init__(self):
        self.device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")
        self.model = None
        self.class_names = ['NORMAL', 'PNEUMONIA']
        self._load_model()
        
        self.transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
        ])

    def _load_model(self):
        model_path = os.path.join(os.path.dirname(__file__), 'models', 'xray_cnn_model.pth')
        if os.path.exists(model_path):
            self.model = models.mobilenet_v2(weights=None)
            num_ftrs = self.model.classifier[1].in_features
            self.model.classifier[1] = nn.Linear(num_ftrs, 2)
            
            checkpoint = torch.load(model_path, map_location=self.device)
            self.model.load_state_dict(checkpoint['model_state_dict'])
            self.class_names = checkpoint.get('class_names', ['NORMAL', 'PNEUMONIA'])
            
            self.model = self.model.to(self.device)
            self.model.eval()
        else:
            print("Warning: X-Ray model not found. Run xray_trainer.py first.")

    def predict(self, image_bytes: bytes) -> dict:
        if self.model is None:
            return {
                "predicted_disease": "Unknown (Model not trained)",
                "confidence_score": 0.0,
                "risk_level": "low",
                "recommended_action": "Model not available"
            }

        try:
            image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
            input_tensor = self.transform(image).unsqueeze(0).to(self.device)
            
            with torch.no_grad():
                outputs = self.model(input_tensor)
                probabilities = torch.nn.functional.softmax(outputs, dim=1)[0]
                confidence, preds = torch.max(probabilities, 0)
                
            predicted_class = self.class_names[preds.item()]
            confidence_score = confidence.item()
            
            if predicted_class == 'PNEUMONIA':
                if confidence_score > 0.9:
                    risk_level = "critical"
                    recommended_action = "Consult a doctor immediately. High probability of pneumonia."
                elif confidence_score > 0.7:
                    risk_level = "high"
                    recommended_action = "Schedule a doctor visit soon. Possible signs of pneumonia."
                else:
                    risk_level = "moderate"
                    recommended_action = "Monitor symptoms and consider consulting a doctor."
            else:
                risk_level = "low"
                recommended_action = "No signs of pneumonia detected. Maintain regular health checkups."
                
            return {
                "predicted_disease": predicted_class,
                "confidence_score": confidence_score,
                "risk_level": risk_level,
                "recommended_action": recommended_action
            }
        except Exception as e:
            print(f"Error during prediction: {e}")
            return {
                "predicted_disease": "Error",
                "confidence_score": 0.0,
                "risk_level": "unknown",
                "recommended_action": "Failed to process image."
            }

xray_predictor = XRayPredictor()
