from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
import pandas as pd
import io
from analyzer import analyze_dataframe
from chart_recommender import recommend_charts
import sys
app = FastAPI(title="AnalyticsForge Engine 🧠")

class DataPayload(BaseModel):
    data: List[Dict[str, Any]]
    projectType: str = "general"

def _make_unique_columns(cols: List[str]) -> List[str]:
    """
    Make column names unique while preserving order.
    If duplicates exist after stripping whitespace, suffix with _2, _3, ...
    """
    seen: Dict[str, int] = {}
    out: List[str] = []
    for c in cols:
        base = str(c).strip()
        n = seen.get(base, 0) + 1
        seen[base] = n
        out.append(base if n == 1 else f"{base}_{n}")
    return out

@app.get("/")
async def root():
    return {"message": "Analytics Engine is online"}

@app.post("/analyze")
async def analyze(payload: DataPayload):
    try:
        if not payload.data:
            raise HTTPException(status_code=400, detail="Empty data provided")
            
        # Convert list of dicts to DataFrame
        # Convert list of dicts to DataFrame
        df = pd.DataFrame(payload.data)
        # Normalize column names (common cause of "same column" bugs).
        df.columns = _make_unique_columns([str(c) for c in df.columns])
        
        # Inject standard virtual metric for counting
        if "Record Count" not in df.columns:
            df["Record Count"] = 1
            
        # LOGGING
        print(f"DEBUG: DataFrame shape: {df.shape}", file=sys.stderr)
        print(f"DEBUG: DataFrame columns: {df.columns.tolist()}", file=sys.stderr)
        print(f"DEBUG: DataFrame dtypes:\n{df.dtypes}", file=sys.stderr)

        # Analyze data types and structure
        analysis = analyze_dataframe(df)
        print(f"DEBUG: Analysis Result: {analysis}", file=sys.stderr)
        
        # Get chart recommendations
        recommendations = recommend_charts(analysis, df, payload.projectType)
        
        # Format the processed data for charts (aggregated if necessary, or just sampled)
        # For simplicity, we'll return the original data and the logic to render
        # But for large datasets, we should aggregate here.
        # Let's add a basic aggregation for categorical charts
        
        for chart in recommendations["charts"]:
            agg_type = chart.get("agg_type")
            
            if agg_type == "radar_mean" or agg_type == "multi_bar_mean":
                # Multi-variable comparison (Radar/Bar)
                # Group by Failure (0/1) -> Mean of Metrics -> Transpose
                group_col = chart.get("group_col")
                metrics = chart.get("metrics")
                
                if group_col and metrics:
                    # Calculate means
                    grouped = df.groupby(group_col)[metrics].mean().reset_index()
                    
                    # Melt/Transpose to get: [{ subject: "Temp", "0": 300, "1": 400 }]
                    # Easier: Just iterate metrics and build the list
                    data = []
                    for metric in metrics:
                        row = {chart.get("x"): metric} # x axis name (subject/metric)
                        for _, group_row in grouped.iterrows():
                            # group_row[group_col] is 0 or 1
                            key = str(int(group_row[group_col])) if pd.notna(group_row[group_col]) else "Unknown"
                            row[key] = group_row[metric]
                        data.append(row)
                    
                    chart["data"] = data
            
            elif agg_type == "scatter_group":
                # Scatter with grouping
                # We need to split data into series
                x_col = chart["x"]
                y_col = chart["y"]
                group_col = chart.get("group_col")
                
                if group_col:
                    # Sample first
                    sample_df = df.sample(min(300, len(df)))
                    
                    # Update series data
                    for series in chart["series"]:
                        # series["dataKey"] holds the group value ("0" or "1")
                        group_val = int(series["dataKey"])
                        series_data = sample_df[sample_df[group_col] == group_val][[x_col, y_col]].to_dict(orient="records")
                        series["data"] = series_data
            
            elif chart["type"] in ["bar", "pie", "treemap"]:
                x_col = chart.get("x") or chart.get("nameKey")
                y_col = chart.get("y") or chart.get("dataKey")
                
                if x_col and y_col:
                    # Group by category and sum numeric
                    agg_func = "mean" if chart.get("agg_type") == "mean" else "sum"
                    
                    if x_col == y_col:
                         # Collision avoidance: Grouping by X and Summing X
                         # Rename the value column to avoid conflict with index
                         if agg_func == "mean":
                            agg_df = df.groupby(x_col)[y_col].mean().reset_index(name="value")
                         else:
                            agg_df = df.groupby(x_col)[y_col].sum().reset_index(name="value")
                         chart["y"] = "value" # Update chart config to read from new column
                    else:
                        if agg_func == "mean":
                            agg_df = df.groupby(x_col)[y_col].mean().reset_index()
                        else:
                            agg_df = df.groupby(x_col)[y_col].sum().reset_index()
                    
                    agg_df = agg_df.sort_values(by=chart["y"], ascending=False).head(10) # Top 10
                    chart["data"] = agg_df.to_dict(orient="records")
            
            elif chart["type"] in ["line", "area"]:
                x_col = chart["x"]
                y_col = chart["y"]
                # If X is numeric (e.g. training_hours), use simple X-Y aggregation instead of date parsing.
                # Numeric columns parsed as dates produce "Jan 1970" and collapse to one point.
                if x_col in df.columns and pd.api.types.is_numeric_dtype(df[x_col]):
                    agg_df = df.groupby(x_col)[y_col].mean().reset_index()
                    agg_df = agg_df.sort_values(by=x_col).head(50)
                    chart["data"] = agg_df.to_dict(orient="records")
                else:
                    # Sort by date
                    df_copy = df.copy()
                    df_copy[x_col] = pd.to_datetime(df_copy[x_col], errors='coerce')
                    df_sorted = df_copy.dropna(subset=[x_col]).sort_values(by=x_col)
                    if df_sorted.empty:
                        chart["data"] = []
                    else:
                        df_sorted = df_sorted.copy()
                        df_sorted['display_date'] = df_sorted[x_col].dt.strftime('%b %Y')
                        agg_df = df_sorted.groupby('display_date')[y_col].sum().reset_index()
                        agg_df['sort_key'] = pd.to_datetime(agg_df['display_date'])
                        agg_df = agg_df.sort_values(by='sort_key')
                        chart["data"] = agg_df[['display_date', y_col]].rename(columns={'display_date': x_col}).to_dict(orient="records")
            
            elif chart["type"] == "scatter":
                x_col = chart["x"]
                y_col = chart["y"]
                # Sample 100 points if dataset is large
                sample_size = min(100, len(df))
                chart["data"] = df[[x_col, y_col]].sample(sample_size).to_dict(orient="records")
            
            elif chart["type"] == "boxPlot":
                x_col = chart.get("x")
                y_col = chart.get("y")
                if x_col and y_col and x_col in df.columns and y_col in df.columns:
                    tmp = df[[x_col, y_col]].copy()
                    tmp[y_col] = pd.to_numeric(tmp[y_col], errors="coerce")
                    tmp = tmp.dropna(subset=[x_col, y_col])
                    if not tmp.empty:
                        grouped = (
                            tmp.groupby(x_col)[y_col]
                            .agg(
                                min="min",
                                q1=lambda s: s.quantile(0.25),
                                median="median",
                                q3=lambda s: s.quantile(0.75),
                                max="max",
                                count="count",
                            )
                            .reset_index()
                        )

                        # Prefer more-representative categories when there are many.
                        grouped = grouped.sort_values(by="count", ascending=False).head(20)

                        # Frontend expects x-axis key "category"
                        grouped = grouped.rename(columns={x_col: "category"}).drop(columns=["count"])

                        # Ensure JSON-serializable plain Python numbers
                        for c in ["min", "q1", "median", "q3", "max"]:
                            grouped[c] = grouped[c].astype(float)

                        chart["data"] = grouped.to_dict(orient="records")

        return {
            "status": "success",
            "projectType": payload.projectType,
            "analysis": analysis,
            "charts": recommendations["charts"],
            "kpis": recommendations["kpis"],
            "metadata": recommendations["metadata"]
        }
        
    except Exception as e:
        import traceback
        
        # Enhanced Logging
        print("======== PYTHON ENGINE CRASH ========", file=sys.stderr)
        traceback.print_exc()
        print(f"Error Message: {str(e)}", file=sys.stderr)
        print("=====================================", file=sys.stderr)
        
        raise HTTPException(status_code=500, detail=f"Python Engine Error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    # Use string syntax for reload=True to work
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
