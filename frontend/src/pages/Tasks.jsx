import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/api.jsx";
import TaskForm from "../components/TaskForm.jsx";

export default function Tasks() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadTasks();
  }, [projectId]);

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

  async function updateStatus(taskId, status) {
    try {
      await api.put(`/tasks/${taskId}`, { status });
      loadTasks();
    } catch {
      alert("Failed to update task status");
    }
  }

  function renderTasks(status) {
    return tasks
      .filter(t => t.status === status)
      .map(task => (
        <div key={task.id} className="task-card">
          <h4 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '8px', color: '#111827' }}>
            {task.title}
          </h4>
          <p style={{ color: '#6b7280', fontSize: '13px', marginBottom: '12px' }}>
            {task.description || 'No description'}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <span className={`status-badge status-${task.priority}`} style={{
              backgroundColor: task.priority === 'high' ? '#fee2e2' : task.priority === 'medium' ? '#fef3c7' : '#dbeafe',
              color: task.priority === 'high' ? '#dc2626' : task.priority === 'medium' ? '#d97706' : '#2563eb'
            }}>
              {task.priority}
            </span>
            {task.assigned_to && (
              <span style={{ fontSize: '12px', color: '#6b7280' }}>
                👤 {task.assigned_to}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {status !== 'todo' && (
              <button
                className="btn-secondary"
                style={{ fontSize: '12px', padding: '6px 12px' }}
                onClick={() => updateStatus(task.id, 'todo')}
              >
                To Do
              </button>
            )}
            {status !== 'in_progress' && (
              <button
                className="btn-secondary"
                style={{ fontSize: '12px', padding: '6px 12px' }}
                onClick={() => updateStatus(task.id, 'in_progress')}
              >
                In Progress
              </button>
            )}
            {status !== 'completed' && (
              <button
                className="btn-primary"
                style={{ fontSize: '12px', padding: '6px 12px' }}
                onClick={() => updateStatus(task.id, 'completed')}
              >
                Complete
              </button>
            )}
          </div>
        </div>
      ));
  }

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '40px' }}>Loading tasks...</div>;
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <button
            onClick={() => navigate('/projects')}
            style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: '14px', marginBottom: '8px' }}
          >
            ← Back to Projects
          </button>
          <h1 className="page-title">Project Tasks</h1>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          + New Task
        </button>
      </div>

      {error && <p style={{ color: '#ef4444', marginBottom: '20px' }}>{error}</p>}

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

      <div className="grid-3">
        <div className="kanban-column">
          <h3>To Do</h3>
          {renderTasks('todo')}
          {tasks.filter(t => t.status === 'todo').length === 0 && (
            <p style={{ color: '#9ca3af', fontSize: '14px', textAlign: 'center', marginTop: '20px' }}>No tasks</p>
          )}
        </div>

        <div className="kanban-column">
          <h3>In Progress</h3>
          {renderTasks('in_progress')}
          {tasks.filter(t => t.status === 'in_progress').length === 0 && (
            <p style={{ color: '#9ca3af', fontSize: '14px', textAlign: 'center', marginTop: '20px' }}>No tasks</p>
          )}
        </div>

        <div className="kanban-column">
          <h3>Completed</h3>
          {renderTasks('completed')}
          {tasks.filter(t => t.status === 'completed').length === 0 && (
            <p style={{ color: '#9ca3af', fontSize: '14px', textAlign: 'center', marginTop: '20px' }}>No tasks</p>
          )}
        </div>
      </div>
    </div>
  );
}
