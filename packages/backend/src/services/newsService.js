const axios = require('axios');
const cacheService = require('./cacheService');

class NewsService {
    constructor() {
        this.alphaVantageApiKeys = [
            process.env.ALPHA_VANTAGE_API_KEY_1,
            process.env.ALPHA_VANTAGE_API_KEY_2,
            process.env.ALPHA_VANTAGE_API_KEY_3
        ].filter(key => key);
        this.newsApiKey = process.env.NEWS_API_KEY;
        this.mockData = {
            'RELIANCE.NS': {
                symbol: 'RELIANCE.NS',
                price: 2800.50,
                change: 25.75,
                changePercent: 0.93,
                volume: 1500000,
                timestamp: new Date().toISOString()
            },
            'TCS.NS': {
                symbol: 'TCS.NS',
                price: 3500.25,
                change: -15.50,
                changePercent: -0.44,
                volume: 1200000,
                timestamp: new Date().toISOString()
            },
            'HDFCBANK.NS': {
                symbol: 'HDFCBANK.NS',
                price: 1600.75,
                change: 12.25,
                changePercent: 0.77,
                volume: 2000000,
                timestamp: new Date().toISOString()
            },
            'INFY.NS': {
                symbol: 'INFY.NS',
                price: 1500.50,
                change: -8.75,
                changePercent: -0.58,
                volume: 1800000,
                timestamp: new Date().toISOString()
            },
            '^NSEI': {
                symbol: '^NSEI',
                price: 22000.50,
                change: 150.25,
                changePercent: 0.69,
                volume: 0,
                timestamp: new Date().toISOString()
            },
            '^NSEBANK': {
                symbol: '^NSEBANK',
                price: 45000.75,
                change: 250.50,
                changePercent: 0.56,
                volume: 0,
                timestamp: new Date().toISOString()
            },
            '^CNXIT': {
                symbol: '^CNXIT',
                price: 35000.25,
                change: 175.75,
                changePercent: 0.50,
                volume: 0,
                timestamp: new Date().toISOString()
            }
        };
    }

    async getMarketData(symbol) {
        try {
            // Check cache first
            const cachedData = cacheService.getMarketData(symbol);
            if (cachedData) {
                return cachedData;
            }

            // Try mock data if available
            if (this.mockData[symbol]) {
                const mockData = this.mockData[symbol];
                cacheService.setMarketData(symbol, mockData);
                return mockData;
            }

            // Try Alpha Vantage API
            for (const apiKey of this.alphaVantageApiKeys) {
                try {
                    const response = await axios.get('https://www.alphavantage.co/query', {
                        params: {
                            function: 'GLOBAL_QUOTE',
                            symbol: symbol,
                            apikey: apiKey
                        }
                    });

                    if (response.data && response.data['Global Quote']) {
                        const data = response.data['Global Quote'];
                        const marketData = {
                            symbol: symbol,
                            price: parseFloat(data['05. price']),
                            change: parseFloat(data['09. change']),
                            changePercent: parseFloat(data['10. change percent']),
                            volume: parseInt(data['06. volume']),
                            timestamp: new Date().toISOString()
                        };

                        // Cache the successful result
                        cacheService.setMarketData(symbol, marketData);
                        return marketData;
                    }
                } catch (error) {
                    console.error(`Failed to fetch data from Alpha Vantage with key ${apiKey}:`, error.message);
                    continue;
                }
            }

            // If all API attempts fail, return estimated data
            const estimatedData = cacheService.getEstimatedData(symbol);
            cacheService.setMarketData(symbol, estimatedData);
            return estimatedData;

        } catch (error) {
            console.error('Error in getMarketData:', error);
            return cacheService.getEstimatedData(symbol);
        }
    }

    async searchNews(query) {
        try {
            // Check cache first
            const cachedNews = cacheService.getNewsData(query);
            if (cachedNews) {
                return cachedNews;
            }

            // Try to fetch market data
            const marketData = await this.getMarketData(query);
            
            // If market data is available, return it
            if (marketData) {
                const result = {
                    type: 'market_data',
                    data: marketData
                };
                cacheService.setNewsData(query, result);
                return result;
            }

            // If no market data, return empty result
            return {
                type: 'no_data',
                message: 'No data available for this query'
            };

        } catch (error) {
            console.error('Error in searchNews:', error);
            return {
                type: 'error',
                message: 'An error occurred while processing your request'
            };
        }
    }
}

module.exports = new NewsService(); 