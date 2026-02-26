// src/App.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import { PlayerPage } from "./pages/PlayerPage";

export default function App() {
  return (
    <Routes>
      <Route path="/tv/:deviceCode" element={<PlayerPage />} />
      <Route path="*" element={<Navigate to="/tv/device" replace />} />
    </Routes>
  );
}