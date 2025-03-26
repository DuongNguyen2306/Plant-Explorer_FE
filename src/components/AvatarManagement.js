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
  Snackbar,
  Alert
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import { BASE_API } from "../constant";
import { getUserRoleFromAPI } from "../utils/roleUtils";

// Danh sách avatar mặc định (chỉ dùng để hiển thị khi không có dữ liệu từ API)
const DEFAULT_AVATARS = [
  {
    id: "default-1",
    name: "Avatar 1",
    imageUrl: "https://cdn-icons-png.flaticon.com/512/147/147142.png",
    isDefault: true, // Đánh dấu là avatar mặc định
  },
  {
    id: "default-2",
    name: "Avatar 2",
    imageUrl: "https://cdn-icons-png.flaticon.com/512/6858/6858485.png",
    isDefault: true,
  },
  {
    id: "default-3",
    name: "Avatar 3",
    imageUrl: "https://www.svgrepo.com/show/382106/male-avatar-boy-face-man-user-9.svg",
    isDefault: true,
  },
];

const AVATAR_OPTIONS = [
  "https://cdn-icons-png.flaticon.com/512/147/147142.png",
  "https://cdn-icons-png.flaticon.com/512/6858/6858485.png",
  "https://www.svgrepo.com/show/382106/male-avatar-boy-face-man-user-9.svg",
  "https://cdn3.iconfinder.com/data/icons/business-avatar-1/512/3_avatar-512.png",
  "https://img.lovepik.com/free-png/20211216/lovepik-boy-avatar-png-image_401704859_wh1200.png",
];

const API_URL = BASE_API + "/avatars";

const AvatarManagement = () => {
  const [avatars, setAvatars] = useState([]); // Không khởi tạo với DEFAULT_AVATARS
  const [serverAvatars, setServerAvatars] = useState([]); // Lưu danh sách avatar từ server
  const [open, setOpen] = useState(false);
  const [editingAvatar, setEditingAvatar] = useState(null);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  useEffect(() => {
    getUserRoleFromAPI().then(setRole);
  }, []);

  useEffect(() => {
    if (role === "staff" || role === "children") fetchAvatars();
  }, [role]);

  const getAuthToken = () => {
    const token = localStorage.getItem("token");
    console.log("Retrieved token:", token);
    return token || "";
  };

  const fetchAvatars = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getAuthToken();
      if (!token) {
        setSnackbar({ open: true, message: "Authorization token is missing! Please log in.", severity: "error" });
        setLoading(false);
        return;
      }

      const response = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Avatars response:", response.data); // Debug
      // Kiểm tra dữ liệu trả về
      const fetchedAvatars = Array.isArray(response.data) ? response.data : response.data?.data || [];
      // Thêm thuộc tính isDefault cho các avatar từ server
      const updatedAvatars = fetchedAvatars.map((avatar) => ({
        ...avatar,
        isDefault: false, // Avatar từ server không phải là mặc định
      }));
      setServerAvatars(updatedAvatars); // Lưu danh sách avatar từ server
      // Nếu không có avatar từ server, hiển thị DEFAULT_AVATARS
      setAvatars(updatedAvatars.length > 0 ? updatedAvatars : DEFAULT_AVATARS);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching avatars:", error);
      setError("Failed to fetch avatars: " + (error.response?.data?.message || error.message));
      setLoading(false);
      setAvatars(DEFAULT_AVATARS); // Sử dụng danh sách mặc định nếu có lỗi
      setServerAvatars([]);
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
      setSnackbar({ open: true, message: "Name and Avatar Image are required!", severity: "warning" });
      return;
    }
    if (!AVATAR_OPTIONS.includes(editingAvatar.imageUrl)) {
      setSnackbar({ open: true, message: "Invalid avatar selection.", severity: "warning" });
      return;
    }

    try {
      const token = getAuthToken();
      if (!token) {
        setSnackbar({ open: true, message: "Authorization token is missing! Please log in.", severity: "error" });
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };
      if (editingAvatar.id && !editingAvatar.isDefault) {
        // Cập nhật avatar
        await axios.put(
          `${API_URL}/${editingAvatar.id}`,
          {
            id: editingAvatar.id, // Thêm id vào body theo API documentation
            imageUrl: editingAvatar.imageUrl,
          },
          { headers }
        );
        setSnackbar({ open: true, message: "Avatar updated successfully!", severity: "success" });
      } else {
        // Tạo mới avatar
        await axios.post(
          API_URL,
          {
            name: editingAvatar.name,
            imageUrl: editingAvatar.imageUrl,
          },
          { headers }
        );
        setSnackbar({ open: true, message: "Avatar created successfully!", severity: "success" });
      }
      fetchAvatars();
      handleCloseDialog();
    } catch (error) {
      console.error("Error saving avatar:", error);
      setSnackbar({ open: true, message: "Failed to save avatar: " + (error.response?.data?.message || error.message), severity: "error" });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this avatar?")) {
      try {
        const token = getAuthToken();
        if (!token) {
          setSnackbar({ open: true, message: "Authorization token is missing! Please log in.", severity: "error" });
          return;
        }

        await axios.delete(`${API_URL}/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchAvatars();
        setSnackbar({ open: true, message: "Avatar deleted successfully!", severity: "success" });
      } catch (error) {
        console.error("Error deleting avatar:", error);
        setSnackbar({ open: true, message: "Failed to delete avatar: " + (error.response?.data?.message || error.message), severity: "error" });
      }
    }
  };

  const handleSelectAvatar = async (avatar) => {
    // Không cho phép chọn avatar mặc định
    if (avatar.isDefault) {
      setSnackbar({ open: true, message: "Cannot select a default avatar. Please create a new avatar or select an existing one from the server.", severity: "warning" });
      return;
    }

    try {
      const token = getAuthToken();
      if (!token) {
        setSnackbar({ open: true, message: "Authorization token is missing! Please log in.", severity: "error" });
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };
      console.log("Selecting avatar:", avatar); // Debug
      // Gọi API để cập nhật avatar cho user, sử dụng PUT theo Swagger
      const response = await axios.put(
        `${API_URL}/user/${avatar.id}`,
        {}, // Không cần body theo Swagger
        { headers }
      );
      console.log("Select avatar response:", response.data); // Debug
      localStorage.setItem("selectedAvatar", avatar.imageUrl);
      setSnackbar({ open: true, message: `Avatar "${avatar.name}" has been selected!`, severity: "success" });
      // Gửi sự kiện để Sidebar cập nhật
      window.dispatchEvent(new Event("avatarUpdated"));
    } catch (error) {
      console.error("Error selecting avatar:", error);
      const errorMessage = error.response?.data?.message || error.message;
      setSnackbar({ open: true, message: `Failed to select avatar: ${errorMessage}`, severity: "error" });
    }
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

  const filteredAvatars = avatars.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase())
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

      {serverAvatars.length === 0 && (
        <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
          No avatars available on the server. Please create a new avatar to select.
        </Typography>
      )}

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
            {filteredAvatars.map((avatar) => (
              <TableRow key={avatar.id}>
                <TableCell>
                  <img
                    src={avatar.imageUrl}
                    alt={avatar.name}
                    width={50}
                    height={50}
                    style={{ borderRadius: "50%" }}
                    onError={(e) => (e.target.src = "https://via.placeholder.com/50?text=Error")} // Xử lý lỗi hình ảnh
                  />
                </TableCell>
                <TableCell>{avatar.name}</TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => handleSelectAvatar(avatar)}
                    sx={{ marginRight: "10px" }}
                    disabled={avatar.isDefault || false} // Vô hiệu hóa nút Select cho avatar mặc định
                  >
                    Select
                  </Button>
                  {role === "staff" && (
                    <>
                      <IconButton
                        onClick={() => handleOpenDialog(avatar)}
                        sx={{ color: "#1976d2" }}
                        disabled={avatar.isDefault || false} // Không cho phép chỉnh sửa avatar mặc định
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton
                        onClick={() => handleDelete(avatar.id)}
                        sx={{ color: "#d32f2f" }}
                        disabled={avatar.isDefault || false} // Không cho phép xóa avatar mặc định
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
      {avatars.length > 0 && filteredAvatars.length === 0 && (
        <Typography variant="h6" color="text.secondary" sx={{ mt: 4, textAlign: "center" }}>
          No avatars match your search.
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
                      onError={(e) => (e.target.src = "https://via.placeholder.com/30?text=Error")} // Xử lý lỗi hình ảnh
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

export default AvatarManagement;