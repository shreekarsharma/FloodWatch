import numpy as np
import pandas as pd
from pathlib import Path
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score, accuracy_score

ROOT = Path(__file__).resolve().parents[2]
DATA_PATH = ROOT / "ml" / "data" / "feature_matrix_full.csv"
OUT = ROOT / "ml" / "notebooks"
YELLOW, ORANGE, RED = 1114.16, 1362.21, 1898.58

df = pd.read_csv(DATA_PATH)
df["date"] = pd.to_datetime(df["date"])
obs = df.dropna(subset=["discharge_grdc"]).copy().sort_values("date").reset_index(drop=True)

daily = obs.set_index("date").sort_index()
for h in [1, 3, 5]:
    target_map = daily["discharge_grdc"].copy()
    target_map.index = target_map.index - pd.to_timedelta(h, unit="D")
    obs[f"target_{h}d"] = obs["date"].map(target_map)

flag = obs.discharge_grdc >= YELLOW
episode = []
eid = 0
below = 2
for x in flag:
    if x:
        if below >= 2:
            eid += 1
        episode.append(eid)
        below = 0
    else:
        episode.append(0)
        below += 1
obs["episode_id"] = episode

events = obs[obs.episode_id > 0].groupby("episode_id").agg(
    start=("date", "min"), end=("date", "max"), peak=("discharge_grdc", "max")
).reset_index()
event_ids = sorted(events.episode_id.tolist())

candidate_features = [
    "rainfall_mm", "temperature_c", "et_mm", "soil_moisture",
    "bagre_storage", "bagre_storage_30d",
    *[f"discharge_lag{i}" for i in range(1, 11)],
    *[f"rainfall_lag{i}" for i in range(1, 6)],
]
features = [c for c in candidate_features if c in obs.columns]
obs["sin_doy"] = np.sin(2*np.pi*obs.date.dt.dayofyear/365.25)
obs["cos_doy"] = np.cos(2*np.pi*obs.date.dt.dayofyear/365.25)
features += ["sin_doy", "cos_doy"]
model_df = obs.copy()

def warning(q):
    if q < YELLOW:
        return "Normal"
    if q < ORANGE:
        return "Yellow"
    if q < RED:
        return "Orange"
    return "Red"

def run_comparison(horizon, use_storage_feature):
    target = f"target_{horizon}d"
    work = model_df.dropna(subset=[target]).copy()
    cols = features if use_storage_feature else [c for c in features if c != "bagre_storage_30d"]
    folds, predictions = [], []

    for event_id in event_ids:
        test = work[work.episode_id == event_id].copy()
        if test.empty:
            continue
        start = test.date.min()
        train = work[work.date < start].copy()
        if len(train) < 300:
            continue

        Xtr, Xte = train[cols].copy(), test[cols].copy()
        ytr, yte = train[target].to_numpy(), test[target].to_numpy()
        med = Xtr.median()
        Xtr, Xte = Xtr.fillna(med), Xte.fillna(med)

        model = RandomForestRegressor(
            n_estimators=300, random_state=42, n_jobs=-1,
            max_features="sqrt", min_samples_leaf=2
        )
        model.fit(Xtr, ytr)
        pred = model.predict(Xte)

        folds.append({
            "configuration": "with_bagre_storage_30d" if use_storage_feature else "without_bagre_storage_30d",
            "horizon_days": horizon, "episode_id": event_id,
            "test_start": test.date.min(), "test_end": test.date.max(),
            "n_test": len(test), "MAE": mean_absolute_error(yte, pred),
            "RMSE": np.sqrt(mean_squared_error(yte, pred)),
            "R2": r2_score(yte, pred) if len(np.unique(yte)) > 1 else np.nan,
            "warning_accuracy": accuracy_score([warning(x) for x in yte], [warning(x) for x in pred])
        })
        p = test[["date", "episode_id", "discharge_grdc"]].copy()
        p["configuration"] = "with_bagre_storage_30d" if use_storage_feature else "without_bagre_storage_30d"
        p["horizon_days"] = horizon
        p["actual_future_discharge"] = yte
        p["predicted_discharge"] = pred
        p["absolute_error"] = np.abs(yte - pred)
        p["actual_warning"] = [warning(x) for x in yte]
        p["predicted_warning"] = [warning(x) for x in pred]
        predictions.append(p)

    return pd.DataFrame(folds), pd.concat(predictions, ignore_index=True)

all_folds, all_predictions = [], []
for config in [True, False]:
    for horizon in [1, 3, 5]:
        f, p = run_comparison(horizon, config)
        all_folds.append(f)
        all_predictions.append(p)

folds = pd.concat(all_folds, ignore_index=True)
predictions = pd.concat(all_predictions, ignore_index=True)
summary = folds.groupby(["configuration", "horizon_days"]).agg(
    mean_MAE=("MAE", "mean"),
    median_MAE=("MAE", "median"),
    mean_RMSE=("RMSE", "mean"),
    mean_R2=("R2", "mean"),
    mean_warning_accuracy=("warning_accuracy", "mean"),
    events=("episode_id", "nunique")
).reset_index()

folds.to_csv(OUT / "storage_sensitivity_fold_results.csv", index=False)
predictions.to_csv(OUT / "storage_sensitivity_predictions.csv", index=False)
summary.to_csv(OUT / "storage_sensitivity_summary.csv", index=False)
print(summary.to_string(index=False))
print("\nSaved separate storage_sensitivity_*.csv files. Original results were not overwritten.")
