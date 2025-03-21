import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Button, TextField,
  Dialog, DialogActions, DialogContent, DialogTitle
} from "@mui/material";
import { BASE_API } from "../constant";

const API_URL = BASE_API + "/applicationcategory";

const ApplicationCategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState({ name: "", description: "" });

  useEffect(() => { fetchCategories(); }, []);

  const fetchCategories = async () => {
    const { data } = await axios.get(API_URL,{
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    setCategories(data);
  };

  const saveCategory = async () => {
    if (editingCategory.id) {
      await axios.put(`${API_URL}/${editingCategory.id}`, editingCategory);
    } else {
      await axios.post(API_URL, editingCategory);
    }
    fetchCategories();
    setOpen(false);
    setEditingCategory({ name: "", description: "" });
  };

  const deleteCategory = async (id) => {
    await axios.delete(`${API_URL}/${id}`);
    fetchCategories();
  };

  return (
    <div>
      <h2>Application Category Management</h2>
      <TextField label="Search" fullWidth margin="normal"
        value={search}
        onChange={(e) => setSearch(e.target.value)} />
      <Button variant="contained" onClick={() => setOpen(true)}>Add Category</Button>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categories.filter(c => c.name.toLowerCase().includes(search.toLowerCase())).map(cat => (
              <TableRow key={cat.id}>
                <TableCell>{cat.name}</TableCell>
                <TableCell>{cat.description}</TableCell>
                <TableCell>
                  <Button onClick={() => { setEditingCategory(cat); setOpen(true); }}>Edit</Button>
                  <Button color="error" onClick={() => deleteCategory(cat.id)}>Delete</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>{editingCategory.id ? "Edit Category" : "Add Category"}</DialogTitle>
        <DialogContent>
          <TextField label="Name" fullWidth margin="dense"
            value={editingCategory.name}
            onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })} />
          <TextField label="Description" fullWidth margin="dense"
            value={editingCategory.description}
            onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={saveCategory}>Save</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ApplicationCategoryManagement;
