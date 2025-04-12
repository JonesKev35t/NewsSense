import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
    const [stocks, setStocks] = useState([]);
    const [selectedStock, setSelectedStock] = useState(null);
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [serverStatus, setServerStatus] = useState('checking');

    useEffect(() => {
        checkServerStatus();
        fetchStocks();
    }, []);

    const checkServerStatus = async () => {
        try {
            const response = await axios.get('http://localhost:3001/health');
            setServerStatus(response.data.status);
        } catch (error) {
            setServerStatus('error');
        }
    };

    const fetchStocks = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:3001/api/stocks');
            setStocks(response.data);
        } catch (error) {
            console.error('Error fetching stocks:', error);
        }
        setLoading(false);
    };

    const handleStockSelect = async (stock) => {
        setSelectedStock(stock);
        setLoading(true);
        try {
            const response = await axios.get(`http://localhost:3001/api/news/${stock.ticker}`);
            setNews(response.data);
        } catch (error) {
            console.error('Error fetching news:', error);
        }
        setLoading(false);
    };

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
    };

    const filteredStocks = stocks.filter(stock =>
        (stock?.ticker?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (stock?.name?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    );

    return (
        <div className="app">
            <header className="app-header">
                <h1>NewsSense</h1>
                <p className="server-status">
                    Server Status: <span className={serverStatus}>{serverStatus}</span>
                </p>
            </header>

            <div className="search-container">
                <input
                    type="text"
                    placeholder="Search stocks..."
                    value={searchQuery}
                    onChange={handleSearch}
                    className="search-input"
                />
            </div>

            <div className="main-content">
                <div className="stocks-grid">
                    {loading ? (
                        <div className="loading">Loading...</div>
                    ) : (
                        filteredStocks.map(stock => (
                            <div
                                key={stock.ticker}
                                className={`stock-card ${selectedStock?.ticker === stock.ticker ? 'selected' : ''}`}
                                onClick={() => handleStockSelect(stock)}
                            >
                                <h3>{stock.ticker}</h3>
                                <p className="stock-name">{stock.name}</p>
                                <div className="stock-price">
                                    <span className="price">₹{(stock?.lastPrice || 0).toFixed(2)}</span>
                                    <span className={`change ${(stock?.changePercent || 0) >= 0 ? 'positive' : 'negative'}`}>
                                        {(stock?.changePercent || 0) >= 0 ? '+' : ''}{(stock?.changePercent || 0).toFixed(2)}%
                                    </span>
                                </div>
                                <div className="stock-volume">
                                    Volume: {(stock?.volume || 0).toLocaleString()}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {selectedStock && (
                    <div className="news-section">
                        <h2>News for {selectedStock.ticker}</h2>
                        {loading ? (
                            <div className="loading">Loading news...</div>
                        ) : (
                            <div className="news-grid">
                                {news.map((item, index) => (
                                    <div key={index} className="news-card">
                                        <h3>{item.title}</h3>
                                        <p className="news-source">{item.source} - {item.date}</p>
                                        <p className="news-summary">{item.summary}</p>
                                        <a href={item.link} target="_blank" rel="noopener noreferrer" className="read-more">
                                            Read More
                                        </a>
                                        <div className="news-sentiment">
                                            Sentiment: <span className={item.sentiment.score >= 0 ? 'positive' : 'negative'}>
                                                {item.sentiment.score >= 0 ? 'Positive' : 'Negative'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default App; 