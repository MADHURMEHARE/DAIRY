import React, { useState, useEffect } from 'react';
import {
  Milk,
  PauseCircle,
  PlayCircle,
  Edit3,
  CheckCircle2,
  LockKeyhole,
} from 'lucide-react';

import { Subscription, User } from '../../types';
import { ApiClient } from '../../api/client';
import { PauseDeliveryModal } from '../../components/PauseDeliveryModal';

interface CustomerSubscriptionViewProps {
  currentUser?: User | null;
}

export const CustomerSubscriptionView: React.FC<
  CustomerSubscriptionViewProps
> = ({ currentUser }) => {
  const [subscription, setSubscription] =
    useState<Subscription | null>(null);

  const [quantity, setQuantity] = useState(2);

  const [time, setTime] =
    useState<'MORNING' | 'EVENING'>('MORNING');

  const [showPauseModal, setShowPauseModal] =
    useState(false);

  const [isSaved, setIsSaved] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // User is not logged in
    if (!currentUser) {
      setSubscription(null);
      setIsLoading(false);
      return;
    }

    loadSubscription();
  }, [currentUser]);

  const loadSubscription = async () => {
    if (!currentUser) {
      return;
    }

    setIsLoading(true);

    try {
      // Do NOT pass customerId.
      // Backend identifies the authenticated customer.
      const data = await ApiClient.getCustomerDetails();

      if (data.subscription) {
        setSubscription(data.subscription);

        setQuantity(data.subscription.quantity);

        setTime(
          data.subscription.deliveryTime === 'BOTH'
            ? 'MORNING'
            : data.subscription.deliveryTime
        );
      } else {
        setSubscription(null);
      }
    } catch (error) {
      console.error(
        'Failed to load subscription:',
        error
      );

      setSubscription(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!subscription || !currentUser) {
      return;
    }

    try {
      await ApiClient.updateSubscription(
        subscription.id,
        {
          quantity,
          deliveryTime: time,
        }
      );

      setIsSaved(true);

      setTimeout(() => {
        setIsSaved(false);
      }, 2000);

      await loadSubscription();
    } catch (error) {
      console.error(
        'Failed to update subscription:',
        error
      );

      alert('Failed to update subscription');
    }
  };

  // ============================================================
  // NOT LOGGED IN
  // ============================================================

  if (!currentUser) {
    return (
      <div className="min-h-[400px] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl border border-[#E5E7EB] text-center space-y-4 max-w-sm w-full">
          <div className="w-16 h-16 rounded-full bg-[#F7F9F7] text-[#52796F] flex items-center justify-center mx-auto">
            <LockKeyhole className="w-7 h-7" />
          </div>

          <h3 className="font-bold text-[#081C15] text-lg">
            Login Required
          </h3>

          <p className="text-xs text-[#52796F]">
            Please login to manage your milk subscription,
            delivery time and pause dates.
          </p>

          <button
            onClick={() => {
              // If your parent uses another tab name,
              // replace "login" with your existing login route/tab.
              window.dispatchEvent(
                new CustomEvent('open-login')
              );
            }}
            className="w-full py-3 bg-[#1B4332] hover:bg-[#143326] text-white font-bold rounded-xl text-sm shadow-md transition-all"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  // ============================================================
  // LOADING
  // ============================================================

  if (isLoading) {
    return (
      <div className="p-8 text-center text-xs text-[#52796F]">
        Loading your subscription...
      </div>
    );
  }

  // ============================================================
  // NO SUBSCRIPTION
  // ============================================================

  if (!subscription) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-[#E5E7EB] text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-[#F7F9F7] text-[#52796F] flex items-center justify-center text-3xl mx-auto">
          🥛
        </div>

        <h3 className="font-bold text-[#081C15] text-base">
          No active milk subscription
        </h3>

        <p className="text-xs text-[#52796F] max-w-md mx-auto">
          Sign up or subscribe to daily fresh farm cow or buffalo
          milk delivered every morning to your doorstep.
        </p>
      </div>
    );
  }

  // ============================================================
  // SUBSCRIPTION
  // ============================================================

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-[#081C15]">
          Manage Milk Subscription
        </h2>

        <p className="text-xs text-[#52796F] mt-1">
          Update your daily milk delivery preferences.
        </p>
      </div>

      {/* Subscription Information */}

      <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-4">
        <div className="bg-[#F7F9F7] p-4 rounded-xl border border-[#E5E7EB] space-y-2 text-xs">
          <div className="flex justify-between font-bold text-[#081C15]">
            <span>Product</span>

            <span>
              {subscription.productName}
            </span>
          </div>

          <div className="flex justify-between text-[#52796F]">
            <span>Rate</span>

            <span className="font-mono">
              ₹{subscription.unitPrice} / Litre
            </span>
          </div>

          <div className="flex justify-between text-[#52796F]">
            <span>Frequency</span>

            <span>
              {subscription.frequency}
            </span>
          </div>
        </div>

        {/* Change Quantity */}

        <div className="space-y-2">
          <label className="block text-xs font-bold text-[#081C15]">
            Daily Quantity (Litres)
          </label>

          <div className="flex items-center gap-2">
            {[1, 1.5, 2, 3, 4].map((q) => (
              <button
                key={q}
                onClick={() => setQuantity(q)}
                className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                  quantity === q
                    ? 'border-[#1B4332] bg-[#1B4332] text-white shadow-xs'
                    : 'border-[#E5E7EB] bg-[#F7F9F7] text-[#52796F] hover:bg-[#E5E7EB]'
                }`}
              >
                {q}L
              </button>
            ))}
          </div>
        </div>

        {/* Delivery Time */}

        <div className="space-y-2">
          <label className="block text-xs font-bold text-[#081C15]">
            Preferred Shift
          </label>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setTime('MORNING')}
              className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                time === 'MORNING'
                  ? 'border-[#1B4332] bg-[#D8E2DC] text-[#1B4332] shadow-xs'
                  : 'border-[#E5E7EB] bg-[#F7F9F7] text-[#52796F] hover:bg-[#E5E7EB]'
              }`}
            >
              🌅 Morning (06:00 AM)
            </button>

            <button
              onClick={() => setTime('EVENING')}
              className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                time === 'EVENING'
                  ? 'border-[#1B4332] bg-[#D8E2DC] text-[#1B4332] shadow-xs'
                  : 'border-[#E5E7EB] bg-[#F7F9F7] text-[#52796F] hover:bg-[#E5E7EB]'
              }`}
            >
              🌆 Evening (06:00 PM)
            </button>
          </div>
        </div>

        {/* Save */}

        <div className="pt-2 flex flex-col gap-2">
          {isSaved && (
            <span className="text-xs text-green-700 font-bold flex items-center gap-1 justify-center">
              <CheckCircle2 className="w-4 h-4" />

              Subscription Updated!
            </span>
          )}

          <button
            onClick={handleUpdate}
            className="w-full py-3 bg-[#1B4332] hover:bg-[#143326] text-white font-bold rounded-xl text-xs shadow-md"
          >
            Save Subscription Changes
          </button>
        </div>
      </div>

      {/* Pause Button */}

      <div className="bg-amber-50 p-5 rounded-2xl border border-amber-200 text-xs space-y-3">
        <h3 className="font-bold text-amber-900 text-sm">
          Going on Vacation?
        </h3>

        <p className="text-amber-800">
          Pause your daily milk drop-off anytime. Select your
          departure and return dates to avoid milk charges.
        </p>

        <button
          onClick={() => setShowPauseModal(true)}
          className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
        >
          <PauseCircle className="w-4 h-4" />

          Set Pause Dates
        </button>
      </div>

      {/* Pause Modal */}

      {showPauseModal && (
        <PauseDeliveryModal
          subscription={subscription}
          isOpen={showPauseModal}
          onClose={() => setShowPauseModal(false)}
          onSuccess={() => {
            setShowPauseModal(false);
            loadSubscription();
          }}
        />
      )}
    </div>
  );
};