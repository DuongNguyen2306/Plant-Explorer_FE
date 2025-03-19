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
import { useNavigate } from "react-router-dom";

const API_URL = BASE_API + "/plant";

const PlantManagement = () => {
  const [plants, setPlants] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingPlant, setEditingPlant] = useState(null);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchPlants();
  }, []);

  const fetchPlants = async () => {
    try {
      const response = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setPlants(response.data);
    } catch (error) {
      console.error("Error fetching plants:", error.response?.data || error);
    }
  };

  const handleViewDetails = (plantId, type) => {
    switch (type) {
      case "characteristic":
        navigate(`/plant/${plantId}/characteristics`);
        break;
      case "category":
        navigate(`/plant/${plantId}/category`);
        break;
      case "application":
        navigate(`/plant/${plantId}/applications`);
        break;
      default:
        break;
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
                  <Button color="primary" onClick={() => handleViewDetails(plant.id, "characteristic")}>
                    View Characteristics
                  </Button>
                  <Button color="secondary" onClick={() => handleViewDetails(plant.id, "category")}>
                    View Category
                  </Button>
                  <Button color="success" onClick={() => handleViewDetails(plant.id, "application")}>
                    View Applications
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default PlantManagement;
