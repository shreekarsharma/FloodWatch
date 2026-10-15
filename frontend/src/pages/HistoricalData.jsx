
import { useEffect, useState } from "react";
import { getHistoricalData } from "../services/api";

const glassCard =
  "rounded-xl border border-white/10 bg-white/[0.07] p-5 shadow-[0_8px_32px_rgba(0,0,0,0.25)] backdrop-blur-2xl";

const inputClass =
  "w-full rounded-lg border border-white/10 bg-white/[0.05] px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400/50";

const variableMap = {
  Discharge: "discharge_grdc",
  Rainfall: "rainfall_mm",
  "Soil Moisture": "soil_moisture",
  Temperature: "temperature_c",
  "Reservoir Storage": "bagre_storage",
};

const formatValue = (value) => {
  if (value === null || value === undefined || value === "") return "—";

  if (typeof value === "number") {
    return value.toLocaleString(undefined, {
      maximumFractionDigits: 2,
    });
  }

  return String(value);
};

function HistoricalData() {
  const [historicalData, setHistoricalData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [variable, setVariable] = useState("Discharge");
  const [warningLevel, setWarningLevel] = useState("All levels");
  const [recordCount, setRecordCount] = useState(0);

  async function loadHistoricalData(filters = {}) {
    setLoading(true);
    setError("");

    try {
      const response = await getHistoricalData({
        ...filters,
        variable: variableMap[filters.variable || variable],
      });

      // The backend returns { count, variable, data: [...] }.
      const rows = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
          ? response.data
          : [];

      setHistoricalData(rows);
      setRecordCount(
        typeof response?.count === "number" ? response.count : rows.length
      );
    } catch (err) {
      console.error("Historical data request failed:", err);
      setHistoricalData([]);
      setRecordCount(0);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load historical data."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadHistoricalData();
    // Load the initial dataset once when the page mounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleApplyFilters = async (event) => {
    event.preventDefault();

    if (startDate && endDate && startDate > endDate) {
      setError("Start date cannot be later than end date.");
      return;
    }

    await loadHistoricalData({
      startDate,
      endDate,
      variable,
      warningLevel,
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl font-bold text-white">Historical Data</h1>
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
            <p className="mt-3 text-2xl font-bold text-white">{value}</p>
            <p className="mt-1 text-xs text-slate-500">{description}</p>
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

        <form
          onSubmit={handleApplyFilters}
          className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5"
        >
          <label className="block">
            <span className="mb-2 block text-xs font-medium text-slate-300">
              Start Date
            </span>
            <input
              type="date"
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
              type="date"
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
              {Object.keys(variableMap).map((name) => (
                <option key={name} value={name} className="bg-slate-900">
                  {name}
                </option>
              ))}
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
              <option value="All levels" className="bg-slate-900">
                All levels
              </option>
              <option value="Normal" className="bg-slate-900">Normal</option>
              <option value="Yellow" className="bg-slate-900">Yellow</option>
              <option value="Orange" className="bg-slate-900">Orange</option>
              <option value="Red" className="bg-slate-900">Red</option>
            </select>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="self-end rounded-lg bg-cyan-400/15 px-4 py-3 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-400/25 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Loading..." : "Apply Filters"}
          </button>
        </form>

        {error && (
          <div
            role="alert"
            className="mt-4 rounded-lg border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300"
          >
            {error}
          </div>
        )}

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
                  <th className="px-4 py-3 font-medium">Reservoir Storage</th>
                  <th className="px-4 py-3 font-medium">Warning Level</th>
                </tr>
              </thead>

              <tbody>
                {historicalData.map((row, index) => (
                  <tr
                    key={`${row.date || "row"}-${index}`}
                    className="border-b border-white/[0.06] transition hover:bg-white/[0.04]"
                  >
                    <td className="px-4 py-3 text-slate-300">
                      {row.date || "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {formatValue(row.discharge_grdc)}
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {formatValue(row.rainfall_mm)}
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {formatValue(row.soil_moisture)}
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {formatValue(row.temperature_c)}
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {formatValue(row.bagre_storage)}
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {row.warning_level || "—"}
                    </td>
                  </tr>
                ))}

                {loading && historicalData.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                      Loading historical data...
                    </td>
                  </tr>
                )}

                {!loading && historicalData.length === 0 && !error && (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                      No historical data found for the selected filters.
                    </td>
                  </tr>
                )}

                {error && historicalData.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-red-300">
                      Historical observations could not be loaded.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.045] px-4 py-3">
          <p className="text-sm text-slate-400">
            Showing {historicalData.length} records
            {recordCount > historicalData.length
              ? ` (API reports ${recordCount} matching records; request limit applies)`
              : ""}
          </p>
          <span className="text-xs text-slate-500">White Volta Basin</span>
        </div>
      </div>
    </div>
  );
}

export default HistoricalData;
