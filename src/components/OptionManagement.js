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
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import { Edit, Delete } from "@mui/icons-material";

const API_URL = "https://plant-explorer-backend-0-0-1.onrender.com/api/options";

const OptionManagement = () => {
  const { questionId } = useParams();
  const [options, setOptions] = useState([]);
  const [page, setPage] = useState(1);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingOption, setEditingOption] = useState(null);
  const rowsPerPage = 6;

  useEffect(() => {
    fetchOptions();
  }, [questionId]);

  const fetchOptions = async () => {
    try {
      const res = await axios.get(`${API_URL}?questionId=${questionId}`);
      setOptions(res.data?.data?.items || []);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách tùy chọn:", error);
    }
  };

  const paginatedOptions = options.slice((page - 1) * rowsPerPage, page * rowsPerPage);

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
    try {
      if (editingOption.id) {
        await axios.put(`${API_URL}/option?id=${editingOption.id}`, editingOption);
      } else {
        await axios.post(`${API_URL}/option`, editingOption);
      }
      fetchOptions();
      handleCloseDialog();
    } catch (error) {
      console.error("Lỗi khi lưu option:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/option?id=${id}`);
      fetchOptions();
    } catch (error) {
      console.error("Lỗi khi xóa option:", error);
    }
  };

  return (
    <Box sx={{ padding: 4, backgroundColor: "#e3eafc", minHeight: "100vh" }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Option Management
      </Typography>

      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <Button variant="contained" color="success" onClick={() => handleOpenDialog()}>
          ADD OPTION
        </Button>
        <Button onClick={fetchOptions} variant="contained" color="primary">
          REFRESH
        </Button>
      </Box>

      <Grid container spacing={3}>
        {paginatedOptions.map((option) => (
          <Grid item xs={12} sm={6} md={4} key={option.id}>
            <Card sx={{ borderRadius: 3, boxShadow: 3, textAlign: "center" }}>
              <CardMedia
                component="img"
                height="160"
                image={"https://via.placeholder.com/300x160?text=Option"}
                alt="Option"
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
                <Box sx={{ display: "flex", justifyContent: "center", mt: 2, gap: 1 }}>
                  <IconButton color="info" onClick={() => handleOpenDialog(option)}>
                    <Edit />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDelete(option.id)}>
                    <Delete />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Hiển thị phân trang nếu có dữ liệu */}
      {options.length > 0 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <Pagination
            count={Math.ceil(options.length / rowsPerPage)}
            page={page}
            onChange={(e, value) => setPage(value)}
            color="primary"
          />
        </Box>
      )}

      {/* Dialog Thêm/Sửa */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>{editingOption?.id ? "Edit Option" : "Add Option"}</DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            fullWidth
            margin="dense"
            value={editingOption?.name || ""}
            onChange={(e) => setEditingOption({ ...editingOption, name: e.target.value })}
          />
          <TextField
            label="Context"
            fullWidth
            margin="dense"
            value={editingOption?.context || ""}
            onChange={(e) => setEditingOption({ ...editingOption, context: e.target.value })}
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
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSave} color="primary">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OptionManagement;
