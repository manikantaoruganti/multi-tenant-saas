import { useEffect, useState } from "react";
import api from "../utils/api.jsx";

export default function Dashboard() {
  const [stats, setStats] = useState({
    projects: 0,
    tasks: 0,
    completed: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const projectsRes = await api.get("/projects");
        const projects = projectsRes.data.data || [];

        let totalTasks = 0;
        let completedTasks = 0;

        for (const project of projects) {
          const tasksRes = await api.get(
            `/projects/${project.id}/tasks`
          );
          const tasks = tasksRes.data.data || [];

          totalTasks += tasks.length;
          completedTasks += tasks.filter(
            (t) => t.status === "completed"
          ).length;
        }

        setStats({
          projects: projects.length,
          tasks: totalTasks,
          completed: completedTasks
        });
      } catch (err) {
        setError("Unable to load dashboard data");
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  if (loading) {
    return <p>Loading dashboard...</p>;
  }

  if (error) {
    return <p style={{ color: "red" }}>{error}</p>;
  }

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid-3">
        <div className="card">
          <div className="card-title">Total Projects</div>
          <div className="card-value">{stats.projects}</div>
        </div>

        <div className="card">
          <div className="card-title">Total Tasks</div>
          <div className="card-value">{stats.tasks}</div>
        </div>

        <div className="card">
          <div className="card-title">Completed Tasks</div>
          <div className="card-value">{stats.completed}</div>
        </div>
      </div>

      {/* Future-ready Section */}
      <div style={{ marginTop: "40px" }}>
        <div className="card">
          <h3 style={{ marginBottom: "10px" }}>Overview</h3>
          <p style={{ color: "#6b7280" }}>
            This dashboard shows a real-time overview of your tenant’s
            activity. Project and task metrics update dynamically based
            on backend data.
          </p>
        </div>
      </div>
    </div>
  );
}
