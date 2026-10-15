
from pathlib import Path

import pandas as pd
from fastapi import APIRouter, HTTPException

router = APIRouter(tags=["Event Difficulty"])


RESULTS_PATH = (
    Path(__file__).resolve().parents[3]
    / "ml"
    / "notebooks"
    / "LOFO_calendar_correct_fold_results.csv"
)



@router.get("/api/difficulty/{horizon}")
def get_event_difficulty(horizon: int):
    if horizon not in (1, 3, 5):
        raise HTTPException(
            status_code=400,
            detail="Horizon must be 1, 3, or 5 days.",
        )

    if not RESULTS_PATH.exists():
        raise HTTPException(
            status_code=404,
            detail="LOFO evaluation results file was not found.",
        )

    try:
        df = pd.read_csv(RESULTS_PATH)
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Could not read evaluation results: {exc}",
        )

    required = {"horizon_days", "episode_id", "MAE", "RMSE"}
    missing = required - set(df.columns)

    if missing:
        raise HTTPException(
            status_code=500,
            detail=f"Missing columns in results file: {sorted(missing)}",
        )

    df["horizon_days"] = pd.to_numeric(
        df["horizon_days"], errors="coerce"
    )
    df = df[df["horizon_days"] == horizon].copy()

    if df.empty:
        return []

    df["MAE"] = pd.to_numeric(df["MAE"], errors="coerce")
    df["RMSE"] = pd.to_numeric(df["RMSE"], errors="coerce")
    df = df.dropna(subset=["MAE", "RMSE"])

    if df.empty:
        return []

    # Use median event MAE as a relative difficulty reference.
    median_mae = df["MAE"].median()

    def difficulty_level(mae):
        if mae <= median_mae * 0.75:
            return "LOW"
        if mae <= median_mae * 1.25:
            return "MEDIUM"
        return "HIGH"

    records = []

    for _, row in df.iterrows():
        event_id = row["episode_id"]

        record = {
            "episode_id": (
                int(event_id)
                if pd.notna(event_id) and float(event_id).is_integer()
                else str(event_id)
            ),
            "mae": round(float(row["MAE"]), 3),
            "rmse": round(float(row["RMSE"]), 3),
            "difficulty": difficulty_level(float(row["MAE"])),
        }

        records.append(record)

    return records
