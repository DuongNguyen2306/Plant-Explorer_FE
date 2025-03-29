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
  InputAdornment,
} from "@mui/material";
import { styled } from "@mui/system";
import { getUserRoleFromAPI } from "../utils/roleUtils";
import { AddCircle, Search, BugReport } from "@mui/icons-material";

const API_URL = "https://plant-explorer-backend-0-0-1.onrender.com/api/bug-reports";
const CREATE_BUG_URL = "https://plant-explorer-backend-0-0-1.onrender.com/api/bug-reports";

// Styled Components
const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: "16px",
  boxShadow: "0 8px 30px rgba(0, 0, 0, 0.12)",
  background: "#fff",
  margin: "0 auto",
  overflowX: "auto",
  maxWidth: "100%",
  border: "1px solid rgba(224, 224, 224, 0.5)",
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  padding: "16px 24px",
  fontSize: "1.1rem",
  borderBottom: "1px solid rgba(224, 224, 224, 0.7)",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  color: "#2c3e50",
  "&:hover": {
    backgroundColor: "#f5f7fa",
    transition: "background-color 0.3s ease",
  },
}));

const StyledTableHeadCell = styled(TableCell)(({ theme }) => ({
  padding: "16px 24px",
  fontSize: "1.2rem",
  fontWeight: 700,
  color: "#fff",
  background: "linear-gradient(90deg, #2c3e50, #3498db)",
  borderBottom: "none",
  whiteSpace: "nowrap",
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: "20px",
  padding: "8px 20px",
  textTransform: "none",
  fontWeight: 600,
  fontSize: "1rem",
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 6px 15px rgba(0, 0, 0, 0.15)",
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  width: { xs: "100%", sm: "400px" },
  backgroundColor: "#fff",
  borderRadius: "30px",
  boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
  "& .MuiInputBase-root": {
    fontSize: "1.1rem",
    padding: "4px 12px",
  },
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      borderColor: "#3498db",
    },
    "&:hover fieldset": {
      borderColor: "#2980b9",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#3498db",
    },
  },
  "& .MuiInputLabel-root": {
    color: "#3498db",
    fontWeight: 500,
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: "#2980b9",
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
        const bugItems = response.data?.data?.items || [];
        setBugs(bugItems);
        setTotalCount(response.data?.data?.totalCount || 0);
        setError(null);
        bugItems.forEach((bug) => {
          console.log(`Bug ID: ${bug.id}, Created Time: ${bug.createdTime}`);
        });
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
      setError("Please fill in both Bug Title and Bug Description.");
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
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const [day, month, year] = dateString.split("-").map(Number);
      const date = new Date(year, month - 1, day);
      if (isNaN(date.getTime())) return "N/A";
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      console.error(`Error parsing date: ${dateString}`, error);
      return "N/A";
    }
  };

  if (role === null && !error) return (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "#f5f7fa" }}>
      <CircularProgress size={80} thickness={5} sx={{ color: "#3498db" }} />
    </Box>
  );

  if (error) return (
    <Box sx={{ textAlign: "center", mt: 8, p: 4, background: "#fff", borderRadius: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", maxWidth: "600px", mx: "auto" }}>
      <Typography variant="h5" color="error" sx={{ fontWeight: 600 }}>
        Error
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
        {error}
      </Typography>
    </Box>
  );

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #e8f0fe, #f5f7fa)",
        overflowX: "hidden",
        padding: "32px",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
      }}
    >
      <Box
        sx={{
          py: 4,
          width: { xs: "100%", md: "calc(100% - 280px)" },
          maxWidth: "1200px",
          mx: "auto",
          ml: { xs: 0, md: "280px" },
          px: { xs: 2, md: 3 },
        }}
      >
        {/* Header Section */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4, flexWrap: "wrap", gap: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: "#2c3e50", fontSize: { xs: "1.5rem", md: "2rem" } }}>
              Bug Reports
            </Typography>
            <Typography variant="subtitle1" sx={{ color: "#7f8c8d", mt: 1 }}>
              Total: {totalCount} reports
            </Typography>
          </Box>
          <StyledButton
            variant="contained"
            startIcon={<AddCircle />}
            onClick={() => setOpen(true)}
            sx={{ background: "linear-gradient(90deg, #2c3e50, #3498db)" }}
          >
            Report Bug
          </StyledButton>
        </Box>

        {/* Search Section */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4, flexWrap: "wrap", gap: 2 }}>
          <StyledTextField
            label="Search Bug Reports"
            variant="outlined"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: "#3498db", fontSize: "1.8rem" }} />
                </InputAdornment>
              ),
            }}
          />
          <Typography variant="body1" color="text.secondary" sx={{ fontSize: "1rem" }}>
            Showing {bugs.length} of {totalCount} bug reports
          </Typography>
        </Box>

        {/* Loading State */}
        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
            <CircularProgress size={80} thickness={5} sx={{ color: "#3498db" }} />
          </Box>
        )}

        {/* Table Section */}
        {!loading && (
          <StyledTableContainer component={Paper}>
            <Table sx={{ minWidth: "650px" }}>
              <TableHead>
                <TableRow>
                  <StyledTableHeadCell sx={{ width: "20%" }}>Title</StyledTableHeadCell>
                  <StyledTableHeadCell sx={{ width: "20%" }}>Created By</StyledTableHeadCell>
                  <StyledTableHeadCell sx={{ width: "20%" }}>Created Time</StyledTableHeadCell>
                  <StyledTableHeadCell sx={{ width: "40%" }}>Context</StyledTableHeadCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bugs.length === 0 ? (
                  <TableRow>
                    <StyledTableCell colSpan={4} align="center">
                      <Fade in={true}>
                        <Box sx={{ py: 6 }}>
                          <BugReport sx={{ fontSize: "5rem", color: "#3498db", mb: 2 }} />
                          <Typography variant="h6" color="text.secondary" sx={{ fontSize: "1.4rem", mb: 2 }}>
                            No Bug Reports Available
                          </Typography>
                          <Typography variant="body1" color="text.secondary" sx={{ fontSize: "1.1rem", mb: 4 }}>
                            Start by reporting a new bug!
                          </Typography>
                          <StyledButton
                            variant="contained"
                            startIcon={<AddCircle />}
                            onClick={() => setOpen(true)}
                            sx={{ background: "linear-gradient(90deg, #2c3e50, #3498db)" }}
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
                      <TableRow
                        sx={{
                          backgroundColor: index % 2 === 0 ? "#fafafa" : "#fff",
                          "&:hover": { backgroundColor: "#e3f2fd", transition: "background-color 0.3s ease" },
                          height: "90px",
                        }}
                      >
                        <StyledTableCell sx={{ fontSize: "1.2rem", fontWeight: 500 }}>{bug.name}</StyledTableCell>
                        <StyledTableCell>{bug.createdBy}</StyledTableCell>
                        <StyledTableCell>{formatDate(bug.createdTime)}</StyledTableCell>
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
        <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth sx={{ "& .MuiDialog-paper": { borderRadius: "16px" } }}>
          <DialogTitle sx={{ background: "linear-gradient(90deg, #2c3e50, #3498db)", color: "#fff", fontSize: "1.8rem", fontWeight: 600, py: 2 }}>
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
            <StyledButton
              onClick={handleCreateBug}
              variant="contained"
              sx={{ background: "linear-gradient(90deg, #2c3e50, #3498db)" }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Submit"}
            </StyledButton>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default BugReports;