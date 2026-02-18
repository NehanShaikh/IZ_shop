import React from "react";
import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="home-container">
      <div className="hero-section">

        {/* Logo */}
        <div className="hero-logo">
          <img src="/logo.png" alt="IZ Security System Logo" />
        </div>

        <h1>Smart Security Solutions for Modern Spaces</h1>

        <p>
  4G & WiFi CCTV Cameras • Solar & Dual Lens Cameras • DVR/NVR Systems • Biometric & Access Control • Alarm Systems • Hidden Cameras • Professional Surveillance Installation
</p>


        <Link to="/products" className="hero-btn">
          Explore Products
        </Link>

      </div>

      {/* Why Choose Us Section */}
      <div className="home-features">

        <div className="feature-card">
          <h3>🔒 Trusted Security</h3>
          <p>High-quality surveillance systems for homes and businesses.</p>
        </div>

        <div className="feature-card">
          <h3>⚡ Fast Installation</h3>
          <p>Quick and professional setup across Mangalore.</p>
        </div>

        <div className="feature-card">
          <h3>🛠 Reliable Support</h3>
          <p>Dedicated after-sales support and maintenance services.</p>
        </div>

        <div className="feature-card">
          <h3>💰 Affordable Pricing</h3>
          <p>Competitive prices with transparent billing and no hidden charges.</p>
        </div>

      </div>

    </div>
  );
}

export default Home;
