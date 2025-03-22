import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Pagination,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import ImagePlaceholder from "../assets/placeholder.png";

const API_URL = "https://plant-explorer-backend-0-0-1.onrender.com/api/questions";

const QuestionManagement = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [page, setPage] = useState(1);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const pageSize = 6;

  useEffect(() => {
    fetchQuestions();
  }, [quizId]);

  const fetchQuestions = async () => {
    try {
      const res = await axios.get(`${API_URL}?quizId=${quizId}`);
      setQuestions(res.data?.data?.items || []);
    } catch (error) {
      console.error("Error fetching questions:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/question?id=${id}`);
      fetchQuestions();
    } catch (error) {
      console.error("Error deleting question:", error);
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
    const payload = { ...editingQuestion, quizId };
    try {
      if (editingQuestion?.id) {
        await axios.put(`${API_URL}/question?id=${editingQuestion.id}`, payload);
      } else {
        await axios.post(`${API_URL}/question`, payload);
      }
      fetchQuestions();
      handleCloseDialog();
    } catch (error) {
      console.error("Error saving question:", error);
    }
  };

  const paginatedData = questions.slice((page - 1) * pageSize, page * pageSize);

  return (
    <Box sx={{ padding: 4, backgroundColor: "#e3eafc", minHeight: "100vh" }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Question Management
      </Typography>

      <Box sx={{ display: "flex", gap: 2, marginBottom: 3 }}>
        <Button variant="contained" color="success" onClick={() => handleOpenDialog()}>
          ADD QUESTION
        </Button>
        <Button onClick={fetchQuestions} variant="contained" color="primary">
          REFRESH
        </Button>
      </Box>

      <Grid container spacing={3}>
        {paginatedData.map((question) => (
          <Grid item xs={12} sm={6} md={4} key={question.id}>
            <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
              <CardMedia
                component="img"
                height="140"
                image={
                  question.imageUrl !== "null" && question.imageUrl
                    ? question.imageUrl
                    : ImagePlaceholder
                }
                alt="question"
              />
              <CardContent>
                <Typography variant="h6" fontWeight="bold">{question.name}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {question.context}
                </Typography>
                <Typography variant="body2" color="text.secondary">Points: {question.point}</Typography>

                <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
                  <Button
                    variant="contained"
                    onClick={() => navigate(`/quizzes/${quizId}/questions/${question.id}/options`)}
                  >
                    OPTIONS
                  </Button>
                  <Box>
                    <IconButton color="info" onClick={() => handleOpenDialog(question)}>
                      <Edit />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDelete(question.id)}>
                      <Delete />
                    </IconButton>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
        <Pagination
          count={Math.ceil(questions.length / pageSize)}
          page={page}
          onChange={(e, value) => setPage(value)}
        />
      </Box>

      {/* Dialog Add/Edit */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>{editingQuestion?.id ? "Edit Question" : "Add Question"}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Name"
            margin="dense"
            value={editingQuestion?.name || ""}
            onChange={(e) => setEditingQuestion({ ...editingQuestion, name: e.target.value })}
          />
          <TextField
            fullWidth
            label="Context"
            margin="dense"
            value={editingQuestion?.context || ""}
            onChange={(e) => setEditingQuestion({ ...editingQuestion, context: e.target.value })}
          />
          <TextField
            fullWidth
            label="Image URL"
            margin="dense"
            value={editingQuestion?.imageUrl || ""}
            onChange={(e) => setEditingQuestion({ ...editingQuestion, imageUrl: e.target.value })}
          />
          <TextField
            fullWidth
            label="Point"
            type="number"
            margin="dense"
            value={editingQuestion?.point || 0}
            onChange={(e) => setEditingQuestion({ ...editingQuestion, point: parseInt(e.target.value) })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSave} color="primary">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default QuestionManagement;
