import sys
import os
import requests

# Test heart disease endpoint
url = "http://localhost:8000/predict/heart-disease"
data = {
    "input_string": "57.0, 1.0, 0.0, 150.0, 276.0, 0.0, 0.0, 112.0, 1.0, 0.6, 1.0, 1.0, 1.0"
}
try:
    response = requests.post(url, json=data)
    print("Heart Disease Status Code:", response.status_code)
    print("Heart Disease Response:", response.json())
except Exception as e:
    print("Error:", e)
