import pandas as pd
import sys
import json
import os

# Redirect stdout/stderr to file
log_file = open("debug_output.txt", "w")
sys.stdout = log_file
sys.stderr = log_file

# Add current directory to path so we can import modules
sys.path.append('.')

from analyzer import analyze_dataframe
from chart_recommender import recommend_charts

def test_retail_metrics():
    print("Testing Retail Data (Price/Quantity, no Revenue)...")
    data = [
        {"Product": "A", "Category": "Electronics", "Price": 100, "Quantity": 5},
        {"Product": "B", "Category": "Electronics", "Price": 200, "Quantity": 3},
        {"Product": "C", "Category": "Clothing", "Price": 50, "Quantity": 10},
        {"Product": "D", "Category": "Clothing", "Price": 80, "Quantity": 2},
        {"Product": "E", "Category": "Home", "Price": 150, "Quantity": 4},
        {"Product": "F", "Category": "Home", "Price": 120, "Quantity": 6},
    ]
    df = pd.DataFrame(data)
    df["Record Count"] = 1 # Simulate main.py injection
    
    analysis = analyze_dataframe(df)
    print("Analysis Columns:", [c['name'] for c in analysis['columns']])
    
    result = recommend_charts(analysis, df)
    
    kpis = result.get('kpis', [])
    print(f"KPIs generated: {len(kpis)}")
    for k in kpis:
        print(f"- {k['label']}: {k['value']} ({k['type']})")

if __name__ == "__main__":
    try:
        test_retail_metrics()
    except Exception as e:
        print(f"CRASH: {e}")
        import traceback
        traceback.print_exc()
    finally:
        log_file.close()
