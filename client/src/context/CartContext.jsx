import React, { createContext, useContext, useState, useEffect } from "react";
import axios from 'axios';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [itemCount, setItemCount] = useState(0);

    const updateItemCount = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:8000/api/cart/items/count', { //localhost
                params: {
                    userId: user ? user.id : null,
                    token: token || null
                }
            });
            setItemCount(response.data.itemCount);
        } catch (error) {
            console.error('Error fetching cart item count:', error);
        }
    };

    useEffect(() => {
        updateItemCount();
    }, []);

    return (
        <CartContext.Provider value={{ itemCount, updateItemCount }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    return useContext(CartContext);
};
