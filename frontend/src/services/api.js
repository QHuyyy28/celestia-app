import axios from 'axios';

// Sử dụng environment variable hoặc fallback về localhost
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Get backend server URL (remove /api suffix for static files)
export const getBackendUrl = () => {
    return API_BASE_URL.replace('/api', '');
};

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials: true
});

// Thêm token vào mỗi request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Xử lý lỗi response
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Nếu token hết hạn hoặc không có
        if (error.response?.status === 401) {
            // Xóa token cũ
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            
            // Redirect về login
            if (window.location.pathname !== '/login') {
                window.location.href = '/login?expired=true';
            }
        }
        
        // Nếu không có quyền truy cập
        if (error.response?.status === 403) {
            console.error('Bạn không có quyền truy cập tài nguyên này');
        }
        
        return Promise.reject(error);
    }
);

export default api;