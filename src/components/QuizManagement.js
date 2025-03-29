import React, { useEffect, useState, useCallback } from "react";
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
  InputAdornment,
  Fade,
} from "@mui/material";
import { styled } from "@mui/system";
import { Edit, Delete, Refresh, AddCircle, Search } from "@mui/icons-material";
import { getUserRoleFromAPI } from "../utils/roleUtils";
import debounce from "lodash/debounce";
import "../css/QuizManagement.css";

const API_URL = "https://plant-explorer-backend-0-0-1.onrender.com/api/quizzes";

// Styled Components
const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: "15px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  transition: "transform 0.3s ease, box-shadow 0.3s ease",
  "&:hover": {
    transform: "scale(1.05)",
    boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
  },
  backgroundColor: "#fff",
  height: "100%",
  display: "flex",
  flexDirection: "column",
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: "20px",
  padding: "8px 20px",
  textTransform: "none",
  fontWeight: 600,
  fontSize: "1rem",
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 6px 15px rgba(0, 0, 0, 0.15)",
  },
}));

const StyledSearchField = styled(TextField)(({ theme }) => ({
  width: { xs: "100%", sm: "400px", md: "500px" },
  maxWidth: "100%",
  backgroundColor: "#fff",
  borderRadius: "30px",
  boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
  "& .MuiInputBase-root": {
    fontSize: "1.1rem",
    padding: "4px 12px",
  },
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      borderColor: "#3498db",
    },
    "&:hover fieldset": {
      borderColor: "#2980b9",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#3498db",
    },
  },
  "& .MuiInputLabel-root": {
    color: "#3498db",
    fontWeight: 500,
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: "#2980b9",
  },
}));

const QuizManagement = () => {
  const [role, setRole] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const quizzesPerPage = 8; // 8 quizzes per page (4 per row, 2 rows)
  const navigate = useNavigate();

  useEffect(() => {
    getUserRoleFromAPI().then(setRole);
  }, []);

  const fetchQuizzes = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setSnackbar({ open: true, message: "Authentication token is required to fetch quizzes!", severity: "error" });
      return;
    }

    setLoading(true);
    try {
      const res = await axios.get(API_URL, {
        params: {
          index: page,
          pageSize: quizzesPerPage,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const fetchedQuizzes = res.data?.data?.items || [];
      const totalItems = res.data?.data?.totalCount || 0;

      setQuizzes(fetchedQuizzes);
      setFilteredQuizzes(fetchedQuizzes);
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
  }, [page]);

  useEffect(() => {
    if (role === "staff" || role === "children") fetchQuizzes();
  }, [role, fetchQuizzes]);

  const handleSearch = useCallback(
    debounce((query) => {
      const filtered = quizzes.filter((quiz) =>
        quiz.name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredQuizzes(filtered);
      setPage(1); // Reset to first page on search
    }, 500),
    [quizzes]
  );

  useEffect(() => {
    handleSearch(search);
  }, [search, handleSearch]);

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

  if (role === null)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "#f5f7fa" }}>
        <CircularProgress size={80} thickness={5} sx={{ color: "#3498db" }} />
      </Box>
    );

  if (role !== "staff" && role !== "children")
    return (
      <Box sx={{ textAlign: "center", mt: 8, p: 4, background: "#fff", borderRadius: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", maxWidth: "600px", mx: "auto" }}>
        <Typography variant="h5" color="error" sx={{ fontWeight: 600 }}>
          Access Denied
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
          You do not have permission to view this page.
        </Typography>
      </Box>
    );

  return (
    <Box
      sx={{
        padding: "32px",
        background: "linear-gradient(135deg, #e8f0fe, #f5f7fa)",
        minHeight: "100vh",
        ml: { xs: 0, md: "280px" },
        maxWidth: "100%",
        overflowX: "hidden",
      }}
    >
      {/* Header Section */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4, flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: "#2c3e50", fontSize: { xs: "1.5rem", md: "2rem" } }}>
            Quiz Management
          </Typography>
          <Typography variant="subtitle1" sx={{ color: "#7f8c8d", fontSize: { xs: "1rem", md: "1.2rem" }, mt: 1 }}>
            Manage your quizzes ({filteredQuizzes.length} quizzes)
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 2 }}>
          {role === "staff" && (
            <>
              <StyledButton
                variant="contained"
                startIcon={<AddCircle />}
                onClick={() => handleOpenDialog()}
                disabled={loading}
                sx={{ background: "linear-gradient(90deg, #2c3e50, #3498db)" }}
              >
                Add Quiz
              </StyledButton>
              <StyledButton
                variant="outlined"
                startIcon={<Refresh />}
                onClick={fetchQuizzes}
                disabled={loading}
                sx={{ borderColor: "#3498db", color: "#3498db" }}
              >
                Refresh
              </StyledButton>
            </>
          )}
        </Box>
      </Box>

      {/* Search Section */}
      <Box sx={{ mb: 4, display: "flex", justifyContent: "center" }}>
        <StyledSearchField
          label="Search Quiz"
          variant="outlined"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ color: "#3498db", fontSize: "1.8rem" }} />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Loading Indicator */}
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 8 }}>
          <CircularProgress size={80} thickness={5} sx={{ color: "#3498db" }} />
        </Box>
      )}

      {/* Quiz Cards Section */}
      {!loading && (
        <Box>
          <Grid container spacing={3}>
            {filteredQuizzes.map((quiz, index) => (
              <Grid item xs={12} sm={6} md={3} key={quiz.id}>
                <Fade in={true} timeout={300 + index * 100}>
                  <StyledCard>
                    <CardMedia
                      component="img"
                      height="160"
                      image={
                        quiz.imageUrl && quiz.imageUrl !== "null"
                          ? quiz.imageUrl
                          : "https://via.placeholder.com/300"
                      }
                      alt={quiz.name}
                      onError={(e) => (e.target.src = "https://via.placeholder.com/300")}
                      sx={{ objectFit: "cover", borderTopLeftRadius: "15px", borderTopRightRadius: "15px" }}
                    />
                    <CardContent sx={{ padding: "16px", flexGrow: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                      <Box>
                        <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ fontSize: "1.2rem", color: "#2c3e50" }}>
                          {quiz.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: "0.9rem" }}>
                          {quiz.description || "No description available"}
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 2 }}>
                        <StyledButton
                          variant="contained"
                          onClick={() => navigate(`/quizzes/${quiz.id}/questions`)}
                          sx={{ background: "linear-gradient(90deg, #2c3e50, #3498db)", fontSize: "0.9rem" }}
                        >
                          View
                        </StyledButton>
                        {role === "staff" && (
                          <Box sx={{ display: "flex", gap: 1 }}>
                            <IconButton
                              onClick={() => handleOpenDialog(quiz)}
                              disabled={loading}
                              sx={{ color: "#1976d2", "&:hover": { color: "#1565c0" } }}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                            <IconButton
                              onClick={() => handleDeleteQuiz(quiz.id)}
                              disabled={loading}
                              sx={{ color: "#d32f2f", "&:hover": { color: "#b71c1c" } }}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Box>
                        )}
                      </Box>
                    </CardContent>
                  </StyledCard>
                </Fade>
              </Grid>
            ))}
          </Grid>

          {filteredQuizzes.length === 0 && (
            <Box sx={{ textAlign: "center", py: 8 }}>
              <Typography variant="h6" color="text.secondary" sx={{ fontSize: "1.4rem", mb: 2 }}>
                No quizzes found
              </Typography>
              {role === "staff" && (
                <StyledButton
                  variant="contained"
                  startIcon={<AddCircle />}
                  onClick={() => handleOpenDialog()}
                  sx={{ background: "linear-gradient(90deg, #2c3e50, #3498db)" }}
                >
                  Add Quiz
                </StyledButton>
              )}
            </Box>
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
                    "&:hover": {
                      backgroundColor: "#e3f2fd",
                    },
                  },
                  "& .Mui-selected": {
                    backgroundColor: "#3498db !important",
                    color: "#fff",
                  },
                }}
              />
            </Box>
          )}
        </Box>
      )}

      {/* Dialog for Add/Edit Quiz */}
      {role === "staff" && (
        <Dialog open={open} onClose={handleCloseDialog} maxWidth="sm" fullWidth sx={{ "& .MuiDialog-paper": { borderRadius: "16px" } }}>
          <DialogTitle sx={{ background: "linear-gradient(90deg, #2c3e50, #3498db)", color: "#fff", fontSize: "1.8rem", fontWeight: 600, py: 2 }}>
            {editingQuiz?.id ? "Edit Quiz" : "Add New Quiz"}
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <TextField
              label="Quiz Name"
              fullWidth
              margin="normal"
              value={editingQuiz?.name || ""}
              onChange={(e) => setEditingQuiz({ ...editingQuiz, name: e.target.value })}
              required
              error={!editingQuiz?.name}
              helperText={!editingQuiz?.name ? "Quiz name is required" : ""}
              sx={{ "& .MuiInputBase-root": { fontSize: "1.1rem" } }}
            />
            <TextField
              label="Image URL"
              fullWidth
              margin="normal"
              value={editingQuiz?.imageUrl || ""}
              onChange={(e) => setEditingQuiz({ ...editingQuiz, imageUrl: e.target.value })}
              required={!editingQuiz?.id}
              error={!editingQuiz?.id && (!editingQuiz?.imageUrl || editingQuiz?.imageUrl.trim() === "")}
              helperText={
                !editingQuiz?.id && (!editingQuiz?.imageUrl || editingQuiz?.imageUrl.trim() === "")
                  ? "Image URL is required for new quizzes"
                  : ""
              }
              sx={{ "& .MuiInputBase-root": { fontSize: "1.1rem" } }}
            />
            {editingQuiz?.imageUrl && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: "1rem" }}>
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
                  style={{ maxWidth: "100%", height: "auto", borderRadius: "8px", marginTop: "8px" }}
                />
              </Box>
            )}
            <TextField
              label="Description"
              fullWidth
              margin="normal"
              multiline
              rows={3}
              value={editingQuiz?.description || ""}
              onChange={(e) => setEditingQuiz({ ...editingQuiz, description: e.target.value })}
              sx={{ "& .MuiInputBase-root": { fontSize: "1.1rem" } }}
            />
          </DialogContent>
          <DialogActions sx={{ p: 3, justifyContent: "space-between" }}>
            <StyledButton variant="outlined" onClick={handleCloseDialog} disabled={loading} sx={{ borderColor: "#3498db", color: "#3498db" }}>
              Cancel
            </StyledButton>
            <StyledButton
              variant="contained"
              onClick={handleSaveQuiz}
              disabled={loading}
              sx={{ background: "linear-gradient(90deg, #2c3e50, #3498db)" }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Save"}
            </StyledButton>
          </DialogActions>
        </Dialog>
      )}

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity={snackbar.severity} sx={{ width: "100%", fontSize: "1.1rem" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default QuizManagement;