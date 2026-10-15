import { useEffect, useState } from "react"
import { getDifficulty } from "../services/api"

const glassCard =
  "rounded-xl border border-white/10 bg-white/[0.07] p-5 shadow-[0_8px_32px_rgba(0,0,0,0.25)] backdrop-blur-2xl"

function DifficultyBadge({ level }) {
  const styles = {
    LOW: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
    MEDIUM: "border-yellow-400/20 bg-yellow-400/10 text-yellow-300",
    HIGH: "border-red-400/20 bg-red-400/10 text-red-300",
  }

  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-semibold ${
        styles[level] || "border-white/10 bg-white/5 text-slate-400"
      }`}
    >
      {level || "—"}
    </span>
  )
}

function EventDifficulty() {
  const [horizon, setHorizon] = useState("3")
  const [difficultyData, setDifficultyData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const loadDifficulty = async (selectedHorizon = horizon) => {
    setLoading(true)
    setError("")

    try {
      const data = await getDifficulty(selectedHorizon)
      setDifficultyData(data)
    } catch (err) {
      setError("Unable to load event difficulty data.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDifficulty()
  }, [])

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Event Difficulty
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Historical forecast difficulty across flood events and horizons.
          </p>
        </div>

        <div>
          <p className="text-xs text-slate-500">
            Difficulty basis
          </p>

          <p className="text-sm font-semibold text-white">
            Event-level MAE
          </p>
        </div>
      </div>

      <div className={glassCard}>
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h2 className="text-xl font-semibold text-white">
              Forecast Horizon
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Select the forecast horizon to inspect event difficulty.
            </p>
          </div>

          <select
            value={horizon}
            onChange={(event) => {
              const value = event.target.value
              setHorizon(value)
              loadDifficulty(value)
            }}
            className="rounded-lg border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm text-white outline-none focus:border-cyan-400/50"
          >
            <option value="1">1 Day</option>
            <option value="3">3 Days</option>
            <option value="5">5 Days</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className={glassCard}>
          <p className="text-sm text-slate-400">
            Selected Horizon
          </p>

          <p className="mt-3 text-3xl font-bold text-white">
            {horizon} Day
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Forecast horizon
          </p>
        </div>

        <div className={glassCard}>
          <p className="text-sm text-slate-400">
            Events Evaluated
          </p>

          <p className="mt-3 text-3xl font-bold text-white">
            {difficultyData.length || "—"}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Historical events
          </p>
        </div>

        <div className={glassCard}>
          <p className="text-sm text-slate-400">
            Difficulty Metric
          </p>

          <p className="mt-3 text-xl font-bold text-white">
            Event MAE
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Higher MAE indicates greater forecast error
          </p>
        </div>
      </div>

      <div className={glassCard}>
        <h2 className="text-xl font-semibold text-white">
          Event Difficulty Results
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Historical difficulty classification for individual flood events.
        </p>

        <div className="mt-6 overflow-hidden rounded-lg border border-white/10 bg-white/[0.035]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.04] text-slate-300">
                  <th className="px-4 py-3 font-medium">Event</th>
                  <th className="px-4 py-3 font-medium">MAE</th>
                  <th className="px-4 py-3 font-medium">RMSE</th>
                  <th className="px-4 py-3 font-medium">Difficulty</th>
                </tr>
              </thead>

              <tbody>
                {difficultyData.map((event, index) => (
                  <tr
                    key={event.episode_id ?? index}
                    className="border-b border-white/[0.06] transition hover:bg-white/[0.04]"
                  >
                    <td className="px-4 py-3 font-medium text-slate-200">
                      {event.episode_id ?? `Event ${index + 1}`}
                    </td>

                    <td className="px-4 py-3 text-slate-300">
                      {event.mae ?? "—"}
                    </td>

                    <td className="px-4 py-3 text-slate-300">
                      {event.rmse ?? "—"}
                    </td>

                    <td className="px-4 py-3">
                      <DifficultyBadge level={event.difficulty} />
                    </td>
                  </tr>
                ))}

                {difficultyData.length === 0 && (
                  <tr>
                    <td colSpan={4}>
                      <div className="flex min-h-40 flex-col items-center justify-center gap-2 px-4">
                        {loading ? (
                          <>
                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-cyan-300/30 border-t-cyan-300" />
                            <p className="text-sm font-semibold text-slate-400">
                              Loading difficulty data...
                            </p>
                          </>
                        ) : error ? (
                          <>
                            <p className="text-sm font-semibold text-red-300">
                              Unable to load difficulty data
                            </p>

                            <p className="text-xs text-slate-500">
                              Make sure the FloodWatch backend is running.
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="text-sm font-semibold text-slate-400">
                              No difficulty data loaded
                            </p>

                            <p className="text-xs text-slate-500">
                              Historical event difficulty will appear here.
                            </p>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className={glassCard}>
        <h2 className="text-xl font-semibold text-white">
          Factors Associated With Forecasting Difficulty
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-400">
          Historical analysis examines characteristics associated with event
          forecast error. These associations should not be interpreted as
          causal explanations.
        </p>

        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
          {[
            "Antecedent rainfall",
            "Antecedent discharge",
            "Rise rate",
            "Peak discharge",
            "Maximum event rainfall",
            "Onset soil moisture",
            "Reservoir storage",
          ].map((factor) => (
            <div
              key={factor}
              className="rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-300"
            >
              {factor}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default EventDifficulty