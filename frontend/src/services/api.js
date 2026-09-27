const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

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
    `${API_BASE_URL}/historical-data${query ? `?${query}` : ""}`,
  );

  if (!response.ok) {
    throw new Error("Failed to fetch historical data");
  }

  return response.json();
}

export async function getForecast(date, horizon) {
  const searchParams = new URLSearchParams({
    date,
    horizon: String(horizon),
  });

  const response = await fetch(
    `${API_BASE_URL}/forecast?${searchParams.toString()}`,
  );

  if (!response.ok) {
    throw new Error("Failed to fetch forecast");
  }

  return response.json();
}

export async function getFloodEvents() {
  const response = await fetch(`${API_BASE_URL}/events`);

  if (!response.ok) {
    throw new Error("Failed to fetch flood events");
  }

  return response.json();
}

export async function getDifficulty(horizon) {
  const response = await fetch(`${API_BASE_URL}/difficulty/${horizon}`);

  if (!response.ok) {
    throw new Error("Failed to fetch event difficulty");
  }

  return response.json();
}

export async function getExplainability(horizon, difficulty) {
  const searchParams = new URLSearchParams({
    difficulty,
  });

  const response = await fetch(
    `${API_BASE_URL}/explainability/${horizon}?${searchParams.toString()}`,
  );

  if (!response.ok) {
    throw new Error("Failed to fetch explainability data");
  }

  return response.json();
}
