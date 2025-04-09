// src/utils/api.js
import axios from "axios";

const isDevelopment = import.meta.env.MODE === "development";
const myBaseUrl = isDevelopment
  ? import.meta.env.VITE_API_BASE_URL_LOCAL  // "http://localhost:8000/api"
  : import.meta.env.VITE_API_BASE_URL_DEPLOY; // "https://bookbounty-backend.onrender.com/api"



const api = axios.create({
  baseURL: myBaseUrl, 
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});



export default api;
