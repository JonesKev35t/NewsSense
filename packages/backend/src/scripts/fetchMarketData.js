const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

const API_KEYS = [
    process.env.ALPHA_VANTAGE_API_KEY,
    process.env.ALPHA_VANTAGE_API_KEY_2,
    process.env.ALPHA_VANTAGE_API_KEY_3
].filter(key => key);

const STOCKS = [
    'RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS', 'INFY.NS', 'ICICIBANK.NS',
    'HINDUNILVR.NS', 'HDFC.NS', 'SBIN.NS', 'BHARTIARTL.NS', 'KOTAKBANK.NS',
    'BAJFINANCE.NS', 'WIPRO.NS', 'LT.NS', 'ASIANPAINT.NS', 'MARUTI.NS',
    'NESTLEIND.NS', 'TITAN.NS', 'SUNPHARMA.NS', 'AXISBANK.NS', 'ONGC.NS'
];

const INDICES = [
    '^NSEI', // Nifty 50
    '^NSEBANK', // Nifty Bank
    '^CNXIT', // Nifty IT
    '^CNXAUTO', // Nifty Auto
    '^CNXPHARMA' // Nifty Pharma
];

const DATA_DIR = path.join(__dirname, '../../data/raw');

async function ensureDirectoryExists(dir) {
    try {
        await fs.access(dir);
    } catch {
        await fs.mkdir(dir, { recursive: true });
    }
}

async function fetchStockData(symbol, apiKey) {
    try {
        const response = await axios.get('https://www.alphavantage.co/query', {
            params: {
                function: 'TIME_SERIES_DAILY',
                symbol: symbol,
                apikey: apiKey,
                outputsize: 'full'
            }
        });

        if (response.data['Error Message']) {
            throw new Error(response.data['Error Message']);
        }

        return response.data;
    } catch (error) {
        console.error(`Error fetching data for ${symbol}:`, error.message);
        return null;
    }
}

async function saveData(symbol, data) {
    if (!data) return;
    
    const filePath = path.join(DATA_DIR, `${symbol}.json`);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    console.log(`Saved data for ${symbol} to ${filePath}`);
}

async function processStocks() {
    await ensureDirectoryExists(DATA_DIR);
    
    let currentApiKeyIndex = 0;
    const processedSymbols = new Set();

    for (const symbol of [...STOCKS, ...INDICES]) {
        if (processedSymbols.has(symbol)) continue;

        const apiKey = API_KEYS[currentApiKeyIndex];
        if (!apiKey) {
            console.error('No valid API keys available');
            break;
        }

        console.log(`Fetching data for ${symbol} using API key ${currentApiKeyIndex + 1}`);
        const data = await fetchStockData(symbol, apiKey);
        
        if (data) {
            await saveData(symbol, data);
            processedSymbols.add(symbol);
        }

        // Rotate API keys
        currentApiKeyIndex = (currentApiKeyIndex + 1) % API_KEYS.length;
        
        // Add delay to respect API rate limits
        await new Promise(resolve => setTimeout(resolve, 15000));
    }
}

// Run the script
processStocks().catch(console.error); 