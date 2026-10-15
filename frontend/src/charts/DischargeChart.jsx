import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getHistoricalData } from "../services/api";

function DischargeChart() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const response = await getHistoricalData({
          variable: "discharge_grdc",
          startDate: "2007-01-01",
          endDate: "2007-02-28",
          limit: 500,
        });

        const rows = Array.isArray(response?.data) ? response.data : [];

        const chartData = rows
          .filter(
            (row) =>
              row.value !== null &&
              row.value !== undefined &&
              Number.isFinite(Number(row.value)),
          )
          .map((row) => ({
            date: row.date,
            discharge: Number(row.value),
          }));

        if (!cancelled) {
          setData(chartData);
        }
      } catch (err) {
        if (!cancelled) {
          setError("Unable to load historical discharge data.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex h-80 items-center justify-center text-sm text-slate-400">
        Loading discharge data…
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-80 items-center justify-center text-sm text-rose-300">
        {error}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex h-80 items-center justify-center text-sm text-slate-400">
        No observed discharge data available.
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height: 320 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(148, 163, 184, 0.15)"
          />

          <XAxis dataKey="date" stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" />

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
            name="Discharge (m³/s)"
            stroke="#38bdf8"
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default DischargeChart;
