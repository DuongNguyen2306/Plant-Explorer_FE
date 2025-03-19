import React from "react";
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Avatar, Toolbar, Typography, Divider, Box } from "@mui/material";
import { Dashboard, BugReport, ExitToApp, People, Spa, Quiz, Badge } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const menuItems = [
  { text: "User Management", icon: <People />, path: "/users" },
  { text: "Plant", icon: <Spa />, path: "/plants" },
  { text: "Quiz", icon: <Quiz />, path: "/quizzes" },
  { text: "Badge", icon: <Badge />, path: "/badges" },
  { text: "Bug Reports", icon: <BugReport />, path: "/bug-reports" },
];

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <Drawer variant="permanent" sx={{ width: 250, "& .MuiDrawer-paper": { width: 250, boxSizing: "border-box" } }}>
      <Toolbar>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Avatar />
          <Typography variant="h6">Dashboard</Typography>
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
