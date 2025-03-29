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
  Box,
  Typography,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { styled } from '@mui/system';
import { BASE_API } from '../constant';
import ImagePlaceholder from "../assets/placeholder.png";
import { getUserRoleFromAPI } from "../utils/roleUtils";
import { useNavigate } from 'react-router-dom';
import { AddCircle, Refresh, Search, Edit, Delete } from '@mui/icons-material';

const API_URL = BASE_API + "/badges";

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

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  width: "200px",
  backgroundColor: "#fff",
  borderRadius: "30px",
  boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
  "& .MuiInputBase-root": {
    fontSize: "1.1rem",
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
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "#f5f7fa" }}>
      <CircularProgress size={80} thickness={5} sx={{ color: "#3498db" }} />
    </Box>
  );

  if (role !== 'staff') return (
    <Box sx={{ textAlign: "center", mt: 8, p: 4, background: "#fff", borderRadius: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", maxWidth: "600px", mx: "auto" }}>
      <Typography variant="h5" color="error" sx={{ fontWeight: 600 }}>
        Access Denied
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
        You do not have permission to manage badges.
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
              Badge Management
            </Typography>
            <Typography variant="subtitle1" sx={{ color: "#7f8c8d", mt: 1 }}>
              Manage all badges ({filteredBadges.length} badges)
            </Typography>
          </Box>
          <StyledButton
            variant="contained"
            startIcon={<AddCircle />}
            onClick={() => handleOpenDialog()}
            sx={{ background: "linear-gradient(90deg, #2c3e50, #3498db)" }}
          >
            Add Badge
          </StyledButton>
        </Box>

        {/* Search and Filter Section */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4, flexWrap: "wrap", gap: 2 }}>
          <Box sx={{ display: "flex", gap: 3, alignItems: "center", flexWrap: "wrap" }}>
            <StyledTextField
              label="Search by Name"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: "#3498db", fontSize: "1.8rem" }} />
                  </InputAdornment>
                ),
              }}
            />
            <StyledFormControl variant="outlined">
              <InputLabel>Filter by Type</InputLabel>
              <Select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setPage(0);
                }}
                label="Filter by Type"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="Copper">Copper</MenuItem>
                <MenuItem value="Silver">Silver</MenuItem>
                <MenuItem value="Gold">Gold</MenuItem>
              </Select>
            </StyledFormControl>
            <StyledButton
              variant="outlined"
              startIcon={<Refresh />}
              onClick={fetchBadges}
              sx={{ borderColor: "#3498db", color: "#3498db" }}
            >
              Refresh
            </StyledButton>
          </Box>
          <Typography variant="body1" color="text.secondary" sx={{ fontSize: "1rem" }}>
            Showing {filteredBadges.length} of {badges.length} badges
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
                  <StyledTableHeadCell sx={{ width: "15%" }}>Image</StyledTableHeadCell>
                  <StyledTableHeadCell sx={{ width: "25%" }}>Name</StyledTableHeadCell>
                  <StyledTableHeadCell sx={{ width: "15%" }}>Type</StyledTableHeadCell>
                  <StyledTableHeadCell sx={{ width: "20%" }}>Conditional Points</StyledTableHeadCell>
                  <StyledTableHeadCell sx={{ width: "25%", textAlign: "center" }}>Actions</StyledTableHeadCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedBadges.length === 0 ? (
                  <TableRow>
                    <StyledTableCell colSpan={5} align="center">
                      <Fade in={true}>
                        <Box sx={{ py: 6 }}>
                          <Typography variant="h6" color="text.secondary" sx={{ fontSize: "1.4rem", mb: 2 }}>
                            No Badges Available
                          </Typography>
                          <Typography variant="body1" color="text.secondary" sx={{ fontSize: "1.1rem", mb: 4 }}>
                            Start by adding a new badge!
                          </Typography>
                          <StyledButton
                            variant="contained"
                            startIcon={<AddCircle />}
                            onClick={() => handleOpenDialog()}
                            sx={{ background: "linear-gradient(90deg, #2c3e50, #3498db)" }}
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
                      <TableRow
                        sx={{
                          backgroundColor: index % 2 === 0 ? "#fafafa" : "#fff",
                          "&:hover": { backgroundColor: "#e3f2fd", transition: "background-color 0.3s ease" },
                          height: "90px",
                        }}
                      >
                        <StyledTableCell>
                          <img
                            src={badge.imageUrl || ImagePlaceholder}
                            width={70}
                            height={70}
                            alt="badge"
                            style={{ borderRadius: "8px", objectFit: "cover", transition: "transform 0.3s ease" }}
                            onMouseEnter={(e) => (e.target.style.transform = "scale(1.1)")}
                            onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
                          />
                        </StyledTableCell>
                        <StyledTableCell sx={{ fontSize: "1.2rem", fontWeight: 500 }}>{badge.name}</StyledTableCell>
                        <StyledTableCell>{badge.type}</StyledTableCell>
                        <StyledTableCell>{badge.conditionalPoint}</StyledTableCell>
                        <StyledTableCell sx={{ textAlign: "center" }}>
                          <Tooltip title="Edit">
                            <IconButton
                              onClick={() => handleOpenDialog(badge)}
                              disabled={loading}
                              sx={{ color: "#1976d2", "&:hover": { color: "#1565c0" } }}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              onClick={() => handleDelete(badge.id)}
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
            {filteredBadges.length > rowsPerPage && (
              <TablePagination
                component="div"
                count={filteredBadges.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                rowsPerPageOptions={[]}
                sx={{
                  "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": { fontSize: "1.1rem" },
                  "& .MuiTablePagination-toolbar": { backgroundColor: "#fafafa", borderTop: "1px solid rgba(224, 224, 224, 0.7)" },
                  "& .MuiPaginationItem-root": {
                    fontSize: "1.1rem",
                    "&:hover": { backgroundColor: "#e3f2fd" },
                  },
                  "& .Mui-selected": {
                    backgroundColor: "#3498db !important",
                    color: "#fff",
                  },
                }}
              />
            )}
          </StyledTableContainer>
        )}

        {/* Dialog for Add/Edit */}
        <Dialog open={open} onClose={handleCloseDialog} maxWidth="sm" fullWidth sx={{ "& .MuiDialog-paper": { borderRadius: "16px" } }}>
          <DialogTitle sx={{ background: "linear-gradient(90deg, #2c3e50, #3498db)", color: "#fff", fontSize: "1.8rem", fontWeight: 600, py: 2 }}>
            {editingBadge?.id ? 'Edit Badge' : 'Add New Badge'}
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
              multiline
              rows={3}
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
                <Typography variant="body1" sx={{ mb: 1, fontSize: "1.1rem", color: "#2c3e50" }}>
                  Preview Image:
                </Typography>
                <img
                  src={editingBadge.imageUrl}
                  alt="Badge preview"
                  style={{ width: '120px', borderRadius: "8px", transition: "transform 0.3s ease" }}
                  onError={(e) => (e.target.src = ImagePlaceholder)}
                  onMouseEnter={(e) => (e.target.style.transform = "scale(1.1)")}
                  onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
                />
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 3, gap: 2 }}>
            <StyledButton onClick={handleCloseDialog} color="inherit" variant="outlined" disabled={loading}>
              Cancel
            </StyledButton>
            <StyledButton onClick={handleSaveBadge} variant="contained" sx={{ background: "linear-gradient(90deg, #2c3e50, #3498db)" }} disabled={loading}>
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

export default BadgeManagement;