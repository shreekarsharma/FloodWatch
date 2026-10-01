import DischargeChart from "../charts/DischargeChart"
import RainfallChart from "../charts/RainfallChart"

const glassCard =
  "rounded-xl border border-white/10 bg-white/[0.07] p-5 shadow-[0_8px_32px_rgba(0,0,0,0.25)] backdrop-blur-2xl"

const summaryCards = [
  {
    label: "Latest Discharge",
    value: "842 m³/s",
    description: "Current observed discharge",
  },
  {
    label: "Latest Rainfall",
    value: "18.4 mm",
    description: "Recent rainfall",
  },
  {
    label: "Soil Moisture",
    value: "0.61",
    description: "Current soil moisture",
  },
  {
    label: "Warning Level",
    value: "GREEN",
    description: "Current status",
  },
]

function Dashboard() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl font-bold text-white">
            FloodWatch Dashboard
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Historical flood monitoring and multi-horizon forecasting.
          </p>
        </div>

        <div>
          <p className="text-xs text-slate-500">Basin</p>
          <p className="text-sm font-semibold text-white">
            White Volta Basin
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <div key={card.label} className={glassCard}>
            <p className="text-sm text-slate-400">{card.label}</p>

            <p className="mt-3 text-2xl font-bold text-white">
              {card.value}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              {card.description}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className={glassCard}>
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-white">
              Recent Discharge
            </h2>

            <p className="text-sm text-slate-500">
              Historical discharge observations
            </p>
          </div>

          <DischargeChart />
        </div>

        <div className={glassCard}>
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-white">
              Recent Rainfall
            </h2>

            <p className="text-sm text-slate-500">
              Historical rainfall observations
            </p>
          </div>

          <RainfallChart />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className={glassCard}>
          <h2 className="text-lg font-semibold text-white">
            Current Warning Status
          </h2>

          <div className="mt-5 flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-emerald-300">
                GREEN
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Current observed discharge is below the flood threshold.
              </p>
            </div>

            <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm font-semibold text-emerald-300">
              Normal
            </div>
          </div>
        </div>

        <div className={glassCard}>
          <h2 className="text-lg font-semibold text-white">
            Forecast Overview
          </h2>

          <div className="mt-5 grid grid-cols-3 gap-3">
            {[
              ["1 Day", "910 m³/s", "GREEN"],
              ["3 Days", "1040 m³/s", "YELLOW"],
              ["5 Days", "1180 m³/s", "YELLOW"],
            ].map(([horizon, discharge, warning]) => (
              <div
                key={horizon}
                className="rounded-lg border border-white/10 bg-white/[0.04] p-3"
              >
                <p className="text-xs text-slate-500">{horizon}</p>
                <p className="mt-2 text-lg font-bold text-white">
                  {discharge}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  {warning}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={glassCard}>
        <h2 className="text-lg font-semibold text-white">
          Recent Flood Events
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Historical events detected using the project flood threshold.
        </p>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-slate-400">
                <th className="px-3 py-3 font-medium">Event</th>
                <th className="px-3 py-3 font-medium">Start</th>
                <th className="px-3 py-3 font-medium">End</th>
                <th className="px-3 py-3 font-medium">Peak</th>
              </tr>
            </thead>

            <tbody>
              <tr className="border-b border-white/[0.06]">
                <td className="px-3 py-3 text-slate-300">—</td>
                <td className="px-3 py-3 text-slate-400">—</td>
                <td className="px-3 py-3 text-slate-400">—</td>
                <td className="px-3 py-3 text-slate-400">—</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Dashboard