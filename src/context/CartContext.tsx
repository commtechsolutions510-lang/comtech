import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { CartItem } from '../types';
import { api } from '../lib/api';

interface CartContextValue {
  items: CartItem[];
  isLoading: boolean;
  isAuthenticated: boolean;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (productId: string, variantId?: string, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  refreshCart: () => Promise<void>;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem('customer_token'));
  const [isCartOpen, setIsCartOpen] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!localStorage.getItem('customer_token')) {
      setItems([]);
      setIsAuthenticated(false);
      return;
    }
    setIsAuthenticated(true);
    setIsLoading(true);
    try {
      const data = await api.get('/cart');
      setItems(data);
    } catch {
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addItem = async (productId: string, variantId?: string, quantity = 1) => {
    if (!localStorage.getItem('customer_token')) {
      window.location.href = '/login';
      return;
    }
    await api.post('/cart', { productId, variantId, quantity });
    await refreshCart();
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity < 1) return;
    await api.patch(`/cart/${itemId}`, { quantity });
    await refreshCart();
  };

  const removeItem = async (itemId: string) => {
    await api.delete(`/cart/${itemId}`);
    setItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const clearCart = () => setItems([]);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  return (
    <CartContext.Provider value={{ items, isLoading, isAuthenticated, isCartOpen, openCart, closeCart, addItem, updateQuantity, removeItem, refreshCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
