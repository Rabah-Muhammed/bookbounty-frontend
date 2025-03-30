import axios from "axios";

const isDevelopment = import.meta.env.MODE === "development" || process.env.NODE_ENV === "development";

const myBaseUrl =
  import.meta.env.VITE_API_BASE_URL_LOCAL && import.meta.env.VITE_API_BASE_URL_DEPLOY
    ? isDevelopment
      ? import.meta.env.VITE_API_BASE_URL_LOCAL
      : import.meta.env.VITE_API_BASE_URL_DEPLOY
    : "http://localhost:8000/api"; // Fallback in case env vars are missing

console.log("API Base URL:", myBaseUrl); // Debugging - check if the correct URL is used

const api = axios.create({
  baseURL: myBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

export default api;
