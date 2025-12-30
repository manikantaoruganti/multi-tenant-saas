import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" }
});

api.interceptors.request.use(config => {
  const auth = localStorage.getItem("multi_saas_auth");
  if (auth) {
    const { token } = JSON.parse(auth);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default api;
