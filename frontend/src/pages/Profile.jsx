import { useState } from "react";
import api from "../utils/api.jsx";
import { getUser, saveAuth } from "../utils/auth.jsx";

export default function Profile() {
  const user = getUser();

  const [fullName, setFullName] = useState(user?.fullName || "");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  if (!user) {
    return <p>Not authenticated</p>;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await api.put(`/users/${user.id}`, {
        fullName
      });

      // update local storage user
      saveAuth(
        localStorage.getItem("saas_token"),
        { ...user, fullName }
      );

      setSuccess("Profile updated successfully");
    } catch {
      setError("Failed to update profile");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card" style={{ maxWidth: "500px" }}>
      <h2>My Profile</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}

      <form onSubmit={handleSubmit}>
        {/* Name */}
        <div style={{ marginBottom: "12px" }}>
          <label>Full Name</label>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </div>

        {/* Email (readonly) */}
        <div style={{ marginBottom: "12px" }}>
          <label>Email</label>
          <input value={user.email} disabled />
        </div>

        {/* Role */}
        <div style={{ marginBottom: "12px" }}>
          <label>Role</label>
          <input value={user.role} disabled />
        </div>

        {/* Tenant */}
        <div style={{ marginBottom: "12px" }}>
          <label>Tenant</label>
          <input value={user.tenant?.name || "System"} disabled />
        </div>

        <button
          className="btn-primary"
          disabled={loading}
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
