import React, { useState } from 'react';
import { X, Calendar, AlertCircle, PauseCircle, Loader2 } from 'lucide-react';
import { Subscription } from '../types';
import { ApiClient } from '../api/client';

interface PauseDeliveryModalProps {
  subscription: Subscription;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const PauseDeliveryModal: React.FC<PauseDeliveryModalProps> = ({
  subscription,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [fromDate, setFromDate] = useState('2026-08-10');
  const [toDate, setToDate] = useState('2026-08-20');
  const [reason, setReason] = useState('Vacation / Out of station');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromDate || !toDate) {
      alert('Please select valid From and To dates');
      return;
    }
    if (fromDate > toDate) {
      alert('From Date cannot be after To Date');
      return;
    }

    setIsSubmitting(true);
    try {
      await ApiClient.pauseSubscription(subscription.id, fromDate, toDate, reason);
      setIsSubmitting(false);
      onSuccess();
    } catch (err: any) {
      setIsSubmitting(false);
      alert(err.message || 'Failed to pause delivery');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-amber-500 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PauseCircle className="w-5 h-5" />
            <h3 className="font-bold text-base">Pause Milk Delivery</h3>
          </div>
          <button onClick={onClose} className="text-amber-100 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="bg-amber-50 rounded-xl p-3 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p>
              During the pause period, the system will <strong>NOT generate milk delivery records</strong> or charge your monthly bill. Delivery automatically resumes after the end date.
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-xs text-slate-500">Active Subscription:</span>
            <p className="font-semibold text-slate-900 text-sm">
              {subscription.productName} ({subscription.quantity}L / Day - {subscription.deliveryTime})
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">From Date</label>
              <div className="relative">
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">To Date (Resume)</label>
              <div className="relative">
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Reason for Pause</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="Vacation / Out of station">Vacation / Out of station</option>
              <option value="Excess milk available">Excess milk available</option>
              <option value="Festival / Travelling">Festival / Travelling</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-slate-300 hover:bg-slate-50 font-semibold rounded-xl text-xs text-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Pausing...
                </>
              ) : (
                'Confirm Pause'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
