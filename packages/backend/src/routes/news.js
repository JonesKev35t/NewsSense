const express = require('express');
const router = express.Router();
const newsController = require('../controllers/newsController');
const newsService = require('../services/newsService');
const News = require('../models/news');

// Get all news
router.get('/', newsController.getAllNews);

// Search news
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    console.log('Search query received:', q);
    
    if (!q) {
      console.log('No search query provided');
      return res.status(400).json({ error: 'Search query is required' });
    }

    const result = await newsService.searchNews(q);
    res.json(result);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Failed to search news' });
  }
});

// Add POST endpoint for search
router.post('/search', async (req, res) => {
  try {
    const { query } = req.body;
    console.log('Search query received:', query);
    
    if (!query) {
      console.log('No search query provided');
      return res.status(400).json({ error: 'Search query is required' });
    }

    const result = await newsService.searchNews(query);
    res.json(result);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Failed to search news' });
  }
});

// Create news
router.post('/', newsController.createNews);

// Seed sample data
router.post('/seed', async (req, res) => {
  try {
    const sampleNews = [
      {
        title: "Market Rally Continues as Tech Stocks Surge",
        content: "Technology stocks led a broad market rally today as investors cheered strong earnings reports from major tech companies. The NASDAQ composite rose 2.5% while the S&P 500 gained 1.8%.",
        source: "Financial Times",
        url: "https://example.com/market-rally-" + Date.now(),
        publishedAt: new Date(),
        sentiment: "positive",
        confidence: 0.85,
        relatedStocks: ["AAPL", "MSFT", "GOOGL"]
      },
      {
        title: "Federal Reserve Hints at Rate Cuts",
        content: "The Federal Reserve signaled potential interest rate cuts in the coming months, citing slowing economic growth and subdued inflation. Markets reacted positively to the news.",
        source: "Wall Street Journal",
        url: "https://example.com/fed-rates-" + Date.now(),
        publishedAt: new Date(),
        sentiment: "neutral",
        confidence: 0.75,
        relatedStocks: ["JPM", "BAC", "WFC"]
      },
      {
        title: "Oil Prices Fall Amid Global Demand Concerns",
        content: "Crude oil prices dropped sharply today as concerns about global economic growth weighed on demand expectations. Brent crude fell 3.2% to $75 per barrel.",
        source: "Bloomberg",
        url: "https://example.com/oil-prices-" + Date.now(),
        publishedAt: new Date(),
        sentiment: "negative",
        confidence: 0.80,
        relatedStocks: ["XOM", "CVX", "BP"]
      }
    ];

    console.log('Starting database seeding...');
    
    // Clear existing data
    console.log('Clearing existing data...');
    await newsService.deleteAllNews();
    console.log('Existing data cleared successfully');
    
    // Insert sample data
    console.log('Inserting sample data...');
    for (const news of sampleNews) {
      try {
        await newsService.createNews(news);
        console.log(`Created news article: ${news.title}`);
      } catch (err) {
        console.error(`Failed to create news article: ${news.title}`, err);
        throw err;
      }
    }
    
    console.log('Sample data seeded successfully');
    res.json({ message: 'Sample data seeded successfully' });
  } catch (error) {
    console.error('Error seeding data:', error);
    res.status(500).json({ 
      error: 'Failed to seed sample data',
      details: error.message 
    });
  }
});

// Test endpoint to check database contents
router.get('/test', async (req, res) => {
  try {
    const count = await News.countDocuments();
    const allNews = await News.find();
    res.json({
      count,
      sample: allNews
    });
  } catch (error) {
    console.error('Test endpoint error:', error);
    res.status(500).json({ error: 'Failed to check database' });
  }
});

module.exports = router; 