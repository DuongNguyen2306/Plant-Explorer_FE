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
} from "@mui/material";

const API_URL = "https://66937520c6be000fa07b9d27.mockapi.io/plants";

const PlantManagement = () => {
  const [plants, setPlants] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingPlant, setEditingPlant] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchPlants();
  }, []);

  const fetchPlants = async () => {
    try {
      const response = await axios.get(API_URL);
      setPlants(response.data);
    } catch (error) {
      console.error("Error fetching plants:", error);
    }
  };

  const handleOpenDialog = (plant = null) => {
    setEditingPlant(plant);
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setEditingPlant(null);
  };

  const handleSavePlant = async () => {
    if (editingPlant.id) {
      await axios.put(`${API_URL}/${editingPlant.id}`, editingPlant);
    } else {
      await axios.post(API_URL, editingPlant);
    }
    fetchPlants();
    handleCloseDialog();
  };

  const handleDelete = async (id) => {
    await axios.delete(`${API_URL}/${id}`);
    fetchPlants();
  };

  return (
    <Box sx={{ padding: "20px" }}>
      <Typography variant="h4" sx={{ fontWeight: "bold", marginBottom: "20px" }}>
        Plant Management
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
        <TextField
          label="Search Plant"
          variant="outlined"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          fullWidth
          sx={{ maxWidth: "400px" }}
        />
        <Button variant="contained" color="primary" onClick={() => handleOpenDialog()}>
          Add Plant
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: "10px", overflow: "hidden", boxShadow: 3 }}>
        <Table>
          <TableHead sx={{ backgroundColor: "#f1f1f1" }}>
            <TableRow>
              <TableCell><strong>Name</strong></TableCell>
              <TableCell><strong>Scientific Name</strong></TableCell>
              <TableCell><strong>Category</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {plants.filter(p => p.name.toLowerCase().includes(search.toLowerCase())).map((plant) => (
              <TableRow key={plant.id}>
                <TableCell>{plant.name}</TableCell>
                <TableCell>{plant.scientificName}</TableCell>
                <TableCell>{plant.category}</TableCell>
                <TableCell>
                  <Button color="primary" onClick={() => handleOpenDialog(plant)}>Edit</Button>
                  <Button color="secondary" onClick={() => handleDelete(plant.id)}>Delete</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleCloseDialog}>
        <DialogTitle>{editingPlant?.id ? "Edit Plant" : "Add Plant"}</DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            fullWidth
            margin="dense"
            value={editingPlant?.name || ""}
            onChange={(e) => setEditingPlant({ ...editingPlant, name: e.target.value })}
          />
          <TextField
            label="Scientific Name"
            fullWidth
            margin="dense"
            value={editingPlant?.scientificName || ""}
            onChange={(e) => setEditingPlant({ ...editingPlant, scientificName: e.target.value })}
          />
          <TextField
            label="Category"
            fullWidth
            margin="dense"
            value={editingPlant?.category || ""}
            onChange={(e) => setEditingPlant({ ...editingPlant, category: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSavePlant} color="primary">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PlantManagement;
