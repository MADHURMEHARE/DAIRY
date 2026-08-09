import React, { useState, useEffect } from 'react';
import { RefreshCw, PauseCircle, PlayCircle, Plus, Calendar, Clock } from 'lucide-react';
import { Subscription } from '../../types';
import { ApiClient } from '../../api/client';
import { PauseDeliveryModal } from '../../components/PauseDeliveryModal';

export const SubscriptionsView: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [selectedSubForPause, setSelectedSubForPause] = useState<Subscription | null>(null);

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    try {
      const list = await ApiClient.getSubscriptions();
      setSubscriptions(list);
    } catch (e) {
      console.error(e);
    }
  };

  const handleResume = async (id: string) => {
    try {
      await ApiClient.resumeSubscription(id);
      loadSubscriptions();
    } catch (e) {
      alert('Failed to resume');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-[#081C15] tracking-tight">Subscriptions</h1>
          <p className="text-xs text-[#52796F] mt-1">
            Active daily milk deliveries, frequency rules, and temporary pauses.
          </p>
        </div>
      </div>

      {/* Subscriptions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {subscriptions.map((sub) => (
          <div
            key={sub.id}
            className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-4 hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-[#081C15] text-base">{sub.customerName}</h3>
                <p className="text-xs text-[#52796F] font-mono mt-0.5">{sub.customerPhone}</p>
              </div>
              <span
                className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                  sub.status === 'ACTIVE'
                    ? 'bg-[#D8E2DC] text-[#1B4332]'
                    : 'bg-amber-100 text-amber-900'
                }`}
              >
                {sub.status}
              </span>
            </div>

            <div className="bg-[#F7F9F7] p-3 rounded-xl border border-[#E5E7EB] space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-[#081C15]">{sub.productName}</span>
                <span className="font-bold text-[#1B4332] bg-[#D8E2DC] px-2 py-0.5 rounded-md font-mono">
                  {sub.quantity}L / Day
                </span>
              </div>
              <div className="flex justify-between text-[11px] text-[#52796F] pt-1">
                <span>Frequency: {sub.frequency}</span>
                <span className="capitalize">{sub.deliveryTime.toLowerCase()} Delivery</span>
              </div>
            </div>

            {sub.pausePeriods && sub.pausePeriods.length > 0 && (
              <div className="text-[11px] bg-[#FFF3E0] text-amber-900 p-2 rounded-lg border border-amber-200">
                ⚠️ Paused: {sub.pausePeriods[sub.pausePeriods.length - 1].fromDate} to{' '}
                {sub.pausePeriods[sub.pausePeriods.length - 1].toDate}
              </div>
            )}

            <div className="pt-2 flex items-center justify-between border-t border-[#E5E7EB]">
              <span className="text-xs text-[#52796F] font-mono">Rate: ₹{sub.unitPrice}/L</span>

              {sub.status === 'ACTIVE' ? (
                <button
                  onClick={() => setSelectedSubForPause(sub)}
                  className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold rounded-lg text-xs transition-colors flex items-center gap-1"
                >
                  <PauseCircle className="w-3.5 h-3.5" /> Pause Delivery
                </button>
              ) : (
                <button
                  onClick={() => handleResume(sub.id)}
                  className="px-3 py-1.5 bg-[#1B4332] hover:bg-[#143326] text-white font-bold rounded-lg text-xs transition-colors flex items-center gap-1"
                >
                  <PlayCircle className="w-3.5 h-3.5" /> Resume Delivery
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pause Modal */}
      {selectedSubForPause && (
        <PauseDeliveryModal
          subscription={selectedSubForPause}
          isOpen={!!selectedSubForPause}
          onClose={() => setSelectedSubForPause(null)}
          onSuccess={() => {
            setSelectedSubForPause(null);
            loadSubscriptions();
          }}
        />
      )}
    </div>
  );
};
