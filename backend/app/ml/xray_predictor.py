import os
import onnxruntime as ort
import numpy as np
from PIL import Image
import io

class XRayPredictor:
    def __init__(self):
        self.session = None
        self.class_names = ['NORMAL', 'PNEUMONIA']
        self._load_model()

    def _load_model(self):
        model_path = os.path.join(os.path.dirname(__file__), 'models', 'xray_cnn_model.onnx')
        if os.path.exists(model_path):
            try:
                # Create an InferenceSession using CPU
                self.session = ort.InferenceSession(model_path, providers=['CPUExecutionProvider'])
                self.error = None
            except Exception as e:
                self.session = None
                self.error = str(e)
                print(f"Failed to load ONNX model: {e}")
        else:
            self.session = None
            self.error = "Model file not found on disk."
            print("Warning: X-Ray ONNX model not found.")

    def _preprocess_image(self, image: Image.Image) -> np.ndarray:
        # Same logic as torchvision transforms:
        # Resize to 224x224
        image = image.resize((224, 224), Image.BILINEAR)
        # Convert to numpy array and scale to [0, 1]
        img_arr = np.array(image).astype(np.float32) / 255.0
        # PyTorch expects channels first: (C, H, W)
        img_arr = np.transpose(img_arr, (2, 0, 1))
        # Normalize
        mean = np.array([0.485, 0.456, 0.406]).reshape(3, 1, 1)
        std = np.array([0.229, 0.224, 0.225]).reshape(3, 1, 1)
        img_arr = (img_arr - mean) / std
        # Add batch dimension: (1, C, H, W)
        img_arr = np.expand_dims(img_arr, axis=0)
        return img_arr.astype(np.float32)

    def _softmax(self, x):
        e_x = np.exp(x - np.max(x))
        return e_x / e_x.sum(axis=1, keepdims=True)

    def predict(self, image_bytes: bytes) -> dict:
        if self.session is None:
            err_msg = getattr(self, "error", "Unknown error loading model")
            return {
                "predicted_disease": "Unknown (Model not trained)",
                "confidence_score": 0.0,
                "risk_level": "low",
                "recommended_action": f"Model not available: {err_msg}"
            }

        try:
            image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
            input_array = self._preprocess_image(image)
            
            # Run inference
            input_name = self.session.get_inputs()[0].name
            outputs = self.session.run(None, {input_name: input_array})[0]
            
            # Post-process (softmax)
            probabilities = self._softmax(outputs)[0]
            pred_idx = np.argmax(probabilities)
            confidence_score = float(probabilities[pred_idx])
            predicted_class = self.class_names[pred_idx]
            
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
