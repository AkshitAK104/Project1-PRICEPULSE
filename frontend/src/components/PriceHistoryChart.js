import React from "react";
import "../App.css";

export default function PriceHistoryChart({ product }) {
  if (!product) return <div>No product selected.</div>;

  const data = product.priceHistory || [];
  if (data.length === 0) return <div>No price history.</div>;

  const prices = data.map(p => p.price);
  const maxPrice = Math.max(...prices, 200);
  const minPrice = Math.min(...prices, 0);
  const chartHeight = 160;
  const yScale = (price) =>
    200 - ((price - minPrice) / (maxPrice - minPrice || 1)) * chartHeight;

  const chartWidth = 50 + data.length * 80; // Dynamic width based on data points

  return (
    <div style={{ width: "100%", overflowX: "auto", minHeight: "260px" }}>
      <svg width={chartWidth} height="230">
        {/* Axes */}
        <line x1="50" y1="200" x2={chartWidth - 10} y2="200" stroke="#ccc" strokeWidth="2" />
        <line x1="50" y1="200" x2="50" y2="40" stroke="#ccc" strokeWidth="2" />

        {/* Price Line */}
        {data.length > 1 &&
          data.map((point, idx) => {
            if (idx === 0) return null;
            const prev = data[idx - 1];
            const x1 = 50 + (idx - 1) * 80;
            const y1 = yScale(prev.price);
            const x2 = 50 + idx * 80;
            const y2 = yScale(point.price);
            return (
              <line
                key={`line-${idx}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#6c2bd7"
                strokeWidth="3"
              />
            );
          })}

        {/* Data Points & Labels */}
        {data.map((point, idx) => {
          const x = 50 + idx * 80;
          const y = yScale(point.price);

          const formattedDate = new Date(point.date).toLocaleString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            day: "2-digit",
            month: "2-digit",
            hour12: false,
          }); // e.g., "22/05, 17:45"

          return (
            <g key={`point-${idx}`}>
              <circle
                cx={x}
                cy={y}
                r="6"
                fill="#6c2bd7"
                stroke="#fff"
                strokeWidth="2"
              />
              <text
                x={x}
                y={y - 12}
                fontSize="12"
                textAnchor="middle"
                fill="#333"
              >
                ₹{point.price}
              </text>
              <text
                x={x}
                y={215}
                fontSize="11"
                textAnchor="middle"
                fill="#888"
              >
                {formattedDate}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
