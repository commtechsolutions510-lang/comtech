import { useEffect, useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Package, CreditCard, Truck } from 'lucide-react';
import { Button } from '../components/Button';
import { api } from '../lib/api';
import type { Order } from '../types';

export function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isAuthenticated = !!localStorage.getItem('customer_token');

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    api.get(`/orders/${id}`)
      .then(setOrder)
      .catch(() => setOrder(null))
      .finally(() => setIsLoading(false));
  }, [id]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

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
          <Button to="/account/orders">Back to Orders</Button>
        </div>
      </div>
    );
  }

  const timeline = [
    { label: 'Order Placed', date: new Date(order.createdAt).toLocaleString('en-GB'), done: true },
    { label: 'Processing', date: order.status === 'pending' ? 'Pending' : new Date(order.updatedAt).toLocaleString('en-GB'), done: ['processing', 'shipped', 'delivered'].includes(order.status) },
    { label: 'Shipped', date: ['shipped', 'delivered'].includes(order.status) ? new Date(order.updatedAt).toLocaleString('en-GB') : 'Pending', done: ['shipped', 'delivered'].includes(order.status) },
    { label: 'Delivered', date: order.status === 'delivered' ? new Date(order.updatedAt).toLocaleString('en-GB') : 'Pending', done: order.status === 'delivered' },
  ];

  return (
    <div className="bg-white min-h-screen">
      <section className="bg-[#F5F7FA] border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <Link to="/account/orders" className="inline-flex items-center text-sm text-[#1677FF] hover:text-[#0f6ae7] mb-6">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Orders
          </Link>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-block px-3 py-1 mb-4 text-xs font-semibold tracking-wider uppercase bg-white text-[#0B1F3A] rounded-full border border-[#E5E7EB]">
              Order Details
            </span>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <h1 className="text-3xl md:text-4xl font-bold text-[#0B1F3A] tracking-tight">
                {order.orderNumber}
              </h1>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {order.status}
              </span>
            </div>
            <p className="mt-2 text-sm text-gray-500">Placed on {new Date(order.createdAt).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </motion.div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-[#F5F7FA] p-6 rounded-xl border border-[#E5E7EB]">
                <h3 className="font-semibold text-[#0B1F3A] mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5 text-[#1677FF]" />
                  Products
                </h3>
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0 border border-[#E5E7EB]">
                        <img src={item.product?.images?.[0]?.url || '/images/products/placeholder.jpg'} alt={item.productName} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-[#0B1F3A]">{item.productName}</p>
                        {item.variantLabel && <p className="text-sm text-gray-500">{item.variantLabel}</p>}
                        <p className="text-sm text-gray-500">Qty: {item.quantity} x GH₵{item.unitPrice.toFixed(2)}</p>
                      </div>
                      <p className="font-semibold text-[#0B1F3A]">GH₵{item.subtotal.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#F5F7FA] p-6 rounded-xl border border-[#E5E7EB]">
                <h3 className="font-semibold text-[#0B1F3A] mb-4">Order Timeline</h3>
                <div className="space-y-4">
                  {timeline.map((event, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full ${event.done ? 'bg-green-500' : 'bg-gray-300'}`} />
                        {index < timeline.length - 1 && <div className="w-0.5 h-8 bg-gray-200 mt-1" />}
                      </div>
                      <div>
                        <p className={`text-sm font-medium ${event.done ? 'text-[#0B1F3A]' : 'text-gray-400'}`}>{event.label}</p>
                        <p className="text-xs text-gray-500">{event.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-1 space-y-6">
              <div className="bg-[#F5F7FA] p-6 rounded-xl border border-[#E5E7EB]">
                <h3 className="font-semibold text-[#0B1F3A] mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-[#1677FF]" />
                  Payment Info
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Method</span>
                    <span className="font-medium capitalize">{order.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Status</span>
                    <span className={`font-medium ${order.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>{order.paymentStatus}</span>
                  </div>
                  {order.paymentReference && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Reference</span>
                      <span className="font-medium text-xs">{order.paymentReference}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-[#F5F7FA] p-6 rounded-xl border border-[#E5E7EB]">
                <h3 className="font-semibold text-[#0B1F3A] mb-4 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-[#1677FF]" />
                  Delivery Info
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Method</span>
                    <span className="font-medium">{order.deliveryMethod === 'delivery' ? 'Home Delivery' : 'Store Pickup'}</span>
                  </div>
                  {order.deliveryAddress && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Address</span>
                      <span className="font-medium text-right max-w-[60%]">{order.deliveryAddress}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-[#F5F7FA] p-6 rounded-xl border border-[#E5E7EB]">
                <h3 className="font-semibold text-[#0B1F3A] mb-4">Totals</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Subtotal</span>
                    <span>GH₵{order.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Delivery</span>
                    <span>GH₵{order.deliveryFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-[#0B1F3A] pt-2 border-t border-[#E5E7EB]">
                    <span>Total</span>
                    <span>GH₵{order.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
