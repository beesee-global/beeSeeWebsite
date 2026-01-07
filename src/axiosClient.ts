import axios from "axios"; 

// Create an Axios instance
const axiosClient = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL_BACKEND}/api`, // 👈 adjust if your routes are prefixed
  withCredentials: false, // set to true if using cookies / auth sessions
});
 

// Add a request interceptor (optional)
axiosClient.interceptors.request.use(
  (config) => {
    // Example: attach auth token if stored
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor (optional)
axiosClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error?.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user"); 
    }
    console.error("🚨 API Error:", error.response || error.message);
    return Promise.reject(error);
  }
);

export default axiosClient;
