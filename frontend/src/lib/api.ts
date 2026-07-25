import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add JWT token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;

export const authAPI = {
  register: (data: any) => api.post("/auth/register", data),
  login: (data: any) => api.post("/auth/login", data),
};

export const predictAPI = {
  symptoms: (data: any) => api.post("/predict/symptoms", data),
  history: () => api.get("/predict/history"),
  xray: (data: FormData) => api.post("/predict/xray", data, { headers: { "Content-Type": "multipart/form-data" } }),
};

export const dashboardAPI = {
  stats: () => api.get("/dashboard/stats"),
  trends: () => api.get("/dashboard/trends"),
  distribution: () => api.get("/dashboard/disease-distribution"),
};
