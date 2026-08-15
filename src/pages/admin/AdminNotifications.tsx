import { Bell, CheckCheck } from 'lucide-react';

const mockNotifications = [
  { id: 1, title: 'New order received', message: 'Order #1234 has been placed by John Doe', time: '5 minutes ago', read: false },
  { id: 2, title: 'Low stock alert', message: 'Wireless Headphones is running low on stock (3 remaining)', time: '1 hour ago', read: false },
  { id: 3, title: 'New customer registered', message: 'Sarah Smith created a new account', time: '3 hours ago', read: true },
  { id: 4, title: 'Order shipped', message: 'Order #1230 has been shipped', time: '5 hours ago', read: true },
];

export function AdminNotifications() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        <p className="mt-1 text-sm text-gray-500">Stay updated with platform activity</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y divide-gray-200">
        {mockNotifications.map((notification) => (
          <div
            key={notification.id}
            className={`p-4 flex gap-4 hover:bg-gray-50 transition-colors ${notification.read ? 'opacity-60' : ''}`}
          >
            <div className={`p-2 rounded-lg ${notification.read ? 'bg-gray-100' : 'bg-blue-50'}`}>
              <Bell className={`w-5 h-5 ${notification.read ? 'text-gray-500' : 'text-blue-600'}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">{notification.title}</h3>
                <span className="text-xs text-gray-500 whitespace-nowrap ml-4">{notification.time}</span>
              </div>
              <p className="mt-1 text-sm text-gray-600">{notification.message}</p>
            </div>
            {!notification.read && (
              <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-slate-900 h-fit">
                <CheckCheck className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
