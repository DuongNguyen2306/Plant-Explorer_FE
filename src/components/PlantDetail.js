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
  Select,
  InputLabel,
  FormControl,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import { BASE_API } from "../constant";
import { getUserRoleFromAPI } from "../utils/roleUtils";

const PlantDetail = () => {
  const { plantId } = useParams();
  const [characteristics, setCharacteristics] = useState([]);
  const [applications, setApplications] = useState([]);
  const [category, setCategory] = useState(null);
  const [characteristicCategories, setCharacteristicCategories] = useState([]);
  const [applicationCategories, setApplicationCategories] = useState([]);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: "",
    scientificName: "",
    family: "",
    habitat: "",
    distribution: "",
    description: "",
  });
  const [openAddCharDialog, setOpenAddCharDialog] = useState(false);
  const [openEditCharDialog, setOpenEditCharDialog] = useState(false);
  const [openAddAppDialog, setOpenAddAppDialog] = useState(false);
  const [openEditAppDialog, setOpenEditAppDialog] = useState(false);
  const [selectedCharCategoryIds, setSelectedCharCategoryIds] = useState([]);
  const [selectedAppCategoryId, setSelectedAppCategoryId] = useState("");
  const [charDescription, setCharDescription] = useState("");
  const [editingChar, setEditingChar] = useState(null);
  const [editingApp, setEditingApp] = useState(null);
  const [appDescription, setAppDescription] = useState("");
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
      const [charCatRes, appCatRes] = await Promise.all([
        axios.get(`${BASE_API}/characteristic-category`, { headers }),
        axios.get(`${BASE_API}/application-category`, { headers }),
      ]);
      setCharacteristicCategories(charCatRes.data || []);
      setApplicationCategories(appCatRes.data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      alert("Failed to fetch categories: " + (error.response?.data?.message || error.message));
    }
  };

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("token");
    try {
      const [charRes, appRes, catRes] = await Promise.all([
        axios.get(`${BASE_API}/plant-characteristics/${plantId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${BASE_API}/plant-applications?plantId=${plantId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${BASE_API}/plants/${plantId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const characteristicsData = charRes.data || [];
      const applicationsData = appRes.data?.data?.items || appRes.data || [];
      const plantData = catRes.data || null;

      setCharacteristics(characteristicsData);
      setApplications(applicationsData);
      setCategory(plantData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching detail:", error);
      setError("Failed to fetch plant details: " + (error.response?.data?.message || error.message));
      setLoading(false);
    }
  };

  const handleAddCharCategories = async () => {
    if (selectedCharCategoryIds.length === 0) {
      alert("Please select at least one characteristic category!");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      await Promise.all(
        selectedCharCategoryIds.map(async (categoryId) => {
          const existingChar = characteristics.find(
            (char) => char.characteristicCategoryId === categoryId
          );
          if (!existingChar) {
            const categoryName = characteristicCategories.find((cat) => cat.id === categoryId)?.name || "Unknown";
            const data = {
              plantId,
              characteristicCategoryId: categoryId,
              characteristicName: categoryName,
              description: charDescription || "",
            };
            await axios.post(`${BASE_API}/plant-characteristics`, data, { headers });
          }
        })
      );

      alert("Characteristic categories added successfully!");
      setOpenAddCharDialog(false);
      setSelectedCharCategoryIds([]);
      setCharDescription("");
      await fetchAllData();
    } catch (error) {
      console.error("Error adding characteristic categories:", error);
      alert("Failed to add characteristic categories: " + (error.response?.data?.message || error.message));
    }
  };

  const handleUpdateChar = async () => {
    if (!editingChar) return;

    try {
      const token = localStorage.getItem("token");
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const data = {
        description: charDescription || "",
      };

      await axios.put(`${BASE_API}/plant-characteristics/${editingChar.id}`, data, { headers });

      alert("Characteristic updated successfully!");
      setOpenEditCharDialog(false);
      setEditingChar(null);
      setCharDescription("");
      await fetchAllData();
    } catch (error) {
      console.error("Error updating characteristic:", error);
      alert("Failed to update characteristic: " + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteChar = async (charId) => {
    if (!window.confirm("Are you sure you want to delete this characteristic?")) return;

    try {
      const token = localStorage.getItem("token");
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      await axios.delete(`${BASE_API}/plant-characteristics/${charId}`, { headers });

      alert("Characteristic deleted successfully!");
      await fetchAllData();
    } catch (error) {
      console.error("Error deleting characteristic:", error);
      alert("Failed to delete characteristic: " + (error.response?.data?.message || error.message));
    }
  };

  const handleAddApplication = async () => {
    if (!selectedAppCategoryId) {
      alert("Please select an application category!");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const categoryName = applicationCategories.find((cat) => cat.id === selectedAppCategoryId)?.name || "Unknown";
      const data = {
        plantId,
        applicationCategoryId: selectedAppCategoryId,
        applicationName: categoryName, // Set applicationName to the category name
        description: appDescription || "",
      };

      await axios.post(`${BASE_API}/plant-applications`, data, { headers });

      alert("Application added successfully!");
      setOpenAddAppDialog(false);
      setSelectedAppCategoryId("");
      setAppDescription("");
      await fetchAllData();
    } catch (error) {
      console.error("Error adding application:", error);
      alert("Failed to add application: " + (error.response?.data?.message || error.message));
    }
  };

  const handleUpdateApp = async () => {
    if (!editingApp) return;

    try {
      const token = localStorage.getItem("token");
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const data = {
        description: appDescription || "",
      };

      await axios.put(`${BASE_API}/plant-applications/${editingApp.id}`, data, { headers });

      alert("Application updated successfully!");
      setOpenEditAppDialog(false);
      setEditingApp(null);
      setAppDescription("");
      await fetchAllData();
    } catch (error) {
      console.error("Error updating application:", error);
      alert("Failed to update application: " + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteApp = async (appId) => {
    if (!window.confirm("Are you sure you want to delete this application?")) return;

    try {
      const token = localStorage.getItem("token");
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      await axios.delete(`${BASE_API}/plant-applications/${appId}`, { headers });

      alert("Application deleted successfully!");
      await fetchAllData();
    } catch (error) {
      console.error("Error deleting application:", error);
      alert("Failed to delete application: " + (error.response?.data?.message || error.message));
    }
  };

  const handleOpenEditDialog = () => {
    if (category) {
      setEditFormData({
        name: category.name || "",
        scientificName: category.scientificName || "",
        family: category.family || "",
        habitat: category.habitat || "",
        distribution: category.distribution || "",
        description: category.description || "",
      });
    }
    setOpenEditDialog(true);
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditSubmit = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      await axios.put(`${BASE_API}/plants/${plantId}`, editFormData, { headers });

      alert("Plant updated successfully!");
      setOpenEditDialog(false);
      await fetchAllData();
    } catch (error) {
      console.error("Error updating plant:", error);
      alert("Failed to update plant: " + (error.response?.data?.message || error.message));
    }
  };

  const handleOpenAddCharDialog = () => {
    setOpenAddCharDialog(true);
  };

  const handleCloseAddCharDialog = () => {
    setOpenAddCharDialog(false);
    setSelectedCharCategoryIds([]);
    setCharDescription("");
  };

  const handleOpenEditCharDialog = (char) => {
    setEditingChar(char);
    setCharDescription(char.description || "");
    setOpenEditCharDialog(true);
  };

  const handleCloseEditCharDialog = () => {
    setOpenEditCharDialog(false);
    setEditingChar(null);
    setCharDescription("");
  };

  const handleOpenAddAppDialog = () => {
    setOpenAddAppDialog(true);
  };

  const handleCloseAddAppDialog = () => {
    setOpenAddAppDialog(false);
    setSelectedAppCategoryId("");
    setAppDescription("");
  };

  const handleOpenEditAppDialog = (app) => {
    setEditingApp(app);
    setAppDescription(app.description || "");
    setOpenEditAppDialog(true);
  };

  const handleCloseEditAppDialog = () => {
    setOpenEditAppDialog(false);
    setEditingApp(null);
    setAppDescription("");
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

  const currentCharCategoryIds = characteristics.map((char) => char.characteristicCategoryId);
  const currentAppCategoryIds = [...new Set(applications.map((app) => app.applicationCategoryId))];

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
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h6" sx={{ fontWeight: "bold", color: "#2d3436" }}>
            Category
          </Typography>
          <Button
            variant="outlined"
            color="primary"
            onClick={handleOpenEditDialog}
            disabled={role !== "staff"}
          >
            Edit
          </Button>
        </Box>
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
              <strong>Family:</strong> {category.family || "N/A"}
            </Typography>
            <Typography variant="body1" sx={{ marginBottom: "5px" }}>
              <strong>Habitat:</strong> {category.habitat || "N/A"}
            </Typography>
            <Typography variant="body1" sx={{ marginBottom: "5px" }}>
              <strong>Distribution:</strong> {category.distribution || "N/A"}
            </Typography>
            <Typography variant="body1">
              <strong>Description:</strong> {category.description || "No description available"}
            </Typography>
          </>
        ) : (
          <Typography color="text.secondary">No category information available.</Typography>
        )}
      </Paper>

      {/* Edit Dialog */}
      <Dialog open={openEditDialog} onClose={handleCloseEditDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Plant Details</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Name"
            name="name"
            value={editFormData.name}
            onChange={handleEditFormChange}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Scientific Name"
            name="scientificName"
            value={editFormData.scientificName}
            onChange={handleEditFormChange}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Family"
            name="family"
            value={editFormData.family}
            onChange={handleEditFormChange}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Habitat"
            name="habitat"
            value={editFormData.habitat}
            onChange={handleEditFormChange}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Distribution"
            name="distribution"
            value={editFormData.distribution}
            onChange={handleEditFormChange}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Description"
            name="description"
            value={editFormData.description}
            onChange={handleEditFormChange}
            margin="normal"
            multiline
            rows={4}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleEditSubmit} color="primary" variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Characteristics Section */}
      <Paper sx={{ padding: "20px", marginBottom: "20px", borderRadius: "10px", boxShadow: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h6" sx={{ fontWeight: "bold", color: "#2d3436" }}>
            Characteristics
          </Typography>
          <Box>
            <Button
              variant="contained"
              color="primary"
              onClick={handleOpenAddCharDialog}
              disabled={role !== "staff"}
            >
              Add Characteristic
            </Button>
          </Box>
        </Box>
        <Divider sx={{ marginY: "10px" }} />
        {characteristics.length > 0 ? (
          characteristics.map((char) => (
            <Box
              key={char.id}
              sx={{
                marginBottom: "15px",
                padding: "10px",
                border: "1px solid #e0e0e0",
                borderRadius: "5px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box>
                <Typography variant="body1" sx={{ marginBottom: "5px" }}>
                  <strong>
                    {characteristicCategories.find((cat) => cat.id === char.characteristicCategoryId)?.name || "Unknown Category"}
                  </strong>
                </Typography>
                <Typography variant="body1">
                  <strong>Description:</strong> {char.description || "No description available"}
                </Typography>
              </Box>
              {role === "staff" && (
                <Box>
                  <Button
                    variant="outlined"
                    color="primary"
                    size="small"
                    onClick={() => handleOpenEditCharDialog(char)}
                    sx={{ marginRight: "10px" }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => handleDeleteChar(char.id)}
                  >
                    Delete
                  </Button>
                </Box>
              )}
            </Box>
          ))
        ) : (
          <Typography color="text.secondary">No characteristics found.</Typography>
        )}
      </Paper>

      {/* Add Characteristic Dialog */}
      <Dialog open={openAddCharDialog} onClose={handleCloseAddCharDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Characteristic</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ marginBottom: "20px", marginTop: "10px" }}>
            <InputLabel>Select Characteristic Categories</InputLabel>
            <Select
              multiple
              value={selectedCharCategoryIds}
              onChange={(e) => setSelectedCharCategoryIds(e.target.value)}
              label="Select Characteristic Categories"
              renderValue={(selected) => (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip
                      key={value}
                      label={characteristicCategories.find((cat) => cat.id === value)?.name}
                    />
                  ))}
                </Box>
              )}
            >
              {characteristicCategories
                .filter((cat) => !currentCharCategoryIds.includes(cat.id))
                .map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Description"
            value={charDescription}
            onChange={(e) => setCharDescription(e.target.value)}
            margin="normal"
            placeholder="Enter the description for the selected categories"
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddCharDialog} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleAddCharCategories} color="primary" variant="contained">
            Add
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Characteristic Dialog */}
      <Dialog open={openEditCharDialog} onClose={handleCloseEditCharDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Characteristic</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ marginBottom: "20px" }}>
            <strong>Category:</strong>{" "}
            {editingChar
              ? characteristicCategories.find((cat) => cat.id === editingChar.characteristicCategoryId)?.name || "Unknown Category"
              : ""}
          </Typography>
          <TextField
            fullWidth
            label="Description"
            value={charDescription}
            onChange={(e) => setCharDescription(e.target.value)}
            margin="normal"
            placeholder="Enter the description for this characteristic"
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditCharDialog} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleUpdateChar} color="primary" variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Applications Section */}
      <Paper sx={{ padding: "20px", borderRadius: "10px", boxShadow: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h6" sx={{ fontWeight: "bold", color: "#2d3436" }}>
            Applications
          </Typography>
          <Box>
            <Button
              variant="contained"
              color="primary"
              onClick={handleOpenAddAppDialog}
              disabled={role !== "staff"}
            >
              Add Application
            </Button>
          </Box>
        </Box>
        <Divider sx={{ marginY: "10px" }} />
        {applications.length > 0 ? (
          applications.map((app) => (
            <Box
              key={app.id}
              sx={{
                marginBottom: "15px",
                padding: "10px",
                border: "1px solid #e0e0e0",
                borderRadius: "5px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box>
                <Typography variant="body1" sx={{ marginBottom: "5px" }}>
                  <strong>
                    {applicationCategories.find((cat) => cat.id === app.applicationCategoryId)?.name || "Unknown Category"}
                  </strong>
                </Typography>
                <Typography variant="body1">
                  <strong>Description:</strong> {app.description || "No description available"}
                </Typography>
              </Box>
              {role === "staff" && (
                <Box>
                  <Button
                    variant="outlined"
                    color="primary"
                    size="small"
                    onClick={() => handleOpenEditAppDialog(app)}
                    sx={{ marginRight: "10px" }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => handleDeleteApp(app.id)}
                  >
                    Delete
                  </Button>
                </Box>
              )}
            </Box>
          ))
        ) : (
          <Typography color="text.secondary">No applications found.</Typography>
        )}
      </Paper>

      {/* Add Application Dialog */}
      <Dialog open={openAddAppDialog} onClose={handleCloseAddAppDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Application</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ marginBottom: "20px", marginTop: "10px" }}>
            <InputLabel>Select Application Category</InputLabel>
            <Select
              value={selectedAppCategoryId}
              onChange={(e) => setSelectedAppCategoryId(e.target.value)}
              label="Select Application Category"
            >
              {applicationCategories
                .filter((cat) => !currentAppCategoryIds.includes(cat.id))
                .map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Description"
            value={appDescription}
            onChange={(e) => setAppDescription(e.target.value)}
            margin="normal"
            placeholder="Enter the description for this application"
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddAppDialog} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleAddApplication} color="primary" variant="contained">
            Add
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Application Dialog */}
      <Dialog open={openEditAppDialog} onClose={handleCloseEditAppDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Application</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ marginBottom: "20px" }}>
            <strong>Category:</strong>{" "}
            {editingApp
              ? applicationCategories.find((cat) => cat.id === editingApp.applicationCategoryId)?.name || "Unknown Category"
              : ""}
          </Typography>
          <TextField
            fullWidth
            label="Description"
            value={appDescription}
            onChange={(e) => setAppDescription(e.target.value)}
            margin="normal"
            placeholder="Enter the description for this application"
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditAppDialog} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleUpdateApp} color="primary" variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PlantDetail;