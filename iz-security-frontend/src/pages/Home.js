function Home() {
  return (
    <div className="home-container">

      <div className="hero-section">

        {/* 🔥 Logo Instead of Text */}
        <div className="hero-logo">
          <img src="/logo.png" alt="IZ Security System Logo" />
        </div>

        <p>Advanced CCTV • DVR • Biometric • Surveillance Solutions</p>

        <a href="/products" className="hero-btn">
          Explore Products
        </a>

      </div>

    </div>
  );
}

export default Home;
