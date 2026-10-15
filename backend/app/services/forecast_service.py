from pathlib import Path

import joblib
import numpy as np
import pandas as pd


# Project paths
PROJECT_ROOT = Path(__file__).resolve().parents[3]
DATA_PATH = PROJECT_ROOT / "ml" / "data" / "feature_matrix_full.csv"
MODEL_DIR = PROJECT_ROOT / "ml" / "models"

YELLOW = 1114.16
ORANGE = 1362.21
RED = 1898.58

HORIZONS = (1, 3, 5)


def warning_level(discharge: float) -> str:
    if discharge < YELLOW:
        return "Normal"
    if discharge < ORANGE:
        return "Yellow"
    if discharge < RED:
        return "Orange"
    return "Red"


def load_dataset() -> pd.DataFrame:
    """Load the feature matrix and construct calendar features."""
    if not DATA_PATH.exists():
        raise FileNotFoundError(f"Forecast dataset not found: {DATA_PATH}")

    df = pd.read_csv(DATA_PATH)

    if "date" not in df.columns:
        raise ValueError("Dataset is missing the required 'date' column.")

    df["date"] = pd.to_datetime(df["date"], errors="coerce")
    df = (
        df.dropna(subset=["date"])
        .sort_values("date")
        .drop_duplicates(subset=["date"])
        .reset_index(drop=True)
    )

    day = df["date"].dt.dayofyear
    df["sin_doy"] = np.sin(2 * np.pi * day / 365.25)
    df["cos_doy"] = np.cos(2 * np.pi * day / 365.25)

    return df


def load_models() -> dict:
    """Load the previously trained models and their fitted imputers."""
    models = {}

    for horizon in HORIZONS:
        model_path = MODEL_DIR / f"floodwatch_rf_{horizon}day.joblib"

        if not model_path.exists():
            raise FileNotFoundError(f"Trained model not found: {model_path}")

        bundle = joblib.load(model_path)

        required = {"model", "imputer", "features"}
        if not isinstance(bundle, dict) or not required.issubset(bundle):
            raise ValueError(
                f"Model artifact has an unexpected format: {model_path}"
            )

        models[horizon] = bundle

    return models


def forecast(as_of_date):
    """Predict discharge 1, 3, and 5 calendar days after the origin date."""
    origin = pd.Timestamp(as_of_date).normalize()
    df = load_dataset()

    row = df.loc[df["date"] == origin]
    if row.empty:
        raise ValueError(
            f"No dataset row exists for forecast origin {origin.date()}."
        )

    models = load_models()
    results = []

    for horizon in HORIZONS:
        bundle = models[horizon]
        features = bundle["features"]

        missing = [name for name in features if name not in row.columns]
        if missing:
            raise ValueError(
                f"Dataset is missing model features for {horizon}-day forecast: "
                f"{missing}"
            )

        X = row[features].copy()

        if X.isna().all(axis=1).iloc[0]:
            raise ValueError(
                f"All model features are missing for {origin.date()}."
            )

        X_imputed = bundle["imputer"].transform(X)
        predicted = max(
            0.0,
            float(bundle["model"].predict(X_imputed)[0]),
        )

        results.append(
            {
                "forecast_origin": origin.date().isoformat(),
                "forecast_date": (
                    origin + pd.Timedelta(days=horizon)
                ).date().isoformat(),
                "horizon_days": horizon,
                "predicted_discharge": round(predicted, 3),
                "warning_level": warning_level(predicted),
            }
        )

    return results