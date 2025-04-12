const NodeCache = require('node-cache');
const Fund = require('../models/fund');

// Initialize cache with 5-minute TTL
const cache = new NodeCache({ stdTTL: 300 });

// Get all funds
exports.getAllFunds = async (req, res) => {
  try {
    const cacheKey = 'all_funds';
    let funds = cache.get(cacheKey);

    if (!funds) {
      funds = await Fund.find().sort({ symbol: 1 });
      cache.set(cacheKey, funds);
    }

    res.json(funds);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch funds' });
  }
};

// Get fund by symbol
exports.getFundBySymbol = async (req, res) => {
  try {
    const { symbol } = req.params;
    const cacheKey = `fund_${symbol}`;
    let fund = cache.get(cacheKey);

    if (!fund) {
      fund = await Fund.findOne({ symbol: symbol.toUpperCase() });
      if (!fund) {
        return res.status(404).json({ error: 'Fund not found' });
      }
      cache.set(cacheKey, fund);
    }

    res.json(fund);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch fund' });
  }
};

// Search funds
exports.searchFunds = async (req, res) => {
  try {
    const { query } = req.params;
    const cacheKey = `search_${query}`;
    let funds = cache.get(cacheKey);

    if (!funds) {
      funds = await Fund.find({
        $or: [
          { symbol: { $regex: query, $options: 'i' } },
          { name: { $regex: query, $options: 'i' } }
        ]
      }).sort({ symbol: 1 });
      cache.set(cacheKey, funds);
    }

    res.json(funds);
  } catch (error) {
    res.status(500).json({ error: 'Failed to search funds' });
  }
};

// Update fund
exports.updateFund = async (req, res) => {
  try {
    const { symbol } = req.params;
    const fund = await Fund.findOneAndUpdate(
      { symbol: symbol.toUpperCase() },
      req.body,
      { new: true }
    );

    if (!fund) {
      return res.status(404).json({ error: 'Fund not found' });
    }

    // Clear relevant caches
    cache.del(`fund_${symbol}`);
    cache.del('all_funds');

    res.json(fund);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update fund' });
  }
}; 