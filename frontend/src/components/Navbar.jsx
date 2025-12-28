import { NavLink } from "react-router-dom";
import { logout } from "../utils/auth.jsx";

export default function Navbar() {
  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside
        style={{
          width: "220px",
          background: "#111827",
          color: "#f9fafb",
          padding: "20px",
          display: "flex",
          flexDirection: "column"
        }}
      >
        <h2 style={{ marginBottom: "30px", fontSize: "20px" }}>
          Multi-SaaS
        </h2>

        <nav style={{ flex: 1 }}>
          <NavItem to="/">Dashboard</NavItem>
          <NavItem to="/projects">Projects</NavItem>
          <NavItem to="/profile">Profile</NavItem>
        </nav>

        <button
          onClick={logout}
          className="btn-danger"
          style={{ marginTop: "20px" }}
        >
          Logout
        </button>
      </aside>

      {/* Main content wrapper */}
      <main className="main-content">
        {/* Routed pages render here via App.jsx */}
      </main>
    </div>
  );
}

/* ---------------------------------- */
/* Reusable Nav Item */
/* ---------------------------------- */
function NavItem({ to, children }) {
  return (
    <NavLink
      to={to}
      style={({ isActive }) => ({
        display: "block",
        padding: "10px 12px",
        marginBottom: "6px",
        borderRadius: "6px",
        background: isActive ? "#2563eb" : "transparent",
        color: isActive ? "#ffffff" : "#d1d5db"
      })}
    >
      {children}
    </NavLink>
  );
}
