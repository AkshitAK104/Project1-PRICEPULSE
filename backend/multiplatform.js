const express = require('express');
const axios = require('axios');
const { scrapeAmazonProduct, scrapeFlipkartProduct } = require('./puppeteerScraper');
const router = express.Router();

require('dotenv').config();

// Helper: Use Google Search to find product on Flipkart
async function googleSearch(query) {
  const SERPER_API_KEY = process.env.SERPER_API_KEY;
  const response = await axios.post('https://google.serper.dev/search', {
    q: query
  }, {
    headers: { 'X-API-KEY': SERPER_API_KEY }
  });
  if (response.data.organic && response.data.organic.length > 0) {
    // Prefer direct product links (contain /p/)
    const productLink = response.data.organic.find(link => link.link.includes("/p/"));
    return productLink ? productLink.link : response.data.organic[0].link;
  }
  return null;
}

router.post('/compare', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ success: false, message: "URL is required." });

  try {
    // 1. Use Puppeteer to extract product info from Amazon
    const productData = await scrapeAmazonProduct(url); // { title, brand, price }

    // 2. Search for product on Flipkart using Google Search API (Serper)
    const searchQuery = `${productData.title} site:flipkart.com`;
    const flipkartUrl = await googleSearch(searchQuery);

    // 3. Use Puppeteer to extract product info from Flipkart
    let flipkartResult = { name: productData.title, price: null, url: flipkartUrl };
    if (flipkartUrl) {
      try {
        const flipData = await scrapeFlipkartProduct(flipkartUrl);
        flipkartResult = {
          name: flipData.name || productData.title,
          price: flipData.price,
          url: flipkartUrl
        };
      } catch (e) {
        // If Puppeteer fails, leave price as null
      }
    }

    // 4. Respond with table data
    const results = [
      { platform: "Amazon", name: productData.title, price: productData.price, url },
      { platform: "Flipkart", name: flipkartResult.name, price: flipkartResult.price, url: flipkartResult.url }
    ];
    res.json({ success: true, results });
  } catch (err) {
    console.error("Compare Error:", err.message, err.stack);
    res.status(500).json({ success: false, message: "Failed to compare prices." });
  }
});

module.exports = router;
