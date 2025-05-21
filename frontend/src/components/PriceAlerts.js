import React from "react";

export default function PriceAlerts() {
  return (
    <div style={styles.container}>
      <div style={styles.icon}>🔔</div>
      <h2 style={styles.text}>No Price Alerts Yet</h2>
      <p style={styles.subtext}>You’ll see your saved price alerts here.</p>
    </div>
  );
}

const styles = {
  container: {
    textAlign: "center",
    padding: "60px 20px",
    backgroundColor: "#fff",
    borderRadius: "12px",
    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.05)",
    color: "#444",
  },
  icon: {
    fontSize: "3rem",
    marginBottom: "16px",
    color: "#364fc7",
  },
  text: {
    fontSize: "1.5rem",
    marginBottom: "8px",
  },
  subtext: {
    fontSize: "1rem",
    color: "#666",
  },
};
