import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api.jsx";
import ProjectForm from "../components/ProjectForm.jsx";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function loadProjects() {
    try {
      const res = await api.get("/projects");
      setProjects(res.data.data || []);
    } catch (err) {
      setError("Failed to load projects");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProjects();
  }, []);

  function handleProjectCreated() {
    setShowForm(false);
    loadProjects();
  }

  if (loading) return <p>Loading projects...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Projects</h1>
        <button
          className="btn-primary"
          onClick={() => setShowForm(true)}
        >
          + New Project
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <ProjectForm
          onCancel={() => setShowForm(false)}
          onCreated={handleProjectCreated}
        />
      )}

      {/* Project List */}
      {projects.length === 0 ? (
        <div className="card">
          <p>No projects yet. Create your first project.</p>
        </div>
      ) : (
        <div className="grid-2">
          {projects.map((project) => (
            <div
              key={project.id}
              className="card"
              style={{ cursor: "pointer" }}
              onClick={() =>
                navigate(`/projects/${project.id}/tasks`)
              }
            >
              <h3 style={{ marginBottom: "6px" }}>
                {project.name}
              </h3>
              <p style={{ color: "#6b7280" }}>
                {project.description || "No description"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
