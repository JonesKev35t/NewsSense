const { parentPort, workerData } = require('worker_threads');
const { LRUCache } = require('lru-cache');
const puppeteer = require('puppeteer');

class CacheWorker {
  constructor() {
    this.timeout = workerData.timeout || 30000;
    this.maxBrowserInstances = workerData.maxBrowserInstances || 3;
    this.batchSize = workerData.batchSize || 5;
    
    // Initialize LRU cache
    this.cache = new LRUCache({
      max: 1000,
      ttl: this.timeout
    });
    
    this.browsers = [];
    this.currentBrowserIndex = 0;
    this.isInitialized = false;
  }

  async initialize() {
    try {
      // Initialize browser pool
      for (let i = 0; i < this.maxBrowserInstances; i++) {
        const browser = await puppeteer.launch({
          headless: "new",
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--disable-gpu',
            '--window-size=1920x1080',
            '--disable-features=IsolateOrigins,site-per-process',
            '--disable-site-isolation-trials',
            '--disable-web-security',
            '--disable-features=site-per-process',
            '--disable-features=ChromeWhatsNewUI'
          ],
          ignoreHTTPSErrors: true,
          defaultViewport: {
            width: 1920,
            height: 1080
          },
          timeout: this.timeout
        });
        
        // Test the browser
        try {
          const page = await browser.newPage();
          await page.goto('about:blank');
          await page.close();
          this.browsers.push(browser);
          console.log(`Browser instance ${i + 1} initialized successfully`);
        } catch (error) {
          console.error(`Failed to initialize browser instance ${i + 1}:`, error);
          await browser.close();
          throw error;
        }
      }
      
      console.log(`Initialized ${this.browsers.length} browser instances`);
      this.isInitialized = true;
    } catch (error) {
      console.error('Error initializing browsers:', error);
      await this.cleanup();
      throw error;
    }
  }

  async getNextBrowser() {
    if (!this.isInitialized || this.browsers.length === 0) {
      throw new Error('No browser instances available');
    }
    
    const browser = this.browsers[this.currentBrowserIndex];
    this.currentBrowserIndex = (this.currentBrowserIndex + 1) % this.browsers.length;
    
    // Check if browser is still connected
    if (!browser.isConnected()) {
      console.log('Browser disconnected, reinitializing...');
      await this.cleanup();
      await this.initialize();
      return this.getNextBrowser();
    }
    
    return browser;
  }

  async scrapeData(source, query) {
    if (!this.isInitialized) {
      throw new Error('Worker not initialized');
    }
    
    let browser;
    let page;
    try {
      browser = await this.getNextBrowser();
      page = await browser.newPage();
      
      // Configure page
      await page.setDefaultNavigationTimeout(this.timeout);
      await page.setDefaultTimeout(this.timeout);
      await page.setViewport({ width: 1920, height: 1080 });
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      
      // Set up request interception
      await page.setRequestInterception(true);
      page.on('request', (req) => {
        const resourceType = req.resourceType();
        if (resourceType === 'image' || resourceType === 'font' || resourceType === 'media') {
          req.abort();
        } else {
          req.continue();
        }
      });

      // Handle page errors
      page.on('error', err => console.error('Page error:', err));
      page.on('pageerror', err => console.error('Page error:', err));

      // Navigate to the source
      const url = `${source.url}${source.searchPath}${encodeURIComponent(query)}`;
      await page.goto(url, {
        waitUntil: 'domcontentloaded',
        timeout: this.timeout
      });

      // Extract data based on source
      let data;
      switch (source.name) {
        case 'Moneycontrol':
          data = await this.scrapeMoneycontrol(page);
          break;
        case 'Economic Times':
          data = await this.scrapeEconomicTimes(page);
          break;
        case 'Business Standard':
          data = await this.scrapeBusinessStandard(page);
          break;
        default:
          throw new Error(`Unknown source: ${source.name}`);
      }

      return data;
    } catch (error) {
      console.error(`Error scraping ${source.name}:`, error);
      
      // If browser is disconnected, try to reinitialize
      if (error.message.includes('disconnected') || error.message.includes('Target closed')) {
        console.log('Browser disconnected during scraping, reinitializing...');
        await this.cleanup();
        await this.initialize();
      }
      
      return null;
    } finally {
      if (page) {
        try {
          await page.close();
        } catch (error) {
          console.error('Error closing page:', error);
        }
      }
    }
  }

  async scrapeMoneycontrol(page) {
    try {
      await page.waitForSelector('.tbldata14', { timeout: this.timeout });
      
      return await page.evaluate(() => {
        const results = [];
        const rows = document.querySelectorAll('.tbldata14 tr');
        
        rows.forEach(row => {
          const cells = row.querySelectorAll('td');
          if (cells.length >= 4) {
            results.push({
              name: cells[0].textContent.trim(),
              price: cells[1].textContent.trim(),
              change: cells[2].textContent.trim(),
              volume: cells[3].textContent.trim(),
              source: 'Moneycontrol'
            });
          }
        });
        
        return results;
      });
    } catch (error) {
      console.error('Error scraping Moneycontrol:', error);
      return null;
    }
  }

  async scrapeEconomicTimes(page) {
    try {
      await page.waitForSelector('.stockPrice', { timeout: this.timeout });
      
      return await page.evaluate(() => {
        return {
          name: document.querySelector('.companyName')?.textContent.trim(),
          price: document.querySelector('.stockPrice')?.textContent.trim(),
          change: document.querySelector('.stockChange')?.textContent.trim(),
          volume: document.querySelector('.stockVolume')?.textContent.trim(),
          source: 'Economic Times'
        };
      });
    } catch (error) {
      console.error('Error scraping Economic Times:', error);
      return null;
    }
  }

  async scrapeBusinessStandard(page) {
    try {
      await page.waitForSelector('.stock-price', { timeout: this.timeout });
      
      return await page.evaluate(() => {
        return {
          name: document.querySelector('.company-name')?.textContent.trim(),
          price: document.querySelector('.stock-price')?.textContent.trim(),
          change: document.querySelector('.stock-change')?.textContent.trim(),
          volume: document.querySelector('.stock-volume')?.textContent.trim(),
          source: 'Business Standard'
        };
      });
    } catch (error) {
      console.error('Error scraping Business Standard:', error);
      return null;
    }
  }

  async processTask(task) {
    if (!this.isInitialized) {
      throw new Error('Worker not initialized');
    }
    
    try {
      switch (task.type) {
        case 'scrape':
          return await this.scrapeData(task.data.source, task.data.query);
        case 'get':
          return this.cache.get(task.data.query);
        case 'set':
          this.cache.set(task.data.key, task.data.value);
          return true;
        default:
          throw new Error(`Unknown task type: ${task.type}`);
      }
    } catch (error) {
      console.error('Error processing task:', error);
      throw error;
    }
  }

  async cleanup() {
    try {
      for (const browser of this.browsers) {
        if (browser.isConnected()) {
          await browser.close();
        }
      }
      this.browsers = [];
      this.isInitialized = false;
    } catch (error) {
      console.error('Error cleaning up browsers:', error);
    }
  }
}

// Initialize worker
const worker = new CacheWorker();

// Initialize browsers
worker.initialize().then(() => {
  // Handle messages only after initialization is complete
  parentPort.on('message', async (task) => {
    try {
      const result = await worker.processTask(task);
      parentPort.postMessage({ success: true, result });
    } catch (error) {
      parentPort.postMessage({ success: false, error: error.message });
    }
  });
}).catch(error => {
  console.error('Failed to initialize worker:', error);
  process.exit(1);
});

// Handle cleanup on exit
process.on('exit', () => {
  worker.cleanup().catch(error => {
    console.error('Error during cleanup:', error);
  });
}); 