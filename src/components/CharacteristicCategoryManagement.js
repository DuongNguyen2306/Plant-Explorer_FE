import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle,
  Box, Typography
} from "@mui/material";
import { BASE_API } from "../constant";
import { getUserRoleFromAPI } from "../utils/roleUtils";

const API_URL = BASE_API + "/characteristic-category";

const CharacteristicCategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState(null);
  const [editingCategory, setEditingCategory] = useState({ id: null, name: "" }); // Bỏ description

  useEffect(() => {
    getUserRoleFromAPI().then(setRole).catch(error => {
      console.error("Error fetching role:", error);
      setRole(null);
    });
  }, []);

  useEffect(() => {
    if (role === "staff") fetchCategories();
  }, [role]);

  const fetchCategories = async () => {
    try {
      const { data } = await axios.get(API_URL, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setCategories(data || []);
    } catch (error) {
      console.error("Error fetching characteristic categories:", error.response?.data || error);
      alert("Failed to fetch characteristic categories: " + (error.response?.data?.message || error.message));
      setCategories([]);
    }
  };

  const saveCategory = async () => {
    try {
      const payload = {
        name: editingCategory.name,
      };
      if (editingCategory.id) {
        await axios.put(`${API_URL}/${editingCategory.id}`, payload, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        alert("Characteristic category updated successfully!");
      } else {
        await axios.post(API_URL, payload, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        alert("Characteristic category created successfully!");
      }
      fetchCategories();
      setOpen(false);
      setEditingCategory({ id: null, name: "" }); // Bỏ description
    } catch (error) {
      console.error("Error saving characteristic category:", error.response?.data || error);
      alert("Failed to save characteristic category: " + (error.response?.data?.message || error.message));
    }
  };

  const deleteCategory = async (id) => {
    if (window.confirm("Are you sure you want to delete this characteristic category?")) {
      try {
        await axios.delete(`${API_URL}/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        fetchCategories();
        alert("Characteristic category deleted successfully!");
      } catch (error) {
        console.error("Error deleting characteristic category:", error.response?.data || error);
        alert("Failed to delete characteristic category: " + (error.response?.data?.message || error.message));
      }
    }
  };

  const handleOpenDialog = (category = { id: null, name: "" }) => {
    setEditingCategory(category);
    setOpen(true);
  };

  if (role === null) return <p>Loading...</p>;
  if (role !== "staff") return <p style={{ color: "red" }}>You do not have permission to manage characteristic categories.</p>;

  return (
    <Box sx={{ padding: "20px" }}>
      <Typography variant="h4" sx={{ fontWeight: "bold", marginBottom: "20px" }}>
        Characteristic Category Management
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
        <TextField
          label="Search by Name"
          variant="outlined"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          fullWidth
          sx={{ maxWidth: "400px" }}
        />
        <Button
          variant="contained"
          color="success"
          onClick={() => handleOpenDialog()}
          sx={{ minWidth: "120px" }}
        >
          Add Category
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={fetchCategories}
          sx={{ minWidth: "120px" }}
        >
          Refresh
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: "10px", overflow: "hidden", boxShadow: 3 }}>
        <Table>
          <TableHead sx={{ backgroundColor: "#f1f1f1" }}>
            <TableRow>
              <TableCell><strong>Name</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell> {/* Bỏ cột Description */}
            </TableRow>
          </TableHead>
          <TableBody>
            {categories
              .filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
              .map((cat) => (
                <TableRow key={cat.id}>
                  <TableCell>{cat.name}</TableCell>
                  <TableCell>
                    <Button onClick={() => handleOpenDialog(cat)}>Edit</Button>
                    <Button color="error" onClick={() => deleteCategory(cat.id)}>
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>{editingCategory.id ? "Edit Category" : "Add Category"}</DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            fullWidth
            margin="dense"
            value={editingCategory.name}
            onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
          />
          {/* Bỏ TextField cho description */}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={saveCategory}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CharacteristicCategoryManagement;