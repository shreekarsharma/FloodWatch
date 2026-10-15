\# FloodWatch — AI/ML Models



\## Overview



FloodWatch uses Random Forest regression models to forecast discharge in the White Volta Basin using historical data. Three forecast horizons are supported: 1, 3, and 5 calendar days.



These models are research prototypes. Their evaluation results do not establish operational flood-warning reliability.



\## Model Configuration



\- \*\*Algorithm:\*\* `RandomForestRegressor`

\- \*\*Number of trees:\*\* 300

\- \*\*Maximum features:\*\* `sqrt`

\- \*\*Minimum samples per leaf:\*\* 2

\- \*\*Random state:\*\* 42

\- \*\*Predictor count:\*\* 23

\- \*\*Missing-value handling:\*\* Median imputation, fitted separately for each forecast horizon.



\## Forecast Horizons



The models predict discharge at the exact calendar date `t + h`, where `h` is 1, 3, or 5 days. Missing future calendar dates are not replaced by adjacent dataset rows.



Saved model artifacts are located in `ml/models/`:



\- `floodwatch\_rf\_1day.joblib`

\- `floodwatch\_rf\_3day.joblib`

\- `floodwatch\_rf\_5day.joblib`

\- `model\_metadata.json`



The training script is `ml/src/train\_final\_models.py`.



\## Research Evaluation



The calendar-correct, event-level Leave-One-Flood-Event-Out (LOFO) evaluation covers 12 eligible events.



| Horizon | Mean MAE (m³/s) | Mean RMSE (m³/s) | Mean R² | Mean warning accuracy |

|---|---:|---:|---:|---:|

| 1 day | 160.56 | 191.28 | -0.735 | 65.16% |

| 3 days | 217.39 | 254.48 | -0.954 | 56.95% |

| 5 days | 270.25 | 312.89 | -0.782 | 48.37% |



These are the reported event-level evaluation results, not training-set scores. Negative mean R² indicates that performance is worse than the corresponding mean-target baseline under the evaluated scoring setup. Warning accuracy should not be interpreted as proof of operational safety.



Research outputs are available in `ml/notebooks/`, including fold results, predictions, event-level performance, feature importance, explanation stability, and storage sensitivity analysis.



\## Warning Thresholds



The configured discharge thresholds are:



\- \*\*Yellow:\*\* 1114.16 m³/s

\- \*\*Orange:\*\* 1362.21 m³/s

\- \*\*Red:\*\* 1898.58 m³/s



These thresholds are configuration values and do not independently validate a warning decision.



\## Data and Limitations



\- The feature matrix is `ml/data/feature\_matrix\_full.csv`.

\- The feature matrix spans 1987–2023, but observed discharge is available only through 28 February 2007 in the current training data.

\- The provenance and construction of `bagre\_storage\_30d` remain unverified and require investigation.

\- Final deployment artifacts are fitted using all eligible historical target rows. This differs from the event-held-out LOFO research evaluation.

\- The models have passed technical artifact-loading and prediction smoke tests. These checks do not establish forecast accuracy or current-day operational readiness.

\- Further validation and investigation of model performance are required before operational flood-warning use.



\## Reproducibility



From the repository root, run:



```powershell

python ml/src/train\_final\_models.py

```



The script trains all three horizon-specific models and writes the model artifacts and metadata into `ml/models/`.



Use a Python environment with compatible scikit-learn, pandas, NumPy, and joblib dependencies. The training script prints the installed scikit-learn version during execution.



