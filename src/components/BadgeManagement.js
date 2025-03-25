// 📁 components/BadgeManagement.js (Only staff allowed)
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button,
  TextField, Dialog, DialogActions, DialogContent, DialogTitle, Select, MenuItem,
  InputLabel, FormControl, TablePagination
} from '@mui/material';
import { BASE_API } from '../constant';
import ImagePlaceholder from "../assets/placeholder.png";
import { getUserRoleFromAPI } from "../utils/roleUtils";

const API_URL = BASE_API + "/badges";

const BadgeManagement = () => {
  const [badges, setBadges] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingBadge, setEditingBadge] = useState(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(5);
  const [role, setRole] = useState(null);

  useEffect(() => {
    getUserRoleFromAPI().then(setRole);
  }, []);

  useEffect(() => {
    if (role === 'staff') fetchBadges();
  }, [role]);

  const fetchBadges = async () => {
    try {
      const res = await axios.get(API_URL, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      console.log("Fetched badges:", res.data.data.items); // Debug: Kiểm tra dữ liệu trả về
      setBadges(res.data.data.items);
    } catch (error) {
      console.error("Error fetching badges:", error);
      alert("Failed to fetch badges: " + (error.response?.data?.message || error.message));
    }
  };

  const handleOpenDialog = (badge = null) => {
    setEditingBadge(badge || { name: '', type: 'Copper', conditionalPoint: 0, imageUrl: '', description: '' });
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setEditingBadge(null);
  };

  const handleSaveBadge = async () => {
    try {
      const headers = {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      };

      // Dữ liệu gửi lên dạng JSON
      const data = {
        name: editingBadge.name,
        type: editingBadge.type,
        conditionalPoint: editingBadge.conditionalPoint,
        imageUrl: editingBadge.imageUrl || "",
        description: editingBadge.description || "", // Thêm trường description
      };

      console.log("Data to be sent:", data); // Debug: Kiểm tra dữ liệu gửi lên

      if (editingBadge.id) {
        // Update badge
        console.log("Sending PUT request to update badge:", editingBadge.id); // Debug
        const response = await axios.put(`${API_URL}/badge?id=${editingBadge.id}`, data, { headers });
        console.log("Update response:", response.data); // Debug: Kiểm tra response
      } else {
        // Create badge
        if (!editingBadge.imageUrl) {
          alert("Please provide an image URL for the new badge");
          return;
        }
        console.log("Sending POST request to create badge"); // Debug
        const response = await axios.post(`${API_URL}/badge`, data, { headers });
        console.log("Create response:", response.data); // Debug: Kiểm tra response
      }

      // Làm mới danh sách badge sau khi cập nhật/thêm mới
      await fetchBadges();
      handleCloseDialog();
      alert("Badge saved successfully!");
    } catch (error) {
      console.error("Error saving badge:", error);
      console.log("Error response:", error.response); // Debug: Kiểm tra chi tiết lỗi
      alert("Failed to save badge: " + (error.response?.data?.message || error.message));
    }
  };

  const handleDelete = async (id) => {
    try {
      console.log("Sending DELETE request for badge:", id); // Debug
      await axios.delete(`${API_URL}/badge?id=${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      await fetchBadges();
      alert("Badge deleted successfully!");
    } catch (error) {
      console.error("Error deleting badge:", error);
      alert("Failed to delete badge: " + (error.response?.data?.message || error.message));
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

  if (role === null) return <p>Loading...</p>;
  if (role !== 'staff') return <p style={{ color: 'red' }}>You do not have permission to manage badges.</p>;

  return (
    <div>
      <h2>Badge Management</h2>
      <TextField
        label="Search by Name"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(0);
        }}
        variant="outlined"
        style={{ marginRight: '1rem', marginBottom: '1rem' }}
      />
      <FormControl style={{ width: 200, marginBottom: '1rem', marginRight: '1rem' }}>
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
                  <Button onClick={() => handleOpenDialog(badge)}>Edit</Button>
                  <Button color="secondary" onClick={() => handleDelete(badge.id)}>Delete</Button>
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
            label="Image URL"
            fullWidth
            margin="dense"
            value={editingBadge?.imageUrl || ''}
            onChange={(e) => setEditingBadge({ ...editingBadge, imageUrl: e.target.value })}
          />
          {editingBadge?.imageUrl && (
            <div style={{ marginTop: '1rem' }}>
              <p>Preview Image:</p>
              <img src={editingBadge.imageUrl} alt="Badge preview" style={{ width: '100px' }} onError={(e) => (e.target.src = ImagePlaceholder)} />
            </div>
          )}
          <TextField
            label="Description"
            fullWidth
            margin="dense"
            value={editingBadge?.description || ''}
            onChange={(e) => setEditingBadge({ ...editingBadge, description: e.target.value })}
          />
          <TextField
            label="Conditional Points"
            type="number"
            fullWidth
            margin="dense"
            value={editingBadge?.conditionalPoint || 0}
            onChange={(e) => setEditingBadge({ ...editingBadge, conditionalPoint: Number(e.target.value) })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveBadge} color="primary">Save</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default BadgeManagement;