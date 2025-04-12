const express = require('express');
const router = express.Router();
const fundController = require('../controllers/fundController');

// Get all funds
router.get('/', fundController.getAllFunds);

// Get fund by symbol
router.get('/:symbol', fundController.getFundBySymbol);

// Search funds
router.get('/search/:query', fundController.searchFunds);

// Update fund
router.put('/:symbol', fundController.updateFund);

module.exports = router; 