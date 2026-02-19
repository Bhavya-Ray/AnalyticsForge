import numpy as np
import sys

def recommend_charts(analysis, df, project_type="general"):
    """
    Guarantees 4 unique, diverse charts with SMART metric selection.
    Prioritizes 'Record Count' for distributions to avoid 'Sum of Engine Size' nonsense.
    """
    charts = []
    kpis = []
    columns = analysis.get("columns", [])
    row_count = analysis.get("row_count", 0)
    
    # --- SPECIALIZED MAINTENANCE DASHBOARD LOGIC ---
    if "maint" in project_type.lower():
        # Identify key columns
        failure_col = next((c for c in columns if "failure" in c["name"].lower()), None)
        # Fix: Ensure device column is NOT the failure column or an ID
        device_col = next((c for c in columns if ("device" in c["name"].lower() or "machine" in c["name"].lower() or "type" in c["name"].lower() or "product" in c["name"].lower()) and "failure" not in c["name"].lower() and "id" not in c["name"].lower()), None)
        date_col = next((c for c in columns if c["type"] == "date"), None)
        
        # Smart Metric Selection for Maintenance (Find metrics with high variance/correlation)
        # Exclude failure, device, date, IDs, Year, UDI
        exclude_keywords = ["failure", "record count", "id", "year", "udi", "no"]
        sensor_metrics = [c for c in columns if c["type"] == "numeric" and not any(k in c["name"].lower() for k in exclude_keywords)]
        
        # KPI 1: Total Records (Use row_count directly)
        kpis.append({"label": "Total Records", "value": row_count, "type": "total"})

        if failure_col:
            # KPI 2: Total Failures
            total_failures = int(df[failure_col["name"]].sum())
            kpis.append({"label": "Total Failures", "value": total_failures, "type": "total"})
            
            # KPI 3: Failure Rate
            fail_rate = (total_failures / row_count) * 100
            kpis.append({"label": "Failure Rate", "value": f"{fail_rate:.4f}%", "type": "percentage"})
            
            # KPI 4: Active Devices (or similar)
            if device_col:
                active_devices = df[device_col["name"]].nunique()
                kpis.append({"label": "Device Types", "value": active_devices, "type": "count"})

            # Chart 1: Sensor Health Profile (Radar)
            # Compare Avg values of top 5 sensors for Healthy vs Failed
            if len(sensor_metrics) >= 3:
                top_sensors = sensor_metrics[:5]
                sensor_names = [s["name"] for s in top_sensors]
                charts.append({
                    "type": "radar",
                    "title": "Sensor Health Profile",
                    "description": "Comparing average sensor readings for Healthy vs. Failed devices.",
                    "x": "subject", # The metric name will be the axis
                    "series": [
                        {"name": "Healthy", "dataKey": "0", "stroke": "#10b981", "fill": "#10b981"},
                        {"name": "Failed", "dataKey": "1", "stroke": "#ef4444", "fill": "#ef4444"}
                    ],
                    "metrics": sensor_names, # Pass to main.py to fetch data
                    "agg_type": "radar_mean", # Custom agg for main.py
                    "group_col": failure_col["name"]
                })



            # Chart 3: Device Type Distribution (Pie)
            if device_col:
                charts.append({
                    "type": "pie",
                    "title": "Device Type Distribution",
                    "description": "Distribution of device types (L, M, H).",
                    "x": device_col["name"],
                    "y": "Record Count",
                    "dataKey": "Record Count",
                    "nameKey": device_col["name"]
                })

            # Chart 4: Clustered Bar Chart (Top Sensors Comparison) - MOVED TO BOTTOM
            if len(sensor_metrics) > 0:
                 bar_sensors = sensor_metrics[:3]
                 bar_sensor_names = [s["name"] for s in bar_sensors]
                 charts.append({
                    "type": "bar",
                    "title": "Sensor Metrics Comparison",
                    "description": "Side-by-side comparison of sensor values.",
                    "x": "metric",
                    "series": [
                        {"name": "Healthy", "dataKey": "0", "fill": "#10b981"},
                        {"name": "Failed", "dataKey": "1", "fill": "#ef4444"}
                    ],
                    "metrics": bar_sensor_names,
                    "agg_type": "multi_bar_mean",
                    "group_col": failure_col["name"]
                 })

            return {"charts": charts, "kpis": kpis, "metadata": {"rowCount": row_count}}

    # --- END SPECIALIZED LOGIC ---

    numeric_cols = [c for c in columns if c["type"] == "numeric"]
    cat_cols = [c for c in columns if c.get("is_categorical", False)]
    date_cols = [c for c in columns if c["type"] == "date"]
    
    if not numeric_cols:
         # Generic fallback for purely categorical datasets? Unlikely but possible.
         numeric_cols = [{
            "name": "Record Count", 
            "type": "numeric", 
            "min": 0, 
            "max": row_count, 
            "mean": row_count/2
        }]
    
    # --- Smart Metric Categorization ---
    
    # --- Smart Metric Categorization ---
    
    # 1. Identify "Value" Metrics - STRICT PRIORITY
    #    We explicitly prioritize these specific business keywords to ensure "Emission" or "Revenue" is always #1 if present.
    high_priority_keywords = ["emission", "revenue", "sales", "profit", "cost"]
    medium_priority_keywords = ["amount", "price", "value", "score", "salary", "expense"]
    
    # Find high priority first
    primary_metric = next((c for c in numeric_cols if any(k in c["name"].lower() for k in high_priority_keywords)), None)
    
    # Then medium priority
    if not primary_metric:
        primary_metric = next((c for c in numeric_cols if any(k in c["name"].lower() for k in medium_priority_keywords)), None)
    
    # Then distinct high-variance numerics
    if not primary_metric:
        others = [c for c in numeric_cols if c["max"] > 100 and "id" not in c["name"].lower() and "record count" not in c["name"].lower()]
        primary_metric = others[0] if others else numeric_cols[0]

    # 2. Identify "Dimension" Categories
    if cat_cols:
        cat_cols.sort(key=lambda x: x["unique_count"], reverse=True)
    
    major_cat = cat_cols[0] if cat_cols else None
    
    # Special: Demographic Category (Gender/Sex) - Users love this for Pie charts
    demo_keywords = ["gender", "sex", "demographic"]
    demo_cat = next((c for c in cat_cols if any(k in c["name"].lower() for k in demo_keywords)), None)
    
    # --- Slot Generation ---
    
    # Slot 1: Trend over Time OR High cardinality comparison
    # Only use date columns with date-like names (exclude hours, count, etc. that may be misclassified)
    date_like_keywords = ["date", "day", "month", "year", "created", "updated", "timestamp"]
    real_date_cols = [c for c in date_cols if any(k in c["name"].lower() for k in date_like_keywords)]
    date_col = real_date_cols[0] if real_date_cols else None

    if date_col:
        charts.append({
             "type": "line",
             "title": f"{primary_metric['name']} Trend",
             "x": date_col['name'],
             "y": primary_metric['name'],
             "description": f"Timeline of {primary_metric['name']} over {date_col['name']}.",
             "dataKey": primary_metric['name']
        })
    elif not date_col:
        # No real date column: use numeric X for line chart when sensible (e.g. performance_score vs training_hours)
        ord_numeric = [c for c in numeric_cols if c["name"] != primary_metric["name"]
                       and 5 <= c.get("unique_count", 0) <= 50
                       and "record count" not in c["name"].lower()
                       and "id" not in c["name"].lower()]
        ord_col = ord_numeric[0] if ord_numeric else None
        if ord_col:
            charts.append({
                "type": "line",
                "title": f"{primary_metric['name']} by {ord_col['name']}",
                "x": ord_col['name'],
                "y": primary_metric['name'],
                "description": f"{primary_metric['name']} grouped by {ord_col['name']}.",
                "dataKey": primary_metric['name']
            })
        elif major_cat and major_cat["unique_count"] > 10:
            charts.append({
                "type": "bar",
                "title": f"Top {primary_metric['name']} by {major_cat['name']}",
                "x": major_cat['name'],
                "y": primary_metric['name'],
                "description": f"Ranking top {major_cat['name']} by {primary_metric['name']}.",
                "dataKey": primary_metric['name']
            })
        else:
            c_axis = major_cat if major_cat else {"name": "Item"}
            charts.append({
                "type": "bar",
                "title": f"{primary_metric['name']} Overview",
                "x": c_axis['name'],
                "y": primary_metric['name'],
                "description": "General overview.",
                "dataKey": primary_metric['name']
            })

    # Slot 2: Composition (Pie / Treemap)
    # PRIORITY: Demographic Breakdowns (Gender, etc.)
    target_pie_cat = demo_cat
    
    # If no demographic, look for small categories (2-10 values)
    if not target_pie_cat:
        # Prefer low cardinality for Pie charts (e.g. 2-5 values is sweet spot)
        target_pie_cat = next((c for c in cat_cols if 2 <= c["unique_count"] <= 8), None)
        
    treemap_cat = next((c for c in cat_cols if 10 < c["unique_count"] < 50), None)
    
    if target_pie_cat:
        # For demographics, we often want JUST the count "Male: 50, Female: 40"
        # rather than "Sum of Revenue by Gender" (unless explicitly interesting).
        # Let's default to Record Count for demographics to match user expectation "Pie chart for male and female count"
        pie_metric = "Record Count"
        # But if we have a very strong business metric like Sales, maybe sum? 
        # Actually user specifically asked for "count". Let's use Record Count if available.
        rc = next((c for c in numeric_cols if "record count" in c["name"].lower()), None)
        y_val = rc['name'] if rc else primary_metric['name']
        
        charts.append({
            "type": "pie",
            "title": f"Distribution by {target_pie_cat['name']}",
            "x": target_pie_cat['name'],
            "y": y_val, # Use count!
            "description": f"Breakdown of records by {target_pie_cat['name']}.",
        })
    elif treemap_cat:
        charts.append({
            "type": "treemap",
            "title": f"{primary_metric['name']} Heatmap",
            "x": treemap_cat['name'],
            "y": primary_metric['name'],
            "description": f"Density view of {primary_metric['name']} across {treemap_cat['name']}.",
        })
    elif major_cat: # Fallback Pie if nothing else fits nicely
         charts.append({
            "type": "pie",
            "title": f"Distribution by {major_cat['name']}",
            "x": major_cat['name'],
            "y": primary_metric['name'],
            "description": f"Distribution by {major_cat['name']}.",
        })

    # Slot 3: Distribution (Histogram or BoxPlot)
    # BoxPlot is great if we have a category + continuous metric
    # Histogram is great for just the continuous metric
    
    # Try Box Plot first: Needs a category with < 20 unique values and a continuous metric
    # CRITICAL FIX: Ensure we don't plot "Price vs Price" (same col for X and Y)
    # Only allow *string* categorical columns as the box-plot category axis.
    # (Numeric cols can be misclassified as categorical when they have low unique counts,
    # which leads to nonsense like "Price per Unit Distribution by Price per Unit".)
    box_cat = next(
        (
            c
            for c in cat_cols
            if c.get("type") == "string"
            and 2 <= c["unique_count"] <= 15
            and c["name"] != primary_metric["name"]
        ),
        None,
    )
    
    if box_cat and primary_metric and box_cat["name"] != primary_metric["name"]:
        charts.append({
            "type": "boxPlot",
            "title": f"{primary_metric['name']} Distribution by {box_cat['name']}",
            "x": box_cat['name'],
            "y": primary_metric['name'],
            "description": f"Statistical distribution (min, max, median) by category.",
        })
    else:
        # Histogram
        try:
            data_to_hist = df[primary_metric['name']].dropna()
            if not data_to_hist.empty and data_to_hist.nunique() > 1:
                counts, bins = np.histogram(data_to_hist, bins=10)
                hist_json = [{"range": f"{bins[i]:.0f}-{bins[i+1]:.0f}", "count": int(counts[i])} for i in range(len(counts))]
                charts.append({
                    "type": "histogram",
                    "title": f"{primary_metric['name']} Frequencies",
                    "data": hist_json,
                    "x": "range",
                    "y": "count",
                    "description": f"Frequency distribution of {primary_metric['name']}."
                })
        except:
            pass

    # Slot 4: Relationship (Scatter) or Diversity (Radar)
    # Scatter needs 2 continuous metrics
    secondary_metric_opts = [c for c in numeric_cols if c["name"] != primary_metric["name"] and "record count" not in c["name"].lower() and "id" not in c["name"].lower()]
    secondary_metric = secondary_metric_opts[0] if secondary_metric_opts else None
    
    if secondary_metric:
        charts.append({
            "type": "scatter",
            "title": f"{primary_metric['name']} vs {secondary_metric['name']}",
            "x": primary_metric['name'],
            "y": secondary_metric['name'],
            "description": "Correlation analysis between metrics.",
        })
    else:
        # Fallback to another Bar chart with different category if available
        secondary_cat = cat_cols[1] if len(cat_cols) > 1 else None
        if secondary_cat:
             charts.append({
                "type": "bar",
                "title": f"Analysis by {secondary_cat['name']}",
                "x": secondary_cat['name'],
                "y": primary_metric['name'], # Or use Count
                "description": f"Secondary view by {secondary_cat['name']}.",
            })
            
    # Deduplicate and Fill
    final_charts = []
    seen_titles = set()
    for c in charts:
        if c["title"] not in seen_titles and len(final_charts) < 4:
            final_charts.append(c)
            seen_titles.add(c["title"])
            
    # If still < 4, fill with generic counts
    while len(final_charts) < 4:
        # Just create generic filler charts
        if "Metric Overview" not in seen_titles:
            c = {
                "type": "bar", 
                "title": "Metric Overview", 
                "x": major_cat["name"] if major_cat else "Category", 
                "y": primary_metric["name"],
                "description": "Overview of primary metrics."
            }
            final_charts.append(c)
            seen_titles.add("Metric Overview")
        else:
            break # Avoid infinite loop if we really can't find anything


            
    # KPI Generation
    kpis = []
    
    # KPI 1: Total Records
    # Use row_count directly as it's the most reliable "count"
    kpis.append({"label": "Total Records", "value": row_count, "type": "total"})
    
    # KPI 2: Primary Metric Total (e.g. Total Revenue)
    # If primary metric is just "Record Count", try to find a real value metric
    kpi_metric = primary_metric
    if "record count" in kpi_metric["name"].lower():
         # Try to find another numeric
         alt_metrics = [c for c in numeric_cols if "record count" not in c["name"].lower() and "id" not in c["name"].lower()]
         if alt_metrics:
             kpi_metric = alt_metrics[0]
    
    if "record count" not in kpi_metric["name"].lower():
         total_value = float(df[kpi_metric['name']].sum())
         avg_value = float(df[kpi_metric['name']].mean())
         kpi_label = kpi_metric['name']
         
         kpis.append({"label": f"Total {kpi_label}", "value": total_value, "type": "total"})
         kpis.append({"label": f"Average {kpi_label}", "value": avg_value, "type": "average"})
         
    # KPI 3: Diversity / Growth (Simple count of categories)
    if major_cat:
        unique_cats = df[major_cat["name"]].nunique()
        kpis.append({"label": f"{major_cat['name']} Count", "value": unique_cats, "type": "count"})

    return {
        "charts": final_charts[:4],
        "kpis": kpis,
        "metadata": {"rowCount": row_count}
    }
