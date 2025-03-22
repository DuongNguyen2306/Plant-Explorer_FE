import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Grid,
  TextField,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Pagination,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";

const API_URL = "https://plant-explorer-backend-0-0-1.onrender.com/api/quizzes";

const QuizManagement = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [page, setPage] = useState(1);
  const quizzesPerPage = 6;
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const res = await axios.get(`${API_URL}?index=1&pageSize=100`);
      setQuizzes(res.data?.data?.items || []);
    } catch (error) {
      console.error("Error fetching quizzes:", error);
    }
  };

  const handleOpenDialog = (quiz = null) => {
    setEditingQuiz(quiz || { name: "", imageUrl: "" });
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setEditingQuiz(null);
  };

  const handleSaveQuiz = async () => {
    try {
      if (editingQuiz.id) {
        await axios.put(`${API_URL}/quiz?id=${editingQuiz.id}`, editingQuiz);
      } else {
        await axios.post(`${API_URL}/quiz`, editingQuiz);
      }
      fetchQuizzes();
      handleCloseDialog();
    } catch (error) {
      console.error("Error saving quiz:", error);
    }
  };

  const handleDeleteQuiz = async (id) => {
    try {
      await axios.delete(`${API_URL}/quiz?id=${id}`);
      fetchQuizzes();
    } catch (error) {
      console.error("Error deleting quiz:", error);
    }
  };

  const filteredQuizzes = quizzes.filter(quiz =>
    quiz.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredQuizzes.length / quizzesPerPage);
  const currentQuizzes = filteredQuizzes.slice((page - 1) * quizzesPerPage, page * quizzesPerPage);

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
        <Button variant="contained" color="success" onClick={() => handleOpenDialog()}>Add Quiz</Button>
        <Button onClick={fetchQuizzes} variant="contained" color="primary">
          REFRESH
        </Button>
      </Box>

      <Grid container spacing={3}>
        {currentQuizzes.map((quiz) => (
          <Grid item xs={12} sm={6} md={4} lg={4} key={quiz.id}>
            <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
              <CardMedia
                component="img"
                height="180"
                image={quiz.imageUrl !== "null" && quiz.imageUrl ? quiz.imageUrl : "https://via.placeholder.com/300"}
                alt={quiz.name}
              />
              <CardContent>
                <Typography variant="h6" fontWeight="bold">{quiz.name}</Typography>
                <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => navigate(`/quizzes/${quiz.id}/questions`)}
                  >
                    VIEW
                  </Button>
                  <IconButton color="info" onClick={() => handleOpenDialog(quiz)}><Edit /></IconButton>
                  <IconButton color="error" onClick={() => handleDeleteQuiz(quiz.id)}><Delete /></IconButton>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={(e, value) => setPage(value)}
          color="primary"
        />
      </Box>

      <Dialog open={open} onClose={handleCloseDialog}>
        <DialogTitle>{editingQuiz?.id ? "Edit Quiz" : "Add Quiz"}</DialogTitle>
        <DialogContent>
          <TextField
            label="Quiz Name"
            fullWidth
            margin="dense"
            value={editingQuiz?.name || ""}
            onChange={(e) => setEditingQuiz({ ...editingQuiz, name: e.target.value })}
          />
          <TextField
            label="Image URL"
            fullWidth
            margin="dense"
            value={editingQuiz?.imageUrl || ""}
            onChange={(e) => setEditingQuiz({ ...editingQuiz, imageUrl: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveQuiz} color="primary">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default QuizManagement;
