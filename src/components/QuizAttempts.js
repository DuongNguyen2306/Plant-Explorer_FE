import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Box,
  Typography,
  TablePagination,
  CircularProgress,
  Fade,
} from "@mui/material";
import { styled } from "@mui/system";
import { AssignmentTurnedIn } from "@mui/icons-material";
import { BASE_API } from "../constant";
import { getUserRoleFromAPI } from "../utils/roleUtils";

const API_URL = BASE_API + "/quiz-attempts";

// Styled Components
const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: "16px",
  boxShadow: "0 8px 30px rgba(0, 0, 0, 0.12)",
  background: "#fff",
  margin: "0 auto",
  overflowX: "auto",
  maxWidth: "100%",
  border: "1px solid rgba(224, 224, 224, 0.5)", // Subtle border for visual separation
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

const QuizAttempts = () => {
  const [quizAttempts, setQuizAttempts] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Dynamically set the document title
  useEffect(() => {
    document.title = "Plant Explorer - Quiz Attempts";
    return () => {
      document.title = "Plant Explorer";
    };
  }, []);

  useEffect(() => {
    getUserRoleFromAPI()
      .then((fetchedRole) => {
        console.log("Fetched role:", fetchedRole);
        setRole(fetchedRole);
      })
      .catch((error) => {
        console.error("Error fetching role:", error);
        setRole(null);
      });
  }, []);

  useEffect(() => {
    if (role === "staff") {
      fetchQuizAttempts();
    }
  }, [role, page, rowsPerPage]);

  const fetchQuizAttempts = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      console.log("Token:", token);
      console.log("Requesting URL:", API_URL);
      const response = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          pageNumber: page + 1,
          pageSize: rowsPerPage,
        },
      });

      console.log("API response:", response.data);

      const { data } = response.data;
      setQuizAttempts(data.items || []);
      setTotalCount(data.totalCount || 0);

      if (data.totalCount > 0 && rowsPerPage !== data.totalCount) {
        setRowsPerPage(data.totalCount);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching quiz attempts:", error);
      console.log("Error response:", error.response);
      setError("Failed to fetch quiz attempts: " + (error.response?.data?.message || error.message));
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewDetail = (attemptId) => {
    navigate(`/quiz-attempt/${attemptId}/detail`);
  };

  if (role === null)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "#f5f7fa" }}>
        <CircularProgress size={80} thickness={5} sx={{ color: "#1e88e5" }} />
      </Box>
    );

  if (role !== "staff")
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

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh", background: "#f5f7fa" }}>
        <CircularProgress size={80} thickness={5} sx={{ color: "#1e88e5" }} />
      </Box>
    );

  if (error)
    return (
      <Box sx={{ textAlign: "center", mt: 8, p: 4, background: "#fff", borderRadius: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", maxWidth: "600px", mx: "auto" }}>
        <Typography variant="h5" color="error" sx={{ fontWeight: 600 }}>
          Error
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
          {error}
        </Typography>
        <StyledButton
          variant="contained"
          onClick={fetchQuizAttempts}
          sx={{ mt: 3, background: "linear-gradient(90deg, #1e88e5, #42a5f5)" }}
        >
          Retry
        </StyledButton>
      </Box>
    );

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #e8f0fe, #f5f7fa)",
        overflowX: "hidden",
      }}
    >
      <Box
        sx={{
          py: 4,
          width: { xs: "100%", md: "calc(100% - 280px)" }, // Adjust width to account for sidebar
          ml: { xs: 0, md: "280px" }, // Sidebar margin on larger screens
          px: { xs: 2, md: 3 }, // Reduced padding for better balance
          maxWidth: "1200px", // Constrain the content width for better centering
          mx: "auto", // Center the content horizontally
        }}
      >
        {/* Header Section */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4, flexWrap: "wrap", gap: 2 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: "#1a237e", fontSize: { xs: "1.5rem", md: "2rem" } }}>
            Quiz Attempts ({totalCount})
          </Typography>
          <StyledButton
            variant="contained"
            onClick={fetchQuizAttempts}
            sx={{ background: "linear-gradient(90deg, #1e88e5, #42a5f5)" }}
          >
            Refresh
          </StyledButton>
        </Box>

        {/* Table Section */}
        <StyledTableContainer component={Paper}>
          <Table sx={{ minWidth: "650px" }}>
            <TableHead>
              <TableRow>
                <StyledTableHeadCell sx={{ width: { xs: "25%", md: "25%" }, minWidth: "150px" }}>Child Name</StyledTableHeadCell>
                <StyledTableHeadCell sx={{ width: { xs: "25%", md: "25%" }, minWidth: "150px" }}>Quiz Name</StyledTableHeadCell>
                <StyledTableHeadCell sx={{ width: { xs: "30%", md: "30%" }, minWidth: "200px" }}>Attempt Time</StyledTableHeadCell>
                <StyledTableHeadCell align="center" sx={{ width: { xs: "20%", md: "20%" }, minWidth: "150px" }}>
                  Actions
                </StyledTableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {quizAttempts.length > 0 ? (
                quizAttempts.map((attempt, index) => (
                  <Fade in={true} timeout={300 + index * 100} key={attempt.id}>
                    <TableRow
                      sx={{
                        backgroundColor: index % 2 === 0 ? "#fafafa" : "#fff",
                        "&:hover": { backgroundColor: "#e3f2fd", transition: "background-color 0.3s ease" },
                      }}
                    >
                      <StyledTableCell>{attempt.childName}</StyledTableCell>
                      <StyledTableCell>{attempt.quizName}</StyledTableCell>
                      <StyledTableCell>{new Date(attempt.attemptTime).toLocaleString()}</StyledTableCell>
                      <StyledTableCell align="center">
                        <StyledButton
                          variant="outlined"
                          color="info"
                          onClick={() => handleViewDetail(attempt.id)}
                          sx={{ borderColor: "#1e88e5", color: "#1e88e5" }}
                        >
                          View Detail
                        </StyledButton>
                      </StyledTableCell>
                    </TableRow>
                  </Fade>
                ))
              ) : (
                <TableRow>
                  <StyledTableCell colSpan={4} align="center">
                    <Fade in={true}>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          py: 6,
                        }}
                      >
                        <AssignmentTurnedIn sx={{ fontSize: "5rem", color: "#1e88e5", mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" sx={{ fontSize: "1.4rem", mb: 2 }}>
                          No Quiz Attempts Found
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ fontSize: "1.1rem", mb: 4 }}>
                          It looks like there are no quiz attempts yet. Check back later!
                        </Typography>
                        <StyledButton
                          variant="contained"
                          onClick={fetchQuizAttempts}
                          sx={{ background: "linear-gradient(90deg, #1e88e5, #42a5f5)" }}
                        >
                          Refresh
                        </StyledButton>
                      </Box>
                    </Fade>
                  </StyledTableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={totalCount}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[1, 5, 10, 25, totalCount]}
            sx={{ "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": { fontSize: "1.1rem" } }}
          />
        </StyledTableContainer>
      </Box>
    </Box>
  );
};

export default QuizAttempts;