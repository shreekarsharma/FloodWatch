import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

const data = [
  { date: "Jan 01", discharge: 420 },
  { date: "Jan 02", discharge: 510 },
  { date: "Jan 03", discharge: 480 },
  { date: "Jan 04", discharge: 620 },
  { date: "Jan 05", discharge: 710 },
  { date: "Jan 06", discharge: 680 },
  { date: "Jan 07", discharge: 842 },
]

function DischargeChart() {
  return (
    <div style={{ width: "100%", height: 320 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
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

          <Line
            type="monotone"
            dataKey="discharge"
            stroke="#38bdf8"
            strokeWidth={3}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default DischargeChart