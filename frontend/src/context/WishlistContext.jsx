import React, { createContext, useState, useEffect } from 'react';
import { wishlistService } from '../services/wishlistService';
import { useAuth } from '../hooks/useAuth';

// eslint-disable-next-line react-refresh/only-export-components
export const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
    const [wishlist, setWishlist] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        if (isAuthenticated) {
            fetchWishlist();
        } else {
            setWishlist(null);
        }
    }, [isAuthenticated]);

    const fetchWishlist = async () => {
        try {
            setLoading(true);
            const response = await wishlistService.getWishlist();
            setWishlist(response.data.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Lỗi tải wishlist');
        } finally {
            setLoading(false);
        }
    };

    const addToWishlist = async (productId) => {
        try {
            const response = await wishlistService.addToWishlist(productId);
            setWishlist(response.data.data);
            return response.data;
        } catch (err) {
            setError(err.response?.data?.message || 'Thêm vào wishlist thất bại');
            throw err;
        }
    };

    const removeFromWishlist = async (productId) => {
        try {
            const response = await wishlistService.removeFromWishlist(productId);
            setWishlist(response.data.data);
            return response.data;
        } catch (err) {
            setError(err.response?.data?.message || 'Xóa khỏi wishlist thất bại');
            throw err;
        }
    };

    const toggleWishlist = async (productId) => {
        try {
            const response = await wishlistService.toggleWishlist(productId);
            // Backend returns { wishlist, inWishlist } inside data
            const updatedWishlist = response.data.data.wishlist || response.data.data;
            setWishlist(updatedWishlist);
            return response.data;
        } catch (err) {
            setError(err.response?.data?.message || 'Thao tác wishlist thất bại');
            throw err;
        }
    };

    const clearWishlist = async () => {
        try {
            await wishlistService.clearWishlist();
            setWishlist({ items: [], totalItems: 0 });
            return true;
        } catch (err) {
            setError(err.response?.data?.message || 'Xóa wishlist thất bại');
            throw err;
        }
    };

    const value = {
        wishlist,
        loading,
        error,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        clearWishlist,
        fetchWishlist
    };

    return (
        <WishlistContext.Provider value={value}>
            {children}
        </WishlistContext.Provider>
    );
};