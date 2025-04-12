const natural = require('natural');
const compromise = require('compromise');
const Sentiment = require('sentiment');

const tokenizer = new natural.WordTokenizer();
const sentiment = new Sentiment();

// Common stock symbols and company names
const STOCK_SYMBOLS = new Set([
    'RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ICICIBANK',
    'HINDUNILVR', 'HDFC', 'SBIN', 'BHARTIARTL', 'KOTAKBANK',
    'BAJFINANCE', 'WIPRO', 'LT', 'ASIANPAINT', 'MARUTI',
    'NESTLEIND', 'TITAN', 'SUNPHARMA', 'AXISBANK', 'ONGC'
]);

const INDICES = new Set([
    'NIFTY', 'SENSEX', 'NIFTYBANK', 'NIFTYIT', 'NIFTYAUTO',
    'NIFTYPHARMA', 'NIFTYFMCG', 'NIFTYMETAL', 'NIFTYREALTY'
]);

function extractEntities(text) {
    const entities = [];
    const doc = compromise(text);
    
    // Extract company names and stock symbols
    const words = tokenizer.tokenize(text);
    for (const word of words) {
        const upperWord = word.toUpperCase();
        if (STOCK_SYMBOLS.has(upperWord)) {
            entities.push({
                type: 'SYMBOL',
                text: upperWord
            });
        } else if (INDICES.has(upperWord)) {
            entities.push({
                type: 'INDEX',
                text: upperWord
            });
        }
    }

    // Extract dates
    const dates = doc.dates().out('array');
    dates.forEach(date => {
        entities.push({
            type: 'DATE',
            text: date
        });
    });

    // Extract numbers and percentages
    const numbers = doc.numbers().out('array');
    numbers.forEach(number => {
        entities.push({
            type: 'NUMBER',
            text: number
        });
    });

    return entities;
}

function analyzeSentiment(text) {
    const result = sentiment.analyze(text);
    return {
        score: result.score,
        comparative: result.comparative,
        tokens: result.tokens,
        words: result.words,
        positive: result.positive,
        negative: result.negative
    };
}

function extractKeywords(text) {
    const tfidf = new natural.TfIdf();
    tfidf.addDocument(text);
    
    const keywords = [];
    tfidf.listTerms(0).forEach(item => {
        if (item.tfidf > 0.1) { // Threshold for keyword importance
            keywords.push({
                term: item.term,
                tfidf: item.tfidf
            });
        }
    });

    return keywords.sort((a, b) => b.tfidf - a.tfidf).slice(0, 10);
}

module.exports = {
    extractEntities,
    analyzeSentiment,
    extractKeywords
}; 