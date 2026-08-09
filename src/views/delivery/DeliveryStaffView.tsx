import React, { useState, useEffect } from 'react';
import { Truck, CheckCircle2, Phone, MapPin, XCircle, Clock, RefreshCw } from 'lucide-react';
import { DeliveryRecord } from '../../types';
import { ApiClient } from '../../api/client';

export const DeliveryStaffView: React.FC = () => {
  const [deliveries, setDeliveries] = useState<DeliveryRecord[]>([]);
  const [shiftFilter, setShiftFilter] = useState<'MORNING' | 'EVENING'>('MORNING');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'DELIVERED'>('ALL');

  useEffect(() => {
    loadRoute();
  }, []);

  const loadRoute = async () => {
    try {
      const list = await ApiClient.getDeliveries({ date: '2026-08-08' });
      setDeliveries(list);
    } catch (e) {
      console.error(e);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const updated = await ApiClient.updateDeliveryStatus(id, status);
      setDeliveries((prev) => prev.map((d) => (d.id === id ? updated : d)));
    } catch (e) {
      alert('Failed to update delivery');
    }
  };

  const filtered = deliveries.filter((d) => {
    const matchShift = d.deliveryTime === shiftFilter;
    const matchStatus = statusFilter === 'ALL' || (statusFilter === 'PENDING' ? d.status !== 'DELIVERED' : d.status === 'DELIVERED');
    return matchShift && matchStatus;
  });

  const deliveredCount = deliveries.filter((d) => d.status === 'DELIVERED').length;
  const pendingCount = deliveries.filter((d) => d.status !== 'DELIVERED' && d.status !== 'SKIPPED').length;

  return (
    <div className="space-y-4 max-w-lg mx-auto pb-12">
      {/* Driver Header */}
      <div className="bg-[#1B4332] text-white p-5 rounded-2xl shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-[#D8E2DC] text-[#1B4332] flex items-center justify-center font-bold text-lg">
              🚚
            </div>
            <div>
              <h1 className="font-bold text-base">Ramesh Kumar</h1>
              <p className="text-xs text-[#D8E2DC]">Camp Road & Rajapeth Route</p>
            </div>
          </div>

          <button onClick={loadRoute} className="p-2 bg-[#2D6A4F] hover:bg-[#143326] text-white rounded-xl text-xs">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#2D6A4F] text-xs font-semibold">
          <div className="bg-[#2D6A4F]/60 p-2.5 rounded-xl text-center">
            <span className="text-[#D8E2DC] block text-[10px]">Delivered Today</span>
            <span className="text-white text-lg font-bold">{deliveredCount} Drops</span>
          </div>
          <div className="bg-[#2D6A4F]/60 p-2.5 rounded-xl text-center">
            <span className="text-[#D8E2DC] block text-[10px]">Pending Route</span>
            <span className="text-[#FFF3E0] text-lg font-bold">{pendingCount} Drops</span>
          </div>
        </div>
      </div>

      {/* Shift Toggle */}
      <div className="grid grid-cols-2 gap-2 bg-white p-1.5 rounded-2xl border border-[#E5E7EB] shadow-xs font-bold text-xs">
        <button
          onClick={() => setShiftFilter('MORNING')}
          className={`py-2.5 rounded-xl transition-all ${
            shiftFilter === 'MORNING'
              ? 'bg-[#1B4332] text-white shadow-xs'
              : 'text-[#52796F] hover:bg-[#F7F9F7]'
          }`}
        >
          🌅 Morning Shift (06 AM)
        </button>
        <button
          onClick={() => setShiftFilter('EVENING')}
          className={`py-2.5 rounded-xl transition-all ${
            shiftFilter === 'EVENING'
              ? 'bg-[#1B4332] text-white shadow-xs'
              : 'text-[#52796F] hover:bg-[#F7F9F7]'
          }`}
        >
          🌆 Evening Shift (06 PM)
        </button>
      </div>

      {/* Route Cards List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl text-center text-slate-400 text-xs border border-slate-200">
            No deliveries found for this shift.
          </div>
        ) : (
          filtered.map((del, idx) => (
            <div
              key={del.id}
              className={`p-5 rounded-2xl border transition-all space-y-3 ${
                del.status === 'DELIVERED'
                  ? 'bg-[#F7F9F7] border-[#D8E2DC]'
                  : del.status === 'SKIPPED'
                  ? 'bg-slate-100 border-slate-200 opacity-60'
                  : 'bg-white border-[#E5E7EB] shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#1B4332] text-white font-bold text-xs flex items-center justify-center shrink-0 font-mono">
                    #{idx + 1}
                  </span>
                  <div>
                    <h3 className="font-bold text-[#081C15] text-base">{del.customerName}</h3>
                    <p className="text-xs text-[#52796F] font-medium flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-[#52796F] shrink-0" /> {del.customerAddress}
                    </p>
                  </div>
                </div>

                <a
                  href={`tel:${del.customerPhone}`}
                  className="p-2.5 bg-[#F7F9F7] text-[#1B4332] hover:bg-[#D8E2DC] rounded-xl transition-colors shrink-0"
                >
                  <Phone className="w-4 h-4" />
                </a>
              </div>

              <div className="bg-[#F7F9F7] p-3 rounded-xl border border-[#E5E7EB] flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-[#081C15]">{del.productName}</span>
                  <span className="ml-2 font-bold text-[#1B4332] bg-[#D8E2DC] px-2 py-0.5 rounded-md">
                    {del.quantity} Litres
                  </span>
                </div>
                <span className="font-bold text-[#52796F] font-mono">₹{del.totalPrice}</span>
              </div>

              {del.notes && <p className="text-xs text-amber-900 italic bg-[#FFF3E0] p-2 rounded-lg border border-amber-200">{del.notes}</p>}

              {/* Action Buttons */}
              <div className="pt-1 flex gap-2">
                {del.status !== 'DELIVERED' ? (
                  <>
                    <button
                      onClick={() => updateStatus(del.id, 'DELIVERED')}
                      className="flex-1 py-3 bg-[#1B4332] hover:bg-[#143326] text-white font-bold rounded-xl text-xs shadow-sm transition-all flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Mark Delivered
                    </button>
                    <button
                      onClick={() => updateStatus(del.id, 'SKIPPED')}
                      className="py-3 px-3 bg-[#F7F9F7] hover:bg-[#E5E7EB] text-[#52796F] font-bold rounded-xl text-xs transition-all border border-[#E5E7EB]"
                    >
                      Skip
                    </button>
                  </>
                ) : (
                  <div className="w-full py-2.5 bg-[#D8E2DC] text-[#1B4332] font-bold rounded-xl text-xs text-center flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Delivered at {del.updatedAt || '06:45 AM'}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
