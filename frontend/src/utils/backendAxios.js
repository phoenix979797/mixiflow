import axios from "axios";

// Create axios instance with custom config
const backendAxios = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:8001/api",
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
backendAxios.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem("token");

    // If token exists, add it to request headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
backendAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized responses
    if (error.response && error.response.status === 401) {
      // Clear localStorage and redirect to login
      localStorage.clear();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default backendAxios;
