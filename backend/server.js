require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const axios = require("axios");
const cheerio = require("cheerio");
const { Pool } = require("pg");
const cron = require("node-cron");

const app = express();
const PORT = 5000;

// PostgreSQL connection pool
const pool = new Pool();

app.use(cors());
app.use(bodyParser.json());

// Track new product
app.post("/track-product", async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ success: false, message: "URL is required." });
  }

  try {
    const response = await axios.get(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });

    const $ = cheerio.load(response.data);
    const title = $("#productTitle").text().trim();

    const priceText =
      $("#priceblock_ourprice").text().trim() ||
      $("#priceblock_dealprice").text().trim() ||
      $("#priceblock_saleprice").text().trim() ||
      $(".a-price .a-offscreen").first().text().trim();

    const price = parseFloat(priceText.replace(/[^0-9.]/g, ""));
    const image = $("#imgTagWrapperId img").attr("src");

    if (!title || !price || isNaN(price)) {
      return res.status(400).json({
        success: false,
        message: "Failed to extract valid product data.",
      });
    }

    const currentDate = new Date().toISOString(); // ✅ full ISO timestamp

    const product = {
      name: title,
      url,
      image: image || "",
      currentPrice: price,
      priceHistory: [
        {
          date: currentDate,
          price,
        },
      ],
    };

    const result = await pool.query(
      `INSERT INTO products (name, url, image, current_price, price_history, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       RETURNING *`,
      [
        product.name,
        product.url,
        product.image,
        product.currentPrice,
        JSON.stringify(product.priceHistory),
      ]
    );

    const insertedProduct = result.rows[0];
    insertedProduct.alert = null;

    res.json({ success: true, product: insertedProduct });
  } catch (err) {
    console.error("Track Error:", err.message);
    res.status(500).json({ success: false, message: "Failed to fetch or store product." });
  }
});

// Get all tracked products
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

// Scheduled price check every 30 minutes
cron.schedule("*/30 * * * *", async () => {
  console.log("🔄 Running scheduled price update...");

  try {
    const result = await pool.query("SELECT * FROM products");
    const products = result.rows;

    for (const product of products) {
      try {
        const response = await axios.get(product.url, {
          headers: { "User-Agent": "Mozilla/5.0" },
        });

        const $ = cheerio.load(response.data);
        const priceText =
          $("#priceblock_ourprice").text().trim() ||
          $("#priceblock_dealprice").text().trim() ||
          $("#priceblock_saleprice").text().trim() ||
          $(".a-price .a-offscreen").first().text().trim();

        const price = parseFloat(priceText.replace(/[^0-9.]/g, ""));
        if (!price || isNaN(price)) continue;

        const currentDate = new Date().toISOString(); // ✅ full timestamp here too
        const newEntry = { date: currentDate, price };

        const updatedHistory = [...product.price_history, newEntry];

        await pool.query(
          `UPDATE products
           SET current_price = $1,
               price_history = $2
           WHERE id = $3`,
          [price, JSON.stringify(updatedHistory), product.id]
        );

        console.log(`✅ Updated: ${product.name}`);
      } catch (err) {
        console.error(`❌ Failed to update ${product.name}:`, err.message);
      }
    }
  } catch (err) {
    console.error("🚨 Failed to run scheduled job:", err.message);
  }
});

app.listen(PORT, () => {
  console.log(`✅ Backend running at http://localhost:${PORT}`);
});
