const natural = require('natural');
const tokenizer = new natural.WordTokenizer();

class EntityResolver {
  constructor() {
    this.fundCache = new Map();
    this.companyCache = new Map();
  }

  async initializeFunds(funds) {
    console.log('Initializing entity resolver with funds:', funds.length);
    for (const fund of funds) {
      this.fundCache.set(fund.symbol, {
        symbol: fund.symbol,
        name: fund.name,
        holdings: fund.holdings || [],
        keywords: this._extractKeywords(fund.name)
      });
    }
  }

  async resolveEntities(text) {
    return [];
  }

  // Match news article with relevant funds
  async matchNewsWithFunds(article) {
    const matches = new Set();
    const articleText = `${article.title} ${article.content}`.toLowerCase();
    const articleTokens = new Set(tokenizer.tokenize(articleText));

    // Direct symbol matching
    for (const [symbol, fund] of this.fundCache.entries()) {
      if (articleText.includes(symbol.toLowerCase())) {
        matches.add(symbol);
        continue;
      }

      // Fund name matching
      if (this._hasSignificantOverlap(articleTokens, fund.keywords)) {
        matches.add(symbol);
        continue;
      }

      // Holdings matching
      for (const holding of fund.holdings) {
        if (articleText.includes(holding.toLowerCase())) {
          matches.add(symbol);
          break;
        }
      }
    }

    return Array.from(matches);
  }

  // Calculate similarity between two texts
  _calculateSimilarity(text1, text2) {
    const tokens1 = new Set(tokenizer.tokenize(text1.toLowerCase()));
    const tokens2 = new Set(tokenizer.tokenize(text2.toLowerCase()));
    
    const intersection = new Set([...tokens1].filter(x => tokens2.has(x)));
    const union = new Set([...tokens1, ...tokens2]);
    
    return intersection.size / union.size;
  }

  // Extract meaningful keywords from text
  _extractKeywords(text) {
    const tokens = tokenizer.tokenize(text.toLowerCase());
    const stopwords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to']);
    return new Set(tokens.filter(token => !stopwords.has(token)));
  }

  // Check if two sets of tokens have significant overlap
  _hasSignificantOverlap(set1, set2, threshold = 0.3) {
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    return intersection.size / Math.min(set1.size, set2.size) >= threshold;
  }

  // Update fund data
  async updateFund(fund) {
    this.fundCache.set(fund.symbol, {
      symbol: fund.symbol,
      name: fund.name,
      holdings: fund.holdings || [],
      keywords: this._extractKeywords(fund.name)
    });
  }
}

module.exports = new EntityResolver(); 