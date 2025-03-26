import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button,
  TextField, Dialog, DialogActions, DialogContent, DialogTitle, Select, MenuItem,
  InputLabel, FormControl, TablePagination, CircularProgress, Snackbar, Alert
} from '@mui/material';
import { BASE_API } from '../constant';
import ImagePlaceholder from "../assets/placeholder.png";
import { getUserRoleFromAPI } from "../utils/roleUtils";
import { useNavigate } from 'react-router-dom';

const API_URL = BASE_API + "/badges";

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

  const getAuthToken = () => {
    const token = localStorage.getItem("token");
    console.log("Retrieved token:", token);
    return token || "";
  };

  const fetchBadges = async () => {
    setLoading(true);
    try {
      const token = getAuthToken();
      if (!token) {
        setSnackbar({ open: true, message: "Authorization token is missing! Redirecting to login...", severity: "error" });
        setTimeout(() => navigate("/login"), 3000);
        return;
      }

      const res = await axios.get(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Fetched badges:", res.data.data.items);
      setBadges(res.data.data.items || []);
      setSnackbar({ open: true, message: "Badges loaded successfully!", severity: "success" });
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to fetch badges.";
      setSnackbar({ open: true, message: errorMessage, severity: "error" });
      console.error("Error fetching badges:", error);
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
    // Kiểm tra các trường bắt buộc
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
      if (!token) {
        setSnackbar({ open: true, message: "Authorization token is missing! Redirecting to login...", severity: "error" });
        setTimeout(() => navigate("/login"), 3000);
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const data = {
        name: editingBadge.name,
        description: editingBadge.description || "",
        type: editingBadge.type,
        conditionalPoint: Number(editingBadge.conditionalPoint),
        imageUrl: editingBadge.imageUrl || "",
      };

      console.log("Data to be sent:", data);

      if (editingBadge.id) {
        // Update badge
        console.log("Sending PUT request to update badge:", editingBadge.id);
        const response = await axios.put(`${API_URL}/${editingBadge.id}`, data, { headers });
        console.log("Update badge response:", response.data);
      } else {
        // Create badge
        console.log("Sending POST request to create badge");
        const response = await axios.post(API_URL, data, { headers });
        console.log("Create badge response:", response.data);
      }

      await fetchBadges();
      handleCloseDialog();
      setSnackbar({ open: true, message: "Badge saved successfully!", severity: "success" });
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to save badge.";
      setSnackbar({ open: true, message: errorMessage, severity: "error" });
      console.error("Error saving badge:", error);
      console.log("Error response:", error.response);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      const token = getAuthToken();
      if (!token) {
        setSnackbar({ open: true, message: "Authorization token is missing! Redirecting to login...", severity: "error" });
        setTimeout(() => navigate("/login"), 3000);
        return;
      }

      console.log("Sending DELETE request for badge:", id);
      await axios.delete(`${API_URL}/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      await fetchBadges();
      setSnackbar({ open: true, message: "Badge deleted successfully!", severity: "success" });
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to delete badge.";
      setSnackbar({ open: true, message: errorMessage, severity: "error" });
      console.error("Error deleting badge:", error);
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
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <CircularProgress />
    </div>
  );
  if (role !== 'staff') return (
    <p style={{ color: 'red', textAlign: 'center', marginTop: '2rem' }}>
      You do not have permission to manage badges.
    </p>
  );

  return (
    <div style={{ padding: '2rem' }}>
      <h2 style={{ marginBottom: '1rem' }}>Badge Management</h2>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <TextField
          label="Search by Name"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          variant="outlined"
        />
        <FormControl style={{ width: 200 }}>
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
        </FormControl>
        <Button variant="contained" color="primary" onClick={() => handleOpenDialog()}>
          Add Badge
        </Button>
      </div>

      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', margin: '1rem 0' }}>
          <CircularProgress />
        </div>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Image</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Conditional Points</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedBadges.map(badge => (
              <TableRow key={badge.id}>
                <TableCell>
                  <img src={badge.imageUrl || ImagePlaceholder} width={50} height={50} alt="badge" />
                </TableCell>
                <TableCell>{badge.name}</TableCell>
                <TableCell>{badge.type}</TableCell>
                <TableCell>{badge.conditionalPoint}</TableCell>
                <TableCell>
                  <Button onClick={() => handleOpenDialog(badge)} disabled={loading}>Edit</Button>
                  <Button color="secondary" onClick={() => handleDelete(badge.id)} disabled={loading}>Delete</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={filteredBadges.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[5]}
        />
      </TableContainer>

      <Dialog open={open} onClose={handleCloseDialog}>
        <DialogTitle>{editingBadge?.id ? 'Edit Badge' : 'Add Badge'}</DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            fullWidth
            margin="dense"
            value={editingBadge?.name || ''}
            onChange={(e) => setEditingBadge({ ...editingBadge, name: e.target.value })}
            required
            error={!editingBadge?.name}
            helperText={!editingBadge?.name ? "Name is required" : ""}
          />
          <TextField
            label="Description"
            fullWidth
            margin="dense"
            value={editingBadge?.description || ''}
            onChange={(e) => setEditingBadge({ ...editingBadge, description: e.target.value })}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Type</InputLabel>
            <Select
              value={editingBadge?.type || 'Copper'}
              onChange={(e) => setEditingBadge({ ...editingBadge, type: e.target.value })}
              label="Type"
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
          />
          {editingBadge?.imageUrl && (
            <div style={{ marginTop: '1rem' }}>
              <p>Preview Image:</p>
              <img src={editingBadge.imageUrl} alt="Badge preview" style={{ width: '100px' }} onError={(e) => (e.target.src = ImagePlaceholder)} />
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={loading}>Cancel</Button>
          <Button onClick={handleSaveBadge} color="primary" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default BadgeManagement;