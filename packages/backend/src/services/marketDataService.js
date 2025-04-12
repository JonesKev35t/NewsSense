const axios = require('axios');
const NodeCache = require('node-cache');
const { getMockData } = require('./mockDataService');

// Initialize cache with 30 minute TTL
const marketCache = new NodeCache({ stdTTL: 1800 });
const API_KEYS = process.env.ALPHA_VANTAGE_API_KEYS?.split(',') || [];
let currentApiKeyIndex = 0;

async function getMarketData(symbol) {
    // Check cache first
    const cachedData = marketCache.get(symbol);
    if (cachedData) {
        return cachedData;
    }

    // Try Alpha Vantage API if keys are available
    if (API_KEYS.length > 0) {
        try {
            const apiKey = API_KEYS[currentApiKeyIndex];
            const response = await axios.get('https://www.alphavantage.co/query', {
                params: {
                    function: 'GLOBAL_QUOTE',
                    symbol: symbol,
                    apikey: apiKey
                }
            });

            if (response.data['Error Message']) {
                throw new Error(response.data['Error Message']);
            }

            const data = processAlphaVantageData(response.data);
            marketCache.set(symbol, data);
            return data;
        } catch (error) {
            console.error(`Error fetching data for ${symbol} with API key ${currentApiKeyIndex}:`, error.message);
            // Rotate to next API key
            currentApiKeyIndex = (currentApiKeyIndex + 1) % API_KEYS.length;
        }
    }

    // Fallback to mock data
    const mockData = getMockData(symbol);
    marketCache.set(symbol, mockData);
    return mockData;
}

function processAlphaVantageData(data) {
    const quote = data['Global Quote'];
    return {
        symbol: quote['01. symbol'],
        price: parseFloat(quote['05. price']),
        change: parseFloat(quote['09. change']),
        changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
        volume: parseInt(quote['06. volume']),
        lastUpdated: new Date().toISOString()
    };
}

module.exports = {
    getMarketData
}; 