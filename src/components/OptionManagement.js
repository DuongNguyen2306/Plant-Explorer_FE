import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
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
import { Edit, Delete, AddCircle, Refresh, Park } from "@mui/icons-material";
import { getUserRoleFromAPI } from "../utils/roleUtils";

const API_URL = "https://plant-explorer-backend-0-0-1.onrender.com/api/options";

// Styled Components
const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: "15px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  transition: "transform 0.2s, box-shadow 0.2s",
  "&:hover": {
    transform: "scale(1.02)",
    boxShadow: "0 6px 16px rgba(0,0,0,0.15)",
  },
  background: "linear-gradient(145deg, #ffffff, #f0f4f8)",
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: "30px",
  padding: "10px 24px",
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
  const [options, setOptions] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingOption, setEditingOption] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const rowsPerPage = 8; // 4 options per row, 2 rows per page

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
      setSnackbar({ open: true, message: "Authentication token is required to fetch options!", severity: "error" });
      return;
    }

    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.get(API_URL, {
        params: {
          questionId: questionId,
        },
        headers: headers,
      });

      const fetchedOptions = res.data?.data?.items || [];
      setOptions(fetchedOptions);
      setTotalPages(Math.ceil(fetchedOptions.length / rowsPerPage));

      if (fetchedOptions.length === 0) {
        setSnackbar({ open: true, message: "No options found for this question.", severity: "info" });
      } else {
        setSnackbar({ open: true, message: "Options loaded successfully!", severity: "success" });
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to fetch options.";
      console.error("Full error response:", error.response);
      setSnackbar({ open: true, message: `Error fetching options: ${errorMessage}`, severity: "error" });
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
    if (!token) {
      setSnackbar({ open: true, message: "Authentication token is required to save options!", severity: "error" });
      return;
    }

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
      const errorMessage = error.response?.data?.message || error.message || "Failed to save option.";
      console.error("Full error response:", error.response);
      setSnackbar({ open: true, message: `Error saving option: ${errorMessage}`, severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setSnackbar({ open: true, message: "Authentication token is required to delete options!", severity: "error" });
      return;
    }

    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.delete(`${API_URL}/${id}`, { headers });
      fetchOptions();
      setSnackbar({ open: true, message: "Option deleted successfully!", severity: "success" });
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to delete option.";
      console.error("Full error response:", error.response);
      setSnackbar({ open: true, message: `Error deleting option: ${errorMessage}`, severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  if (role === null)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "#f5f7fa" }}>
        <CircularProgress size={80} thickness={5} sx={{ color: "#1e88e5" }} />
      </Box>
    );

  if (role !== "staff" && role !== "children")
    return (
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
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #e8f0fe, #f5f7fa)",
        overflowX: "hidden",
      }}
    >
      <Container
        maxWidth="lg"
        sx={{
          py: 4,
          width: { xs: "100%", md: "calc(100% - 280px)" }, // Adjust width to account for sidebar
          ml: { xs: 0, md: "280px" }, // Sidebar margin on larger screens
        }}
      >
        {/* Header Section */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4, flexWrap: "wrap", gap: 2 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: "#1a237e", fontSize: { xs: "1.5rem", md: "2rem" } }}>
            Option Management ({options.length})
          </Typography>
          {role === "staff" && (
            <Box sx={{ display: "flex", gap: 2 }}>
              <StyledButton
                variant="contained"
                startIcon={<AddCircle />}
                onClick={() => handleOpenDialog()}
                disabled={loading}
                sx={{ background: "linear-gradient(90deg, #1e88e5, #42a5f5)" }}
              >
                Add Option
              </StyledButton>
              <StyledButton
                variant="outlined"
                startIcon={<Refresh />}
                onClick={fetchOptions}
                disabled={loading}
                sx={{ borderColor: "#1e88e5", color: "#1e88e5" }}
              >
                Refresh
              </StyledButton>
            </Box>
          )}
        </Box>

        {/* Loading Indicator */}
        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 8 }}>
            <CircularProgress size={80} thickness={5} sx={{ color: "#1e88e5" }} />
          </Box>
        )}

        {/* Options Grid */}
        {!loading && (
          <Grid container spacing={3}>
            {options.slice((page - 1) * rowsPerPage, page * rowsPerPage).map((option, index) => (
              <Grid item xs={12} sm={6} md={3} key={option.id}>
                <Fade in={true} timeout={300 + index * 100}>
                  <StyledCard>
                    <CardMedia
                      component="img"
                      height="140"
                      image={option.imageUrl || "https://via.placeholder.com/300x140?text=Option+Image"}
                      alt="Option"
                      sx={{ objectFit: "cover", borderTopLeftRadius: "15px", borderTopRightRadius: "15px" }}
                    />
                    <CardContent sx={{ padding: "16px", textAlign: "center" }}>
                      <Typography
                        variant="h6"
                        fontWeight="bold"
                        sx={{ minHeight: "3rem", fontSize: "1.1rem", color: "#1a237e" }}
                      >
                        {option.context || "No Context"}
                      </Typography>
                      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 1, mt: 1 }}>
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
                        <Box sx={{ display: "flex", justifyContent: "center", mt: 2, gap: 1 }}>
                          <IconButton
                            color="info"
                            onClick={() => handleOpenDialog(option)}
                            disabled={loading}
                            sx={{ "&:hover": { backgroundColor: "rgba(25, 118, 210, 0.1)" } }}
                          >
                            <Edit sx={{ fontSize: "1.8rem" }} />
                          </IconButton>
                          <IconButton
                            color="error"
                            onClick={() => handleDelete(option.id)}
                            disabled={loading}
                            sx={{ "&:hover": { backgroundColor: "rgba(211, 47, 47, 0.1)" } }}
                          >
                            <Delete sx={{ fontSize: "1.8rem" }} />
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

        {/* Enhanced Empty State */}
        {!loading && options.length === 0 && (
          <Fade in={true}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "50vh",
                textAlign: "center",
                background: "rgba(255, 255, 255, 0.8)",
                borderRadius: "16px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                p: 4,
                mx: "auto",
                maxWidth: "600px",
              }}
            >
              <Park sx={{ fontSize: "5rem", color: "#1e88e5", mb: 2 }} />
              <Typography variant="h5" color="text.primary" sx={{ fontWeight: 600, mb: 2 }}>
                No Options Found
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ fontSize: "1.2rem", mb: 4 }}>
                {role === "staff"
                  ? "It looks like there are no options for this question yet. Add a new option to get started!"
                  : "There are no options available for this question. Check back later!"}
              </Typography>
              {role === "staff" && (
                <StyledButton
                  variant="contained"
                  startIcon={<AddCircle />}
                  onClick={() => handleOpenDialog()}
                  sx={{ background: "linear-gradient(90deg, #1e88e5, #42a5f5)" }}
                >
                  Add Option
                </StyledButton>
              )}
            </Box>
          </Fade>
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

        {/* Dialog for Adding/Editing Options */}
        {role === "staff" && (
          <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth sx={{ "& .MuiDialog-paper": { borderRadius: "16px" } }}>
            <DialogTitle sx={{ background: "linear-gradient(90deg, #1e88e5, #42a5f5)", color: "#fff", fontSize: "1.8rem", fontWeight: 600, py: 2 }}>
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
                  />
                }
                label="Is Correct?"
                sx={{ "& .MuiTypography-root": { fontSize: "1.1rem" } }}
              />
            </DialogContent>
            <DialogActions sx={{ p: 3, justifyContent: "space-between" }}>
              <StyledButton variant="outlined" onClick={handleCloseDialog} disabled={loading} sx={{ borderColor: "#1e88e5", color: "#1e88e5" }}>
                Cancel
              </StyledButton>
              <StyledButton
                variant="contained"
                onClick={handleSave}
                disabled={loading}
                sx={{ background: "linear-gradient(90deg, #1e88e5, #42a5f5)" }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : "Save"}
              </StyledButton>
            </DialogActions>
          </Dialog>
        )}

        {/* Snackbar for Notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            severity={snackbar.severity}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            sx={{ fontSize: "1.1rem", py: 1 }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default OptionManagement;