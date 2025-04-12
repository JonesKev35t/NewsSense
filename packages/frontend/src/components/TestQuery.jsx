import React, { useState } from 'react';
import axios from 'axios';

const TestQuery = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault(); // Prevent form submission
    setLoading(true);
    setError(null);
    
    try {
      // First try the news search endpoint
      const response = await axios.get(`http://localhost:3001/api/news/search?q=${encodeURIComponent(query)}`, {
        timeout: 5000,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data && Array.isArray(response.data)) {
        setResults(response.data);
      } else {
        setError('Invalid response format from server');
      }
    } catch (err) {
      console.error('Search error:', err);
      if (err.response) {
        setError(`Server error: ${err.response.status} - ${err.response.data?.error || 'Unknown error'}`);
      } else if (err.request) {
        setError('Could not connect to the server. Please check if the backend is running.');
      } else {
        setError(`Error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="test-query">
      <h2>Test News Search</h2>
      <form onSubmit={handleSearch} className="search-container">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter search term..."
          required
        />
        <button type="submit" disabled={loading || !query.trim()}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>
      
      {error && (
        <div className="error-message">
          <p>{error}</p>
          <p>Please ensure:</p>
          <ul>
            <li>The backend server is running on port 3001</li>
            <li>Your network connection is stable</li>
            <li>You have entered a valid search term</li>
          </ul>
        </div>
      )}
      
      {results.length > 0 && (
        <div className="results">
          <h3>Results:</h3>
          <ul>
            {results.map((item, index) => (
              <li key={index}>
                <h4>{item.title}</h4>
                <p>{item.content?.substring(0, 150)}...</p>
                <small>Source: {item.source}</small>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default TestQuery; 