import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Box,
  Alert,
} from "@mui/material";
import { getAllUsers, createTask } from "../services/api";

const TaskForm = ({ open, handleClose, onTaskCreated }) => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [task, setTask] = useState({
    title: "",
    description: "",
    assignedTo: "",
    deadline: "",
    priority: "Medium",
    status: "Pending",
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await getAllUsers();
        setUsers(response.data);
      } catch (error) {
        console.error("Error fetching users:", error);
        setError("Failed to load users");
      }
    };

    if (open) {
      fetchUsers();
    }
  }, [open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await createTask(task);
      console.log("Task created:", response.data);
      onTaskCreated(); // Notify parent component
      handleClose();
      // Reset form
      setTask({
        title: "",
        description: "",
        assignedTo: "",
        deadline: "",
        priority: "Medium",
        status: "Pending",
      });
    } catch (error) {
      console.error("Error creating task:", error);
      setError(error.response?.data?.message || "Failed to create task");
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create New Task</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Title"
              required
              fullWidth
              value={task.title}
              onChange={(e) => setTask({ ...task, title: e.target.value })}
            />

            <TextField
              label="Description"
              multiline
              rows={4}
              fullWidth
              value={task.description}
              onChange={(e) =>
                setTask({ ...task, description: e.target.value })
              }
            />

            <FormControl fullWidth required>
              <InputLabel>Assign To</InputLabel>
              <Select
                value={task.assignedTo}
                label="Assign To"
                onChange={(e) =>
                  setTask({ ...task, assignedTo: e.target.value })
                }
              >
                {users.map((user) => (
                  <MenuItem key={user._id} value={user._id}>
                    {user.username} ({user.email})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Deadline"
              type="datetime-local"
              required
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={task.deadline}
              onChange={(e) => setTask({ ...task, deadline: e.target.value })}
            />

            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={task.priority}
                label="Priority"
                onChange={(e) => setTask({ ...task, priority: e.target.value })}
              >
                <MenuItem value="Low">Low</MenuItem>
                <MenuItem value="Medium">Medium</MenuItem>
                <MenuItem value="High">High</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={task.status}
                label="Status"
                onChange={(e) => setTask({ ...task, status: e.target.value })}
              >
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="In Progress">In Progress</MenuItem>
                <MenuItem value="Completed">Completed</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            Create
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default TaskForm;
