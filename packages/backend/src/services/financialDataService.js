const axios = require('axios');
const NodeCache = require('node-cache');
const browserService = require('./browserService');

class FinancialDataService {
    constructor() {
        this.cache = new NodeCache({ stdTTL: 1800 }); // 30 minutes cache
        this.alphaVantageApiKeys = [
            process.env.ALPHA_VANTAGE_API_KEY,
            process.env.ALPHA_VANTAGE_API_KEY_2,
            process.env.ALPHA_VANTAGE_API_KEY_3
        ].filter(key => key && key !== 'your_alpha_vantage_api_key_here');
        
        this.currentApiKeyIndex = 0;
    }

    getNextApiKey() {
        if (this.alphaVantageApiKeys.length === 0) return null;
        const key = this.alphaVantageApiKeys[this.currentApiKeyIndex];
        this.currentApiKeyIndex = (this.currentApiKeyIndex + 1) % this.alphaVantageApiKeys.length;
        return key;
    }

    async getStockData(symbol) {
        const cacheKey = `stock_${symbol}`;
        const cachedData = this.cache.get(cacheKey);
        if (cachedData) return cachedData;

        try {
            // Try Alpha Vantage first
            const apiKey = this.getNextApiKey();
            if (apiKey) {
                const response = await axios.get('https://www.alphavantage.co/query', {
                    params: {
                        function: 'GLOBAL_QUOTE',
                        symbol: symbol,
                        apikey: apiKey
                    }
                });

                if (response.data && response.data['Global Quote']) {
                    const quote = response.data['Global Quote'];
                    const data = {
                        symbol: symbol,
                        price: quote['05. price'],
                        change: quote['09. change'],
                        changePercent: quote['10. change percent'],
                        volume: quote['06. volume'],
                        lastUpdated: new Date().toISOString(),
                        source: 'Alpha Vantage'
                    };
                    this.cache.set(cacheKey, data);
                    return data;
                }
            }

            // Fallback to web scraping
            const data = await this.scrapeStockData(symbol);
            if (data) {
                this.cache.set(cacheKey, data);
                return data;
            }

            return this.getEstimatedData(symbol);
        } catch (error) {
            console.error(`Error fetching stock data for ${symbol}:`, error);
            return this.getEstimatedData(symbol);
        }
    }

    async scrapeStockData(symbol) {
        try {
            // Try Yahoo Finance
            const yahooData = await browserService.scrapeWithRetry(
                `https://finance.yahoo.com/quote/${symbol}`,
                '[data-test="qsp-price"]'
            );

            if (yahooData) {
                return {
                    symbol,
                    price: yahooData,
                    source: 'Yahoo Finance',
                    lastUpdated: new Date().toISOString()
                };
            }

            // Try Moneycontrol
            const moneycontrolData = await browserService.scrapeWithRetry(
                `https://www.moneycontrol.com/india/stockpricequote/${symbol}`,
                '#nsecp'
            );

            if (moneycontrolData) {
                return {
                    symbol,
                    price: moneycontrolData,
                    source: 'Moneycontrol',
                    lastUpdated: new Date().toISOString()
                };
            }

            return null;
        } catch (error) {
            console.error(`Error scraping stock data for ${symbol}:`, error);
            return null;
        }
    }

    getEstimatedData(symbol) {
        return {
            symbol,
            price: "N/A",
            change: "0",
            changePercent: "0%",
            volume: "N/A",
            lastUpdated: new Date().toISOString(),
            source: 'Estimated',
            note: 'Real-time data unavailable'
        };
    }

    async getFundData(isin) {
        const cacheKey = `fund_${isin}`;
        const cachedData = this.cache.get(cacheKey);
        if (cachedData) return cachedData;

        try {
            // Scrape fund data from Moneycontrol
            const data = await browserService.scrapeWithRetry(
                `https://www.moneycontrol.com/mutual-funds/${isin}`,
                '.fund_NAV'
            );

            if (data) {
                const fundData = {
                    isin,
                    nav: data,
                    lastUpdated: new Date().toISOString(),
                    source: 'Moneycontrol'
                };
                this.cache.set(cacheKey, fundData);
                return fundData;
            }

            return this.getEstimatedFundData(isin);
        } catch (error) {
            console.error(`Error fetching fund data for ${isin}:`, error);
            return this.getEstimatedFundData(isin);
        }
    }

    getEstimatedFundData(isin) {
        return {
            isin,
            nav: "N/A",
            lastUpdated: new Date().toISOString(),
            source: 'Estimated',
            note: 'Real-time data unavailable'
        };
    }
}

module.exports = new FinancialDataService(); 