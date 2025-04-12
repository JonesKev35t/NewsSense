const fs = require('fs').promises;
const path = require('path');

class MarketDataProcessor {
    constructor() {
        this.dataPath = path.join(__dirname, '../data');
        this.trainingData = [];
    }

    async loadMarketData() {
        try {
            const mockDataPath = path.join(this.dataPath, 'mock_market_data.json');
            const data = await fs.readFile(mockDataPath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.error('Error loading market data:', error);
            throw error;
        }
    }

    generateHistoricalData(currentData, days = 30) {
        const historicalData = [];
        const baseDate = new Date(currentData.lastUpdated);
        
        for (let i = 0; i < days; i++) {
            const date = new Date(baseDate);
            date.setDate(date.getDate() - i);
            
            // Generate random price variation within ±2% of current price
            const priceVariation = (Math.random() * 0.04 - 0.02);
            const price = parseFloat(currentData.price) * (1 + priceVariation);
            
            // Generate random volume variation within ±20% of current volume
            const volumeVariation = (Math.random() * 0.4 - 0.2);
            const volume = parseInt(currentData.volume) * (1 + volumeVariation);
            
            historicalData.push({
                date: date.toISOString(),
                price: price.toFixed(2),
                volume: Math.round(volume)
            });
        }
        
        return historicalData;
    }

    async processData() {
        try {
            const marketData = await this.loadMarketData();
            const processedData = {};
            
            for (const [symbol, data] of Object.entries(marketData.data)) {
                processedData[symbol] = {
                    ...data,
                    historicalData: this.generateHistoricalData(data)
                };
            }
            
            return processedData;
        } catch (error) {
            console.error('Error processing market data:', error);
            throw error;
        }
    }

    calculateTechnicalIndicators(data) {
        const indicators = {
            sma20: this.calculateSMA(data, 20),
            sma50: this.calculateSMA(data, 50),
            rsi: this.calculateRSI(data, 14),
            macd: this.calculateMACD(data)
        };
        return indicators;
    }

    calculateSMA(data, period) {
        if (data.length < period) return null;
        const prices = data.map(d => parseFloat(d.price));
        const sum = prices.slice(0, period).reduce((a, b) => a + b, 0);
        return (sum / period).toFixed(2);
    }

    calculateRSI(data, period) {
        if (data.length < period + 1) return null;
        const prices = data.map(d => parseFloat(d.price));
        let gains = 0;
        let losses = 0;
        
        for (let i = 1; i < period + 1; i++) {
            const change = prices[i] - prices[i - 1];
            if (change >= 0) gains += change;
            else losses -= change;
        }
        
        const avgGain = gains / period;
        const avgLoss = losses / period;
        const rs = avgGain / avgLoss;
        return 100 - (100 / (1 + rs));
    }

    calculateMACD(data) {
        if (data.length < 26) return null;
        const prices = data.map(d => parseFloat(d.price));
        const ema12 = this.calculateEMA(prices, 12);
        const ema26 = this.calculateEMA(prices, 26);
        const macdLine = ema12 - ema26;
        const signalLine = this.calculateEMA([macdLine], 9);
        return {
            macdLine: macdLine.toFixed(2),
            signalLine: signalLine.toFixed(2),
            histogram: (macdLine - signalLine).toFixed(2)
        };
    }

    calculateEMA(prices, period) {
        const multiplier = 2 / (period + 1);
        let ema = prices[0];
        
        for (let i = 1; i < prices.length; i++) {
            ema = (prices[i] - ema) * multiplier + ema;
        }
        
        return ema;
    }

    async saveProcessedData(data) {
        try {
            const outputPath = path.join(this.dataPath, 'processed_market_data.json');
            await fs.writeFile(outputPath, JSON.stringify(data, null, 2));
            console.log('Processed data saved successfully');
        } catch (error) {
            console.error('Error saving processed data:', error);
            throw error;
        }
    }
}

module.exports = MarketDataProcessor; 