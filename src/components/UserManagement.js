import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField,
  Button, IconButton, Dialog, DialogActions, DialogContent, DialogTitle, TablePagination
} from "@mui/material";
import { Edit, Delete, Add } from "@mui/icons-material";
import { BASE_API } from "../constant";
import { getUserRoleFromAPI } from "../utils/roleUtils";

const API_URL = BASE_API + "/users";
const CREATE_STAFF_URL = BASE_API + "/users/staff";

const UserManagement = () => {
  const [role, setRole] = useState(null);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "", confirmPassword: "", age: 0 });
  const [selectedUser, setSelectedUser] = useState({ id: "", name: "", age: 0, phoneNumber: "", avatarUrl: "" });

  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(5);
  const [totalUsers, setTotalUsers] = useState(0);

  useEffect(() => {
    getUserRoleFromAPI().then(setRole);
  }, []);

  useEffect(() => {
    if (role === "admin") fetchUsers(search);
  }, [page, role]);

  const fetchUsers = (query = "") => {
    axios.get(API_URL, {
      params: {
        index: page + 1,
        pageSize: rowsPerPage,
        nameSearch: query
      },
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
    .then(response => {
      setUsers(response.data?.data?.items || []);
      setTotalUsers(response.data?.data?.totalCount || 0);
    })
    .catch(error => console.error("Error fetching users:", error));
  };

  const handleCreateStaff = () => {
    if (!newUser.name || !newUser.email || !newUser.password || !newUser.confirmPassword || !newUser.age) {
      alert("Please fill all fields!");
      return;
    }
    if (!/[A-Z]/.test(newUser.password)) {
      alert("Password must contain at least one uppercase letter!");
      return;
    }
    if (newUser.password !== newUser.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    axios.post(CREATE_STAFF_URL, newUser, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}`, "Content-Type": "application/json" }
    })
    .then(() => {
      fetchUsers();
      setOpen(false);
      setNewUser({ name: "", email: "", password: "", confirmPassword: "", age: 0 });
    })
    .catch(error => alert("Failed to create staff! " + (error.response?.data?.message || "Server error")));
  };

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setEditOpen(true);
  };

  const handleUpdateUser = () => {
    axios.put(`${API_URL}/user?id=${selectedUser.id}`, selectedUser, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    })
    .then(() => {
      fetchUsers();
      setEditOpen(false);
    })
    .catch(error => alert("Update failed: " + (error.response?.data?.message || "Server error")));
  };

  if (role === null) return <p>Loading permissions...</p>;
  if (role !== "admin") return <p style={{ color: "red" }}>You do not have permission to view this page.</p>;

  return (
    <div className="user-management-page" style={{ padding: 20 }}>
      <TextField
        label="Search..."
        variant="outlined"
        size="small"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          if (e.target.value === "") fetchUsers();
        }}
        style={{ marginRight: 10 }}
      />
      <Button variant="contained" color="primary" onClick={() => fetchUsers(search)} style={{ marginRight: 10 }}>
        Search
      </Button>
      <Button variant="contained" color="success" startIcon={<Add />} onClick={() => setOpen(true)}>
        Create Staff
      </Button>

      <TableContainer component={Paper} style={{ marginTop: 20 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Registration Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map(user => (
              <TableRow key={user.id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.createdTime}</TableCell>
                <TableCell>{user.status === 1 ? "ACTIVE" : "LOCKED"}</TableCell>
                <TableCell>
                  <IconButton color="primary" onClick={() => handleEditClick(user)}>
                    <Edit fontSize="small" />
                  </IconButton>
                  <IconButton color="error">
                    <Delete fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <TablePagination
          component="div"
          count={totalUsers}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[5]}
        />
      </TableContainer>

      {/* Create Staff Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Create Staff</DialogTitle>
        <DialogContent>
          <TextField label="Name" fullWidth margin="dense" value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} />
          <TextField label="Email" fullWidth margin="dense" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} />
          <TextField label="Password" fullWidth margin="dense" type="password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} />
          <TextField label="Confirm Password" fullWidth margin="dense" type="password" value={newUser.confirmPassword} onChange={(e) => setNewUser({ ...newUser, confirmPassword: e.target.value })} />
          <TextField label="Age" fullWidth margin="dense" type="number" value={newUser.age} onChange={(e) => setNewUser({ ...newUser, age: Number(e.target.value) })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateStaff} color="primary">Create</Button>
        </DialogActions>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)}>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <TextField label="Name" fullWidth margin="dense" value={selectedUser.name} onChange={(e) => setSelectedUser({ ...selectedUser, name: e.target.value })} />
          <TextField label="Age" fullWidth margin="dense" type="number" value={selectedUser.age} onChange={(e) => setSelectedUser({ ...selectedUser, age: Number(e.target.value) })} />
          <TextField label="Phone Number" fullWidth margin="dense" value={selectedUser.phoneNumber} onChange={(e) => setSelectedUser({ ...selectedUser, phoneNumber: e.target.value })} />
          <TextField label="Avatar URL" fullWidth margin="dense" value={selectedUser.avatarUrl} onChange={(e) => setSelectedUser({ ...selectedUser, avatarUrl: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdateUser} color="primary">Update</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default UserManagement;