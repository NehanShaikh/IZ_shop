import { useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup
} from "firebase/auth";
import { auth, provider } from "../firebase";
import { useNavigate } from "react-router-dom";

function Login({ setUser }) {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // ---------------- LOGIN ----------------
  const handleLogin = async () => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      await saveUserToBackend(result.user);
      navigate("/");
    } catch (error) {
      alert("Invalid Email or Password");
    }
  };

  // ---------------- SIGNUP ----------------
  const handleSignup = async () => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await saveUserToBackend(result.user, true); // true = signup
      navigate("/");
    } catch (error) {
      alert("Signup failed");
    }
  };

  // ---------------- GOOGLE LOGIN ----------------
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      await saveUserToBackend(result.user);
      navigate("/");
    } catch (error) {
      alert("Google login failed");
    }
  };

  // ---------------- COMMON FUNCTION ----------------
  const saveUserToBackend = async (firebaseUser, isSignup = false) => {

    const response = await fetch("https://iz-shop.onrender.com/save-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: firebaseUser.displayName || "User",
        email: firebaseUser.email,
        isSignup
      })
    });

    const userData = await response.json();
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  return (
    <div className="login-card">

      <h2>Account Access</h2>

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

      <button onClick={handleLogin}>Login</button>
      <button onClick={handleSignup}>Signup</button>

      <hr />

      <button onClick={handleGoogleLogin}>
        Login with Google
      </button>

    </div>
  );
}

export default Login;
