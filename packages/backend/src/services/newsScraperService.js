const puppeteer = require('puppeteer');
const NodeCache = require('node-cache');
const { extractEntities } = require('./nlpService');

// Initialize cache with 1 hour TTL
const newsCache = new NodeCache({ stdTTL: 3600 });

const NEWS_SOURCES = [
    {
        name: 'Economic Times',
        url: 'https://economictimes.indiatimes.com/markets/stocks/news',
        selectors: {
            articles: '.eachStory',
            title: 'h3 a',
            link: 'h3 a',
            date: '.timeStamp',
            summary: '.summery'
        }
    },
    {
        name: 'MoneyControl',
        url: 'https://www.moneycontrol.com/news/business/markets/',
        selectors: {
            articles: '.clearfix',
            title: 'h2 a',
            link: 'h2 a',
            date: '.datetime',
            summary: '.desc'
        }
    }
];

async function scrapeNews() {
    const browser = await puppeteer.launch({ headless: true });
    const newsItems = [];

    try {
        for (const source of NEWS_SOURCES) {
            const page = await browser.newPage();
            await page.goto(source.url, { waitUntil: 'networkidle0' });

            const articles = await page.evaluate((selectors) => {
                return Array.from(document.querySelectorAll(selectors.articles)).map(article => ({
                    title: article.querySelector(selectors.title)?.textContent.trim(),
                    link: article.querySelector(selectors.link)?.href,
                    date: article.querySelector(selectors.date)?.textContent.trim(),
                    summary: article.querySelector(selectors.summary)?.textContent.trim()
                }));
            }, source.selectors);

            for (const article of articles) {
                if (article.title && article.link) {
                    const entities = await extractEntities(article.title + ' ' + article.summary);
                    newsItems.push({
                        ...article,
                        source: source.name,
                        entities,
                        timestamp: new Date().toISOString()
                    });
                }
            }

            await page.close();
        }
    } catch (error) {
        console.error('Error scraping news:', error);
    } finally {
        await browser.close();
    }

    return newsItems;
}

async function getNewsForSymbol(symbol) {
    const cacheKey = `news_${symbol}`;
    const cachedNews = newsCache.get(cacheKey);
    if (cachedNews) {
        return cachedNews;
    }

    const allNews = await scrapeNews();
    const relevantNews = allNews.filter(news => 
        news.entities.some(entity => 
            entity.type === 'SYMBOL' && entity.text === symbol
        )
    );

    newsCache.set(cacheKey, relevantNews);
    return relevantNews;
}

module.exports = {
    scrapeNews,
    getNewsForSymbol
}; 