import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api.jsx";
import { saveAuth } from "../utils/auth.jsx";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ tenant: "", email: "", password: "" });
  const [ui, setUI] = useState({ loading: false, error: "", showPassword: false });

  function updateField(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
    setUI(prev => ({ ...prev, error: "" }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setUI(prev => ({ ...prev, loading: true, error: "" }));

    try {
      const res = await api.post("/auth/login", {
        tenantSubdomain: form.tenant,
        email: form.email,
        password: form.password
      });

      saveAuth({ token: res.data.token, user: res.data.user });
      navigate("/");
    } catch (err) {
      setUI({
        loading: false,
        showPassword: ui.showPassword,
        error: err.response?.data?.message || "Invalid credentials"
      });
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={styles.title}>Welcome Back</h2>
          <p style={styles.subtitle}>Sign in to your workspace</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Tenant</label>
            <input
              style={styles.input}
              placeholder="demo"
              value={form.tenant}
              onChange={e => updateField("tenant", e.target.value)}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <input
              style={styles.input}
              type="email"
              placeholder="admin@demo.com"
              value={form.email}
              onChange={e => updateField("email", e.target.value)}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <div style={styles.passwordBox}>
              <input
                style={styles.passwordInput}
                type={ui.showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={form.password}
                onChange={e => updateField("password", e.target.value)}
                required
              />
              <span
                style={styles.toggle}
                onClick={() => setUI(prev => ({ ...prev, showPassword: !prev.showPassword }))}
              >
                {ui.showPassword ? "Hide" : "Show"}
              </span>
            </div>
          </div>

          {ui.error && <div style={styles.error}>{ui.error}</div>}

          <button style={styles.button} className="btn-primary" disabled={ui.loading}>
            {ui.loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div style={styles.footer}>
          <p style={styles.footerText}>Multi-Tenant SaaS Platform © 2025</p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  card: {
    width: '100%',
    maxWidth: '440px',
    background: '#ffffff',
    borderRadius: '16px',
    padding: '40px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
  },
  header: {
    marginBottom: '32px',
    textAlign: 'center'
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#111827',
    marginBottom: '8px'
  },
  subtitle: {
    fontSize: '15px',
    color: '#6b7280'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151'
  },
  input: {
    padding: '12px 14px',
    fontSize: '15px',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    width: '100%'
  },
  passwordBox: {
    position: 'relative'
  },
  passwordInput: {
    width: '100%',
    padding: '12px 14px',
    paddingRight: '60px',
    fontSize: '15px',
    borderRadius: '8px',
    border: '1px solid #d1d5db'
  },
  toggle: {
    position: 'absolute',
    right: '14px',
    top: '50%',
    transform: 'translateY(-50%)',
    cursor: 'pointer',
    fontSize: '13px',
    color: '#3b82f6',
    fontWeight: '500',
    userSelect: 'none'
  },
  button: {
    marginTop: '8px',
    padding: '14px',
    fontSize: '15px',
    fontWeight: '600',
    width: '100%'
  },
  error: {
    background: '#fee2e2',
    color: '#dc2626',
    padding: '12px',
    borderRadius: '8px',
    fontSize: '14px',
    textAlign: 'center'
  },
  footer: {
    marginTop: '32px',
    textAlign: 'center'
  },
  footerText: {
    fontSize: '13px',
    color: '#9ca3af'
  }
};