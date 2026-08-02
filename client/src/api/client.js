import axios from "axios";

// If VITE_API_URL is set in production (e.g., https://api.nuttreasuryservices.com/api/v1), use it. 
// Otherwise, fall back to the Vite dev proxy ("/api") for local development.
const baseURL = import.meta.env.VITE_API_URL || "/api";

const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
  // Set to false since we use JWT Bearer tokens in localStorage.
  // Leaving this "true" causes browsers to trigger CORS "Network Error" blocks
  // unless the backend explicitly supports credentials on every single route.
  withCredentials: false, 
});

// Attach the JWT (if any) to the headers of every outgoing request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("nut_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Normalise error messages and automatically clean up expired sessions on 401
api.interceptors.response.use(
  (res) => res,
  (error) => {
    // Safely extract the most detailed server error message available
    const message =
      error.response?.data?.message ||
      error.message ||
      "Something went wrong. Please try again.";
      
    if (error.response?.status === 401) {
      localStorage.removeItem("nut_token");
      if (api.defaults.headers.common["Authorization"]) {
        delete api.defaults.headers.common["Authorization"];
      }
    }
    
    return Promise.reject(new Error(message));
  }
);

export default api;