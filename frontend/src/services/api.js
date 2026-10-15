const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"
).replace(/\/+$/, "");

/**
 * Fetch historical data with optional filters.
 * Backend endpoint still needs to be implemented or verified.
 */
export async function getHistoricalData(params = {}) {
  const searchParams = new URLSearchParams();

  if (params.startDate) {
    searchParams.set("start_date", params.startDate);
  }

  if (params.endDate) {
    searchParams.set("end_date", params.endDate);
  }

  if (params.variable) {
    searchParams.set("variable", params.variable);
  }

  if (params.warningLevel && params.warningLevel !== "All levels") {
    searchParams.set("warning_level", params.warningLevel);
  }

  const query = searchParams.toString();

  const response = await fetch(
    `${API_BASE_URL}/api/historical-data/${query ? `?${query}` : ""}`,
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch historical data (${response.status})`,
    );
  }

  return response.json();
}

/**
 * Fetch forecasts from the FastAPI backend.
 * The backend returns 1-day, 3-day, and 5-day forecasts together.
 */
export async function getForecast(date, horizon) {
  if (!date) {
    throw new Error("A forecast origin date is required.");
  }

  const searchParams = new URLSearchParams({
    as_of_date: date,
  });

  const response = await fetch(
    `${API_BASE_URL}/api/forecast/?${searchParams.toString()}`,
  );

  if (!response.ok) {
    const message = await response.text();
    throw new Error(
      `Failed to fetch forecast (${response.status}): ${message}`,
    );
  }

  const data = await response.json();

  // If a specific horizon was requested, return only that forecast.
  if (horizon !== undefined && horizon !== null && horizon !== "") {
    return {
      ...data,
      forecasts: (data.forecasts || []).filter(
        (item) => item.horizon_days === Number(horizon),
      ),
    };
  }

  return data;
}

/**
 * Fetch flood events from the existing backend router.
 */
export async function getFloodEvents() {
  const response = await fetch(
    `${API_BASE_URL}/api/flood-events/`,
  );

  if (!response.ok) {
    const message = await response.text();
    throw new Error(
      `Failed to fetch flood events (${response.status}): ${message}`,
    );
  }

  return response.json();
}

/**
 * Event difficulty endpoint.
 * This route must exist in the backend before it can work.
 */
export async function getDifficulty(horizon) {
  const response = await fetch(
    `${API_BASE_URL}/api/difficulty/${encodeURIComponent(horizon)}`,
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch event difficulty (${response.status})`,
    );
  }

  return response.json();
}

/**
 * Explainability endpoint.
 * This route must exist in the backend before it can work.
 */
export async function getExplainability(horizon, difficulty) {
  const searchParams = new URLSearchParams({
    difficulty: String(difficulty),
  });

  const response = await fetch(
    `${API_BASE_URL}/api/explainability/${encodeURIComponent(horizon)}?${searchParams.toString()}`,
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch explainability data (${response.status})`,
    );
  }

  return response.json();
}

/**
 * Check whether the backend is running.
 */
export async function getHealth() {
  const response = await fetch(`${API_BASE_URL}/api/health`);

  if (!response.ok) {
    throw new Error(`Backend health check failed (${response.status})`);
  }

  return response.json();
}