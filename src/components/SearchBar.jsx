import React, { useState, useEffect } from "react";
import "./SearchBar.css";

const SearchBar = () => {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [showTips, setShowTips] = useState(true);

  useEffect(() => {
    if (query.length > 0) {
      setShowTips(false);
    } else {
      setShowTips(true);
    }
  }, [query]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    try {
      // TODO: Implement actual search functionality
      console.log("Searching for:", query);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="search-container">
      <form className="search-form" onSubmit={handleSearch}>
        <div className={`search-input-wrapper ${isFocused ? 'focused' : ''}`}>
          <div className="search-icon">🔍</div>
          <input
            type="text"
            placeholder="Why did Nifty 50 go down?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="search-input"
            disabled={isLoading}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
          {query.length > 0 && (
            <button
              type="button"
              className="clear-button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
          <button 
            type="submit" 
            className={`search-button ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="loading-text">Analyzing...</span>
            ) : (
              <>
                <span className="button-text">Ask</span>
                <span className="button-icon">→</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SearchBar;