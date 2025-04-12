const puppeteer = require('puppeteer');
const { JSDOM } = require('jsdom');

class NewsScraper {
  constructor() {
    this.sources = [
      {
        name: 'MoneyControl',
        url: 'https://www.moneycontrol.com/news/business/markets/',
        selectors: {
          articles: '.article-list li',
          title: '.article-title',
          content: '.article-desc',
          date: '.article-date'
        }
      },
      {
        name: 'Economic Times Markets',
        url: 'https://economictimes.indiatimes.com/markets/stocks/news',
        selectors: {
          articles: '.article-list article',
          title: '.article-title',
          content: '.article-content',
          date: '.article-date'
        }
      }
    ];
  }

  async initialize() {
    console.log('Initializing news scraper...');
    this.browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox']
    });
  }

  async scrapeNews() {
    try {
      const allNews = [];
      
      for (const source of this.sources) {
        const page = await this.browser.newPage();
        await page.goto(source.url, { waitUntil: 'networkidle0' });
        
        const newsItems = await page.evaluate((selectors) => {
          const articles = document.querySelectorAll(selectors.articles);
          return Array.from(articles).map(article => ({
            title: article.querySelector(selectors.title)?.textContent?.trim(),
            content: article.querySelector(selectors.content)?.textContent?.trim(),
            date: article.querySelector(selectors.date)?.textContent?.trim(),
            url: article.querySelector('a')?.href
          }));
        }, source.selectors);

        allNews.push(...newsItems.map(item => ({
          ...item,
          source: source.name,
          scrapedAt: new Date()
        })));

        await page.close();
      }

      return allNews;
    } catch (error) {
      console.error('Error scraping news:', error);
      throw error;
    }
  }

  async extractEntities(text) {
    // Basic entity extraction for company names and tickers
    const tickerPattern = /\b[A-Z]{2,5}\b/g;
    const tickers = text.match(tickerPattern) || [];
    
    // You can enhance this with a proper NER model
    return {
      tickers,
      timestamp: new Date()
    };
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

module.exports = new NewsScraper(); 