import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useState } from "react";

function Navbar({ user, setUser }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("user");
      setUser(null);
      navigate("/login");
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  return (
    <div className="navbar">

      {/* Brand */}
      <div className="nav-left">
        <h2 className="brand-name">IZ Security System</h2>
      </div>

      {/* Right Section */}
      <div className="nav-right">

        {/* Hamburger (Mobile Only) */}
        <div
          className="hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </div>

        {/* Logout Top Right */}
        {user && (
          <button
            className="button logout-btn"
            onClick={handleLogout}
          >
            Logout
          </button>
        )}

        {/* Navigation Links */}
        <div className={`nav-links ${menuOpen ? "open" : ""}`}>
          <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link to="/products" onClick={() => setMenuOpen(false)}>Products</Link>

          {user && user.role === "admin" && (
            <Link to="/orders" onClick={() => setMenuOpen(false)}>All Orders</Link>
          )}

          {user && user.role !== "admin" && (
            <>
              <Link to="/cart" onClick={() => setMenuOpen(false)}>Cart</Link>
              <Link to="/my-orders" onClick={() => setMenuOpen(false)}>My Orders</Link>
              <Link to="/contact" onClick={() => setMenuOpen(false)}>Contact</Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Navbar;
