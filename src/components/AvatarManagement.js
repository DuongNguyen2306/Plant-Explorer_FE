import React, { useEffect, useState, useCallback } from "react";
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
  TablePagination,
  InputAdornment,
} from "@mui/material";
import { styled } from "@mui/system";
import { Edit, Delete, Search, Refresh, Add } from "@mui/icons-material";
import { BASE_API } from "../constant";
import { getUserRoleFromAPI } from "../utils/roleUtils";
import debounce from "lodash/debounce";

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

// Styled Components (unchanged)
const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: "16px",
  boxShadow: "0 8px 30px rgba(0, 0, 0, 0.12)",
  background: "#fff",
  margin: "0 auto",
  overflowX: "auto",
  maxWidth: "100%",
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  padding: "18px 24px",
  fontSize: "1.1rem",
  borderBottom: "1px solid rgba(224, 224, 224, 0.7)",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
}));

const StyledTableHeadCell = styled(TableCell)(({ theme }) => ({
  padding: "18px 24px",
  fontSize: "1.2rem",
  fontWeight: 700,
  color: "#fff",
  background: "linear-gradient(90deg, #2c3e50, #3498db)",
  borderBottom: "none",
  whiteSpace: "nowrap",
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: "30px",
  padding: "10px 24px",
  textTransform: "none",
  fontWeight: 600,
  fontSize: "1rem",
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 6px 15px rgba(0, 0, 0, 0.15)",
  },
}));

const StyledSearchField = styled(TextField)(({ theme }) => ({
  width: { xs: "100%", sm: "400px", md: "500px" },
  maxWidth: "100%",
  backgroundColor: "#fff",
  borderRadius: "30px",
  boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
  "& .MuiInputBase-root": {
    fontSize: "1.1rem",
    padding: "4px 12px",
  },
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      borderColor: "#3498db",
    },
    "&:hover fieldset": {
      borderColor: "#2980b9",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#3498db",
    },
  },
  "& .MuiInputLabel-root": {
    color: "#3498db",
    fontWeight: 500,
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: "#2980b9",
  },
}));

const AvatarManagement = () => {
  const [avatars, setAvatars] = useState([]);
  const [filteredAvatars, setFilteredAvatars] = useState([]);
  const [serverAvatars, setServerAvatars] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingAvatar, setEditingAvatar] = useState(null);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(5);

  useEffect(() => {
    getUserRoleFromAPI().then((userRole) => {
      setRole(userRole);
      console.log("User role:", userRole); // Debug log
    });
  }, []);

  const getAuthToken = () => {
    const token = localStorage.getItem("token") || "";
    console.log("Auth token:", token); // Debug log
    return token;
  };

  const fetchAvatars = useCallback(async () => {
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
      setFilteredAvatars(updatedAvatars.length > 0 ? updatedAvatars : DEFAULT_AVATARS);
      setSnackbar({ open: true, message: "Avatars loaded successfully!", severity: "success" });
    } catch (error) {
      setError("Failed to fetch avatars: " + (error.response?.data?.message || error.message));
      setAvatars(DEFAULT_AVATARS);
      setFilteredAvatars(DEFAULT_AVATARS);
      setServerAvatars([]);
      setSnackbar({ open: true, message: "Failed to fetch avatars", severity: "error" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (role === "staff" || role === "children") fetchAvatars();
  }, [role, fetchAvatars]);

  const handleSearch = useCallback(
    debounce((query) => {
      const filtered = avatars.filter((avatar) =>
        avatar.name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredAvatars(filtered);
      setPage(0);
    }, 500),
    [avatars]
  );

  useEffect(() => {
    handleSearch(search);
  }, [search, handleSearch]);

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
    setLoading(true);
    try {
      const token = getAuthToken();
      if (!token) throw new Error("Authorization token missing! Please log in.");
      const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

      if (editingAvatar.id && !editingAvatar.isDefault) {
        // Revert to PUT as per API documentation
        const response = await axios.put(`${API_URL}/${editingAvatar.id}`, 
          { id: editingAvatar.id, name: editingAvatar.name, imageUrl: editingAvatar.imageUrl }, 
          { headers }
        );
        console.log("Update response:", response.data); // Debug log
        setSnackbar({ open: true, message: "Avatar updated successfully!", severity: "success" });
      } else {
        const response = await axios.post(API_URL, 
          { name: editingAvatar.name, imageUrl: editingAvatar.imageUrl }, 
          { headers }
        );
        console.log("Create response:", response.data); // Debug log
        setSnackbar({ open: true, message: "Avatar created successfully!", severity: "success" });
      }
      fetchAvatars();
      handleCloseDialog();
    } catch (error) {
      console.error("Save avatar error:", error.response || error); // Detailed error logging
      const errorMessage = error.response?.status === 403 
        ? "You do not have permission to update avatars. Please contact an admin."
        : `Failed to save avatar: ${error.response?.status} - ${error.response?.data?.message || error.message}`;
      setSnackbar({ 
        open: true, 
        message: errorMessage, 
        severity: "error" 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this avatar?")) {
      setLoading(true);
      try {
        const token = getAuthToken();
        if (!token) throw new Error("Authorization token missing! Please log in.");
        await axios.delete(`${API_URL}/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        fetchAvatars();
        setSnackbar({ open: true, message: "Avatar deleted successfully!", severity: "success" });
      } catch (error) {
        setSnackbar({ open: true, message: "Failed to delete avatar: " + (error.response?.data?.message || error.message), severity: "error" });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSelectAvatar = async (avatar) => {
    if (avatar.isDefault) {
      setSnackbar({ open: true, message: "Cannot select a default avatar.", severity: "warning" });
      return;
    }
    setLoading(true);
    try {
      const token = getAuthToken();
      if (!token) throw new Error("Authorization token missing! Please log in.");
      await axios.put(`${API_URL}/user/${avatar.id}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      localStorage.setItem("selectedAvatar", avatar.imageUrl);
      setSnackbar({ open: true, message: `Avatar "${avatar.name}" selected!`, severity: "success" });
      window.dispatchEvent(new Event("avatarUpdated"));
    } catch (error) {
      setSnackbar({ open: true, message: "Failed to select avatar: " + (error.response?.data?.message || error.message), severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  if (role === null)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "#f5f7fa" }}>
        <CircularProgress size={80} thickness={5} sx={{ color: "#3498db" }} />
      </Box>
    );

  if (role !== "staff" && role !== "children")
    return (
      <Box sx={{ textAlign: "center", mt: 8, p: 4, background: "#fff", borderRadius: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", maxWidth: "600px", mx: "auto" }}>
        <Typography variant="h5" color="error" sx={{ fontWeight: 600 }}>
          Access Denied
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
          You do not have permission to view this page.
        </Typography>
      </Box>
    );

  return (
    <Box
      sx={{
        padding: "32px",
        background: "linear-gradient(135deg, #e8f0fe, #f5f7fa)",
        minHeight: "100vh",
        ml: { xs: 0, md: "280px" },
        maxWidth: "100%",
        overflowX: "hidden",
      }}
    >
      {/* Header Section */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4, flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: "#2c3e50", fontSize: { xs: "1.5rem", md: "2rem" } }}>
            Avatar Management
          </Typography>
          <Typography variant="subtitle1" sx={{ color: "#7f8c8d", fontSize: { xs: "1rem", md: "1.2rem" }, mt: 1 }}>
            Manage your avatars ({filteredAvatars.length} avatars)
          </Typography>
        </Box>
        {role === "staff" && (
          <Box sx={{ display: "flex", gap: 2 }}>
            <StyledButton variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()} sx={{ background: "linear-gradient(90deg, #2c3e50, #3498db)" }}>
              Add Avatar
            </StyledButton>
            <StyledButton variant="outlined" startIcon={<Refresh />} onClick={fetchAvatars} sx={{ borderColor: "#3498db", color: "#3498db" }}>
              Refresh
            </StyledButton>
          </Box>
        )}
      </Box>

      {/* Search Section */}
      <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
        <StyledSearchField
          label="Search Avatars"
          variant="outlined"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ color: "#3498db", fontSize: "1.8rem" }} />
              </InputAdornment>
            ),
          }}
        />
        <Typography variant="body1" color="text.secondary" sx={{ fontSize: "1rem" }}>
          Showing {filteredAvatars.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).length} of {filteredAvatars.length} avatars
        </Typography>
      </Box>

      {/* Loading/Error States */}
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 8 }}>
          <CircularProgress size={80} thickness={5} sx={{ color: "#3498db" }} />
        </Box>
      )}
      {error && (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography variant="h6" color="error" sx={{ fontSize: "1.4rem", mb: 2 }}>
            {error}
          </Typography>
          <StyledButton variant="outlined" onClick={fetchAvatars} sx={{ borderColor: "#3498db", color: "#3498db" }}>
            Retry
          </StyledButton>
        </Box>
      )}

      {/* Table Section */}
      {!loading && !error && (
        <StyledTableContainer component={Paper}>
          <Table sx={{ minWidth: "650px" }}>
            <TableHead>
              <TableRow>
                <StyledTableHeadCell sx={{ width: { xs: "20%", md: "20%" }, minWidth: "150px" }}>Avatar</StyledTableHeadCell>
                <StyledTableHeadCell sx={{ width: { xs: "30%", md: "30%" }, minWidth: "200px" }}>Name</StyledTableHeadCell>
                <StyledTableHeadCell align="center" sx={{ width: { xs: "50%", md: "50%" }, minWidth: "200px" }}>
                  Actions
                </StyledTableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAvatars.length === 0 ? (
                <TableRow>
                  <StyledTableCell colSpan={3} align="center">
                    <Fade in={true}>
                      <Box sx={{ py: 6 }}>
                        <Typography variant="h6" color="text.secondary" sx={{ fontSize: "1.4rem", mb: 2 }}>
                          No avatars found
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ fontSize: "1.1rem", mb: 4 }}>
                          {role === "staff" ? "Add a new avatar to get started!" : "Check back later for updates."}
                        </Typography>
                        {role === "staff" && (
                          <StyledButton variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()} sx={{ background: "linear-gradient(90deg, #2c3e50, #3498db)" }}>
                            Add Avatar
                          </StyledButton>
                        )}
                      </Box>
                    </Fade>
                  </StyledTableCell>
                </TableRow>
              ) : (
                filteredAvatars.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((avatar, index) => (
                  <Fade in={true} timeout={300 + index * 100} key={avatar.id}>
                    <TableRow
                      sx={{
                        backgroundColor: index % 2 === 0 ? "#fafafa" : "#fff",
                        "&:hover": { backgroundColor: "#e3f2fd", transition: "background-color 0.3s ease" },
                        height: "90px",
                      }}
                    >
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
                      <StyledTableCell align="center">
                        <Tooltip title="Select">
                          <StyledButton
                            variant="outlined"
                            onClick={() => handleSelectAvatar(avatar)}
                            disabled={avatar.isDefault || loading}
                            sx={{ mr: 3, fontSize: "1rem", padding: "8px 24px", borderColor: "#3498db", color: "#3498db", "&:hover": { borderColor: "#2980b9", color: "#2980b9" } }}
                          >
                            Select
                          </StyledButton>
                        </Tooltip>
                        {role === "staff" && (
                          <>
                            <Tooltip title="Edit">
                              <IconButton
                                onClick={() => handleOpenDialog(avatar)}
                                disabled={avatar.isDefault || loading}
                                sx={{ color: "#1976d2", mr: 2, "&:hover": { color: "#1565c0" } }}
                              >
                                <Edit fontSize="medium" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton
                                onClick={() => handleDelete(avatar.id)}
                                disabled={avatar.isDefault || loading}
                                sx={{ color: "#d32f2f", "&:hover": { color: "#b71c1c" } }}
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
          <TablePagination
            component="div"
            count={filteredAvatars.length}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[5]}
            sx={{ "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": { fontSize: "1.1rem" } }}
          />
        </StyledTableContainer>
      )}

      {/* Dialog for Add/Edit */}
      {role === "staff" && (
        <Dialog open={open} onClose={handleCloseDialog} maxWidth="sm" fullWidth sx={{ "& .MuiDialog-paper": { borderRadius: "16px" } }}>
          <DialogTitle sx={{ background: "linear-gradient(90deg, #2c3e50, #3498db)", color: "#fff", fontSize: "1.8rem", fontWeight: 600, py: 2 }}>
            {editingAvatar?.id ? "Edit Avatar" : "Add New Avatar"}
          </DialogTitle>
          <DialogContent sx={{ pt: 4 }}>
            <TextField
              label="Avatar Name"
              fullWidth
              value={editingAvatar?.name || ""}
              onChange={(e) => setEditingAvatar({ ...editingAvatar, name: e.target.value })}
              sx={{ mb: 4, "& .MuiInputBase-root": { fontSize: "1.1rem" } }}
              required
              error={!editingAvatar?.name}
              helperText={!editingAvatar?.name ? "Name is required" : ""}
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
            <StyledButton onClick={handleCloseDialog} variant="outlined" disabled={loading} sx={{ borderColor: "#3498db", color: "#3498db" }}>
              Cancel
            </StyledButton>
            <StyledButton onClick={handleSaveAvatar} variant="contained" disabled={loading} sx={{ background: "linear-gradient(90deg, #2c3e50, #3498db)" }}>
              {loading ? <CircularProgress size={24} color="inherit" /> : "Save"}
            </StyledButton>
          </DialogActions>
        </Dialog>
      )}

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity={snackbar.severity} sx={{ width: "100%", fontSize: "1.1rem" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AvatarManagement;