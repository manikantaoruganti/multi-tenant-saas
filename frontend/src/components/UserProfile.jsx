import { useState } from "react";
import api from "../utils/api.jsx";
import { getUser, saveAuth } from "../utils/auth.jsx";

/**
 * Reusable User Profile Card
 * - View + Edit own profile
 * - Safe for RBAC (no role/email edit)
 * - Can be embedded anywhere
 */
export default function UserProfile({ compact = false }) {
  const user = getUser();

  const [fullName, setFullName] = useState(user?.fullName || "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  if (!user) return null;

  async function handleUpdate(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      await api.put(`/users/${user.id}`, { fullName });

      // update local auth cache
      saveAuth(
        localStorage.getItem("saas_token"),
        { ...user, fullName }
      );

      setMessage("Profile updated successfully");
    } catch {
      setError("Unable to update profile");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`card ${compact ? "" : "profile-card"}`}>
      <h3 style={{ marginBottom: "12px" }}>
        {compact ? "Account" : "User Profile"}
      </h3>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {message && <p style={{ color: "green" }}>{message}</p>}

      <form onSubmit={handleUpdate}>
        {/* Full Name */}
        <div style={{ marginBottom: "10px" }}>
          <label>Full Name</label>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </div>

        {/* Email */}
        <div style={{ marginBottom: "10px" }}>
          <label>Email</label>
          <input value={user.email} disabled />
        </div>

        {/* Role */}
        <div style={{ marginBottom: "10px" }}>
          <label>Role</label>
          <input value={user.role} disabled />
        </div>

        {/* Tenant */}
        <div style={{ marginBottom: "14px" }}>
          <label>Tenant</label>
          <input value={user.tenant?.name || "System"} disabled />
        </div>

        <button
          className="btn-primary"
          disabled={loading}
          style={{ width: "100%" }}
        >
          {loading ? "Saving..." : "Update Profile"}
        </button>
      </form>
    </div>
  );
}
