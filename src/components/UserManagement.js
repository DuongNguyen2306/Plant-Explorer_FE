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
  TextField,
  Button,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TablePagination,
  Tabs,
  Tab,
  Box,
  Typography,
  Fade,
  CircularProgress,
  InputAdornment,
} from "@mui/material";
import { Edit, Delete, Add, Visibility, Search } from "@mui/icons-material";
import { styled } from "@mui/system";
import { BASE_API } from "../constant";
import { getUserRoleFromAPI } from "../utils/roleUtils";

const API_URL = BASE_API + "/users";
const CREATE_STAFF_URL = BASE_API + "/users/staff";
const QUIZ_ATTEMPTS_URL = BASE_API + "/quiz-attempts";

// Styled Components
const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: "16px",
  boxShadow: "0 8px 30px rgba(0, 0, 0, 0.12)",
  background: "#fff",
  margin: "0 auto",
  overflowX: "auto",
  maxWidth: "100%",
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  padding: "16px 24px",
  fontSize: "1.1rem",
  borderBottom: "1px solid rgba(224, 224, 224, 0.7)",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
}));

const StyledTableHeadCell = styled(TableCell)(({ theme }) => ({
  padding: "16px 24px",
  fontSize: "1.2rem",
  fontWeight: 700,
  color: "#fff",
  background: "linear-gradient(90deg, #1e88e5, #42a5f5)",
  borderBottom: "none",
  whiteSpace: "nowrap",
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: "30px",
  padding: "10px 24px",
  textTransform: "none",
  fontWeight: 600,
  fontSize: "1rem",
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 6px 15px rgba(0, 0, 0, 0.15)",
  },
}));

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
  const [loading, setLoading] = useState(false);

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
    setLoading(true);
    axios
      .get(API_URL, {
        params: {
          index: page + 1,
          pageSize: rowsPerPage,
          nameSearch: query,
          role: userRole,
        },
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        timeout: 10000,
      })
      .then((response) => {
        if (userRole === "children") {
          setChildrenUsers(response.data?.data?.items || []);
          setTotalChildren(response.data?.data?.totalCount || 0);
        } else if (userRole === "staff") {
          setStaffUsers(response.data?.data?.items || []);
          setTotalStaff(response.data?.data?.totalCount || 0);
        }
      })
      .catch((error) => console.error(`Error fetching ${userRole} users:`, error))
      .finally(() => setLoading(false));
  };

  const fetchQuizAttempts = (userId) => {
    axios
      .get(QUIZ_ATTEMPTS_URL, {
        params: {
          index: 1,
          pageSize: 10,
          userId: userId,
        },
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        timeout: 10000,
      })
      .then((response) => {
        const attempts = response.data?.data?.totalCount || 0;
        setQuizAttempts(attempts);
      })
      .catch((error) => {
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

    setLoading(true);
    axios
      .post(CREATE_STAFF_URL, newUser, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}`, "Content-Type": "application/json" },
        timeout: 10000,
      })
      .then(() => {
        fetchUsers("staff", search, pageStaff);
        setOpen(false);
        setNewUser({ name: "", email: "", password: "", confirmPassword: "", age: 0 });
      })
      .catch((error) => alert("Failed to create staff! " + (error.response?.data?.message || "Server error")))
      .finally(() => setLoading(false));
  };

  const handleDeleteUser = async (id, userRole) => {
    if (!id) {
      alert("User ID is missing!");
      return;
    }

    if (window.confirm("Are you sure you want to delete this user?")) {
      setLoading(true);
      try {
        const response = await axios.delete(`${API_URL}/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          timeout: 10000,
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
      } finally {
        setLoading(false);
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

    const updatedUser = {
      name: selectedUser.name || "",
      age: selectedUser.age || 0,
      phoneNumber: selectedUser.phoneNumber || "",
      avatarUrl: selectedUser.avatarUrl || "",
    };

    setLoading(true);
    axios
      .put(`${API_URL}/${selectedUser.id}`, updatedUser, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        timeout: 10000,
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
      .catch((error) => {
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
      })
      .finally(() => setLoading(false));
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (role === null)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "#f5f7fa" }}>
        <CircularProgress size={80} thickness={5} sx={{ color: "#1e88e5" }} />
      </Box>
    );

  if (role !== "admin")
    return (
      <Box sx={{ textAlign: "center", mt: 8, p: 4, background: "#fff", borderRadius: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", maxWidth: "600px", mx: "auto" }}>
        <Typography variant="h5" color="error" sx={{ fontWeight: 600 }}>
          Access Denied
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
          You do not have permission to view this page.
        </Typography>
      </Box>
    );

  return (
    <Box
      sx={{
        padding: "32px",
        background: "linear-gradient(135deg, #e8f0fe, #f5f7fa)",
        minHeight: "100vh",
        ml: { xs: 0, md: "280px" },
        maxWidth: "100%",
        overflowX: "hidden",
      }}
    >
      {/* Header Section */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4, flexWrap: "wrap", gap: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: "#1a237e", fontSize: { xs: "1.5rem", md: "2rem" } }}>
          User Management
        </Typography>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <TextField
            label="Search Users"
            variant="outlined"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              if (e.target.value === "") {
                fetchUsers("children", "", pageChildren);
                fetchUsers("staff", "", pageStaff);
              }
            }}
            sx={{
              width: { xs: "100%", sm: "300px", md: "400px" },
              maxWidth: "100%",
              backgroundColor: "#fff",
              borderRadius: "12px",
              boxShadow: "0 4px 15px rgba(0, 0, 0, 0.05)",
              "& .MuiInputBase-root": { fontSize: "1.1rem" },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: "#1e88e5", fontSize: "1.8rem" }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <StyledButton
                    variant="contained"
                    onClick={() => {
                      fetchUsers("children", search, pageChildren);
                      fetchUsers("staff", search, pageStaff);
                    }}
                    sx={{ background: "linear-gradient(90deg, #1e88e5, #42a5f5)", padding: "6px 16px" }}
                  >
                    Search
                  </StyledButton>
                </InputAdornment>
              ),
            }}
          />
          <StyledButton
            variant="contained"
            startIcon={<Add />}
            onClick={() => setOpen(true)}
            sx={{ background: "linear-gradient(90deg, #1e88e5, #42a5f5)" }}
          >
            Create Staff
          </StyledButton>
        </Box>
      </Box>

      {/* Tabs */}
      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        sx={{
          mb: 4,
          "& .MuiTab-root": { fontSize: "1.1rem", fontWeight: 600, textTransform: "none" },
          "& .MuiTabs-indicator": { backgroundColor: "#1e88e5", height: "3px" },
        }}
      >
        <Tab label={`Children (${totalChildren})`} />
        <Tab label={`Staff (${totalStaff})`} />
      </Tabs>

      {/* Loading State */}
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 8 }}>
          <CircularProgress size={80} thickness={5} sx={{ color: "#1e88e5" }} />
        </Box>
      )}

      {/* Children Tab */}
      {!loading && tabValue === 0 && (
        <StyledTableContainer component={Paper}>
          <Table sx={{ minWidth: "650px" }}>
            <TableHead>
              <TableRow>
                <StyledTableHeadCell sx={{ width: { xs: "25%", md: "25%" }, minWidth: "150px" }}>Name</StyledTableHeadCell>
                <StyledTableHeadCell sx={{ width: { xs: "25%", md: "25%" }, minWidth: "200px" }}>Email</StyledTableHeadCell>
                <StyledTableHeadCell sx={{ width: { xs: "20%", md: "20%" }, minWidth: "150px" }}>Registration Date</StyledTableHeadCell>
                <StyledTableHeadCell sx={{ width: { xs: "15%", md: "15%" }, minWidth: "100px" }}>Status</StyledTableHeadCell>
                <StyledTableHeadCell align="center" sx={{ width: { xs: "15%", md: "15%" }, minWidth: "150px" }}>
                  Actions
                </StyledTableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {childrenUsers.length === 0 ? (
                <TableRow>
                  <StyledTableCell colSpan={5} align="center">
                    <Fade in={true}>
                      <Box sx={{ py: 6 }}>
                        <Typography variant="h6" color="text.secondary" sx={{ fontSize: "1.4rem", mb: 2 }}>
                          No children users found
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ fontSize: "1.1rem", mb: 4 }}>
                          Try adjusting your search or check back later.
                        </Typography>
                      </Box>
                    </Fade>
                  </StyledTableCell>
                </TableRow>
              ) : (
                childrenUsers.map((user, index) => (
                  <Fade in={true} timeout={300 + index * 100} key={user.id}>
                    <TableRow
                      sx={{
                        backgroundColor: index % 2 === 0 ? "#fafafa" : "#fff",
                        "&:hover": { backgroundColor: "#e3f2fd", transition: "background-color 0.3s ease" },
                      }}
                    >
                      <StyledTableCell>{user.name}</StyledTableCell>
                      <StyledTableCell>{user.email}</StyledTableCell>
                      <StyledTableCell>{user.createdTime}</StyledTableCell>
                      <StyledTableCell>{user.status === 1 ? "ACTIVE" : "LOCKED"}</StyledTableCell>
                      <StyledTableCell align="center">
                        <IconButton color="info" onClick={() => handleViewDetail({ ...user, role: "children" })} sx={{ "&:hover": { color: "#0288d1" } }}>
                          <Visibility sx={{ fontSize: "1.8rem" }} />
                        </IconButton>
                        <IconButton color="primary" onClick={() => handleEditClick({ ...user, role: "children" })} sx={{ "&:hover": { color: "#1e88e5" } }}>
                          <Edit sx={{ fontSize: "1.8rem" }} />
                        </IconButton>
                        <IconButton color="error" onClick={() => handleDeleteUser(user.id, "children")} sx={{ "&:hover": { color: "#d32f2f" } }}>
                          <Delete sx={{ fontSize: "1.8rem" }} />
                        </IconButton>
                      </StyledTableCell>
                    </TableRow>
                  </Fade>
                ))
              )}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={totalChildren}
            page={pageChildren}
            onPageChange={(e, newPage) => setPageChildren(newPage)}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[5]}
            sx={{ "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": { fontSize: "1.1rem" } }}
          />
        </StyledTableContainer>
      )}

      {/* Staff Tab */}
      {!loading && tabValue === 1 && (
        <StyledTableContainer component={Paper}>
          <Table sx={{ minWidth: "650px" }}>
            <TableHead>
              <TableRow>
                <StyledTableHeadCell sx={{ width: { xs: "25%", md: "25%" }, minWidth: "150px" }}>Name</StyledTableHeadCell>
                <StyledTableHeadCell sx={{ width: { xs: "25%", md: "25%" }, minWidth: "200px" }}>Email</StyledTableHeadCell>
                <StyledTableHeadCell sx={{ width: { xs: "20%", md: "20%" }, minWidth: "150px" }}>Registration Date</StyledTableHeadCell>
                <StyledTableHeadCell sx={{ width: { xs: "15%", md: "15%" }, minWidth: "100px" }}>Status</StyledTableHeadCell>
                <StyledTableHeadCell align="center" sx={{ width: { xs: "15%", md: "15%" }, minWidth: "150px" }}>
                  Actions
                </StyledTableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {staffUsers.length === 0 ? (
                <TableRow>
                  <StyledTableCell colSpan={5} align="center">
                    <Fade in={true}>
                      <Box sx={{ py: 6 }}>
                        <Typography variant="h6" color="text.secondary" sx={{ fontSize: "1.4rem", mb: 2 }}>
                          No staff users found
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ fontSize: "1.1rem", mb: 4 }}>
                          Add a new staff member to get started!
                        </Typography>
                        <StyledButton
                          variant="contained"
                          startIcon={<Add />}
                          onClick={() => setOpen(true)}
                          sx={{ background: "linear-gradient(90deg, #1e88e5, #42a5f5)" }}
                        >
                          Create Staff
                        </StyledButton>
                      </Box>
                    </Fade>
                  </StyledTableCell>
                </TableRow>
              ) : (
                staffUsers.map((user, index) => (
                  <Fade in={true} timeout={300 + index * 100} key={user.id}>
                    <TableRow
                      sx={{
                        backgroundColor: index % 2 === 0 ? "#fafafa" : "#fff",
                        "&:hover": { backgroundColor: "#e3f2fd", transition: "background-color 0.3s ease" },
                      }}
                    >
                      <StyledTableCell>{user.name}</StyledTableCell>
                      <StyledTableCell>{user.email}</StyledTableCell>
                      <StyledTableCell>{user.createdTime}</StyledTableCell>
                      <StyledTableCell>{user.status === 1 ? "ACTIVE" : "LOCKED"}</StyledTableCell>
                      <StyledTableCell align="center">
                        <IconButton color="info" onClick={() => handleViewDetail({ ...user, role: "staff" })} sx={{ "&:hover": { color: "#0288d1" } }}>
                          <Visibility sx={{ fontSize: "1.8rem" }} />
                        </IconButton>
                        <IconButton color="primary" onClick={() => handleEditClick({ ...user, role: "staff" })} sx={{ "&:hover": { color: "#1e88e5" } }}>
                          <Edit sx={{ fontSize: "1.8rem" }} />
                        </IconButton>
                        <IconButton color="error" onClick={() => handleDeleteUser(user.id, "staff")} sx={{ "&:hover": { color: "#d32f2f" } }}>
                          <Delete sx={{ fontSize: "1.8rem" }} />
                        </IconButton>
                      </StyledTableCell>
                    </TableRow>
                  </Fade>
                ))
              )}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={totalStaff}
            page={pageStaff}
            onPageChange={(e, newPage) => setPageStaff(newPage)}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[5]}
            sx={{ "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": { fontSize: "1.1rem" } }}
          />
        </StyledTableContainer>
      )}

      {/* Create Staff Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth sx={{ "& .MuiDialog-paper": { borderRadius: "16px" } }}>
        <DialogTitle sx={{ background: "linear-gradient(90deg, #1e88e5, #42a5f5)", color: "#fff", fontSize: "1.8rem", fontWeight: 600, py: 2 }}>
          Create Staff
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <TextField
            label="Name"
            fullWidth
            margin="normal"
            value={newUser.name}
            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
            required
            sx={{ "& .MuiInputBase-root": { fontSize: "1.1rem" } }}
          />
          <TextField
            label="Email"
            fullWidth
            margin="normal"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            required
            sx={{ "& .MuiInputBase-root": { fontSize: "1.1rem" } }}
          />
          <TextField
            label="Password"
            fullWidth
            margin="normal"
            type="password"
            value={newUser.password}
            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
            required
            sx={{ "& .MuiInputBase-root": { fontSize: "1.1rem" } }}
          />
          <TextField
            label="Confirm Password"
            fullWidth
            margin="normal"
            type="password"
            value={newUser.confirmPassword}
            onChange={(e) => setNewUser({ ...newUser, confirmPassword: e.target.value })}
            required
            sx={{ "& .MuiInputBase-root": { fontSize: "1.1rem" } }}
          />
          <TextField
            label="Age"
            fullWidth
            margin="normal"
            type="number"
            value={newUser.age}
            onChange={(e) => setNewUser({ ...newUser, age: Number(e.target.value) })}
            required
            sx={{ "& .MuiInputBase-root": { fontSize: "1.1rem" } }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, justifyContent: "space-between" }}>
          <StyledButton variant="outlined" onClick={() => setOpen(false)} disabled={loading} sx={{ borderColor: "#1e88e5", color: "#1e88e5" }}>
            Cancel
          </StyledButton>
          <StyledButton
            variant="contained"
            onClick={handleCreateStaff}
            disabled={loading}
            sx={{ background: "linear-gradient(90deg, #1e88e5, #42a5f5)" }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Create"}
          </StyledButton>
        </DialogActions>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth sx={{ "& .MuiDialog-paper": { borderRadius: "16px" } }}>
        <DialogTitle sx={{ background: "linear-gradient(90deg, #1e88e5, #42a5f5)", color: "#fff", fontSize: "1.8rem", fontWeight: 600, py: 2 }}>
          Edit User
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <TextField
            label="Name"
            fullWidth
            margin="normal"
            value={selectedUser.name}
            onChange={(e) => setSelectedUser({ ...selectedUser, name: e.target.value })}
            required
            sx={{ "& .MuiInputBase-root": { fontSize: "1.1rem" } }}
          />
          <TextField
            label="Age"
            fullWidth
            margin="normal"
            type="number"
            value={selectedUser.age}
            onChange={(e) => setSelectedUser({ ...selectedUser, age: Number(e.target.value) })}
            required
            sx={{ "& .MuiInputBase-root": { fontSize: "1.1rem" } }}
          />
          <TextField
            label="Phone Number"
            fullWidth
            margin="normal"
            value={selectedUser.phoneNumber || ""}
            onChange={(e) => setSelectedUser({ ...selectedUser, phoneNumber: e.target.value })}
            sx={{ "& .MuiInputBase-root": { fontSize: "1.1rem" } }}
          />
          <TextField
            label="Avatar URL"
            fullWidth
            margin="normal"
            value={selectedUser.avatarUrl || ""}
            onChange={(e) => setSelectedUser({ ...selectedUser, avatarUrl: e.target.value })}
            sx={{ "& .MuiInputBase-root": { fontSize: "1.1rem" } }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, justifyContent: "space-between" }}>
          <StyledButton variant="outlined" onClick={() => setEditOpen(false)} disabled={loading} sx={{ borderColor: "#1e88e5", color: "#1e88e5" }}>
            Cancel
          </StyledButton>
          <StyledButton
            variant="contained"
            onClick={handleUpdateUser}
            disabled={loading}
            sx={{ background: "linear-gradient(90deg, #1e88e5, #42a5f5)" }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Update"}
          </StyledButton>
        </DialogActions>
      </Dialog>

      {/* View Detail Dialog */}
      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="sm" fullWidth sx={{ "& .MuiDialog-paper": { borderRadius: "16px" } }}>
        <DialogTitle sx={{ background: "linear-gradient(90deg, #1e88e5, #42a5f5)", color: "#fff", fontSize: "1.8rem", fontWeight: 600, py: 2 }}>
          User Details
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {selectedUserDetails && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Typography variant="body1" sx={{ fontSize: "1.1rem" }}>
                <strong>Name:</strong> {selectedUserDetails.name}
              </Typography>
              <Typography variant="body1" sx={{ fontSize: "1.1rem" }}>
                <strong>Email:</strong> {selectedUserDetails.email}
              </Typography>
              <Typography variant="body1" sx={{ fontSize: "1.1rem" }}>
                <strong>Registration Date:</strong> {selectedUserDetails.createdTime}
              </Typography>
              <Typography variant="body1" sx={{ fontSize: "1.1rem" }}>
                <strong>Status:</strong> {selectedUserDetails.status === 1 ? "ACTIVE" : "LOCKED"}
              </Typography>
              <Typography variant="body1" sx={{ fontSize: "1.1rem" }}>
                <strong>Age:</strong> {selectedUserDetails.age}
              </Typography>
              <Typography variant="body1" sx={{ fontSize: "1.1rem" }}>
                <strong>Phone Number:</strong> {selectedUserDetails.phoneNumber || "N/A"}
              </Typography>
              {selectedUserDetails.role === "children" && (
                <Typography variant="body1" sx={{ fontSize: "1.1rem" }}>
                  <strong>Quiz Attempts:</strong> {quizAttempts}
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <StyledButton variant="outlined" onClick={() => setDetailOpen(false)} sx={{ borderColor: "#1e88e5", color: "#1e88e5" }}>
            Close
          </StyledButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagement;