const axios = require('axios');
require('dotenv').config();

const ALPHA_VANTAGE_API_KEY = process.env.ALPHAVANTAGE_API_KEY;
const BASE_URL = 'https://www.alphavantage.co/query';

class AlphaVantageService {
  constructor() {
    if (!ALPHA_VANTAGE_API_KEY) {
      throw new Error('AlphaVantage API key is not configured');
    }
  }

  async getNewsAndSentiment(topics = 'technology,earnings') {
    try {
      const response = await axios.get(BASE_URL, {
        params: {
          function: 'NEWS_SENTIMENT',
          topics,
          apikey: ALPHA_VANTAGE_API_KEY,
        },
      });

      if (response.data && response.data.feed) {
        return response.data.feed.map(article => ({
          title: article.title,
          url: article.url,
          source: article.source,
          publishedAt: new Date(article.time_published),
          content: article.summary,
          sentiment: this._mapSentiment(article.overall_sentiment_score),
          confidence: article.overall_sentiment_score,
          relatedStocks: article.ticker_sentiment
            ? article.ticker_sentiment.map(ticker => ticker.ticker)
            : []
        }));
      }
      return [];
    } catch (error) {
      console.error('Error fetching news from AlphaVantage:', error.message);
      throw error;
    }
  }

  _mapSentiment(score) {
    if (score >= 0.25) return 'positive';
    if (score <= -0.25) return 'negative';
    return 'neutral';
  }

  async getNewsBySymbol(symbol) {
    try {
      const response = await axios.get(BASE_URL, {
        params: {
          function: 'NEWS_SENTIMENT',
          tickers: symbol,
          apikey: ALPHA_VANTAGE_API_KEY,
        },
      });

      if (response.data && response.data.feed) {
        return response.data.feed.map(article => ({
          title: article.title,
          url: article.url,
          source: article.source,
          publishedAt: new Date(article.time_published),
          content: article.summary,
          sentiment: this._mapSentiment(article.overall_sentiment_score),
          confidence: article.overall_sentiment_score,
          relatedStocks: article.ticker_sentiment
            ? article.ticker_sentiment.map(ticker => ticker.ticker)
            : []
        }));
      }
      return [];
    } catch (error) {
      console.error(`Error fetching news for symbol ${symbol}:`, error.message);
      throw error;
    }
  }
}

module.exports = new AlphaVantageService(); 