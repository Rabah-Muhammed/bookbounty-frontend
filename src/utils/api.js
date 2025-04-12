import axios from "axios";

const isDevelopment = import.meta.env.MODE === "development";
const myBaseUrl = isDevelopment
  ? import.meta.env.VITE_API_BASE_URL_LOCAL  // "http://localhost:8000/api"
  : import.meta.env.VITE_API_BASE_URL_DEPLOY; // "https://bookbounty-backend.onrender.com/api"

// Media base URL for images, PDFs, avatars
export const MEDIA_BASE_URL = isDevelopment
  ? import.meta.env.VITE_MEDIA_BASE_URL_LOCAL  // "http://localhost:8000"
  : import.meta.env.VITE_MEDIA_BASE_URL_DEPLOY; // "https://book-bounty.s3.eu-north-1.amazonaws.com"

// Utility to normalize media URLs
export const normalizeMediaUrl = (path) => {
  if (!path) return null;
  // If path is already a full URL, return it as-is
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  // Otherwise, prepend MEDIA_BASE_URL and ensure no double slashes
  return `${MEDIA_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`.replace(/([^:]\/)\/+/g, "$1");
};

const api = axios.create({
  baseURL: myBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    } else {
      console.warn("No access token found in localStorage");
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem("refresh_token");
        if (!refreshToken) throw new Error("No refresh token available");

        console.log("Attempting token refresh...");
        const response = await axios.post(
          `${myBaseUrl}/token/refresh/`,
          { refresh: refreshToken },
          { headers: { "Content-Type": "application/json" } }
        );

        const newAccessToken = response.data.access;
        localStorage.setItem("access_token", newAccessToken);
        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;