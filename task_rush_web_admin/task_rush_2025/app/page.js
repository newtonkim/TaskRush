'use client';

import { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, getDocs } from 'firebase/firestore';
import { 
  Box, 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  Divider,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar
} from '@mui/material';

// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDZ4A85nnJKpdkSZcA8FTuw5Yn97sdAH8w",
  authDomain: "taskrush-9f8a4.firebaseapp.com",
  projectId: "taskrush-9f8a4",
  storageBucket: "taskrush-9f8a4.firebasestorage.app",
  messagingSenderId: "813850757085",
  appId: "1:813850757085:web:34475a59cb8dea47e45834"
};


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsersAndTasks = async () => {
      try {
        const usersQuery = query(collection(db, 'users'));
        const usersSnapshot = await getDocs(usersQuery);
        
        const usersData = [];
        
        for (const userDoc of usersSnapshot.docs) {
          const tasksQuery = query(collection(db, `users/${userDoc.id}/tasks`));
          const tasksSnapshot = await getDocs(tasksQuery);
          
          usersData.push({
            id: userDoc.id,
            email: userDoc.data().email || 'No email',
            photoURL: userDoc.data().photoURL || '',
            taskCount: tasksSnapshot.size,
            tasks: tasksSnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }))
          });
        }
        
        setUsers(usersData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchUsersAndTasks();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        Task Manager Admin Panel
      </Typography>
      
      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Users ({users.length})
      </Typography>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Task Count</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <Box display="flex" alignItems="center">
                    <Avatar src={user.photoURL} sx={{ mr: 2 }} />
                    {user.id}
                  </Box>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.taskCount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {users.map((user) => (
        <Box key={user.id} sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Tasks for {user.email}
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created At</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {user.tasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell>{task.title}</TableCell>
                    <TableCell>
                      {task.completed ? 'Completed' : 'Pending'}
                    </TableCell>
                    <TableCell>
                      {new Date(task.createdAt?.seconds * 1000).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      ))}
    </Box>
  );
}