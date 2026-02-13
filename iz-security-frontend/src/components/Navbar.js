import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

function Navbar({ user, setUser }) {

  const navigate = useNavigate();

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

      {/* Right Side - Navigation */}
      <div className="nav-right">

        {/* Always Visible */}
        <Link to="/">Home</Link>
        <Link to="/products">Products</Link>

        {/* 🔥 Admin View */}
        {user && user.role === "admin" && (
          <Link to="/orders">All Orders</Link>
        )}

        {/* 🔥 Customer View */}
        {user && user.role !== "admin" && (
          <>
            <Link to="/cart">Cart</Link>
            <Link to="/my-orders">My Orders</Link>
            <Link to="/contact">Contact Us</Link>
          </>
        )}

        {/* Logout */}
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
