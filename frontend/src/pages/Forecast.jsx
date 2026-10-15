import { useState } from "react"
import { getForecast } from "../services/api"

const glassCard =
  "rounded-xl border border-white/10 bg-white/[0.07] p-5 shadow-[0_8px_32px_rgba(0,0,0,0.25)] backdrop-blur-2xl"

const inputClass =
  "w-full rounded-lg border border-white/10 bg-white/[0.05] px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400/50"

function Forecast() {
  const [forecastDate, setForecastDate] = useState("")
  const [horizon, setHorizon] = useState("1")
  const [forecast, setForecast] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const forecastDates = [
    { value: "2007-02-28", label: "2007-02-28" },
    { value: "2007-02-27", label: "2007-02-27" },
    { value: "2007-02-26", label: "2007-02-26" },
    { value: "2007-02-25", label: "2007-02-25" },
    { value: "2007-02-24", label: "2007-02-24" },
    { value: "2007-02-20", label: "2007-02-20" },
  ]

  const handleForecast = async () => {
    if (!forecastDate) {
      setError("Please select a forecast date.")
      return
    }

    setLoading(true)
    setError("")
    setForecast(null)

    try {
      const data = await getForecast(forecastDate)

      if (!Array.isArray(data.forecasts)) {
        throw new Error("Unexpected forecast response format.")
      }

      setForecast(data)
    } catch (err) {
      console.error("Forecast request failed:", err)
      setError(err.message || "Unable to load forecast.")
    } finally {
      setLoading(false)
    }
  }

  const forecasts = forecast?.forecasts ?? []

  const selectedForecast = forecasts.find(
    (item) => item.horizon_days === Number(horizon),
  )

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Flood Forecast
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            View historical multi-horizon discharge forecasts and warning levels.
          </p>
        </div>

        <div>
          <p className="text-xs text-slate-500">Model</p>
          <p className="text-sm font-semibold text-white">
            Random Forest
          </p>
        </div>
      </div>

      <div className={glassCard}>
        <h2 className="text-xl font-semibold text-white">
          Forecast Selection
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Select a forecast date and prediction horizon.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <label>
            <span className="mb-2 block text-xs font-medium text-slate-300">
              Forecast Date
            </span>

            <select
              value={forecastDate}
              onChange={(event) => {
                setForecastDate(event.target.value)
                setForecast(null)
                setError("")
              }}
              className={inputClass}
            >
              <option value="">Select date</option>

              {forecastDates.map((date) => (
                <option key={date.value} value={date.value}>
                  {date.label}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="mb-2 block text-xs font-medium text-slate-300">
              Forecast Horizon
            </span>

            <select
              value={horizon}
              onChange={(event) => setHorizon(event.target.value)}
              className={inputClass}
            >
              <option value="1">1 Day</option>
              <option value="3">3 Days</option>
              <option value="5">5 Days</option>
            </select>
          </label>

          <div className="flex items-end">
            <button
              type="button"
              onClick={handleForecast}
              disabled={loading}
              className="w-full rounded-lg bg-cyan-400/15 px-4 py-2.5 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-400/25 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Loading..." : "Get Forecast"}
            </button>
          </div>
        </div>

        {error && (
          <p className="mt-4 text-sm text-red-300">
            {error}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[
          ["1-Day Forecast", 1],
          ["3-Day Forecast", 3],
          ["5-Day Forecast", 5],
        ].map(([label, cardHorizon]) => {
          const item = forecasts.find(
            (result) => result.horizon_days === cardHorizon,
          )

          return (
            <div key={cardHorizon} className={glassCard}>
              <p className="text-sm text-slate-400">{label}</p>

              <p className="mt-3 text-3xl font-bold text-white">
                {item ? item.predicted_discharge : "—"}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Discharge (m³/s)
              </p>

              <p className="mt-4 text-sm text-slate-400">
                Warning:{" "}
                <span className="font-semibold text-white">
                  {item ? item.warning_level : "—"}
                </span>
              </p>

              {item && (
                <p className="mt-2 text-xs text-slate-500">
                  Forecast date: {item.forecast_date}
                </p>
              )}
            </div>
          )
        })}
      </div>

      <div className={glassCard}>
        <h2 className="text-xl font-semibold text-white">
          Forecast Details
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          {forecast
            ? `Forecast origin: ${forecast.forecast_origin}`
            : "Forecast results will appear here after you generate a forecast."}
        </p>

        {selectedForecast && (
          <div className="mt-4 space-y-2 text-sm text-slate-300">
            <p>
              Selected horizon: {selectedForecast.horizon_days} day(s)
            </p>
            <p>
              Predicted discharge: {selectedForecast.predicted_discharge} m³/s
            </p>
            <p>
              Warning level: {selectedForecast.warning_level}
            </p>
            <p>
              Training rows: {selectedForecast.training_rows}
            </p>
            <p>
              Training data through: {selectedForecast.training_last_target_date}
            </p>
          </div>
        )}

        {forecast && (
          <pre className="mt-5 overflow-x-auto rounded-lg border border-white/10 bg-black/20 p-4 text-xs text-slate-300">
            {JSON.stringify(forecast, null, 2)}
          </pre>
        )}
      </div>
    </div>
  )
}

export default Forecast
