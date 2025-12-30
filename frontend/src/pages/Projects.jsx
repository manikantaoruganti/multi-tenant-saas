import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api.jsx";
import ProjectForm from "../components/ProjectForm.jsx";

export default function Projects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    try {
      const res = await api.get("/projects");
      setProjects(res.data.data || []);
    } catch (err) {
      setError("Unable to load projects");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '40px' }}>Loading projects...</div>;
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Projects</h1>
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          + New Project
        </button>
      </div>

      {error && <p style={{ color: '#ef4444', marginBottom: '20px' }}>{error}</p>}

      {showForm && (
        <ProjectForm
          onCancel={() => setShowForm(false)}
          onCreated={() => {
            setShowForm(false);
            loadProjects();
          }}
        />
      )}

      {projects.length === 0 && !showForm && (
        <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
          <p style={{ color: '#6b7280', fontSize: '16px' }}>No projects yet. Create your first project!</p>
        </div>
      )}

      <div style={{ display: 'grid', gap: '20px' }}>
        {projects.map((project) => (
          <div
            key={project.id}
            className="card"
            style={{ cursor: 'pointer', transition: 'all 0.2s' }}
            onClick={() => navigate(`/projects/${project.id}/tasks`)}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.12)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px', color: '#111827' }}>
                  {project.name}
                </h3>
                <p style={{ color: '#6b7280', fontSize: '14px' }}>
                  {project.description || 'No description'}
                </p>
              </div>
              <span className="status-badge status-in-progress">Active</span>
            </div>

            <div style={{ display: 'flex', gap: '24px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #f3f4f6' }}>
              <div>
                <span style={{ fontSize: '12px', color: '#9ca3af' }}>Total Tasks</span>
                <p style={{ fontSize: '18px', fontWeight: '600', color: '#111827' }}>{project.total_tasks || 0}</p>
              </div>
              <div>
                <span style={{ fontSize: '12px', color: '#9ca3af' }}>Completed</span>
                <p style={{ fontSize: '18px', fontWeight: '600', color: '#10b981' }}>{project.completed_tasks || 0}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
