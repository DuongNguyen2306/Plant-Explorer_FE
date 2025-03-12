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
} from "@mui/material";
import { BASE_API } from "../constant";

const API_URL = BASE_API + "/avatar";
const AVATAR_OPTIONS = [
  "https://cdn-icons-png.flaticon.com/512/147/147142.png",
  "https://cdn-icons-png.flaticon.com/512/6858/6858485.png",
  "https://www.svgrepo.com/show/382106/male-avatar-boy-face-man-user-9.svg",
  "https://cdn3.iconfinder.com/data/icons/business-avatar-1/512/3_avatar-512.png",
  "https://img.lovepik.com/free-png/20211216/lovepik-boy-avatar-png-image_401704859_wh1200.png",
];

const AvatarManagement = () => {
  const [avatars, setAvatars] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingAvatar, setEditingAvatar] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchAvatars();
  }, []);

  const fetchAvatars = async () => {
    try {
      const response = await axios.get(API_URL);
      setAvatars(response.data);
    } catch (error) {
      console.error("Error fetching avatars:", error);
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
    
    // Kiểm tra avatar hợp lệ
    if (!AVATAR_OPTIONS.includes(editingAvatar.imageUrl)) {
      alert("Invalid avatar selection.");
      return;
    }

    try {
      if (editingAvatar.id) {
        await axios.put(`${API_URL}`, {
          id: editingAvatar.id,
          name: editingAvatar.name,
          imageUrl: editingAvatar.imageUrl,
        });
      } else {
        await axios.post(API_URL, {
          name: editingAvatar.name,
          imageUrl: editingAvatar.imageUrl,
        });
      }
      fetchAvatars();
      handleCloseDialog();
    } catch (error) {
      console.error("Error saving avatar:", error);
      alert("Failed to save avatar. Please check API format.");
    }
  };

  const handleDelete = async (id) => {
    await axios.delete(`${API_URL}/${id}`);
    fetchAvatars();
  };

  return (
    <div>
      <h2>Avatar Management</h2>
      <TextField
        label="Search Avatar"
        variant="outlined"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <Button variant="contained" color="primary" onClick={() => handleOpenDialog()}>
        Add Avatar
      </Button>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Avatar</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {avatars
              .filter((a) => a.name.toLowerCase().includes(search.toLowerCase()))
              .map((avatar) => (
                <TableRow key={avatar.id}>
                  <TableCell>
                    <img src={avatar.imageUrl} alt="avatar" width={50} height={50} style={{ borderRadius: "50%" }} />
                  </TableCell>
                  <TableCell>{avatar.name}</TableCell>
                  <TableCell>
                    <Button color="primary" onClick={() => handleOpenDialog(avatar)}>
                      Edit
                    </Button>
                    <Button color="secondary" onClick={() => handleDelete(avatar.id)}>
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleCloseDialog}>
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
          >
            {AVATAR_OPTIONS.map((url, index) => (
              <MenuItem key={index} value={url}>
                <img src={url} alt="avatar" width={30} height={30} style={{ marginRight: 10, borderRadius: "50%" }} />
                Avatar {index + 1}
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
    </div>
  );
};

export default AvatarManagement;