import { useEffect, useState } from "react";
import api from "../utils/api.jsx";
import { getUser } from "../utils/auth.jsx";

export default function Dashboard() {
  const user = getUser();
  const [stats, setStats] = useState({ projects: 0, tasks: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      const projectRes = await api.get("/projects");
      const projects = projectRes.data.data || [];

      let totalTasks = 0;
      for (const project of projects) {
        totalTasks += parseInt(project.total_tasks || 0);
      }

      setStats({ projects: projects.length, tasks: totalTasks });
    } catch (err) {
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>;
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
      </div>

      <div className="grid-3" style={{ marginBottom: '32px' }}>
        <div className="card">
          <div className="card-title">Total Projects</div>
          <div className="card-value">{stats.projects}</div>
        </div>

        <div className="card">
          <div className="card-title">Total Tasks</div>
          <div className="card-value">{stats.tasks}</div>
        </div>

        <div className="card">
          <div className="card-title">User Role</div>
          <div className="card-value" style={{ fontSize: '20px', textTransform: 'capitalize' }}>
            {user?.role?.replace('_', ' ')}
          </div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '600' }}>Welcome Back!</h3>
        <p style={{ color: '#6b7280', fontSize: '15px', lineHeight: '1.6' }}>
          Hi <strong>{user?.fullName}</strong>, welcome to your multi-tenant SaaS dashboard.
          Use the sidebar to navigate between projects, tasks, and your profile.
        </p>
      </div>
    </div>
  );
}