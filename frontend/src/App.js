import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import TrackedProducts from "./components/TrackedProducts";
import PriceAlerts from "./components/PriceAlerts";
// import Settings from "./components/Settings";
import "./App.css";

function App() {
  const [products, setProducts] = useState([]);

  // Load saved products from PostgreSQL on first load
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await fetch("http://localhost:5000/products");
        const data = await response.json();
        if (data.success) {
          setProducts(data.products);
        } else {
          console.error("Failed to load products.");
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    loadProducts();
  }, []);

  // Add new product to state
  const handleAddProduct = (product) => {
    setProducts((prev) => [product, ...prev]);
  };

  return (
    <Router>
      <div className="app-container">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route
              path="/"
              element={<Dashboard products={products} onAdd={handleAddProduct} />}
            />
            <Route
              path="/tracked-products"
              element={<TrackedProducts products={products} />}
            />
            <Route
              path="/price-alerts"
              element={<PriceAlerts products={products} />}
            />
            {/* <Route path="/settings" element={<Settings />} /> */}
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
