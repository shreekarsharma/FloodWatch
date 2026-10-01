import { useEffect, useState } from "react"
import { getHistoricalData } from "../services/api"

const glassCard =
  "rounded-xl border border-white/10 bg-white/[0.07] p-5 shadow-[0_8px_32px_rgba(0,0,0,0.25)] backdrop-blur-2xl"

const inputClass =
  "w-full rounded-lg border border-white/10 bg-white/[0.05] px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/50"

function HistoricalData() {
  const [historicalData, setHistoricalData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [variable, setVariable] = useState("Discharge")
  const [warningLevel, setWarningLevel] = useState("All levels")

  useEffect(() => {
    async function loadHistoricalData() {
      setLoading(true)
      setError("")

      try {
        const data = await getHistoricalData()
        setHistoricalData(data)
      } catch (err) {
        setError("Unable to load historical data.")
      } finally {
        setLoading(false)
      }
    }

    loadHistoricalData()
  }, [])

  const handleApplyFilters = async () => {
    setLoading(true)
    setError("")

    try {
      const data = await getHistoricalData({
        startDate,
        endDate,
        variable,
        warningLevel,
      })

      setHistoricalData(data)
    } catch (err) {
      setError("Unable to load historical data.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Historical Data
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Explore historical hydrological and environmental observations.
          </p>
        </div>

        <div>
          <p className="text-xs text-slate-500">Dataset</p>
          <p className="text-sm font-semibold text-white">
            White Volta Basin
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Date Range", "1987 – 2007", "Forecast analysis period"],
          ["Observations", "13,514", "Prepared feature records"],
          ["Main Variable", "Discharge", "Nawuni gauge observations"],
          ["Flood Threshold", "1,114 m³/s", "Historical event detection level"],
        ].map(([label, value, description]) => (
          <div key={label} className={glassCard}>
            <p className="text-sm text-slate-400">{label}</p>

            <p className="mt-3 text-2xl font-bold text-white">
              {value}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              {description}
            </p>
          </div>
        ))}
      </div>

      <div className={glassCard}>
        <h2 className="text-xl font-semibold text-white">
          Historical Observations
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Select a date range and variables to explore the historical dataset.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
          <label className="block">
            <span className="mb-2 block text-xs font-medium text-slate-300">
              Start Date
            </span>

            <input
              type="text"
              placeholder="YYYY-MM-DD"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              className={inputClass}
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-medium text-slate-300">
              End Date
            </span>

            <input
              type="text"
              placeholder="YYYY-MM-DD"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              className={inputClass}
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-medium text-slate-300">
              Variable
            </span>

            <select
              value={variable}
              onChange={(event) => setVariable(event.target.value)}
              className={inputClass}
            >
              <option value="Discharge">Discharge</option>
              <option value="Rainfall">Rainfall</option>
              <option value="Soil Moisture">Soil Moisture</option>
              <option value="Temperature">Temperature</option>
              <option value="Reservoir Storage">
                Reservoir Storage
              </option>
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-medium text-slate-300">
              Warning Level
            </span>

            <select
              value={warningLevel}
              onChange={(event) => setWarningLevel(event.target.value)}
              className={inputClass}
            >
              <option value="All levels">All levels</option>
              <option value="GREEN">GREEN</option>
              <option value="YELLOW">YELLOW</option>
              <option value="ORANGE">ORANGE</option>
              <option value="RED">RED</option>
            </select>
          </label>

          <button
            type="button"
            onClick={handleApplyFilters}
            disabled={loading}
            className="rounded-lg bg-cyan-400/15 px-4 py-2.5 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-400/25 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Loading..." : "Apply Filters"}
          </button>
        </div>

        <div className="mt-6 overflow-hidden rounded-lg border border-white/10 bg-white/[0.035]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.04] text-slate-300">
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Discharge</th>
                  <th className="px-4 py-3 font-medium">Rainfall</th>
                  <th className="px-4 py-3 font-medium">Soil Moisture</th>
                  <th className="px-4 py-3 font-medium">Temperature</th>
                  <th className="px-4 py-3 font-medium">
                    Reservoir Storage
                  </th>
                  <th className="px-4 py-3 font-medium">Warning Level</th>
                </tr>
              </thead>

              <tbody>
                {historicalData.map((row, index) => (
                  <tr
                    key={row.date || index}
                    className="border-b border-white/[0.06] transition hover:bg-white/[0.04]"
                  >
                    <td className="px-4 py-3 text-slate-300">
                      {row.date || "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {row.discharge ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {row.rainfall ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {row.soil_moisture ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {row.temperature ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {row.reservoir_storage ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {row.warning_level ?? "—"}
                    </td>
                  </tr>
                ))}

                {historicalData.length === 0 && (
                  <tr>
                    <td colSpan={7}>
                      <div className="flex min-h-40 flex-col items-center justify-center gap-2 px-4">
                        {loading ? (
                          <>
                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-cyan-300/30 border-t-cyan-300" />
                            <p className="text-sm font-semibold text-slate-400">
                              Loading historical data...
                            </p>
                          </>
                        ) : error ? (
                          <>
                            <p className="text-sm font-semibold text-red-300">
                              Unable to load historical data
                            </p>
                            <p className="text-xs text-slate-500">
                              Make sure the FloodWatch backend is running on port 8000.
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="text-sm font-semibold text-slate-400">
                              No historical data loaded
                            </p>
                            <p className="text-xs text-slate-500">
                              Apply a date range and variable filter to load historical observations.
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

        <div className="mt-4 flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.045] px-4 py-3">
          <p className="text-sm text-slate-500">
            Showing {historicalData.length} of 13,514 records
          </p>

          <button
            type="button"
            disabled
            className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-slate-600"
          >
            Page 1
          </button>
        </div>
      </div>
    </div>
  )
}

export default HistoricalData