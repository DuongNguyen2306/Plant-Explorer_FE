import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button,
  TextField, Dialog, DialogActions, DialogContent, DialogTitle, Select, MenuItem,
  InputLabel, FormControl
} from '@mui/material';
import { BASE_API } from '../constant';
import ImagePlaceholder from "../assets/placeholder.png";

const API_URL = BASE_API + "/badges";

const BadgeManagement = () => {
  const [badges, setBadges] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingBadge, setEditingBadge] = useState(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    fetchBadges();
  }, []);

  const fetchBadges = async () => {
    try {
      const res = await axios.get(API_URL);
      setBadges(res.data.data.items);
    } catch (error) {
      console.error("Error fetching badges:", error);
    }
  };

  const handleOpenDialog = (badge = null) => {
    setEditingBadge(badge || { name: '', type: '', image: '', conditionalPoint: 0 });
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setEditingBadge(null);
  };

  const handleSaveBadge = async () => {
    try {
      if (editingBadge.id) {
        await axios.put(`${API_URL}/badge?id=${editingBadge.id}`, editingBadge);
      } else {
        await axios.post(`${API_URL}/badge`, editingBadge);
      }
      fetchBadges();
      handleCloseDialog();
    } catch (error) {
      console.error("Error saving badge:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/badge?id=${id}`);
      fetchBadges();
    } catch (error) {
      console.error("Error deleting badge:", error);
    }
  };

  const filteredBadges = badges.filter(badge =>
    badge.name.toLowerCase().includes(search.toLowerCase()) &&
    (!typeFilter || badge.type === typeFilter)
  );

  return (
    <div>
      <h2>Badge Management</h2>
      <TextField
        label="Search by Name"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        variant="outlined"
        style={{ marginRight: '1rem', marginBottom: '1rem' }}
      />
      <FormControl style={{ width: 200, marginBottom: '1rem', marginRight: '1rem' }}>
        <InputLabel>Filter by Type</InputLabel>
        <Select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          label="Filter by Type"
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="Gold">Gold</MenuItem>
          <MenuItem value="Silver">Silver</MenuItem>
          <MenuItem value="Bronze">Bronze</MenuItem>
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
            {filteredBadges.map(badge => (
              <TableRow key={badge.id}>
                <TableCell>
                  <img src={badge.image ?? ImagePlaceholder} width={50} height={50} alt="badge" />
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
          <TextField 
            label="Type" 
            fullWidth 
            margin="dense" 
            value={editingBadge?.type || ''} 
            onChange={(e) => setEditingBadge({ ...editingBadge, type: e.target.value })} 
          />
          <TextField 
            label="Image URL" 
            fullWidth 
            margin="dense" 
            value={editingBadge?.image || ''} 
            onChange={(e) => setEditingBadge({ ...editingBadge, image: e.target.value })} 
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
