import { useState } from "react";
import api from "../utils/api.jsx";
import { saveAuth } from "../utils/auth.jsx";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [subdomain, setSubdomain] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      const res = await api.post("/auth/login", {
        email,
        password,
        tenantSubdomain: subdomain
      });

      saveAuth(res.data.data.token, res.data.data.user);
      navigate("/dashboard");
    } catch {
      setError("Invalid credentials");
    }
  }

  return (
    <div className="card" style={{ maxWidth: "400px", margin: "auto" }}>
      <h2>Login</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <input placeholder="Tenant subdomain" onChange={e => setSubdomain(e.target.value)} />
        <input placeholder="Email" onChange={e => setEmail(e.target.value)} />
        <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />

        <button className="btn-primary" style={{ marginTop: "10px" }}>
          Login
        </button>
      </form>
    </div>
  );
}
