const NodeCache = require('node-cache');

class CacheService {
    constructor() {
        // Set a smaller TTL and limit the number of items in cache
        this.marketCache = new NodeCache({ 
            stdTTL: 900, // 15 minutes
            maxKeys: 100 // Limit to 100 items
        });
        this.newsCache = new NodeCache({ 
            stdTTL: 1800, // 30 minutes
            maxKeys: 50 // Limit to 50 items
        });
    }

    async initializeCache() {
        console.log('Starting cache initialization...');
        
        try {
            // Clear existing cache
            this.marketCache.flushAll();
            console.log('Cleared existing cache');

            // Cache only essential stocks initially
            const essentialStocks = [
                'RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS', 'INFY.NS',
                '^NSEI', '^NSEBANK', '^CNXIT'
            ];

            for (const symbol of essentialStocks) {
                try {
                    const data = this.getEstimatedData(symbol);
                    this.marketCache.set(symbol, data);
                    console.log(`Cached data for ${symbol}`);
                } catch (error) {
                    console.error(`Failed to cache ${symbol}:`, error);
                }
            }

            console.log('Cache initialization complete');
        } catch (error) {
            console.error('Error during cache initialization:', error);
            throw error;
        }
    }

    getEstimatedData(symbol) {
        // Return a basic data structure without historical data
        return {
            symbol,
            price: Math.random() * 1000 + 1000,
            change: (Math.random() - 0.5) * 10,
            changePercent: (Math.random() - 0.5) * 2,
            volume: Math.floor(Math.random() * 1000000),
            timestamp: new Date().toISOString()
        };
    }

    getMarketData(symbol) {
        return this.marketCache.get(symbol);
    }

    setMarketData(symbol, data) {
        this.marketCache.set(symbol, data);
    }

    getNewsData(query) {
        return this.newsCache.get(query);
    }

    setNewsData(query, data) {
        this.newsCache.set(query, data);
    }
}

module.exports = new CacheService(); 