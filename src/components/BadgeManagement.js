import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle, Select, MenuItem, InputLabel, FormControl } from '@mui/material';

const API_URL = 'https://6721469298bbb4d93ca804a9.mockapi.io/badges';

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
    const res = await axios.get(API_URL);
    setBadges(res.data);
  };

  const handleOpenDialog = (badge = null) => {
    setEditingBadge(badge || { name: '', type: '', image: '' });
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setEditingBadge(null);
  };

  const handleSaveBadge = async () => {
    if (editingBadge.id) {
      await axios.put(`${API_URL}/${editingBadge.id}`, editingBadge);
    } else {
      await axios.post(API_URL, editingBadge);
    }
    fetchBadges();
    handleCloseDialog();
  };

  const handleDelete = async (id) => {
    await axios.delete(`${API_URL}/${id}`);
    fetchBadges();
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
          <MenuItem value="Flower">Flower</MenuItem>
          <MenuItem value="Bonsai">Bonsai</MenuItem>
          <MenuItem value="Garden">Garden</MenuItem>
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
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredBadges.map(badge => (
              <TableRow key={badge.id}>
                <TableCell><img src={badge.image} width={50} height={50} alt="badge" /></TableCell>
                <TableCell>{badge.name}</TableCell>
                <TableCell>{badge.type}</TableCell>
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
          <TextField label="Name" fullWidth margin="dense" value={editingBadge?.name || ''} onChange={(e) => setEditingBadge({ ...editingBadge, name: e.target.value })} />
          <TextField label="Type" fullWidth margin="dense" value={editingBadge?.type || ''} onChange={(e) => setEditingBadge({ ...editingBadge, type: e.target.value })} />
          <TextField label="Image URL" fullWidth margin="dense" value={editingBadge?.image || ''} onChange={(e) => setEditingBadge({ ...editingBadge, image: e.target.value })} />
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
