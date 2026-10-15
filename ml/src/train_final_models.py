
from pathlib import Path
import json

import joblib
import numpy as np
import pandas as pd
import sklearn
from sklearn.ensemble import RandomForestRegressor
from sklearn.impute import SimpleImputer


# ---------------------------------------------------------
# PATHS
# ---------------------------------------------------------
ROOT = Path(__file__).resolve().parents[2]
DATA_PATH = ROOT / "ml" / "data" / "feature_matrix_full.csv"
MODEL_DIR = ROOT / "ml" / "models"
MODEL_DIR.mkdir(parents=True, exist_ok=True)


# ---------------------------------------------------------
# OFFICIAL RESEARCH CONFIGURATION
# ---------------------------------------------------------
HORIZONS = (1, 3, 5)

FEATURES = [
    "rainfall_mm",
    "temperature_c",
    "et_mm",
    "soil_moisture",
    "bagre_storage",
    "bagre_storage_30d",
    *[f"discharge_lag{i}" for i in range(1, 11)],
    *[f"rainfall_lag{i}" for i in range(1, 6)],
    "sin_doy",
    "cos_doy",
]

PARAMS = {
    "n_estimators": 300,
    "max_features": "sqrt",
    "min_samples_leaf": 2,
    "random_state": 42,
    "n_jobs": -1,
}

WARNING_THRESHOLDS = {
    "yellow": 1114.16,
    "orange": 1362.21,
    "red": 1898.58,
}


# ---------------------------------------------------------
# DATA AND FEATURE PREPARATION
# ---------------------------------------------------------
def load_data():
    if not DATA_PATH.exists():
        raise FileNotFoundError(f"Dataset not found: {DATA_PATH}")

    df = pd.read_csv(DATA_PATH, parse_dates=["date"])

    if df.empty:
        raise ValueError("The dataset is empty.")

    if df["date"].isna().any():
        raise ValueError("Some dataset dates could not be parsed.")

    if df["date"].duplicated().any():
        raise ValueError("Duplicate dates found; resolve them before training.")

    df = df.sort_values("date").reset_index(drop=True)

    required_base = [
        "date",
        "discharge_grdc",
        "rainfall_mm",
        "temperature_c",
        "et_mm",
        "soil_moisture",
        "bagre_storage",
        "bagre_storage_30d",
        *[f"discharge_lag{i}" for i in range(1, 11)],
        *[f"rainfall_lag{i}" for i in range(1, 6)],
    ]

    missing = sorted(set(required_base) - set(df.columns))
    if missing:
        raise ValueError(f"Missing required dataset columns: {missing}")

    # These seasonal features are created BEFORE FEATURES are checked.
    day_of_year = df["date"].dt.dayofyear
    df["sin_doy"] = np.sin(2 * np.pi * day_of_year / 365.25)
    df["cos_doy"] = np.cos(2 * np.pi * day_of_year / 365.25)

    # Verify that the declared feature list is complete.
    missing_features = [c for c in FEATURES if c not in df.columns]
    if missing_features:
        raise ValueError(f"Missing model features: {missing_features}")

    return df


def build_calendar_targets(observed):
    """
    Target at date t is observed discharge at calendar date t+h.
    This deliberately maps dates instead of shifting rows.
    """
    observed = observed.copy()
    discharge_by_date = observed.set_index("date")["discharge_grdc"]

    for horizon in HORIZONS:
        future_dates = observed["date"] + pd.to_timedelta(
            horizon, unit="D"
        )
        observed[f"target_{horizon}d"] = future_dates.map(
            discharge_by_date
        )

    return observed


# ---------------------------------------------------------
# MODEL TRAINING
# ---------------------------------------------------------
def train_one_horizon(observed, horizon):
    target_col = f"target_{horizon}d"

    work = observed.dropna(subset=[target_col]).copy()
    work = work.sort_values("date").reset_index(drop=True)

    if work.empty:
        raise ValueError(
            f"No eligible target rows for the {horizon}-day horizon."
        )

    X = work[FEATURES].copy()
    X = X.replace([np.inf, -np.inf], np.nan)
    y = work[target_col].astype(float)

    if not np.isfinite(y.to_numpy()).all():
        raise ValueError(f"Non-finite target values for horizon {horizon}.")

    # Fail rather than silently accept a predictor that is entirely missing.
    all_missing = X.columns[X.isna().all()].tolist()
    if all_missing:
        raise ValueError(
            f"Entirely missing predictors for horizon {horizon}: "
            f"{all_missing}"
        )

    # This deployment fit uses all eligible historical target rows.
    # It is separate from the event-held-out research evaluation.
    imputer = SimpleImputer(strategy="median")
    X_imputed = imputer.fit_transform(X)

    model = RandomForestRegressor(**PARAMS)
    model.fit(X_imputed, y)

    artifact = {
        "model": model,
        "imputer": imputer,
        "features": FEATURES.copy(),
        "horizon_days": horizon,
        "parameters": PARAMS.copy(),
        "warning_thresholds_m3s": WARNING_THRESHOLDS.copy(),
    }

    output_path = MODEL_DIR / f"floodwatch_rf_{horizon}day.joblib"
    joblib.dump(artifact, output_path)

    # Immediately reload the saved artifact and verify inference.
    loaded = joblib.load(output_path)
    sample = X_imputed[: min(5, len(X_imputed))]
    sample_predictions = loaded["model"].predict(sample)

    if not np.isfinite(sample_predictions).all():
        raise RuntimeError(
            f"Saved {horizon}-day model produced non-finite predictions."
        )

    print(f"\n{horizon}-day model: PASS")
    print(f"  File: {output_path.relative_to(ROOT)}")
    print(f"  Training rows: {len(work)}")
    print(f"  Feature count: {len(FEATURES)}")
    print(f"  First target date: "
          f"{(work['date'].min() + pd.Timedelta(days=horizon)).date()}")
    print(f"  Last target date: "
          f"{(work['date'].max() + pd.Timedelta(days=horizon)).date()}")
    print(f"  Sample predictions: "
          f"{np.round(sample_predictions, 3).tolist()}")

    return {
        "horizon_days": horizon,
        "model_file": output_path.name,
        "training_rows": int(len(work)),
        "feature_count": len(FEATURES),
        "feature_start_date": work["date"].min().strftime("%Y-%m-%d"),
        "last_feature_date": work["date"].max().strftime("%Y-%m-%d"),
        "target_start_date": (
            work["date"].min() + pd.Timedelta(days=horizon)
        ).strftime("%Y-%m-%d"),
        "target_end_date": (
            work["date"].max() + pd.Timedelta(days=horizon)
        ).strftime("%Y-%m-%d"),
        "target_min_m3s": float(y.min()),
        "target_max_m3s": float(y.max()),
    }


# ---------------------------------------------------------
# MAIN
# ---------------------------------------------------------
def main():
    print("FloodWatch Random Forest model training")
    print(f"Dataset: {DATA_PATH}")
    print(f"scikit-learn version: {sklearn.__version__}")

    df = load_data()

    # Forecast targets are only defined where current observed discharge
    # and discharge at the exact future calendar date are available.
    observed = df.dropna(subset=["discharge_grdc"]).copy()
    observed = build_calendar_targets(observed)

    print(f"Dataset rows: {len(df)}")
    print(f"Observed discharge rows: {len(observed)}")
    print(f"Date range: {df['date'].min().date()} to "
          f"{df['date'].max().date()}")
    print(f"Feature count: {len(FEATURES)}")

    results = []
    for horizon in HORIZONS:
        results.append(train_one_horizon(observed, horizon))

    metadata = {
        "project": "FloodWatch",
        "model_type": "RandomForestRegressor",
        "model_purpose": "Historical-data multi-horizon discharge forecasting",
        "horizons_days": list(HORIZONS),
        "features": FEATURES,
        "feature_count": len(FEATURES),
        "parameters": PARAMS,
        "warning_thresholds_m3s": WARNING_THRESHOLDS,
        "target_definition": (
            "GRDC discharge at exact calendar date t+h; missing future "
            "calendar dates are not replaced by adjacent rows."
        ),
        "imputation": (
            "SimpleImputer(strategy='median'), fitted separately on each "
            "horizon's eligible training predictors."
        ),
        "training_procedure": (
            "Final deployment fit on all eligible historical target rows. "
            "This is not the event-held-out LOFO evaluation procedure."
        ),
        "dataset_path": str(DATA_PATH.relative_to(ROOT)),
        "results": results,
        "known_limitations": [
            "The provenance and construction of bagre_storage_30d "
            "remain unverified.",
            "These saved artifacts have not yet passed full research "
            "reproduction or operational validation.",
            "Historical discharge is only available for part of the "
            "1987-2023 feature-matrix date range.",
        ],
    }

    metadata_path = MODEL_DIR / "model_metadata.json"
    metadata_path.write_text(
        json.dumps(metadata, indent=2),
        encoding="utf-8",
    )

    print("\nTraining completed.")
    print(f"Metadata: {metadata_path.relative_to(ROOT)}")
    print("All three saved artifacts reloaded and passed sample inference.")


if __name__ == "__main__":
    main()

