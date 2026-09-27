import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";

import Dashboard from "./pages/Dashboard";
import HistoricalData from "./pages/HistoricalData";
import Forecast from "./pages/Forecast";
import FloodEvents from "./pages/FloodEvents";
import EventDifficulty from "./pages/EventDifficulty";
import Explainability from "./pages/Explainability";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/historical-data" element={<HistoricalData />} />
          <Route path="/forecast" element={<Forecast />} />
          <Route path="/flood-events" element={<FloodEvents />} />
          <Route path="/event-difficulty" element={<EventDifficulty />} />
          <Route path="/explainability" element={<Explainability />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
