import api from './api';

export const userService = {
    // Lấy tổng số user (admin)
    getUserCount: () => {
        return api.get('/users/stats/count');
    },

    // Lấy tất cả user (admin)
    getAll: (page = 1, limit = 10) => {
        return api.get(`/users?page=${page}&limit=${limit}`);
    },

    // Lấy chi tiết user (admin)
    getById: (id) => {
        return api.get(`/users/${id}`);
    }
};
