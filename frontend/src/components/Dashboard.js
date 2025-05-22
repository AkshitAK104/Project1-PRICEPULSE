import React, { useEffect, useState } from "react";
import axios from "axios";
import ProductInput from "./ProductInput";
import ProductTable from "./ProductTable";
import PriceHistoryChart from "./PriceHistoryChart";
import "../App.css";

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // ✅ Fetch products from backend initially and every 30 minutes
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get("http://localhost:5000/products");
        if (response.data.success) {
          setProducts(response.data.products);
          if (response.data.products.length > 0) {
            setSelectedProduct(response.data.products[0]);
          }
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
      }
    };

    fetchProducts(); // Initial fetch

    const interval = setInterval(fetchProducts, 30 * 60 * 1000); // every 30 mins
    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  const addProduct = (product) => {
    setProducts([product, ...products]);
    setSelectedProduct(product);
  };

  return (
    <main className="dashboard">
      <div className="dashboard-header">Amazon Price Tracker</div>
      <ProductInput onAdd={addProduct} />

      <div className="summary-cards">
        <div className="summary-card">
          <div className="summary-card-label">Tracked Products</div>
          <div className="summary-card-value">{products?.length || 0}</div>
        </div>
        <div className="summary-card">
          <div className="summary-card-label">Active Alerts</div>
          <div className="summary-card-value">
            {products?.filter((p) => p.alert)?.length || 0}
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-card-label">Minimum Price</div>
          <div className="summary-card-value">
            {selectedProduct?.priceHistory?.length > 0
              ? `$${Math.min(...selectedProduct.priceHistory.map((p) => p.price)).toFixed(2)}`
              : "—"}
          </div>
        </div>
      </div>

      <div className="dashboard-main-content">
        <div className="dashboard-left">
          <div className="chart-container">
            <h2 style={{ marginBottom: "10px" }}>
              {selectedProduct ? selectedProduct.name : "Select a product"}
            </h2>
            {selectedProduct && <PriceHistoryChart product={selectedProduct} />}
          </div>
        </div>

        <div className="dashboard-right">
          <div className="table-container">
            <ProductTable
              products={products}
              onSelect={setSelectedProduct}
              selected={selectedProduct}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
