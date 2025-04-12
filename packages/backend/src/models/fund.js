const mongoose = require('mongoose');

const fundSchema = new mongoose.Schema({
  symbol: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  sector: {
    type: String,
    trim: true
  },
  marketCap: {
    type: Number,
    min: 0
  },
  price: {
    type: Number,
    min: 0
  },
  change: {
    type: Number
  },
  changePercent: {
    type: Number
  },
  volume: {
    type: Number,
    min: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  historicalData: [{
    date: Date,
    price: Number,
    volume: Number
  }],
  relatedNews: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'News'
  }]
}, {
  timestamps: true
});

// Index for faster searches
fundSchema.index({ symbol: 1 });
fundSchema.index({ name: 1 });

module.exports = mongoose.model('Fund', fundSchema); 