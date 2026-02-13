import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../firebase";
import { useNavigate } from "react-router-dom";

function Login({ setUser }) {

  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;

      const response = await fetch("http://localhost:5000/save-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: firebaseUser.displayName,
          email: firebaseUser.email
        })
      });

      const userData = await response.json();

      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));

      navigate("/");

    } catch (error) {
      console.error("Login Error:", error);
      alert("Login failed");
    }
  };

  return (
    <div className="login-page">

      <div className="login-header">
        <h1>IZ Security System</h1>

        <div className="login-logo">
          <img src="/logo.png" alt="Logo" />
        </div>
      </div>

      <div className="login-center">
        <div className="login-card">
          <h2>Welcome Back</h2>
          <p>Secure access to your account</p>

          <button
            className="button login-btn"
            onClick={handleGoogleLogin}
          >
            Login with Google
          </button>
        </div>
      </div>

    </div>
  );
}

export default Login;
