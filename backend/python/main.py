from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import pandas as pd
import joblib
import os
import xgboost as xgb
from fastapi.middleware.cors import CORSMiddleware
from lab_inference import LabAnalysisRequest, predict_lab_severity, metadata as lab_metadata
import subprocess

app = FastAPI()

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load Model Pipeline
MODEL_PATH = os.path.join(os.path.dirname(__file__), '../../artificial intelligence/artificial intelligence/models/xgboost_heart_model_improved.pkl')

try:
    pipeline = joblib.load(MODEL_PATH)
    print(f"Model loaded successfully from {MODEL_PATH}")
    print(f"Model type: {type(pipeline)}")
    if isinstance(pipeline, dict):
        print(f"Pipeline keys: {list(pipeline.keys())}")
except Exception as e:
    print(f"Error loading model: {e}")
    pipeline = None

class HeartDiseaseInput(BaseModel):
    input_string: str

@app.get("/")
def read_root():
    return {"message": "SagDuyu AI Backend is running"}

@app.post("/predict/heart-disease")
def predict_heart_disease(data: HeartDiseaseInput):
    if pipeline is None:
        raise HTTPException(status_code=500, detail="Model not loaded")

    try:
        # Parse input string "57,0,0,140,241,0,1,123,1,0.2,1,0,3"
        # Expected columns based on training data:
        # age, sex, cp, trestbps, chol, fbs, restecg, thalach, exang, oldpeak, slope, ca, thal
        
        try:
            values = [float(x.strip()) for x in data.input_string.split(',')]
        except ValueError:
            raise HTTPException(status_code=400, detail="Lütfen tüm değerlerin sadece rakamlardan ve virgüllerden oluştuğuna emin olun.")
        
        if len(values) < 13:
             raise HTTPException(status_code=400, detail=f"13 adet değer bekleniyor, ancak {len(values)} adet girildi.")
        
        # Feature names must match training data
        feature_names = ['age', 'sex', 'cp', 'trestbps', 'chol', 'fbs', 'restecg', 'thalach', 'exang', 'oldpeak', 'slope', 'ca', 'thal']
        
        input_data = pd.DataFrame([values[:13]], columns=feature_names)
        
        # Extract model components from pipeline dictionary
        if isinstance(pipeline, dict):
            model = pipeline['model']
            scaler = pipeline['scaler']
            # Scale the input data using the same scaler used during training
            input_scaled = scaler.transform(input_data)
            # Predict
            prediction = model.predict(input_scaled)[0]
            probability = model.predict_proba(input_scaled)[0][1]
        else:
            # Fallback for old pipeline format
            prediction = pipeline.predict(input_data)[0]
            probability = pipeline.predict_proba(input_data)[0][1]
        
        result = "Hasta" if prediction == 1 else "Sağlıklı"
        risk_score = float(probability)
        
        return {
            "prediction": result,
            "risk_score": risk_score,
            "input_parsed": input_data.to_dict(orient='records')[0],
            "model_version": "improved_v2"
        }

    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Veri işlenirken beklenmeyen bir hata oluştu: {str(e)}")

# --- DenseNet Model Integration ---
DENSENET_MODEL_PATH = os.path.join(os.path.dirname(__file__), '../../artificial intelligence/models/densenet_pneumonia_model.h5')
densenet_model = None

try:
    # Lazy loading or load on startup. Loading Keras models can be slow and memory intensive.
    # We'll load it here.
    import tensorflow as tf
    from tensorflow.keras.models import load_model
    from tensorflow.keras.preprocessing import image
    import numpy as np
    from PIL import Image
    import io

    if os.path.exists(DENSENET_MODEL_PATH):
        densenet_model = load_model(DENSENET_MODEL_PATH)
        print(f"DenseNet model loaded successfully from {DENSENET_MODEL_PATH}")
    else:
        print(f"DenseNet model not found at {DENSENET_MODEL_PATH}")

except Exception as e:
    print(f"Error loading DenseNet model: {e}")

from fastapi import File, UploadFile

@app.post("/predict/pneumonia")
async def predict_pneumonia(file: UploadFile = File(...)):
    if densenet_model is None:
        raise HTTPException(status_code=500, detail="DenseNet model is not loaded (training might be in progress)")

    try:
        contents = await file.read()
        img = Image.open(io.BytesIO(contents))
        
        # Convert to RGB if grayscale
        if img.mode != "RGB":
            img = img.convert("RGB")
            
        # Resize to 224x224
        img = img.resize((224, 224))
        
        # Preprocess
        img_array = image.img_to_array(img)
        img_array = np.expand_dims(img_array, axis=0)
        img_array /= 255.0  # Normalize to [0, 1]
        
        # Predict
        prediction = densenet_model.predict(img_array)
        score = float(prediction[0][0]) # Probability of Pneumonia (class 1)
        
        # Threshold 0.5
        result = "Zatürre (Pneumonia)" if score > 0.5 else "Normal"
        confidence = score if score > 0.5 else 1 - score
        
        return {
            "prediction": result,
            "confidence": confidence,
            "raw_score": score
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing image: {str(e)}")

# --- SafeNet Multimodal Fusion Endpoint ---

class MultimodalFusionInput(BaseModel):
    clinical_risk: float
    image_risk: float

@app.post("/predict/multimodal-fusion")
def predict_multimodal_fusion(data: MultimodalFusionInput):
    clinical_risk = data.clinical_risk
    image_risk = data.image_risk
    
    # 1. Base Weighted Average (Late Fusion)
    # Give clinical data 60% weight and image 40% weight
    base_risk = (clinical_risk * 0.6) + (image_risk * 0.4)
    
    # 2. SafeNet Penalty (Conflict Resolution)
    safenet_used = True
    safenet_status = "Modeller Uyumlu - Rutin Füzyon Uygulandı"
    penalty = 0.0
    
    # If there's a significant disagreement (e.g. > 0.4 difference)
    if abs(clinical_risk - image_risk) > 0.4:
        safenet_status = "SafeNet Uyarısı: Modeller arası kritik uyumsuzluk tespit edildi. Sistem güvenliği gereği risk skoru yüksek tutulmuştur."
        penalty = 0.20 # Add 20% penalty
        
    final_risk = base_risk + penalty
    
    # 3. Safety Net Threshold
    # The final risk cannot be lower than 80% of the maximum individual risk
    min_safe_risk = max(clinical_risk, image_risk) * 0.8
    if final_risk < min_safe_risk:
        final_risk = min_safe_risk
        
    # Cap at 1.0
    final_risk = min(final_risk, 1.0)
    
    if final_risk >= 0.7:
        decision = "Kritik Risk - Uzman Hekim İncelemesi Şarttır"
    elif final_risk >= 0.4:
        decision = "Orta Risk - Gözlem ve Ek Tetkik Önerilir"
    else:
        decision = "Düşük Risk - Sağlıklı Profil"
        
    return {
        "final_risk_score": final_risk,
        "safenet_status": safenet_status,
        "safenet_used": safenet_used,
        "decision": decision
    }

# --- Lab Analysis Endpoints ---

@app.post("/api/lab-analysis/predict")
def predict_cbc(data: LabAnalysisRequest):
    try:
        return predict_lab_severity(data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/lab-analysis/model-info")
def get_lab_model_info():
    if lab_metadata is None:
        raise HTTPException(status_code=404, detail="Model metadata not found")
    return lab_metadata

@app.post("/api/lab-analysis/retrain")
def retrain_lab_model():
    script_path = os.path.join(os.path.dirname(__file__), "train_lab_model.py")
    try:
        subprocess.Popen(["python", script_path])
        return {"message": "Training started in background"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to start training: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
