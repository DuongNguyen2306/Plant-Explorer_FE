import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Button, TextField,
  Dialog, DialogActions, DialogContent, DialogTitle
} from "@mui/material";
import { BASE_API } from "../constant";

const API_URL = BASE_API + "/plantapplication";

const PlantApplicationManagement = () => {
  const [applications, setApplications] = useState([]);
  console.log("🚀 ~ PlantApplicationManagement ~ applications:", applications)
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editingApplication, setEditingApplication] = useState({ name: "", description: "" });

  useEffect(() => { fetchApplications(); }, []);

  const fetchApplications = async () => {
    const { data } = await axios.get(API_URL,{
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    setApplications(data);
  };

  const saveApplication = async () => {
    if (editingApplication.id) {
      await axios.put(`${API_URL}/${editingApplication.id}`, editingApplication);
    } else {
      await axios.post(API_URL, editingApplication);
    }
    fetchApplications();
    setOpen(false);
    setEditingApplication({ name: "", description: "" });
  };

  const deleteApplication = async (id) => {
    await axios.delete(`${API_URL}/${id}`);
    fetchApplications();
  };

  return (
    <div>
      <h2>Plant Application Management</h2>
      <TextField label="Search" fullWidth margin="normal"
        value={search}
        onChange={(e) => setSearch(e.target.value)} />
      <Button variant="contained" onClick={() => setOpen(true)}>Add Application</Button>

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
            {applications.filter(a => a.plantName?.toLowerCase().includes(search?.toLowerCase())).map(app => (
              <TableRow key={app.id}>
                <TableCell>{app.plantName}</TableCell>
                <TableCell>{app.description}</TableCell>
                <TableCell>
                  <Button onClick={() => { setEditingApplication(app); setOpen(true); }}>Edit</Button>
                  <Button color="error" onClick={() => deleteApplication(app.id)}>Delete</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>{editingApplication.id ? "Edit Application" : "Add Application"}</DialogTitle>
        <DialogContent>
          <TextField label="Name" fullWidth margin="dense"
            value={editingApplication.plantName}
            onChange={(e) => setEditingApplication({ ...editingApplication, name: e.target.value })} />
          <TextField label="Description" fullWidth margin="dense"
            value={editingApplication.description}
            onChange={(e) => setEditingApplication({ ...editingApplication, description: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={saveApplication}>Save</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default PlantApplicationManagement;
