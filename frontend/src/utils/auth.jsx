const KEY = "multi_saas_auth";

export function saveAuth(data) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function getAuth() {
  const raw = localStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : null;
}

export function getUser() {
  return getAuth()?.user || null;
}

export function getToken() {
  return getAuth()?.token || null;
}

export function isAuthenticated() {
  return !!getToken();
}

export function logout() {
  localStorage.removeItem(KEY);
  window.location.href = "/login";
}
