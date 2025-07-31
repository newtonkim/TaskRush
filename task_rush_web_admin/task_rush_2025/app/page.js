'use client';
import { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, getDocs } from 'firebase/firestore';
import { getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { 
  Box, 
  Button,
  Typography, 
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
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export default function AdminPanel() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [authenticating, setAuthenticating] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let unsubscribe;
    try {
      unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        if (currentUser) {
          setUser(currentUser);
          fetchUserTasks(currentUser.uid);
        } else {
          setUser(null);
          setLoading(false);
          setAuthenticating(false);
        }
      });
    } catch (error) {
      console.error('Error during auth state change:', error);
      setError('Unable to process request due to missing initial state. Please try signing in again.');
      setAuthenticating(false);
    }

    async function fetchUserTasks(userId) {
      setLoading(true);
      setError(null);
      try {
        const tasksQuery = query(collection(db, `users/${userId}/tasks`));
        const tasksSnapshot = await getDocs(tasksQuery);

        const tasksData = tasksSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setTasks(tasksData);
      } catch (err) {
        console.error('Error fetching tasks:', err);
        setError('Failed to fetch tasks. Please try again.');
      } finally {
        setLoading(false);
        setAuthenticating(false);
      }
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const handleSignIn = async () => {
    setAuthenticating(true);
    setError(null);
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error('Google sign-in failed:', err);
      setError('Google sign-in failed. Please try again.');
      setAuthenticating(false);
    }
  };

  const handleSignOut = async () => {
    setAuthenticating(true);
    setError(null);
    try {
      await signOut(auth);
      setTasks([]);
    } catch (err) {
      console.error('Sign out failed:', err);
      setError('Sign out failed. Please try again.');
    } finally {
      setAuthenticating(false);
    }
  };

  if (authenticating) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return (
      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="100vh" gap={2}>
        <Typography variant="h5">Please sign in to access the admin panel</Typography>
        {error && <Typography color="error">{error}</Typography>}
        <Button variant="contained" onClick={handleSignIn}>Sign in with Google</Button>
      </Box>
    );
  }

  return (
    <Box sx={{ padding: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Task Manager Admin Panel</Typography>
        <Button variant="outlined" onClick={handleSignOut}>Sign Out</Button>
      </Box>

      {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}

      <Typography variant="h6" gutterBottom>
        Tasks ({tasks.length})
      </Typography>
      
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      ) : (
        <>
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
                {tasks.map((task) => (
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
        </>
      )}
    </Box>
  );
}
