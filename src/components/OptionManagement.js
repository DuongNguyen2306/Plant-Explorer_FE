import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Box,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Checkbox,
  IconButton,
  CardMedia,
  CircularProgress,
  Snackbar,
  Alert,
  Container,
  Fade,
} from "@mui/material";
import { styled } from "@mui/system";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import { Edit, Delete, AddCircle, Refresh, Park, ArrowBack } from "@mui/icons-material";
import { getUserRoleFromAPI } from "../utils/roleUtils";

const API_URL = "https://plant-explorer-backend-0-0-1.onrender.com/api/options";

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

const OptionManagement = () => {
  const { questionId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const quizId = location.state?.quizId;
  const [options, setOptions] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingOption, setEditingOption] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const rowsPerPage = 8;

  useEffect(() => {
    getUserRoleFromAPI().then(setRole);
  }, []);

  useEffect(() => {
    if (role === "staff" || role === "children") fetchOptions();
  }, [role, questionId, page]);

  const fetchOptions = async () => {
    if (!questionId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(questionId)) {
      setSnackbar({ open: true, message: "Invalid or missing Question ID!", severity: "error" });
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setSnackbar({ open: true, message: "Authentication token is required!", severity: "error" });
      return;
    }

    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.get(API_URL, {
        params: { questionId: questionId },
        headers: headers,
      });

      const fetchedOptions = res.data?.data?.items || [];
      setOptions(fetchedOptions);
      setTotalPages(Math.ceil(fetchedOptions.length / rowsPerPage));
      setSnackbar({ open: true, message: "Options loaded successfully!", severity: "success" });
    } catch (error) {
      setSnackbar({ open: true, message: "Failed to fetch options!", severity: "error" });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (option = null) => {
    setEditingOption(option || { name: "", context: "", isCorrect: false, questionId });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingOption(null);
  };

  const handleSave = async () => {
    if (!editingOption.name || !editingOption.context) {
      setSnackbar({ open: true, message: "Name and context are required!", severity: "warning" });
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) return;

    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
      const payload = {
        name: editingOption.name,
        context: editingOption.context,
        isCorrect: editingOption.isCorrect,
        questionId: questionId,
      };

      if (editingOption.id) {
        await axios.put(`${API_URL}/${editingOption.id}`, payload, { headers });
        setSnackbar({ open: true, message: "Option updated successfully!", severity: "success" });
      } else {
        await axios.post(API_URL, payload, { headers });
        setSnackbar({ open: true, message: "Option added successfully!", severity: "success" });
      }
      fetchOptions();
      handleCloseDialog();
    } catch (error) {
      setSnackbar({ open: true, message: "Failed to save option!", severity: "error" });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setLoading(true);
    try {
      await axios.delete(`${API_URL}/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchOptions();
      setSnackbar({ open: true, message: "Option deleted successfully!", severity: "success" });
    } catch (error) {
      setSnackbar({ open: true, message: "Failed to delete option!", severity: "error" });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (quizId) {
      navigate(`/quizzes/${quizId}/questions`);
    } else {
      setSnackbar({ open: true, message: "Quiz ID not found!", severity: "error" });
      navigate("/quizzes");
    }
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
        You do not have permission to view options.
      </Typography>
    </Box>
  );

  return (
    <Box sx={{ padding: "32px", background: "linear-gradient(135deg, #e8f0fe, #f5f7fa)", minHeight: "100vh" }}>
      <Container maxWidth="lg">
        {/* Header Section */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4, flexWrap: "wrap", gap: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: "#2c3e50" }}>
              Option Management
            </Typography>
            <Typography variant="subtitle1" sx={{ color: "#7f8c8d", mt: 1 }}>
              Manage all options ({options.length} options)
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 2 }}>
            <StyledButton variant="outlined" startIcon={<ArrowBack />} onClick={handleBack} sx={{ borderColor: "#3498db", color: "#3498db" }}>
              Back
            </StyledButton>
            {role === "staff" && (
              <>
                <StyledButton variant="contained" startIcon={<AddCircle />} onClick={() => handleOpenDialog()} sx={{ background: "linear-gradient(90deg, #2c3e50, #3498db)" }}>
                  Add Option
                </StyledButton>
                <StyledButton variant="outlined" startIcon={<Refresh />} onClick={fetchOptions} sx={{ borderColor: "#3498db", color: "#3498db" }}>
                  Refresh
                </StyledButton>
              </>
            )}
          </Box>
        </Box>

        {/* Loading Indicator */}
        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 8 }}>
            <CircularProgress size={80} thickness={5} sx={{ color: "#3498db" }} />
          </Box>
        )}

        {/* Options Grid */}
        {!loading && (
          <Grid container spacing={3}>
            {options.slice((page - 1) * rowsPerPage, page * rowsPerPage).map((option, index) => (
              <Grid item xs={12} sm={6} md={3} key={option.id}>
                <Fade in timeout={300 + index * 100}>
                  <StyledCard>
                    <CardMedia
                      component="img"
                      height="140"
                      image={option.imageUrl || "https://via.placeholder.com/300x140?text=Option+Image"}
                      alt={option.name}
                      sx={{ objectFit: "cover", borderTopLeftRadius: "15px", borderTopRightRadius: "15px" }}
                    />
                    <CardContent sx={{ padding: "16px", flexGrow: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                      <Box>
                        <Typography variant="h6" fontWeight="bold" sx={{ color: "#2c3e50" }}>
                          {option.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ my: 1 }}>
                          {option.context?.slice(0, 100)}...
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 1 }}>
                        {option.isCorrect ? (
                          <CheckCircleIcon color="success" sx={{ fontSize: 30 }} />
                        ) : (
                          <CancelIcon color="error" sx={{ fontSize: 30 }} />
                        )}
                        <Typography variant="body2" color={option.isCorrect ? "success.main" : "error.main"} sx={{ fontWeight: 600 }}>
                          {option.isCorrect ? "Correct" : "Incorrect"}
                        </Typography>
                      </Box>
                      {role === "staff" && (
                        <Box sx={{ mt: 2, display: "flex", justifyContent: "center", gap: 1 }}>
                          <IconButton onClick={() => handleOpenDialog(option)} sx={{ color: "#1976d2", "&:hover": { color: "#1565c0" } }}>
                            <Edit fontSize="small" />
                          </IconButton>
                          <IconButton onClick={() => handleDelete(option.id)} sx={{ color: "#d32f2f", "&:hover": { color: "#b71c1c" } }}>
                            <Delete fontSize="small" />
                          </IconButton>
                        </Box>
                      )}
                    </CardContent>
                  </StyledCard>
                </Fade>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Empty State */}
        {!loading && options.length === 0 && (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <Park sx={{ fontSize: "5rem", color: "#3498db", mb: 2 }} />
            <Typography variant="h6" color="text.secondary" sx={{ fontSize: "1.4rem", mb: 2 }}>
              No options found
            </Typography>
            {role === "staff" && (
              <StyledButton variant="contained" startIcon={<AddCircle />} onClick={() => handleOpenDialog()} sx={{ background: "linear-gradient(90deg, #2c3e50, #3498db)" }}>
                Add Option
              </StyledButton>
            )}
          </Box>
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

        {/* Dialog for Add/Edit Option */}
        {role === "staff" && (
          <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth sx={{ "& .MuiDialog-paper": { borderRadius: "16px" } }}>
            <DialogTitle sx={{ background: "linear-gradient(90deg, #2c3e50, #3498db)", color: "#fff", fontSize: "1.8rem", fontWeight: 600, py: 2 }}>
              {editingOption?.id ? "Edit Option" : "Add New Option"}
            </DialogTitle>
            <DialogContent sx={{ pt: 3 }}>
              <TextField
                label="Name"
                fullWidth
                margin="normal"
                value={editingOption?.name || ""}
                onChange={(e) => setEditingOption({ ...editingOption, name: e.target.value })}
                required
                error={!editingOption?.name}
                helperText={!editingOption?.name ? "Name is required" : ""}
                sx={{ "& .MuiInputBase-root": { fontSize: "1.1rem" } }}
              />
              <TextField
                label="Context"
                fullWidth
                margin="normal"
                multiline
                rows={3}
                value={editingOption?.context || ""}
                onChange={(e) => setEditingOption({ ...editingOption, context: e.target.value })}
                required
                error={!editingOption?.context}
                helperText={!editingOption?.context ? "Context is required" : ""}
                sx={{ "& .MuiInputBase-root": { fontSize: "1.1rem" } }}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={editingOption?.isCorrect || false}
                    onChange={(e) => setEditingOption({ ...editingOption, isCorrect: e.target.checked })}
                    sx={{ color: "#3498db", "&.Mui-checked": { color: "#3498db" } }}
                  />
                }
                label="Is Correct?"
                sx={{ "& .MuiTypography-root": { fontSize: "1.1rem", color: "#2c3e50" } }}
              />
            </DialogContent>
            <DialogActions sx={{ p: 3, justifyContent: "space-between" }}>
              <StyledButton variant="outlined" onClick={handleCloseDialog} sx={{ borderColor: "#3498db", color: "#3498db" }}>
                Cancel
              </StyledButton>
              <StyledButton variant="contained" onClick={handleSave} sx={{ background: "linear-gradient(90deg, #2c3e50, #3498db)" }}>
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
      </Container>
    </Box>
  );
};

export default OptionManagement;