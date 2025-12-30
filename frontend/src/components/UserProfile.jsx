import { useState } from "react";
import { getUser } from "../utils/auth.jsx";

export default function UserProfile() {
  const user = getUser();

  if (!user) return null;

  return (
    <div className="card">
      <h3 style={{ marginBottom: '20px', fontSize: '20px', fontWeight: '600' }}>User Profile</h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '14px', color: '#6b7280', marginBottom: '6px' }}>Full Name</label>
          <input value={user.fullName || ''} disabled style={{ backgroundColor: '#f9fafb' }} />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '14px', color: '#6b7280', marginBottom: '6px' }}>Email</label>
          <input value={user.email || ''} disabled style={{ backgroundColor: '#f9fafb' }} />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '14px', color: '#6b7280', marginBottom: '6px' }}>Role</label>
          <input value={user.role || ''} disabled style={{ backgroundColor: '#f9fafb' }} />
        </div>
      </div>
    </div>
  );
}