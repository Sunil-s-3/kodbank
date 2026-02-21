import axios from "axios";

const api = axios.create({
  baseURL: "https://kodbank-vatd.onrender.com/api",
  withCredentials: true
});

export default api;
