import api from './api';

export const orderService = {
    // Lấy tất cả đơn hàng (admin)
    getAll: (page = 1, limit = 10) => {
        return api.get(`/orders?page=${page}&limit=${limit}`);
    },

    // Lấy đơn hàng của user
    getMyOrders: (page = 1, limit = 10) => {
        return api.get(`/orders/my-orders?page=${page}&limit=${limit}`);
    },

    // Lấy chi tiết đơn hàng
    getById: (id) => {
        return api.get(`/orders/${id}`);
    },

    // Tạo đơn hàng
    create: (orderData) => {
        return api.post('/orders', orderData);
    },

    // Cập nhật trạng thái đơn hàng (admin)
    updateStatus: (id, status) => {
        return api.put(`/orders/${id}/status`, { status });
    },

    // Hủy đơn hàng
    cancel: (id) => {
        return api.put(`/orders/${id}/cancel`);
    },

    // Lấy thống kê đơn hàng (admin)
    getStats: () => {
        return api.get('/orders/stats/overview');
    }
};
