import { useEffect, useState } from "react"
import { getFloodEvents } from "../services/api"

const glassCard =
  "rounded-xl border border-white/10 bg-white/[0.07] p-5 shadow-[0_8px_32px_rgba(0,0,0,0.25)] backdrop-blur-2xl"

function FloodEvents() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    async function loadEvents() {
      setLoading(true)
      setError("")

      try {
        const data = await getFloodEvents()
        setEvents(data)
      } catch (err) {
        setError("Unable to load flood events.")
      } finally {
        setLoading(false)
      }
    }

    loadEvents()
  }, [])

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Flood Events
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Historical flood events detected from discharge observations.
          </p>
        </div>

        <div>
          <p className="text-xs text-slate-500">
            Detection threshold
          </p>

          <p className="text-sm font-semibold text-white">
            1,114 m³/s
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className={glassCard}>
          <p className="text-sm text-slate-400">
            Detected Events
          </p>

          <p className="mt-3 text-3xl font-bold text-white">
            {events.length || "—"}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Historical flood events
          </p>
        </div>

        <div className={glassCard}>
          <p className="text-sm text-slate-400">
            Event Definition
          </p>

          <p className="mt-3 text-lg font-bold text-white">
            ≥ 1,114 m³/s
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Discharge threshold
          </p>
        </div>

        <div className={glassCard}>
          <p className="text-sm text-slate-400">
            Dataset Period
          </p>

          <p className="mt-3 text-lg font-bold text-white">
            1987–2007
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Observed discharge period
          </p>
        </div>
      </div>

      <div className={glassCard}>
        <h2 className="text-xl font-semibold text-white">
          Historical Flood Events
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Start, end, duration, and peak discharge for detected events.
        </p>

        <div className="mt-6 overflow-hidden rounded-lg border border-white/10 bg-white/[0.035]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.04] text-slate-300">
                  <th className="px-4 py-3 font-medium">Event</th>
                  <th className="px-4 py-3 font-medium">Start</th>
                  <th className="px-4 py-3 font-medium">End</th>
                  <th className="px-4 py-3 font-medium">Duration</th>
                  <th className="px-4 py-3 font-medium">Peak Discharge</th>
                  <th className="px-4 py-3 font-medium">Peak Date</th>
                </tr>
              </thead>

              <tbody>
                {events.map((event, index) => (
                  <tr
                    key={event.episode_id ?? index}
                    className="border-b border-white/[0.06] transition hover:bg-white/[0.04]"
                  >
                    <td className="px-4 py-3 font-medium text-slate-200">
                      {event.episode_id ?? `Event ${index + 1}`}
                    </td>

                    <td className="px-4 py-3 text-slate-300">
                      {event.start ?? "—"}
                    </td>

                    <td className="px-4 py-3 text-slate-300">
                      {event.end ?? "—"}
                    </td>

                    <td className="px-4 py-3 text-slate-300">
                      {event.duration_days != null
                        ? `${event.duration_days} days`
                        : "—"}
                    </td>

                    <td className="px-4 py-3 text-slate-300">
                      {event.peak_discharge != null
                        ? `${event.peak_discharge} m³/s`
                        : "—"}
                    </td>

                    <td className="px-4 py-3 text-slate-300">
                      {event.peak_date ?? "—"}
                    </td>
                  </tr>
                ))}

                {events.length === 0 && (
                  <tr>
                    <td colSpan={6}>
                      <div className="flex min-h-40 flex-col items-center justify-center gap-2 px-4">
                        {loading ? (
                          <>
                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-cyan-300/30 border-t-cyan-300" />
                            <p className="text-sm font-semibold text-slate-400">
                              Loading flood events...
                            </p>
                          </>
                        ) : error ? (
                          <>
                            <p className="text-sm font-semibold text-red-300">
                              Unable to load flood events
                            </p>

                            <p className="text-xs text-slate-500">
                              Make sure the FloodWatch backend is running on port 8000.
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="text-sm font-semibold text-slate-400">
                              No flood events loaded
                            </p>

                            <p className="text-xs text-slate-500">
                              Historical event data will appear here.
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
    </div>
  )
}

export default FloodEvents