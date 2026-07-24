import os
import sys

# Add backend directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.ml.xray_predictor import xray_predictor

def test_prediction():
    print("Testing X-Ray Predictor...")
    
    # Path to a known pneumonia image
    test_image_path = os.path.join("data", "chest_xray", "test", "PNEUMONIA", "person100_bacteria_475.jpeg")
    
    # Fallback to any file if that specific one doesn't exist
    if not os.path.exists(test_image_path):
        pneumonia_dir = os.path.join("data", "chest_xray", "test", "PNEUMONIA")
        if os.path.exists(pneumonia_dir):
            files = os.listdir(pneumonia_dir)
            if files:
                test_image_path = os.path.join(pneumonia_dir, files[0])
            else:
                print("No test images found.")
                return
    
    print(f"Using image: {test_image_path}")
    
    try:
        with open(test_image_path, "rb") as f:
            image_bytes = f.read()
            
        result = xray_predictor.predict(image_bytes)
        
        print("\n--- Prediction Result ---")
        print(f"Predicted Disease: {result['predicted_disease']}")
        print(f"Confidence Score: {result['confidence_score']:.4f}")
        print(f"Risk Level: {result['risk_level']}")
        print(f"Recommended Action: {result['recommended_action']}")
        print("-------------------------\n")
        
        if result['predicted_disease'] == 'PNEUMONIA':
            print("SUCCESS: The model correctly identified PNEUMONIA.")
        else:
            print("WARNING: The model identified the image as NORMAL, but it's a PNEUMONIA image. (This can happen if confidence is low or it's a tricky image)")
            
    except Exception as e:
        print(f"Error testing predictor: {e}")

if __name__ == "__main__":
    test_prediction()
