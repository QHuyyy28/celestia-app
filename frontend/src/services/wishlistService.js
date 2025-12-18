import api from './api';

export const wishlistService = {
    getWishlist: () =>
        api.get('/wishlist'),

    addToWishlist: (productId) =>
        api.post('/wishlist/add', { productId }),

    removeFromWishlist: (productId) =>
        api.delete(`/wishlist/remove/${productId}`),

    checkInWishlist: (productId) =>
        api.get(`/wishlist/check/${productId}`),

    clearWishlist: () =>
        api.delete('/wishlist/clear'),

    getCount: () =>
        api.get('/wishlist/count'),

    toggleWishlist: (productId) =>
        api.post(`/wishlist/toggle/${productId}`),

    moveToCart: (productId) =>
        api.post(`/wishlist/move-to-cart/${productId}`)
};