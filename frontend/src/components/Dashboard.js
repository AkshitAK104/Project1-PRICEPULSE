import React, { useState } from "react";
import ProductInput from "./ProductInput";
import ProductTable from "./ProductTable";
import PriceHistoryChart from "./PriceHistoryChart";
import "../App.css";

// Mock product data
const initialProducts = [
  {
    id: 1,
    name: "Apple AirPods Pro",
    url: "https://www.amazon.com/dp/B09JQMJHXY",
    image: "https://m.media-amazon.com/images/I/71bhWgQK-cL._AC_SX679_.jpg",
    currentPrice: 199,
    priceHistory: [
      { date: "2025-05-17", price: 210 },
      { date: "2025-05-18", price: 205 },
      { date: "2025-05-19", price: 200 },
      { date: "2025-05-20", price: 199 },
    ],
    alert: 180,
  },
];

export default function Dashboard() {
  const [products, setProducts] = useState(initialProducts);
  const [selectedProduct, setSelectedProduct] = useState(products[0]);

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
          <div className="summary-card-value">{products.length}</div>
        </div>
        <div className="summary-card">
          <div className="summary-card-label">Active Alerts</div>
          <div className="summary-card-value">
            {products.filter((p) => p.alert).length}
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-card-label">Last Price Drop</div>
          <div className="summary-card-value">
            {
              selectedProduct &&
              selectedProduct.priceHistory.length > 1 &&
              selectedProduct.priceHistory[selectedProduct.priceHistory.length-2].price > selectedProduct.priceHistory[selectedProduct.priceHistory.length-1].price
                ? `$${selectedProduct.priceHistory[selectedProduct.priceHistory.length-2].price - selectedProduct.priceHistory[selectedProduct.priceHistory.length-1].price}`
                : "—"
            }
          </div>
        </div>
      </div>
      <div className="dashboard-main-content">
        <div className="dashboard-left">
          <div className="chart-container">
            <h2 style={{marginBottom:"10px"}}>
              {selectedProduct ? selectedProduct.name : "Select a product"}
            </h2>
            <PriceHistoryChart product={selectedProduct} />
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
