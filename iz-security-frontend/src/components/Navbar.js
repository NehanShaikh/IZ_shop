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

    {/* Left Side - Brand */}
    <div className="nav-left">
      <h2 className="brand-name">IZ Security System</h2>
    </div>

    {/* Hamburger Icon (Mobile Only) */}
    <div 
      className="hamburger"
      onClick={() => setMenuOpen(!menuOpen)}
    >
      ☰
    </div>

    {/* 🔥 Overlay goes HERE */}
    {menuOpen && (
      <div 
        className="overlay" 
        onClick={() => setMenuOpen(false)}
      ></div>
    )}

    {/* Right Side - Navigation */}
    <div className={`nav-right ${menuOpen ? "active" : ""}`}>

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

      {user && (
        <button
          className="button"
          style={{ marginLeft: "20px" }}
          onClick={handleLogout}
        >
          Logout
        </button>
      )}

    </div>

  </div>
);
}

export default Navbar;
