import axios from "axios";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// Interceptor untuk mendeteksi 401
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Hapus token
            localStorage.removeItem("token");
            localStorage.removeItem("user");

            // Redirect ke homepage
            window.location.href = "/";
        }
        return Promise.reject(error);
    }
);

export default api;
