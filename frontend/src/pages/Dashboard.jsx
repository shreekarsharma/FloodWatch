import { useEffect, useState } from "react";
import {
  getHistoricalData,
  getForecast,
  getFloodEvents,
} from "../services/api";
import DischargeChart from "../charts/DischargeChart";
import RainfallChart from "../charts/RainfallChart";

const glassCard =
  "rounded-xl border border-white/10 bg-white/[0.07] p-5 shadow-[0_8px_32px_rgba(0,0,0,0.25)] backdrop-blur-2xl";

function Dashboard() {
  const [latestValues, setLatestValues] = useState({
    discharge: null,
    rainfall: null,
    soilMoisture: null,
    date: null,
  });
  const [coverageDates, setCoverageDates] = useState({
    discharge: null,
    rainfall: null,
    soilMoisture: null,
  });

  const [loadingValues, setLoadingValues] = useState(true);
  const [forecasts, setForecasts] = useState([]);
  const [loadingForecasts, setLoadingForecasts] = useState(true);
  const [forecastError, setForecastError] = useState("");
  const [floodEvents, setFloodEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [eventsError, setEventsError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadLatestValues() {
      try {
        const [dischargeResponse, rainfallResponse, soilResponse] =
          await Promise.all([
            getHistoricalData({
              variable: "discharge_grdc",
              startDate: "2007-01-01",
              endDate: "2007-02-28",
              limit: 500,
            }),
            getHistoricalData({
              variable: "rainfall_mm",
              limit: 500,
            }),
            getHistoricalData({
              variable: "soil_moisture",
              limit: 500,
            }),
          ]);

        const latestNonNull = (response) =>
          [...(response?.data || [])]
            .reverse()
            .find(
              (row) =>
                row.value !== null &&
                row.value !== undefined &&
                Number.isFinite(Number(row.value)),
            );

        const discharge = latestNonNull(dischargeResponse);
        const rainfall = latestNonNull(rainfallResponse);
        const soilMoisture = latestNonNull(soilResponse);

        if (!cancelled) {
          setLatestValues({
            discharge: discharge
              ? { value: Number(discharge.value), date: discharge.date }
              : null,
            rainfall: rainfall
              ? { value: Number(rainfall.value), date: rainfall.date }
              : null,
            soilMoisture: soilMoisture
              ? { value: Number(soilMoisture.value), date: soilMoisture.date }
              : null,
            date: rainfall?.date || soilMoisture?.date || null,
          });

          setCoverageDates({
            discharge: discharge?.date ?? null,
            rainfall: rainfall?.date ?? null,
            soilMoisture: soilMoisture?.date ?? null,
          });
        }
      } catch (error) {
        console.error("Failed to load dashboard summary values:", error);
      } finally {
        if (!cancelled) {
          setLoadingValues(false);
        }
      }
    }

    loadLatestValues();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadForecasts() {
      setLoadingForecasts(true);
      setForecastError("");

      try {
        const results = await Promise.all([
          getForecast("2007-02-20", 1),
          getForecast("2007-02-20", 3),
          getForecast("2007-02-20", 5),
        ]);

        if (!cancelled) {
          setForecasts(results.flatMap((result) => result.forecasts ?? []));
        }
      } catch (error) {
        console.error("Failed to load forecasts:", error);

        if (!cancelled) {
          setForecastError("Unable to load forecasts from the backend.");
        }
      } finally {
        if (!cancelled) {
          setLoadingForecasts(false);
        }
      }
    }

    loadForecasts();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadFloodEvents() {
      setLoadingEvents(true);
      setEventsError("");

      try {
        const response = await getFloodEvents();

        if (!cancelled) {
          const events = Array.isArray(response)
            ? response
            : (response?.events ?? response?.data ?? []);

          setFloodEvents(events);
        }
      } catch (error) {
        console.error("Failed to load flood events:", error);

        if (!cancelled) {
          setEventsError("Unable to load historical flood events.");
        }
      } finally {
        if (!cancelled) {
          setLoadingEvents(false);
        }
      }
    }

    loadFloodEvents();

    return () => {
      cancelled = true;
    };
  }, []);

  const formatValue = (value, suffix = "") => {
    if (value === null || value === undefined) return "—";

    return `${value.toLocaleString(undefined, {
      maximumFractionDigits: 4,
    })}${suffix}`;
  };

  const discharge = latestValues.discharge?.value;
  const floodThreshold = 1114;

  const warningStatus =
    discharge == null
      ? { label: "UNAVAILABLE", level: "Data unavailable" }
      : discharge >= floodThreshold
        ? { label: "RED", level: "High" }
        : { label: "GREEN", level: "Normal" };

  const summaryCards = [
    {
      label: "Latest Observed Discharge",
      value: formatValue(latestValues.discharge?.value, " m³/s"),
      description: latestValues.discharge
        ? `Observed on ${latestValues.discharge.date}`
        : "Historical observations unavailable",
    },
    {
      label: "Latest Rainfall",
      value: formatValue(latestValues.rainfall?.value, " mm"),
      description: latestValues.rainfall
        ? `Dataset date: ${latestValues.rainfall.date}`
        : "Rainfall data unavailable",
    },
    {
      label: "Soil Moisture",
      value: formatValue(latestValues.soilMoisture?.value),
      description: latestValues.soilMoisture
        ? `Dataset date: ${latestValues.soilMoisture.date}`
        : "Soil moisture data unavailable",
    },
    {
      label: "Data Status",
      value: loadingValues ? "Loading…" : "Historical",
      description: "Not live. Observed discharge data ends on 2007-02-28.",
    },
  ];
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
          <p className="text-sm font-semibold text-white">White Volta Basin</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <div key={card.label} className={glassCard}>
            <p className="text-sm text-slate-400">{card.label}</p>

            <p className="mt-3 text-2xl font-bold text-white">{card.value}</p>

            <p className="mt-1 text-xs text-slate-500">{card.description}</p>
          </div>
        ))}
      </div>
      <div className={glassCard}>
        <h2 className="text-lg font-semibold text-white">Data Coverage</h2>

        <p className="mt-1 text-sm text-slate-400">
          Latest available records in the historical dataset. These dates do not
          represent live observations.
        </p>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            {
              label: "Observed Discharge",
              date: coverageDates.discharge ?? "Unavailable",
              note: "Nawuni gauge",
            },
            {
              label: "Rainfall",
              date: coverageDates.rainfall ?? "Unavailable",
              note: "Latest non-null record",
            },
            {
              label: "Soil Moisture",
              date: coverageDates.soilMoisture ?? "Unavailable",
              note: "Latest non-null record",
            },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-lg border border-white/10 bg-white/[0.04] p-4"
            >
              <p className="text-sm text-slate-400">{item.label}</p>
              <p className="mt-2 text-lg font-semibold text-white">
                {loadingValues ? "Loading…" : item.date}
              </p>
              <p className="mt-1 text-xs text-slate-500">{item.note}</p>
            </div>
          ))}
        </div>
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
              <p
                className={`text-3xl font-bold ${
                  warningStatus.label === "RED"
                    ? "text-red-400"
                    : warningStatus.label === "GREEN"
                      ? "text-emerald-300"
                      : "text-slate-400"
                }`}
              >
                {warningStatus.label}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                {discharge == null
                  ? "Discharge data is unavailable."
                  : `Historical discharge: ${discharge.toFixed(2)} m³/s. Threshold: ${floodThreshold} m³/s.`}
              </p>
            </div>

            <div
              className={`rounded-full border px-4 py-2 text-sm font-semibold ${
                warningStatus.label === "RED"
                  ? "border-red-400/20 bg-red-400/10 text-red-300"
                  : warningStatus.label === "GREEN"
                    ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                    : "border-slate-400/20 bg-slate-400/10 text-slate-300"
              }`}
            >
              {warningStatus.level}
            </div>
          </div>
        </div>
        <div className={glassCard}>
          <h2 className="text-lg font-semibold text-white">
            Forecast Overview
          </h2>

          {loadingForecasts ? (
            <p className="mt-5 text-sm text-slate-400">Loading forecasts...</p>
          ) : forecastError ? (
            <p className="mt-5 text-sm text-red-300">{forecastError}</p>
          ) : forecasts.length === 0 ? (
            <p className="mt-5 text-sm text-slate-400">
              No forecast data available.
            </p>
          ) : (
            <>
              <div className="mt-3 rounded-lg border border-amber-400/20 bg-amber-400/10 p-3">
                <p className="text-sm font-semibold text-amber-200">
                  Historical forecasts — not live alerts
                </p>
                <p className="mt-1 text-xs text-amber-100/80">
                  Model run date: 2007-02-20. These predictions are for
                  historical analysis and must not be used to assess current
                  flood risk.
                </p>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {forecasts.map((forecast, index) => {
                  const horizon = [1, 3, 5][index];
                  const discharge =
                    forecast.predicted_discharge ??
                    forecast.discharge ??
                    forecast.prediction;
                  const warning =
                    forecast.warning_level ??
                    forecast.warning ??
                    forecast.risk_level;

                  return (
                    <div
                      key={horizon}
                      className="rounded-lg border border-white/10 bg-white/[0.04] p-3"
                    >
                      <p className="text-xs text-slate-400">
                        {horizon} {horizon === 1 ? "Day" : "Days"}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Target: {forecast.forecast_date ?? "Unavailable"}
                      </p>

                      <p className="mt-2 text-lg font-bold text-white">
                        {discharge != null && Number.isFinite(Number(discharge))
                          ? `${Number(discharge).toFixed(2)} m³/s`
                          : "Unavailable"}
                      </p>

                      <p
                        className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                          warning?.toLowerCase() === "normal"
                            ? "bg-green-500/15 text-green-300"
                            : warning?.toLowerCase() === "yellow"
                              ? "bg-yellow-500/15 text-yellow-300"
                              : warning?.toLowerCase() === "orange"
                                ? "bg-orange-500/15 text-orange-300"
                                : warning?.toLowerCase() === "red"
                                  ? "bg-red-500/15 text-red-300"
                                  : "bg-slate-500/15 text-slate-300"
                        }`}
                      >
                        {warning ?? "Warning unavailable"}
                      </p>
                    </div>
                  );
                })}
              </div>
            </>
          )}
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
                <th className="px-3 py-3 font-medium">Duration</th>
                <th className="px-3 py-3 font-medium">Peak</th>
              </tr>
            </thead>
            <tbody>
              {loadingEvents ? (
                <tr>
                  <td colSpan={4} className="px-3 py-4 text-slate-400">
                    Loading flood events...
                  </td>
                </tr>
              ) : eventsError ? (
                <tr>
                  <td colSpan={4} className="px-3 py-4 text-red-300">
                    {eventsError}
                  </td>
                </tr>
              ) : floodEvents.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-3 py-4 text-slate-400">
                    No historical flood events available.
                  </td>
                </tr>
              ) : (
                floodEvents.slice(0, 10).map((event, index) => (
                  <tr
                    key={event.id ?? event.episode_id ?? index}
                    className="border-b border-white/[0.06]"
                  >
                    <td className="px-3 py-3 text-slate-300">
                      {event.episode_id ?? event.id ?? `Event ${index + 1}`}
                    </td>
                    <td className="px-3 py-3 text-slate-400">
                      {event.start_date ?? "—"}
                    </td>
                    <td className="px-3 py-3 text-slate-400">
                      {event.end_date ?? "—"}
                    </td>
                    <td className="px-3 py-3 text-slate-400">
                      {event.duration_days != null
                        ? `${event.duration_days} days`
                        : "—"}
                    </td>
                    <td className="px-3 py-3 text-slate-400">
                      {event.peak_discharge != null
                        ? `${Number(event.peak_discharge).toFixed(2)} m³/s`
                        : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
