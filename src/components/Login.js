import React, { useEffect, useState } from "react";
import "../css/Login.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { getUserRoleFromAPI } from "../utils/roleUtils";
import {
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";

const LOGIN_URL = "https://plant-explorer-backend-0-0-1.onrender.com/api/auth/login";
const REGISTER_URL = "https://plant-explorer-backend-0-0-1.onrender.com/api/auth/register";

const Login = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const navigate = useNavigate();

  useEffect(() => {
    document.body.classList.add("login-page");

    const checkUserSession = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const role = await getUserRoleFromAPI();
          if (role === "admin") {
            navigate("/users");
          } else if (role === "staff") {
            navigate("/quizzes");
          } else if (role === "children") {
            setSnackbar({ open: true, message: "You do not have permission to log in here!", severity: "error" });
            localStorage.removeItem("token");
          } else {
            navigate("/");
          }
        } catch (error) {
          console.error("Failed to fetch user role:", error);
          localStorage.removeItem("token");
        }
      }
    };
    checkUserSession();

    return () => {
      document.body.classList.remove("login-page");
    };
  }, [navigate]);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setSnackbar({ open: true, message: "Please fill in all fields", severity: "warning" });
      return;
    }

    if (!validateEmail(email)) {
      setSnackbar({ open: true, message: "Please enter a valid email address", severity: "warning" });
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(LOGIN_URL, { email, password });
      if (!response.data.token) {
        throw new Error("Token not found in response");
      }
      const token = response.data.token;
      localStorage.setItem("token", token);
      console.log("Token set in localStorage:", token);

      const role = await getUserRoleFromAPI();
      console.log("Role fetched:", role);

      setSnackbar({ open: true, message: "Login successful", severity: "success" });

      if (role === "admin") {
        console.log("Navigating to /users for admin");
        navigate("/users");
      } else if (role === "staff") {
        console.log("Navigating to /quizzes for staff");
        navigate("/quizzes");
      } else if (role === "children") {
        console.log("Children role detected, not allowed to login here");
        setSnackbar({ open: true, message: "You do not have permission to log in here!", severity: "error" });
        localStorage.removeItem("token");
      } else {
        console.log("No valid role found, navigating to /");
        setSnackbar({ open: true, message: "No valid role found. Redirecting to home.", severity: "warning" });
        navigate("/");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Unknown error";
      console.error("Login failed:", error);
      setSnackbar({ open: true, message: `Login failed: ${errorMessage}`, severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!name || !email || !password || !confirmPassword) {
      setSnackbar({ open: true, message: "Please fill in all fields", severity: "warning" });
      return;
    }

    if (!validateEmail(email)) {
      setSnackbar({ open: true, message: "Please enter a valid email address", severity: "warning" });
      return;
    }

    if (password !== confirmPassword) {
      setSnackbar({ open: true, message: "Passwords do not match", severity: "warning" });
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(REGISTER_URL, {
        name,
        email,
        password,
        confirmPassword,
        age: 18,
      });

      setSnackbar({ open: true, message: "Registration successful, please login", severity: "success" });
      setIsRegistering(false);
      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Unknown error";
      console.error("Registration failed:", error);
      setSnackbar({ open: true, message: `Registration failed: ${errorMessage}`, severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`container ${isRegistering ? "active" : ""}`}>
      {/* Đăng ký */}
      <div className="form-container sign-up">
        <form onSubmit={handleRegister}>
          <h1>Create Account</h1>
          <span>or use your email for registration</span>
          <TextField
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            margin="dense"
            variant="outlined"
            required
            error={!name}
            helperText={!name ? "Name is required" : ""}
          />
          <TextField
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            margin="dense"
            variant="outlined"
            required
            error={email && !validateEmail(email)}
            helperText={email && !validateEmail(email) ? "Please enter a valid email" : ""}
          />
          <TextField
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            margin="dense"
            variant="outlined"
            required
            // Xóa helperText để không hiển thị "Password is required"
          />
          <TextField
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            fullWidth
            margin="dense"
            variant="outlined"
            required
            error={confirmPassword && password !== confirmPassword}
            helperText={confirmPassword && password !== confirmPassword ? "Passwords do not match" : ""}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={loading}
            sx={{ mt: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : "Sign Up"}
          </Button>
        </form>
      </div>

      {/* Đăng nhập */}
      <div className="form-container sign-in">
        <form onSubmit={handleLogin}>
          <h1>Sign In</h1>
          <span>or use your email and password</span>
          <TextField
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            margin="dense"
            variant="outlined"
            required
            error={email && !validateEmail(email)}
            helperText={email && !validateEmail(email) ? "Please enter a valid email" : ""}
          />
          <TextField
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            margin="dense"
            variant="outlined"
            required
            // Xóa helperText để không hiển thị "Password is required"
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={loading}
            sx={{ mt: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : "Sign In"}
          </Button>
        </form>
      </div>

      {/* Panel chuyển đổi giữa đăng ký & đăng nhập */}
      <div className="toggle-container">
        <div className="toggle">
          <div className="toggle-panel toggle-left">
            <h1>Welcome Back!</h1>
            <p>To keep connected with us, please login with your personal info</p>
            <Button
              className="hidden"
              onClick={() => setIsRegistering(false)}
              variant="outlined"
              color="primary"
            >
              Sign In
            </Button>
          </div>
          <div className="toggle-panel toggle-right">
            <h1>Hello, Friend!</h1>
            <p>Enter your details and start your journey with us</p>
            {/* <Button
              className="hidden"
              onClick={() => setIsRegistering(true)}
              variant="outlined"
              color="primary"
            >
              Sign Up
            </Button> */}
          </div>
        </div>
      </div>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Login;