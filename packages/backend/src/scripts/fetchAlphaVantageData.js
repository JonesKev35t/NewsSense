const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

const API_KEY = process.env.ALPHA_VANTAGE_API_KEY;
const BASE_URL = 'https://www.alphavantage.co/query';

// List of popular stocks and indices to fetch
const SYMBOLS = [
  // Indian Stocks
  'RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS', 'INFY.NS', 'ICICIBANK.NS',
  'HINDUNILVR.NS', 'HDFC.NS', 'SBIN.NS', 'BHARTIARTL.NS', 'KOTAKBANK.NS',
  'BAJFINANCE.NS', 'WIPRO.NS', 'LT.NS', 'ASIANPAINT.NS', 'MARUTI.NS',
  'NESTLEIND.NS', 'TITAN.NS', 'SUNPHARMA.NS', 'AXISBANK.NS', 'ONGC.NS',
  
  // Indian Indices
  '^NSEI', // Nifty 50
  '^NSEBANK', // Nifty Bank
  '^CNXIT', // Nifty IT
  '^CNXAUTO', // Nifty Auto
  '^CNXPHARMA', // Nifty Pharma
  
  // Global Indices
  '^GSPC', // S&P 500
  '^DJI', // Dow Jones
  '^IXIC', // NASDAQ
  '^FTSE', // FTSE 100
  '^N225', // Nikkei 225
];

async function fetchStockData(symbol) {
  try {
    console.log(`Making request for ${symbol} with API key: ${API_KEY.substring(0, 4)}...`);
    const response = await axios.get(BASE_URL, {
      params: {
        function: 'GLOBAL_QUOTE',
        symbol: symbol,
        apikey: API_KEY
      },
      timeout: 10000
    });

    console.log(`Response for ${symbol}:`, JSON.stringify(response.data, null, 2));

    if (response.data['Global Quote']) {
      return {
        symbol: symbol,
        price: response.data['Global Quote']['05. price'],
        change: response.data['Global Quote']['09. change'],
        changePercent: response.data['Global Quote']['10. change percent'],
        volume: response.data['Global Quote']['06. volume'],
        lastUpdated: new Date().toISOString()
      };
    } else if (response.data['Error Message']) {
      console.error(`API Error for ${symbol}:`, response.data['Error Message']);
      return null;
    } else if (response.data['Note']) {
      console.warn(`Rate limit note for ${symbol}:`, response.data['Note']);
      return null;
    }
    return null;
  } catch (error) {
    console.error(`Error fetching data for ${symbol}:`, error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    return null;
  }
}

async function fetchAllData() {
  const results = {};
  const errors = [];

  for (const symbol of SYMBOLS) {
    try {
      console.log(`Fetching data for ${symbol}...`);
      const data = await fetchStockData(symbol);
      if (data) {
        results[symbol] = data;
      } else {
        errors.push(symbol);
      }
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`Failed to fetch ${symbol}:`, error.message);
      errors.push(symbol);
    }
  }

  return { results, errors };
}

async function saveData(data) {
  const outputDir = path.join(__dirname, '../../data');
  const outputPath = path.join(outputDir, 'alpha_vantage_data.json');

  try {
    // Create directory if it doesn't exist
    await fs.mkdir(outputDir, { recursive: true });
    
    // Save the data
    await fs.writeFile(outputPath, JSON.stringify(data, null, 2));
    console.log(`Data saved to ${outputPath}`);
    
    // Also save a timestamped backup
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(outputDir, `alpha_vantage_data_${timestamp}.json`);
    await fs.writeFile(backupPath, JSON.stringify(data, null, 2));
    console.log(`Backup saved to ${backupPath}`);
  } catch (error) {
    console.error('Error saving data:', error);
  }
}

async function main() {
  if (!API_KEY) {
    console.error('ALPHA_VANTAGE_API_KEY is not set in environment variables');
    process.exit(1);
  }

  console.log('Starting data fetch from Alpha Vantage...');
  console.log('Using API key:', API_KEY.substring(0, 4) + '...');
  
  const { results, errors } = await fetchAllData();

  const output = {
    timestamp: new Date().toISOString(),
    data: results,
    errors: errors,
    metadata: {
      totalSymbols: SYMBOLS.length,
      successfulFetches: Object.keys(results).length,
      failedFetches: errors.length
    }
  };

  await saveData(output);
  console.log('Data fetch completed!');
}

main().catch(console.error); 