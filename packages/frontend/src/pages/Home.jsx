import React, { useState, useEffect } from 'react';
import { getNews, searchNews } from '../services/api';
import NewsCard from '../components/NewsCard';
import SearchBar from '../components/SearchBar';
import './Home.css';

const Home = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const data = await getNews();
      setNews(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch news. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (keyword) => {
    try {
      setLoading(true);
      const data = await searchNews(keyword);
      setNews(data);
      setError(null);
    } catch (err) {
      setError('Failed to search news. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="home">
      <SearchBar onSearch={handleSearch} />
      <div className="news-grid">
        {news.map((article) => (
          <NewsCard
            key={article._id}
            title={article.title}
            content={article.content}
            source={article.source}
            date={new Date(article.date).toLocaleDateString()}
            sentiment={article.sentiment}
            relatedFunds={article.relatedFunds}
          />
        ))}
      </div>
    </div>
  );
};

export default Home; 