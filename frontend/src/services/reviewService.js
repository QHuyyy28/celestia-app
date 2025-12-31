import api from './api';

export const reviewService = {
    getProductReviews: (productId, page = 1, limit = 10, sort = 'newest') => {
        console.log('Getting reviews for productId:', productId, 'page:', page, 'limit:', limit);
        return api.get(`/reviews/product/${productId}`, {
            params: {
                page,
                limit,
                sort
            }
        });
    },

    getReviewById: (id) =>
        api.get(`/reviews/${id}`),

    createReview: (productId, rating, title, comment, images = []) =>
        api.post('/reviews', { productId, rating, title, comment, images }),

    updateReview: (id, data) =>
        api.put(`/reviews/${id}`, data),

    deleteReview: (id) =>
        api.delete(`/reviews/${id}`),

    markHelpful: (id) =>
        api.put(`/reviews/${id}/helpful`),

    getMyReviews: (page = 1, limit = 10) =>
        api.get(`/reviews/my-reviews?page=${page}&limit=${limit}`),

    getByRating: (rating, productId, page = 1, limit = 10) =>
        api.get(`/reviews/filter/rating/${rating}?productId=${productId}&page=${page}&limit=${limit}`)
};