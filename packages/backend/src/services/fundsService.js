const Fund = require('../models/Fund');

const fundsService = {
  async getAllFunds() {
    try {
      return await Fund.find().sort({ symbol: 1 });
    } catch (error) {
      throw new Error('Failed to fetch funds');
    }
  },

  async getFundBySymbol(symbol) {
    try {
      const fund = await Fund.findOne({ symbol: symbol.toUpperCase() });
      if (!fund) {
        throw new Error('Fund not found');
      }
      return fund;
    } catch (error) {
      throw new Error('Failed to fetch fund');
    }
  },

  async searchFunds(query) {
    try {
      return await Fund.find({
        $or: [
          { symbol: { $regex: query, $options: 'i' } },
          { name: { $regex: query, $options: 'i' } }
        ]
      }).sort({ symbol: 1 });
    } catch (error) {
      throw new Error('Failed to search funds');
    }
  },

  async createFund(fundData) {
    try {
      const fund = new Fund(fundData);
      return await fund.save();
    } catch (error) {
      throw new Error('Failed to create fund');
    }
  },

  async updateFund(symbol, fundData) {
    try {
      const fund = await Fund.findOneAndUpdate(
        { symbol: symbol.toUpperCase() },
        fundData,
        { new: true }
      );
      if (!fund) {
        throw new Error('Fund not found');
      }
      return fund;
    } catch (error) {
      throw new Error('Failed to update fund');
    }
  },

  async deleteFund(symbol) {
    try {
      const fund = await Fund.findOneAndDelete({ symbol: symbol.toUpperCase() });
      if (!fund) {
        throw new Error('Fund not found');
      }
      return fund;
    } catch (error) {
      throw new Error('Failed to delete fund');
    }
  }
};

module.exports = fundsService; 