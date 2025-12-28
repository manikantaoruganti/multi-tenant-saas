import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../utils/api.jsx";
import TaskForm from "../components/TaskForm.jsx";

export default function Tasks() {
  const { projectId } = useParams();

  const [tasks, setTasks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadTasks() {
    try {
      const res = await api.get(`/projects/${projectId}/tasks`);
      setTasks(res.data.data || []);
    } catch (err) {
      setError("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTasks();
  }, [projectId]);

  async function updateStatus(taskId, status) {
    try {
      await api.patch(`/tasks/${taskId}/status`, { status });
      loadTasks();
    } catch {
      alert("Failed to update status");
    }
  }

  function renderTasks(status) {
    return tasks
      .filter(t => t.status === status)
      .map(task => (
        <div key={task.id} className="card" style={{ marginBottom: "10px" }}>
          <h4>{task.title}</h4>
          <p style={{ color: "#6b7280" }}>
            {task.description || "No description"}
          </p>

          <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
            {status !== "todo" && (
              <button
                className="btn-secondary"
                onClick={() => updateStatus(task.id, "todo")}
              >
                Todo
              </button>
            )}
            {status !== "in_progress" && (
              <button
                className="btn-secondary"
                onClick={() => updateStatus(task.id, "in_progress")}
              >
                In Progress
              </button>
            )}
            {status !== "completed" && (
              <button
                className="btn-primary"
                onClick={() => updateStatus(task.id, "completed")}
              >
                Complete
              </button>
            )}
          </div>
        </div>
      ));
  }

  if (loading) return <p>Loading tasks...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Project Tasks</h1>
        <button
          className="btn-primary"
          onClick={() => setShowForm(true)}
        >
          + New Task
        </button>
      </div>

      {/* Create Task */}
      {showForm && (
        <TaskForm
          projectId={projectId}
          onCancel={() => setShowForm(false)}
          onCreated={() => {
            setShowForm(false);
            loadTasks();
          }}
        />
      )}

      {/* Kanban */}
      <div className="grid-3">
        <div>
          <h3>Todo</h3>
          {renderTasks("todo")}
        </div>

        <div>
          <h3>In Progress</h3>
          {renderTasks("in_progress")}
        </div>

        <div>
          <h3>Completed</h3>
          {renderTasks("completed")}
        </div>
      </div>
    </div>
  );
}
