import api from './api';

export const cartService = {
    getCart: () =>
        api.get('/cart'),

    addToCart: (productId, quantity) =>
        api.post('/cart/add', { productId, quantity }),

    updateQuantity: (productId, quantity) =>
        api.put(`/cart/update/${productId}`, { quantity }),

    removeFromCart: (productId) =>
        api.delete(`/cart/remove/${productId}`),

    clearCart: () =>
        api.delete('/cart/clear'),

    getCount: () =>
        api.get('/cart/count'),

    getStats: () =>
        api.get('/cart/stats')
};