import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Card, CardContent, CardMedia, Typography, Button, Grid, Box } from "@mui/material";

const API_URL = "https://66937520c6be000fa07b9d27.mockapi.io/quizzes";

const QuizList = () => {
  const [quizzes, setQuizzes] = useState([]);

  useEffect(() => {
    axios.get(API_URL)
      .then(response => setQuizzes(response.data))
      .catch(error => console.error("Error fetching quizzes:", error));
  }, []);

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        📚 Danh sách Quiz
      </Typography>
      <Grid container spacing={3}>
        {quizzes.map(quiz => (
          <Grid item xs={12} sm={6} md={4} key={quiz.id}>
            <Card sx={{ maxWidth: 345 }}>
              <CardMedia component="img" height="200" image={quiz.image} alt={quiz.title} />
              <CardContent>
                <Typography variant="h6" component="div">{quiz.title}</Typography>
                <Typography variant="body2" color="text.secondary">{quiz.description}</Typography>
                <Button
                  component={Link}
                  to={`/quizzes/${quiz.id}`}
                  variant="contained"
                  sx={{ marginTop: 2 }}
                >
                  Xem Quiz
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default QuizList;
