import api from './api';

export const productService = {
    getAll: (page = 1, limit = 12, filters = {}) => {
        const params = new URLSearchParams({
            page,
            limit,
            ...filters
        });
        return api.get(`/products?${params}`);
    },

    getById: (id) =>
        api.get(`/products/${id}`),

    getFeatured: () =>
        api.get('/products/featured'),

    search: (query) =>
        api.get(`/products?search=${query}`),

    getByCategory: (categoryId) =>
        api.get(`/products?category=${categoryId}`),

    create: (data) =>
        api.post('/products', data),

    update: (id, data) =>
        api.put(`/products/${id}`, data),

    delete: (id) =>
        api.delete(`/products/${id}`)
};