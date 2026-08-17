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

const GUEST_CART_KEY = 'guest_cart';

function getGuestCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(GUEST_CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setGuestCart(items: CartItem[]) {
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem('customer_token'));
  const [isCartOpen, setIsCartOpen] = useState(false);

  const refreshCart = useCallback(async () => {
    const token = localStorage.getItem('customer_token');
    if (!token) {
      setItems(getGuestCart());
      setIsAuthenticated(false);
      return;
    }
    setIsAuthenticated(true);
    setIsLoading(true);
    try {
      const data = await api.get('/cart');
      setItems(data);
      setGuestCart([]);
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
    const token = localStorage.getItem('customer_token');
    if (!token) {
      const guestItems = getGuestCart();
      const existing = guestItems.find(i => i.productId === productId && i.variantId === variantId);
      if (existing) {
        existing.quantity += quantity;
      } else {
        guestItems.push({ id: `guest-${Date.now()}`, productId, variantId, quantity, product: {} as any, variant: undefined });
      }
      setGuestCart(guestItems);
      setItems(guestItems);
      return;
    }
    await api.post('/cart', { productId, variantId, quantity });
    await refreshCart();
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    const token = localStorage.getItem('customer_token');
    if (!token) {
      const guestItems = getGuestCart();
      const item = guestItems.find(i => i.id === itemId);
      if (item) {
        item.quantity = quantity;
        setGuestCart(guestItems);
        setItems(guestItems);
      }
      return;
    }
    await api.patch(`/cart/${itemId}`, { quantity });
    await refreshCart();
  };

  const removeItem = async (itemId: string) => {
    const token = localStorage.getItem('customer_token');
    if (!token) {
      const guestItems = getGuestCart().filter(i => i.id !== itemId);
      setGuestCart(guestItems);
      setItems(guestItems);
      return;
    }
    await api.delete(`/cart/${itemId}`);
    setItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const clearCart = () => {
    setItems([]);
    setGuestCart([]);
  };

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
