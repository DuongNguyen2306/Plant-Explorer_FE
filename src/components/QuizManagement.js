import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardMedia, Typography, Button, Grid, TextField, Box } from "@mui/material";

const API_URL = "https://plant-explorer-backend-0-0-1.onrender.com/api/quizzes";

const QuizManagement = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const res = await axios.get(`${API_URL}?index=1&pageSize=10`);
      setQuizzes(res.data?.data?.items || []);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách quiz:", error);
    }
  };

  return (
    <Box sx={{ padding: 4, backgroundColor: "#e3eafc", minHeight: "100vh" }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Quiz Management
      </Typography>
      
      <Box sx={{ display: "flex", gap: 2, marginBottom: 3 }}>
        <TextField
          label="Search Quiz"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          variant="outlined"
          fullWidth
        />
        <Button onClick={fetchQuizzes} variant="contained" color="primary">
          REFRESH
        </Button>
      </Box>

      <Grid container spacing={3}>
        {quizzes.map((quiz) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={quiz.id}>
            <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
              <CardMedia
                component="img"
                height="180"
                image={quiz.imageUrl || "https://via.placeholder.com/300"}
                alt={quiz.name}
              />
              <CardContent>
                <Typography variant="h6" fontWeight="bold">{quiz.name}</Typography>
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  sx={{ marginTop: 2 }}
                  onClick={() => navigate(`/quizzes/${quiz.id}/questions`)}
                >
                  VIEW
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default QuizManagement;
