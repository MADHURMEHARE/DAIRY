import React, { useEffect, useState } from 'react';
import {
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  LockKeyhole,
} from 'lucide-react';

import { Invoice, User } from '../../types';
import { ApiClient } from '../../api/client';
import { InvoiceModal } from '../../components/InvoiceModal';
import { RazorpayModal } from '../../components/RazorpayModal';

interface CustomerBillsViewProps {
  currentUser?: User | null;
}

export const CustomerBillsView: React.FC<CustomerBillsViewProps> = ({
  currentUser,
}) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] =
    useState<Invoice | null>(null);

  const [showRazorpay, setShowRazorpay] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser) {
      setInvoices([]);
      setError(null);
      setIsLoading(false);
      return;
    }

    loadInvoices();
  }, [currentUser]);

  const loadInvoices = async () => {
    if (!currentUser) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Do NOT pass customerId from the frontend.
      // Backend identifies the authenticated customer.
      const data = await ApiClient.getInvoices();

      setInvoices(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('Failed to load invoices:', error);

      if (error?.response?.status === 401) {
        setError('Please login to view your bills.');
      } else {
        setError('Unable to load your bills.');
      }

      setInvoices([]);
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
        <div className="bg-white w-full max-w-sm p-8 rounded-2xl border border-[#E5E7EB] text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#F7F9F7] text-[#52796F] flex items-center justify-center mx-auto">
            <LockKeyhole className="w-7 h-7" />
          </div>

          <h3 className="font-bold text-[#081C15] text-lg">
            Login Required
          </h3>

          <p className="text-xs text-[#52796F]">
            Please login to view your milk bills and payment history.
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

  return (
    <div className="space-y-4">
      {/* Header */}

      <div>
        <h2 className="text-lg font-bold text-[#081C15]">
          My Milk Bills
        </h2>

        <p className="text-xs text-[#52796F] mt-1">
          Itemized monthly statements & online Razorpay receipts.
        </p>
      </div>

      {/* Loading */}

      {isLoading && (
        <div className="bg-white p-8 rounded-2xl border border-[#E5E7EB] text-center">
          <Clock className="w-7 h-7 mx-auto mb-3 text-[#52796F]" />

          <p className="text-xs text-[#52796F]">
            Loading your bills...
          </p>
        </div>
      )}

      {/* Error */}

      {!isLoading && error && (
        <div className="bg-white p-8 rounded-2xl border border-red-200 text-center space-y-3">
          <AlertCircle className="w-8 h-8 mx-auto text-red-500" />

          <h3 className="font-bold text-[#081C15]">
            Unable to load bills
          </h3>

          <p className="text-xs text-[#52796F]">
            {error}
          </p>

          <button
            onClick={loadInvoices}
            className="px-5 py-2.5 bg-[#1B4332] text-white font-bold rounded-xl text-xs"
          >
            Try Again
          </button>
        </div>
      )}

      {/* No bills */}

      {!isLoading && !error && invoices.length === 0 && (
        <div className="bg-white p-8 rounded-2xl border border-[#E5E7EB] text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#F7F9F7] text-[#52796F] flex items-center justify-center mx-auto">
            <FileText className="w-7 h-7" />
          </div>

          <h3 className="font-bold text-[#081C15] text-base">
            No bills available
          </h3>

          <p className="text-xs text-[#52796F] max-w-sm mx-auto">
            You don't have any monthly bills yet. Your bills will
            appear here once they are generated.
          </p>
        </div>
      )}

      {/* Bills */}

      {!isLoading && !error && invoices.length > 0 && (
        <div className="space-y-4">
          {invoices.map((inv) => (
            <div
              key={inv.id}
              className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-3 hover:shadow-md transition-all"
            >
              {/* Invoice Header */}

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono text-[#52796F] font-semibold">
                    {inv.invoiceNumber}
                  </span>

                  <h3 className="font-bold text-[#081C15] text-base">
                    {inv.month}
                  </h3>
                </div>

                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${
                    inv.status === 'PAID'
                      ? 'bg-[#D8E2DC] text-[#1B4332]'
                      : 'bg-amber-100 text-amber-900'
                  }`}
                >
                  {inv.status === 'PAID' ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <Clock className="w-3.5 h-3.5" />
                  )}

                  {inv.status}
                </span>
              </div>

              {/* Amount */}

              <div className="bg-[#F7F9F7] p-3 rounded-xl border border-[#E5E7EB] space-y-1 text-xs">
                <div className="flex justify-between text-[#52796F]">
                  <span>Total Amount:</span>

                  <span className="font-mono font-bold text-[#081C15]">
                    ₹{inv.totalAmount.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex justify-between text-[#52796F]">
                  <span>Paid Amount:</span>

                  <span className="font-mono font-bold text-green-700">
                    ₹{inv.paidAmount.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex justify-between font-bold text-[#081C15] border-t border-[#E5E7EB] pt-1">
                  <span className="text-red-700">
                    Due Balance:
                  </span>

                  <span className="font-mono text-red-700 font-bold">
                    ₹{inv.dueAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Actions */}

              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => {
                    setSelectedInvoice(inv);
                    setShowRazorpay(false);
                  }}
                  className="flex-1 py-2 bg-[#F7F9F7] hover:bg-[#E5E7EB] text-[#1B4332] font-bold rounded-xl text-xs transition-colors border border-[#E5E7EB]"
                >
                  View Itemized Bill
                </button>

                {inv.dueAmount > 0 && (
                  <button
                    onClick={() => {
                      setSelectedInvoice(inv);
                      setShowRazorpay(true);
                    }}
                    className="flex-1 py-2 bg-[#1B4332] hover:bg-[#143326] text-white font-bold rounded-xl text-xs shadow-xs transition-colors"
                  >
                    Pay ₹
                    {inv.dueAmount.toLocaleString('en-IN')} Now
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Invoice Modal */}

      {selectedInvoice && !showRazorpay && (
        <InvoiceModal
          invoice={selectedInvoice}
          isOpen={true}
          onClose={() => setSelectedInvoice(null)}
          onPayClick={() => setShowRazorpay(true)}
        />
      )}

      {/* Razorpay Modal */}

      {selectedInvoice && showRazorpay && (
        <RazorpayModal
          invoice={selectedInvoice}
          isOpen={true}
          onClose={() => {
            setShowRazorpay(false);
            setSelectedInvoice(null);
          }}
          onSuccess={() => {
            setShowRazorpay(false);
            setSelectedInvoice(null);
            loadInvoices();
          }}
        />
      )}
    </div>
  );
};