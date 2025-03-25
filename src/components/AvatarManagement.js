// 📁 components/AvatarManagement.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Select,
  MenuItem,
  Box,
  Typography,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import { BASE_API } from "../constant";
import { getUserRoleFromAPI } from "../utils/roleUtils";

// Danh sách avatar mặc định
const DEFAULT_AVATARS = [
  {
    id: "1",
    name: "Avatar 1",
    imageUrl: "https://cdn-icons-png.flaticon.com/512/147/147142.png",
  },
  {
    id: "2",
    name: "Avatar 2",
    imageUrl: "https://cdn-icons-png.flaticon.com/512/6858/6858485.png",
  },
  {
    id: "3",
    name: "Avatar 3",
    imageUrl: "https://www.svgrepo.com/show/382106/male-avatar-boy-face-man-user-9.svg",
  },
];

const AVATAR_OPTIONS = [
  "https://cdn-icons-png.flaticon.com/512/147/147142.png",
  "https://cdn-icons-png.flaticon.com/512/6858/6858485.png",
  "https://www.svgrepo.com/show/382106/male-avatar-boy-face-man-user-9.svg",
  "https://cdn3.iconfinder.com/data/icons/business-avatar-1/512/3_avatar-512.png",
  "https://img.lovepik.com/free-png/20211216/lovepik-boy-avatar-png-image_401704859_wh1200.png",
];

const API_URL = BASE_API + "/avatar";

const AvatarManagement = () => {
  const [avatars, setAvatars] = useState(DEFAULT_AVATARS); // Khởi tạo với danh sách mặc định
  const [open, setOpen] = useState(false);
  const [editingAvatar, setEditingAvatar] = useState(null);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getUserRoleFromAPI().then(setRole);
  }, []);

  useEffect(() => {
    if (role === "staff" || role === "children") fetchAvatars();
  }, [role]);

  const fetchAvatars = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      // Nếu API trả về danh sách rỗng, sử dụng danh sách mặc định
      setAvatars(response.data.length > 0 ? response.data : DEFAULT_AVATARS);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching avatars:", error);
      setError("Failed to fetch avatars: " + (error.response?.data?.message || error.message));
      setLoading(false);
      // Nếu có lỗi, sử dụng danh sách mặc định
      setAvatars(DEFAULT_AVATARS);
    }
  };

  const handleOpenDialog = (avatar = null) => {
    setEditingAvatar(
      avatar || { id: "", name: "", imageUrl: AVATAR_OPTIONS[0] }
    );
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setEditingAvatar(null);
  };

  const handleSaveAvatar = async () => {
    if (!editingAvatar.name || !editingAvatar.imageUrl) {
      alert("Name and Avatar Image are required!");
      return;
    }
    if (!AVATAR_OPTIONS.includes(editingAvatar.imageUrl)) {
      alert("Invalid avatar selection.");
      return;
    }

    try {
      const headers = {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      };
      if (editingAvatar.id) {
        await axios.put(
          `${API_URL}`,
          {
            id: editingAvatar.id,
            name: editingAvatar.name,
            imageUrl: editingAvatar.imageUrl,
          },
          { headers }
        );
        alert("Avatar updated successfully!");
      } else {
        await axios.post(
          API_URL,
          {
            name: editingAvatar.name,
            imageUrl: editingAvatar.imageUrl,
          },
          { headers }
        );
        alert("Avatar created successfully!");
      }
      fetchAvatars();
      handleCloseDialog();
    } catch (error) {
      console.error("Error saving avatar:", error);
      alert("Failed to save avatar: " + (error.response?.data?.message || error.message));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this avatar?")) {
      try {
        await axios.delete(`${API_URL}/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        fetchAvatars();
        alert("Avatar deleted successfully!");
      } catch (error) {
        console.error("Error deleting avatar:", error);
        alert("Failed to delete avatar: " + (error.response?.data?.message || error.message));
      }
    }
  };

  // Hàm để chọn avatar cho tài khoản
  const handleSelectAvatar = (avatar) => {
    localStorage.setItem("selectedAvatar", avatar.imageUrl);
    alert(`Avatar "${avatar.name}" has been selected!`);
    window.location.reload(); // Làm mới trang để cập nhật Sidebar
  };

  if (role === null) return <p>Loading role...</p>;
  if (role !== "staff" && role !== "children")
    return <p style={{ color: "red" }}>You do not have permission to view avatars.</p>;
  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", padding: "20px" }}>
        <CircularProgress />
      </Box>
    );
  if (error)
    return (
      <Box sx={{ padding: "20px" }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );

  return (
    <Box sx={{ padding: "20px" }}>
      <Typography variant="h4" sx={{ fontWeight: "bold", marginBottom: "20px" }}>
        Avatar Management
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
        <TextField
          label="Search Avatar"
          variant="outlined"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ maxWidth: "400px", flex: 1 }}
        />
        {role === "staff" && (
          <>
            <Button
              variant="contained"
              color="success"
              onClick={() => handleOpenDialog()}
              sx={{ minWidth: "120px" }}
            >
              Add Avatar
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={fetchAvatars}
              sx={{ minWidth: "120px" }}
            >
              Refresh
            </Button>
          </>
        )}
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: "10px", overflow: "hidden", boxShadow: 3 }}>
        <Table>
          <TableHead sx={{ backgroundColor: "#f1f1f1" }}>
            <TableRow>
              <TableCell><strong>Avatar</strong></TableCell>
              <TableCell><strong>Name</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {avatars
              .filter((a) => a.name.toLowerCase().includes(search.toLowerCase()))
              .map((avatar) => (
                <TableRow key={avatar.id}>
                  <TableCell>
                    <img
                      src={avatar.imageUrl}
                      alt="avatar"
                      width={50}
                      height={50}
                      style={{ borderRadius: "50%" }}
                      onError={(e) => (e.target.src = "https://via.placeholder.com/50")} // Xử lý lỗi hình ảnh
                    />
                  </TableCell>
                  <TableCell>{avatar.name}</TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => handleSelectAvatar(avatar)}
                      sx={{ marginRight: "10px" }}
                    >
                      Select
                    </Button>
                    {role === "staff" && (
                      <>
                        <IconButton
                          onClick={() => handleOpenDialog(avatar)}
                          sx={{ color: "#1976d2" }}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton
                          onClick={() => handleDelete(avatar.id)}
                          sx={{ color: "#d32f2f" }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      {avatars.length === 0 && (
        <Typography variant="h6" color="text.secondary" sx={{ mt: 4, textAlign: "center" }}>
          No avatars found.
        </Typography>
      )}

      {role === "staff" && (
        <Dialog open={open} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>{editingAvatar?.id ? "Edit Avatar" : "Add Avatar"}</DialogTitle>
          <DialogContent>
            <TextField
              label="Name"
              fullWidth
              margin="dense"
              value={editingAvatar?.name || ""}
              onChange={(e) => setEditingAvatar({ ...editingAvatar, name: e.target.value })}
            />
            <Select
              fullWidth
              value={editingAvatar?.imageUrl || AVATAR_OPTIONS[0]}
              onChange={(e) => setEditingAvatar({ ...editingAvatar, imageUrl: e.target.value })}
              sx={{ marginTop: "10px" }}
            >
              {AVATAR_OPTIONS.map((url, index) => (
                <MenuItem key={index} value={url}>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <img
                      src={url}
                      alt={`avatar-${index}`}
                      width={30}
                      height={30}
                      style={{ marginRight: 10, borderRadius: "50%" }}
                      onError={(e) => (e.target.src = "https://via.placeholder.com/30")} // Xử lý lỗi hình ảnh
                    />
                    Avatar {index + 1}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleSaveAvatar} color="primary">
              Save
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default AvatarManagement;