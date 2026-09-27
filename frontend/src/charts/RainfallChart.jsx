import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

const data = [
  { date: "Jan 01", rainfall: 4 },
  { date: "Jan 02", rainfall: 8 },
  { date: "Jan 03", rainfall: 3 },
  { date: "Jan 04", rainfall: 12 },
  { date: "Jan 05", rainfall: 18 },
  { date: "Jan 06", rainfall: 14 },
  { date: "Jan 07", rainfall: 18.4 },
]

function RainfallChart() {
  return (
    <div style={{ width: "100%", height: 320 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(148, 163, 184, 0.15)"
          />

          <XAxis
            dataKey="date"
            stroke="#94a3b8"
          />

          <YAxis
            stroke="#94a3b8"
          />

          <Tooltip
            contentStyle={{
              background: "rgba(15, 23, 42, 0.95)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              borderRadius: 10,
              color: "#fff",
            }}
          />

          <Bar
            dataKey="rainfall"
            fill="#38bdf8"
            radius={[6, 6, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default RainfallChart