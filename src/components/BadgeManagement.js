import React, { useEffect, useState } from 'react';
import axios from 'axios';
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
  InputLabel,
  FormControl,
  TablePagination,
  CircularProgress,
  Snackbar,
  Alert,
  Fade,
  Tooltip,
  Box, // Added missing import
  Typography, // Added missing import
} from '@mui/material';
import { styled } from '@mui/system';
import { BASE_API } from '../constant';
import ImagePlaceholder from "../assets/placeholder.png";
import { getUserRoleFromAPI } from "../utils/roleUtils";
import { useNavigate } from 'react-router-dom';

const API_URL = BASE_API + "/badges";

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
  padding: "20px 30px",
  fontSize: "1.1rem",
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

const BadgeManagement = () => {
  const navigate = useNavigate();
  const [badges, setBadges] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingBadge, setEditingBadge] = useState(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(5);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  useEffect(() => {
    getUserRoleFromAPI().then(setRole);
  }, []);

  useEffect(() => {
    if (role === 'staff') fetchBadges();
  }, [role]);

  const getAuthToken = () => localStorage.getItem("token") || "";

  const fetchBadges = async () => {
    setLoading(true);
    try {
      const token = getAuthToken();
      if (!token) throw new Error("Authorization token missing! Redirecting to login...");
      const res = await axios.get(API_URL, { headers: { Authorization: `Bearer ${token}` } });
      setBadges(res.data.data.items || []);
      setSnackbar({ open: true, message: "Badges loaded successfully!", severity: "success" });
    } catch (error) {
      setSnackbar({ open: true, message: error.message, severity: "error" });
      setTimeout(() => navigate("/login"), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (badge = null) => {
    setEditingBadge(badge || { name: '', description: '', type: 'Copper', conditionalPoint: 0, imageUrl: '' });
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setEditingBadge(null);
  };

  const handleSaveBadge = async () => {
    if (!editingBadge.name) {
      setSnackbar({ open: true, message: "Name is required!", severity: "warning" });
      return;
    }
    if (editingBadge.conditionalPoint === undefined || editingBadge.conditionalPoint < 0) {
      setSnackbar({ open: true, message: "Conditional points must be a non-negative number!", severity: "warning" });
      return;
    }
    if (!editingBadge.id && !editingBadge.imageUrl) {
      setSnackbar({ open: true, message: "Image URL is required for a new badge!", severity: "warning" });
      return;
    }

    setLoading(true);
    try {
      const token = getAuthToken();
      if (!token) throw new Error("Authorization token missing! Redirecting to login...");
      const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
      const data = {
        name: editingBadge.name,
        description: editingBadge.description || "",
        type: editingBadge.type,
        conditionalPoint: Number(editingBadge.conditionalPoint),
        imageUrl: editingBadge.imageUrl || "",
      };

      if (editingBadge.id) {
        await axios.put(`${API_URL}/${editingBadge.id}`, data, { headers });
      } else {
        await axios.post(API_URL, data, { headers });
      }

      await fetchBadges();
      handleCloseDialog();
      setSnackbar({ open: true, message: "Badge saved successfully!", severity: "success" });
    } catch (error) {
      setSnackbar({ open: true, message: error.response?.data?.message || error.message, severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      const token = getAuthToken();
      if (!token) throw new Error("Authorization token missing! Redirecting to login...");
      await axios.delete(`${API_URL}/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      await fetchBadges();
      setSnackbar({ open: true, message: "Badge deleted successfully!", severity: "success" });
    } catch (error) {
      setSnackbar({ open: true, message: error.response?.data?.message || error.message, severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const filteredBadges = badges.filter(badge =>
    badge.name.toLowerCase().includes(search.toLowerCase()) &&
    (!typeFilter || badge.type === typeFilter)
  );

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const paginatedBadges = filteredBadges.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  if (role === null) return (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <CircularProgress size={50} />
    </Box>
  );
  if (role !== 'staff') return (
    <Typography variant="h6" align="center" color="error" sx={{ mt: 4 }}>
      You do not have permission to manage badges.
    </Typography>
  );

  return (
    <Box sx={{ padding: "40px", backgroundColor: "#f4f6f9", minHeight: "100vh" }}>
      {/* Header Section */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, color: "#2c3e50", fontSize: "2rem" }}>
          Badge Management
        </Typography>
        <StyledButton variant="contained" color="primary" onClick={() => handleOpenDialog()}>
          Add Badge
        </StyledButton>
      </Box>

      {/* Search and Filter Section */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4, maxWidth: "1200px", margin: "0 auto" }}>
        <Box sx={{ display: "flex", gap: 3, alignItems: "center" }}>
          <TextField
            label="Search by Name"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            variant="outlined"
            sx={{ width: "400px", backgroundColor: "#fff", borderRadius: "8px", "& .MuiInputBase-root": { fontSize: "1.1rem" } }}
          />
          <FormControl sx={{ width: 200 }}>
            <InputLabel sx={{ fontSize: "1.1rem" }}>Filter by Type</InputLabel>
            <Select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPage(0);
              }}
              label="Filter by Type"
              sx={{ backgroundColor: "#fff", borderRadius: "8px", "& .MuiSelect-select": { fontSize: "1.1rem" } }}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="Copper">Copper</MenuItem>
              <MenuItem value="Silver">Silver</MenuItem>
              <MenuItem value="Gold">Gold</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Typography variant="body1" color="text.secondary" sx={{ fontSize: "1rem" }}>
          Showing {filteredBadges.length} of {badges.length} badges
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
                <StyledTableCell sx={{ color: "#fff", fontWeight: 600, width: "15%" }}>Image</StyledTableCell>
                <StyledTableCell sx={{ color: "#fff", fontWeight: 600, width: "25%" }}>Name</StyledTableCell>
                <StyledTableCell sx={{ color: "#fff", fontWeight: 600, width: "15%" }}>Type</StyledTableCell>
                <StyledTableCell sx={{ color: "#fff", fontWeight: 600, width: "20%" }}>Conditional Points</StyledTableCell>
                <StyledTableCell sx={{ color: "#fff", fontWeight: 600, width: "25%", textAlign: "center" }}>Actions</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedBadges.length === 0 ? (
                <TableRow>
                  <StyledTableCell colSpan={5} align="center">
                    <Fade in={true}>
                      <Box sx={{ py: 6 }}>
                        <Typography variant="body1" color="text.secondary" sx={{ fontSize: "1.2rem" }}>
                          No badges available. Start by adding one!
                        </Typography>
                        <StyledButton
                          variant="contained"
                          color="primary"
                          onClick={() => handleOpenDialog()}
                          sx={{ mt: 3 }}
                        >
                          Add Badge
                        </StyledButton>
                      </Box>
                    </Fade>
                  </StyledTableCell>
                </TableRow>
              ) : (
                paginatedBadges.map((badge, index) => (
                  <Fade in={true} timeout={300 + index * 100} key={badge.id}>
                    <TableRow sx={{ "&:hover": { backgroundColor: "#ecf0f1" }, height: "90px" }}>
                      <StyledTableCell>
                        <img
                          src={badge.imageUrl || ImagePlaceholder}
                          width={70}
                          height={70}
                          alt="badge"
                          style={{ borderRadius: "8px", objectFit: "cover" }}
                        />
                      </StyledTableCell>
                      <StyledTableCell sx={{ fontSize: "1.2rem" }}>{badge.name}</StyledTableCell>
                      <StyledTableCell>{badge.type}</StyledTableCell>
                      <StyledTableCell>{badge.conditionalPoint}</StyledTableCell>
                      <StyledTableCell sx={{ textAlign: "center" }}>
                        <Tooltip title="Edit">
                          <StyledButton
                            variant="outlined"
                            color="primary"
                            onClick={() => handleOpenDialog(badge)}
                            disabled={loading}
                            sx={{ mr: 3 }}
                          >
                            Edit
                          </StyledButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <StyledButton
                            variant="outlined"
                            color="secondary"
                            onClick={() => handleDelete(badge.id)}
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
          <TablePagination
            component="div"
            count={filteredBadges.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[5]}
            sx={{ "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": { fontSize: "1rem" } }}
          />
        </StyledTableContainer>
      )}

      {/* Dialog for Add/Edit */}
      <Dialog open={open} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ backgroundColor: "#3498db", color: "#fff", fontWeight: 600, fontSize: "1.5rem", py: 2 }}>
          {editingBadge?.id ? 'Edit Badge' : 'Add Badge'}
        </DialogTitle>
        <DialogContent sx={{ pt: 4 }}>
          <TextField
            label="Name"
            fullWidth
            margin="dense"
            value={editingBadge?.name || ''}
            onChange={(e) => setEditingBadge({ ...editingBadge, name: e.target.value })}
            required
            error={!editingBadge?.name}
            helperText={!editingBadge?.name ? "Name is required" : ""}
            sx={{ mb: 3, "& .MuiInputBase-root": { fontSize: "1.1rem" } }}
          />
          <TextField
            label="Description"
            fullWidth
            margin="dense"
            value={editingBadge?.description || ''}
            onChange={(e) => setEditingBadge({ ...editingBadge, description: e.target.value })}
            sx={{ mb: 3, "& .MuiInputBase-root": { fontSize: "1.1rem" } }}
          />
          <FormControl fullWidth margin="dense" sx={{ mb: 3 }}>
            <InputLabel sx={{ fontSize: "1.1rem" }}>Type</InputLabel>
            <Select
              value={editingBadge?.type || 'Copper'}
              onChange={(e) => setEditingBadge({ ...editingBadge, type: e.target.value })}
              label="Type"
              sx={{ "& .MuiSelect-select": { fontSize: "1.1rem", py: 1.5 } }}
            >
              <MenuItem value="Copper">Copper</MenuItem>
              <MenuItem value="Silver">Silver</MenuItem>
              <MenuItem value="Gold">Gold</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Conditional Points"
            type="number"
            fullWidth
            margin="dense"
            value={editingBadge?.conditionalPoint || 0}
            onChange={(e) => setEditingBadge({ ...editingBadge, conditionalPoint: Number(e.target.value) })}
            required
            error={editingBadge?.conditionalPoint === undefined || editingBadge?.conditionalPoint < 0}
            helperText={editingBadge?.conditionalPoint === undefined || editingBadge?.conditionalPoint < 0 ? "Conditional points must be a non-negative number" : ""}
            sx={{ mb: 3, "& .MuiInputBase-root": { fontSize: "1.1rem" } }}
          />
          <TextField
            label="Image URL"
            fullWidth
            margin="dense"
            value={editingBadge?.imageUrl || ''}
            onChange={(e) => setEditingBadge({ ...editingBadge, imageUrl: e.target.value })}
            required={!editingBadge?.id}
            error={!editingBadge?.id && !editingBadge?.imageUrl}
            helperText={!editingBadge?.id && !editingBadge?.imageUrl ? "Image URL is required for a new badge" : ""}
            sx={{ mb: 3, "& .MuiInputBase-root": { fontSize: "1.1rem" } }}
          />
          {editingBadge?.imageUrl && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body1" sx={{ mb: 1, fontSize: "1.1rem" }}>Preview Image:</Typography>
              <img
                src={editingBadge.imageUrl}
                alt="Badge preview"
                style={{ width: '120px', borderRadius: "8px" }}
                onError={(e) => (e.target.src = ImagePlaceholder)}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <StyledButton onClick={handleCloseDialog} color="inherit" variant="outlined" disabled={loading}>
            Cancel
          </StyledButton>
          <StyledButton onClick={handleSaveBadge} variant="contained" color="primary" disabled={loading}>
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

export default BadgeManagement;