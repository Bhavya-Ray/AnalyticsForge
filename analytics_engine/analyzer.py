import pandas as pd
import numpy as np
from typing import Any, Dict

def analyze_dataframe(df):
    """
    Analyzes a pandas DataFrame and returns metadata about its columns.
    """
    analysis = {
        "columns": [],
        "row_count": len(df)
    }

    for col in df.columns:
        col_data = df[col]
        
        # Determine data type
        dtype = "string"
        if pd.api.types.is_numeric_dtype(col_data):
            # Check if it looks like an ID (sequential or large integers with low volume of unique values - wait, actually unique values == len is ID-like, but could be Price too)
            # Only classify as ID if name contains "id" or "code" OR if explicitly sequential integers starting from 0/1
            col_name_lower = str(col).lower()
            is_id_name = any(x in col_name_lower for x in ['id', 'key', 'code', 'index', 'pk'])
            
            if pd.api.types.is_integer_dtype(col_data) and col_data.nunique() == len(df) and is_id_name:
                dtype = "id"
            else:
                dtype = "numeric"
        elif pd.api.types.is_datetime64_any_dtype(col_data):
            dtype = "date"
        else:
            # Try to parse as date if it's a string
            try:
                temp_dates = pd.to_datetime(col_data, errors='coerce')
                if temp_dates.notna().sum() > len(df) * 0.8: # If 80% are dates
                    dtype = "date"
            except:
                pass
        
        # Categorical check - Improved Logic
        unique_count = col_data.nunique()
        unique_ratio = unique_count / len(df) if len(df) > 0 else 0
        
        # It is categorical if:
        # 1. It is string/object and has few unique values (absolute < 50 OR ratio < 5% for large data)
        # 2. It is numeric but clearly used as a category (very few unique values, e.g. < 10)
        # 3. AND it is NOT an ID column
        
        is_potential_cat = (dtype == "string" and (unique_count < 50 or unique_ratio < 0.05)) or \
                           (dtype == "numeric" and unique_count < 10)
                           
        is_categorical = is_potential_cat and (dtype != "id")

        col_info: Dict[str, Any] = {
            "name": str(col),
            "type": str(dtype),
            "is_categorical": bool(is_categorical),
            "unique_count": int(unique_count),
            "null_count": int(col_data.isna().sum()),
            "min": None,
            "max": None,
            "mean": None
        }
        
        if dtype == "numeric":
            try:
                col_info["min"] = float(col_data.min()) if not col_data.empty and not pd.isna(col_data.min()) else 0
                col_info["max"] = float(col_data.max()) if not col_data.empty and not pd.isna(col_data.max()) else 0
                col_info["mean"] = float(col_data.mean()) if not col_data.empty and not pd.isna(col_data.mean()) else 0
            except Exception as e:
                # Fallback for weird data types
                col_info["min"] = 0
                col_info["max"] = 0
                col_info["mean"] = 0

        analysis["columns"].append(col_info)
        
    return analysis
