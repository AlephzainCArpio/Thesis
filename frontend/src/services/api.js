import axios from "axios";

// Create an axios instance with default config
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle unauthorized errors (token expired)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
  
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// Function to submit service data with images (multipart/form-data)
export const submitServiceData = async (formData) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Authentication token not found.");

    // Log form data for debugging
    console.log("Form data being sent:");
    for (let [key, value] of formData.entries()) {
      if (key === 'images') {
        console.log(`${key}: ${value.name} (${value.type}, ${value.size} bytes)`);
      } else {
        console.log(`${key}: ${value}`);
      }
    }

    const url = `${api.defaults.baseURL}/api/providers/register-service`;
    console.log("Sending request to:", url);

    const response = await axios.post(
      url,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("Response received:", response.data);
    return response.data;
  } catch (error) {
    console.error("Service submission error:", error.response ? error.response.data : error.message);
    throw error;
  }
};

export default api;