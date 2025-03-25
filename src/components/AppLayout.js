// 📁 components/AppLayout.js
import React from "react";
import { Link, useNavigate } from "react-router-dom";

const AppLayout = ({ children }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <div className="sidebar">
        <h2>Dashboard</h2>
        <ul>
          <li>
            <Link to="/plants">Plant</Link>
          </li>
          <li>
            <Link to="/quizzes">Quiz</Link>
          </li>
          <li>
            <Link to="/avatars">Avatar</Link> {/* Thêm liên kết đến AvatarManagement */}
          </li>
          <li>
            <Link to="/badges">Badge</Link>
          </li>
          <li>
            <Link to="/bug-reports">Bug Reports</Link>
          </li>
          <li>
            <button onClick={handleLogout}>Log Out</button>
          </li>
        </ul>
      </div>
      {/* Nội dung chính */}
      {children}
    </div>
  );
};

export default AppLayout;