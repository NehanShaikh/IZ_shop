import { useState } from "react";
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from "firebase/auth";
import { auth, provider } from "../firebase";
import { useNavigate } from "react-router-dom";

function Login({ setUser }) {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // ---------------- SAVE USER TO BACKEND ----------------
  const saveUser = async (firebaseUser) => {
    const response = await fetch("https://iz-shop.onrender.com/save-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: firebaseUser.displayName || "User",
        email: firebaseUser.email
      })
    });

    const userData = await response.json();
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  // ---------------- EMAIL LOGIN ----------------
  const handleLogin = async () => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      await saveUser(result.user);
      navigate("/");
    } catch (error) {
      alert("Invalid Email or Password");
    }
  };

  // ---------------- EMAIL SIGNUP ----------------
  const handleSignup = async () => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await saveUser(result.user);
      navigate("/");
    } catch (error) {
      alert("Signup failed");
    }
  };

  // ---------------- GOOGLE LOGIN ----------------
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      await saveUser(result.user);
      navigate("/");
    } catch (error) {
      alert("Google login failed");
    }
  };

  return (
    <div className="login-page">

      <div className="login-header">
        <h1>IZ Security System</h1>

        {/* KEEPING YOUR LOGO SECTION */}
        <div className="login-logo">
          <img src="/logo.png" alt="Logo" />
        </div>
      </div>

      <div className="login-center">
        <div className="login-card">
          <h2>Account Access</h2>
          <p>Secure access to your account</p>

          <input
            type="email"
            placeholder="Enter Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="login-btn" onClick={handleLogin}>
            Login
          </button>

          <button className="signup-btn" onClick={handleSignup}>
            Signup
          </button>

          <div className="divider">OR</div>

          <button className="google-btn" onClick={handleGoogleLogin}>
            Login with Google
          </button>

        </div>
      </div>

    </div>
  );
}

export default Login;
