import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

export const getDashboard = () => api.get("/dashboard");

export const getPGs = () => api.get("/pg");

export default api;