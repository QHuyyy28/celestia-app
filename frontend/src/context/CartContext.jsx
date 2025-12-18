import React, { createContext, useState, useEffect } from 'react';
import { cartService } from '../services/cartService';
import { useAuth } from '../hooks/useAuth';

// eslint-disable-next-line react-refresh/only-export-components
export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { isAuthenticated } = useAuth();

    // Lấy cart khi user đăng nhập
    useEffect(() => {
        if (isAuthenticated) {
            fetchCart();
        } else {
            setCart(null);
        }
    }, [isAuthenticated]);

    const fetchCart = async () => {
        try {
            setLoading(true);
            const response = await cartService.getCart();
            setCart(response.data.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Lỗi tải giỏ hàng');
        } finally {
            setLoading(false);
        }
    };

    const addToCart = async (productId, quantity) => {
        try {
            const response = await cartService.addToCart(productId, quantity);
            setCart(response.data.data);
            return response.data;
        } catch (err) {
            setError(err.response?.data?.message || 'Thêm vào giỏ thất bại');
            throw err;
        }
    };

    const updateQuantity = async (productId, quantity) => {
        try {
            const response = await cartService.updateQuantity(productId, quantity);
            setCart(response.data.data);
            return response.data;
        } catch (err) {
            setError(err.response?.data?.message || 'Cập nhật giỏ thất bại');
            throw err;
        }
    };

    const removeFromCart = async (productId) => {
        try {
            const response = await cartService.removeFromCart(productId);
            setCart(response.data.data);
            return response.data;
        } catch (err) {
            setError(err.response?.data?.message || 'Xóa khỏi giỏ thất bại');
            throw err;
        }
    };

    const clearCart = async () => {
        try {
            await cartService.clearCart();
            setCart({ items: [], totalItems: 0, totalPrice: 0 });
            return true;
        } catch (err) {
            setError(err.response?.data?.message || 'Xóa giỏ thất bại');
            throw err;
        }
    };

    const value = {
        cart,
        loading,
        error,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        fetchCart
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};