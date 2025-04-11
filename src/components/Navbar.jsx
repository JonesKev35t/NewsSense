import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className={`navbar ${isScrolled ? "scrolled" : ""}`}>
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">🧠</span>
          <span className="logo-text">NewsSense</span>
        </Link>
        <button
          className="mobile-menu-button"
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? "✕" : "☰"}
        </button>
        <div className={`nav-links ${isMobileMenuOpen ? "active" : ""}`}>
          <Link to="/" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>
            Dashboard
          </Link>
          <Link to="/insights" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>
            Insights
          </Link>
          <Link to="/about" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>
            About
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;