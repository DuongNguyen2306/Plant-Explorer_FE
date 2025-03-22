import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { Box, Typography, Paper, Divider } from "@mui/material";
import { BASE_API } from "../constant";

const PlantDetail = () => {
  const { plantId } = useParams();
  const [characteristics, setCharacteristics] = useState([]);
  const [applications, setApplications] = useState([]);
  const [category, setCategory] = useState(null);

  useEffect(() => {
    fetchAllData();
  }, [plantId]);

  const fetchAllData = async () => {
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
    } catch (error) {
      console.error("Error fetching detail:", error);
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>Plant Detail</Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6">Category</Typography>
        <Divider sx={{ my: 1 }} />
        <Typography>Name: {category?.name}</Typography>
        <Typography>Scientific Name: {category?.scientificName}</Typography>
        <Typography>Category: {category?.category}</Typography>
      </Paper>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6">Characteristics</Typography>
        <Divider sx={{ my: 1 }} />
        {characteristics.length > 0 ? (
          characteristics.map((char) => (
            <Box key={char.id} mb={1}>
              <Typography>{char.characteristicName}: {char.value}</Typography>
            </Box>
          ))
        ) : (
          <Typography>No characteristics found.</Typography>
        )}
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Typography variant="h6">Applications</Typography>
        <Divider sx={{ my: 1 }} />
        {applications.length > 0 ? (
          applications.map((app) => (
            <Box key={app.id} mb={1}>
              <Typography>{app.applicationName}: {app.description}</Typography>
            </Box>
          ))
        ) : (
          <Typography>No applications found.</Typography>
        )}
      </Paper>
    </Box>
  );
};

export default PlantDetail;
