import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Divider,
  Button,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";
import { Edit, Delete, Add } from "@mui/icons-material";
import { BASE_API } from "../constant";
import { getUserRoleFromAPI } from "../utils/roleUtils";

const PlantDetail = () => {
  const { plantId } = useParams();
  const [characteristics, setCharacteristics] = useState([]);
  const [applications, setApplications] = useState([]);
  const [category, setCategory] = useState(null);
  const [characteristicCategories, setCharacteristicCategories] = useState([]);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openCharDialog, setOpenCharDialog] = useState(false);
  const [openAppDialog, setOpenAppDialog] = useState(false);
  const [editingChar, setEditingChar] = useState(null);
  const [editingApp, setEditingApp] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    getUserRoleFromAPI()
      .then((fetchedRole) => {
        console.log("Fetched role:", fetchedRole);
        setRole(fetchedRole);
      })
      .catch((error) => {
        console.error("Error fetching role:", error);
        setRole(null);
      });
  }, []);

  useEffect(() => {
    if (role === "staff" || role === "children") {
      fetchAllData();
      fetchCategories();
    }
  }, [role, plantId]);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const charCatRes = await axios.get(`${BASE_API}/characteristic-category`, { headers });
      console.log("Characteristic Categories Response:", charCatRes.data);
      setCharacteristicCategories(charCatRes.data || []);
    } catch (error) {
      console.error("Error fetching characteristic categories:", error);
      alert("Failed to fetch characteristic categories: " + (error.response?.data?.message || error.message));
    }
  };

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("token");
    try {
      const [charRes, appRes, catRes] = await Promise.all([
        axios.get(`${BASE_API}/plant-characteristics?plantId=${plantId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${BASE_API}/plant-applications?plantId=${plantId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${BASE_API}/plants/${plantId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      console.log("Characteristics response:", charRes.data);
      console.log("Applications response:", appRes.data);
      console.log("Category response:", catRes.data);

      const characteristicsData = charRes.data?.data?.items || charRes.data || [];
      const applicationsData = appRes.data?.data?.items || appRes.data || [];

      setCharacteristics(characteristicsData);
      setApplications(applicationsData);
      setCategory(catRes.data || null);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching detail:", error);
      setError("Failed to fetch plant details: " + (error.response?.data?.message || error.message));
      setLoading(false);
    }
  };

  const handleOpenCharDialog = (char = null) => {
    setEditingChar(
      char || { characteristicName: "", value: "", plantId, characteristicCategoryId: "" }
    );
    setOpenCharDialog(true);
  };

  const handleCloseCharDialog = () => {
    setOpenCharDialog(false);
    setEditingChar(null);
  };

  const handleOpenAppDialog = (app = null) => {
    setEditingApp(
      app || { applicationName: "", description: "", plantId, applicationCategoryId: "" }
    );
    setOpenAppDialog(true);
  };

  const handleCloseAppDialog = () => {
    setOpenAppDialog(false);
    setEditingApp(null);
  };

  const handleSaveChar = async () => {
    if (!editingChar.characteristicCategoryId) {
      alert("Please select a characteristic category.");
      return;
    }
    try {
      const headers = {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      };
      const data = {
        characteristicName: editingChar.characteristicName,
        value: editingChar.value,
        plantId: editingChar.plantId,
        characteristicCategoryId: editingChar.characteristicCategoryId,
        description: editingChar.value,
      };
      console.log("Data to be sent in POST request:", data); // Debug dữ liệu gửi lên API

      let response;
      if (editingChar.id) {
        response = await axios.put(`${BASE_API}/plant-characteristics/${editingChar.id}`, data, { headers });
        alert("Characteristic updated successfully!");
      } else {
        response = await axios.post(`${BASE_API}/plant-characteristics`, data, { headers });
        console.log("POST response:", response.data);
        alert("Characteristic created successfully!");
      }

      setTimeout(async () => {
        await fetchAllData();
        handleCloseCharDialog();
      }, 500);
    } catch (error) {
      console.error("Error saving characteristic:", error);
      alert("Failed to save characteristic: " + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteChar = async (id) => {
    if (window.confirm("Are you sure you want to delete this characteristic?")) {
      try {
        await axios.delete(`${BASE_API}/plant-characteristics/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        alert("Characteristic deleted successfully!");
        await fetchAllData();
      } catch (error) {
        console.error("Error deleting characteristic:", error);
        alert("Failed to delete characteristic: " + (error.response?.data?.message || error.message));
      }
    }
  };

  const handleSaveApp = async () => {
    if (!editingApp.applicationCategoryId) {
      alert("Please enter an application category ID.");
      return;
    }
    try {
      const headers = {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      };
      const data = {
        applicationName: editingApp.applicationName,
        description: editingApp.description,
        plantId: editingApp.plantId,
        applicationCategoryId: editingApp.applicationCategoryId,
      };
      if (editingApp.id) {
        await axios.put(`${BASE_API}/plant-applications/${editingApp.id}`, data, { headers });
        alert("Application updated successfully!");
      } else {
        await axios.post(`${BASE_API}/plant-applications`, data, { headers });
        alert("Application created successfully!");
      }
      await fetchAllData();
      handleCloseAppDialog();
    } catch (error) {
      console.error("Error saving application:", error);
      alert("Failed to save application: " + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteApp = async (id) => {
    if (window.confirm("Are you sure you want to delete this application?")) {
      try {
        await axios.delete(`${BASE_API}/plant-applications/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        alert("Application deleted successfully!");
        await fetchAllData();
      } catch (error) {
        console.error("Error deleting application:", error);
        alert("Failed to delete application: " + (error.response?.data?.message || error.message));
      }
    }
  };

  if (role === null) return <p>Loading role...</p>;
  if (role !== "staff" && role !== "children")
    return <p style={{ color: "red" }}>You do not have permission to view plant details.</p>;
  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", padding: "20px" }}>
        <CircularProgress />
      </Box>
    );
  if (error)
    return (
      <Box sx={{ padding: "20px" }}>
        <Typography color="error">{error}</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate("/plants")}
          sx={{ marginTop: "10px" }}
        >
          Back to Plant Management
        </Button>
      </Box>
    );

  return (
    <Box sx={{ padding: "20px" }}>
      <Typography variant="h4" sx={{ fontWeight: "bold", marginBottom: "20px" }}>
        Plant Detail
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={() => navigate("/plants")}
        sx={{ marginBottom: "20px" }}
      >
        Back to Plant Management
      </Button>

      {/* Category Section */}
      <Paper sx={{ padding: "20px", marginBottom: "20px", borderRadius: "10px", boxShadow: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: "bold", color: "#2d3436" }}>
          Category
        </Typography>
        <Divider sx={{ marginY: "10px" }} />
        {category ? (
          <>
            <Typography variant="body1" sx={{ marginBottom: "5px" }}>
              <strong>Name:</strong> {category.name || "N/A"}
            </Typography>
            <Typography variant="body1" sx={{ marginBottom: "5px" }}>
              <strong>Scientific Name:</strong> {category.scientificName || "N/A"}
            </Typography>
            <Typography variant="body1" sx={{ marginBottom: "5px" }}>
              <strong>Category:</strong> {category.category || "N/A"}
            </Typography>
            <Typography variant="body1">
              <strong>Description:</strong> {category.description || "No description available"}
            </Typography>
          </>
        ) : (
          <Typography color="text.secondary">No category information available.</Typography>
        )}
      </Paper>

      {/* Characteristics Section */}
      <Paper sx={{ padding: "20px", marginBottom: "20px", borderRadius: "10px", boxShadow: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h6" sx={{ fontWeight: "bold", color: "#2d3436" }}>
            Characteristics
          </Typography>
          {role === "staff" && (
            <Button
              variant="contained"
              color="success"
              startIcon={<Add />}
              onClick={() => handleOpenCharDialog()}
              sx={{ marginBottom: "10px" }}
            >
              Add Characteristic
            </Button>
          )}
        </Box>
        <Divider sx={{ marginY: "10px" }} />
        {characteristics.length > 0 ? (
          characteristics.map((char) => (
            <Box key={char.id} sx={{ marginBottom: "10px", display: "flex", alignItems: "center" }}>
              <Typography variant="body1" sx={{ flexGrow: 1 }}>
                <strong>{char.characteristicName || "N/A"}:</strong> {char.value || "N/A"}
              </Typography>
              {role === "staff" && (
                <>
                  <IconButton
                    onClick={() => handleOpenCharDialog(char)}
                    sx={{ color: "#1976d2", marginLeft: "10px" }}
                  >
                    <Edit fontSize="small" />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDeleteChar(char.id)}
                    sx={{ color: "#d32f2f", marginLeft: "5px" }}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </>
              )}
            </Box>
          ))
        ) : (
          <Typography color="text.secondary">No characteristics found.</Typography>
        )}
      </Paper>

      {/* Applications Section */}
      <Paper sx={{ padding: "20px", borderRadius: "10px", boxShadow: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h6" sx={{ fontWeight: "bold", color: "#2d3436" }}>
            Applications
          </Typography>
          {role === "staff" && (
            <Button
              variant="contained"
              color="success"
              startIcon={<Add />}
              onClick={() => handleOpenAppDialog()}
              sx={{ marginBottom: "10px" }}
            >
              Add Application
            </Button>
          )}
        </Box>
        <Divider sx={{ marginY: "10px" }} />
        {applications.length > 0 ? (
          applications.map((app) => (
            <Box key={app.id} sx={{ marginBottom: "10px", display: "flex", alignItems: "center" }}>
              <Typography variant="body1" sx={{ flexGrow: "1" }}>
                <strong>{app.applicationName || "N/A"}:</strong> {app.description || "N/A"}
              </Typography>
              {role === "staff" && (
                <>
                  <IconButton
                    onClick={() => handleOpenAppDialog(app)}
                    sx={{ color: "#1976d2", marginLeft: "10px" }}
                  >
                    <Edit fontSize="small" />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDeleteApp(app.id)}
                    sx={{ color: "#d32f2f", marginLeft: "5px" }}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </>
              )}
            </Box>
          ))
        ) : (
          <Typography color="text.secondary">No applications found.</Typography>
        )}
      </Paper>

      {/* Dialog for Add/Edit Characteristic */}
      {role === "staff" && (
        <Dialog open={openCharDialog} onClose={handleCloseCharDialog} maxWidth="sm" fullWidth>
          <DialogTitle>{editingChar?.id ? "Edit Characteristic" : "Add Characteristic"}</DialogTitle>
          <DialogContent>
            <TextField
              label="Characteristic Name"
              fullWidth
              margin="dense"
              value={editingChar?.characteristicName || ""}
              onChange={(e) => setEditingChar({ ...editingChar, characteristicName: e.target.value })}
            />
            <TextField
              label="Value"
              fullWidth
              margin="dense"
              value={editingChar?.value || ""}
              onChange={(e) => setEditingChar({ ...editingChar, value: e.target.value })}
            />
            <FormControl fullWidth margin="dense">
              <InputLabel>Characteristic Category</InputLabel>
              <Select
                value={editingChar?.characteristicCategoryId || ""}
                onChange={(e) =>
                  setEditingChar({ ...editingChar, characteristicCategoryId: e.target.value })
                }
                label="Characteristic Category"
              >
                <MenuItem value="">
                  <em>Select a category</em>
                </MenuItem>
                {characteristicCategories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseCharDialog}>Cancel</Button>
            <Button onClick={handleSaveChar} color="primary">Save</Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Dialog for Add/Edit Application */}
      {role === "staff" && (
        <Dialog open={openAppDialog} onClose={handleCloseAppDialog} maxWidth="sm" fullWidth>
          <DialogTitle>{editingApp?.id ? "Edit Application" : "Add Application"}</DialogTitle>
          <DialogContent>
            <TextField
              label="Application Name"
              fullWidth
              margin="dense"
              value={editingApp?.applicationName || ""}
              onChange={(e) => setEditingApp({ ...editingApp, applicationName: e.target.value })}
            />
            <TextField
              label="Description"
              fullWidth
              margin="dense"
              multiline
              rows={3}
              value={editingApp?.description || ""}
              onChange={(e) => setEditingApp({ ...editingApp, description: e.target.value })}
            />
            <TextField
              label="Application Category ID"
              fullWidth
              margin="dense"
              value={editingApp?.applicationCategoryId || ""}
              onChange={(e) => setEditingApp({ ...editingApp, applicationCategoryId: e.target.value })}
              helperText="Enter the ID of the application category (e.g., 3fa85f64-5717-4562-b3fc-2c963f66afa6)"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseAppDialog}>Cancel</Button>
            <Button onClick={handleSaveApp} color="primary">Save</Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default PlantDetail;