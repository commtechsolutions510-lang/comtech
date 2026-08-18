import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const { items, updateQuantity, removeItem, isLoading } = useCart();

  const subtotal = items.reduce((sum, item) => {
    const price = item.variant?.price ?? item.product.basePrice;
    return sum + price * item.quantity;
  }, 0);

  const deliveryFee = subtotal > 500 ? 0 : 25;
  const discount = 0;
  const total = subtotal + deliveryFee - discount;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b border-[#E5E7EB]">
              <h2 className="text-xl font-bold text-[#0B1F3A]">Shopping Cart</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-[#F5F7FA] transition-colors"
                aria-label="Close cart"
              >
                <X className="w-5 h-5 text-[#172033]" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {isLoading ? (
                <div className="flex items-center justify-center h-40">
                  <div className="w-8 h-8 border-2 border-[#1677FF] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
                  <h3 className="text-lg font-semibold text-[#0B1F3A] mb-2">Your cart is empty</h3>
                  <p className="text-sm text-gray-500 mb-6">Looks like you have not added any items yet.</p>
                  <Link
                    to="/products"
                    onClick={onClose}
                    className="inline-flex items-center justify-center px-6 py-3 bg-[#1677FF] text-white font-semibold rounded-lg hover:bg-[#0f6ae7] transition-colors"
                  >
                    Continue Shopping
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {items.map((item) => {
                    const price = item.variant?.price ?? item.product.basePrice;
                    const image = item.product.images?.[0]?.url || item.product.image;
                    const variantLabel = item.variant?.optionValues?.map(ov => `${ov.option.name}: ${ov.value}`).join(', ') || '';
                    return (
                      <div key={item.id} className="flex gap-4">
                        <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0 border border-[#E5E7EB]">
                          <img src={image} alt={item.product.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-[#0B1F3A] truncate">{item.product.name}</h4>
                          {variantLabel && (
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{variantLabel}</p>
                          )}
                          <p className="text-sm font-medium text-[#1677FF] mt-1">GH₵{price.toFixed(2)}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <div className="flex items-center border border-[#E5E7EB] rounded-lg">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="p-1.5 hover:bg-[#F5F7FA] transition-colors"
                                aria-label="Decrease quantity"
                              >
                                <Minus className="w-4 h-4 text-[#172033]" />
                              </button>
                              <span className="px-3 text-sm font-medium text-[#172033]">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="p-1.5 hover:bg-[#F5F7FA] transition-colors"
                                aria-label="Increase quantity"
                              >
                                <Plus className="w-4 h-4 text-[#172033]" />
                              </button>
                            </div>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-xs text-red-500 hover:text-red-600 font-medium"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-[#0B1F3A]">GH₵{(price * item.quantity).toFixed(2)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className="p-6 border-t border-[#E5E7EB] space-y-3">
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
                <div className="flex justify-between text-base font-bold text-[#0B1F3A] pt-2 border-t border-[#E5E7EB]">
                  <span>Total</span>
                  <span>GH₵{total.toFixed(2)}</span>
                </div>
                <Link
                  to="/checkout"
                  onClick={onClose}
                  className="w-full inline-flex items-center justify-center px-6 py-3 bg-[#0B1F3A] text-white font-semibold rounded-lg hover:bg-[#112b4d] transition-colors"
                >
                  Proceed to Checkout
                </Link>
                <button
                  onClick={onClose}
                  className="w-full text-sm text-[#1677FF] hover:text-[#0f6ae7] font-medium"
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
