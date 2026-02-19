import urllib.request
import json

url = "http://127.0.0.1:8000/analyze"

# Simulate Retail data which might not have "Revenue" or "Sales" but has other numerics
# Based on the issue description, it seems like the engine is failing to pick up a primary metric
# if it's not explicitly named "Revenue".
# Let's try a dataset with "Price" and "Quantity" but no "Revenue" column.
data = {
    "projectType": "retail",
    "data": [
        {"Product": "A", "Category": "Electronics", "Price": 100, "Quantity": 5},
        {"Product": "B", "Category": "Electronics", "Price": 200, "Quantity": 3},
        {"Product": "C", "Category": "Clothing", "Price": 50, "Quantity": 10},
        {"Product": "D", "Category": "Clothing", "Price": 80, "Quantity": 2},
        {"Product": "E", "Category": "Home", "Price": 150, "Quantity": 4},
        {"Product": "F", "Category": "Home", "Price": 120, "Quantity": 6},
    ]
}

req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), headers={'Content-Type': 'application/json'})

try:
    with urllib.request.urlopen(req) as response:
        print(f"Status Code: {response.status}")
        result = json.loads(response.read().decode('utf-8'))
        print("KPIs Found:")
        print(json.dumps(result.get('kpis', []), indent=2))
        
        kpis = result.get('kpis', [])
        if len(kpis) <= 1:
            print("\n[FAIL] Only 1 KPI found. Issue reproduced!")
        else:
            print(f"\n[SUCCESS] {len(kpis)} KPIs found.")
            
except Exception as e:
    print(f"Request failed: {e}")
