import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Select,
  MenuItem,
  Box,
  Typography,
  IconButton,
  CircularProgress,
  Snackbar,
  Alert,
  Fade,
  Tooltip,
} from "@mui/material";
import { styled } from "@mui/system";
import { Edit, Delete } from "@mui/icons-material";
import { BASE_API } from "../constant";
import { getUserRoleFromAPI } from "../utils/roleUtils";

// Default avatars
const DEFAULT_AVATARS = [
  { id: "default-1", name: "Avatar 1", imageUrl: "https://cdn-icons-png.flaticon.com/512/147/147142.png", isDefault: true },
  { id: "default-2", name: "Avatar 2", imageUrl: "https://cdn-icons-png.flaticon.com/512/6858/6858485.png", isDefault: true },
  { id: "default-3", name: "Avatar 3", imageUrl: "https://www.svgrepo.com/show/382106/male-avatar-boy-face-man-user-9.svg", isDefault: true },
];

const AVATAR_OPTIONS = [
  "https://cdn-icons-png.flaticon.com/512/147/147142.png",
  "https://cdn-icons-png.flaticon.com/512/6858/6858485.png",
  "https://www.svgrepo.com/show/382106/male-avatar-boy-face-man-user-9.svg",
  "https://cdn3.iconfinder.com/data/icons/business-avatar-1/512/3_avatar-512.png",
  "https://img.lovepik.com/free-png/20211216/lovepik-boy-avatar-png-image_401704859_wh1200.png",
];

const API_URL = BASE_API + "/avatars";

// Styled components
const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: "12px",
  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
  background: "linear-gradient(145deg, #ffffff, #f9fbfc)",
  width: "100%",
  maxWidth: "1200px",
  margin: "0 auto",
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  padding: "20px 30px", // Increased padding for more space inside cells
  fontSize: "1.1rem",
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: "25px",
  padding: "8px 20px", // Adjusted padding for buttons
  textTransform: "none",
  fontWeight: 500,
  fontSize: "1rem",
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 5px 15px rgba(0, 0, 0, 0.1)",
  },
}));

const AvatarManagement = () => {
  const [avatars, setAvatars] = useState([]);
  const [serverAvatars, setServerAvatars] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingAvatar, setEditingAvatar] = useState(null);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  useEffect(() => {
    getUserRoleFromAPI().then(setRole);
  }, []);

  useEffect(() => {
    if (role === "staff" || role === "children") fetchAvatars();
  }, [role]);

  const getAuthToken = () => localStorage.getItem("token") || "";

  const fetchAvatars = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getAuthToken();
      if (!token) throw new Error("Authorization token missing! Please log in.");
      const response = await axios.get(API_URL, { headers: { Authorization: `Bearer ${token}` } });
      const fetchedAvatars = Array.isArray(response.data) ? response.data : response.data?.data || [];
      const updatedAvatars = fetchedAvatars.map((avatar) => ({ ...avatar, isDefault: false }));
      setServerAvatars(updatedAvatars);
      setAvatars(updatedAvatars.length > 0 ? updatedAvatars : DEFAULT_AVATARS);
    } catch (error) {
      setError("Failed to fetch avatars: " + (error.response?.data?.message || error.message));
      setAvatars(DEFAULT_AVATARS);
      setServerAvatars([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (avatar = null) => {
    setEditingAvatar(avatar || { id: "", name: "", imageUrl: AVATAR_OPTIONS[0] });
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setEditingAvatar(null);
  };

  const handleSaveAvatar = async () => {
    if (!editingAvatar.name || !editingAvatar.imageUrl) {
      setSnackbar({ open: true, message: "Name and Avatar Image are required!", severity: "warning" });
      return;
    }
    if (!AVATAR_OPTIONS.includes(editingAvatar.imageUrl)) {
      setSnackbar({ open: true, message: "Invalid avatar selection.", severity: "warning" });
      return;
    }
    try {
      const token = getAuthToken();
      if (!token) throw new Error("Authorization token missing! Please log in.");
      const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
      if (editingAvatar.id && !editingAvatar.isDefault) {
        await axios.put(`${API_URL}/${editingAvatar.id}`, { id: editingAvatar.id, imageUrl: editingAvatar.imageUrl }, { headers });
        setSnackbar({ open: true, message: "Avatar updated successfully!", severity: "success" });
      } else {
        await axios.post(API_URL, { name: editingAvatar.name, imageUrl: editingAvatar.imageUrl }, { headers });
        setSnackbar({ open: true, message: "Avatar created successfully!", severity: "success" });
      }
      fetchAvatars();
      handleCloseDialog();
    } catch (error) {
      setSnackbar({ open: true, message: "Failed to save avatar: " + (error.response?.data?.message || error.message), severity: "error" });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this avatar?")) {
      try {
        const token = getAuthToken();
        if (!token) throw new Error("Authorization token missing! Please log in.");
        await axios.delete(`${API_URL}/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        fetchAvatars();
        setSnackbar({ open: true, message: "Avatar deleted successfully!", severity: "success" });
      } catch (error) {
        setSnackbar({ open: true, message: "Failed to delete avatar: " + (error.response?.data?.message || error.message), severity: "error" });
      }
    }
  };

  const handleSelectAvatar = async (avatar) => {
    if (avatar.isDefault) {
      setSnackbar({ open: true, message: "Cannot select a default avatar.", severity: "warning" });
      return;
    }
    try {
      const token = getAuthToken();
      if (!token) throw new Error("Authorization token missing! Please log in.");
      await axios.put(`${API_URL}/user/${avatar.id}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      localStorage.setItem("selectedAvatar", avatar.imageUrl);
      setSnackbar({ open: true, message: `Avatar "${avatar.name}" selected!`, severity: "success" });
      window.dispatchEvent(new Event("avatarUpdated"));
    } catch (error) {
      setSnackbar({ open: true, message: "Failed to select avatar: " + (error.response?.data?.message || error.message), severity: "error" });
    }
  };

  const filteredAvatars = avatars.filter((a) => a.name.toLowerCase().includes(search.toLowerCase()));

  if (role === null) return <Typography variant="h6" align="center">Loading role...</Typography>;
  if (role !== "staff" && role !== "children")
    return <Typography variant="h6" align="center" color="error">Access Denied</Typography>;

  return (
    <Box sx={{ padding: "40px", backgroundColor: "#f4f6f9", minHeight: "100vh" }}>
      {/* Header Section */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, color: "#2c3e50", fontSize: "2rem" }}>
          Avatar Management
        </Typography>
        {role === "staff" && (
          <Box sx={{ display: "flex", gap: 3 }}>
            <StyledButton variant="contained" color="primary" onClick={() => handleOpenDialog()}>
              Add Avatar
            </StyledButton>
            <StyledButton variant="outlined" color="secondary" onClick={fetchAvatars}>
              Refresh
            </StyledButton>
          </Box>
        )}
      </Box>

      {/* Search and Info */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4, maxWidth: "1200px", margin: "0 auto" }}>
        <TextField
          label="Search Avatars"
          variant="outlined"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: "400px", backgroundColor: "#fff", borderRadius: "8px", "& .MuiInputBase-root": { fontSize: "1.1rem" } }}
        />
        <Typography variant="body1" color="text.secondary" sx={{ fontSize: "1rem" }}>
          Showing {filteredAvatars.length} of {avatars.length} avatars
        </Typography>
      </Box>

      {/* Loading/Error States */}
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
          <CircularProgress size={50} />
        </Box>
      )}
      {error && (
        <Typography variant="body1" color="error" align="center" sx={{ py: 5, fontSize: "1.2rem" }}>
          {error}
        </Typography>
      )}

      {/* Table Section */}
      {!loading && !error && (
        <StyledTableContainer component={Paper}>
          <Table>
            <TableHead sx={{ backgroundColor: "#3498db" }}>
              <TableRow>
                <StyledTableCell sx={{ color: "#fff", fontWeight: 600, width: "20%" }}>Avatar</StyledTableCell>
                <StyledTableCell sx={{ color: "#fff", fontWeight: 600, width: "30%" }}>Name</StyledTableCell>
                <StyledTableCell sx={{ color: "#fff", fontWeight: 600, width: "50%", textAlign: "center" }}>Actions</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAvatars.length === 0 ? (
                <TableRow>
                  <StyledTableCell colSpan={3} align="center">
                    <Fade in={true}>
                      <Box sx={{ py: 6 }}>
                        <Typography variant="body1" color="text.secondary" sx={{ fontSize: "1.2rem" }}>
                          {avatars.length === 0 ? "No avatars available." : "No avatars match your search."}
                        </Typography>
                        {role === "staff" && avatars.length === 0 && (
                          <StyledButton
                            variant="contained"
                            color="primary"
                            onClick={() => handleOpenDialog()}
                            sx={{ mt: 3 }}
                          >
                            Create Avatar
                          </StyledButton>
                        )}
                      </Box>
                    </Fade>
                  </StyledTableCell>
                </TableRow>
              ) : (
                filteredAvatars.map((avatar, index) => (
                  <Fade in={true} timeout={300 + index * 100} key={avatar.id}>
                    <TableRow sx={{ "&:hover": { backgroundColor: "#ecf0f1" }, height: "90px" }}>
                      <StyledTableCell>
                        <img
                          src={avatar.imageUrl}
                          alt={avatar.name}
                          width={70}
                          height={70}
                          style={{ borderRadius: "50%", objectFit: "cover" }}
                          onError={(e) => (e.target.src = "https://via.placeholder.com/70?text=Error")}
                        />
                      </StyledTableCell>
                      <StyledTableCell sx={{ fontSize: "1.2rem" }}>{avatar.name}</StyledTableCell>
                      <StyledTableCell sx={{ textAlign: "center" }}>
                        <Tooltip title="Select">
                          <StyledButton
                            variant="outlined"
                            color="primary"
                            onClick={() => handleSelectAvatar(avatar)}
                            disabled={avatar.isDefault}
                            sx={{ mr: 3, fontSize: "1rem", padding: "8px 24px" }}
                          >
                            Select
                          </StyledButton>
                        </Tooltip>
                        {role === "staff" && (
                          <>
                            <Tooltip title="Edit">
                              <IconButton
                                onClick={() => handleOpenDialog(avatar)}
                                disabled={avatar.isDefault}
                                sx={{ color: "#1976d2", mr: 2 }}
                              >
                                <Edit fontSize="medium" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton
                                onClick={() => handleDelete(avatar.id)}
                                disabled={avatar.isDefault}
                                sx={{ color: "#d32f2f" }}
                              >
                                <Delete fontSize="medium" />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                      </StyledTableCell>
                    </TableRow>
                  </Fade>
                ))
              )}
            </TableBody>
          </Table>
        </StyledTableContainer>
      )}

      {/* Dialog for Add/Edit */}
      {role === "staff" && (
        <Dialog open={open} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ backgroundColor: "#3498db", color: "#fff", fontWeight: 600, fontSize: "1.5rem", py: 2 }}>
            {editingAvatar?.id ? "Edit Avatar" : "Add New Avatar"}
          </DialogTitle>
          <DialogContent sx={{ pt: 4 }}>
            <TextField
              label="Avatar Name"
              fullWidth
              value={editingAvatar?.name || ""}
              onChange={(e) => setEditingAvatar({ ...editingAvatar, name: e.target.value })}
              sx={{ mb: 4, "& .MuiInputBase-root": { fontSize: "1.1rem" } }}
            />
            <Select
              fullWidth
              value={editingAvatar?.imageUrl || AVATAR_OPTIONS[0]}
              onChange={(e) => setEditingAvatar({ ...editingAvatar, imageUrl: e.target.value })}
              sx={{ "& .MuiSelect-select": { fontSize: "1.1rem", py: 1.5 } }}
            >
              {AVATAR_OPTIONS.map((url, index) => (
                <MenuItem key={index} value={url} sx={{ py: 1.5 }}>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <img
                      src={url}
                      alt={`avatar-${index}`}
                      width={40}
                      height={40}
                      style={{ borderRadius: "50%", marginRight: 15 }}
                      onError={(e) => (e.target.src = "https://via.placeholder.com/40?text=Error")}
                    />
                    <Typography sx={{ fontSize: "1.1rem" }}>Avatar {index + 1}</Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </DialogContent>
          <DialogActions sx={{ p: 3, gap: 2 }}>
            <StyledButton onClick={handleCloseDialog} color="inherit" variant="outlined">
              Cancel
            </StyledButton>
            <StyledButton onClick={handleSaveAvatar} variant="contained" color="primary">
              Save
            </StyledButton>
          </DialogActions>
        </Dialog>
      )}

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AvatarManagement;