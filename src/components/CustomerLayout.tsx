import React from 'react';
import { Home, ShoppingBag, PackageCheck, FileText, Repeat, User, LifeBuoy } from 'lucide-react';

interface CustomerLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  cartCount?: number;
}

export const CustomerLayout: React.FC<CustomerLayoutProps> = ({ children, activeTab, onSelectTab, cartCount = 0 }) => {
  const bottomItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'shop', label: 'Store', icon: ShoppingBag, badge: cartCount },
    { id: 'orders', label: 'Orders', icon: PackageCheck },
    { id: 'subscription', label: 'Milk Sub', icon: Repeat },
    { id: 'bills', label: 'Bills', icon: FileText },
    { id: 'service', label: 'Support', icon: LifeBuoy },
    { id: 'account', label: 'Account', icon: User },
  ];


  return (
    <div className="min-h-[calc(100vh-4rem)] pb-20 bg-[#FDFCF9]">
      <main className="p-4 sm:p-6">{children}</main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E5E7EB] py-2 px-4 shadow-lg">
        <div className="max-w-md mx-auto flex items-center justify-around">
          {bottomItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-xl transition-all relative ${
                  isActive ? 'text-[#1B4332] font-bold scale-105' : 'text-[#52796F] hover:text-[#081C15] font-medium'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'text-[#1B4332]' : 'text-[#52796F]'}`} />
                  {Boolean(item.badge && item.badge > 0) && (
                    <span className="absolute -top-1.5 -right-2 bg-red-600 text-white font-bold text-[9px] w-4 h-4 rounded-full flex items-center justify-center border border-white animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px]">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
