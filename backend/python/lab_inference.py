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
    
    label_map = metadata['label_mapping']
    severity_label = label_map.get(str(prediction_num), label_map.get(prediction_num, "Mild"))
    
    prob_mild = probabilities[0] if len(probabilities) > 0 else 0
    prob_mod = probabilities[1] if len(probabilities) > 1 else 0
    prob_sev = probabilities[2] if len(probabilities) > 2 else 0

    # 1. Dinamik AI Risk Skoru (0-100)
    # Orta risk %50 etki, Şiddetli risk %100 etki yapar
    base_score = (prob_mod * 40) + (prob_sev * 90)

    # 2. Tıbbi Kural Motoru (Medical Rule Engine)
    possible_diagnoses = []
    recommended_tests = []
    recommended_departments = ["Dahiliye"] # Default
    clinical_comment = "Genel kan tablosu olağan sınırlarda görünüyor."
    rules_score_addition = 0
    
    # HEMOGLOBİN DEĞERLENDİRMESİ
    if data.hemoglobin < 10:
        rules_score_addition += 30
        possible_diagnoses.append("Şiddetli Anemi")
        recommended_tests.extend(["Ferritin", "B12", "Periferik Yayma"])
        if "Hematoloji" not in recommended_departments:
            recommended_departments.insert(0, "Hematoloji")
    elif data.hemoglobin < 12:
        rules_score_addition += 10
        possible_diagnoses.append("Hafif Anemi / Kan Düşüklüğü")
        recommended_tests.extend(["Demir Paneli", "Ferritin"])
    elif data.hemoglobin > 18:
        rules_score_addition += 15
        possible_diagnoses.append("Polisitemi (Kan Koyulaşması)")
        recommended_tests.append("Eritropoietin (EPO)")
        if "Hematoloji" not in recommended_departments:
            recommended_departments.insert(0, "Hematoloji")

    # WBC (LÖKOSİT) DEĞERLENDİRMESİ
    if data.wbc > 15000:
        rules_score_addition += 30
        possible_diagnoses.append("Şiddetli Enfeksiyon / İnflamasyon")
        recommended_tests.extend(["CRP", "Kan Kültürü"])
        if "Enfeksiyon Hastalıkları" not in recommended_departments:
            recommended_departments.insert(0, "Enfeksiyon Hastalıkları")
    elif data.wbc > 11000:
        rules_score_addition += 10
        possible_diagnoses.append("Hafif Bakteriyel veya Viral Süreç")
        recommended_tests.append("CRP")
    elif data.wbc < 3000:
        rules_score_addition += 20
        possible_diagnoses.append("Lökopeni (Bağışıklık Zayıflığı)")
        recommended_tests.append("Periferik Yayma")
        if "Hematoloji" not in recommended_departments:
            recommended_departments.insert(0, "Hematoloji")

    # TROMBOSİT (PLATELET) DEĞERLENDİRMESİ
    if data.platelet_count < 100000:
        rules_score_addition += 30
        possible_diagnoses.append("Kritik Trombositopeni (Kanama Riski)")
        recommended_tests.extend(["Periferik Yayma", "Kanama Zamanı"])
        if "Hematoloji" not in recommended_departments:
            recommended_departments.insert(0, "Hematoloji")
    elif data.platelet_count < 150000:
        rules_score_addition += 10
        possible_diagnoses.append("Hafif Trombositopeni")
    elif data.platelet_count > 500000:
        rules_score_addition += 15
        possible_diagnoses.append("Reaktif Trombositoz")
        recommended_tests.append("CRP")

    # KLİNİK YORUMU OLUŞTUR
    if rules_score_addition > 0:
        clinical_comment = "Bazı kan değerlerinde normal referans aralıklarının dışında sapmalar tespit edildi. Uzman hekim değerlendirmesi önerilir."
    if len(possible_diagnoses) == 0:
        possible_diagnoses.append("Özgül patoloji gözlenmedi")

    # FİNAL SKOR VE SEVİYE
    final_score = min(max(int(base_score + rules_score_addition), 0), 100)
    
    if final_score <= 30:
        warning_level = "Düşük Risk"
    elif final_score <= 60:
        warning_level = "Orta Risk"
    else:
        warning_level = "Yüksek Risk"
        
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
