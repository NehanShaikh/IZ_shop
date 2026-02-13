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

        <p>Advanced CCTV • DVR • Biometric • Surveillance Solutions</p>

        {/* Use Link instead of <a> */}
        <Link to="/products" className="hero-btn">
          Explore Products
        </Link>

      </div>
    </div>
  );
}

export default Home;
