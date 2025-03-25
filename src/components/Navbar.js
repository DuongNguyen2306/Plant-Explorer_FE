// 📁 components/Sidebar.js
import React, { useEffect, useState } from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Toolbar,
  Typography,
  Divider,
  Box,
} from "@mui/material";
import {
  BugReport,
  ExitToApp,
  People,
  Spa,
  Quiz,
  Badge,
  AccountCircle,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BASE_API } from "../constant";
import { getUserRoleFromAPI } from "../utils/roleUtils";

const Sidebar = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState(null);
  const [username, setUsername] = useState("User"); // Mặc định là "User"
  const [selectedAvatar, setSelectedAvatar] = useState(
    localStorage.getItem("selectedAvatar") || "https://via.placeholder.com/40" // Avatar mặc định nếu chưa chọn
  );

  useEffect(() => {
    getUserRoleFromAPI().then(setRole);
  }, []);

  // Lấy thông tin người dùng (bao gồm tên tài khoản)
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${BASE_API}/user/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsername(response.data.username || "User");
      } catch (error) {
        console.error("Error fetching user info:", error);
        setUsername("User");
      }
    };

    if (role) {
      fetchUserInfo();
    }
  }, [role]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("selectedAvatar");
    navigate("/");
  };

  const menuItems = [
    ...(role === "admin"
      ? [{ text: "User Management", icon: <People />, path: "/users" }]
      : []),
    ...(role === "staff" || role === "children"
      ? [
          { text: "Plant", icon: <Spa />, path: "/plants" },
          { text: "Avatar", icon: <AccountCircle />, path: "/avatars" },
        ]
      : []),
    ...(role === "staff"
      ? [
          { text: "Quiz", icon: <Quiz />, path: "/quizzes" },
          { text: "Badge", icon: <Badge />, path: "/badges" },
        ]
      : []),
    ...(role
      ? [{ text: "Bug Reports", icon: <BugReport />, path: "/bug-reports" }]
      : []),
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{ width: 250, "& .MuiDrawer-paper": { width: 250, boxSizing: "border-box" } }}
    >
      <Toolbar>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Avatar src={selectedAvatar} alt="User Avatar" />
          <Typography variant="h6">{username}</Typography>
        </Box>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem button key={item.text} onClick={() => navigate(item.path)}>
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
        <Divider />
        <ListItem button onClick={handleLogout}>
          <ListItemIcon>
            <ExitToApp />
          </ListItemIcon>
          <ListItemText primary="Log Out" />
        </ListItem>
      </List>
    </Drawer>
  );
};

export default Sidebar;