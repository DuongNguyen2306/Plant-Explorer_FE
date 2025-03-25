// 📁 components/PlantDetail.js
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
} from "@mui/material";
import { BASE_API } from "../constant";
import { getUserRoleFromAPI } from "../utils/roleUtils";

const PlantDetail = () => {
  const { plantId } = useParams();
  const [characteristics, setCharacteristics] = useState([]);
  const [applications, setApplications] = useState([]);
  const [category, setCategory] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    getUserRoleFromAPI().then(setRole);
  }, []);

  useEffect(() => {
    if (role === "staff" || role === "children") fetchAllData();
  }, [role, plantId]);

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
      setCharacteristics(charRes.data.data?.items || []);
      setApplications(appRes.data.data?.items || []);
      setCategory(catRes.data || null);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching detail:", error);
      setError("Failed to fetch plant details: " + (error.response?.data?.message || error.message));
      setLoading(false);
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
        <Typography variant="h6" sx={{ fontWeight: "bold", color: "#2d3436" }}>
          Characteristics
        </Typography>
        <Divider sx={{ marginY: "10px" }} />
        {characteristics.length > 0 ? (
          characteristics.map((char) => (
            <Box key={char.id} sx={{ marginBottom: "10px" }}>
              <Typography variant="body1">
                <strong>{char.characteristicName || "N/A"}:</strong> {char.value || "N/A"}
              </Typography>
            </Box>
          ))
        ) : (
          <Typography color="text.secondary">No characteristics found.</Typography>
        )}
      </Paper>

      {/* Applications Section */}
      <Paper sx={{ padding: "20px", borderRadius: "10px", boxShadow: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: "bold", color: "#2d3436" }}>
          Applications
        </Typography>
        <Divider sx={{ marginY: "10px" }} />
        {applications.length > 0 ? (
          applications.map((app) => (
            <Box key={app.id} sx={{ marginBottom: "10px" }}>
              <Typography variant="body1">
                <strong>{app.applicationName || "N/A"}:</strong> {app.description || "N/A"}
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