import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score, confusion_matrix, roc_auc_score
import xgboost as xgb
import json
import os

# 1. Load Data
data_path = os.path.join(os.path.dirname(__file__), '../data/XGBoost_heart.csv')
print(f"Loading data from: {data_path}")

try:
    df = pd.read_csv(data_path)
except FileNotFoundError:
    print("Error: Data file not found. Please ensure 'XGBoost_heart.csv' is in the 'data' directory.")
    exit(1)

# 2. Missing Value Control
print("\nMissing Values:")
print(df.isnull().sum())
# Drop rows with missing values if any (or handle them)
df.dropna(inplace=True)

# 3. Preprocessing
X = df.drop('target', axis=1)
y = df['target']

# Categorical and Numerical columns
categorical_cols = ['cp', 'thal', 'slope']
numerical_cols = [col for col in X.columns if col not in categorical_cols]

# Create Preprocessor
preprocessor = ColumnTransformer(
    transformers=[
        ('num', StandardScaler(), numerical_cols),
        ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_cols)
    ])

# 4. Split Data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# 5. Build XGBoost Model
model = xgb.XGBClassifier(
    use_label_encoder=False,
    eval_metric='logloss',
    random_state=42
)

# Create Pipeline
pipeline = Pipeline(steps=[('preprocessor', preprocessor),
                           ('classifier', model)])

# Train Model
print("\nTraining XGBoost Model...")
pipeline.fit(X_train, y_train)

# 6. Evaluate Model
y_pred = pipeline.predict(X_test)
y_prob = pipeline.predict_proba(X_test)[:, 1]

accuracy = accuracy_score(y_test, y_pred)
conf_matrix = confusion_matrix(y_test, y_pred)
roc_auc = roc_auc_score(y_test, y_prob)

print("\nModel Evaluation Results:")
print(f"Accuracy: {accuracy:.4f}")
print("Confusion Matrix:")
print(conf_matrix)
print(f"ROC-AUC Score: {roc_auc:.4f}")

# Save metrics to file
metrics_path = os.path.join(os.path.dirname(__file__), '../models/metrics.txt')
with open(metrics_path, 'w') as f:
    f.write(f"Accuracy: {accuracy:.4f}\n")
    f.write(f"Confusion Matrix:\n{conf_matrix}\n")
    f.write(f"ROC-AUC Score: {roc_auc:.4f}\n")

# 7. Save Model
# Save the full pipeline for easy reuse (preprocessing + model)
import joblib

model_dir = os.path.join(os.path.dirname(__file__), '../models')
os.makedirs(model_dir, exist_ok=True)

pipeline_path = os.path.join(model_dir, 'heart_disease_pipeline.pkl')
joblib.dump(pipeline, pipeline_path)
print(f"\nFull pipeline saved to: {pipeline_path}")

# Also save the booster as JSON as requested
model_path = os.path.join(model_dir, 'xgboost_heart_model.json')
booster = pipeline.named_steps['classifier'].get_booster()
booster.save_model(model_path)
print(f"XGBoost model (JSON) saved to: {model_path}")

# 8. Identify Test Data
print("\n--- Test Data Info ---")
print(f"Total Test Samples: {len(X_test)}")
print("Sample Test Data Indices (Original CSV Indices):")
print(X_test.index.tolist()[:20]) # Print first 20 indices
print("\nSample Test Data (First 5 rows):")
print(X_test.head().to_string())
print("\nCorresponding Targets:")
print(y_test.head().to_string())

