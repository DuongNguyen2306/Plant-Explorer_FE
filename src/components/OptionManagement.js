import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { Card, CardContent, Typography, Button, Grid, Box } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";

const API_URL = "https://plant-explorer-backend-0-0-1.onrender.com/api/options";

const OptionManagement = () => {
  const { questionId } = useParams();
  const [options, setOptions] = useState([]);

  useEffect(() => {
    fetchOptions();
  }, [questionId]);

  const fetchOptions = async () => {
    try {
      const res = await axios.get(`${API_URL}?questionId=${questionId}`);
      setOptions(res.data?.data?.items || []);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách tùy chọn:", error);
    }
  };

  return (
    <Box sx={{ padding: 4, backgroundColor: "#e3eafc", minHeight: "100vh" }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Option Management
      </Typography>

      <Button onClick={fetchOptions} variant="contained" color="primary" sx={{ marginBottom: 3 }}>
        REFRESH
      </Button>

      <Grid container spacing={3}>
        {options.map((option) => (
          <Grid item xs={12} sm={6} md={4} key={option.id}>
            <Card sx={{ borderRadius: 3, boxShadow: 3, textAlign: "center", padding: 2 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold">
                  {option.text || "No Text"}
                </Typography>
                {option.correct ? (
                  <CheckCircleIcon color="success" sx={{ fontSize: 40, marginTop: 1 }} />
                ) : (
                  <CancelIcon color="error" sx={{ fontSize: 40, marginTop: 1 }} />
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default OptionManagement;
