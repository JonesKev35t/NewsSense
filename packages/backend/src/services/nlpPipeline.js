const natural = require('natural');
const { WordTokenizer, SentimentAnalyzer, PorterStemmer } = natural;
const tokenizer = new WordTokenizer();
const analyzer = new SentimentAnalyzer('English', PorterStemmer, 'afinn');

class NLPPipelineService {
  constructor() {
    this.cache = new Map();
  }

  async processArticle(article) {
    const text = `${article.title} ${article.content}`;
    
    // Check cache
    const cacheKey = this._generateCacheKey(text);
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const result = {
      // Clean and preprocess
      cleanText: this._cleanText(text),
      
      // Extract key information
      entities: await this._extractEntities(text),
      keywords: this._extractKeywords(text),
      sentiment: this._analyzeSentiment(text),
      summary: await this._generateSummary(text),
      
      // Metadata
      processedAt: new Date(),
      source: article.source,
      url: article.url
    };

    // Cache results
    this.cache.set(cacheKey, result);
    return result;
  }

  _cleanText(text) {
    return text
      .replace(/[^\w\s]/g, ' ')  // Remove punctuation
      .replace(/\s+/g, ' ')      // Remove extra spaces
      .trim()
      .toLowerCase();
  }

  async _extractEntities(text) {
    const words = tokenizer.tokenize(text);
    const entities = {
      companies: [],
      sectors: [],
      locations: [],
      dates: []
    };

    // Company detection (basic implementation)
    const companyIndicators = ['ltd', 'inc', 'corp', 'limited'];
    let currentCompany = [];
    
    for (let i = 0; i < words.length; i++) {
      const word = words[i].toLowerCase();
      
      // Check for company names
      if (word[0] === word[0].toUpperCase()) {
        currentCompany.push(word);
      } else if (companyIndicators.includes(word) && currentCompany.length > 0) {
        entities.companies.push(currentCompany.join(' ') + ' ' + word);
        currentCompany = [];
      } else {
        currentCompany = [];
      }
    }

    return entities;
  }

  _extractKeywords(text) {
    const words = tokenizer.tokenize(text);
    const stopwords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to']);
    
    // TF-IDF implementation
    const wordFreq = {};
    const keywords = [];

    words.forEach(word => {
      if (!stopwords.has(word.toLowerCase())) {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
      }
    });

    // Sort by frequency and get top keywords
    const sortedWords = Object.entries(wordFreq)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);

    return sortedWords;
  }

  _analyzeSentiment(text) {
    const words = tokenizer.tokenize(text);
    const score = analyzer.getSentiment(words);

    return {
      score,
      label: score > 0 ? 'positive' : score < 0 ? 'negative' : 'neutral',
      confidence: Math.abs(score) / 5  // Normalize to 0-1 range
    };
  }

  async _generateSummary(text) {
    // Basic extractive summarization
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
    const sentenceScores = new Map();

    sentences.forEach(sentence => {
      const words = tokenizer.tokenize(sentence);
      const score = words.length > 10 ? words.length : 0;  // Favor longer sentences
      sentenceScores.set(sentence, score);
    });

    // Get top 3 sentences
    const topSentences = Array.from(sentenceScores.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([sentence]) => sentence);

    return topSentences.join(' ');
  }

  _generateCacheKey(text) {
    return Buffer.from(text).toString('base64').slice(0, 32);
  }
}

module.exports = new NLPPipelineService(); 