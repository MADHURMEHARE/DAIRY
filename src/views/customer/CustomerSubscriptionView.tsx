import React, { useState, useEffect } from 'react';
import { Milk, PauseCircle, PlayCircle, Edit3, CheckCircle2 } from 'lucide-react';
import { Subscription } from '../../types';
import { ApiClient } from '../../api/client';
import { PauseDeliveryModal } from '../../components/PauseDeliveryModal';

export const CustomerSubscriptionView: React.FC = () => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [quantity, setQuantity] = useState<number>(2);
  const [time, setTime] = useState<'MORNING' | 'EVENING'>('MORNING');
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    const data = await ApiClient.getCustomerDetails('cust_rahul_01');
    if (data.subscription) {
      setSubscription(data.subscription);
      setQuantity(data.subscription.quantity);
      setTime(data.subscription.deliveryTime === 'BOTH' ? 'MORNING' : data.subscription.deliveryTime);
    }
  };

  const handleUpdate = async () => {
    if (!subscription) return;
    try {
      await ApiClient.updateSubscription(subscription.id, {
        quantity,
        deliveryTime: time
      });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
      loadSubscription();
    } catch (e) {
      alert('Failed to update subscription');
    }
  };

  if (!subscription) return null;

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-4">
        <h1 className="text-xl font-bold text-[#081C15]">Manage Milk Subscription</h1>

        <div className="bg-[#F7F9F7] p-4 rounded-xl border border-[#E5E7EB] space-y-2 text-xs">
          <div className="flex justify-between font-bold text-[#081C15]">
            <span>Product</span>
            <span>{subscription.productName}</span>
          </div>
          <div className="flex justify-between text-[#52796F]">
            <span>Rate</span>
            <span className="font-mono">₹{subscription.unitPrice} / Litre</span>
          </div>
          <div className="flex justify-between text-[#52796F]">
            <span>Frequency</span>
            <span>{subscription.frequency}</span>
          </div>
        </div>

        {/* Change Quantity */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-[#081C15]">Daily Quantity (Litres)</label>
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

        {/* Change Delivery Time */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-[#081C15]">Preferred Shift</label>
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

        {/* Save button */}
        <div className="pt-2 flex flex-col gap-2">
          {isSaved && (
            <span className="text-xs text-green-700 font-bold flex items-center gap-1 justify-center">
              <CheckCircle2 className="w-4 h-4" /> Subscription Updated!
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

      {/* Pause Button Box */}
      <div className="bg-amber-50 p-5 rounded-2xl border border-amber-200 text-xs space-y-3">
        <h3 className="font-bold text-amber-900 text-sm">Going on Vacation?</h3>
        <p className="text-amber-800">
          Pause your daily milk drop-off anytime. Select your departure and return dates to avoid milk charges.
        </p>
        <button
          onClick={() => setShowPauseModal(true)}
          className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
        >
          <PauseCircle className="w-4 h-4" /> Set Pause Dates
        </button>
      </div>

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
