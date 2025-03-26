import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, TextField, Button, Dialog, DialogActions, DialogContent,
  DialogTitle, TablePagination
} from "@mui/material";
import { getUserRoleFromAPI } from "../utils/roleUtils";

const API_URL = "https://plant-explorer-backend-0-0-1.onrender.com/api/bug-reports";
const CREATE_BUG_URL = "https://plant-explorer-backend-0-0-1.onrender.com/api/bug-reports";

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

  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log("Token on component mount:", token);
    getUserRoleFromAPI().then((fetchedRole) => {
      console.log("Fetched role:", fetchedRole);
      setRole(fetchedRole);
      if (!fetchedRole) {
        setError("Failed to determine user role. Please log in again.");
      }
    }).catch((err) => {
      console.error("Error fetching role:", err);
      console.log("Error response from getUserRoleFromAPI:", err.response);
      setError("Failed to fetch role: " + (err.message || "Unknown error"));
    });
  }, []);

  useEffect(() => {
    if (role) fetchBugs();
  }, [search, page, role]);

  const fetchBugs = () => {
    const token = localStorage.getItem("token");
    console.log("Token used for fetchBugs:", token);
    if (!token) {
      setError("No token found. Please log in again.");
      return;
    }

    axios.get(API_URL, {
      params: {
        index: page + 1,
        pageSize: rowsPerPage,
        nameSearch: search
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
    });
  };

  const handleCreateBug = () => {
    // Kiểm tra dữ liệu trước khi gửi
    if (!newBug.name || !newBug.context) {
      alert("Please fill in both Bug Title and Bug Description.");
      return;
    }

    const token = localStorage.getItem("token");
    console.log("Token used for handleCreateBug:", token);
    if (!token) {
      setError("No token found. Please log in again.");
      return;
    }

    // Đảm bảo dữ liệu gửi lên đúng định dạng
    const bugData = {
      name: newBug.name.trim(), // Loại bỏ khoảng trắng thừa
      context: newBug.context.trim(),
    };

    axios.post(CREATE_BUG_URL, bugData, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
    .then((response) => {
      console.log("handleCreateBug response:", response.data);
      // Kiểm tra nếu response trả về mã 200 (OK)
      if (response.status === 200) {
        alert("Bug report created successfully!");
        fetchBugs(); // Làm mới danh sách bug reports
        setOpen(false); // Đóng dialog
        setNewBug({ name: "", context: "" }); // Reset form
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
        // Lỗi từ server (có response)
        errorMessage += error.response.data?.Message || error.response.data?.message || "Unknown server error";
      } else {
        // Lỗi không có response (mạng, timeout, v.v.)
        errorMessage += error.message || "Unknown error";
      }
      setError(errorMessage);
      alert(errorMessage); // Hiển thị thông báo lỗi cho người dùng
    });
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  if (role === null && !error) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className="bug-reports-page" style={{ padding: 20 }}>
      <h2>Bug Reports</h2>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
        <TextField
          label="Search Bug Reports"
          variant="outlined"
          size="small"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
        />
        <Button variant="contained" color="primary" onClick={() => setOpen(true)}>
          Report Bug
        </Button>
      </div>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Created By</TableCell>
              <TableCell>Created Time</TableCell>
              <TableCell>Context</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bugs.map((bug) => (
              <TableRow key={bug.id}>
                <TableCell>{bug.name}</TableCell>
                <TableCell>{bug.createdBy}</TableCell>
                <TableCell>{bug.createdTime}</TableCell>
                <TableCell>{bug.context}</TableCell>
              </TableRow>
            ))}
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
        />
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Report a Bug</DialogTitle>
        <DialogContent>
          <TextField
            label="Bug Title"
            fullWidth
            margin="dense"
            value={newBug.name}
            onChange={(e) => setNewBug({ ...newBug, name: e.target.value })}
            required
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
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateBug} color="primary">Submit</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default BugReports;