import React, { useState } from "react";
import "../css/Login.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const LOGIN_URL = "https://plant-explorer-backend-0-0-1.onrender.com/api/auth/login";
const REGISTER_URL = "https://plant-explorer-backend-0-0-1.onrender.com/api/auth/register";

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
      navigate("/users");
    } catch (error) {
      alert("Login failed: " + (error.response?.data?.message || "Unknown error"));
    }
  };

  const [confirmPassword, setConfirmPassword] = useState(""); // Thêm confirmPassword vào state

const handleRegister = async (e) => {
    e.preventDefault();
    
    if (!name || !email || !password || !confirmPassword) {
      alert("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const response = await axios.post(REGISTER_URL, { 
        name, 
        email, 
        password, 
        confirmPassword, // Thêm confirmPassword đúng theo API
        age: 18 // Nếu API yêu cầu age
      });

      alert("Registration successful, please login");
      setIsRegistering(false);
    } catch (error) {
      alert("Registration failed: " + (error.response?.data?.message || "Unknown error"));
    }
};




  return (
    <div className="login-page">
      <div className={`container ${isRegistering ? "active" : ""}`}>
        {/* Đăng ký */}
        <div className="form-container sign-up">
  <form onSubmit={handleRegister}>
    <h1>Create Account</h1>
    <span>or use your email for registration</span>
    <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
    <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
    <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
    <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
    <button type="submit">Sign Up</button>
  </form>
</div>


        {/* Đăng nhập */}
        <div className="form-container sign-in">
          <form onSubmit={handleLogin}>
            <h1>Sign In</h1>
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
              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
