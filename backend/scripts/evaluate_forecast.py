
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.impute import SimpleImputer
from sklearn.metrics import mean_absolute_error, mean_squared_error

BACKEND_DIR = Path(__file__).resolve().parents[1]
DATA_PATH = BACKEND_DIR / "data" / "research" / "feature_matrix_full.csv"

HORIZONS = (1, 3, 5)
TRAIN_END = "2005-12-31"
TEST_START = "2006-01-01"
TEST_END = "2007-02-28"

CANDIDATE_FEATURES = [
    "rainfall_mm",
    "temperature_c",
    "et_mm",
    "soil_moisture",
    "bagre_storage",
    "bagre_storage_30d",
    *[f"discharge_lag{i}" for i in range(1, 11)],
    *[f"rainfall_lag{i}" for i in range(1, 6)],
]


def main():
    if not DATA_PATH.exists():
        raise FileNotFoundError(f"Dataset not found: {DATA_PATH}")

    df = pd.read_csv(DATA_PATH)
    df["date"] = pd.to_datetime(df["date"], errors="coerce")
    df = (
        df.dropna(subset=["date"])
        .sort_values("date")
        .drop_duplicates(subset=["date"])
        .reset_index(drop=True)
    )

    required = {"date", "discharge_grdc"}
    if not required.issubset(df.columns):
        raise ValueError(f"Dataset must contain {sorted(required)}")

    df["month"] = df["date"].dt.month
    day = df["date"].dt.dayofyear
    df["sin_doy"] = np.sin(2 * np.pi * day / 365.25)
    df["cos_doy"] = np.cos(2 * np.pi * day / 365.25)

    features = [c for c in CANDIDATE_FEATURES if c in df.columns]
    features += ["month", "sin_doy", "cos_doy"]

    train_end = pd.Timestamp(TRAIN_END)
    test_start = pd.Timestamp(TEST_START)
    test_end = pd.Timestamp(TEST_END)

    print(f"Training period: through {TRAIN_END}")
    print(f"Testing period: {TEST_START} to {TEST_END}")
    print(f"Features used: {len(features)}")
    print()

    results = []

    for horizon in HORIZONS:
        # The target is future discharge at the selected horizon.
        target = df["discharge_grdc"].shift(-horizon)
        target_date = df["date"].shift(-horizon)

        train_mask = (
            (df["date"] <= train_end)
            & (target_date <= train_end)
            & target.notna()
        )

        test_mask = (
            (df["date"] >= test_start)
            & (df["date"] <= test_end)
            & (target_date <= test_end)
            & target.notna()
        )

        X_train = df.loc[train_mask, features].copy()
        y_train = target.loc[train_mask].astype(float)

        X_test = df.loc[test_mask, features].copy()
        y_test = target.loc[test_mask].astype(float)

        # Remove rows without any usable predictor.
        train_usable = X_train.notna().any(axis=1)
        test_usable = X_test.notna().any(axis=1)

        X_train = X_train.loc[train_usable]
        y_train = y_train.loc[train_usable]
        X_test = X_test.loc[test_usable]
        y_test = y_test.loc[test_usable]

        if len(X_train) < 30 or len(X_test) == 0:
            print(
                f"{horizon}-day: insufficient data "
                f"(train={len(X_train)}, test={len(X_test)})"
            )
            continue

        imputer = SimpleImputer(strategy="median")
        X_train_imputed = imputer.fit_transform(X_train)
        X_test_imputed = imputer.transform(X_test)

        model = RandomForestRegressor(
            n_estimators=250,
            random_state=42,
            n_jobs=-1,
            max_features="sqrt",
            min_samples_leaf=2,
        )
        model.fit(X_train_imputed, y_train)

        predictions = model.predict(X_test_imputed)

        mae = mean_absolute_error(y_test, predictions)
        rmse = np.sqrt(mean_squared_error(y_test, predictions))

        # Persistence baseline: predict the latest observed discharge
        # available at the forecast origin.
        baseline = df.loc[X_test.index, "discharge_grdc"].astype(float)
        baseline_mae = mean_absolute_error(y_test, baseline)
        baseline_rmse = np.sqrt(mean_squared_error(y_test, baseline))

        results.append({
            "horizon_days": horizon,
            "training_rows": len(X_train),
            "test_rows": len(X_test),
            "model_MAE": mae,
            "model_RMSE": rmse,
            "baseline_MAE": baseline_mae,
            "baseline_RMSE": baseline_rmse,
        })

    if not results:
        raise RuntimeError("No horizon had enough data for evaluation.")

    result_df = pd.DataFrame(results)
    print(result_df.round(3).to_string(index=False))

    output_path = BACKEND_DIR / "scripts" / "forecast_evaluation.csv"
    result_df.to_csv(output_path, index=False)
    print(f"\nResults saved to: {output_path}")


if __name__ == "__main__":
    main()
