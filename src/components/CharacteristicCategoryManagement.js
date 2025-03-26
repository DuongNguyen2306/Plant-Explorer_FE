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
} from "@mui/material";
import { styled } from "@mui/system";
import { BASE_API } from "../constant";
import { getUserRoleFromAPI } from "../utils/roleUtils";

const API_URL = BASE_API + "/characteristic-category";

// Styled components
const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: "12px",
  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
  background: "linear-gradient(145deg, #ffffff, #f9fbfc)",
  width: "100%",
  maxWidth: "1200px", // Larger table width
  margin: "0 auto",
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  padding: "20px 30px", // Increased padding for more space
  fontSize: "1.1rem", // Larger font size
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: "25px",
  padding: "8px 20px",
  textTransform: "none",
  fontWeight: 500,
  fontSize: "1rem",
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 5px 15px rgba(0, 0, 0, 0.1)",
  },
}));

const CharacteristicCategoryManagement = () => {
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
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setCategories(data || []);
      setSnackbar({ open: true, message: "Categories loaded successfully!", severity: "success" });
    } catch (error) {
      console.error("Error fetching characteristic categories:", error.response?.data || error);
      setSnackbar({
        open: true,
        message: "Failed to fetch characteristic categories: " + (error.response?.data?.message || error.message),
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
      const payload = {
        name: editingCategory.name.trim(),
      };
      if (editingCategory.id) {
        await axios.put(`${API_URL}/${editingCategory.id}`, payload, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setSnackbar({ open: true, message: "Characteristic category updated successfully!", severity: "success" });
      } else {
        await axios.post(API_URL, payload, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setSnackbar({ open: true, message: "Characteristic category created successfully!", severity: "success" });
      }
      fetchCategories();
      setOpen(false);
      setEditingCategory({ id: null, name: "" });
    } catch (error) {
      console.error("Error saving characteristic category:", error.response?.data || error);
      setSnackbar({
        open: true,
        message: "Failed to save characteristic category: " + (error.response?.data?.message || error.message),
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (id) => {
    if (window.confirm("Are you sure you want to delete this characteristic category?")) {
      setLoading(true);
      try {
        await axios.delete(`${API_URL}/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        fetchCategories();
        setSnackbar({ open: true, message: "Characteristic category deleted successfully!", severity: "success" });
      } catch (error) {
        console.error("Error deleting characteristic category:", error.response?.data || error);
        setSnackbar({
          open: true,
          message: "Failed to delete characteristic category: " + (error.response?.data?.message || error.message),
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

  if (role === null) return (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <CircularProgress size={50} />
    </Box>
  );
  if (role !== "staff") return (
    <Typography variant="h6" align="center" color="error" sx={{ mt: 4 }}>
      You do not have permission to manage characteristic categories.
    </Typography>
  );

  return (
    <Box sx={{ padding: "40px", backgroundColor: "#f4f6f9", minHeight: "100vh" }}>
      {/* Header Section */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, color: "#2c3e50", fontSize: "2rem" }}>
          Characteristic Category Management
        </Typography>
        <Box sx={{ display: "flex", gap: 3 }}>
          <StyledButton variant="contained" color="success" onClick={() => handleOpenDialog()}>
            Add Category
          </StyledButton>
          <StyledButton variant="outlined" color="primary" onClick={fetchCategories}>
            Refresh
          </StyledButton>
        </Box>
      </Box>

      {/* Search Section */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4, maxWidth: "1200px", margin: "0 auto" }}>
        <TextField
          label="Search by Name"
          variant="outlined"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: "400px", backgroundColor: "#fff", borderRadius: "8px", "& .MuiInputBase-root": { fontSize: "1.1rem" } }}
        />
        <Typography variant="body1" color="text.secondary" sx={{ fontSize: "1rem" }}>
          Showing {categories.filter((c) => c.name.toLowerCase().includes(search.toLowerCase())).length} of {categories.length} categories
        </Typography>
      </Box>

      {/* Loading State */}
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
          <CircularProgress size={50} />
        </Box>
      )}

      {/* Table Section */}
      {!loading && (
        <StyledTableContainer component={Paper}>
          <Table>
            <TableHead sx={{ backgroundColor: "#3498db" }}>
              <TableRow>
                <StyledTableCell sx={{ color: "#fff", fontWeight: 600, width: "70%" }}>Name</StyledTableCell>
                <StyledTableCell sx={{ color: "#fff", fontWeight: 600, width: "30%", textAlign: "center" }}>Actions</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {categories.filter((c) => c.name.toLowerCase().includes(search.toLowerCase())).length === 0 ? (
                <TableRow>
                  <StyledTableCell colSpan={2} align="center">
                    <Fade in={true}>
                      <Box sx={{ py: 6 }}>
                        <Typography variant="body1" color="text.secondary" sx={{ fontSize: "1.2rem" }}>
                          No categories available. Start by adding one!
                        </Typography>
                        <StyledButton
                          variant="contained"
                          color="success"
                          onClick={() => handleOpenDialog()}
                          sx={{ mt: 3 }}
                        >
                          Add Category
                        </StyledButton>
                      </Box>
                    </Fade>
                  </StyledTableCell>
                </TableRow>
              ) : (
                categories
                  .filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
                  .map((cat, index) => (
                    <Fade in={true} timeout={300 + index * 100} key={cat.id}>
                      <TableRow sx={{ "&:hover": { backgroundColor: "#ecf0f1" }, height: "90px" }}>
                        <StyledTableCell sx={{ fontSize: "1.2rem" }}>{cat.name}</StyledTableCell>
                        <StyledTableCell sx={{ textAlign: "center" }}>
                          <Tooltip title="Edit">
                            <StyledButton
                              variant="outlined"
                              color="primary"
                              onClick={() => handleOpenDialog(cat)}
                              sx={{ mr: 3 }}
                              disabled={loading}
                            >
                              Edit
                            </StyledButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <StyledButton
                              variant="outlined"
                              color="error"
                              onClick={() => deleteCategory(cat.id)}
                              disabled={loading}
                            >
                              Delete
                            </StyledButton>
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
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ backgroundColor: "#3498db", color: "#fff", fontWeight: 600, fontSize: "1.5rem", py: 2 }}>
          {editingCategory.id ? "Edit Category" : "Add Category"}
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
          <StyledButton onClick={saveCategory} variant="contained" color="primary" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : "Save"}
          </StyledButton>
        </DialogActions>
      </Dialog>

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

export default CharacteristicCategoryManagement;