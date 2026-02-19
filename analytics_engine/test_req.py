import urllib.request
import json

url = "http://127.0.0.1:8000/analyze"

data = {
    "projectType": "vehicle",
    "data": [
        {"Make": "Toyota", "Model": "Camry", "Year": 2020, "Engine Size": 2.5, "Price": 25000},
        {"Make": "Toyota", "Model": "Corolla", "Year": 2021, "Engine Size": 1.8, "Price": 22000},
        {"Make": "Honda", "Model": "Civic", "Year": 2022, "Engine Size": 1.5, "Price": 24000},
        {"Make": "Honda", "Model": "Accord", "Year": 2020, "Engine Size": 2.0, "Price": 28000},
        {"Make": "Ford", "Model": "Focus", "Year": 2019, "Engine Size": 2.0, "Price": 20000},
        {"Make": "Ford", "Model": "Fusion", "Year": 2020, "Engine Size": 2.5, "Price": 26000},
        {"Make": "BMW", "Model": "3 Series", "Year": 2021, "Engine Size": 3.0, "Price": 45000},
        {"Make": "BMW", "Model": "5 Series", "Year": 2022, "Engine Size": 3.0, "Price": 55000},
        {"Make": "Audi", "Model": "A4", "Year": 2021, "Engine Size": 2.0, "Price": 42000},
        {"Make": "Audi", "Model": "A6", "Year": 2022, "Engine Size": 3.0, "Price": 52000}
    ]
}

req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), headers={'Content-Type': 'application/json'})

try:
    with urllib.request.urlopen(req) as response:
        print(f"Status Code: {response.status}")
        print("Response JSON:")
        print(json.dumps(json.loads(response.read().decode('utf-8')), indent=2))
except Exception as e:
    print(f"Request failed: {e}")
