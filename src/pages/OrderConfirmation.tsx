import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Package, ArrowRight, Phone } from 'lucide-react';
import { Button } from '../components/Button';
import { api } from '../lib/api';
import type { Order } from '../types';

export function OrderConfirmation() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;
    api.get(`/orders/${orderId}`)
      .then(setOrder)
      .catch(() => setOrder(null))
      .finally(() => setIsLoading(false));
  }, [orderId]);

  if (isLoading) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#1677FF] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-[#0B1F3A] mb-4">Order Not Found</h1>
          <p className="text-gray-600 mb-8">We could not find this order.</p>
          <Button to="/products">Continue Shopping</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <section className="py-12 md:py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-[#0B1F3A] mb-2">Order Confirmed!</h1>
            <p className="text-gray-600">Thank you for your purchase. Your order has been placed successfully.</p>
          </motion.div>

          <div className="bg-[#F5F7FA] rounded-xl border border-[#E5E7EB] p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <p className="text-sm text-gray-500">Order Number</p>
                <p className="text-xl font-bold text-[#0B1F3A]">{order.orderNumber}</p>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-sm text-gray-500">Date</p>
                <p className="font-medium text-[#172033]">{new Date(order.createdAt).toLocaleDateString('en-GB')}</p>
              </div>
            </div>

            <div className="border-t border-[#E5E7EB] pt-6">
              <h3 className="font-semibold text-[#0B1F3A] mb-4">Products</h3>
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-[#172033]">{item.productName}</p>
                      {item.variantLabel && <p className="text-sm text-gray-500">{item.variantLabel}</p>}
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-medium text-[#0B1F3A]">GH₵{item.subtotal.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-[#E5E7EB] pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-[#0B1F3A] mb-2">Payment</h3>
                <p className="text-sm text-gray-600">Method: {order.paymentMethod === 'paystack' ? 'Paystack' : order.paymentMethod}</p>
                <p className="text-sm text-gray-600">Status: <span className={`font-medium ${order.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>{order.paymentStatus}</span></p>
              </div>
              <div>
                <h3 className="font-semibold text-[#0B1F3A] mb-2">Delivery</h3>
                <p className="text-sm text-gray-600">Method: {order.deliveryMethod === 'delivery' ? 'Home Delivery' : 'Store Pickup'}</p>
                <p className="text-sm text-gray-600">Fee: GH₵{order.deliveryFee.toFixed(2)}</p>
              </div>
            </div>

            <div className="border-t border-[#E5E7EB] pt-6 space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span>GH₵{order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Delivery</span>
                <span>GH₵{order.deliveryFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-[#0B1F3A] pt-2 border-t border-[#E5E7EB]">
                <span>Total</span>
                <span>GH₵{order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="mt-8 p-6 bg-[#F3F8FF] rounded-xl border border-[#E5E7EB]">
            <h3 className="font-semibold text-[#0B1F3A] mb-2">Next Steps</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>You will receive an email confirmation shortly.</li>
              <li>Our team will contact you to confirm your order.</li>
              <li>Delivery typically takes 1-3 business days.</li>
            </ul>
            <a
              href={`https://wa.me/233000000000?text=Hello, I just placed order ${order.orderNumber}`}
              className="inline-flex items-center mt-4 px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Phone className="w-4 h-4 mr-2" />
              Contact Us on WhatsApp
            </a>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Link to="/account/orders" className="flex-1">
              <Button to="/account/orders" variant="outline" className="w-full justify-center">
                <Package className="w-4 h-4 mr-2" />
                View My Orders
              </Button>
            </Link>
            <Link to="/products" className="flex-1">
              <Button to="/products" className="w-full justify-center">
                Continue Shopping
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
