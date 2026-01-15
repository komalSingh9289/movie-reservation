import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:5000",
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use(
    (config) => {
        // You can attach token here if you store it in localStorage 
        // or pass it via headers in individual requests. 
        // We will handle token attachment in the components for now using Clerk's getToken
        // but having this centralized instance allows future flexibility.
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
