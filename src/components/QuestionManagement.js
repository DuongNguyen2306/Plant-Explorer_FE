import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box, Typography, Button, Grid, Dialog, DialogTitle, DialogContent, TextField, DialogActions,
  Pagination, CircularProgress, Snackbar, Alert, IconButton, Fade, InputAdornment
} from "@mui/material";
import { styled } from "@mui/system";
import { Edit, Delete, AddCircle, Refresh, Search, ArrowBack } from "@mui/icons-material";
import ImagePlaceholder from "../assets/placeholder.png";
import { getUserRoleFromAPI } from "../utils/roleUtils";
import debounce from "lodash/debounce";

const API_URL = "https://plant-explorer-backend-0-0-1.onrender.com/api/questions";

// Styled Components
const StyledCard = styled(Box)(({ theme }) => ({
  borderRadius: "15px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  transition: "transform 0.3s ease, box-shadow 0.3s ease",
  "&:hover": {
    transform: "scale(1.05)",
    boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
  },
  backgroundColor: "#fff",
  overflow: "hidden",
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

const QuestionManagement = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [role, setRole] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const pageSize = 9;

  useEffect(() => {
    getUserRoleFromAPI().then(setRole);
  }, []);

  useEffect(() => {
    if (role === "staff" || role === "children") fetchQuestions();
  }, [role, quizId, page]);

  const fetchQuestions = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setSnackbar({ open: true, message: "Authentication token is required!", severity: "error" });
      return;
    }
    setLoading(true);
    try {
      const res = await axios.get(API_URL, {
        params: { index: page, pageSize: pageSize, quizId: quizId },
        headers: { Authorization: `Bearer ${token}` },
      });
      const items = res.data?.data?.items || [];
      const total = res.data?.data?.totalCount || 0;
      setQuestions(items);
      setFilteredQuestions(items);
      setTotalPages(Math.ceil(total / pageSize));
      setSnackbar({ open: true, message: "Questions loaded successfully!", severity: "success" });
    } catch (err) {
      setSnackbar({ open: true, message: "Failed to fetch questions!", severity: "error" });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = useCallback(
    debounce((query) => {
      const filtered = questions.filter((q) => q.name.toLowerCase().includes(query.toLowerCase()));
      setFilteredQuestions(filtered);
      setPage(1);
    }, 500),
    [questions]
  );

  useEffect(() => {
    handleSearch(search);
  }, [search, handleSearch]);

  const handleDelete = async (id) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setLoading(true);
    try {
      await axios.delete(`${API_URL}/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchQuestions();
      setSnackbar({ open: true, message: "Question deleted successfully!", severity: "success" });
    } catch (err) {
      setSnackbar({ open: true, message: "Failed to delete question!", severity: "error" });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (question = null) => {
    setEditingQuestion(question || { name: "", context: "", imageUrl: "", point: 0 });
    setOpenDialog(true);
  };

  const handleSave = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    const headers = { Authorization: `Bearer ${token}` };
    const payload = {
      name: editingQuestion.name,
      context: editingQuestion.context,
      imageUrl: editingQuestion.imageUrl || null,
      point: editingQuestion.point || 0,
      quizId,
    };
    if (!payload.name) {
      setSnackbar({ open: true, message: "Question name is required!", severity: "warning" });
      return;
    }
    try {
      setLoading(true);
      if (editingQuestion.id) {
        await axios.put(`${API_URL}/${editingQuestion.id}`, payload, { headers });
        setSnackbar({ open: true, message: "Question updated successfully!", severity: "success" });
      } else {
        await axios.post(API_URL, payload, { headers });
        setSnackbar({ open: true, message: "Question added successfully!", severity: "success" });
      }
      fetchQuestions();
      setOpenDialog(false);
    } catch (err) {
      setSnackbar({ open: true, message: "Failed to save question!", severity: "error" });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate("/quizzes");
  };

  const handleNavigateToOptions = (questionId) => {
    navigate(`/quizzes/${quizId}/questions/${questionId}/options`, {
      state: { quizId },
    });
  };

  if (role === null) return (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "#f5f7fa" }}>
      <CircularProgress size={80} thickness={5} sx={{ color: "#3498db" }} />
    </Box>
  );
  if (role !== "staff" && role !== "children") return (
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
    <Box sx={{ padding: "32px", background: "linear-gradient(135deg, #e8f0fe, #f5f7fa)", minHeight: "100vh" }}>
      {/* Header Section */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4, flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: "#2c3e50" }}>
            Question Management
          </Typography>
          <Typography variant="subtitle1" sx={{ color: "#7f8c8d", mt: 1 }}>
            Manage all questions ({filteredQuestions.length} questions)
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 2 }}>
          <StyledButton variant="outlined" startIcon={<ArrowBack />} onClick={handleBack} sx={{ borderColor: "#3498db", color: "#3498db" }}>
            Back
          </StyledButton>
          {role === "staff" && (
            <>
              <StyledButton variant="contained" startIcon={<AddCircle />} onClick={() => handleOpenDialog()} sx={{ background: "linear-gradient(90deg, #2c3e50, #3498db)" }}>
                Add Question
              </StyledButton>
              <StyledButton variant="outlined" startIcon={<Refresh />} onClick={fetchQuestions} sx={{ borderColor: "#3498db", color: "#3498db" }}>
                Refresh
              </StyledButton>
            </>
          )}
        </Box>
      </Box>

      {/* Search Section */}
      <Box sx={{ mb: 4, display: "flex", justifyContent: "center" }}>
        <StyledSearchField
          label="Search Questions"
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

      {/* Questions Grid */}
      {!loading && (
        <Grid container spacing={3}>
          {filteredQuestions.map((q, index) => (
            <Grid item xs={12} sm={6} md={4} key={q.id}>
              <Fade in timeout={300 + index * 100}>
                <StyledCard>
                  <img
                    src={q.imageUrl || ImagePlaceholder}
                    alt={q.name}
                    style={{ width: "100%", height: 160, objectFit: "cover", borderTopLeftRadius: "15px", borderTopRightRadius: "15px" }}
                    onError={(e) => (e.target.src = ImagePlaceholder)}
                  />
                  <Box sx={{ p: 2, flexGrow: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <Box>
                      <Typography variant="h6" fontWeight="bold" sx={{ color: "#2c3e50" }}>{q.name}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ my: 1 }}>
                        {q.context?.slice(0, 100)}...
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#7f8c8d" }}>Points: {q.point}</Typography>
                    </Box>
                    <Box sx={{ mt: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <StyledButton
                        variant="contained"
                        onClick={() => handleNavigateToOptions(q.id)}
                        sx={{ background: "linear-gradient(90deg, #2c3e50, #3498db)" }}
                      >
                        Options
                      </StyledButton>
                      {role === "staff" && (
                        <Box>
                          <IconButton onClick={() => handleOpenDialog(q)} sx={{ color: "#1976d2", "&:hover": { color: "#1565c0" } }}>
                            <Edit fontSize="small" />
                          </IconButton>
                          <IconButton onClick={() => handleDelete(q.id)} sx={{ color: "#d32f2f", "&:hover": { color: "#b71c1c" } }}>
                            <Delete fontSize="small" />
                          </IconButton>
                        </Box>
                      )}
                    </Box>
                  </Box>
                </StyledCard>
              </Fade>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(e, val) => setPage(val)}
            color="primary"
            size="large"
            sx={{
              "& .MuiPaginationItem-root": {
                fontSize: "1.1rem",
                "&:hover": { backgroundColor: "#e3f2fd" },
              },
              "& .Mui-selected": {
                backgroundColor: "#3498db !important",
                color: "#fff",
              },
            }}
          />
        </Box>
      )}

      {/* Dialog for Add/Edit Question */}
      {role === "staff" && (
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth sx={{ "& .MuiDialog-paper": { borderRadius: "16px" } }}>
          <DialogTitle sx={{ background: "linear-gradient(90deg, #2c3e50, #3498db)", color: "#fff", fontSize: "1.8rem", fontWeight: 600, py: 2 }}>
            {editingQuestion?.id ? "Edit Question" : "Add New Question"}
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <TextField
              fullWidth
              label="Question Name"
              value={editingQuestion?.name || ""}
              onChange={(e) => setEditingQuestion({ ...editingQuestion, name: e.target.value })}
              margin="normal"
              required
              error={!editingQuestion?.name}
              helperText={!editingQuestion?.name ? "Question name is required" : ""}
              sx={{ "& .MuiInputBase-root": { fontSize: "1.1rem" } }}
            />
            <TextField
              fullWidth
              label="Context"
              multiline
              rows={3}
              value={editingQuestion?.context || ""}
              onChange={(e) => setEditingQuestion({ ...editingQuestion, context: e.target.value })}
              margin="normal"
              sx={{ "& .MuiInputBase-root": { fontSize: "1.1rem" } }}
            />
            <TextField
              fullWidth
              label="Image URL"
              value={editingQuestion?.imageUrl || ""}
              onChange={(e) => setEditingQuestion({ ...editingQuestion, imageUrl: e.target.value })}
              margin="normal"
              sx={{ "& .MuiInputBase-root": { fontSize: "1.1rem" } }}
            />
            {editingQuestion?.imageUrl && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: "1rem" }}>
                  Preview Image:
                </Typography>
                <img
                  src={editingQuestion.imageUrl || ImagePlaceholder}
                  alt="Question preview"
                  onError={(e) => (e.target.src = ImagePlaceholder)}
                  style={{ maxWidth: "100%", height: "auto", borderRadius: "8px", marginTop: "8px" }}
                />
              </Box>
            )}
            <TextField
              fullWidth
              label="Points"
              type="number"
              value={editingQuestion?.point || 0}
              onChange={(e) => setEditingQuestion({ ...editingQuestion, point: parseInt(e.target.value) || 0 })}
              margin="normal"
              sx={{ "& .MuiInputBase-root": { fontSize: "1.1rem" } }}
            />
          </DialogContent>
          <DialogActions sx={{ p: 3, justifyContent: "space-between" }}>
            <StyledButton variant="outlined" onClick={() => setOpenDialog(false)} sx={{ borderColor: "#3498db", color: "#3498db" }}>
              Cancel
            </StyledButton>
            <StyledButton variant="contained" onClick={handleSave} sx={{ background: "linear-gradient(90deg, #2c3e50, #3498db)" }}>
              {loading ? <CircularProgress size={24} color="inherit" /> : "Save"}
            </StyledButton>
          </DialogActions>
        </Dialog>
      )}

      {/* Snackbar */}
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} sx={{ width: "100%", fontSize: "1.1rem" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default QuestionManagement;