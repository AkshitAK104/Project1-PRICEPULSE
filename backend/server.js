require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const cheerio = require("cheerio");
const { Pool } = require("pg");
const cron = require("node-cron");
const nodemailer = require("nodemailer");

const app = express();
const PORT = 5000;
const pool = new Pool();

// --- Middleware ---
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Email transporter setup ---
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "cakshit131@gmail.com",
    pass: "akchaudhary",
  },
});

// === PRODUCT TRACKING (AMAZON) ===
app.post("/track-product", async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ success: false, message: "URL is required." });

  try {
    const response = await axios.get(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    const $ = cheerio.load(response.data);
    const title = $("#productTitle").text().trim();
    const priceText = $("#priceblock_ourprice").text().trim() ||
                      $("#priceblock_dealprice").text().trim() ||
                      $("#priceblock_saleprice").text().trim() ||
                      $(".a-price .a-offscreen").first().text().trim();
    const price = parseFloat(priceText.replace(/[^0-9.]/g, ""));
    const image = $("#imgTagWrapperId img").attr("src");

    if (!title || !price || isNaN(price)) {
      return res.status(400).json({ success: false, message: "Failed to extract valid product data." });
    }

    const currentDate = new Date().toISOString();
    const result = await pool.query(
      `INSERT INTO products (name, url, image, current_price, price_history, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *`,
      [title, url, image || "", price, JSON.stringify([{ date: currentDate, price }])]
    );

    res.json({ success: true, product: result.rows[0] });
  } catch (err) {
    console.error("Track Error:", err.message);
    res.status(500).json({ success: false, message: "Failed to fetch or store product." });
  }
});

// === GET ALL PRODUCTS ===
app.get("/products", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM products ORDER BY created_at DESC");
    const products = result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      url: row.url,
      image: row.image,
      currentPrice: row.current_price,
      priceHistory: row.price_history,
      alert: null,
    }));
    res.json({ success: true, products });
  } catch (err) {
    console.error("Fetch Error:", err.message);
    res.status(500).json({ success: false, message: "Failed to fetch products." });
  }
});

// === ALERT CREATION ===
app.post("/api/alerts", async (req, res) => {
  const { productId, email, threshold } = req.body;
  if (!productId || !email || !threshold) {
    return res.status(400).json({ success: false, message: "All fields required." });
  }

  try {
    await pool.query(
      `INSERT INTO alerts (product_id, email, threshold, alert_sent, created_at)
       VALUES ($1, $2, $3, false, NOW())`,
      [productId, email, threshold]
    );
    res.json({ success: true, message: "Alert saved." });
  } catch (err) {
    console.error("Alert Error:", err.message);
    res.status(500).json({ success: false, message: "Failed to save alert." });
  }
});

// === CRON JOB: PRICE CHECK & ALERT ===
cron.schedule("*/30 * * * *", async () => {
  console.log("🔄 Running scheduled price update...");

  try {
    const productResult = await pool.query("SELECT * FROM products");
    const alertResult = await pool.query("SELECT * FROM alerts WHERE alert_sent = false");

    const products = productResult.rows;
    const alerts = alertResult.rows;

    for (const product of products) {
      try {
        const response = await axios.get(product.url, { headers: { "User-Agent": "Mozilla/5.0" } });
        const $ = cheerio.load(response.data);
        const priceText = $("#priceblock_ourprice").text().trim() ||
                          $("#priceblock_dealprice").text().trim() ||
                          $("#priceblock_saleprice").text().trim() ||
                          $(".a-price .a-offscreen").first().text().trim();
        const price = parseFloat(priceText.replace(/[^0-9.]/g, ""));
        if (!price || isNaN(price)) continue;

        const currentDate = new Date().toISOString();
        const updatedHistory = [...product.price_history, { date: currentDate, price }];

        await pool.query(
          `UPDATE products SET current_price = $1, price_history = $2 WHERE id = $3`,
          [price, JSON.stringify(updatedHistory), product.id]
        );

        const matchingAlerts = alerts.filter(alert =>
          alert.product_id === product.id && price <= alert.threshold
        );

        for (const alert of matchingAlerts) {
          await transporter.sendMail({
            from: "cakshit131@gmail.com",
            to: alert.email,
            subject: "🔔 Price Drop Alert!",
            text: `The price for your tracked product has dropped to ₹${price}.\n\nCheck it out: ${product.url}`,
          });

          await pool.query(`UPDATE alerts SET alert_sent = true WHERE id = $1`, [alert.id]);
          console.log(`📧 Sent alert to ${alert.email} for ${product.name}`);
        }
      } catch (err) {
        console.error(`❌ Failed to update or alert for ${product.name}:`, err.message);
      }
    }
  } catch (err) {
    console.error("🚨 Cron Job Error:", err.message);
  }
});

// === MULTI-PLATFORM PRICE COMPARISON ROUTE ===
const multiplatformRoutes = require('./multiplatform');
app.use('/api/multiplatform', multiplatformRoutes);

// === START SERVER ===
app.listen(PORT, () => {
  console.log(`✅ Backend running at http://localhost:${PORT}`);
});
