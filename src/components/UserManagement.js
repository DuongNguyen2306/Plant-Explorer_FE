import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, Button, IconButton, Avatar, Box, Typography, AppBar, Toolbar, TablePagination } from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { BASE_API } from '../constant';

const API_URL = BASE_API + '/users';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    fetchUsers();
  }, [page, rowsPerPage]);

  const fetchUsers = (query = '') => {
    axios.get(API_URL, {
      params: { index: page + 1, pageSize: rowsPerPage, nameSearch: query },
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
    .then(response => {
      setUsers(Array.isArray(response.data?.data?.items) ? response.data.data.items : []);
    })
    .catch(error => console.error('Error fetching users:', error));
  };

  return (
    <div className="user-management-page">
      <AppBar position="static" color="default">
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ width: 50, height: 50 }} />
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'green', marginLeft: '10px' }}>Đại Dương</Typography>
          </Box>
        </Toolbar>
      </AppBar>

      <Box sx={{ padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '10px', marginTop: '20px' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <TextField label="Search..." variant="outlined" size="small" value={search} onChange={(e) => setSearch(e.target.value)} />
          <Button variant="contained" color="primary">Search</Button>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Registration Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map(user => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.createdTime}</TableCell>
                  <TableCell>{user.status === 1 ? 'ACTIVE' : 'LOCKED'}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>
                    <IconButton color="primary"><Edit fontSize="small" /></IconButton>
                    <IconButton color="error"><Delete fontSize="small" /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </div>
  );
};

export default UserManagement;
