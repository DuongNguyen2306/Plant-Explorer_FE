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
  TablePagination,
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  CircularProgress,
  Fade,
  Tooltip,
  Snackbar,
  Alert,
  InputAdornment,
} from "@mui/material";
import { styled } from "@mui/system";
import { Edit, Delete, Search, Add, Refresh, Visibility } from "@mui/icons-material";
import { BASE_API } from "../constant";
import { useNavigate } from "react-router-dom";
import { getUserRoleFromAPI } from "../utils/roleUtils";
import debounce from "lodash/debounce";

const API_URL = BASE_API + "/plants";
const SEARCH_API_URL = BASE_API + "/search";

// Styled Components
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

const PlantManagement = () => {
  const [plants, setPlants] = useState([]);
  const [filteredPlants, setFilteredPlants] = useState([]); // For search filtering
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(5); // Changed to 5 plants per page
  const [role, setRole] = useState(null);
  const [open, setOpen] = useState(false);
  const [editingPlant, setEditingPlant] = useState(null);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const navigate = useNavigate();

  useEffect(() => {
    getUserRoleFromAPI()
      .then(setRole)
      .catch((error) => {
        console.error("Error fetching role:", error);
        setRole(null);
        setSnackbar({ open: true, message: "Failed to fetch role", severity: "error" });
      });
  }, []);

  const fetchPlants = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setPlants(response.data || []);
      setFilteredPlants(response.data || []); // Initialize filtered plants
      setSnackbar({ open: true, message: "Plants loaded successfully!", severity: "success" });
    } catch (error) {
      console.error("Error fetching plants:", error);
      setSnackbar({ open: true, message: "Failed to fetch plants", severity: "error" });
      setPlants([]);
      setFilteredPlants([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Search filter logic (by plant name, case-insensitive)
  const handleSearch = useCallback(
    debounce((query) => {
      const filtered = plants.filter((plant) =>
        plant.name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredPlants(filtered);
      setPage(0); // Reset to first page on search
    }, 500),
    [plants]
  );

  useEffect(() => {
    if (role === "staff" || role === "children") {
      fetchPlants();
    }
  }, [role, fetchPlants]);

  useEffect(() => {
    handleSearch(search);
  }, [search, handleSearch]);

  const handleOpenDialog = (plant = null) => {
    setEditingPlant(plant || { name: "", scientificName: "", description: "" });
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setEditingPlant(null);
  };

  const handleSavePlant = async () => {
    if (!editingPlant.name || !editingPlant.scientificName) {
      setSnackbar({ open: true, message: "Name and Scientific Name are required!", severity: "warning" });
      return;
    }
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem("token")}`, "Content-Type": "application/json" };
      const data = {
        name: editingPlant.name.trim(),
        scientificName: editingPlant.scientificName.trim(),
        description: editingPlant.description || "",
      };
      editingPlant.id
        ? await axios.put(`${API_URL}/${editingPlant.id}`, data, { headers })
        : await axios.post(API_URL, data, { headers });
      setSnackbar({ open: true, message: `Plant ${editingPlant.id ? "updated" : "created"} successfully!`, severity: "success" });
      await fetchPlants();
      handleCloseDialog();
    } catch (error) {
      setSnackbar({ open: true, message: "Failed to save plant", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePlant = async (id) => {
    if (window.confirm("Are you sure you want to delete this plant?")) {
      setLoading(true);
      try {
        await axios.delete(`${API_URL}/${id}`, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
        await fetchPlants();
        setSnackbar({ open: true, message: "Plant deleted successfully!", severity: "success" });
      } catch (error) {
        setSnackbar({ open: true, message: "Failed to delete plant", severity: "error" });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleViewDetail = (plantId) => navigate(`/plant/${plantId}/detail`);

  if (role === null)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "#f5f7fa" }}>
        <CircularProgress size={80} thickness={5} sx={{ color: "#3498db" }} />
      </Box>
    );

  if (!["staff", "children"].includes(role))
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
            Plant Explorer
          </Typography>
          <Typography variant="subtitle1" sx={{ color: "#7f8c8d", fontSize: { xs: "1rem", md: "1.2rem" }, mt: 1 }}>
            Manage your plant collection ({filteredPlants.length} plants)
          </Typography>
        </Box>
        {role === "staff" && (
          <Box sx={{ display: "flex", gap: 2 }}>
            <StyledButton variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()} sx={{ background: "linear-gradient(90deg, #2c3e50, #3498db)" }}>
              Add New Plant
            </StyledButton>
            <StyledButton variant="outlined" startIcon={<Refresh />} onClick={() => fetchPlants()} sx={{ borderColor: "#3498db", color: "#3498db" }}>
              Refresh
            </StyledButton>
          </Box>
        )}
      </Box>

      {/* Search Section */}
      <Box sx={{ mb: 4, display: "flex", justifyContent: "center" }}>
        <StyledSearchField
          label="Search Plants by Name"
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
      </Box>

      {/* Loading State */}
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 8 }}>
          <CircularProgress size={80} thickness={5} sx={{ color: "#3498db" }} />
        </Box>
      )}

      {/* Table Section */}
      {!loading && (
        <StyledTableContainer component={Paper}>
          <Table sx={{ minWidth: "650px" }}>
            <TableHead>
              <TableRow>
                <StyledTableHeadCell sx={{ width: { xs: "35%", md: "40%" }, minWidth: "200px" }}>Name</StyledTableHeadCell>
                <StyledTableHeadCell sx={{ width: { xs: "35%", md: "40%" }, minWidth: "200px" }}>Scientific Name</StyledTableHeadCell>
                <StyledTableHeadCell align="center" sx={{ width: { xs: "30%", md: "20%" }, minWidth: "150px" }}>
                  Actions
                </StyledTableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPlants.length === 0 ? (
                <TableRow>
                  <StyledTableCell colSpan={3} align="center">
                    <Fade in={true}>
                      <Box sx={{ py: 6 }}>
                        <Typography variant="h6" color="text.secondary" sx={{ fontSize: "1.4rem", mb: 2 }}>
                          No plants found
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ fontSize: "1.1rem", mb: 4 }}>
                          {role === "staff" ? "Add a new plant to get started!" : "Check back later for updates."}
                        </Typography>
                        {role === "staff" && (
                          <StyledButton variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()} sx={{ background: "linear-gradient(90deg, #2c3e50, #3498db)" }}>
                            Add Plant
                          </StyledButton>
                        )}
                      </Box>
                    </Fade>
                  </StyledTableCell>
                </TableRow>
              ) : (
                filteredPlants.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((plant, index) => (
                  <Fade in={true} timeout={300 + index * 100} key={plant.id}>
                    <TableRow
                      sx={{
                        backgroundColor: index % 2 === 0 ? "#fafafa" : "#fff",
                        "&:hover": { backgroundColor: "#e3f2fd", transition: "background-color 0.3s ease" },
                      }}
                    >
                      <StyledTableCell>{plant.name}</StyledTableCell>
                      <StyledTableCell>{plant.scientificName}</StyledTableCell>
                      <StyledTableCell align="center">
                        <Tooltip title="View Details">
                          <IconButton color="info" onClick={() => handleViewDetail(plant.id)} sx={{ "&:hover": { color: "#0288d1" } }}>
                            <Visibility sx={{ fontSize: "1.8rem" }} />
                          </IconButton>
                        </Tooltip>
                        {role === "staff" && (
                          <>
                            <Tooltip title="Edit">
                              <IconButton
                                color="primary"
                                onClick={() => handleOpenDialog(plant)}
                                sx={{ "&:hover": { color: "#3498db" } }}
                                disabled={loading}
                              >
                                <Edit sx={{ fontSize: "1.8rem" }} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton
                                color="error"
                                onClick={() => handleDeletePlant(plant.id)}
                                sx={{ "&:hover": { color: "#d32f2f" } }}
                                disabled={loading}
                              >
                                <Delete sx={{ fontSize: "1.8rem" }} />
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
            count={filteredPlants.length}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[5]} // Fixed to 5
            sx={{ "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": { fontSize: "1.1rem" } }}
          />
        </StyledTableContainer>
      )}

      {/* Dialog for Add/Edit Plant */}
      {role === "staff" && (
        <Dialog open={open} onClose={handleCloseDialog} maxWidth="sm" fullWidth sx={{ "& .MuiDialog-paper": { borderRadius: "16px" } }}>
          <DialogTitle sx={{ background: "linear-gradient(90deg, #2c3e50, #3498db)", color: "#fff", fontSize: "1.8rem", fontWeight: 600, py: 2 }}>
            {editingPlant?.id ? "Edit Plant" : "Add New Plant"}
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <TextField
              label="Name"
              fullWidth
              margin="normal"
              value={editingPlant?.name || ""}
              onChange={(e) => setEditingPlant({ ...editingPlant, name: e.target.value })}
              required
              error={!editingPlant?.name}
              helperText={!editingPlant?.name ? "Name is required" : ""}
              sx={{ "& .MuiInputBase-root": { fontSize: "1.1rem" } }}
            />
            <TextField
              label="Scientific Name"
              fullWidth
              margin="normal"
              value={editingPlant?.scientificName || ""}
              onChange={(e) => setEditingPlant({ ...editingPlant, scientificName: e.target.value })}
              required
              error={!editingPlant?.scientificName}
              helperText={!editingPlant?.scientificName ? "Scientific Name is required" : ""}
              sx={{ "& .MuiInputBase-root": { fontSize: "1.1rem" } }}
            />
            <TextField
              label="Description"
              fullWidth
              margin="normal"
              multiline
              rows={3}
              value={editingPlant?.description || ""}
              onChange={(e) => setEditingPlant({ ...editingPlant, description: e.target.value })}
              sx={{ "& .MuiInputBase-root": { fontSize: "1.1rem" } }}
            />
          </DialogContent>
          <DialogActions sx={{ p: 3, justifyContent: "space-between" }}>
            <StyledButton variant="outlined" onClick={handleCloseDialog} disabled={loading} sx={{ borderColor: "#3498db", color: "#3498db" }}>
              Cancel
            </StyledButton>
            <StyledButton variant="contained" onClick={handleSavePlant} disabled={loading} sx={{ background: "linear-gradient(90deg, #2c3e50, #3498db)" }}>
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

export default PlantManagement;