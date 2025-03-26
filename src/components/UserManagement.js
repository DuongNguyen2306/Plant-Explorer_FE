import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField,
  Button, IconButton, Dialog, DialogActions, DialogContent, DialogTitle, TablePagination,
  Tabs, Tab, Box, Typography
} from "@mui/material";
import { Edit, Delete, Add, Visibility } from "@mui/icons-material";
import { BASE_API } from "../constant";
import { getUserRoleFromAPI } from "../utils/roleUtils";

const API_URL = BASE_API + "/users";
const CREATE_STAFF_URL = BASE_API + "/users/staff";
const QUIZ_ATTEMPTS_URL = BASE_API + "/quiz-attempts";

const UserManagement = () => {
  const [role, setRole] = useState(null);
  const [childrenUsers, setChildrenUsers] = useState([]);
  const [staffUsers, setStaffUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "", confirmPassword: "", age: 0 });
  const [selectedUser, setSelectedUser] = useState({ id: "", name: "", age: 0, phoneNumber: "", avatarUrl: "" });
  const [selectedUserDetails, setSelectedUserDetails] = useState(null);
  const [quizAttempts, setQuizAttempts] = useState(0);

  const [pageChildren, setPageChildren] = useState(0);
  const [pageStaff, setPageStaff] = useState(0);
  const [rowsPerPage] = useState(5);
  const [totalChildren, setTotalChildren] = useState(0);
  const [totalStaff, setTotalStaff] = useState(0);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    getUserRoleFromAPI().then(setRole);
  }, []);

  useEffect(() => {
    if (role === "admin") {
      fetchUsers("children", search, pageChildren);
      fetchUsers("staff", search, pageStaff);
    }
  }, [pageChildren, pageStaff, role]);

  const fetchUsers = (userRole, query = "", page = 0) => {
    axios.get(API_URL, {
      params: {
        index: page + 1,
        pageSize: rowsPerPage,
        nameSearch: query,
        role: userRole
      },
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      timeout: 10000, // Timeout 10 giây
    })
    .then(response => {
      if (userRole === "children") {
        setChildrenUsers(response.data?.data?.items || []);
        setTotalChildren(response.data?.data?.totalCount || 0);
      } else if (userRole === "staff") {
        setStaffUsers(response.data?.data?.items || []);
        setTotalStaff(response.data?.data?.totalCount || 0);
      }
    })
    .catch(error => console.error(`Error fetching ${userRole} users:`, error));
  };

  const fetchQuizAttempts = (userId) => {
    axios.get(QUIZ_ATTEMPTS_URL, {
      params: {
        index: 1,
        pageSize: 10,
        userId: userId
      },
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      timeout: 10000, // Timeout 10 giây
    })
    .then(response => {
      const attempts = response.data?.data?.totalCount || 0;
      setQuizAttempts(attempts);
    })
    .catch(error => {
      console.error("Error fetching quiz attempts:", error);
      setQuizAttempts(0);
    });
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
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}`, "Content-Type": "application/json" },
      timeout: 10000, // Timeout 10 giây
    })
    .then(() => {
      fetchUsers("staff", search, pageStaff);
      setOpen(false);
      setNewUser({ name: "", email: "", password: "", confirmPassword: "", age: 0 });
    })
    .catch(error => alert("Failed to create staff! " + (error.response?.data?.message || "Server error")));
  };

  const handleDeleteUser = async (id, userRole) => {
    if (!id) {
      alert("User ID is missing!");
      return;
    }

    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        const response = await axios.delete(`${API_URL}/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          timeout: 10000, // Timeout 10 giây
        });

        if (response.status === 200) {
          alert("User deleted successfully!");
          fetchUsers(userRole, search, userRole === "children" ? pageChildren : pageStaff);
        } else {
          throw new Error(`Unexpected response status: ${response.status}`);
        }
      } catch (error) {
        console.error("Error deleting user:", error);
        let errorMessage = "Failed to delete user: ";
        if (error.response) {
          errorMessage += error.response.data?.Message || error.response.data?.message || `Server error (Status: ${error.response.status})`;
        } else if (error.code === "ECONNABORTED") {
          errorMessage += "Request timed out. Please check your network connection.";
        } else {
          errorMessage += error.message || "Unknown error";
        }
        alert(errorMessage);
      }
    }
  };

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setEditOpen(true);
  };

  const handleViewDetail = (user) => {
    setSelectedUserDetails(user);
    if (user.role === "children") {
      fetchQuizAttempts(user.id);
    }
    setDetailOpen(true);
  };

  const handleUpdateUser = () => {
    if (!selectedUser.id) {
      alert("User ID is missing!");
      return;
    }

    // Đảm bảo dữ liệu gửi lên đúng định dạng
    const updatedUser = {
      name: selectedUser.name || "",
      age: selectedUser.age || 0,
      phoneNumber: selectedUser.phoneNumber || "",
      avatarUrl: selectedUser.avatarUrl || "",
    };

    axios.put(`${API_URL}/${selectedUser.id}`, updatedUser, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json"
      },
      timeout: 10000, // Timeout 10 giây
    })
    .then((response) => {
      if (response.status === 200) {
        alert("User updated successfully!");
        fetchUsers(selectedUser.role, search, selectedUser.role === "children" ? pageChildren : pageStaff);
        setEditOpen(false);
      } else {
        throw new Error(`Unexpected response status: ${response.status}`);
      }
    })
    .catch(error => {
      console.error("Error updating user:", error);
      let errorMessage = "Update failed: ";
      if (error.response) {
        errorMessage += error.response.data?.Message || error.response.data?.message || `Server error (Status: ${error.response.status})`;
      } else if (error.code === "ECONNABORTED") {
        errorMessage += "Request timed out. Please check your network connection.";
      } else {
        errorMessage += error.message || "Unknown error";
      }
      alert(errorMessage);
    });
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (role === null) return <p>Loading permissions...</p>;
  if (role !== "admin") return <p style={{ color: "red" }}>You do not have permission to view this page.</p>;

  return (
    <div className="user-management-page" style={{ padding: 20 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
        <TextField
          label="Search..."
          variant="outlined"
          size="small"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            if (e.target.value === "") {
              fetchUsers("children", "", pageChildren);
              fetchUsers("staff", "", pageStaff);
            }
          }}
          style={{ marginRight: 10 }}
        />
        <Box>
          <Button variant="contained" color="primary" onClick={() => {
            fetchUsers("children", search, pageChildren);
            fetchUsers("staff", search, pageStaff);
          }} style={{ marginRight: 10 }}>
            Search
          </Button>
          <Button variant="contained" color="success" startIcon={<Add />} onClick={() => setOpen(true)}>
            Create Staff
          </Button>
        </Box>
      </Box>

      <Tabs value={tabValue} onChange={handleTabChange} sx={{ marginBottom: 2 }}>
        <Tab label="Children" />
        <Tab label="Staff" />
      </Tabs>

      {/* Children Tab */}
      {tabValue === 0 && (
        <TableContainer component={Paper} sx={{ marginTop: 2, minWidth: "1000px" }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold", padding: "16px" }}>Name</TableCell>
                <TableCell sx={{ fontWeight: "bold", padding: "16px" }}>Email</TableCell>
                <TableCell sx={{ fontWeight: "bold", padding: "16px" }}>Registration Date</TableCell>
                <TableCell sx={{ fontWeight: "bold", padding: "16px" }}>Status</TableCell>
                <TableCell sx={{ fontWeight: "bold", padding: "16px" }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {childrenUsers.map(user => (
                <TableRow key={user.id}>
                  <TableCell sx={{ padding: "16px" }}>{user.name}</TableCell>
                  <TableCell sx={{ padding: "16px" }}>{user.email}</TableCell>
                  <TableCell sx={{ padding: "16px" }}>{user.createdTime}</TableCell>
                  <TableCell sx={{ padding: "16px" }}>{user.status === 1 ? "ACTIVE" : "LOCKED"}</TableCell>
                  <TableCell sx={{ padding: "16px" }}>
                    <IconButton color="primary" onClick={() => handleViewDetail({ ...user, role: "children" })}>
                      <Visibility fontSize="small" />
                    </IconButton>
                    <IconButton color="primary" onClick={() => handleEditClick({ ...user, role: "children" })}>
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDeleteUser(user.id, "children")}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={totalChildren}
            page={pageChildren}
            onPageChange={(e, newPage) => setPageChildren(newPage)}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[5]}
          />
        </TableContainer>
      )}

      {/* Staff Tab */}
      {tabValue === 1 && (
        <TableContainer component={Paper} sx={{ marginTop: 2, minWidth: "1000px" }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold", padding: "16px" }}>Name</TableCell>
                <TableCell sx={{ fontWeight: "bold", padding: "16px" }}>Email</TableCell>
                <TableCell sx={{ fontWeight: "bold", padding: "16px" }}>Registration Date</TableCell>
                <TableCell sx={{ fontWeight: "bold", padding: "16px" }}>Status</TableCell>
                <TableCell sx={{ fontWeight: "bold", padding: "16px" }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {staffUsers.map(user => (
                <TableRow key={user.id}>
                  <TableCell sx={{ padding: "16px" }}>{user.name}</TableCell>
                  <TableCell sx={{ padding: "16px" }}>{user.email}</TableCell>
                  <TableCell sx={{ padding: "16px" }}>{user.createdTime}</TableCell>
                  <TableCell sx={{ padding: "16px" }}>{user.status === 1 ? "ACTIVE" : "LOCKED"}</TableCell>
                  <TableCell sx={{ padding: "16px" }}>
                    <IconButton color="primary" onClick={() => handleViewDetail({ ...user, role: "staff" })}>
                      <Visibility fontSize="small" />
                    </IconButton>
                    <IconButton color="primary" onClick={() => handleEditClick({ ...user, role: "staff" })}>
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDeleteUser(user.id, "staff")}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={totalStaff}
            page={pageStaff}
            onPageChange={(e, newPage) => setPageStaff(newPage)}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[5]}
          />
        </TableContainer>
      )}

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
          <TextField label="Name" fullWidth margin="dense" value={selectedUser.name} onChange={(e) => setSelectedUser({ ...selectedUser, name: e.target.value })} required />
          <TextField label="Age" fullWidth margin="dense" type="number" value={selectedUser.age} onChange={(e) => setSelectedUser({ ...selectedUser, age: Number(e.target.value) })} required />
          <TextField label="Phone Number" fullWidth margin="dense" value={selectedUser.phoneNumber || ""} onChange={(e) => setSelectedUser({ ...selectedUser, phoneNumber: e.target.value })} />
          <TextField label="Avatar URL" fullWidth margin="dense" value={selectedUser.avatarUrl || ""} onChange={(e) => setSelectedUser({ ...selectedUser, avatarUrl: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdateUser} color="primary">Update</Button>
        </DialogActions>
      </Dialog>

      {/* View Detail Dialog */}
      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)}>
        <DialogTitle>User Details</DialogTitle>
        <DialogContent>
          {selectedUserDetails && (
            <>
              <Typography variant="body1"><strong>Name:</strong> {selectedUserDetails.name}</Typography>
              <Typography variant="body1"><strong>Email:</strong> {selectedUserDetails.email}</Typography>
              <Typography variant="body1"><strong>Registration Date:</strong> {selectedUserDetails.createdTime}</Typography>
              <Typography variant="body1"><strong>Status:</strong> {selectedUserDetails.status === 1 ? "ACTIVE" : "LOCKED"}</Typography>
              <Typography variant="body1"><strong>Age:</strong> {selectedUserDetails.age}</Typography>
              <Typography variant="body1"><strong>Phone Number:</strong> {selectedUserDetails.phoneNumber || "N/A"}</Typography>
              {selectedUserDetails.role === "children" && (
                <Typography variant="body1"><strong>Quiz Attempts:</strong> {quizAttempts}</Typography>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default UserManagement;