import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import {
  Card, CardContent, Typography, Button, Grid, Box, Pagination,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  FormControlLabel, Checkbox, IconButton, CardMedia, CircularProgress,
  Snackbar, Alert,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import { Edit, Delete, AddCircle, Refresh } from "@mui/icons-material";
import { getUserRoleFromAPI } from "../utils/roleUtils";

const API_URL = "https://plant-explorer-backend-0-0-1.onrender.com/api/options";

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
  const rowsPerPage = 6;

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
    setEditingOption(
      option || { name: "", context: "", isCorrect: false, questionId }
    );
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
        await axios.put(`${API_URL}/${editingOption.id}`, payload, { headers }); // Sửa theo API documentation
        setSnackbar({ open: true, message: "Option updated successfully!", severity: "success" });
      } else {
        await axios.post(API_URL, payload, { headers }); // Sửa theo API documentation
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
      await axios.delete(`${API_URL}/${id}`, { headers }); // Sửa theo API documentation
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

  if (role === null) return (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <CircularProgress />
    </Box>
  );

  if (role !== "staff" && role !== "children") return (
    <Box sx={{ textAlign: "center", mt: 5 }}>
      <Typography variant="h6" color="error">
        You do not have permission to view options.
      </Typography>
    </Box>
  );

  return (
    <Box sx={{ padding: 4, backgroundColor: "#e3eafc", minHeight: "100vh" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" color="primary">
          Option Management
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
              Add Option
            </Button>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<Refresh />}
              onClick={fetchOptions}
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
        {options.slice((page - 1) * rowsPerPage, page * rowsPerPage).map((option) => (
          <Grid item xs={12} sm={6} md={4} key={option.id}>
            <Card sx={{ borderRadius: 3, boxShadow: 3, textAlign: "center", transition: "transform 0.2s", "&:hover": { transform: "scale(1.02)" } }}>
              <CardMedia
                component="img"
                height="160"
                image={"https://via.placeholder.com/300x160?text=Option"}
                alt="Option"
                sx={{ objectFit: "cover" }}
              />
              <CardContent>
                <Typography variant="h6" fontWeight="bold" sx={{ minHeight: "3rem" }}>
                  {option.context || "No Text"}
                </Typography>
                {option.isCorrect ? (
                  <CheckCircleIcon color="success" sx={{ fontSize: 40, mt: 1 }} />
                ) : (
                  <CancelIcon color="error" sx={{ fontSize: 40, mt: 1 }} />
                )}
                {role === "staff" && (
                  <Box sx={{ display: "flex", justifyContent: "center", mt: 2, gap: 1 }}>
                    <IconButton color="info" onClick={() => handleOpenDialog(option)} disabled={loading}>
                      <Edit />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDelete(option.id)} disabled={loading}>
                      <Delete />
                    </IconButton>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {options.length === 0 && !loading && (
        <Typography variant="h6" color="text.secondary" textAlign="center" mt={5}>
          No options found. {role === "staff" ? "Add a new option to get started!" : ""}
        </Typography>
      )}

      {totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
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
            {editingOption?.id ? "Edit Option" : "Add New Option"}
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <TextField
              label="Name"
              fullWidth
              margin="dense"
              value={editingOption?.name || ""}
              onChange={(e) => setEditingOption({ ...editingOption, name: e.target.value })}
              required
              error={!editingOption?.name}
              helperText={!editingOption?.name ? "Name is required" : ""}
            />
            <TextField
              label="Context"
              fullWidth
              margin="dense"
              value={editingOption?.context || ""}
              onChange={(e) => setEditingOption({ ...editingOption, context: e.target.value })}
              required
              error={!editingOption?.context}
              helperText={!editingOption?.context ? "Context is required" : ""}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={editingOption?.isCorrect || false}
                  onChange={(e) =>
                    setEditingOption({ ...editingOption, isCorrect: e.target.checked })
                  }
                />
              }
              label="Is Correct?"
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
    </Box>
  );
};

export default OptionManagement;