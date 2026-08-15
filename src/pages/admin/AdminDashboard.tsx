import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { adminApi } from '../../lib/adminApi';
import type { DashboardStats } from '../../types';

function StatCard({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  color,
}: {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'up' | 'down';
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
          {change && (
            <div className={`mt-2 flex items-center gap-1 text-sm font-medium ${changeType === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {changeType === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              {change}
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </motion.div>
  );
}

export function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await adminApi.get<DashboardStats>('/dashboard');
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-6">
        {error}
      </div>
    );
  }

  if (!stats) return null;

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Welcome to your admin dashboard</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Sales"
          value={formatCurrency(stats.sales.total)}
          change="+12.5%"
          changeType="up"
          icon={DollarSign}
          color="bg-green-500"
        />
        <StatCard
          title="Today's Sales"
          value={formatCurrency(stats.sales.today)}
          change="+5.2%"
          changeType="up"
          icon={TrendingUp}
          color="bg-blue-500"
        />
        <StatCard
          title="Weekly Sales"
          value={formatCurrency(stats.sales.weekly)}
          change="+8.1%"
          changeType="up"
          icon={DollarSign}
          color="bg-purple-500"
        />
        <StatCard
          title="Monthly Sales"
          value={formatCurrency(stats.sales.monthly)}
          change="+15.3%"
          changeType="up"
          icon={DollarSign}
          color="bg-orange-500"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Orders"
          value={stats.orders.total}
          change="+4.2%"
          changeType="up"
          icon={ShoppingCart}
          color="bg-indigo-500"
        />
        <StatCard
          title="Pending Orders"
          value={stats.orders.pending}
          icon={ShoppingCart}
          color="bg-yellow-500"
        />
        <StatCard
          title="Processing Orders"
          value={stats.orders.processing}
          icon={ShoppingCart}
          color="bg-sky-500"
        />
        <StatCard
          title="Completed Orders"
          value={stats.orders.completed}
          change="+12.3%"
          changeType="up"
          icon={ShoppingCart}
          color="bg-emerald-500"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Total Customers"
          value={stats.customers.total}
          change="+8.4%"
          changeType="up"
          icon={Users}
          color="bg-pink-500"
        />
        <StatCard
          title="New Customers"
          value={stats.customers.new}
          change="+15.6%"
          changeType="up"
          icon={Users}
          color="bg-teal-500"
        />
        <StatCard
          title="Total Products"
          value={stats.products.total}
          change="+2.1%"
          changeType="up"
          icon={Package}
          color="bg-violet-500"
        />
      </div>
    </div>
  );
}
