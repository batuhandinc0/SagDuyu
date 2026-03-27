import pandas as pd
import numpy as np
import os
import joblib
import json
from datetime import datetime
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.metrics import classification_report, accuracy_score, f1_score, precision_score, recall_score, confusion_matrix
import warnings

warnings.filterwarnings('ignore')

# XGBoost / LightGBM fallback
try:
    from xgboost import XGBClassifier
    HAS_XGB = True
except ImportError:
    HAS_XGB = False

try:
    from lightgbm import LGBMClassifier
    HAS_LGBM = True
except ImportError:
    HAS_LGBM = False

def clean_column_names(df):
    # Normalize column names to snake_case
    df.columns = (df.columns
                  .str.replace(r'[\(\)/]+', '', regex=True)
                  .str.replace(r'µ', 'u', regex=True)
                  .str.replace(r'[^a-zA-Z0-9]', '_', regex=True)
                  .str.lower()
                  .str.replace(r'_+', '_', regex=True)
                  .str.strip('_'))
    return df

def train_model():
    dataset_path = os.path.join(os.path.dirname(__file__), '../../artificial intelligence/lab_datası/cbc_health_severity_dataset.csv')
    
    if not os.path.exists(dataset_path):
         print(f"Error: Dataset not found at {dataset_path}")
         return
         
    df = pd.read_csv(dataset_path)
    df = clean_column_names(df)
    
    print("Columns in dataset:", df.columns.tolist())
    
    # Target and features
    target_col = 'severity'
    if target_col not in df.columns:
        print(f"Error: Target column '{target_col}' not found.")
        return
    
    # Drop patient id or any non-numeric info
    cols_to_drop = [target_col]
    if 'patientid' in df.columns:
        cols_to_drop.append('patientid')
    if 'patient_id' in df.columns:
        cols_to_drop.append('patient_id')
        
    X = df.drop(columns=[col for col in cols_to_drop if col in df.columns])
    y = df[target_col]
    
    # Check for missing values
    X.fillna(X.median(), inplace=True)
    
    # Map target variables to integers for models like XGBoost
    label_mapping = {'Mild': 0, 'Moderate': 1, 'Severe': 2}
    reverse_mapping = {0: 'Mild', 1: 'Moderate', 2: 'Severe'}
    y_mapped = y.map(label_mapping)
    
    X_train, X_test, y_train, y_test = train_test_split(X, y_mapped, test_size=0.2, random_state=42, stratify=y_mapped)
    
    models = {
        'RandomForest': RandomForestClassifier(n_estimators=100, class_weight='balanced', random_state=42),
        'GradientBoosting': GradientBoostingClassifier(n_estimators=100, random_state=42)
    }
    
    if HAS_XGB:
        models['XGBoost'] = XGBClassifier(use_label_encoder=False, eval_metric='mlogloss', random_state=42)
    if HAS_LGBM:
        models['LightGBM'] = LGBMClassifier(random_state=42, verbose=-1)
        
    best_model_name = None
    best_f1 = -1
    best_pipeline = None
    best_metrics = {}
    
    print("Training models...")
    for name, model in models.items():
        pipeline = Pipeline([
            ('scaler', StandardScaler()),
            ('classifier', model)
        ])
        
        pipeline.fit(X_train, y_train)
        y_pred = pipeline.predict(X_test)
        
        f1 = f1_score(y_test, y_pred, average='weighted')
        print(f"{name} Weighted F1-Score: {f1:.4f}")
        
        if f1 > best_f1:
            best_f1 = f1
            best_model_name = name
            best_pipeline = pipeline
            best_metrics = {
                'accuracy': accuracy_score(y_test, y_pred),
                'f1_weighted': f1,
                'precision_weighted': precision_score(y_test, y_pred, average='weighted'),
                'recall_weighted': recall_score(y_test, y_pred, average='weighted')
            }
            
    print(f"\nBest Model selected: {best_model_name} with F1: {best_f1:.4f}")
    
    # Create model output directory
    model_dir = os.path.join(os.path.dirname(__file__), 'models')
    os.makedirs(model_dir, exist_ok=True)
    
    model_path = os.path.join(model_dir, 'cbc_model.pkl')
    metadata_path = os.path.join(model_dir, 'cbc_model_metadata.json')
    
    joblib.dump(best_pipeline, model_path)
    
    metadata = {
        'model_name': best_model_name,
        'training_date': datetime.now().isoformat(),
        'features': X.columns.tolist(),
        'metrics': best_metrics,
        'label_mapping': reverse_mapping
    }
    
    with open(metadata_path, 'w', encoding='utf-8') as f:
        json.dump(metadata, f, ensure_ascii=False, indent=4)
        
    print(f"Model saved to {model_path}")
    print(f"Metadata saved to {metadata_path}")

if __name__ == "__main__":
    train_model()
