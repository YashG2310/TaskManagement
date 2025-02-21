import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Select,
  MenuItem,
  FormControl,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { useAuth } from "../context/AuthContext";
import TaskForm from "./TaskForm";
import EditTaskForm from "./EditTaskForm";
import AddUserForm from "./AddUserForm";
import UserDatabase from "./UserDatabase"; // Import the UserDatabase component
import { getTasks, deleteTask, updateTask } from "../services/api";
import CountdownTimer from "./CountdownTimer";

const Dashboard = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [openTaskForm, setOpenTaskForm] = useState(false);
  const [openEditForm, setOpenEditForm] = useState(false);
  const [openAddUserForm, setOpenAddUserForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [error, setError] = useState("");

  // New state for user database toggle
  const [showUserDatabase, setShowUserDatabase] = useState(false);

  // Check if the user is Admin or Editor
  const isAdminOrEditor = user?.role === "Admin" || user?.role === "Editor";

  const fetchTasks = async () => {
    try {
      const response = await getTasks();
      setTasks(response.data);
    } catch (err) {
      console.error("Error fetching tasks:", err);
      setError("Failed to load tasks");
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleTaskCreated = () => {
    fetchTasks();
    setOpenTaskForm(false);
  };

  const handleEditClick = (task) => {
    setSelectedTask(task);
    setOpenEditForm(true);
  };

  const handleDeleteClick = (task) => {
    setTaskToDelete(task);
    setDeleteDialogOpen(true);
  };

  const handleTaskUpdate = async (updatedTask) => {
    try {
      await updateTask(updatedTask._id, updatedTask);
      await fetchTasks();
      setOpenEditForm(false);
      setSelectedTask(null);
    } catch (err) {
      console.error("Error updating task:", err);
      setError("Failed to update task");
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteTask(taskToDelete._id);
      await fetchTasks();
      setDeleteDialogOpen(false);
      setTaskToDelete(null);
    } catch (error) {
      // Log detailed error info from Axios
      console.error(
        "Error deleting task:",
        error.response ? error.response.data : error.message
      );
      setError(
        "Failed to delete task: " +
          (error.response && error.response.data && error.response.data.message
            ? error.response.data.message
            : "Unknown error")
      );
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await updateTask(taskId, { status: newStatus });
      await fetchTasks();
    } catch (err) {
      console.error("Error updating status:", err);
      setError("Failed to update status");
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 4 }}>
        <Typography variant="h4">Welcome, {user?.username}!</Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          {isAdminOrEditor && (
            <Button variant="contained" onClick={() => setOpenTaskForm(true)}>
              Create Task
            </Button>
          )}
          {user?.role === "Admin" && (
            <>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => setOpenAddUserForm(true)}
              >
                Add User
              </Button>
              <Button
                variant="contained"
                onClick={() => setShowUserDatabase(!showUserDatabase)}
              >
                {showUserDatabase ? "Hide User Database" : "Show User Database"}
              </Button>
            </>
          )}
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Assigned To</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Deadline</TableCell>
              {isAdminOrEditor && <TableCell>Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {tasks.map((task) => (
              <TableRow key={task._id}>
                <TableCell>{task.title}</TableCell>
                <TableCell>{task.description}</TableCell>
                <TableCell>{task.assignedTo?.username}</TableCell>
                <TableCell>{task.priority}</TableCell>
                <TableCell>
                  <FormControl size="small" fullWidth>
                    <Select
                      value={task.status}
                      onChange={(e) =>
                        handleStatusChange(task._id, e.target.value)
                      }
                      sx={{
                        backgroundColor:
                          task.status === "Completed"
                            ? "#e8f5e9"
                            : task.status === "In Progress"
                            ? "#fff3e0"
                            : "#fff",
                      }}
                    >
                      <MenuItem value="Pending">Pending</MenuItem>
                      <MenuItem value="In Progress">In Progress</MenuItem>
                      <MenuItem value="Completed">Completed</MenuItem>
                    </Select>
                  </FormControl>
                </TableCell>
                <TableCell>
                  <CountdownTimer deadline={task.deadline} />
                </TableCell>
                {isAdminOrEditor && (
                  <TableCell>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <IconButton
                        color="primary"
                        onClick={() => handleEditClick(task)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteClick(task)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Forms and Dialogs */}
      {isAdminOrEditor && (
        <>
          <TaskForm
            open={openTaskForm}
            handleClose={() => setOpenTaskForm(false)}
            onTaskCreated={handleTaskCreated}
          />

          <EditTaskForm
            open={openEditForm}
            handleClose={() => {
              setOpenEditForm(false);
              setSelectedTask(null);
            }}
            task={selectedTask}
            onTaskUpdated={handleTaskUpdate}
          />

          <Dialog
            open={deleteDialogOpen}
            onClose={() => setDeleteDialogOpen(false)}
          >
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogContent>
              Are you sure you want to delete the task "{taskToDelete?.title}"?
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
              <Button
                onClick={handleDeleteConfirm}
                color="error"
                variant="contained"
              >
                Delete
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}

      {/* Add User Form - Admin Only */}
      {user?.role === "Admin" && (
        <AddUserForm
          open={openAddUserForm}
          handleClose={() => setOpenAddUserForm(false)}
          onUserAdded={() => {
            console.log("User added successfully");
          }}
        />
      )}

      {/* Toggle the User Database view for Admin */}
      {user?.role === "Admin" && showUserDatabase && <UserDatabase />}
    </Container>
  );
};

export default Dashboard;
