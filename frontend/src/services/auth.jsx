import api from "./api";

export const login = async (password) => {
  return await api.post("/auth/login", {
    password: password,
  });
};