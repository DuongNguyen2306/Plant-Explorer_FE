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
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import { Edit, Delete, Refresh } from "@mui/icons-material";
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
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const quizzesPerPage = 6;
  const navigate = useNavigate();

  useEffect(() => {
    getUserRoleFromAPI().then(setRole);
  }, []);

  useEffect(() => {
    if (role === "staff" || role === "children") fetchQuizzes();
  }, [role, page]);

  const fetchQuizzes = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setSnackbar({ open: true, message: "Authentication token is required to fetch quizzes!", severity: "error" });
      return;
    }

    setLoading(true);
    try {
      const index = page; // Theo API documentation, index bắt đầu từ 1
      const res = await axios.get(API_URL, {
        params: {
          index: index,
          pageSize: quizzesPerPage,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const fetchedQuizzes = res.data?.data?.items || [];
      const totalItems = res.data?.data?.totalCount || 0;

      setQuizzes(fetchedQuizzes);
      setTotalPages(Math.ceil(totalItems / quizzesPerPage));

      if (fetchedQuizzes.length === 0) {
        setSnackbar({ open: true, message: "No quizzes found.", severity: "info" });
      } else {
        setSnackbar({ open: true, message: "Quizzes loaded successfully!", severity: "success" });
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to fetch quizzes.";
      console.error("Full error response:", error.response);
      setSnackbar({ open: true, message: `Error fetching quizzes: ${errorMessage}`, severity: "error" });
    } finally {
      setLoading(false);
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
    if (!editingQuiz.name) {
      setSnackbar({ open: true, message: "Quiz name is required!", severity: "warning" });
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setSnackbar({ open: true, message: "Authentication token is required to save quizzes!", severity: "error" });
      return;
    }

    // Kiểm tra imageUrl chỉ khi tạo mới (không có id)
    if (!editingQuiz.id && (!editingQuiz.imageUrl || editingQuiz.imageUrl.trim() === "")) {
      setSnackbar({ open: true, message: "Please provide a valid image URL for the new quiz!", severity: "warning" });
      return;
    }

    try {
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      // Chỉ gửi các trường name và imageUrl theo API documentation
      const data = {
        name: editingQuiz.name,
        imageUrl: editingQuiz.imageUrl || "", // Nếu không có imageUrl, gửi chuỗi rỗng (sẽ bị backend từ chối nếu không hợp lệ)
      };

      setLoading(true);
      if (editingQuiz.id) {
        // Cập nhật quiz (PUT)
        await axios.put(`${API_URL}/${editingQuiz.id}`, { ...data, description: editingQuiz.description || "" }, { headers });
        setSnackbar({ open: true, message: "Quiz updated successfully!", severity: "success" });
      } else {
        // Thêm quiz mới (POST)
        await axios.post(API_URL, data, { headers }); // Sửa URL từ /api/quizzes/quiz thành /api/quizzes
        setSnackbar({ open: true, message: "Quiz added successfully!", severity: "success" });
      }
      await fetchQuizzes();
      handleCloseDialog();
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to save quiz.";
      console.error("Full error response:", error.response);
      setSnackbar({ open: true, message: `Error saving quiz: ${errorMessage}`, severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuiz = async (id) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setSnackbar({ open: true, message: "Authentication token is required to delete quizzes!", severity: "error" });
      return;
    }

    setLoading(true);
    try {
      await axios.delete(`${API_URL}/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      await fetchQuizzes();
      setSnackbar({ open: true, message: "Quiz deleted successfully!", severity: "success" });
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to delete quiz.";
      console.error("Full error response:", error.response);
      setSnackbar({ open: true, message: `Error deleting quiz: ${errorMessage}`, severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const filteredQuizzes = quizzes.filter(quiz =>
    quiz.name.toLowerCase().includes(search.toLowerCase())
  );

  if (role === null) return (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <CircularProgress />
    </Box>
  );

  if (role !== "staff" && role !== "children") return (
    <Box sx={{ textAlign: "center", mt: 5 }}>
      <Typography variant="h6" color="error">
        You do not have permission to access Quiz Management.
      </Typography>
    </Box>
  );

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
                disabled={loading}
                sx={{ minWidth: 120 }}
              >
                Add Quiz
              </Button>
              <Button
                onClick={fetchQuizzes}
                variant="outlined"
                color="primary"
                startIcon={<Refresh />}
                disabled={loading}
                sx={{ minWidth: 120 }}
              >
                Refresh
              </Button>
            </>
          )}
        </Box>
      </Box>

      {/* Loading Indicator */}
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", my: 3 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Quiz Cards Section */}
      <Box className="quiz-list-container">
        <Grid container spacing={4}>
          {filteredQuizzes.map((quiz) => (
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
                  onError={(e) => (e.target.src = "https://via.placeholder.com/300")}
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
                        disabled={loading}
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        className="delete-icon"
                        onClick={() => handleDeleteQuiz(quiz.id)}
                        disabled={loading}
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

        {filteredQuizzes.length === 0 && !loading && (
          <Typography variant="h6" color="text.secondary" sx={{ mt: 4, textAlign: "center" }}>
            No quizzes found.
          </Typography>
        )}

        {totalPages > 1 && (
          <Box className="quiz-pagination">
            <Pagination
              count={totalPages}
              page={page}
              onChange={(e, value) => setPage(value)}
              color="primary"
              size="large"
            />
          </Box>
        )}
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
              required
              error={!editingQuiz?.name}
              helperText={!editingQuiz?.name ? "Quiz name is required" : ""}
            />
            <TextField
              label="Image URL"
              fullWidth
              margin="dense"
              value={editingQuiz?.imageUrl || ""}
              onChange={(e) => setEditingQuiz({ ...editingQuiz, imageUrl: e.target.value })}
              required={!editingQuiz?.id} // Chỉ bắt buộc khi tạo mới
              error={!editingQuiz?.id && (!editingQuiz?.imageUrl || editingQuiz?.imageUrl.trim() === "")}
              helperText={!editingQuiz?.id && (!editingQuiz?.imageUrl || editingQuiz?.imageUrl.trim() === "") ? "Image URL is required for new quizzes" : ""}
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
                  style={{ maxWidth: "100%", height: "auto" }}
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
            <Button onClick={handleCloseDialog} disabled={loading}>Cancel</Button>
            <Button onClick={handleSaveQuiz} color="primary" disabled={loading}>
              {loading ? <CircularProgress size={24} /> : "Save"}
            </Button>
          </DialogActions>
        </Dialog>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default QuizManagement;