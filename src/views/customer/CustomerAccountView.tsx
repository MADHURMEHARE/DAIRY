import React, { useState, useEffect } from 'react';
import { User as UserIcon, Phone, MapPin, ShieldCheck, Bell } from 'lucide-react';
import { Customer, User } from '../../types';
import { ApiClient } from '../../api/client';
import { getActiveCustomerId, getInitials } from '../../utils/userUtils';

interface CustomerAccountViewProps {
  currentUser?: User | null;
}

export const CustomerAccountView: React.FC<CustomerAccountViewProps> = ({ currentUser }) => {
  const [customer, setCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    const activeCustId = getActiveCustomerId(currentUser);
    ApiClient.getCustomerDetails(activeCustId).then((res) => setCustomer(res.customer));
  }, [currentUser]);

  if (!customer) return null;

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-[#1B4332] text-white font-bold text-xl flex items-center justify-center shadow-md">
            {getInitials(customer.name)}
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#081C15]">{customer.name}</h1>
            <p className="text-xs text-[#52796F] font-mono">{customer.phone}</p>
          </div>
        </div>

        <div className="space-y-3 pt-2 text-xs">
          <div className="bg-[#F7F9F7] p-3 rounded-xl border border-[#E5E7EB]">
            <span className="text-[#52796F] font-semibold block mb-0.5">Delivery Address</span>
            <p className="font-bold text-[#081C15]">{customer.address}, Amravati, Maharashtra - {customer.pincode}</p>
          </div>

          <div className="bg-[#F7F9F7] p-3 rounded-xl border border-[#E5E7EB]">
            <span className="text-[#52796F] font-semibold block mb-0.5">Drop-off Instructions</span>
            <p className="font-semibold text-[#081C15]">{customer.notes || 'Leave milk pouch in the outside door bag.'}</p>
          </div>

          <div className="bg-[#D8E2DC] p-3 rounded-xl border border-[#E5E7EB] text-[#1B4332] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#1B4332]" />
              <span className="font-bold">Verified DairyOS Member</span>
            </div>
            <span className="text-[10px] bg-white text-[#1B4332] font-bold px-2 py-0.5 rounded-md border border-[#E5E7EB]">Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};
