from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import torch
from torchvision import transforms, models
from PIL import Image
import io
import torch.nn as nn
import csv
import os
import time

# -------------------------
# Config / Paths
# -------------------------
CHECKPOINT_PATH = r"C:\Users\kartik\Desktop\Envira 2.0\Models\best_resnet18.pth"
NUM_CLASSES = 6
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
CSV_FILE = "sensor_data.csv"

# -------------------------
# Class Mapping
# -------------------------
CLASS_MAP = {
    0: "Good",
    1: "Moderate",
    2: "Severe",
    3: "Unhealthy for Sensitive Groups",
    4: "Unhealthy",
    5: "Very Unhealthy"
}

# -------------------------
# Image Transform
# -------------------------
TRANSFORM = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406],
                         [0.229, 0.224, 0.225])
])

# -------------------------
# Model Setup
# -------------------------
def load_model():
    model = models.resnet18(weights=models.ResNet18_Weights.DEFAULT)
    
    # Freeze layers (same as training)
    for idx, child in enumerate(model.children(), start=1):
        if idx < 7:
            for param in child.parameters():
                param.requires_grad = False
    
    # Replace final layer
    num_ftrs = model.fc.in_features
    model.fc = nn.Sequential(
        nn.Dropout(0.5),
        nn.Linear(num_ftrs, NUM_CLASSES)
    )
    
    # Load checkpoint
    state_dict = torch.load(CHECKPOINT_PATH, map_location=DEVICE)
    model.load_state_dict(state_dict)
    model.to(DEVICE)
    model.eval()
    
    return model

MODEL = load_model()

# -------------------------
# FastAPI Setup
# -------------------------
app = FastAPI(title="Envira Air Quality API")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace with frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------
# Prediction Endpoint
# -------------------------
@app.post("/api/predict")
async def predict(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        img = Image.open(io.BytesIO(contents)).convert("RGB")
        input_tensor = TRANSFORM(img).unsqueeze(0).to(DEVICE)
        
        with torch.no_grad():
            outputs = MODEL(input_tensor)
            _, predicted = torch.max(outputs, 1)
            predicted_class = CLASS_MAP[int(predicted.item())]
            confidence = torch.nn.functional.softmax(outputs, dim=1)[0, predicted.item()].item()
        
        return {"predicted_class": predicted_class, "confidence": confidence}
    
    except Exception as e:
        return {"error": str(e)}

# -------------------------
# Sensor Data Endpoint
# -------------------------
@app.get("/api/sensor-data")
async def get_sensor_data():
    try:
        if not os.path.isfile(CSV_FILE):
            return {"error": "Sensor CSV file not found"}
        
        with open(CSV_FILE, 'r') as f:
            reader = csv.reader(f)
            rows = list(reader)
        
        if len(rows) <= 1:
            return {"error": "No sensor data available"}
        
        # Get last reading
        last_row = rows[-1]
        if len(last_row) >= 3:
            timestamp_str = last_row[0]
            pm25 = float(last_row[1])
            mq135 = float(last_row[2])
            
            return {
                "pm25": round(pm25, 1),
                "mq135": round(mq135, 1),
                "timestamp": time.time(),
                "data_timestamp": timestamp_str,
                "source": "real_sensor"
            }
        
        return {"error": "Malformed sensor data"}
    
    except Exception as e:
        return {"error": str(e)}

# -------------------------
# Server Startup
# -------------------------
if __name__ == "__main__":
    import uvicorn
    print("Starting FastAPI server on http://localhost:8000")
    print("Model loaded successfully!")
    print("Ready for air quality predictions!")
    print(f"Sensor data endpoint: http://localhost:8000/api/sensor-data")
    uvicorn.run(app, host="0.0.0.0", port=8000)
