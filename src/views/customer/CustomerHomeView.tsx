import React, { useState, useEffect } from 'react';
import { Milk, PauseCircle, Calendar, CreditCard, CheckCircle2, Clock, ShieldCheck, ChevronRight } from 'lucide-react';
import { Customer, Subscription, DeliveryRecord, Invoice, User } from '../../types';
import { ApiClient } from '../../api/client';
import { PauseDeliveryModal } from '../../components/PauseDeliveryModal';
import { RazorpayModal } from '../../components/RazorpayModal';
import { getActiveCustomerId } from '../../utils/userUtils';

interface CustomerHomeViewProps {
  onNavigate: (tab: string) => void;
  currentUser?: User | null;
}

export const CustomerHomeView: React.FC<CustomerHomeViewProps> = ({ onNavigate, currentUser }) => {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [todayDelivery, setTodayDelivery] = useState<DeliveryRecord | null>(null);
  const [augustBill, setAugustBill] = useState<Invoice | null>(null);

  const [showPauseModal, setShowPauseModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);

  useEffect(() => {
    loadCustomerPortalData();
  }, [currentUser]);

  const loadCustomerPortalData = async () => {
    try {
      const activeCustomerId = getActiveCustomerId(currentUser);
      const data = await ApiClient.getCustomerDetails(activeCustomerId);
      setCustomer(data.customer);
      setSubscription(data.subscription || null);

      const todayDel = data.deliveries.find((d) => d.deliveryDate === '2026-08-08') || data.deliveries[0];
      setTodayDelivery(todayDel || null);

      const bill = data.invoices.find((i) => i.month === 'August 2026') || data.invoices[0];
      setAugustBill(bill || null);
    } catch (e) {
      console.error(e);
    }
  };

  if (!customer || !subscription) return <div className="p-8 text-center text-slate-400 text-xs">Loading Customer Portal...</div>;

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      {/* Greeting Header */}
      <div className="bg-[#1B4332] text-white p-6 rounded-2xl shadow-sm space-y-2 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 text-7xl opacity-10 pointer-events-none font-serif">
          🥛
        </div>
        <p className="text-xs text-[#D8E2DC] font-medium">Shree Dairy Member</p>
        <h1 className="text-2xl font-bold tracking-tight">Good morning, {customer.name} 👋</h1>
        <p className="text-xs text-[#D8E2DC] flex items-center gap-1">
          📍 {customer.address}
        </p>
      </div>

      {/* Today's Delivery Card */}
      <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
          <span className="text-xs font-bold text-[#52796F] uppercase tracking-wider">Today's Delivery (08 Aug)</span>
          <span
            className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${
              todayDelivery?.status === 'DELIVERED'
                ? 'bg-green-100 text-green-800'
                : 'bg-blue-100 text-blue-800'
            }`}
          >
            {todayDelivery?.status === 'DELIVERED' ? (
              <CheckCircle2 className="w-3.5 h-3.5" />
            ) : (
              <Clock className="w-3.5 h-3.5" />
            )}
            {todayDelivery?.status || 'SCHEDULED'}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#F7F9F7] text-[#1B4332] flex items-center justify-center font-bold text-2xl">
              🥛
            </div>
            <div>
              <h3 className="font-bold text-[#081C15] text-base">{subscription.productName}</h3>
              <p className="text-xs text-[#52796F] font-medium">
                {subscription.quantity} Litres • {subscription.deliveryTime.toLowerCase()} drop
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs text-[#52796F] font-medium">Estimated</span>
            <p className="text-lg font-bold text-[#1B4332] font-mono">₹{subscription.quantity * subscription.unitPrice}</p>
          </div>
        </div>
      </div>

      {/* Subscription Summary & Quick Pause */}
      <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-[#081C15] text-sm">Your Subscription</h3>
            <p className="text-xs text-[#52796F] mt-0.5">₹{subscription.unitPrice}/L • Daily Morning Delivery</p>
          </div>
          <span className="bg-[#D8E2DC] text-[#1B4332] font-bold text-xs px-2.5 py-0.5 rounded-full">
            {subscription.status}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E5E7EB]">
          <button
            onClick={() => setShowPauseModal(true)}
            className="py-2.5 px-3 bg-[#FFF3E0] hover:bg-amber-100 text-[#E65100] font-bold rounded-xl text-xs border border-amber-200 transition-colors flex items-center justify-center gap-1.5"
          >
            <PauseCircle className="w-4 h-4 text-[#E65100]" /> Pause Delivery
          </button>

          <button
            onClick={() => onNavigate('subscription')}
            className="py-2.5 px-3 bg-[#F7F9F7] hover:bg-[#E5E7EB] text-[#1B4332] font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1"
          >
            Manage Details <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* August Bill Card */}
      {augustBill && (
        <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-[#52796F] uppercase tracking-wider block">Current Statement</span>
              <h3 className="font-bold text-[#081C15] text-base">{augustBill.month} Bill</h3>
            </div>
            <div className="text-right">
              <span className="text-xs text-[#52796F]">Total Bill</span>
              <p className="text-lg font-bold text-[#081C15] font-mono">₹{augustBill.totalAmount.toLocaleString('en-IN')}</p>
            </div>
          </div>

          <div className="bg-[#F7F9F7] p-3 rounded-xl border border-[#E5E7EB] space-y-1.5 text-xs">
            <div className="flex justify-between text-[#52796F]">
              <span>Paid So Far:</span>
              <span className="font-mono text-[#1B4332] font-bold">₹{augustBill.paidAmount.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between font-bold text-[#081C15] border-t border-[#E5E7EB] pt-1.5">
              <span className="text-red-700">Remaining Due:</span>
              <span className="font-mono text-red-700 font-bold">₹{augustBill.dueAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {augustBill.dueAmount > 0 && (
            <button
              onClick={() => setShowPayModal(true)}
              className="w-full py-3 bg-[#1B4332] hover:bg-[#143326] text-white font-bold rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              💳 Pay ₹{augustBill.dueAmount.toLocaleString('en-IN')} via Razorpay
            </button>
          )}
        </div>
      )}

      {/* Modals */}
      {showPauseModal && (
        <PauseDeliveryModal
          subscription={subscription}
          isOpen={showPauseModal}
          onClose={() => setShowPauseModal(false)}
          onSuccess={() => {
            setShowPauseModal(false);
            loadCustomerPortalData();
          }}
        />
      )}

      {showPayModal && augustBill && (
        <RazorpayModal
          invoice={augustBill}
          isOpen={showPayModal}
          onClose={() => setShowPayModal(false)}
          onSuccess={() => {
            setShowPayModal(false);
            loadCustomerPortalData();
          }}
        />
      )}
    </div>
  );
};
