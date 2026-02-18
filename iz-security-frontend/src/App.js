import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";

import Login from "./pages/Login";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Orders from "./pages/Orders";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import MyOrders from "./pages/MyOrders";
import Contact from "./pages/Contact";
import About from "./pages/About";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Terms from "./pages/Terms";
import FAQ from "./pages/FAQ";
import ScrollToTop from "./ScrollToTop";

function App() {

  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true); // ✅ Important

  // Load user from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem("user");

    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    setLoading(false); // ✅ Wait before rendering routes
  }, []);

  // 🔥 Prevent render until user check finishes
  if (loading) {
    return <div style={{ padding: "40px", textAlign: "center" }}>Loading...</div>;
  }

  return (
    <Router>

      <ScrollToTop />   {/* 🔥 ADD THIS LINE */}

      {/* Navbar only when logged in */}
      {user && <Navbar user={user} setUser={setUser} />}

      <Routes>

        {/* ================= PUBLIC ROUTES ================= */}

        {!user && (
          <>
            <Route path="/login" element={<Login setUser={setUser} />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </>
        )}

        {/* Legal pages accessible always */}
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/faq" element={<FAQ />} />

        {/* ================= PROTECTED ROUTES ================= */}

        {user && (
          <>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard user={user} />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/about" element={<About />} />

            <Route
              path="/products"
              element={<Products user={user} cart={cart} setCart={setCart} />}
            />

            {/* Admin only */}
            <Route
              path="/orders"
              element={
                user.role === "admin"
                  ? <Orders user={user} />
                  : <Navigate to="/" />
              }
            />

            {/* Customer only */}
            <Route
              path="/cart"
              element={
                user.role !== "admin"
                  ? <Cart user={user} />
                  : <Navigate to="/" />
              }
            />

            <Route
              path="/checkout"
              element={
                user.role !== "admin"
                  ? <Checkout user={user} />
                  : <Navigate to="/" />
              }
            />

            <Route
              path="/my-orders"
              element={
                user.role !== "admin"
                  ? <MyOrders user={user} />
                  : <Navigate to="/" />
              }
            />

            {/* Fallback for logged user */}
            <Route path="*" element={<Navigate to="/" />} />
          </>
        )}

      </Routes>

      {/* Footer Always Visible */}
      <Footer />

    </Router>
  );
}

export default App;
