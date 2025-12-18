import api from './api';

export const authService = {
    register: (name, email, password) =>
        api.post('/auth/register', { name, email, password }),

    login: (email, password) =>
        api.post('/auth/login', { email, password }),

    getProfile: () =>
        api.get('/auth/me'),

    updateProfile: (data) =>
        api.put('/auth/update', data),

    changePassword: (currentPassword, newPassword, confirmPassword) =>
        api.put('/auth/change-password', { currentPassword, newPassword, confirmPassword }),

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }
};