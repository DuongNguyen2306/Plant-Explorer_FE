import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, TextField, Button, Dialog, DialogActions, DialogContent,
  DialogTitle, TablePagination
} from "@mui/material";
import { getUserRoleFromAPI } from "../utils/roleUtils";

const API_URL = "https://plant-explorer-backend-0-0-1.onrender.com/api/bugreports";
const CREATE_BUG_URL = "https://plant-explorer-backend-0-0-1.onrender.com/api/bugreports/report";

const BugReports = () => {
  const [bugs, setBugs] = useState([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [newBug, setNewBug] = useState({ name: "", context: "" });
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(5);
  const [totalCount, setTotalCount] = useState(0);
  const [role, setRole] = useState(null);

  useEffect(() => {
    getUserRoleFromAPI().then(setRole);
  }, []);

  useEffect(() => {
    if (role) fetchBugs();
  }, [search, page, role]);

  const fetchBugs = () => {
    axios.get(API_URL, {
      params: {
        index: page + 1,
        pageSize: rowsPerPage,
        nameSearch: search
      }
    })
    .then((response) => {
      setBugs(response.data?.data?.items || []);
      setTotalCount(response.data?.data?.totalCount || 0);
    })
    .catch((error) => console.error("Error fetching bug reports:", error));
  };

  const handleCreateBug = () => {
    if (!newBug.name || !newBug.context) {
      alert("Please fill in all fields");
      return;
    }

    axios.post(CREATE_BUG_URL, newBug, {
      headers: { "Content-Type": "application/json" },
    })
    .then(() => {
      fetchBugs();
      setOpen(false);
      setNewBug({ name: "", context: "" });
    })
    .catch((error) => {
      console.error("Error creating bug report:", error);
      alert("Failed to create bug report");
    });
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  if (role === null) return <p>Loading...</p>;

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
          />
          <TextField
            label="Bug Description"
            fullWidth
            margin="dense"
            multiline
            rows={4}
            value={newBug.context}
            onChange={(e) => setNewBug({ ...newBug, context: e.target.value })}
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