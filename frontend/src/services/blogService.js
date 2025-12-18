import api from './api';

export const blogService = {
    getAll: (page = 1, limit = 10, filters = {}) => {
        const params = new URLSearchParams({
            page,
            limit,
            ...filters
        });
        return api.get(`/blogs?${params}`);
    },

    getById: (id) =>
        api.get(`/blogs/${id}`),

    getBySlug: (slug) =>
        api.get(`/blogs/slug/${slug}`),

    search: (keyword, page = 1, limit = 10) =>
        api.get(`/blogs/search/${keyword}?page=${page}&limit=${limit}`),

    getByCategory: (category, page = 1, limit = 10) =>
        api.get(`/blogs/category/${category}?page=${page}&limit=${limit}`),

    create: (data) =>
        api.post('/blogs', data),

    update: (id, data) =>
        api.put(`/blogs/${id}`, data),

    delete: (id) =>
        api.delete(`/blogs/${id}`)
};