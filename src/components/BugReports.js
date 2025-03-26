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
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TablePagination,
  CircularProgress,
  Box,
  Typography,
  Fade,
  Tooltip,
} from "@mui/material";
import { styled } from "@mui/system";
import { getUserRoleFromAPI } from "../utils/roleUtils";

const API_URL = "https://plant-explorer-backend-0-0-1.onrender.com/api/bug-reports";
const CREATE_BUG_URL = "https://plant-explorer-backend-0-0-1.onrender.com/api/bug-reports";

// Styled components
const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: "12px",
  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
  background: "linear-gradient(145deg, #ffffff, #f9fbfc)",
  width: "100%",
  maxWidth: "1200px", // Larger table width
  margin: "0 auto",
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  padding: "20px 30px", // Increased padding for more space
  fontSize: "1.1rem", // Larger font size
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: "25px",
  padding: "8px 20px",
  textTransform: "none",
  fontWeight: 500,
  fontSize: "1rem",
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 5px 15px rgba(0, 0, 0, 0.1)",
  },
}));

const BugReports = () => {
  const [bugs, setBugs] = useState([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [newBug, setNewBug] = useState({ name: "", context: "" });
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(5);
  const [totalCount, setTotalCount] = useState(0);
  const [role, setRole] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log("Token on component mount:", token);
    getUserRoleFromAPI()
      .then((fetchedRole) => {
        console.log("Fetched role:", fetchedRole);
        setRole(fetchedRole);
        if (!fetchedRole) {
          setError("Failed to determine user role. Please log in again.");
        }
      })
      .catch((err) => {
        console.error("Error fetching role:", err);
        console.log("Error response from getUserRoleFromAPI:", err.response);
        setError("Failed to fetch role: " + (err.message || "Unknown error"));
      });
  }, []);

  useEffect(() => {
    if (role) fetchBugs();
  }, [search, page, role]);

  const fetchBugs = () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    console.log("Token used for fetchBugs:", token);
    if (!token) {
      setError("No token found. Please log in again.");
      setLoading(false);
      return;
    }

    axios
      .get(API_URL, {
        params: {
          index: page + 1,
          pageSize: rowsPerPage,
          nameSearch: search,
        },
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        console.log("fetchBugs response:", response.data);
        setBugs(response.data?.data?.items || []);
        setTotalCount(response.data?.data?.totalCount || 0);
        setError(null);
      })
      .catch((error) => {
        console.error("Error fetching bug reports:", error);
        console.log("Error response from fetchBugs:", error.response);
        setError("Failed to fetch bug reports: " + (error.response?.data?.Message || error.message));
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleCreateBug = () => {
    if (!newBug.name || !newBug.context) {
      alert("Please fill in both Bug Title and Bug Description.");
      return;
    }

    setLoading(true);
    const token = localStorage.getItem("token");
    console.log("Token used for handleCreateBug:", token);
    if (!token) {
      setError("No token found. Please log in again.");
      setLoading(false);
      return;
    }

    const bugData = {
      name: newBug.name.trim(),
      context: newBug.context.trim(),
    };

    axios
      .post(CREATE_BUG_URL, bugData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        console.log("handleCreateBug response:", response.data);
        if (response.status === 200) {
          alert("Bug report created successfully!");
          fetchBugs();
          setOpen(false);
          setNewBug({ name: "", context: "" });
          setError(null);
        } else {
          throw new Error("Unexpected response status: " + response.status);
        }
      })
      .catch((error) => {
        console.error("Error creating bug report:", error);
        console.log("Error response from handleCreateBug:", error.response);
        let errorMessage = "Failed to create bug report: ";
        if (error.response) {
          errorMessage += error.response.data?.Message || error.response.data?.message || "Unknown server error";
        } else {
          errorMessage += error.message || "Unknown error";
        }
        setError(errorMessage);
        alert(errorMessage);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  if (role === null && !error) return (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <CircularProgress size={50} />
    </Box>
  );
  if (error) return (
    <Typography variant="h6" align="center" color="error" sx={{ mt: 4 }}>
      {error}
    </Typography>
  );

  return (
    <Box sx={{ padding: "40px", backgroundColor: "#f4f6f9", minHeight: "100vh" }}>
      {/* Header Section */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, color: "#2c3e50", fontSize: "2rem" }}>
          Bug Reports
        </Typography>
        <StyledButton variant="contained" color="primary" onClick={() => setOpen(true)}>
          Report Bug
        </StyledButton>
      </Box>

      {/* Search Section */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4, maxWidth: "1200px", margin: "0 auto" }}>
        <TextField
          label="Search Bug Reports"
          variant="outlined"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          sx={{ width: "400px", backgroundColor: "#fff", borderRadius: "8px", "& .MuiInputBase-root": { fontSize: "1.1rem" } }}
        />
        <Typography variant="body1" color="text.secondary" sx={{ fontSize: "1rem" }}>
          Showing {bugs.length} of {totalCount} bug reports
        </Typography>
      </Box>

      {/* Loading State */}
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
          <CircularProgress size={50} />
        </Box>
      )}

      {/* Table Section */}
      {!loading && (
        <StyledTableContainer component={Paper}>
          <Table>
            <TableHead sx={{ backgroundColor: "#3498db" }}>
              <TableRow>
                <StyledTableCell sx={{ color: "#fff", fontWeight: 600, width: "20%" }}>Title</StyledTableCell>
                <StyledTableCell sx={{ color: "#fff", fontWeight: 600, width: "20%" }}>Created By</StyledTableCell>
                <StyledTableCell sx={{ color: "#fff", fontWeight: 600, width: "20%" }}>Created Time</StyledTableCell>
                <StyledTableCell sx={{ color: "#fff", fontWeight: 600, width: "40%" }}>Context</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bugs.length === 0 ? (
                <TableRow>
                  <StyledTableCell colSpan={4} align="center">
                    <Fade in={true}>
                      <Box sx={{ py: 6 }}>
                        <Typography variant="body1" color="text.secondary" sx={{ fontSize: "1.2rem" }}>
                          No bug reports available. Start by reporting one!
                        </Typography>
                        <StyledButton
                          variant="contained"
                          color="primary"
                          onClick={() => setOpen(true)}
                          sx={{ mt: 3 }}
                        >
                          Report Bug
                        </StyledButton>
                      </Box>
                    </Fade>
                  </StyledTableCell>
                </TableRow>
              ) : (
                bugs.map((bug, index) => (
                  <Fade in={true} timeout={300 + index * 100} key={bug.id}>
                    <TableRow sx={{ "&:hover": { backgroundColor: "#ecf0f1" }, height: "90px" }}>
                      <StyledTableCell sx={{ fontSize: "1.2rem" }}>{bug.name}</StyledTableCell>
                      <StyledTableCell>{bug.createdBy}</StyledTableCell>
                      <StyledTableCell>{new Date(bug.createdTime).toLocaleString()}</StyledTableCell>
                      <StyledTableCell>{bug.context}</StyledTableCell>
                    </TableRow>
                  </Fade>
                ))
              )}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={totalCount}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[5]}
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} of ${count}`}
            sx={{ "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": { fontSize: "1rem" } }}
          />
        </StyledTableContainer>
      )}

      {/* Dialog for Reporting a Bug */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ backgroundColor: "#3498db", color: "#fff", fontWeight: 600, fontSize: "1.5rem", py: 2 }}>
          Report a Bug
        </DialogTitle>
        <DialogContent sx={{ pt: 4 }}>
          <TextField
            label="Bug Title"
            fullWidth
            margin="dense"
            value={newBug.name}
            onChange={(e) => setNewBug({ ...newBug, name: e.target.value })}
            required
            error={!newBug.name}
            helperText={!newBug.name ? "Bug Title is required" : ""}
            sx={{ mb: 3, "& .MuiInputBase-root": { fontSize: "1.1rem" } }}
          />
          <TextField
            label="Bug Description"
            fullWidth
            margin="dense"
            multiline
            rows={4}
            value={newBug.context}
            onChange={(e) => setNewBug({ ...newBug, context: e.target.value })}
            required
            error={!newBug.context}
            helperText={!newBug.context ? "Bug Description is required" : ""}
            sx={{ mb: 3, "& .MuiInputBase-root": { fontSize: "1.1rem" } }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <StyledButton onClick={() => setOpen(false)} color="inherit" variant="outlined" disabled={loading}>
            Cancel
          </StyledButton>
          <StyledButton onClick={handleCreateBug} variant="contained" color="primary" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : "Submit"}
          </StyledButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BugReports;