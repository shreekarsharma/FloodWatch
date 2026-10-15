
import joblib

for horizon in (1, 3, 5):
    path = f"ml/models/floodwatch_rf_{horizon}day.joblib"
    bundle = joblib.load(path)

    print(f"\n{horizon}-day model")
    print("Feature count:", len(bundle["features"]))
    print("Features:", bundle["features"])
    print("Expected inputs:", bundle["model"].n_features_in_)
