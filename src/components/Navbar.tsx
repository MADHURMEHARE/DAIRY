import React, { useState, useEffect } from 'react';
import { Bell, Shield, Truck, User as UserIcon, LogIn, RefreshCw } from 'lucide-react';
import { UserRole, NotificationItem, User } from '../types';
import { ApiClient } from '../api/client';

interface NavbarProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  activeTab?: string;
  currentUser?: User | null;
  onOpenAuth?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentRole, onRoleChange, currentUser, onOpenAuth }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotifDrawer, setShowNotifDrawer] = useState(false);


  useEffect(() => {
    fetchNotifications();
  }, [currentRole]);

  const fetchNotifications = async () => {
    try {
      const data = await ApiClient.getNotifications(currentRole === 'CUSTOMER' ? 'cust_rahul_01' : undefined);
      setNotifications(data);
    } catch (e) {
      // ignore error
    }
  };

  const markRead = async (id: string) => {
    await ApiClient.markNotificationRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <header className="bg-white border-b border-[#E5E7EB] sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand & Store Name */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#1B4332] text-white flex items-center justify-center font-black text-xl shadow-xs shrink-0">
            🥛
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-[#081C15] text-lg tracking-tight">Anandwan Milk Dairy</span>
              <span className="text-[10px] font-bold uppercase tracking-widest bg-[#D8E2DC] text-[#1B4332] px-2 py-0.5 rounded-md">
                Live
              </span>
            </div>
            <p className="text-xs text-[#52796F] hidden sm:block">Anandwan Dairy • Amravati, MH</p>
          </div>
        </div>

        {/* Right Actions: Notifications & User Account */}
        <div className="flex items-center gap-3">
          {/* Active Role Badge */}
          <div className="hidden md:flex items-center gap-1.5 bg-[#F7F9F7] px-3 py-1.5 rounded-xl border border-[#E5E7EB] text-xs font-bold text-[#1B4332]">
            <Shield className="w-3.5 h-3.5 text-[#2D6A4F]" />
            <span>
              {currentRole === 'MASTER_ADMIN'
                ? 'Master Admin'
                : currentRole === 'ADMIN'
                ? 'Dairy Owner'
                : currentRole === 'DELIVERY_STAFF'
                ? 'Delivery Staff'
                : 'Customer Portal'}
            </span>
          </div>

          {/* Notifications button */}
          <div className="relative">
            <button
              onClick={() => setShowNotifDrawer(!showNotifDrawer)}
              className="p-2 text-[#52796F] hover:text-[#081C15] hover:bg-[#F7F9F7] rounded-xl transition-colors relative"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#D97706] text-white font-bold text-[10px] rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Drawer Popover */}
            {showNotifDrawer && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-[#E5E7EB] z-50 p-4 animate-in fade-in zoom-in-95 duration-100">
                <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
                  <h4 className="font-bold text-sm text-[#081C15]">Notifications</h4>
                  <button
                    onClick={fetchNotifications}
                    className="text-xs text-[#1B4332] font-semibold hover:underline flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" /> Refresh
                  </button>
                </div>

                <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto mt-2 space-y-2">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-[#52796F] py-6 text-center">No notifications yet</p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => markRead(n.id)}
                        className={`pt-2 text-xs cursor-pointer hover:bg-[#F7F9F7] p-2 rounded-xl transition-colors ${
                          !n.isRead ? 'bg-[#F1F3F2] font-medium' : ''
                        }`}
                      >
                        <div className="flex justify-between items-start gap-1">
                          <span className="font-bold text-[#081C15]">{n.title}</span>
                          <span className="text-[10px] text-[#52796F] whitespace-nowrap">{n.createdAt}</span>
                        </div>
                        <p className="text-[#52796F] text-[11px] mt-0.5">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Account / Auth button */}
          <div className="flex items-center gap-2 pl-2 border-l border-[#E5E7EB]">
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-2 text-left hover:bg-[#F7F9F7] p-1.5 rounded-xl transition-colors cursor-pointer group"
              title="Click to Sign In or Switch Account"
            >
              <div className="w-8 h-8 rounded-full bg-[#1B4332] text-white font-bold text-xs flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                {currentUser?.name
                  ? currentUser.name.slice(0, 2).toUpperCase()
                  : <UserIcon className="w-4 h-4 text-white" />}
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-xs font-bold text-[#081C15] leading-none group-hover:text-[#1B4332]">
                  {currentUser?.name || 'Sign In / Account'}
                </p>
                <p className="text-[10px] text-[#52796F] font-medium mt-0.5 flex items-center gap-1">
                  <LogIn className="w-2.5 h-2.5 text-[#1B4332]" />
                  <span>{currentUser ? 'Switch Account' : 'Sign In / Register'}</span>
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

