import React from "react";
import SearchBar from "../components/SearchBar";
import "./Home.css";

const Home = () => {
  return (
    <div className="home-container">
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Understand Market Movements with{" "}
            <span className="highlight">AI-Powered Insights</span>
          </h1>
          <p className="hero-subtitle">
            Get instant analysis of market trends and news events that impact your investments
          </p>
          <SearchBar />
        </div>
        <div className="hero-stats">
          <div className="stat-card">
            <h3>Real-time Analysis</h3>
            <p>Processed 1M+ news articles daily</p>
          </div>
          <div className="stat-card">
            <h3>Market Coverage</h3>
            <p>Tracking 50+ global markets</p>
          </div>
          <div className="stat-card">
            <h3>AI Accuracy</h3>
            <p>90%+ sentiment accuracy</p>
          </div>
        </div>
      </section>

      <section className="features-section">
        <h2>Why Choose NewsSense?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Comprehensive Analysis</h3>
            <p>Get insights from multiple data sources in one place</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Real-time Updates</h3>
            <p>Stay ahead with instant market movement alerts</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔍</div>
            <h3>Deep Insights</h3>
            <p>Understand the why behind market movements</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;