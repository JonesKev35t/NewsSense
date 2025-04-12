const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const MarketDataProcessor = require('./marketDataProcessor');
const cacheService = require('./services/cacheService');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/newssense', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Data models
const StockSchema = new mongoose.Schema({
  isin: String,
  ticker: String,
  name: String,
  lastPrice: Number,
  change: Number,
  changePercent: Number,
  volume: Number,
  lastUpdated: Date,
  historicalData: [{
    date: Date,
    price: Number,
    volume: Number
  }],
  technicalIndicators: {
    sma20: Number,
    sma50: Number,
    rsi: Number,
    macd: {
      macdLine: Number,
      signalLine: Number,
      histogram: Number
    }
  }
});

const FundSchema = new mongoose.Schema({
  isin: String,
  symbol: String,
  name: String,
  nav: Number,
  change: Number,
  changePercent: Number,
  lastUpdated: Date,
  historicalData: [{
    date: Date,
    nav: Number
  }]
});

const Stock = mongoose.model('Stock', StockSchema);
const Fund = mongoose.model('Fund', FundSchema);

// Initialize data
async function initializeData() {
  try {
    const processor = new MarketDataProcessor();
    const processedData = await processor.processData();
    
    // Clear existing data
    await Stock.deleteMany({});
    await Fund.deleteMany({});
    
    // Insert processed data
    const stocks = Object.entries(processedData).map(([symbol, data]) => ({
      ticker: symbol,
      name: data.name || symbol,
      lastPrice: parseFloat(data.price),
      change: parseFloat(data.change),
      changePercent: parseFloat(data.changePercent),
      volume: parseInt(data.volume),
      lastUpdated: new Date(data.lastUpdated),
      historicalData: data.historicalData.map(d => ({
        date: new Date(d.date),
        price: parseFloat(d.price),
        volume: parseInt(d.volume)
      })),
      technicalIndicators: processor.calculateTechnicalIndicators(data.historicalData)
    }));
    
    await Stock.insertMany(stocks);
    console.log('Database initialized with processed market data');
  } catch (error) {
    console.error('Error initializing data:', error);
  }
}

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/stocks', async (req, res) => {
  try {
    const stocks = await Stock.find({});
    res.json(stocks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stocks' });
  }
});

app.get('/api/funds', async (req, res) => {
  try {
    const funds = await Fund.find({});
    res.json(funds);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch funds' });
  }
});

app.get('/api/stocks/:symbol', async (req, res) => {
  try {
    const stock = await Stock.findOne({ ticker: req.params.symbol });
    if (!stock) {
      return res.status(404).json({ error: 'Stock not found' });
    }
    res.json(stock);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stock' });
  }
});

app.get('/api/funds/:symbol', async (req, res) => {
  try {
    const fund = await Fund.findOne({ symbol: req.params.symbol });
    if (!fund) {
      return res.status(404).json({ error: 'Fund not found' });
    }
    res.json(fund);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch fund' });
  }
});

// Initialize data and start server
async function startServer() {
  try {
    // Initialize cache with error handling
    try {
      await cacheService.initializeCache();
    } catch (error) {
      console.error('Cache initialization failed, continuing without cache:', error);
    }
    
    // Initialize database with error handling
    try {
      await initializeData();
    } catch (error) {
      console.error('Database initialization failed:', error);
      // Don't exit, try to continue with existing data
    }
    
    // Start server with error handling
    const server = app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });

    // Handle server errors
    server.on('error', (error) => {
      console.error('Server error:', error);
      if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use`);
        process.exit(1);
      }
    });

    // Handle process termination
    process.on('SIGTERM', () => {
      console.log('SIGTERM received. Shutting down gracefully...');
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('Fatal error during startup:', error);
    process.exit(1);
  }
}

startServer(); 