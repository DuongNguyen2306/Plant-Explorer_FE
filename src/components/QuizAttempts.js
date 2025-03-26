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
} from "@mui/material";
import { BASE_API } from "../constant";
import { getUserRoleFromAPI } from "../utils/roleUtils";

const API_URL = BASE_API + "/quiz-attempts";

const QuizAttempts = () => {
  const [quizAttempts, setQuizAttempts] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10); // Default to 10 to show more items
  const [totalCount, setTotalCount] = useState(0);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

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

      // Dynamically set rowsPerPage to totalCount to show all items on one page
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

  if (role === null) return <p>Loading...</p>;
  if (role !== "staff") return <p style={{ color: "red" }}>You do not have permission to view this page.</p>;
  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", padding: "20px" }}>
        <CircularProgress />
      </Box>
    );
  if (error)
    return (
      <Box sx={{ padding: "20px" }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );

  return (
    <Box sx={{ padding: "20px" }}>
      <Typography variant="h4" sx={{ fontWeight: "bold", marginBottom: "20px" }}>
        Quiz Attempts
      </Typography>

      <TableContainer component={Paper} sx={{ borderRadius: "10px", overflow: "hidden", boxShadow: 3 }}>
        <Table>
          <TableHead sx={{ backgroundColor: "#f1f1f1" }}>
            <TableRow>
              <TableCell><strong>Child Name</strong></TableCell>
              <TableCell><strong>Quiz Name</strong></TableCell>
              <TableCell><strong>Attempt Time</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {quizAttempts.length > 0 ? (
              quizAttempts.map((attempt) => (
                <TableRow key={attempt.id}>
                  <TableCell>{attempt.childName}</TableCell>
                  <TableCell>{attempt.quizName}</TableCell>
                  <TableCell>{new Date(attempt.attemptTime).toLocaleString()}</TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      color="info"
                      onClick={() => handleViewDetail(attempt.id)}
                      sx={{ marginRight: "10px" }}
                    >
                      View Detail
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <Typography color="text.secondary">No quiz attempts found.</Typography>
                </TableCell>
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
          rowsPerPageOptions={[1, 5, 10, 25, totalCount]} // Add totalCount as an option
        />
      </TableContainer>
    </Box>
  );
};

export default QuizAttempts;