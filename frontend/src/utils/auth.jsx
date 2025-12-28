// src/utils/auth.jsx

const AUTH_KEY = "multi_saas_auth";

export function saveAuth(data) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(data));
}

export function getAuth() {
  const raw = localStorage.getItem(AUTH_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function getToken() {
  return getAuth()?.token || null;
}

export function getUser() {
  return getAuth()?.user || null;
}

export function isAuthenticated() {
  return !!getAuth();
}

export function logout() {
  localStorage.removeItem(AUTH_KEY);
  window.location.href = "/login";
}
