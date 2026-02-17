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

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <div className="navbar">

      {/* Brand */}
      <div className="nav-left">
        <Link to="/" className="brand-link" onClick={closeMenu}>
  <h2 className="brand-name">IZ Security System</h2>
</Link>
      </div>

      {/* Hamburger */}
      <div
        className="hamburger"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        ☰
      </div>

      {/* Overlay */}
      {menuOpen && (
        <div
          className="overlay"
          onClick={closeMenu}
        ></div>
      )}

      {/* Navigation */}
      <div className={`nav-right ${menuOpen ? "active" : ""}`}>

        {/* Main Pages */}
        <Link to="/" onClick={closeMenu}>Home</Link>
        {user && (
        <Link to="/dashboard" onClick={closeMenu}>Dashboard</Link>
        )}

        <Link to="/products" onClick={closeMenu}>Products</Link>
        <Link to="/about" onClick={closeMenu}>About</Link>
        <Link to="/faq" onClick={closeMenu}>FAQ</Link>
        <Link to="/contact" onClick={closeMenu}>Contact</Link>

        {/* Admin */}
        {user && user.role === "admin" && (
          <Link to="/orders" onClick={closeMenu}>All Orders</Link>
        )}

        {/* Customer */}
        {user && user.role !== "admin" && (
          <>
            <Link to="/cart" onClick={closeMenu}>Cart</Link>
            <Link to="/my-orders" onClick={closeMenu}>My Orders</Link>
          </>
        )}

        {/* Auth */}
        {user ? (
          <button
            className="button"
            onClick={() => {
              handleLogout();
              closeMenu();
            }}
          >
            Logout
          </button>
        ) : (
          <Link to="/login" onClick={closeMenu}>
            <button className="button">Login</button>
          </Link>
        )}

      </div>

    </div>
  );
}

export default Navbar;
