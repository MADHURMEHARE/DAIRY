import React, { useEffect, useState } from 'react';
import {
  Clock,
  CheckCircle2,
  Truck,
  AlertCircle,
  ShoppingBag,
  PackageCheck,
} from 'lucide-react';

import {
  EcommerceOrder,
  EcommerceOrderStatus,
  User,
} from '../../types';

import { ApiClient } from '../../api/client';

interface CustomerOrdersViewProps {
  onGoToShop: () => void;
  currentUser?: User | null;
}

export const CustomerOrdersView: React.FC<CustomerOrdersViewProps> = ({
  onGoToShop,
  currentUser,
}) => {
  const [orders, setOrders] = useState<EcommerceOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Do not request orders when the customer is not logged in.
    if (!currentUser) {
      setOrders([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    loadOrders();
  }, [currentUser]);

  const loadOrders = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // IMPORTANT:
      // Do NOT pass customerId/userId here.
      // The backend must identify the customer from the JWT/session.
      const list = await ApiClient.getEcommerceOrders();

      setOrders(Array.isArray(list) ? list : []);
    } catch (error: any) {
      console.error('Error fetching orders:', error);

      if (error?.response?.status === 401) {
        setError('Please log in to view your orders.');
      } else {
        setError('Unable to load your orders. Please try again.');
      }

      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: EcommerceOrderStatus) => {
    switch (status) {
      case 'ORDER_PLACED':
        return {
          label: 'Order Received',
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: Clock,
        };

      case 'PACKING':
        return {
          label: 'Packing Fresh',
          color: 'bg-amber-100 text-amber-800 border-amber-200',
          icon: Clock,
        };

      case 'OUT_FOR_DELIVERY':
        return {
          label: 'Out for Delivery',
          color: 'bg-purple-100 text-purple-800 border-purple-200',
          icon: Truck,
        };

      case 'DELIVERED':
        return {
          label: 'Delivered',
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: CheckCircle2,
        };

      case 'CANCELLED':
        return {
          label: 'Cancelled',
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: AlertCircle,
        };

      default:
        return {
          label: status,
          color: 'bg-slate-100 text-slate-800 border-slate-200',
          icon: Clock,
        };
    }
  };

  const statusSteps: EcommerceOrderStatus[] = [
    'ORDER_PLACED',
    'PACKING',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
  ];

  // User is not authenticated
  if (!currentUser) {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-[#081C15]">
            Store Order History
          </h2>

          <p className="text-xs text-[#52796F] mt-1">
            Track your one-time express orders from Anandwan Milk Dairy Store.
          </p>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-[#E5E7EB] text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#F7F9F7] text-[#52796F] flex items-center justify-center text-3xl mx-auto">
            🔐
          </div>

          <h3 className="font-bold text-[#081C15] text-base">
            Login required
          </h3>

          <p className="text-xs text-[#52796F] max-w-xs mx-auto">
            Please log in to view your order history.
          </p>

          <button
            onClick={() => {
              // Replace this with your existing login/navigation handler.
              onGoToShop();
            }}
            className="px-5 py-2.5 bg-[#1B4332] text-white font-bold text-xs rounded-xl shadow-md inline-flex items-center gap-1.5"
          >
            <ShoppingBag className="w-4 h-4" />
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-[#081C15]">
          Store Order History
        </h2>

        <p className="text-xs text-[#52796F] mt-1">
          Track your one-time express orders from Anandwan Milk Dairy Store.
        </p>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="bg-white p-8 rounded-2xl border border-[#E5E7EB] text-center">
          <PackageCheck className="w-8 h-8 mx-auto mb-3 text-[#52796F]" />

          <p className="text-xs text-[#52796F]">
            Loading your orders...
          </p>
        </div>
      )}

      {/* Error */}
      {!isLoading && error && (
        <div className="bg-white p-8 rounded-2xl border border-red-200 text-center space-y-3">
          <AlertCircle className="w-8 h-8 mx-auto text-red-500" />

          <h3 className="font-bold text-[#081C15]">
            Unable to load orders
          </h3>

          <p className="text-xs text-[#52796F]">
            {error}
          </p>

          <button
            onClick={loadOrders}
            className="px-5 py-2.5 bg-[#1B4332] text-white font-bold text-xs rounded-xl"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Empty orders */}
      {!isLoading && !error && orders.length === 0 && (
        <div className="bg-white p-8 rounded-2xl border border-[#E5E7EB] text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#F7F9F7] text-[#52796F] flex items-center justify-center text-3xl mx-auto">
            📦
          </div>

          <h3 className="font-bold text-[#081C15] text-base">
            No store orders placed yet
          </h3>

          <p className="text-xs text-[#52796F] max-w-xs mx-auto">
            Order fresh Paneer, Ghee, Dahi, Shrikhand & sweets for instant
            express delivery.
          </p>

          <button
            onClick={onGoToShop}
            className="px-5 py-2.5 bg-[#1B4332] text-white font-bold text-xs rounded-xl shadow-md inline-flex items-center gap-1.5"
          >
            <ShoppingBag className="w-4 h-4" />
            Go to Store Shop
          </button>
        </div>
      )}

      {/* Orders */}
      {!isLoading && !error && orders.length > 0 && (
        <div className="space-y-4">
          {orders.map((order) => {
            const badge = getStatusBadge(order.status);
            const StatusIcon = badge.icon;

            const currentStepIdx = statusSteps.indexOf(order.status);

            return (
              <div
                key={order.id}
                className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-sm space-y-4"
              >
                {/* Order Top Bar */}
                <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
                  <div>
                    <span className="font-mono font-bold text-xs text-[#081C15] block">
                      {order.orderNumber}
                    </span>

                    <span className="text-[11px] text-[#52796F]">
                      {order.createdAt}
                    </span>
                  </div>

                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full border flex items-center gap-1 ${badge.color}`}
                  >
                    <StatusIcon className="w-3.5 h-3.5" />

                    {badge.label}
                  </span>
                </div>

                {/* Progress */}
                {order.status !== 'CANCELLED' && (
                  <div className="bg-[#F7F9F7] p-3 rounded-xl border border-[#E5E7EB]">
                    <div className="flex items-center justify-between relative">
                      {statusSteps.map((step, idx) => {
                        const isCompleted = currentStepIdx >= idx;
                        const isCurrent = currentStepIdx === idx;

                        return (
                          <div
                            key={step}
                            className="flex flex-col items-center flex-1 z-10"
                          >
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border transition-colors ${
                                isCompleted
                                  ? 'bg-[#1B4332] text-white border-[#1B4332]'
                                  : 'bg-white text-slate-400 border-slate-200'
                              }`}
                            >
                              {isCompleted ? '✓' : idx + 1}
                            </div>

                            <span
                              className={`text-[9px] mt-1 font-semibold text-center ${
                                isCurrent
                                  ? 'text-[#1B4332] font-bold'
                                  : 'text-slate-400'
                              }`}
                            >
                              {step === 'ORDER_PLACED'
                                ? 'Placed'
                                : step === 'PACKING'
                                ? 'Packing'
                                : step === 'OUT_FOR_DELIVERY'
                                ? 'On Way'
                                : 'Delivered'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Items */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-[#52796F] uppercase tracking-wider block">
                    Items
                  </span>

                  {order.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm">
                          {item.icon || '🥛'}
                        </span>

                        <span className="font-bold text-[#081C15]">
                          {item.productName}{' '}
                          <span className="text-[#52796F] font-normal">
                            x{item.quantity}
                          </span>
                        </span>
                      </div>

                      <span className="font-mono text-[#1B4332] font-bold">
                        ₹{item.totalPrice}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="bg-[#F7F9F7] p-3 rounded-xl border border-[#E5E7EB] text-xs space-y-1.5">
                  <div className="flex justify-between text-[#52796F]">
                    <span>Slot:</span>

                    <span className="font-bold text-[#081C15]">
                      {order.deliverySlot}
                    </span>
                  </div>

                  <div className="flex justify-between text-[#52796F]">
                    <span>Payment:</span>

                    <span className="font-bold text-[#081C15]">
                      {order.paymentMethod} ({order.paymentStatus})
                    </span>
                  </div>

                  <div className="flex justify-between font-bold text-[#081C15] border-t border-[#E5E7EB] pt-1.5">
                    <span>Total Amount:</span>

                    <span className="font-mono text-[#1B4332] text-sm">
                      ₹{order.totalAmount}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};