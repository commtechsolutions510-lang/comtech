import { useEffect, useState, useCallback } from 'react';
import { Search, Eye, X } from 'lucide-react';
import { adminApi } from '../../lib/adminApi';
import type { AdminCustomer, PaginatedResponse } from '../../types';

interface CustomerOrder {
  id: string;
  orderNumber: string;
  date: string;
  total: number;
  status: string;
}

export function AdminCustomers() {
  const [customers, setCustomers] = useState<PaginatedResponse<AdminCustomer> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState<AdminCustomer | null>(null);
  const [customerOrders, setCustomerOrders] = useState<CustomerOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      params.set('page', page.toString());
      const data = await adminApi.get<PaginatedResponse<AdminCustomer>>(`/customers?${params.toString()}`);
      setCustomers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const openCustomerModal = async (customer: AdminCustomer) => {
    setSelectedCustomer(customer);
    setOrdersLoading(true);
    try {
      const data = await adminApi.get<{ orders: any[] }>(`/customers/${customer.id}`);
      const orders = (data.orders || []).map((o: any) => ({
        id: o.id,
        orderNumber: o.orderNumber || o.id.slice(0, 8),
        date: new Date(o.createdAt).toLocaleDateString(),
        total: parseFloat(o.total.toString()),
        status: o.status,
      }));
      setCustomerOrders(orders);
    } catch {
      setCustomerOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
        <p className="mt-1 text-sm text-gray-500">Manage your customer base</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search customers by name or email..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
            />
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border-b border-red-200 text-red-700 text-sm">{error}</div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 font-medium">
              <tr>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Orders</th>
                <th className="px-4 py-3">Total Spending</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">Loading...</td></tr>
              ) : customers?.data.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">No customers found</td></tr>
              ) : (
                customers?.data.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-900 font-semibold text-sm">
                          {customer.name.charAt(0)}
                        </div>
                        <p className="font-medium text-gray-900">{customer.name}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{customer.email}</td>
                    <td className="px-4 py-3 text-gray-600">{customer.phone}</td>
                    <td className="px-4 py-3 text-gray-600">{customer.orders}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">GH₵{customer.spending.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        customer.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {customer.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => openCustomerModal(customer)}
                        className="p-1.5 rounded hover:bg-gray-100 text-gray-600 hover:text-slate-900"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {customers && customers.totalPages > 1 && (
          <div className="p-4 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-500">Page {customers.page} of {customers.totalPages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-gray-50">Previous</button>
              <button onClick={() => setPage(p => Math.min(customers.totalPages, p + 1))} disabled={page === customers.totalPages} className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-gray-50">Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Customer Detail Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => { setSelectedCustomer(null); setCustomerOrders([]); }}>
          <div className="w-full max-w-lg bg-white rounded-xl shadow-xl p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Customer Details</h2>
              <button onClick={() => { setSelectedCustomer(null); setCustomerOrders([]); }} className="p-2 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-900 font-bold text-lg">
                  {selectedCustomer.name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{selectedCustomer.name}</p>
                  <p className="text-sm text-gray-500">Joined {selectedCustomer.joined}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-gray-900">{selectedCustomer.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium text-gray-900">{selectedCustomer.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Orders</p>
                  <p className="font-medium text-gray-900">{selectedCustomer.orders}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Spending</p>
                  <p className="font-medium text-gray-900">GH₵{selectedCustomer.spending.toFixed(2)}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Order History</h3>
                {ordersLoading ? (
                  <p className="text-sm text-gray-500">Loading orders...</p>
                ) : customerOrders.length === 0 ? (
                  <p className="text-sm text-gray-500">No orders yet</p>
                ) : (
                  <div className="space-y-2">
                    {customerOrders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-gray-900">#{order.orderNumber}</p>
                          <p className="text-xs text-gray-500">{order.date}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">GH₵{order.total.toFixed(2)}</p>
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                            order.status === 'completed' ? 'bg-green-100 text-green-800' :
                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
