import axios from "axios";

const API = axios.create({
  baseURL: "https://kodbank-backend.onrender.com",
  withCredentials: true,
});

export default API;
