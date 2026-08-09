import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { DeliveryRecord } from '../../types';
import { ApiClient } from '../../api/client';

export const CustomerDeliveriesView: React.FC = () => {
  const [deliveries, setDeliveries] = useState<DeliveryRecord[]>([]);

  useEffect(() => {
    ApiClient.getDeliveries({ customerId: 'cust_rahul_01' }).then(setDeliveries);
  }, []);

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-xs">
        <h1 className="text-xl font-bold text-[#081C15]">Delivery History</h1>
        <p className="text-xs text-[#52796F] mt-1">Daily drop-off records for August 2026.</p>
      </div>

      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs overflow-hidden divide-y divide-[#E5E7EB]">
        {deliveries.length === 0 ? (
          <div className="p-8 text-center text-[#52796F] text-xs">No delivery history records found.</div>
        ) : (
          deliveries.map((del) => (
            <div key={del.id} className="p-4 flex items-center justify-between hover:bg-[#F9FAF9] transition-colors">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#081C15] text-sm">{del.deliveryDate}</span>
                  <span className="text-[11px] text-[#52796F] font-medium">({del.deliveryTime})</span>
                </div>
                <p className="text-xs text-[#52796F] mt-0.5">
                  {del.quantity}L {del.productName} • ₹{del.totalPrice}
                </p>
                {del.notes && <p className="text-[11px] text-amber-800 italic mt-0.5">{del.notes}</p>}
              </div>

              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${
                  del.status === 'DELIVERED'
                    ? 'bg-[#D8E2DC] text-[#1B4332]'
                    : del.status === 'SKIPPED'
                    ? 'bg-slate-200 text-slate-700'
                    : 'bg-[#F7F9F7] text-[#1B4332] border border-[#E5E7EB]'
                }`}
              >
                {del.status === 'DELIVERED' && <CheckCircle2 className="w-3.5 h-3.5" />}
                {del.status === 'SKIPPED' && <XCircle className="w-3.5 h-3.5" />}
                {del.status}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
