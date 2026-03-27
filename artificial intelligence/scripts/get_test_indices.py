import pandas as pd
from sklearn.model_selection import train_test_split
import os

# Load Data
data_path = os.path.join(os.path.dirname(__file__), '../data/XGBoost_heart.csv')
try:
    df = pd.read_csv(data_path)
except FileNotFoundError:
    print("Error: Data file not found.")
    exit(1)

X = df.drop('target', axis=1)
y = df['target']

# Split Data (Same random_state as training)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

print("Test Data Indices (Original CSV Row Numbers - 0-based):")
# Sort for easier reading
sorted_indices = sorted(X_test.index.tolist())
print(sorted_indices)

print("\n--- Sample Test Rows for You to Try ---")
# Select a few diverse examples (Healthy and Sick)
sample_indices = X_test.index[:5]
for idx in sample_indices:
    row = df.loc[idx]
    print(f"\nIndex: {idx}")
    print(f"Target: {'Hasta (1)' if row['target'] == 1 else 'Sağlıklı (0)'}")
    # Format as comma separated string for easy copy-paste
    values = row.drop('target').values
    input_str = ", ".join([str(x) for x in values])
    print(f"Input String: {input_str}")
