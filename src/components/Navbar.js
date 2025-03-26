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
  CircularProgress,
} from "@mui/material";
import {
  BugReport,
  ExitToApp,
  People,
  Spa,
  Quiz,
  Badge,
  AccountCircle,
  Category, // Thêm icon cho danh mục
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BASE_API } from "../constant";
import { getUserRoleFromAPI } from "../utils/roleUtils";

const Sidebar = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState(null);
  const [username, setUsername] = useState("User");
  const [selectedAvatar, setSelectedAvatar] = useState(
    localStorage.getItem("selectedAvatar") || "https://via.placeholder.com/40"
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserRoleFromAPI()
      .then((fetchedRole) => {
        setRole(fetchedRole);
      })
      .catch((error) => {
        console.error("Error fetching role:", error);
        setRole(null);
        setLoading(false);
      });
  }, []);

  const fetchUserInfo = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No token found. Please log in again.");
      }
      const response = await axios.get(`${BASE_API}/users/current-user`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("User profile response:", response.data);
      setUsername(response.data.data.username || "User");
      const avatarUrl = response.data.data.avatarUrl || response.data.data.avatar?.imageUrl;
      if (avatarUrl) {
        setSelectedAvatar(avatarUrl);
        localStorage.setItem("selectedAvatar", avatarUrl);
      } else {
        setSelectedAvatar(
          localStorage.getItem("selectedAvatar") || "https://via.placeholder.com/40"
        );
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching user info:", error);
      setUsername("User");
      setSelectedAvatar(
        localStorage.getItem("selectedAvatar") || "https://via.placeholder.com/40"
      );
      setLoading(false);
    }
  };

  useEffect(() => {
    if (role) {
      fetchUserInfo();
    }
  }, [role]);

  useEffect(() => {
    const handleAvatarUpdated = () => {
      fetchUserInfo();
    };

    window.addEventListener("avatarUpdated", handleAvatarUpdated);
    return () => {
      window.removeEventListener("avatarUpdated", handleAvatarUpdated);
    };
  }, []);

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
          { text: "Characteristic Categories", icon: <Category />, path: "/characteristic-categories" }, // Thêm mục mới
          { text: "Application Categories", icon: <Category />, path: "/application-categories" }, // Thêm mục mới
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
        {loading ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <CircularProgress size={40} />
            <Typography variant="h6">Loading...</Typography>
          </Box>
        ) : (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Avatar
              src={selectedAvatar}
              alt="User Avatar"
              onError={(e) => (e.target.src = "https://via.placeholder.com/40?text=Error")}
            />
            <Typography variant="h6">{username}</Typography>
          </Box>
        )}
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