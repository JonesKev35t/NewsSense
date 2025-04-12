import React, { useState } from 'react';
import SearchBar from './components/SearchBar';
import NewsCard from './components/NewsCard';
import './App.css';

function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (query) => {
    console.log('Searching for:', query);
    setLoading(true);
    setError(null);
    setData(null);
    
    try {
      const url = `http://localhost:3001/api/news/search?q=${encodeURIComponent(query)}`;
      console.log('Fetching from:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Response status:', response.status);
      const responseText = await response.text();
      console.log('Raw response:', responseText);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = JSON.parse(responseText);
      console.log('Parsed data:', result);
      
      if (result.marketData.length === 0) {
        setError(result.summary || "No results found. Please try a different search term.");
      } else {
        setData(result);
      }
    } catch (err) {
      console.error('Search error:', err);
      setError(`Error: ${err.message}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>NewsSense</h1>
        <p>AI-powered market insights</p>
      </header>
      <main>
        <SearchBar onSearch={handleSearch} />
        {loading && (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Searching for market data...</p>
          </div>
        )}
        {error && <div className="error">{error}</div>}
        {data && <NewsCard data={data} />}
      </main>
    </div>
  );
}

export default App; 