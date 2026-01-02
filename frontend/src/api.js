// Use environment variable in production, fallback to localhost in development
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export { API_BASE_URL };

export const ENDPOINTS = {
    USERS: `${API_BASE_URL}/users`,
    OTP: `${API_BASE_URL}/otp`,
    ADMIN: `${API_BASE_URL}/admin`,
    EVENTS: `${API_BASE_URL}/events`,
    REQUESTS: `${API_BASE_URL}/requests`,
};

export const getAuthHeaders = () => {
    const token =
        localStorage.getItem("clubToken") ||
        localStorage.getItem("adminToken") ||
        localStorage.getItem("token");

    return {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
    };
};

export const getUser = () => {
    const userStr =
        localStorage.getItem("club") ||
        localStorage.getItem("adminUser") ||
        localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
};
