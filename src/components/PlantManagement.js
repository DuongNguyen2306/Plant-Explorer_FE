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
import { BASE_API } from "../constant";

const API_URL = BASE_API + "/plant";

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
      const response = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      console.log("📢 API Response:", response.data); // Debug API response
      setPlants(response.data);
    } catch (error) {
      console.error("🚨 Error fetching plants:", error.response?.data || error);
    }
  };

  const handleOpenDialog = (plant = null) => {
    if (plant) {
      setEditingPlant({ ...plant });
    } else {
      setEditingPlant({
        id: null,
        name: "",
        scientificName: "",
        category: "",
        family: "", // ⚠ Thêm giá trị mặc định cho `family`
      });
    }
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setEditingPlant(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditingPlant((prev) => ({
      ...prev,
      [name]: value,
    }));
    console.log(`📝 Updating ${name}:`, value);
  };

  const handleSavePlant = async () => {
    console.log("📢 Trước khi gửi API:", editingPlant);

    if (!editingPlant?.name.trim() || !editingPlant?.scientificName.trim()) {
      console.error("🚨 Error: Name and Scientific Name cannot be empty!");
      return;
    }

    const payload = {
      name: editingPlant.name,
      scientificName: editingPlant.scientificName,
      category: editingPlant.category || "Unknown",
      family: editingPlant.family || "Unknown",
    };

    console.log("📢 Dữ liệu gửi lên API:", payload);

    try {
      let response;
      if (editingPlant.id) {
        response = await axios.put(`${API_URL}/${editingPlant.id}`, payload);
        console.log("✅ Update response:", response.data);
      } else {
        response = await axios.post(API_URL, payload);
        console.log("✅ Add response:", response.data);
      }

      await fetchPlants();
      handleCloseDialog();
    } catch (error) {
      console.error("🚨 Error saving plant:", error.response?.data || error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchPlants();
    } catch (error) {
      console.error("🚨 Error deleting plant:", error);
    }
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
            name="name"
            value={editingPlant?.name || ""}
            onChange={handleInputChange}
          />
          <TextField
            label="Scientific Name"
            fullWidth
            margin="dense"
            name="scientificName"
            value={editingPlant?.scientificName || ""}
            onChange={handleInputChange}
          />
          <TextField
            label="Category"
            fullWidth
            margin="dense"
            name="category"
            value={editingPlant?.category || ""}
            onChange={handleInputChange}
          />
          <TextField
            label="Family"
            fullWidth
            margin="dense"
            name="family"
            value={editingPlant?.family || ""}
            onChange={handleInputChange}
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
