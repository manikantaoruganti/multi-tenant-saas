import { NavLink } from "react-router-dom";
import { logout } from "../utils/auth.jsx";

export default function Navbar() {
  return (
    <aside style={styles.sidebar}>
      <div style={styles.brand}>
        <h2 style={styles.brandText}>Multi-SaaS</h2>
      </div>

      <nav style={styles.nav}>
        <NavItem to="/">Dashboard</NavItem>
        <NavItem to="/projects">Projects</NavItem>
        <NavItem to="/profile">Profile</NavItem>
      </nav>

      <button onClick={logout} className="btn-danger" style={{ marginTop: 'auto', width: '100%' }}>
        Logout
      </button>
    </aside>
  );
}

function NavItem({ to, children }) {
  return (
    <NavLink
      to={to}
      style={({ isActive }) => ({
        display: 'block',
        padding: '12px 16px',
        marginBottom: '8px',
        borderRadius: '8px',
        background: isActive ? '#3b82f6' : 'transparent',
        color: isActive ? '#ffffff' : '#d1d5db',
        fontWeight: isActive ? '600' : '400',
        transition: 'all 0.2s'
      })}
    >
      {children}
    </NavLink>
  );
}

const styles = {
  sidebar: {
    width: '260px',
    background: '#1f2937',
    color: '#f9fafb',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '2px 0 8px rgba(0,0,0,0.1)'
  },
  brand: {
    marginBottom: '40px',
    paddingBottom: '20px',
    borderBottom: '1px solid #374151'
  },
  brandText: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#ffffff'
  },
  nav: {
    flex: 1
  }
};