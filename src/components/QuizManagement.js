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
  Container,
} from "@mui/material";
import { Edit, Delete, Refresh, AddCircle } from "@mui/icons-material";
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
  const quizzesPerPage = 8; // Updated to 8 to fit 4 quizzes per row (2 rows per page)
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
      const index = page;
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

    if (!editingQuiz.id && (!editingQuiz.imageUrl || editingQuiz.imageUrl.trim() === "")) {
      setSnackbar({ open: true, message: "Please provide a valid image URL for the new quiz!", severity: "warning" });
      return;
    }

    try {
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const data = {
        name: editingQuiz.name,
        imageUrl: editingQuiz.imageUrl || "",
      };

      setLoading(true);
      if (editingQuiz.id) {
        await axios.put(`${API_URL}/${editingQuiz.id}`, { ...data, description: editingQuiz.description || "" }, { headers });
        setSnackbar({ open: true, message: "Quiz updated successfully!", severity: "success" });
      } else {
        await axios.post(API_URL, data, { headers });
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
    <Container maxWidth="lg" sx={{ py: 4, backgroundColor: "#f5f7fa", minHeight: "100vh" }}>
      {/* Header Section */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4" fontWeight="bold" color="primary">
          Quiz Management
        </Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <TextField
            label="Search Quiz"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            variant="outlined"
            size="small"
            sx={{ width: 300 }}
          />
          {role === "staff" && (
            <>
              <Button
                variant="contained"
                color="success"
                startIcon={<AddCircle />}
                onClick={() => handleOpenDialog()}
                disabled={loading}
                sx={{
                  borderRadius: "20px",
                  textTransform: "none",
                  fontWeight: "bold",
                }}
              >
                Add Quiz
              </Button>
              <Button
                onClick={fetchQuizzes}
                variant="outlined"
                color="primary"
                startIcon={<Refresh />}
                disabled={loading}
                sx={{
                  borderRadius: "20px",
                  textTransform: "none",
                  fontWeight: "bold",
                }}
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
      <Box>
        <Grid container spacing={2}>
          {filteredQuizzes.map((quiz) => (
            <Grid item xs={12} sm={6} md={3} key={quiz.id}>
              <Card
                sx={{
                  borderRadius: "15px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  "&:hover": {
                    transform: "scale(1.02)",
                    boxShadow: "0 6px 16px rgba(0,0,0,0.15)",
                  },
                }}
              >
                <CardMedia
                  component="img"
                  height="140"
                  image={
                    quiz.imageUrl && quiz.imageUrl !== "null"
                      ? quiz.imageUrl
                      : "https://via.placeholder.com/300"
                  }
                  alt={quiz.name}
                  onError={(e) => (e.target.src = "https://via.placeholder.com/300")}
                  sx={{ objectFit: "cover" }}
                />
                <CardContent sx={{ padding: "12px" }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    {quiz.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {quiz.description || "No description available"}
                  </Typography>
                </CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "0 12px 12px",
                  }}
                >
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => navigate(`/quizzes/${quiz.id}/questions`)}
                    sx={{
                      borderRadius: "20px",
                      textTransform: "none",
                      fontWeight: "bold",
                      fontSize: "0.8rem",
                    }}
                  >
                    View
                  </Button>
                  {role === "staff" && (
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <IconButton
                        onClick={() => handleOpenDialog(quiz)}
                        disabled={loading}
                        sx={{
                          color: "#1976d2",
                          "&:hover": { backgroundColor: "rgba(25, 118, 210, 0.1)" },
                        }}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton
                        onClick={() => handleDeleteQuiz(quiz.id)}
                        disabled={loading}
                        sx={{
                          color: "#d32f2f",
                          "&:hover": { backgroundColor: "rgba(211, 47, 47, 0.1)" },
                        }}
                      >
                        <Delete fontSize="small" />
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
          <Box sx={{ display: "flex", justifyContent: "center", mt: 4, mb: 2 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(e, value) => setPage(value)}
              color="primary"
              size="large"
              sx={{
                "& .MuiPaginationItem-root": {
                  fontSize: "1.1rem",
                },
              }}
            />
          </Box>
        )}
      </Box>

      {role === "staff" && (
        <Dialog open={open} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ bgcolor: "primary.main", color: "white" }}>
            {editingQuiz?.id ? "Edit Quiz" : "Add Quiz"}
          </DialogTitle>
          <DialogContent sx={{ padding: "20px" }}>
            <TextField
              label="Quiz Name"
              fullWidth
              margin="dense"
              value={editingQuiz?.name || ""}
              onChange={(e) => setEditingQuiz({ ...editingQuiz, name: e.target.value })}
              required
              error={!editingQuiz?.name}
              helperText={!editingQuiz?.name ? "Quiz name is required" : ""}
              variant="outlined"
            />
            <TextField
              label="Image URL"
              fullWidth
              margin="dense"
              value={editingQuiz?.imageUrl || ""}
              onChange={(e) => setEditingQuiz({ ...editingQuiz, imageUrl: e.target.value })}
              required={!editingQuiz?.id}
              error={!editingQuiz?.id && (!editingQuiz?.imageUrl || editingQuiz?.imageUrl.trim() === "")}
              helperText={
                !editingQuiz?.id && (!editingQuiz?.imageUrl || editingQuiz?.imageUrl.trim() === "")
                  ? "Image URL is required for new quizzes"
                  : ""
              }
              variant="outlined"
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
                  style={{ maxWidth: "100%", height: "auto", borderRadius: "8px" }}
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
              variant="outlined"
            />
          </DialogContent>
          <DialogActions sx={{ padding: "16px", bgcolor: "#f5f7fa", borderTop: "1px solid #e0e0e0" }}>
            <Button
              onClick={handleCloseDialog}
              disabled={loading}
              sx={{ textTransform: "none", fontWeight: "bold" }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveQuiz}
              color="primary"
              variant="contained"
              disabled={loading}
              sx={{ borderRadius: "20px", textTransform: "none", fontWeight: "bold" }}
            >
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
    </Container>
  );
};

export default QuizManagement;