import sys
import os
import requests
from PIL import Image

# Create a dummy image
img = Image.new('RGB', (224, 224), color = 'white')
img.save('dummy.png')

url = "http://localhost:8000/predict/pneumonia"
files = {'file': open('dummy.png', 'rb')}

try:
    response = requests.post(url, files=files)
    print("Pneumonia Status Code:", response.status_code)
    print("Pneumonia Response:", response.json())
except Exception as e:
    print("Error:", e)
