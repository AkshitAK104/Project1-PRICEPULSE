import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import TrackedProducts from "./components/TrackedProducts";
import PriceAlerts from "./components/PriceAlerts";
// import Settings from "./components/Settings";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="app-container">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/tracked-products" element={<TrackedProducts />} />
             <Route path="/price-alerts" element={<PriceAlerts />} />
            {/* <Route path="/settings" element={<Settings />} /> */}
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
