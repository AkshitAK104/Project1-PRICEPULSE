import React from "react";
import "../App.css";

export default function PriceHistoryChart({ product }) {
  if (!product) return <div>No product selected.</div>;
  const data = product.priceHistory || [];

  return (
    <div style={{width: "100%", minHeight: "260px"}}>
      <svg width="100%" height="220">
        {/* Axes */}
        <line x1="50" y1="200" x2="400" y2="200" stroke="#ccc" strokeWidth="2"/>
        <line x1="50" y1="200" x2="50" y2="40" stroke="#ccc" strokeWidth="2"/>
        {/* Price Line */}
        {data.length > 1 &&
          data.map((point, idx) => {
            if (idx === 0) return null;
            const prev = data[idx - 1];
            const x1 = 50 + ((idx - 1) * 80);
            const y1 = 200 - ((prev.price - 150) * 2);
            const x2 = 50 + (idx * 80);
            const y2 = 200 - ((point.price - 150) * 2);
            return (
              <line
                key={idx}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#6c2bd7"
                strokeWidth="3"
              />
            );
          })}
        {/* Data Points */}
        {data.map((point, idx) => {
          const x = 50 + (idx * 80);
          const y = 200 - ((point.price - 150) * 2);
          return (
            <circle
              key={idx}
              cx={x}
              cy={y}
              r="6"
              fill="#6c2bd7"
              stroke="#fff"
              strokeWidth="2"
            />
          );
        })}
        {/* Labels */}
        {data.map((point, idx) => {
          const x = 50 + (idx * 80);
          const y = 200 - ((point.price - 150) * 2);
          return (
            <text
              key={idx}
              x={x}
              y={y - 12}
              fontSize="12"
              textAnchor="middle"
              fill="#333"
            >
              ${point.price}
            </text>
          );
        })}
        {/* Date Labels */}
        {data.map((point, idx) => {
          const x = 50 + (idx * 80);
          return (
            <text
              key={idx}
              x={x}
              y={215}
              fontSize="11"
              textAnchor="middle"
              fill="#888"
            >
              {point.date.slice(5)}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
