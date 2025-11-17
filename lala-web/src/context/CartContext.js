"use client";

import React, { createContext, useContext, useState } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);

    const addToCart = (newItem) => {
        setCart((prevCart) => {
            const index = prevCart.findIndex(
                (i) => i.id === newItem.id && i.day === newItem.day
            );

            if (index > -1) {
                // immutable update
                return prevCart.map((item, idx) =>
                    idx === index
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }

            return [...prevCart, { ...newItem, quantity: 1 }];
        });
    };

    const updateQuantity = (id, day, delta) => {
        setCart((prevCart) => {
            return prevCart
                .map((item) => {
                    if (item.id === id && item.day === day) {
                        const newQty = item.quantity + delta;
                        if (newQty <= 0) return null; // remove item
                        return { ...item, quantity: newQty }; // immutable
                    }
                    return item;
                })
                .filter(Boolean);
        });
    };

    const getTotal = () =>
        cart.reduce((total, item) => total + item.price * item.quantity, 0);

    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);

    const clearCart = () => {
        setCart([]);
    };

    return (
        <CartContext.Provider
            value={{ cart, addToCart, updateQuantity, getTotal, totalItems, clearCart }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error("useCart must be used within CartProvider");
    return ctx;
};

export default CartContext;
