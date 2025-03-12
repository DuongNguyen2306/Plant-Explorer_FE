import React, { useState } from "react";
import "../css/Login.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";

const CLIENT_ID = "929525589745-4bq3qd76st7ecd3p0l6p5sm0gemptf4c.apps.googleusercontent.com";

const LOGIN_URL = "https://plant-explorer-backend-0-0-1.onrender.com/api/auth/login";
const REGISTER_URL = "https://plant-explorer-backend-0-0-1.onrender.com/api/auth/register";
const GOOGLE_AUTH_URL = "https://plant-explorer-backend-0-0-1.onrender.com/api/auth/google";

const Login = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(LOGIN_URL, { email, password });
      localStorage.setItem("token", response.data.token);
      alert("Login successful");
      navigate("/dashboard");
    } catch (error) {
      alert("Login failed: " + (error.response?.data?.message || "Unknown error"));
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(REGISTER_URL, { name, email, password });
      alert("Registration successful, please login");
      setIsRegistering(false);
    } catch (error) {
      alert("Registration failed: " + (error.response?.data?.message || "Unknown error"));
    }
  };

  const handleGoogleSuccess = async (response) => {
    try {
      console.log("Google login success:", response);
      const res = await axios.post(GOOGLE_AUTH_URL, { token: response.credential });
      localStorage.setItem("token", res.data.token);
      alert("Google login successful");
      navigate("/dashboard");
    } catch (error) {
      console.error("Google login failed:", error);
      alert("Google login failed");
    }
  };

  return (
    <GoogleOAuthProvider clientId={CLIENT_ID}>
      <div className="login-page">
        <div className={`container ${isRegistering ? "active" : ""}`}>
          {/* Đăng ký */}
          <div className="form-container sign-up">
            <form onSubmit={handleRegister}>
              <h1>Create Account</h1>
              <div className="social-icons">
                <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => alert("Google Login Failed")} />
              </div>
              <span>or use your email for registration</span>
              <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
              <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
              <button type="submit">Sign Up</button>
            </form>
          </div>

          {/* Đăng nhập */}
          <div className="form-container sign-in">
            <form onSubmit={handleLogin}>
              <h1>Sign In</h1>
              <div className="social-icons">
                <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => alert("Google Login Failed")} />
              </div>
              <span>or use your email and password</span>
              <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
              <a href="#">Forgot Your Password?</a>
              <button type="submit">Sign In</button>
            </form>
          </div>

          {/* Panel chuyển đổi giữa đăng ký & đăng nhập */}
          <div className="toggle-container">
            <div className="toggle">
              <div className="toggle-panel toggle-left">
                <h1>Welcome Back!</h1>
                <p>To keep connected with us, please login with your personal info</p>
                <button className="hidden" onClick={() => setIsRegistering(false)}>Sign In</button>
              </div>
              <div className="toggle-panel toggle-right">
                <h1>Hello, Friend!</h1>
                <p>Enter your details and start your journey with us</p>
                <button className="hidden" onClick={() => setIsRegistering(true)}>Sign Up</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default Login;
