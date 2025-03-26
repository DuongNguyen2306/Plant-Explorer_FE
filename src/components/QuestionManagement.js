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
  const pageSize = 10;

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

    setLoading(true);
    try {
      const index = page - 1;
      const token = localStorage.getItem("token"); // Lấy token từ localStorage
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

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
      setSnackbar({ open: true, message: `Error fetching questions: ${errorMessage}`, severity: "error" });
      console.error("Error fetching questions:", error);
      // Nếu lỗi 400 và thông điệp cho biết không tìm thấy câu hỏi, hiển thị thông báo "No questions found"
      if (error.response?.status === 400 && errorMessage.toLowerCase().includes("not found")) {
        setQuestions([]);
        setSnackbar({ open: true, message: "No questions found for this quiz.", severity: "info" });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.delete(`${API_URL}/${id}`, { headers });
      fetchQuestions();
      setSnackbar({ open: true, message: "Question deleted successfully!", severity: "success" });
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to delete question.";
      setSnackbar({ open: true, message: errorMessage, severity: "error" });
      console.error("Error deleting question:", error);
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

    const payload = {
      name: editingQuestion.name,
      quizId: quizId,
      context: editingQuestion.context,
      point: editingQuestion.point || 0,
      imageUrl: editingQuestion.imageUrl || null,
    };

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } : { "Content-Type": "application/json" };

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
      setSnackbar({ open: true, message: errorMessage, severity: "error" });
      console.error("Error saving question:", error);
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
    <Container maxWidth="lg" sx={{ py: 5, backgroundColor: "#f0f4f8", minHeight: "100vh" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
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
            >
              Add Question
            </Button>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<Refresh />}
              onClick={fetchQuestions}
              disabled={loading}
            >
              Refresh
            </Button>
          </Box>
        )}
      </Box>

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", my: 3 }}>
          <CircularProgress />
        </Box>
      )}

      <Grid container spacing={3}>
        {questions.map((question) => (
          <Grid item xs={12} sm={6} md={4} key={question.id}>
            <Card sx={{ borderRadius: 3, boxShadow: 3, transition: "transform 0.2s", "&:hover": { transform: "scale(1.02)" } }}>
              <CardMedia
                component="img"
                height="160"
                image={
                  question.imageUrl && question.imageUrl !== "null"
                    ? question.imageUrl
                    : ImagePlaceholder
                }
                alt={question.name}
                sx={{ objectFit: "cover" }}
              />
              <CardContent>
                <Typography variant="h6" fontWeight="bold" noWrap>{question.name}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1, minHeight: "40px" }}>
                  {question.context.length > 100 ? `${question.context.substring(0, 100)}...` : question.context}
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
                >
                  Options
                </Button>
                {role === "staff" && (
                  <Box>
                    <IconButton color="info" onClick={() => handleOpenDialog(question)} disabled={loading}>
                      <Edit />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDelete(question.id)} disabled={loading}>
                      <Delete />
                    </IconButton>
                  </Box>
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {questions.length === 0 && !loading && (
        <Typography variant="h6" color="text.secondary" textAlign="center" mt={5}>
          No questions found. {role === "staff" ? "Add a new question to get started!" : ""}
        </Typography>
      )}

      {totalPages > 1 && (
        <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(e, value) => setPage(value)}
            color="primary"
          />
        </Box>
      )}

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
            />
            <TextField
              fullWidth
              label="Image URL (Optional)"
              margin="dense"
              value={editingQuestion?.imageUrl || ""}
              onChange={(e) => setEditingQuestion({ ...editingQuestion, imageUrl: e.target.value })}
            />
            <TextField
              fullWidth
              label="Points"
              type="number"
              margin="dense"
              value={editingQuestion?.point || 0}
              onChange={(e) => setEditingQuestion({ ...editingQuestion, point: parseInt(e.target.value) || 0 })}
              inputProps={{ min: 0 }}
            />
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleCloseDialog} disabled={loading}>Cancel</Button>
            <Button onClick={handleSave} color="primary" variant="contained" disabled={loading}>
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

export default QuestionManagement;