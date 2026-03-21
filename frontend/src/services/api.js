import axios from 'axios';

const api = axios.create({
    baseURL: 'https://alumni-platform-rwbo.onrender.com/api', // Assume backend runs on port 5000 locally
});

// Add a request interceptor to attach the JWT token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
