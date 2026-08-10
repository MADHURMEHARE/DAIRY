import React, { useEffect, useState } from 'react';
import {
  User as UserIcon,
  Phone,
  MapPin,
  ShieldCheck,
  Bell,
  LockKeyhole,
} from 'lucide-react';

import { Customer, User } from '../../types';
import { ApiClient } from '../../api/client';
import { getInitials } from '../../utils/userUtils';

interface CustomerAccountViewProps {
  currentUser?: User | null;
}

export const CustomerAccountView: React.FC<CustomerAccountViewProps> = ({
  currentUser,
}) => {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      setCustomer(null);
      return;
    }

    loadCustomer();
  }, [currentUser]);

  const loadCustomer = async () => {
    if (!currentUser) return;

    setIsLoading(true);

    try {
      // Do NOT pass customerId from frontend.
      // Backend identifies the logged-in customer.
      const res = await ApiClient.getCustomerDetails();

      setCustomer(res.customer || null);
    } catch (error) {
      console.error('Failed to load customer:', error);
      setCustomer(null);
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================================
  // NOT LOGGED IN
  // ============================================================

  if (!currentUser) {
    return (
      <div className="min-h-[400px] flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-sm p-8 rounded-2xl border border-[#E5E7EB] shadow-sm text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#F7F9F7] text-[#52796F] flex items-center justify-center mx-auto">
            <LockKeyhole className="w-7 h-7" />
          </div>

          <h3 className="font-bold text-[#081C15] text-lg">
            Login Required
          </h3>

          <p className="text-xs text-[#52796F]">
            Please login to view your account details,
            address and delivery instructions.
          </p>

          <button
            onClick={() => {
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
        Loading your account...
      </div>
    );
  }

  // ============================================================
  // CUSTOMER NOT FOUND
  // ============================================================

  if (!customer) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-[#E5E7EB] text-center">
        <p className="text-sm font-bold text-[#081C15]">
          Unable to load your account
        </p>

        <button
          onClick={loadCustomer}
          className="mt-4 px-5 py-2.5 bg-[#1B4332] text-white font-bold rounded-xl text-xs"
        >
          Try Again
        </button>
      </div>
    );
  }

  // ============================================================
  // LOGGED-IN CUSTOMER
  // ============================================================

  return (
    <div className="space-y-4">
      {/* Profile Header */}

      <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[#D8E2DC] text-[#1B4332] flex items-center justify-center font-bold text-lg">
            {getInitials(customer.name)}
          </div>

          <div>
            <h2 className="font-bold text-[#081C15] text-lg">
              {customer.name}
            </h2>

            <div className="flex items-center gap-1.5 text-xs text-[#52796F] mt-1">
              <Phone className="w-3.5 h-3.5" />
              {customer.phone}
            </div>
          </div>
        </div>
      </div>

      {/* Account Information */}

      <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs">
        <h3 className="font-bold text-[#081C15] text-sm mb-3">
          Account Information
        </h3>

        <div className="space-y-3 pt-2 text-xs">
          {/* Address */}

          <div className="bg-[#F7F9F7] p-3 rounded-xl border border-[#E5E7EB]">
            <div className="flex items-center gap-1.5 text-[#52796F] font-semibold mb-1">
              <MapPin className="w-3.5 h-3.5" />
              Delivery Address
            </div>

            <p className="font-bold text-[#081C15]">
              {customer.address}, Amravati, Maharashtra -{' '}
              {customer.pincode}
            </p>
          </div>

          {/* Delivery Instructions */}

          <div className="bg-[#F7F9F7] p-3 rounded-xl border border-[#E5E7EB]">
            <div className="flex items-center gap-1.5 text-[#52796F] font-semibold mb-1">
              <Bell className="w-3.5 h-3.5" />
              Drop-off Instructions
            </div>

            <p className="font-semibold text-[#081C15]">
              {customer.notes ||
                'Leave milk pouch in the outside door bag.'}
            </p>
          </div>

          {/* Verified */}

          <div className="bg-[#D8E2DC] p-3 rounded-xl border border-[#E5E7EB] text-[#1B4332] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#1B4332]" />

              <span className="font-bold">
                Verified DairyOS Member
              </span>
            </div>

            <span className="text-[10px] bg-white text-[#1B4332] font-bold px-2 py-0.5 rounded-md border border-[#E5E7EB]">
              Active
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};