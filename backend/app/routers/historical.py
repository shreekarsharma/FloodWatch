
from pathlib import Path

import pandas as pd
from fastapi import APIRouter, HTTPException, Query

router = APIRouter(tags=["Historical Data"])

PROJECT_ROOT = Path(__file__).resolve().parents[3]
DATA_PATH = PROJECT_ROOT / "ml" / "data" / "feature_matrix_full.csv"


def load_data():
    if not DATA_PATH.exists():
        raise HTTPException(
            status_code=500,
            detail=f"Historical dataset not found: {DATA_PATH.name}",
        )

    try:
        df = pd.read_csv(DATA_PATH)
        df["date"] = pd.to_datetime(df["date"], errors="coerce")
        df = df.dropna(subset=["date"])
        return df
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Could not load historical dataset: {exc}",
        )


@router.get("/api/historical-data/")
def get_historical_data(
    start_date: str | None = Query(default=None),
    end_date: str | None = Query(default=None),
    variable: str = Query(default="discharge_grdc"),
    warning_level: str | None = Query(default=None),
    limit: int = Query(default=500, ge=1, le=5000),
):
    df = load_data()

    allowed_variables = {
        "discharge_grdc",
        "rainfall_mm",
        "temperature_c",
        "et_mm",
        "soil_moisture",
        "bagre_storage",
        "bagre_storage_30d",
        "discharge_proxy",
        "discharge_proxy_bc",
    }

    if variable not in allowed_variables:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported variable: {variable}",
        )

    if start_date:
        start = pd.to_datetime(start_date, errors="coerce")
        if pd.isna(start):
            raise HTTPException(status_code=400, detail="Invalid start_date")
        df = df[df["date"] >= start]

    if end_date:
        end = pd.to_datetime(end_date, errors="coerce")
        if pd.isna(end):
            raise HTTPException(status_code=400, detail="Invalid end_date")
        df = df[df["date"] <= end]

    if warning_level and warning_level.lower() != "all levels":
        if "warning_level" not in df.columns:
            raise HTTPException(
                status_code=400,
                detail="warning_level column is unavailable",
            )
        df = df[
            df["warning_level"].astype(str).str.lower()
            == warning_level.lower()
        ]

    df = df.dropna(subset=[variable])
    df = df.sort_values("date").tail(limit).copy()

    output_columns = ["date", variable]

    result = df[output_columns].copy()
    result = result.rename(columns={variable: "value"})
    result["date"] = result["date"].dt.strftime("%Y-%m-%d")

    # Replace missing numeric values with JSON-safe nulls.
    result = result.astype(object).where(pd.notna(result), None)

    return {
        "count": len(result),
        "variable": variable,
        "data": result.to_dict(orient="records"),
    }
