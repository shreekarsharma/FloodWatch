
from pathlib import Path

import pandas as pd
from fastapi import APIRouter, HTTPException, Query

router = APIRouter(tags=["Explainability"])

CSV_PATH = (
    Path(__file__).resolve().parents[3]
    / "ml"
    / "notebooks"
    / "event_level_feature_importance.csv"
)





@router.get("/api/explainability/{horizon}")
def get_explainability(
    horizon: int,
    difficulty: str = Query("high"),
):
    if horizon not in (1, 3, 5):
        raise HTTPException(
            status_code=400,
            detail="Horizon must be 1, 3, or 5 days.",
        )

    if difficulty.strip().lower() not in ("low", "medium", "high"):
        raise HTTPException(
            status_code=400,
            detail="Difficulty must be low, medium, or high.",
        )

    if not CSV_PATH.exists():
        raise HTTPException(
            status_code=404,
            detail="Explainability CSV file was not found.",
        )

    # Load event-level feature importance.
    try:
        importance_df = pd.read_csv(CSV_PATH)

        # Load LOFO event errors to classify difficulty.
        project_root = Path(__file__).resolve().parents[3]
        results_path = (
            project_root
            / "ml"
            / "notebooks"
            / "LOFO_calendar_correct_fold_results.csv"
        )
        results_df = pd.read_csv(results_path)
    except FileNotFoundError as exc:
        raise HTTPException(
            status_code=404,
            detail=f"Required analysis CSV was not found: {exc.filename}",
        )
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Could not read analysis CSV: {exc}",
        )

    importance_required = {
        "horizon_days", "episode_id", "feature", "importance"
    }
    results_required = {"horizon_days", "episode_id", "MAE"}

    if importance_required - set(importance_df.columns):
        raise HTTPException(
            status_code=500,
            detail="Feature-importance CSV has missing required columns.",
        )

    if results_required - set(results_df.columns):
        raise HTTPException(
            status_code=500,
            detail="LOFO results CSV has missing required columns.",
        )

    for frame in (importance_df, results_df):
        frame["horizon_days"] = pd.to_numeric(
            frame["horizon_days"], errors="coerce"
        )
        frame["episode_id"] = pd.to_numeric(
            frame["episode_id"], errors="coerce"
        )

    results_df["MAE"] = pd.to_numeric(
        results_df["MAE"], errors="coerce"
    )

    results_df = results_df[
        (results_df["horizon_days"] == horizon)
    ].dropna(subset=["episode_id", "MAE"])

    if results_df.empty:
        return []

    # Classify events relative to MAE within the selected horizon.
    median_mae = results_df["MAE"].median()

    def difficulty_level(mae):
        if mae <= median_mae * 0.75:
            return "low"
        if mae <= median_mae * 1.25:
            return "medium"
        return "high"

    results_df["difficulty"] = results_df["MAE"].apply(difficulty_level)

    selected_events = set(
        results_df.loc[
            results_df["difficulty"] == difficulty.strip().lower(),
            "episode_id",
        ].tolist()
    )

    filtered = importance_df[
        (importance_df["horizon_days"] == horizon)
        & (importance_df["episode_id"].isin(selected_events))
    ].dropna(subset=["feature", "importance"])

    if filtered.empty:
        return []

    grouped = (
        filtered.groupby("feature", as_index=False)
        .agg(
            importance=("importance", "mean"),
            event_count=("episode_id", "nunique"),
        )
        .sort_values("importance", ascending=False)
    )

    return [
        {
            "feature": str(row["feature"]),
            "importance": round(float(row["importance"]), 4),
            "event_count": int(row["event_count"]),
        }
        for _, row in grouped.iterrows()
    ]
