import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
});

export const getDashboard = () => api.get("/dashboard");

export const getPGs = () => api.get("/pg");

export default api;