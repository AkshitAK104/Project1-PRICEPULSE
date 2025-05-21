import React from "react";
import "../App.css";

export default function ProductTable({ products, onSelect, selected }) {
  return (
    <div>
      <h3 style={{marginBottom:"10px"}}>Tracked Products</h3>
      <ul style={{listStyle: "none", padding: 0, margin: 0}}>
        {products.map((product) => (
          <li
            key={product.id}
            className={`product-table-row${selected && selected.id === product.id ? " selected" : ""}`}
            onClick={() => onSelect(product)}
          >
            <img
              src={product.image}
              alt={product.name}
              className="product-table-img"
            />
            <div className="product-table-info">
              <div className="product-table-name">{product.name}</div>
              <div className="product-table-price">${product.currentPrice}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
