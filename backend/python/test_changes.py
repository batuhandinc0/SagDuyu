import requests

def pred(s):
    res = requests.post('http://localhost:8000/predict/heart-disease', json={'input_string': s}).json()
    print(res['prediction'], f"({res['risk_score']*100:.1f}%)")

base_str='37.0,1.0,2.0,130.0,250.0,0.0,1.0,187.0,0.0,3.5,0.0,0.0,2.0'
print('Original (Hasta expected):')
pred(base_str)

print('\nChange thalach 187->110:')
pred('37.0,1.0,2.0,130.0,250.0,0.0,1.0,110.0,0.0,3.5,0.0,0.0,2.0')

print('\nChange cp 2->0:')
pred('37.0,1.0,0.0,130.0,250.0,0.0,1.0,187.0,0.0,3.5,0.0,0.0,2.0')

print('\nChange ca 0->2:')
pred('37.0,1.0,2.0,130.0,250.0,0.0,1.0,187.0,0.0,3.5,0.0,2.0,2.0')

print('\nChange all 3 to healthy values:')
pred('37.0,1.0,0.0,130.0,250.0,0.0,1.0,110.0,0.0,3.5,0.0,2.0,2.0')
