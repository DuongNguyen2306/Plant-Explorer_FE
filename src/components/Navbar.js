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
  Fade,
} from "@mui/material";
import {
  BugReport,
  ExitToApp,
  People,
  Spa,
  Quiz,
  Badge,
  AccountCircle,
  Category,
  History,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { styled } from "@mui/system";
import axios from "axios";
import { BASE_API } from "../constant";
import { getUserRoleFromAPI } from "../utils/roleUtils";

// Styled components for custom styling
const StyledDrawer = styled(Drawer)(({ theme }) => ({
  width: 280, // Slightly wider for a more spacious feel
  "& .MuiDrawer-paper": {
    width: 280,
    boxSizing: "border-box",
    background: "linear-gradient(180deg, #2c3e50 0%, #1a252f 100%)", // Dark gradient background
    color: "#ecf0f1", // Light text color for contrast
    borderRight: "none",
    boxShadow: "2px 0 15px rgba(0, 0, 0, 0.2)", // Subtle shadow for depth
  },
}));

const StyledListItem = styled(ListItem)(({ theme }) => ({
  borderRadius: "8px",
  margin: "4px 8px",
  padding: "12px 16px", // Increased padding for a larger touch area
  transition: "all 0.3s ease",
  "&:hover": {
    backgroundColor: "rgba(255, 255, 255, 0.1)", // Subtle hover effect
    transform: "translateX(5px)", // Slight shift on hover
  },
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: 50,
  height: 50,
  border: "2px solid #3498db", // Border to highlight the avatar
  transition: "transform 0.3s ease",
  "&:hover": {
    transform: "scale(1.1)", // Slight zoom on hover
  },
}));

const StyledDivider = styled(Divider)(({ theme }) => ({
  backgroundColor: "rgba(255, 255, 255, 0.2)", // Light divider for contrast
  margin: "8px 0",
}));

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
          { text: "Quiz Attempts", icon: <History />, path: "/quiz-attempts" },
          { text: "Badge", icon: <Badge />, path: "/badges" },
          { text: "Characteristic Categories", icon: <Category />, path: "/characteristic-categories" },
          { text: "Application Categories", icon: <Category />, path: "/application-categories" },
        ]
      : []),
    ...(role
      ? [{ text: "Bug Reports", icon: <BugReport />, path: "/bug-reports" }]
      : []),
  ];

  return (
    <StyledDrawer variant="permanent">
      <Toolbar sx={{ py: 2, px: 3 }}>
        {loading ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <CircularProgress size={40} sx={{ color: "#3498db" }} />
            <Typography variant="h6" sx={{ color: "#ecf0f1" }}>
              Loading...
            </Typography>
          </Box>
        ) : (
          <Fade in={true}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <StyledAvatar
                src={selectedAvatar}
                alt="User Avatar"
                onError={(e) => (e.target.src = "https://via.placeholder.com/40?text=Error")}
              />
              <Box>
                <Typography variant="h6" sx={{ color: "#ecf0f1", fontWeight: 600 }}>
                  {username}
                </Typography>
                <Typography variant="body2" sx={{ color: "rgba(255, 255, 255, 0.7)" }}>
                  {role ? role.charAt(0).toUpperCase() + role.slice(1) : "Guest"}
                </Typography>
              </Box>
            </Box>
          </Fade>
        )}
      </Toolbar>
      <StyledDivider />
      <List sx={{ px: 1 }}>
        {menuItems.map((item) => (
          <StyledListItem button key={item.text} onClick={() => navigate(item.path)}>
            <ListItemIcon sx={{ color: "#ecf0f1", minWidth: "40px" }}>{item.icon}</ListItemIcon>
            <ListItemText
              primary={item.text}
              primaryTypographyProps={{ fontSize: "1.1rem", fontWeight: 500 }}
            />
          </StyledListItem>
        ))}
        <StyledDivider />
        <StyledListItem button onClick={handleLogout}>
          <ListItemIcon sx={{ color: "#e74c3c", minWidth: "40px" }}>
            <ExitToApp />
          </ListItemIcon>
          <ListItemText
            primary="Log Out"
            primaryTypographyProps={{ fontSize: "1.1rem", fontWeight: 500, color: "#e74c3c" }}
          />
        </StyledListItem>
      </List>
    </StyledDrawer>
  );
};

export default Sidebar;