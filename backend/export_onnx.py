import torch
from app.ml.xray_predictor import XRayPredictor
import os

print("Loading PyTorch model...")
predictor = XRayPredictor()
model = predictor.model
model.eval()

# Create dummy input
dummy_input = torch.randn(1, 3, 224, 224, device=predictor.device)

# Export to ONNX
onnx_path = os.path.join(os.path.dirname(__file__), 'app', 'ml', 'models', 'xray_cnn_model.onnx')
print(f"Exporting to {onnx_path}...")
torch.onnx.export(
    model, 
    dummy_input, 
    onnx_path, 
    export_params=True,
    opset_version=12,
    do_constant_folding=True,
    input_names=['input'],
    output_names=['output'],
    dynamic_axes={'input': {0: 'batch_size'}, 'output': {0: 'batch_size'}}
)
print("Export complete!")
