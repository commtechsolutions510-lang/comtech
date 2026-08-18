import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { api } from '../lib/api';
import type { CartItem } from '../types';
import { useCart } from '../context/CartContext';

export function Cart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated, refreshCart } = useCart();

  useEffect(() => {
    setIsLoading(true);
    const token = localStorage.getItem('customer_token');
    if (token) {
      api.get('/cart')
        .then(setItems)
        .catch(() => setItems([]))
        .finally(() => setIsLoading(false));
    } else {
      setItems(useCart().items);
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity < 1) return;
    try {
      await api.patch(`/cart/${itemId}`, { quantity });
      setItems((prev) => prev.map((item) => (item.id === itemId ? { ...item, quantity } : item)));
      refreshCart();
    } catch {
      // handle error silently
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      await api.delete(`/cart/${itemId}`);
      setItems((prev) => prev.filter((item) => item.id !== itemId));
      refreshCart();
    } catch {
      // handle error silently
    }
  };

  const subtotal = items.reduce((sum, item) => {
    const price = item.variant?.price ?? item.product.basePrice;
    return sum + price * item.quantity;
  }, 0);

  const deliveryFee = subtotal > 500 ? 0 : 25;
  const discount = 0;
  const total = subtotal + deliveryFee - discount;

  if (isLoading) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#1677FF] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-white min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-[#0B1F3A] mb-4">Your Cart is Empty</h1>
          <p className="text-gray-600 mb-8">Looks like you have not added any items yet.</p>
          <Link to="/products" className="inline-flex items-center justify-center px-6 py-3 bg-[#1677FF] text-white font-semibold rounded-lg hover:bg-[#0f6ae7] transition-colors">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <section className="bg-[#F5F7FA] border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 md:py-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-block px-3 py-1 mb-4 text-xs font-semibold tracking-wider uppercase bg-white text-[#0B1F3A] rounded-full border border-[#E5E7EB]">
              Cart
            </span>
            <h1 className="text-[clamp(2rem,8vw,3rem)] font-bold text-[#0B1F3A] tracking-tight leading-tight">
              Shopping Cart
            </h1>
            <p className="mt-4 text-base sm:text-lg text-[#172033] max-w-2xl leading-relaxed">
              {items.length} item{items.length !== 1 ? 's' : ''} in your cart
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-10 sm:py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => {
                const price = item.variant?.price ?? item.product.basePrice;
                const image = item.product.images?.[0]?.url || item.product.image;
                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col sm:flex-row gap-4 p-4 bg-white border border-[#E5E7EB] rounded-xl shadow-sm"
                  >
                    <div className="w-full sm:w-24 h-48 sm:h-24 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0 border border-[#E5E7EB]">
                      <img src={image} alt={item.product.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                      <div>
                        <h3 className="text-base font-semibold text-[#0B1F3A]">{item.product.name}</h3>
                        {item.variant?.optionValues && item.variant.optionValues.length > 0 && (
                          <p className="text-sm text-gray-500 mt-0.5">
                            {item.variant.optionValues.map(ov => `${ov.option.name}: ${ov.value}`).join(', ')}
                          </p>
                        )}
                        <p className="text-sm font-medium text-[#1677FF] mt-1">GH₵{price.toFixed(2)}</p>
                      </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="self-start p-2 text-gray-400 hover:text-red-500 transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center border border-[#E5E7EB] rounded-lg">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-2 hover:bg-[#F5F7FA] transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-4 h-4 text-[#172033]" />
                          </button>
                          <span className="px-4 text-sm font-medium text-[#172033]">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-2 hover:bg-[#F5F7FA] transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-4 h-4 text-[#172033]" />
                          </button>
                        </div>
                        <p className="text-base font-bold text-[#0B1F3A]">GH₵{(price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div className="lg:col-span-1">
              <div className="bg-[#F5F7FA] p-6 rounded-xl border border-[#E5E7EB] sticky top-24">
                <h3 className="text-lg font-bold text-[#0B1F3A] mb-4">Cart Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Subtotal</span>
                    <span>GH₵{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Delivery</span>
                    <span>{deliveryFee === 0 ? 'Free' : `GH₵${deliveryFee.toFixed(2)}`}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount</span>
                      <span>-GH₵{discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-bold text-[#0B1F3A] pt-3 border-t border-[#E5E7EB]">
                    <span>Total</span>
                    <span>GH₵{total.toFixed(2)}</span>
                  </div>
                </div>
                <Link to="/checkout" className="w-full mt-6 inline-flex items-center justify-center px-6 py-3 bg-[#0B1F3A] text-white font-semibold rounded-lg hover:bg-[#112b4d] transition-colors">
                  Proceed to Checkout
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
                <Link to="/products" className="w-full mt-3 inline-flex items-center justify-center px-6 py-3 border border-[#E5E7EB] text-[#172033] font-semibold rounded-lg hover:bg-white transition-colors">
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
