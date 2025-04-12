const newsService = require('../services/newsService');
const cacheService = require('../services/cacheService');

async function initializeCache() {
  console.log('Starting cache initialization...');
  
  try {
    // Clear existing cache
    await cacheService.clear();
    console.log('Cleared existing cache');
    
    // Initialize cache with popular stocks
    console.log('Caching popular stocks...');
    const stockPromises = newsService.popularStocks.map(async (symbol) => {
      try {
        const data = await newsService.scrapeMarketData(symbol);
        if (data && data.length > 0) {
          await cacheService.set(`stock_${symbol}`, data, 'market');
          console.log(`Cached data for stock: ${symbol}`);
        }
      } catch (error) {
        console.error(`Error caching stock ${symbol}:`, error.message);
      }
    });
    
    // Initialize cache with popular indices
    console.log('Caching popular indices...');
    const indexPromises = newsService.popularIndices.map(async (symbol) => {
      try {
        const data = await newsService.scrapeMarketData(symbol);
        if (data && data.length > 0) {
          await cacheService.set(`index_${symbol}`, data, 'market');
          console.log(`Cached data for index: ${symbol}`);
        }
      } catch (error) {
        console.error(`Error caching index ${symbol}:`, error.message);
      }
    });
    
    // Wait for all caching operations to complete
    await Promise.all([...stockPromises, ...indexPromises]);
    
    // Get cache statistics
    const stats = await cacheService.getStats();
    console.log('Cache initialization complete. Statistics:', stats);
    
  } catch (error) {
    console.error('Error during cache initialization:', error);
  }
}

// Run the initialization
initializeCache().then(() => {
  console.log('Cache initialization process completed');
  process.exit(0);
}).catch(error => {
  console.error('Cache initialization failed:', error);
  process.exit(1);
}); 