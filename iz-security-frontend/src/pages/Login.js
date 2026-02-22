import ClipLoader from "react-spinners/ClipLoader";
import { useState } from "react";
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile
} from "firebase/auth";
import { auth, provider } from "../firebase";
import { useNavigate } from "react-router-dom";

function Login({ setUser }) {
  const navigate = useNavigate();

  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const saveUser = async (firebaseUser, customName = null) => {
    const response = await fetch("https://iz-shop.onrender.com/save-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: customName || firebaseUser.displayName || "User",
        email: firebaseUser.email
      })
    });

    const userData = await response.json();
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const handleSubmit = async () => {
    if (!email || !password) {
      alert("Please fill all fields");
      return;
    }

    try {
      setLoading(true); // 🔥 Start loading
      if (isSignup) {
        if (!name) {
          alert("Please enter your name");
          setLoading(false); // 🔥 FIX
          return;
        }

        const result = await createUserWithEmailAndPassword(auth, email, password);

        await updateProfile(result.user, {
          displayName: name
        });

        await saveUser(result.user, name);
      } else {
        const result = await signInWithEmailAndPassword(auth, email, password);
        await saveUser(result.user);
      }

      navigate("/");
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false); // 🔥 Stop loading
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, provider);
      await saveUser(result.user);
      navigate("/");
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false); // 🔥 Stop loading
    }
  };

  return (
    <div className="login-page">

      {/* 🔥 AI Security Animated Background */}
      <div className="ai-bg">

        {/* 🎥 CCTV Camera */}
        <div className="cctv-wrapper">
          <div className="cctv-camera">
            <div className="lens"></div>
            <div className="rec-light"></div>
          </div>
          {/* 🔵 Radar Cone */}
          <div className="camera-beam"></div>
        </div>

        <div className="grid-overlay"></div>

        {/* Floating sensor dots */}
        <span className="sensor s1"></span>
        <span className="sensor s2"></span>
        <span className="sensor s3"></span>
        <span className="sensor s4"></span>
      </div>

      <div className="login-header">
        <h1>IZ Security System</h1>
        <div className="login-logo">
          <img src="/logo.png" alt="Logo" />
        </div>
      </div>

      <div className="login-center">
        <div className="login-card">

          {/* 🔵 Vertical Scan Beam */}
          <div className="card-scan"></div>

          <h2>{isSignup ? "Create Account" : "Login"}</h2>

          {isSignup && (
            <input
              type="text"
              placeholder="Enter Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          )}

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

          <button className="login-btn" onClick={handleSubmit} disabled={loading}>
  {loading ? <ClipLoader size={20} color="#fff" /> : isSignup ? "Create Account" : "Login"}
</button>

          <div style={{ marginTop: "10px", fontSize: "14px" }}>
            {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
            <span
              style={{ color: "#38bdf8", cursor: "pointer" }}
              onClick={() => setIsSignup(!isSignup)}
            >
              {isSignup ? "Login" : "Create Account"}
            </span>
          </div>

          <div className="divider">
            <span>OR</span>
          </div>

          <button className="google-btn" onClick={handleGoogleLogin} disabled={loading}>
  {loading ? <ClipLoader size={20} color="#000" /> : "Continue with Google"}
</button>

        </div>
      </div>

    </div>
  );
}

export default Login;
