// src/utils/api.js
import axios from "axios";

const isDevelopment = import.meta.env.MODE === 'development'
const myBaseUrl = isDevelopment ? import.meta.env.VITE_API_BASE_URL_LOCAL : import.meta.env.VITE_API_BASE_URL_DEPLOY

const api = axios.create({
  baseURL: myBaseUrl, 
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});


export default api;