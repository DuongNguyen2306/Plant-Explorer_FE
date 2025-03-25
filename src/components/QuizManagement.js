// 📁 components/QuizManagement.js
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
import { getUserRoleFromAPI } from "../utils/roleUtils";
import "../css/QuizManagement.css";

const API_URL = "https://plant-explorer-backend-0-0-1.onrender.com/api/quizzes";

const QuizManagement = () => {
  const [role, setRole] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [page, setPage] = useState(1);
  const quizzesPerPage = 6;
  const navigate = useNavigate();

  useEffect(() => {
    getUserRoleFromAPI().then(setRole);
  }, []);

  useEffect(() => {
    if (role === "staff" || role === "children") fetchQuizzes();
  }, [role]);

  const fetchQuizzes = async () => {
    try {
      const res = await axios.get(`${API_URL}?index=1&pageSize=100`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const fetchedQuizzes = res.data?.data?.items || [];
      setQuizzes(fetchedQuizzes);
    } catch (error) {
      console.error("Error fetching quizzes:", error);
      alert("Failed to fetch quizzes: " + (error.response?.data?.message || error.message));
    }
  };

  const handleOpenDialog = (quiz = null) => {
    setEditingQuiz(quiz || { name: "", imageUrl: "", description: "" });
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setEditingQuiz(null);
  };

  const handleSaveQuiz = async () => {
    try {
      const headers = {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      };

      const data = {
        name: editingQuiz.name,
        imageUrl: editingQuiz.imageUrl || "",
        description: editingQuiz.description || "",
      };

      if (editingQuiz.id) {
        await axios.put(`${API_URL}/quiz?id=${editingQuiz.id}`, data, { headers });
      } else {
        if (!editingQuiz.imageUrl) {
          alert("Please provide an image URL for the new quiz");
          return;
        }
        await axios.post(`${API_URL}/quiz`, data, { headers });
      }
      await fetchQuizzes();
      handleCloseDialog();
      alert("Quiz saved successfully!");
    } catch (error) {
      console.error("Error saving quiz:", error);
      alert("Failed to save quiz: " + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteQuiz = async (id) => {
    try {
      await axios.delete(`${API_URL}/quiz?id=${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      await fetchQuizzes();
      alert("Quiz deleted successfully!");
    } catch (error) {
      console.error("Error deleting quiz:", error);
      alert("Failed to delete quiz: " + (error.response?.data?.message || error.message));
    }
  };

  const filteredQuizzes = quizzes.filter(quiz =>
    quiz.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredQuizzes.length / quizzesPerPage);
  const currentQuizzes = filteredQuizzes.slice((page - 1) * quizzesPerPage, page * quizzesPerPage);

  if (role === null) return <p>Loading...</p>;
  if (role !== "staff" && role !== "children") return <p style={{ color: "red" }}>You do not have permission to access Quiz Management.</p>;

  return (
    <Box className="quiz-management-container">
      {/* Header Section */}
      <Box className="quiz-management-header">
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Quiz Management
        </Typography>

        <Box sx={{ display: "flex", gap: 2, marginBottom: 3 }}>
          <TextField
            label="Search Quiz"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            variant="outlined"
            sx={{ flex: 1 }}
          />
          {role === "staff" && (
            <>
              <Button
                variant="contained"
                color="success"
                onClick={() => handleOpenDialog()}
                sx={{ minWidth: 120 }}
              >
                Add Quiz
              </Button>
              <Button
                onClick={fetchQuizzes}
                variant="contained"
                color="primary"
                sx={{ minWidth: 120 }}
              >
                Refresh
              </Button>
            </>
          )}
        </Box>
      </Box>

      {/* Quiz Cards Section */}
      <Box className="quiz-list-container">
        <Grid container spacing={4}>
          {currentQuizzes.map((quiz) => (
            <Grid item xs={12} sm={6} md={6} key={quiz.id}>
              <Card className="quiz-card">
                <CardMedia
                  component="img"
                  image={
                    quiz.imageUrl && quiz.imageUrl !== "null"
                      ? quiz.imageUrl
                      : "https://via.placeholder.com/300"
                  }
                  alt={quiz.name}
                  onError={(e) => (e.target.src = "https://via.placeholder.com/300")} // Xử lý lỗi hình ảnh
                />
                <CardContent className="quiz-card-content">
                  <Typography variant="h5" fontWeight="bold" gutterBottom>
                    {quiz.name}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {quiz.description || "No description available"}
                  </Typography>
                </CardContent>
                <Box className="quiz-card-actions">
                  <Button
                    variant="contained"
                    onClick={() => navigate(`/quizzes/${quiz.id}/questions`)}
                  >
                    View
                  </Button>
                  {role === "staff" && (
                    <Box>
                      <IconButton
                        className="edit-icon"
                        onClick={() => handleOpenDialog(quiz)}
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        className="delete-icon"
                        onClick={() => handleDeleteQuiz(quiz.id)}
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  )}
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>

        {filteredQuizzes.length === 0 && (
          <Typography variant="h6" color="text.secondary" sx={{ mt: 4, textAlign: "center" }}>
            No quizzes found.
          </Typography>
        )}

        <Box className="quiz-pagination">
          <Pagination
            count={totalPages}
            page={page}
            onChange={(e, value) => setPage(value)}
            color="primary"
            size="large"
          />
        </Box>
      </Box>

      {role === "staff" && (
        <Dialog open={open} onClose={handleCloseDialog} maxWidth="sm" fullWidth className="quiz-dialog">
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
            {editingQuiz?.imageUrl && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Preview Image:
                </Typography>
                <img
                  src={
                    editingQuiz.imageUrl && editingQuiz.imageUrl !== "null"
                      ? editingQuiz.imageUrl
                      : "https://via.placeholder.com/300"
                  }
                  alt="Quiz preview"
                  onError={(e) => (e.target.src = "https://via.placeholder.com/300")}
                />
              </Box>
            )}
            <TextField
              label="Description"
              fullWidth
              margin="dense"
              multiline
              rows={3}
              value={editingQuiz?.description || ""}
              onChange={(e) => setEditingQuiz({ ...editingQuiz, description: e.target.value })}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleSaveQuiz} color="primary">Save</Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default QuizManagement;