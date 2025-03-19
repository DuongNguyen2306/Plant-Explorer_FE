import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, Typography, Button, Grid, Box } from "@mui/material";
import ImagePlaceholder from "../assets/placeholder.png";

const API_URL = "https://plant-explorer-backend-0-0-1.onrender.com/api/questions";

const QuestionManagement = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    fetchQuestions();
  }, [quizId]);

  const fetchQuestions = async () => {
    try {
      const res = await axios.get(`${API_URL}?quizId=${quizId}`);
      setQuestions(res.data?.data?.items || []);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách câu hỏi:", error);
    }
  };

  return (
    <Box sx={{ padding: 4, backgroundColor: "#e3eafc", minHeight: "100vh" }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Question Management
      </Typography>

      <Button onClick={fetchQuestions} variant="contained" color="primary" sx={{ marginBottom: 3 }}>
        REFRESH
      </Button>

      <Grid container spacing={3}>
        {questions.map((question) => (
          <Grid item xs={12} sm={6} md={4} key={question.id}>
            <Card sx={{ borderRadius: 3, boxShadow: 3, textAlign: "center", padding: 2 }}>
              <CardContent>
                <img
                  src={question.imageUrl || ImagePlaceholder}
                  alt="Question"
                  style={{ width: "100%", height: "150px", objectFit: "cover", borderRadius: "8px" }}
                />
                <Typography variant="h6" fontWeight="bold" sx={{ marginTop: 2 }}>
                  {question.name}
                </Typography>
                <Typography color="text.secondary">{question.context}</Typography>
                <Button
                  onClick={() => navigate(`/quizzes/${quizId}/questions/${question.id}/options`)}
                  variant="contained"
                  color="primary"
                  sx={{ marginTop: 2 }}
                >
                  VIEW OPTIONS
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default QuestionManagement;
