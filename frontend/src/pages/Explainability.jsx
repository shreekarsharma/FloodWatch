import { useEffect, useState } from "react"
import { getExplainability } from "../services/api"

const glassCard =
  "rounded-xl border border-white/10 bg-white/[0.07] p-5 shadow-[0_8px_32px_rgba(0,0,0,0.25)] backdrop-blur-2xl"

function Explainability() {
  const [horizon, setHorizon] = useState("3")
  const [difficulty, setDifficulty] = useState("high")
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const loadExplainability = async (
    selectedHorizon = horizon,
    selectedDifficulty = difficulty,
  ) => {
    setLoading(true)
    setError("")

    try {
      const result = await getExplainability(
        selectedHorizon,
        selectedDifficulty,
      )
      setData(result)
    } catch (err) {
      setError("Unable to load explainability data.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadExplainability()
  }, [])

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Explainability
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Explore which information influenced historical forecasts.
          </p>
        </div>

        <div>
          <p className="text-xs text-slate-500">
            Analysis
          </p>

          <p className="text-sm font-semibold text-white">
            Event-level feature importance
          </p>
        </div>
      </div>

      <div className={glassCard}>
        <h2 className="text-xl font-semibold text-white">
          Explainability Selection
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Select a forecast horizon and historical difficulty group.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <label>
            <span className="mb-2 block text-xs font-medium text-slate-300">
              Forecast Horizon
            </span>

            <select
              value={horizon}
              onChange={(event) => {
                const value = event.target.value
                setHorizon(value)
                loadExplainability(value, difficulty)
              }}
              className="w-full rounded-lg border border-white/10 bg-white/[0.05] px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400/50"
            >
              <option value="1">1 Day</option>
              <option value="3">3 Days</option>
              <option value="5">5 Days</option>
            </select>
          </label>

          <label>
            <span className="mb-2 block text-xs font-medium text-slate-300">
              Difficulty Group
            </span>

            <select
              value={difficulty}
              onChange={(event) => {
                const value = event.target.value
                setDifficulty(value)
                loadExplainability(horizon, value)
              }}
              className="w-full rounded-lg border border-white/10 bg-white/[0.05] px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400/50"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className={glassCard}>
          <p className="text-sm text-slate-400">
            Forecast Horizon
          </p>

          <p className="mt-3 text-3xl font-bold text-white">
            {horizon} Day
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Selected horizon
          </p>
        </div>

        <div className={glassCard}>
          <p className="text-sm text-slate-400">
            Difficulty Group
          </p>

          <p className="mt-3 text-2xl font-bold capitalize text-white">
            {difficulty}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Historical event group
          </p>
        </div>

        <div className={glassCard}>
          <p className="text-sm text-slate-400">
            Features
          </p>

          <p className="mt-3 text-3xl font-bold text-white">
            {data.length || "—"}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Returned feature records
          </p>
        </div>
      </div>

      <div className={glassCard}>
        <h2 className="text-xl font-semibold text-white">
          What Information Influenced This Forecast?
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Event-level permutation importance for the selected horizon and
          difficulty group.
        </p>

        {loading ? (
          <div className="flex min-h-40 flex-col items-center justify-center gap-3">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-cyan-300/30 border-t-cyan-300" />

            <p className="text-sm text-slate-400">
              Loading explainability data...
            </p>
          </div>
        ) : error ? (
          <div className="flex min-h-40 flex-col items-center justify-center gap-2">
            <p className="text-sm font-semibold text-red-300">
              Unable to load explainability data
            </p>

            <p className="text-xs text-slate-500">
              Make sure the FloodWatch backend is running.
            </p>
          </div>
        ) : data.length === 0 ? (
          <div className="flex min-h-40 flex-col items-center justify-center gap-2">
            <p className="text-sm font-semibold text-slate-400">
              No explainability data loaded
            </p>

            <p className="text-xs text-slate-500">
              Feature importance results will appear here.
            </p>
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {data.map((item, index) => {
              const feature =
                item.feature ??
                item.feature_name ??
                `Feature ${index + 1}`

              const importance =
                Number(item.importance ?? item.permutation_importance ?? 0)

              const width = Math.min(
                Math.max(Math.abs(importance) * 100, 4),
                100,
              )

              return (
                <div
                  key={feature}
                  className="rounded-lg border border-white/10 bg-white/[0.04] p-4"
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm font-medium text-slate-300">
                      {feature}
                    </span>

                    <span className="text-sm font-semibold text-cyan-300">
                      {importance.toFixed(4)}
                    </span>
                  </div>

                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/[0.06]">
                    <div
                      className="h-full rounded-full bg-cyan-400/70"
                      style={{ width: `${width}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className={glassCard}>
        <h2 className="text-xl font-semibold text-white">
          Interpretation
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-400">
          Feature importance indicates which input information was influential
          in the historical model analysis. It should be interpreted as model
          sensitivity rather than evidence that a feature caused the observed
          forecast outcome.
        </p>
      </div>
    </div>
  )
}

export default Explainability