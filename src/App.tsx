import React, { useState, useEffect } from 'react';
import { UserRole, Product, CartItem, User } from './types';
import { Navbar } from './components/Navbar';
import { AdminLayout } from './components/AdminLayout';
import { CustomerLayout } from './components/CustomerLayout';
import { AuthModal } from './components/AuthModal';

// Admin Views
import { DashboardView } from './views/admin/DashboardView';
import { CustomersView } from './views/admin/CustomersView';
import { ProductsView } from './views/admin/ProductsView';
import { AdminEcommerceOrdersView } from './views/admin/AdminEcommerceOrdersView';
import { AdminServiceTicketsView } from './views/admin/AdminServiceTicketsView';
import { SubscriptionsView } from './views/admin/SubscriptionsView';
import { DeliveriesView } from './views/admin/DeliveriesView';
import { PaymentsView } from './views/admin/PaymentsView';
import { ReportsView } from './views/admin/ReportsView';
import { SettingsView } from './views/admin/SettingsView';

// Customer Views
import { CustomerHomeView } from './views/customer/CustomerHomeView';
import { CustomerShopView } from './views/customer/CustomerShopView';
import { CustomerOrdersView } from './views/customer/CustomerOrdersView';
import { CustomerDeliveriesView } from './views/customer/CustomerDeliveriesView';
import { CustomerBillsView } from './views/customer/CustomerBillsView';
import { CustomerSubscriptionView } from './views/customer/CustomerSubscriptionView';
import { CustomerServiceView } from './views/customer/CustomerServiceView';
import { CustomerAccountView } from './views/customer/CustomerAccountView';

// Master Admin View
import { MasterAdminView } from './views/master_admin/MasterAdminView';

// Delivery Staff View
import { DeliveryStaffView } from './views/delivery/DeliveryStaffView';

export default function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>('ADMIN');
  const [adminTab, setAdminTab] = useState<string>('dashboard');
  const [customerTab, setCustomerTab] = useState<string>('shop');
  const [cart, setCart] = useState<CartItem[]>([]);
  
  // Auth state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    // Load persisted user
    try {
      const saved = localStorage.getItem('anandwan_user');
      if (saved) {
        const u: User = JSON.parse(saved);
        setCurrentUser(u);
        setCurrentRole(u.role);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setCurrentRole(user.role);
    if (user.role === 'ADMIN') setAdminTab('dashboard');
    if (user.role === 'CUSTOMER') setCustomerTab('shop');
  };

  const handleAddToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handleUpdateCartQuantity = (productId: string, quantity: number) => {
    setCart((prev) => {
      if (quantity <= 0) {
        return prev.filter((item) => item.product.id !== productId);
      }
      return prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      );
    });
  };

  const handleClearCart = () => setCart([]);

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-[#FDFCF9] font-sans text-[#081C15] antialiased selection:bg-[#1B4332] selection:text-white">
      {/* Top Navbar with Role Switcher & Auth Modal Trigger */}
      <Navbar
        currentRole={currentRole}
        currentUser={currentUser}
        onOpenAuth={() => setShowAuthModal(true)}
        onRoleChange={(role) => {
          setCurrentRole(role);
          if (role === 'ADMIN') setAdminTab('dashboard');
          if (role === 'CUSTOMER') setCustomerTab('shop');
        }}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* MASTER ADMIN ROLE VIEW */}
      {currentRole === 'MASTER_ADMIN' && (
        <MasterAdminView currentUser={currentUser} />
      )}

      {/* ADMIN ROLE VIEW */}
      {currentRole === 'ADMIN' && (
        <AdminLayout activeTab={adminTab} onSelectTab={setAdminTab}>
          {adminTab === 'dashboard' && <DashboardView onNavigate={setAdminTab} />}
          {adminTab === 'customers' && <CustomersView />}
          {adminTab === 'products' && <ProductsView />}
          {adminTab === 'ecom_orders' && <AdminEcommerceOrdersView />}
          {adminTab === 'service_tickets' && <AdminServiceTicketsView />}
          {adminTab === 'subscriptions' && <SubscriptionsView />}
          {adminTab === 'deliveries' && <DeliveriesView />}
          {adminTab === 'payments' && <PaymentsView />}
          {adminTab === 'reports' && <ReportsView />}
          {adminTab === 'settings' && <SettingsView />}
        </AdminLayout>
      )}

      {/* CUSTOMER ROLE VIEW */}
      {currentRole === 'CUSTOMER' && (
        <CustomerLayout activeTab={customerTab} onSelectTab={setCustomerTab} cartCount={totalCartCount}>
          {customerTab === 'home' && <CustomerHomeView onNavigate={setCustomerTab} />}
          {customerTab === 'shop' && (
            <CustomerShopView
              cart={cart}
              onAddToCart={handleAddToCart}
              onUpdateQuantity={handleUpdateCartQuantity}
              onClearCart={handleClearCart}
              onNavigateToOrders={() => setCustomerTab('orders')}
            />
          )}
          {customerTab === 'orders' && <CustomerOrdersView onGoToShop={() => setCustomerTab('shop')} />}
          {customerTab === 'deliveries' && <CustomerDeliveriesView />}
          {customerTab === 'bills' && <CustomerBillsView />}
          {customerTab === 'subscription' && <CustomerSubscriptionView />}
          {customerTab === 'service' && <CustomerServiceView />}
          {customerTab === 'account' && <CustomerAccountView />}
        </CustomerLayout>
      )}

      {/* DELIVERY STAFF ROLE VIEW */}
      {currentRole === 'DELIVERY_STAFF' && (
        <div className="p-4 sm:p-6 bg-[#FDFCF9] min-h-[calc(100vh-4rem)]">
          <DeliveryStaffView />
        </div>
      )}
    </div>
  );
}

