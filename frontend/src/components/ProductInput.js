import React, { useState } from "react";
import "../App.css";

// Mock function; replace with backend API call later
const fetchProductDetails = async (url) => {
  return {
    id: Date.now(),
    name: "Sample Amazon Product",
    url,
    image: "https://m.media-amazon.com/images/I/71bhWgQK-cL._AC_SX679_.jpg",
    currentPrice: Math.floor(Math.random() * 100) + 100,
    priceHistory: [
      { date: "2025-05-17", price: 200 },
      { date: "2025-05-18", price: 195 },
      { date: "2025-05-19", price: 190 },
      { date: "2025-05-20", price: 185 },
    ],
    alert: null,
  };
};

export default function ProductInput({ onAdd }) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAdd = async (e) => {
    e.preventDefault();
    setLoading(true);
    const product = await fetchProductDetails(url);
    onAdd(product);
    setUrl("");
    setLoading(false);
  };

  return (
    <form onSubmit={handleAdd} className="product-input-form">
      <input
        className="product-input-field"
        type="url"
        placeholder="Paste Amazon product URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        required
      />
      <button
        type="submit"
        className="product-input-btn"
        disabled={loading}
      >
        {loading ? "Adding..." : "Track Product"}
      </button>
    </form>
  );
}
