// 📁 components/PlantManagement.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Button, TextField, TablePagination, Box, Typography, Dialog, DialogTitle,
  DialogContent, DialogActions, IconButton
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import { BASE_API } from "../constant";
import { useNavigate } from "react-router-dom";
import { getUserRoleFromAPI } from "../utils/roleUtils";

const API_URL = BASE_API + "/plant";

const PlantManagement = () => {
  const [plants, setPlants] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(5);
  const [role, setRole] = useState(null);
  const [open, setOpen] = useState(false);
  const [editingPlant, setEditingPlant] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    getUserRoleFromAPI().then(setRole);
  }, []);

  useEffect(() => {
    if (role === "staff" || role === "children") {
      fetchPlants();
    }
  }, [role]);

  const fetchPlants = async () => {
    try {
      const response = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setPlants(response.data);
    } catch (error) {
      console.error("Error fetching plants:", error.response?.data || error);
      alert("Failed to fetch plants: " + (error.response?.data?.message || error.message));
    }
  };

  const handleOpenDialog = (plant = null) => {
    setEditingPlant(plant || { name: "", scientificName: "", category: "", description: "" });
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setEditingPlant(null);
  };

  const handleSavePlant = async () => {
    try {
      const headers = {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      };

      const data = {
        name: editingPlant.name,
        scientificName: editingPlant.scientificName,
        category: editingPlant.category,
        description: editingPlant.description || "",
      };

      if (editingPlant.id) {
        // Update plant
        await axios.put(`${API_URL}/${editingPlant.id}`, data, { headers });
        alert("Plant updated successfully!");
      } else {
        // Create new plant
        await axios.post(API_URL, data, { headers });
        alert("Plant created successfully!");
      }
      await fetchPlants();
      handleCloseDialog();
    } catch (error) {
      console.error("Error saving plant:", error);
      alert("Failed to save plant: " + (error.response?.data?.message || error.message));
    }
  };

  const handleDeletePlant = async (id) => {
    if (window.confirm("Are you sure you want to delete this plant?")) {
      try {
        await axios.delete(`${API_URL}/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        await fetchPlants();
        alert("Plant deleted successfully!");
      } catch (error) {
        console.error("Error deleting plant:", error);
        alert("Failed to delete plant: " + (error.response?.data?.message || error.message));
      }
    }
  };

  const handleViewDetail = (plantId) => {
    navigate(`/plant/${plantId}/detail`);
  };

  const filteredPlants = plants.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  if (role === null) return <p>Loading...</p>;
  if (!['staff', 'children'].includes(role)) return <p style={{ color: 'red' }}>You do not have permission to view this page.</p>;

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
        {role === "staff" && (
          <>
            <Button
              variant="contained"
              color="success"
              onClick={() => handleOpenDialog()}
              sx={{ minWidth: "120px" }}
            >
              Add Plant
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={fetchPlants}
              sx={{ minWidth: "120px" }}
            >
              Refresh
            </Button>
          </>
        )}
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
            {filteredPlants.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((plant) => (
              <TableRow key={plant.id}>
                <TableCell>{plant.name}</TableCell>
                <TableCell>{plant.scientificName}</TableCell>
                <TableCell>{plant.category}</TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    color="info"
                    onClick={() => handleViewDetail(plant.id)}
                    sx={{ marginRight: "10px" }}
                  >
                    View Detail
                  </Button>
                  {role === "staff" && (
                    <>
                      <IconButton
                        onClick={() => handleOpenDialog(plant)}
                        sx={{ color: "#1976d2" }}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton
                        onClick={() => handleDeletePlant(plant.id)}
                        sx={{ color: "#d32f2f" }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={filteredPlants.length}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[5]}
        />
      </TableContainer>

      {/* Dialog for Add/Edit Plant */}
      {role === "staff" && (
        <Dialog open={open} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
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
            <TextField
              label="Description"
              fullWidth
              margin="dense"
              multiline
              rows={3}
              value={editingPlant?.description || ""}
              onChange={(e) => setEditingPlant({ ...editingPlant, description: e.target.value })}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleSavePlant} color="primary">Save</Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default PlantManagement;