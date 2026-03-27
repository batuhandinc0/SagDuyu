import os
import joblib
import json
import numpy as np
import pandas as pd
from pydantic import BaseModel, conint
from typing import Optional, List

MODEL_DIR = os.path.join(os.path.dirname(__file__), 'models')
MODEL_PATH = os.path.join(MODEL_DIR, 'cbc_model.pkl')
METADATA_PATH = os.path.join(MODEL_DIR, 'cbc_model_metadata.json')

# Load Model Pipeline
pipeline = None
metadata = None

try:
    if os.path.exists(MODEL_PATH) and os.path.exists(METADATA_PATH):
        pipeline = joblib.load(MODEL_PATH)
        with open(METADATA_PATH, 'r', encoding='utf-8') as f:
            metadata = json.load(f)
        print(f"Lab model loaded successfully from {MODEL_PATH}")
    else:
        print(f"Lab model not found at {MODEL_PATH}. Prediction service unavailable.")
except Exception as e:
    print(f"Error loading lab model: {e}")

class LabAnalysisRequest(BaseModel):
    patient_id: Optional[str] = None
    hemoglobin: float
    wbc: float
    rbc: float
    hematocrit: float
    mcv: float
    mch: float
    mchc: float
    platelet_count: float
    rdw: float
    neutrophils: float
    lymphocytes: float
    monocytes: float

class LabAnalysisResponse(BaseModel):
    patient_id: Optional[str] = None
    predicted_severity: str
    risk_score: float
    warning_level: str
    possible_diagnoses: List[str]
    recommended_departments: List[str]
    recommended_tests: List[str]
    clinical_comment: str
    model_confidence: float

def predict_lab_severity(data: LabAnalysisRequest) -> LabAnalysisResponse:
    if pipeline is None or metadata is None:
        raise Exception("Model not loaded. Please train the model first.")

    features = metadata['features']
    
    # Mapping request format to internal model features format
    input_dict = {
        'hemoglobin_g_dl': data.hemoglobin,
        'wbc_cells_ul': data.wbc,
        'rbc_million_ul': data.rbc,
        'hematocrit_': data.hematocrit,
        'mcv_fl': data.mcv,
        'mch_pg': data.mch,
        'mchc_g_dl': data.mchc,
        'platelet_count_cells_ul': data.platelet_count,
        'rdw_': data.rdw,
        'neutrophils_': data.neutrophils,
        'lymphocytes_': data.lymphocytes,
        'monocytes_': data.monocytes
    }

    # Ensure exact same columns as training
    try:
        input_df = pd.DataFrame([input_dict], columns=features)
    except KeyError:
        # Fallback if mapping changed
        mapped_dict = {}
        for f in features:
            for k in input_dict.keys():
                if k.split('_')[0] in f:
                    mapped_dict[f] = input_dict[k]
                    break
        input_df = pd.DataFrame([mapped_dict], columns=features)
        
    prediction_num = pipeline.predict(input_df)[0]
    probabilities = pipeline.predict_proba(input_df)[0]
    
    # Calculate Risk Score (0-100)
    # Mapping probabilities to risk score
    # Classes: 0: Mild, 1: Moderate, 2: Severe
    label_map = metadata['label_mapping']
    severity_label = label_map.get(str(prediction_num), label_map.get(prediction_num, "Mild"))
    
    prob_mild = probabilities[0] if len(probabilities) > 0 else 0
    prob_mod = probabilities[1] if len(probabilities) > 1 else 0
    prob_sev = probabilities[2] if len(probabilities) > 2 else 0

    base_score = 0
    if severity_label == 'Mild':
        base_score = 10 + (prob_mild * 25)
    elif severity_label == 'Moderate':
        base_score = 36 + (prob_mod * 29)
    else:
        base_score = 66 + (prob_sev * 29)
        
    rules_score_addition = 0
    if data.hemoglobin < 10 or data.hemoglobin > 18:
        rules_score_addition += 5
    if data.wbc > 12000 or data.wbc < 3000:
        rules_score_addition += 5
    if data.platelet_count < 100000 or data.platelet_count > 450000:
        rules_score_addition += 5

    final_score = min(max(int(base_score + rules_score_addition), 0), 100)
    
    if final_score <= 30:
        warning_level = "Düşük Risk"
    elif final_score <= 60:
        warning_level = "Orta Risk"
    else:
        warning_level = "Yüksek Risk"
        
    # Rules based clinical feedback
    possible_diagnoses = []
    recommended_tests = []
    clinical_comment = "Normal CBC profili."
    recommended_departments = ["Dahiliye"] # Default primary
    
    if data.hemoglobin < 12:
        if data.mcv < 80 and data.rdw > 15:
            possible_diagnoses.append("Demir Eksikliği Anemisi")
            recommended_tests.extend(["Ferritin", "Iron panel", "Peripheral smear"])
        elif data.mcv > 100:
            possible_diagnoses.append("Makrositik Anemi")
            recommended_tests.extend(["Vitamin B12", "Folate"])
        else:
            possible_diagnoses.append("Normositik Anemi")
            recommended_tests.append("Reticulocyte count")
        clinical_comment = "Hemoglobin düşük. Anemi belirtileri mevcut."
        recommended_departments = ["Hematoloji", "Dahiliye"]
        
    if data.wbc > 11000 and data.neutrophils > 70:
        possible_diagnoses.append("Bakteriyel Enfeksiyon")
        recommended_tests.extend(["CRP", "ESR / Sedimantasyon"])
        clinical_comment = "Lökosit ve nötrofil yüksekliği enfeksiyonu işaret ediyor."
        recommended_departments = ["Enfeksiyon Hastalıkları", "Dahiliye"]
    elif data.wbc > 10000 and data.lymphocytes > 40:
        possible_diagnoses.append("Viral Enfeksiyon")
        recommended_tests.append("CRP")
        clinical_comment = "Lenfosit hakimiyeti viral bir süreç olabilir."
        recommended_departments = ["Enfeksiyon Hastalıkları", "Dahiliye"]
        
    if data.platelet_count < 150000:
        possible_diagnoses.append("Trombositopeni")
        recommended_tests.append("Peripheral smear")
        clinical_comment = "Trombosit düşüklüğü mevcut, kanama riski değerlendirilmeli."
        if "Hematoloji" not in recommended_departments:
            recommended_departments.insert(0, "Hematoloji")
    elif data.platelet_count > 450000:
        possible_diagnoses.append("Reaktif Trombositoz")
        recommended_tests.append("CRP")
        clinical_comment = "Trombosit yüksekliği inflamasyona ikincil gelişmiş olabilir."
        
    if data.monocytes > 10:
        possible_diagnoses.append("Kronik İnflamasyon / İyileşme Fazı")
        clinical_comment = "Monositoz enfeksiyon sonrası veya kronik süreçlerde görülebilir."
        recommended_tests.append("ESR / Sedimantasyon")
        
    if len(possible_diagnoses) == 0:
        possible_diagnoses.append("Özgül patoloji gözlenmedi")
        
    # Deduplicate tests
    recommended_tests = list(set(recommended_tests))
    if len(recommended_tests) == 0:
         recommended_tests = ["Rutin Biyokimya (Genel)"]

    return LabAnalysisResponse(
        patient_id=data.patient_id,
        predicted_severity=severity_label,
        risk_score=final_score,
        warning_level=warning_level,
        possible_diagnoses=possible_diagnoses[:4],
        recommended_departments=recommended_departments,
        recommended_tests=recommended_tests,
        clinical_comment=clinical_comment,
        model_confidence=float(max(probabilities))
    )
