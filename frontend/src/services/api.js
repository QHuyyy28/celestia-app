import axios from 'axios';

// Tự động detect môi trường production hay development
const getApiBaseUrl = () => {
    // Nếu có biến môi trường VITE_API_URL thì dùng nó (ưu tiên cao nhất)
    if (import.meta.env.VITE_API_URL) {
        console.log('Using VITE_API_URL:', import.meta.env.VITE_API_URL);
        return import.meta.env.VITE_API_URL;
    }
    
    // Nếu đang ở production (celestia.id.vn), dùng backend Render
    const hostname = window.location.hostname;
    if (hostname === 'celestia.id.vn' || hostname === 'www.celestia.id.vn') {
        console.log('Detected production environment, using: https://celestia-backend.onrender.com/api');
        return 'https://celestia-backend.onrender.com/api';
    }
    
    // Mặc định dùng localhost cho development
    console.log('Using development localhost: http://localhost:5000/api');
    return 'http://localhost:5000/api';
};

const API_BASE_URL = getApiBaseUrl();
console.log('Final API_BASE_URL:', API_BASE_URL);

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
    
    // Nếu là FormData, bỏ Content-Type để browser tự thiết lập multipart/form-data
    if (config.data instanceof FormData) {
        delete config.headers['Content-Type'];
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