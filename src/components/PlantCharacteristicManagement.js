import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Button, TextField,
  Dialog, DialogActions, DialogContent, DialogTitle
} from "@mui/material";
import { BASE_API } from "../constant";

const API_URL = BASE_API + "/plantcharacteristic";

const PlantCharacteristicManagement = () => {
  const [characteristics, setCharacteristics] = useState([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editingCharacteristic, setEditingCharacteristic] = useState({ name: "", description: "" });

  useEffect(() => { fetchCharacteristics(); }, []);

  const fetchCharacteristics = async () => {
    try {
      const { data } = await axios.get(API_URL,{
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setCharacteristics(data);
    } catch (error) {
      console.error("Error fetching characteristics:", error);
    }
  };

  const saveCharacteristic = async () => {
    try {
      if (editingCharacteristic.id) {
        await axios.put(`${API_URL}/${editingCharacteristic.id}`, editingCharacteristic);
      } else {
        await axios.post(API_URL, editingCharacteristic);
      }
      fetchCharacteristics();
      setOpen(false);
      setEditingCharacteristic({ name: "", description: "" });
    } catch (error) {
      console.error("Error saving characteristic:", error);
    }
  };

  const deleteCharacteristic = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchCharacteristics();
    } catch (error) {
      console.error("Error deleting characteristic:", error);
    }
  };

  const handleOpenDialog = (char = { name: "", description: "" }) => {
    setEditingCharacteristic(char);
    setOpen(true);
  };

  return (
    <div>
      <h2>Plant Characteristic Management</h2>
      <TextField
        label="Search"
        fullWidth
        margin="normal"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <Button variant="contained" onClick={() => handleOpenDialog()} style={{ marginBottom: 20 }}>
        Add Characteristic
      </Button>

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
            {characteristics
              .filter((c) => c.plantName.toLowerCase().includes(search.toLowerCase()))
              .map((char) => (
                <TableRow key={char.id}>
                  <TableCell>{char.plantName}</TableCell>
                  <TableCell>{char.description}</TableCell>
                  <TableCell>
                    <Button onClick={() => handleOpenDialog(char)}>Edit</Button>
                    <Button color="error" onClick={() => deleteCharacteristic(char.id)}>
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>{editingCharacteristic.id ? "Edit Characteristic" : "Add Characteristic"}</DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            fullWidth
            margin="dense"
            value={editingCharacteristic.plantName}
            onChange={(e) => setEditingCharacteristic({ ...editingCharacteristic, name: e.target.value })}
          />
          <TextField
            label="Description"
            fullWidth
            margin="dense"
            value={editingCharacteristic.description}
            onChange={(e) => setEditingCharacteristic({ ...editingCharacteristic, description: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={saveCharacteristic}>Save</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default PlantCharacteristicManagement;
