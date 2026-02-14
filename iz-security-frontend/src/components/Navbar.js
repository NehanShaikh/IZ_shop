<div className="navbar">

  <div className="nav-left">
    <h2 className="brand-name">IZ Security System</h2>
  </div>

  <div className="nav-right">

    {/* Mobile Hamburger */}
    <div
      className="mobile-menu-icon"
      onClick={() => setMenuOpen(!menuOpen)}
    >
      ☰
    </div>

    <div className={`nav-links ${menuOpen ? "open" : ""}`}>

      <Link to="/">Home</Link>
      <Link to="/products">Products</Link>

      {user && user.role === "admin" && (
        <Link to="/orders">All Orders</Link>
      )}

      {user && user.role !== "admin" && (
        <>
          <Link to="/cart">Cart</Link>
          <Link to="/my-orders">My Orders</Link>
          <Link to="/contact">Contact Us</Link>
        </>
      )}

    </div>

    {user && (
      <button
        className="button logout-mobile"
        onClick={handleLogout}
      >
        Logout
      </button>
    )}

  </div>
</div>
