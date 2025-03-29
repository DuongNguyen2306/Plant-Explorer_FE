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
  Box,
  Typography,
  Fade,
  Tooltip,
  CircularProgress,
  Snackbar,
  Alert,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { styled } from "@mui/system";
import { BASE_API } from "../constant";
import { getUserRoleFromAPI } from "../utils/roleUtils";
import { AddCircle, Refresh, Search, Edit, Delete, Category } from "@mui/icons-material";

const API_URL = BASE_API + "/application-category";

// Styled Components
const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: "16px",
  boxShadow: "0 8px 30px rgba(0, 0, 0, 0.12)",
  background: "#fff",
  margin: "0 auto",
  overflowX: "auto",
  maxWidth: "100%",
  border: "1px solid rgba(224, 224, 224, 0.5)",
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  padding: "16px 24px",
  fontSize: "1.1rem",
  borderBottom: "1px solid rgba(224, 224, 224, 0.7)",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  color: "#2c3e50",
  "&:hover": {
    backgroundColor: "#f5f7fa",
    transition: "background-color 0.3s ease",
  },
}));

const StyledTableHeadCell = styled(TableCell)(({ theme }) => ({
  padding: "16px 24px",
  fontSize: "1.2rem",
  fontWeight: 700,
  color: "#fff",
  background: "linear-gradient(90deg, #2c3e50, #3498db)",
  borderBottom: "none",
  whiteSpace: "nowrap",
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: "20px",
  padding: "8px 20px",
  textTransform: "none",
  fontWeight: 600,
  fontSize: "1rem",
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 6px 15px rgba(0, 0, 0, 0.15)",
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  width: "400px",
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

const ApplicationCategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState(null);
  const [editingCategory, setEditingCategory] = useState({ id: null, name: "" });
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  useEffect(() => {
    getUserRoleFromAPI()
      .then(setRole)
      .catch((error) => {
        console.error("Error fetching role:", error);
        setRole(null);
        setSnackbar({ open: true, message: "Failed to fetch role: " + (error.message || "Unknown error"), severity: "error" });
      });
  }, []);

  useEffect(() => {
    if (role === "staff") fetchCategories();
  }, [role]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setCategories(data || []);
      setSnackbar({ open: true, message: "Categories loaded successfully!", severity: "success" });
    } catch (error) {
      console.error("Error fetching application categories:", error.response?.data || error);
      setSnackbar({
        open: true,
        message: "Failed to fetch application categories: " + (error.response?.data?.message || error.message),
        severity: "error",
      });
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const saveCategory = async () => {
    if (!editingCategory.name) {
      setSnackbar({ open: true, message: "Category name is required!", severity: "warning" });
      return;
    }

    setLoading(true);
    try {
      const payload = { name: editingCategory.name.trim() };
      if (editingCategory.id) {
        await axios.put(`${API_URL}/${editingCategory.id}`, payload, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setSnackbar({ open: true, message: "Application category updated successfully!", severity: "success" });
      } else {
        await axios.post(API_URL, payload, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setSnackbar({ open: true, message: "Application category created successfully!", severity: "success" });
      }
      fetchCategories();
      setOpen(false);
      setEditingCategory({ id: null, name: "" });
    } catch (error) {
      console.error("Error saving application category:", error.response?.data || error);
      setSnackbar({
        open: true,
        message: "Failed to save application category: " + (error.response?.data?.message || error.message),
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (id) => {
    if (window.confirm("Are you sure you want to delete this application category?")) {
      setLoading(true);
      try {
        await axios.delete(`${API_URL}/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        fetchCategories();
        setSnackbar({ open: true, message: "Application category deleted successfully!", severity: "success" });
      } catch (error) {
        console.error("Error deleting application category:", error.response?.data || error);
        setSnackbar({
          open: true,
          message: "Failed to delete application category: " + (error.response?.data?.message || error.message),
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleOpenDialog = (category = { id: null, name: "" }) => {
    setEditingCategory(category);
    setOpen(true);
  };

  const filteredCategories = categories.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));

  if (role === null) return (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "#f5f7fa" }}>
      <CircularProgress size={80} thickness={5} sx={{ color: "#3498db" }} />
    </Box>
  );

  if (role !== "staff") return (
    <Box sx={{ textAlign: "center", mt: 8, p: 4, background: "#fff", borderRadius: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", maxWidth: "600px", mx: "auto" }}>
      <Typography variant="h5" color="error" sx={{ fontWeight: 600 }}>
        Access Denied
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
        You do not have permission to manage application categories.
      </Typography>
    </Box>
  );

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #e8f0fe, #f5f7fa)",
        overflowX: "hidden",
        padding: "32px",
      }}
    >
      <Box
        sx={{
          py: 4,
          width: { xs: "100%", md: "100%" },
          maxWidth: "1200px",
          mx: "auto",
          px: { xs: 2, md: 3 },
        }}
      >
        {/* Header Section */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4, flexWrap: "wrap", gap: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: "#2c3e50", fontSize: { xs: "1.5rem", md: "2rem" } }}>
              Application Category Management
            </Typography>
            <Typography variant="subtitle1" sx={{ color: "#7f8c8d", mt: 1 }}>
              Manage all categories ({filteredCategories.length} categories)
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 2 }}>
            <StyledButton
              variant="contained"
              startIcon={<AddCircle />}
              onClick={() => handleOpenDialog()}
              sx={{ background: "linear-gradient(90deg, #2c3e50, #3498db)" }}
            >
              Add Category
            </StyledButton>
            <StyledButton
              variant="outlined"
              startIcon={<Refresh />}
              onClick={fetchCategories}
              sx={{ borderColor: "#3498db", color: "#3498db" }}
            >
              Refresh
            </StyledButton>
          </Box>
        </Box>

        {/* Search Section */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4, flexWrap: "wrap", gap: 2 }}>
          <StyledTextField
            label="Search by Name"
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
            Showing {filteredCategories.length} of {categories.length} categories
          </Typography>
        </Box>

        {/* Loading State */}
        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
            <CircularProgress size={80} thickness={5} sx={{ color: "#3498db" }} />
          </Box>
        )}

        {/* Table Section */}
        {!loading && (
          <StyledTableContainer component={Paper}>
            <Table sx={{ minWidth: "650px" }}>
              <TableHead>
                <TableRow>
                  <StyledTableHeadCell sx={{ width: "70%" }}>Category Name</StyledTableHeadCell>
                  <StyledTableHeadCell sx={{ width: "30%", textAlign: "center" }}>Actions</StyledTableHeadCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredCategories.length === 0 ? (
                  <TableRow>
                    <StyledTableCell colSpan={2} align="center">
                      <Fade in={true}>
                        <Box sx={{ py: 6 }}>
                          <Category sx={{ fontSize: "5rem", color: "#3498db", mb: 2 }} />
                          <Typography variant="h6" color="text.secondary" sx={{ fontSize: "1.4rem", mb: 2 }}>
                            No Categories Available
                          </Typography>
                          <Typography variant="body1" color="text.secondary" sx={{ fontSize: "1.1rem", mb: 4 }}>
                            Start by adding a new category!
                          </Typography>
                          <StyledButton
                            variant="contained"
                            startIcon={<AddCircle />}
                            onClick={() => handleOpenDialog()}
                            sx={{ background: "linear-gradient(90deg, #2c3e50, #3498db)" }}
                          >
                            Add Category
                          </StyledButton>
                        </Box>
                      </Fade>
                    </StyledTableCell>
                  </TableRow>
                ) : (
                  filteredCategories.map((cat, index) => (
                    <Fade in={true} timeout={300 + index * 100} key={cat.id}>
                      <TableRow
                        sx={{
                          backgroundColor: index % 2 === 0 ? "#fafafa" : "#fff",
                          "&:hover": { backgroundColor: "#e3f2fd", transition: "background-color 0.3s ease" },
                          height: "90px",
                        }}
                      >
                        <StyledTableCell sx={{ fontSize: "1.2rem", fontWeight: 500 }}>{cat.name}</StyledTableCell>
                        <StyledTableCell sx={{ textAlign: "center" }}>
                          <Tooltip title="Edit">
                            <IconButton
                              onClick={() => handleOpenDialog(cat)}
                              disabled={loading}
                              sx={{ color: "#1976d2", "&:hover": { color: "#1565c0" } }}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              onClick={() => deleteCategory(cat.id)}
                              disabled={loading}
                              sx={{ color: "#d32f2f", "&:hover": { color: "#b71c1c" } }}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Tooltip>
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
        <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth sx={{ "& .MuiDialog-paper": { borderRadius: "16px" } }}>
          <DialogTitle sx={{ background: "linear-gradient(90deg, #2c3e50, #3498db)", color: "#fff", fontSize: "1.8rem", fontWeight: 600, py: 2 }}>
            {editingCategory.id ? "Edit Application Category" : "Add New Application Category"}
          </DialogTitle>
          <DialogContent sx={{ pt: 4 }}>
            <TextField
              label="Category Name"
              fullWidth
              margin="dense"
              value={editingCategory.name}
              onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
              required
              error={!editingCategory.name}
              helperText={!editingCategory.name ? "Category name is required" : ""}
              sx={{ mb: 3, "& .MuiInputBase-root": { fontSize: "1.1rem" } }}
            />
          </DialogContent>
          <DialogActions sx={{ p: 3, gap: 2 }}>
            <StyledButton onClick={() => setOpen(false)} color="inherit" variant="outlined" disabled={loading}>
              Cancel
            </StyledButton>
            <StyledButton onClick={saveCategory} variant="contained" sx={{ background: "linear-gradient(90deg, #2c3e50, #3498db)" }} disabled={loading}>
              {loading ? <CircularProgress size={24} color="inherit" /> : "Save"}
            </StyledButton>
          </DialogActions>
        </Dialog>

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
    </Box>
  );
};

export default ApplicationCategoryManagement;