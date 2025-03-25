// 📁 components/Login.js
import React, { useEffect, useState } from "react";
import "../css/Login.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { getUserRoleFromAPI } from "../utils/roleUtils";

const LOGIN_URL = "https://plant-explorer-backend-0-0-1.onrender.com/api/auth/login";
const REGISTER_URL = "https://plant-explorer-backend-0-0-1.onrender.com/api/auth/register";

const Login = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Thêm class login-page vào body khi component được render
    document.body.classList.add("login-page");

    // Xóa class login-page khi component unmount
    return () => {
      document.body.classList.remove("login-page");
    };
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(LOGIN_URL, { email, password });
      if (!response.data.token) {
        throw new Error("Token not found in response");
      }
      const token = response.data.token;
      localStorage.setItem("token", token);
      console.log("Token set in localStorage:", token);
      alert("Login successful");

      const role = await getUserRoleFromAPI();
      console.log("Role fetched:", role);
      if (role === "admin") {
        console.log("Navigating to /users for admin");
        navigate("/users");
      } else if (role === "staff") {
        console.log("Navigating to /quizzes for staff");
        navigate("/quizzes");
      } else if (role === "children") {
        console.log("Navigating to /plants for children");
        navigate("/plants");
      } else {
        console.log("No valid role found, navigating to /");
        navigate("/");
      }
    } catch (error) {
      console.error("Login failed:", error);
      alert("Login failed: " + (error.response?.data?.message || error.message || "Unknown error"));
    }
  };

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
        confirmPassword,
        age: 18,
      });

      alert("Registration successful, please login");
      setIsRegistering(false);
    } catch (error) {
      console.error("Registration failed:", error);
      alert("Registration failed: " + (error.response?.data?.message || error.message || "Unknown error"));
    }
  };

  return (
    <div className={`container ${isRegistering ? "active" : ""}`}>
      {/* Đăng ký */}
      <div className="form-container sign-up">
        <form onSubmit={handleRegister}>
          <h1>Create Account</h1>
          <span>or use your email for registration</span>
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <button type="submit">Sign Up</button>
        </form>
      </div>

      {/* Đăng nhập */}
      <div className="form-container sign-in">
        <form onSubmit={handleLogin}>
          <h1>Sign In</h1>
          <span>or use your email and password</span>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {/* <a href="#">Forgot Your Password?</a> */}
          <button type="submit">Sign In</button>
        </form>
      </div>

      {/* Panel chuyển đổi giữa đăng ký & đăng nhập */}
      <div className="toggle-container">
        <div className="toggle">
          <div className="toggle-panel toggle-left">
            <h1>Welcome Back!</h1>
            <p>To keep connected with us, please login with your personal info</p>
            {/* <button className="hidden" onClick={() => setIsRegistering(false)}>
              Sign In
            </button> */}
          </div>
          <div className="toggle-panel toggle-right">
            <h1>Hello, Friend!</h1>
            <p>Enter your details and start your journey with us</p>
            {/* <button className="hidden" onClick={() => setIsRegistering(true)}>
              Sign Up
            </button> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;