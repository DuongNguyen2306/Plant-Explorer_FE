import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box, Typography, Button, Grid, Card, CardContent, CardMedia, CardActions,
  IconButton, Dialog, DialogTitle, DialogContent, TextField, DialogActions, 
  Pagination, CircularProgress, Snackbar, Alert, Container
} from "@mui/material";
import { Edit, Delete, AddCircle, Refresh } from "@mui/icons-material";
import ImagePlaceholder from "../assets/placeholder.png";
import { getUserRoleFromAPI } from "../utils/roleUtils";

const API_URL = "https://plant-explorer-backend-0-0-1.onrender.com/api/questions";

const QuestionManagement = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [role, setRole] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const pageSize = 9; // Updated to 9 to fit 3 questions per row (3 rows per page)

  useEffect(() => {
    getUserRoleFromAPI().then(setRole);
  }, []);

  useEffect(() => {
    if (role === "staff" || role === "children") fetchQuestions();
  }, [role, quizId, page]);

  const fetchQuestions = async () => {
    if (!quizId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(quizId)) {
      setSnackbar({ open: true, message: "Invalid or missing Quiz ID!", severity: "error" });
      setLoading(false);
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setSnackbar({ open: true, message: "Authentication token is required to fetch questions!", severity: "error" });
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const index = page;
      const headers = { Authorization: `Bearer ${token}` };

      const res = await axios.get(API_URL, {
        params: {
          index: index,
          pageSize: pageSize,
          quizId: quizId,
        },
        headers: headers,
      });

      console.log("API Response:", res.data);

      const fetchedQuestions = res.data?.data?.items || [];
      const totalItems = res.data?.data?.totalCount || 0;

      setQuestions(fetchedQuestions);
      setTotalPages(Math.ceil(totalItems / pageSize));

      if (fetchedQuestions.length === 0) {
        setSnackbar({ open: true, message: "No questions found for this quiz.", severity: "info" });
      } else {
        setSnackbar({ open: true, message: "Questions loaded successfully!", severity: "success" });
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to fetch questions.";
      console.error("Full error response:", error.response);
      setSnackbar({ open: true, message: `Error fetching questions: ${errorMessage}`, severity: "error" });

      if (error.response?.status === 400) {
        if (errorMessage.toLowerCase().includes("not found")) {
          setQuestions([]);
          setSnackbar({ open: true, message: "No questions found for this quiz.", severity: "info" });
        } else if (errorMessage.toLowerCase().includes("quiz not found")) {
          setQuestions([]);
          setSnackbar({ open: true, message: "Quiz not found. Please check the Quiz ID.", severity: "error" });
        } else if (errorMessage.toLowerCase().includes("invalid index")) {
          setSnackbar({ open: true, message: "Invalid page index. Please try a different page.", severity: "error" });
        } else {
          setSnackbar({ open: true, message: `Error fetching questions: ${errorMessage}`, severity: "error" });
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setSnackbar({ open: true, message: "Authentication token is required to delete questions!", severity: "error" });
      return;
    }

    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.delete(`${API_URL}/${id}`, { headers });
      fetchQuestions();
      setSnackbar({ open: true, message: "Question deleted successfully!", severity: "success" });
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to delete question.";
      console.error("Full error response:", error.response);
      setSnackbar({ open: true, message: `Error deleting question: ${errorMessage}`, severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (question = null) => {
    setEditingQuestion(
      question || { name: "", context: "", imageUrl: "", point: 0 }
    );
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingQuestion(null);
  };

  const handleSave = async () => {
    if (!editingQuestion.name || !editingQuestion.context) {
      setSnackbar({ open: true, message: "Name and context are required!", severity: "warning" });
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setSnackbar({ open: true, message: "Authentication token is required to save questions!", severity: "error" });
      return;
    }

    const payload = {
      name: editingQuestion.name,
      quizId: quizId,
      context: editingQuestion.context,
      point: editingQuestion.point || 0,
      imageUrl: editingQuestion.imageUrl || null,
    };

    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

      if (editingQuestion?.id) {
        await axios.put(`${API_URL}/${editingQuestion.id}`, payload, { headers });
        setSnackbar({ open: true, message: "Question updated successfully!", severity: "success" });
      } else {
        await axios.post(API_URL, payload, { headers });
        setSnackbar({ open: true, message: "Question added successfully!", severity: "success" });
      }
      fetchQuestions();
      handleCloseDialog();
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to save question.";
      console.error("Full error response:", error.response);
      setSnackbar({ open: true, message: `Error saving question: ${errorMessage}`, severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  if (role === null) return (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <CircularProgress />
    </Box>
  );

  if (role !== "staff" && role !== "children") return (
    <Box sx={{ textAlign: "center", mt: 5 }}>
      <Typography variant="h6" color="error">
        You do not have permission to view questions.
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
          Question Management
        </Typography>
        {role === "staff" && (
          <Box sx={{ display: "flex", gap: 2 }}>
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
              Add Question
            </Button>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<Refresh />}
              onClick={fetchQuestions}
              disabled={loading}
              sx={{
                borderRadius: "20px",
                textTransform: "none",
                fontWeight: "bold",
              }}
            >
              Refresh
            </Button>
          </Box>
        )}
      </Box>

      {/* Loading Indicator */}
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", my: 3 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Questions Grid */}
      <Grid container spacing={2}>
        {questions.map((question) => (
          <Grid item xs={12} sm={6} md={4} key={question.id}> {/* Changed md={3} to md={4} to fit 3 questions per row */}
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
                height="160" // Increased height to 160
                image={
                  question.imageUrl && question.imageUrl !== "null"
                    ? question.imageUrl
                    : ImagePlaceholder
                }
                alt={question.name}
                sx={{ objectFit: "cover" }}
              />
              <CardContent sx={{ padding: "16px" }}> {/* Increased padding to 16px */}
                <Typography variant="h6" fontWeight="bold">
                  {question.name}
                </Typography>
                <Typography
                  variant="body1" // Changed to body1 for larger text
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  {question.context.length > 100
                    ? `${question.context.substring(0, 100)}...`
                    : question.context}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Points: {question.point}
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: "space-between", px: 2, pb: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  onClick={() => navigate(`/quizzes/${quizId}/questions/${question.id}/options`)}
                  sx={{
                    borderRadius: "20px",
                    textTransform: "none",
                    fontWeight: "bold",
                    fontSize: "0.875rem", // Increased font size
                  }}
                >
                  Options
                </Button>
                {role === "staff" && (
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <IconButton
                      color="info"
                      onClick={() => handleOpenDialog(question)}
                      disabled={loading}
                      sx={{
                        "&:hover": { backgroundColor: "rgba(25, 118, 210, 0.1)" },
                      }}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(question.id)}
                      disabled={loading}
                      sx={{
                        "&:hover": { backgroundColor: "rgba(211, 47, 47, 0.1)" },
                      }}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* No Questions Message */}
      {questions.length === 0 && !loading && (
        <Typography variant="h6" color="text.secondary" textAlign="center" mt={5}>
          No questions found. {role === "staff" ? "Add a new question to get started!" : ""}
        </Typography>
      )}

      {/* Pagination */}
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

      {/* Dialog for Adding/Editing Questions */}
      {role === "staff" && (
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ bgcolor: "primary.main", color: "white" }}>
            {editingQuestion?.id ? "Edit Question" : "Add New Question"}
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Question Name"
              margin="dense"
              value={editingQuestion?.name || ""}
              onChange={(e) => setEditingQuestion({ ...editingQuestion, name: e.target.value })}
              required
              error={!editingQuestion?.name}
              helperText={!editingQuestion?.name ? "Question name is required" : ""}
              variant="outlined"
            />
            <TextField
              fullWidth
              label="Context"
              margin="dense"
              multiline
              rows={3}
              value={editingQuestion?.context || ""}
              onChange={(e) => setEditingQuestion({ ...editingQuestion, context: e.target.value })}
              required
              error={!editingQuestion?.context}
              helperText={!editingQuestion?.context ? "Context is required" : ""}
              variant="outlined"
            />
            <TextField
              fullWidth
              label="Image URL (Optional)"
              margin="dense"
              value={editingQuestion?.imageUrl || ""}
              onChange={(e) => setEditingQuestion({ ...editingQuestion, imageUrl: e.target.value })}
              variant="outlined"
            />
            <TextField
              fullWidth
              label="Points"
              type="number"
              margin="dense"
              value={editingQuestion?.point || 0}
              onChange={(e) => setEditingQuestion({ ...editingQuestion, point: parseInt(e.target.value) || 0 })}
              inputProps={{ min: 0 }}
              variant="outlined"
            />
          </DialogContent>
          <DialogActions sx={{ p: 2, bgcolor: "#f5f7fa", borderTop: "1px solid #e0e0e0" }}>
            <Button
              onClick={handleCloseDialog}
              disabled={loading}
              sx={{ textTransform: "none", fontWeight: "bold" }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
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

      {/* Snackbar for Notifications */}
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

export default QuestionManagement;