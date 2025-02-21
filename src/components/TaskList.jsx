import React, { useState, useEffect } from "react";
import axios from "axios";
import CountdownTimer from "./CountdownTimer";

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axios.get("/api/tasks", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setTasks(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching tasks:", error);
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  return (
    <div className="task-list">
      <h2>Tasks</h2>
      {loading ? (
        <p>Loading tasks...</p>
      ) : (
        <div className="tasks-grid">
          {tasks.map((task) => (
            <div key={task._id} className="task-card">
              <h3>{task.title}</h3>
              <p>Priority: {task.priority}</p>
              <p>Status: {task.status}</p>
              <p>Deadline: {new Date(task.deadline).toLocaleDateString()}</p>
              <p>Assigned to: {task.assignedTo.username}</p>
              <CountdownTimer deadline={task.deadline} status={task.status} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskList;
