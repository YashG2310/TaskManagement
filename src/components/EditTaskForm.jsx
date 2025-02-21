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
import { getAllUsers } from "../services/api";

const EditTaskForm = ({ open, handleClose, task, onTaskUpdated }) => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [editedTask, setEditedTask] = useState({
    title: "",
    description: "",
    assignedTo: "",
    deadline: "",
    priority: "Medium",
    status: "Pending",
  });

  useEffect(() => {
    if (task) {
      setEditedTask({
        ...task,
        deadline: new Date(task.deadline).toISOString().slice(0, 16), // Format datetime for input
        assignedTo: task.assignedTo?._id || "",
      });
    }
  }, [task]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await getAllUsers();
        setUsers(response.data);
      } catch (error) {
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
      await onTaskUpdated(editedTask);
      handleClose();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to update task");
    }
  };

  if (!task) return null;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Task</DialogTitle>
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
              value={editedTask.title}
              onChange={(e) =>
                setEditedTask({ ...editedTask, title: e.target.value })
              }
            />

            <TextField
              label="Description"
              multiline
              rows={4}
              fullWidth
              value={editedTask.description}
              onChange={(e) =>
                setEditedTask({ ...editedTask, description: e.target.value })
              }
            />

            <FormControl fullWidth required>
              <InputLabel>Assign To</InputLabel>
              <Select
                value={editedTask.assignedTo}
                label="Assign To"
                onChange={(e) =>
                  setEditedTask({ ...editedTask, assignedTo: e.target.value })
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
              value={editedTask.deadline}
              onChange={(e) =>
                setEditedTask({ ...editedTask, deadline: e.target.value })
              }
            />

            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={editedTask.priority}
                label="Priority"
                onChange={(e) =>
                  setEditedTask({ ...editedTask, priority: e.target.value })
                }
              >
                <MenuItem value="Low">Low</MenuItem>
                <MenuItem value="Medium">Medium</MenuItem>
                <MenuItem value="High">High</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={editedTask.status}
                label="Status"
                onChange={(e) =>
                  setEditedTask({ ...editedTask, status: e.target.value })
                }
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
            Update
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EditTaskForm;
