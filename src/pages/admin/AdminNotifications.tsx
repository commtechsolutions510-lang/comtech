import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, CheckCheck, Trash2 } from 'lucide-react';
import { adminApi } from '../../lib/adminApi';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  createdAt: string;
}

export function AdminNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchNotifications = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await adminApi.get<Notification[]>('/notifications');
      setNotifications(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await adminApi.patch(`/notifications/${id}/read`, {});
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error('Failed to mark notification as read', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await adminApi.patch('/notifications/read-all', {});
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await adminApi.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      console.error('Failed to delete notification', err);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="mt-1 text-sm text-gray-500">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'All caught up'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition-colors"
          >
            <CheckCheck className="w-5 h-5" />
            Mark all as read
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">{error}</div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y divide-gray-200">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No notifications yet</div>
        ) : (
          notifications.map((notification) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 flex gap-4 hover:bg-gray-50 transition-colors ${notification.isRead ? 'opacity-60' : ''}`}
            >
              <div className={`p-2 rounded-lg ${notification.isRead ? 'bg-gray-100' : 'bg-blue-50'}`}>
                <Bell className={`w-5 h-5 ${notification.isRead ? 'text-gray-500' : 'text-blue-600'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900">{notification.title}</h3>
                  <span className="text-xs text-gray-500 whitespace-nowrap ml-4">
                    {new Date(notification.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-600">{notification.message}</p>
              </div>
              <div className="flex items-center gap-1">
                {!notification.isRead && (
                  <button
                    onClick={() => markAsRead(notification.id)}
                    className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-slate-900"
                    title="Mark as read"
                  >
                    <CheckCheck className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => deleteNotification(notification.id)}
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-red-600"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
