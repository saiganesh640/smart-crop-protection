import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Shell } from "./components/ui.jsx";
import { Login, Register } from "./pages/Auth.jsx";
import Dashboard from "./pages/Dashboard.jsx"; import Monitor from "./pages/Monitor.jsx";
import Result from "./pages/Result.jsx"; import PlantDetail from "./pages/PlantDetail.jsx"; import Landing from "./pages/Landing.jsx";
import Alerts from "./pages/Alerts.jsx";
const Guard = ({ children }) => localStorage.getItem("token") ? <Shell>{children}</Shell> : <Navigate to="/login" replace />;
export default function App() {
  return <Routes>
    <Route path="/" element={<Landing />} /><Route path="/login" element={<Login />} /><Route path="/register" element={<Register />} />
    <Route path="/dashboard" element={<Guard><Dashboard /></Guard>} /><Route path="/monitor" element={<Guard><Monitor /></Guard>} />
    <Route path="/result/:id" element={<Guard><Result /></Guard>} /><Route path="/plants/:id" element={<Guard><PlantDetail /></Guard>} />
    <Route path="/alerts" element={<Guard><Alerts /></Guard>} /><Route path="*" element={<Navigate to="/" replace />} />
  </Routes>;
}
