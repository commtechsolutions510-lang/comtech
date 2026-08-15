import { useState, useEffect } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Package, MapPin, LogOut } from 'lucide-react';
import { Button } from '../components/Button';
import { api } from '../lib/api';
import type { Customer, Order } from '../types';

type Tab = 'profile' | 'orders' | 'addresses';

export function Account() {
  const location = useLocation();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!localStorage.getItem('customer_token');

  useEffect(() => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    Promise.all([
      api.get('/customers').catch(() => null),
      api.get('/orders').catch(() => []),
    ]).then(([cust, ords]) => {
      if (cust) setCustomer(cust);
      if (ords) setOrders(ords);
    }).finally(() => setIsLoading(false));
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (isLoading) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#1677FF] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const tabs: { key: Tab; label: string; icon: typeof User }[] = [
    { key: 'profile', label: 'Profile', icon: User },
    { key: 'orders', label: 'Orders', icon: Package },
    { key: 'addresses', label: 'Addresses', icon: MapPin },
  ];

  return (
    <div className="bg-[#F5F7FA] min-h-screen">
      <section className="bg-white border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 md:py-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-block px-3 py-1 mb-4 text-xs font-semibold tracking-wider uppercase bg-[#F5F7FA] text-[#0B1F3A] rounded-full border border-[#E5E7EB]">
              Account
            </span>
            <h1 className="text-[clamp(2rem,8vw,3rem)] font-bold text-[#0B1F3A] tracking-tight leading-tight">
              My Account
            </h1>
            <p className="mt-4 text-base sm:text-lg text-[#172033] max-w-2xl leading-relaxed">
              Welcome back, {customer?.fullName || 'Customer'}
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-10 sm:py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <aside className="lg:col-span-1">
              <div className="bg-white p-4 rounded-xl border border-[#E5E7EB] sticky top-24">
                <nav className="space-y-1">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                          activeTab === tab.key
                            ? 'bg-[#F3F8FF] text-[#1677FF]'
                            : 'text-[#172033] hover:bg-[#F5F7FA]'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {tab.label}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => {
                      localStorage.removeItem('customer_token');
                      window.location.href = '/';
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </nav>
              </div>
            </aside>

            <div className="lg:col-span-3">
              <div className="bg-white p-6 sm:p-8 rounded-xl border border-[#E5E7EB] shadow-sm">
                {activeTab === 'profile' && customer && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <h2 className="text-lg font-bold text-[#0B1F3A] mb-6">Profile Information</h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Full Name</label>
                        <p className="text-[#172033] font-medium">{customer.fullName}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                        <p className="text-[#172033] font-medium">{customer.email}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Phone</label>
                        <p className="text-[#172033] font-medium">{customer.phone}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Member Since</label>
                        <p className="text-[#172033] font-medium">{new Date(customer.createdAt).toLocaleDateString('en-GB')}</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'orders' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <h2 className="text-lg font-bold text-[#0B1F3A] mb-6">Order History</h2>
                    {orders.length === 0 ? (
                      <div className="text-center py-12">
                        <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 mb-4">No orders yet</p>
                        <Link to="/products">
                          <Button size="sm">Start Shopping</Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {orders.map((order) => (
                          <Link
                            key={order.id}
                            to={`/account/orders/${order.id}`}
                            className="block p-4 border border-[#E5E7EB] rounded-lg hover:border-[#1677FF] transition-colors"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                              <div>
                                <p className="font-semibold text-[#0B1F3A]">{order.orderNumber}</p>
                                <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString('en-GB')}</p>
                              </div>
                              <div className="text-left sm:text-right">
                                <p className="font-bold text-[#0B1F3A]">GH₵{order.total.toFixed(2)}</p>
                                <p className={`text-xs font-medium ${order.status === 'delivered' ? 'text-green-600' : order.status === 'cancelled' ? 'text-red-600' : 'text-yellow-600'}`}>
                                  {order.status}
                                </p>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === 'addresses' && customer && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <h2 className="text-lg font-bold text-[#0B1F3A] mb-6">Saved Addresses</h2>
                    {customer.addresses.length === 0 ? (
                      <div className="text-center py-12">
                        <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 mb-4">No saved addresses</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {customer.addresses.map((address) => (
                          <div key={address.id} className="p-4 border border-[#E5E7EB] rounded-lg">
                            {address.label && <p className="font-medium text-[#0B1F3A]">{address.label}</p>}
                            <p className="text-sm text-gray-600 mt-1">
                              {address.street}, {address.area}, {address.city}, {address.region}
                            </p>
                            <p className="text-sm text-gray-500">{address.contactPhone}</p>
                            {address.isDefault && (
                              <span className="inline-block mt-2 px-2 py-1 bg-[#F3F8FF] text-[#1677FF] text-xs font-medium rounded">Default</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
