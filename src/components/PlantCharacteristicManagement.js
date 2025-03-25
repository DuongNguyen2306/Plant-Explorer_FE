import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Button, TextField,
  Dialog, DialogActions, DialogContent, DialogTitle
} from "@mui/material";
import { BASE_API } from "../constant";
import { getUserRoleFromAPI } from "../utils/roleUtils";

const API_URL = BASE_API + "/plantcharacteristic";

const PlantCharacteristicManagement = () => {
  const [characteristics, setCharacteristics] = useState([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState(null);
  const [editingCharacteristic, setEditingCharacteristic] = useState({
    id: null,
    plantId: "",
    characteristicCategoryId: "",
    description: "",
  });

  useEffect(() => {
    getUserRoleFromAPI().then(setRole);
  }, []);

  useEffect(() => {
    if (role === "staff" || role === "children") fetchCharacteristics();
  }, [role]);

  const fetchCharacteristics = async () => {
    try {
      const { data } = await axios.get(API_URL, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setCharacteristics(data);
    } catch (error) {
      console.error("🚨 Error fetching characteristics:", error.response?.data || error);
    }
  };

  const saveCharacteristic = async () => {
    if (!editingCharacteristic.plantId || !editingCharacteristic.characteristicCategoryId) {
      console.error("🚨 Error: plantId và characteristicCategoryId không được để trống!");
      return;
    }

    const payload = {
      plantId: editingCharacteristic.plantId,
      characteristicCategoryId: editingCharacteristic.characteristicCategoryId,
      description: editingCharacteristic.description || "No description",
    };

    try {
      let response;
      if (editingCharacteristic.id) {
        response = await axios.put(`${API_URL}/${editingCharacteristic.id}`, { 
          description: editingCharacteristic.description 
        });
      } else {
        response = await axios.post(API_URL, payload);
      }
      await fetchCharacteristics();
      handleCloseDialog();
    } catch (error) {
      console.error("🚨 Error saving characteristic:", error.response?.data || error);
    }
  };

  const deleteCharacteristic = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchCharacteristics();
    } catch (error) {
      console.error("🚨 Error deleting characteristic:", error);
    }
  };

  const handleOpenDialog = (char = null) => {
    setEditingCharacteristic(
      char
        ? {
            id: char.id,
            plantId: char.plantId || "",
            characteristicCategoryId: char.characteristicCategoryId || "",
            description: char.description || "",
          }
        : { id: null, plantId: "", characteristicCategoryId: "", description: "" }
    );
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setEditingCharacteristic({ id: null, plantId: "", characteristicCategoryId: "", description: "" });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditingCharacteristic((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (role === null) return <p>Loading...</p>;
  if (role !== "staff" && role !== "children") return <p style={{ color: 'red' }}>You do not have permission to view plant characteristics.</p>;

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
      {role === "staff" && (
        <Button variant="contained" onClick={() => handleOpenDialog()} style={{ marginBottom: 20 }}>
          Add Characteristic
        </Button>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Plant ID</TableCell>
              <TableCell>Category ID</TableCell>
              <TableCell>Description</TableCell>
              {role === "staff" && <TableCell>Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {characteristics
              .filter((c) => c.description.toLowerCase().includes(search.toLowerCase()))
              .map((char) => (
                <TableRow key={char.id}>
                  <TableCell>{char.plantId}</TableCell>
                  <TableCell>{char.characteristicCategoryId}</TableCell>
                  <TableCell>{char.description}</TableCell>
                  {role === "staff" && (
                    <TableCell>
                      <Button onClick={() => handleOpenDialog(char)}>Edit</Button>
                      <Button color="error" onClick={() => deleteCharacteristic(char.id)}>
                        Delete
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      {role === "staff" && (
        <Dialog open={open} onClose={handleCloseDialog}>
          <DialogTitle>{editingCharacteristic.id ? "Edit Characteristic" : "Add Characteristic"}</DialogTitle>
          <DialogContent>
            <TextField
              label="Plant ID"
              fullWidth
              margin="dense"
              name="plantId"
              value={editingCharacteristic.plantId || ""}
              onChange={handleInputChange}
            />
            <TextField
              label="Category ID"
              fullWidth
              margin="dense"
              name="characteristicCategoryId"
              value={editingCharacteristic.characteristicCategoryId || ""}
              onChange={handleInputChange}
            />
            <TextField
              label="Description"
              fullWidth
              margin="dense"
              name="description"
              value={editingCharacteristic.description || ""}
              onChange={handleInputChange}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={saveCharacteristic} color="primary">Save</Button>
          </DialogActions>
        </Dialog>
      )}
    </div>
  );
};

export default PlantCharacteristicManagement;