import React from 'react';
import './NewsCard.css';

const NewsCard = ({ data }) => {
  const { marketData, summary } = data;

  return (
    <div className="news-card">
      {marketData && marketData.length > 0 ? (
        <div className="market-data">
          {marketData.map((item, index) => (
            <div key={index} className="company-info">
              <h3>{item.name} ({item.symbol})</h3>
              {item.overview && (
                <div className="overview">
                  <h4>Company Overview</h4>
                  <p><strong>Sector:</strong> {item.overview.Sector}</p>
                  <p><strong>Industry:</strong> {item.overview.Industry}</p>
                  <p><strong>Market Cap:</strong> {item.overview.MarketCapitalization}</p>
                  <p><strong>PE Ratio:</strong> {item.overview.PERatio}</p>
                </div>
              )}
              {item.news && item.news.length > 0 && (
                <div className="news">
                  <h4>Recent News</h4>
                  {item.news.slice(0, 3).map((newsItem, newsIndex) => (
                    <div key={newsIndex} className="news-item">
                      <h5>{newsItem.title}</h5>
                      <p>{newsItem.summary}</p>
                      <a href={newsItem.url} target="_blank" rel="noopener noreferrer">Read more</a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="no-data">
          <p>No market data found for this search.</p>
        </div>
      )}
      
      {summary && (
        <div className="summary">
          <h3>AI-Generated Summary</h3>
          <div className="summary-content">
            {summary.split('\n').map((line, index) => (
              <p key={index}>{line}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsCard; 