import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getHistoricalData } from "../services/api";

function RainfallChart() {
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
          variable: "rainfall_mm",
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
            rainfall: Number(row.value),
          }));

        if (!cancelled) {
          setData(chartData);
        }
      } catch {
        if (!cancelled) {
          setError("Unable to load historical rainfall data.");
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
        Loading rainfall data…
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
        No rainfall data available.
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height: 320 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
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

          <Bar
            dataKey="rainfall"
            name="Rainfall (mm)"
            fill="#38bdf8"
            radius={[6, 6, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default RainfallChart;
