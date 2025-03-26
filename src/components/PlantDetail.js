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
  Chip,
  MenuItem,
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

      const characteristicsData = charRes.data?.data?.items || charRes.data || [];
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

  const handleAddCharCategories = async (newCategories) => {
    try {
      const token = localStorage.getItem("token");
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      // Create a new characteristic for each selected category
      for (const categoryId of newCategories) {
        // Check if a characteristic with this category already exists
        const existingChar = characteristics.find(
          (char) => char.characteristicCategoryId === categoryId
        );
        if (!existingChar) {
          const categoryName = characteristicCategories.find((cat) => cat.id === categoryId)?.name || "Unknown";
          const data = {
            plantId,
            characteristicCategoryId: categoryId,
            characteristicName: `${categoryName} Characteristic`, // Use category name for better context
            value: "Default Value",
          };
          await axios.post(`${BASE_API}/plant-characteristics`, data, { headers });
        }
      }

      // Remove characteristics that are no longer selected
      for (const char of characteristics) {
        if (!newCategories.includes(char.characteristicCategoryId)) {
          await axios.delete(`${BASE_API}/plant-characteristics/${char.id}`, { headers });
        }
      }

      alert("Characteristic categories updated successfully!");
      await fetchAllData();
    } catch (error) {
      console.error("Error adding characteristic categories:", error);
      alert("Failed to add characteristic categories: " + (error.response?.data?.message || error.message));
    }
  };

  const handleAddAppCategories = async (newCategories) => {
    try {
      const token = localStorage.getItem("token");
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      // Create a new application for each selected category
      for (const categoryId of newCategories) {
        // Check if an application with this category already exists
        const existingApp = applications.find(
          (app) => app.applicationCategoryId === categoryId
        );
        if (!existingApp) {
          const categoryName = applicationCategories.find((cat) => cat.id === categoryId)?.name || "Unknown";
          const data = {
            plantId,
            applicationCategoryId: categoryId,
            applicationName: `${categoryName} Application`, // Use category name for better context
            description: "Default Description",
          };
          await axios.post(`${BASE_API}/plant-applications`, data, { headers });
        }
      }

      // Remove applications that are no longer selected
      for (const app of applications) {
        if (!newCategories.includes(app.applicationCategoryId)) {
          await axios.delete(`${BASE_API}/plant-applications/${app.id}`, { headers });
        }
      }

      alert("Application categories updated successfully!");
      await fetchAllData();
    } catch (error) {
      console.error("Error adding application categories:", error);
      alert("Failed to add application categories: " + (error.response?.data?.message || error.message));
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

  // Get the currently selected category IDs from the characteristics and applications
  const currentCharCategoryIds = characteristics.map((char) => char.characteristicCategoryId);
  const currentAppCategoryIds = applications.map((app) => app.applicationCategoryId);

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
          <Box>
            <FormControl sx={{ minWidth: 200, marginRight: "10px" }}>
              <InputLabel>Select Categories</InputLabel>
              <Select
                multiple
                value={currentCharCategoryIds}
                onChange={(e) => {
                  const newCategories = e.target.value;
                  handleAddCharCategories(newCategories);
                }}
                label="Select Categories"
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
                {characteristicCategories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>
        <Divider sx={{ marginY: "10px" }} />
        {characteristics.length > 0 ? (
          characteristics.map((char) => (
            <Box key={char.id} sx={{ marginBottom: "10px" }}>
              <Typography variant="body1">
                <strong>
                  {characteristicCategories.find((cat) => cat.id === char.characteristicCategoryId)?.name || "Unknown Category"}:
                </strong>{" "}
                {char.characteristicName} - {char.value}
              </Typography>
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
          <Box>
            <FormControl sx={{ minWidth: 200, marginRight: "10px" }}>
              <InputLabel>Select Categories</InputLabel>
              <Select
                multiple
                value={currentAppCategoryIds}
                onChange={(e) => {
                  const newCategories = e.target.value;
                  handleAddAppCategories(newCategories);
                }}
                label="Select Categories"
                renderValue={(selected) => (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip
                        key={value}
                        label={applicationCategories.find((cat) => cat.id === value)?.name}
                      />
                    ))}
                  </Box>
                )}
              >
                {applicationCategories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>
        <Divider sx={{ marginY: "10px" }} />
        {applications.length > 0 ? (
          applications.map((app) => (
            <Box key={app.id} sx={{ marginBottom: "10px" }}>
              <Typography variant="body1">
                <strong>
                  {applicationCategories.find((cat) => cat.id === app.applicationCategoryId)?.name || "Unknown Category"}:
                </strong>{" "}
                {app.applicationName} - {app.description}
              </Typography>
            </Box>
          ))
        ) : (
          <Typography color="text.secondary">No applications found.</Typography>
        )}
      </Paper>
    </Box>
  );
};

export default PlantDetail;