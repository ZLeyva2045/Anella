// src/hooks/useCart.tsx
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { Product } from '@/types/firestore';
import type { SelectedCustomization } from '@/app/products/[id]/page';

export interface CartItem extends Product {
  quantity: number;
  customizations?: SelectedCustomization;
  cartItemId: string; // Unique ID for this specific item instance in the cart
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product & { customizations?: SelectedCustomization }, quantity: number) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  
  useEffect(() => {
    // Cargar carrito desde localStorage al iniciar
    const savedCart = localStorage.getItem('anellaCart');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, []);

  useEffect(() => {
    // Guardar carrito en localStorage cada vez que cambie
    if(cartItems.length > 0) {
      localStorage.setItem('anellaCart', JSON.stringify(cartItems));
    } else {
      localStorage.removeItem('anellaCart');
    }
  }, [cartItems]);

  const addToCart = (product: Product & { customizations?: SelectedCustomization }, quantity: number) => {
    setCartItems(prevItems => {
      // Create a unique identifier for this cart item instance
      const cartItemId = `${product.id}-${Date.now()}`;
      const newItem: CartItem = { 
        ...product, 
        quantity, 
        cartItemId 
      };
      return [...prevItems, newItem];
    });
  };

  const removeFromCart = (cartItemId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.cartItemId !== cartItemId));
  };

  const updateQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.cartItemId === cartItemId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };
  
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);


  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartCount,
    totalPrice
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart debe ser usado dentro de un CartProvider');
  }
  return context;
};
