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

function App() {

  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  return (
    <Router>

      {user && <Navbar user={user} setUser={setUser} />}

      <Routes>

        {/* Public Routes */}
        {!user && (
          <Route path="/login" element={<Login setUser={setUser} />} />
        )}

        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/faq" element={<FAQ />} />

        {/* Protected Routes */}
        {user ? (
          <>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard user={user} />} />
            <Route path="/contact" element={<Contact />} />
            <Route 
              path="/products" 
              element={<Products user={user} cart={cart} setCart={setCart} />} 
            />
            <Route path="/orders" element={<Orders user={user} />} />

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

            <Route path="/about" element={<About />} />

            <Route path="*" element={<Navigate to="/" />} />
          </>
        ) : (
          <Route path="*" element={<Navigate to="/login" />} />
        )}

      </Routes>

      {/* Footer Always Visible */}
      <Footer />

    </Router>
  );
}

export default App;
