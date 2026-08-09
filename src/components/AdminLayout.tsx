import React from 'react';
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingBag,
  Repeat,
  Truck,
  CreditCard,
  BarChart3,
  Settings,
  LifeBuoy
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onSelectTab: (tab: string) => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children, activeTab, onSelectTab }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'ecom_orders', label: 'Store Orders', icon: ShoppingBag },
    { id: 'service_tickets', label: 'Service Desk', icon: LifeBuoy },
    { id: 'subscriptions', label: 'Subscriptions', icon: Repeat },
    { id: 'deliveries', label: 'Deliveries', icon: Truck },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];


  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-[#FDFCF9]">
      {/* Desktop Sidebar */}
      <aside className="w-60 bg-white border-r border-[#E5E7EB] p-4 hidden md:block shrink-0">
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#52796F] px-3 block mb-2">
            Dairy OS Management
          </span>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                  isActive
                    ? 'bg-[#F7F9F7] text-[#1B4332] font-bold'
                    : 'text-[#52796F] hover:bg-[#F7F9F7] hover:text-[#1B4332]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#1B4332]' : 'text-[#52796F]'}`} />
                {item.label}
              </button>
            );
          })}
        </div>
      </aside>

      {/* Mobile Top Navigation Tabs Horizontal Scroll */}
      <div className="md:hidden sticky top-16 z-30 bg-white border-b border-[#E5E7EB] px-4 py-2 overflow-x-auto flex gap-1.5 scrollbar-none w-full">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-[#1B4332] text-white shadow-xs'
                  : 'bg-[#F7F9F7] text-[#52796F] hover:bg-[#E5E7EB]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Main Content Pane */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">{children}</main>
    </div>
  );
};
