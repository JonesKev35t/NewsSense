const mongoose = require('mongoose');
const News = require('./models/news');
const dotenv = require('dotenv');

dotenv.config();

const sampleNews = [
  {
    title: "Nifty 50 Market Analysis",
    content: "The Nifty 50 index showed mixed performance today with banking and IT sectors leading the gains. Market analysts attribute this to global cues and domestic economic factors.",
    source: "Market Analysis",
    url: "https://example.com/nifty-analysis",
    publishedAt: new Date(),
    sentiment: "neutral",
    confidence: 0.85,
    relatedStocks: ["HDFCBANK", "TCS", "INFY"]
  },
  {
    title: "IT Sector Performance Update",
    content: "IT sector stocks showed strong performance with major companies reporting robust quarterly results. TCS and Infosys led the gains with positive outlook.",
    source: "Sector News",
    url: "https://example.com/it-sector",
    publishedAt: new Date(),
    sentiment: "positive",
    confidence: 0.9,
    relatedStocks: ["TCS", "INFY", "WIPRO"]
  },
  {
    title: "Banking Sector News",
    content: "Banking stocks remained in focus with HDFC Bank and ICICI Bank showing strong momentum. Credit growth and improving asset quality are key positives.",
    source: "Financial News",
    url: "https://example.com/banking-news",
    publishedAt: new Date(),
    sentiment: "positive",
    confidence: 0.8,
    relatedStocks: ["HDFCBANK", "ICICIBANK", "SBIN"]
  },
  {
    title: "Market Trends Today",
    content: "Markets showed resilience despite global volatility. Domestic institutional investors remained net buyers while FIIs showed mixed activity.",
    source: "Market Update",
    url: "https://example.com/market-trends",
    publishedAt: new Date(),
    sentiment: "neutral",
    confidence: 0.75,
    relatedStocks: ["RELIANCE", "TATASTEEL", "MARUTI"]
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/newssense', {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000
    });
    console.log('Connected to MongoDB');

    // Clear existing data
    await News.deleteMany({});
    console.log('Cleared existing news data');

    // Insert sample data
    await News.insertMany(sampleNews);
    console.log('Successfully seeded database with sample news');

    // Close the connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seeding
seedDatabase(); 