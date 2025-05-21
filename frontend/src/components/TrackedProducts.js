import React from "react";

const trackedProducts = [
  {
    id: 1,
    name: "Apple AirPods Pro",
    url: "https://www.amazon.com/dp/B09JQMJHXY",
    image: "https://m.media-amazon.com/images/I/71bhWgQK-cL._AC_SX679_.jpg",
    currentPrice: 199,
    alert: 180,
    priceHistory: [
      { date: "2025-05-17", price: 210 },
      { date: "2025-05-18", price: 205 },
      { date: "2025-05-19", price: 200 },
      { date: "2025-05-20", price: 199 },
    ],
  },
];

export default function TrackedProducts() {
  const styles = {
    container: {
      padding: "20px",
      fontFamily: "Arial, sans-serif",
    },
    heading: {
      fontSize: "24px",
      marginBottom: "20px",
    },
    card: {
      display: "flex",
      gap: "20px",
      padding: "20px",
      border: "1px solid #ddd",
      borderRadius: "8px",
      backgroundColor: "#fafafa",
      marginBottom: "20px",
    },
    image: {
      width: "150px",
      height: "auto",
      borderRadius: "8px",
    },
    info: {
      flex: 1,
    },
    nameLink: {
      fontSize: "20px",
      color: "#0073e6",
      textDecoration: "none",
    },
    nameLinkHover: {
      textDecoration: "underline",
    },
    price: {
      margin: "8px 0",
    },
    historyList: {
      paddingLeft: "20px",
    },
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>🛒 Tracked Products</h1>
      {trackedProducts.map((product) => (
        <div key={product.id} style={styles.card}>
          <img src={product.image} alt={product.name} style={styles.image} />
          <div style={styles.info}>
            <h2>
              <a
                href={product.url}
                target="_blank"
                rel="noopener noreferrer"
                style={styles.nameLink}
              >
                {product.name}
              </a>
            </h2>
            <p style={styles.price}>Current Price: ${product.currentPrice}</p>
            <p style={styles.price}>Alert Price: ${product.alert}</p>
            <h4>Price History:</h4>
            <ul style={styles.historyList}>
              {product.priceHistory.map((entry, index) => (
                <li key={index}>
                  {entry.date}: ${entry.price}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
}
