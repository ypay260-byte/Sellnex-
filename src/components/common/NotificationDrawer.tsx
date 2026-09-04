import React from 'react';
import { useApp } from '../../context/AppContext';
import { Bell, X, CheckCheck, ShoppingBag, CreditCard, Box, Truck, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const { notifications, markNotificationRead, markAllNotificationsRead, navigateTo } = useApp();

  if (!isOpen) return null;

  const handleNotificationClick = (id: string, link?: string) => {
    markNotificationRead(id);
    if (link) {
      navigateTo(link);
      onClose();
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <ShoppingBag className="w-4 h-4 text-blue-600" />;
      case 'payment':
        return <CreditCard className="w-4 h-4 text-emerald-600" />;
      case 'inventory':
        return <Box className="w-4 h-4 text-amber-600" />;
      case 'delivery':
        return <Truck className="w-4 h-4 text-indigo-600" />;
      default:
        return <Bell className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div id="notification-drawer-backdrop" className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, x: 300 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 300 }}
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-slate-200"
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-slate-800" />
            <h3 className="font-bold text-slate-900 text-base">Notifications</h3>
            <span className="text-xs bg-blue-100 text-blue-700 font-semibold px-2 py-0.5 rounded-full">
              {notifications.filter((n) => !n.read).length} new
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              id="mark-all-read-btn"
              onClick={markAllNotificationsRead}
              title="Mark all as read"
              className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium px-2 py-1 rounded hover:bg-blue-50"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark all read</span>
            </button>
            <button
              id="close-notifications-btn"
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {notifications.length === 0 ? (
            <div className="p-10 text-center text-slate-400">
              <Bell className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p className="text-sm">No notifications</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                id={`notif-item-${n.id}`}
                onClick={() => handleNotificationClick(n.id, n.link)}
                className={`p-4 transition-colors cursor-pointer flex items-start gap-3 hover:bg-slate-50 ${
                  !n.read ? 'bg-blue-50/50' : ''
                }`}
              >
                <div className={`p-2 rounded-xl shrink-0 ${!n.read ? 'bg-white shadow-xs' : 'bg-slate-100'}`}>
                  {getIcon(n.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className={`text-sm font-semibold ${!n.read ? 'text-slate-900' : 'text-slate-700'}`}>
                      {n.title}
                    </p>
                    <span className="text-[11px] text-slate-400 shrink-0">{n.timestamp}</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>
                </div>
                {!n.read && <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-1.5" />}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-100 bg-slate-50 text-center">
          <p className="text-xs text-slate-500">
            Real-time updates for orders, Click/Payme payments, and dropshipping fulfillment.
          </p>
        </div>
      </motion.div>
    </div>
  );
};
