import React, { useState, useEffect } from 'react';
import { FileText, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { Invoice, User } from '../../types';
import { ApiClient } from '../../api/client';
import { InvoiceModal } from '../../components/InvoiceModal';
import { RazorpayModal } from '../../components/RazorpayModal';
import { getActiveCustomerId } from '../../utils/userUtils';

interface CustomerBillsViewProps {
  currentUser?: User | null;
}

export const CustomerBillsView: React.FC<CustomerBillsViewProps> = ({ currentUser }) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showRazorpay, setShowRazorpay] = useState(false);

  useEffect(() => {
    loadInvoices();
  }, [currentUser]);

  const loadInvoices = async () => {
    const activeCustId = getActiveCustomerId(currentUser);
    const data = await ApiClient.getInvoices(activeCustId);
    setInvoices(data);
  };

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-xs">
        <h1 className="text-xl font-bold text-[#081C15]">My Milk Bills</h1>
        <p className="text-xs text-[#52796F] mt-1">Itemized monthly statements & online Razorpay receipts.</p>
      </div>

      <div className="space-y-4">
        {invoices.map((inv) => (
          <div
            key={inv.id}
            className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-3 hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-mono text-[#52796F] font-semibold">{inv.invoiceNumber}</span>
                <h3 className="font-bold text-[#081C15] text-base">{inv.month}</h3>
              </div>
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${
                  inv.status === 'PAID'
                    ? 'bg-[#D8E2DC] text-[#1B4332]'
                    : 'bg-amber-100 text-amber-900'
                }`}
              >
                {inv.status}
              </span>
            </div>

            <div className="bg-[#F7F9F7] p-3 rounded-xl border border-[#E5E7EB] space-y-1 text-xs">
              <div className="flex justify-between text-[#52796F]">
                <span>Total Amount:</span>
                <span className="font-mono font-bold text-[#081C15]">₹{inv.totalAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-[#52796F]">
                <span>Paid Amount:</span>
                <span className="font-mono font-bold text-green-700">₹{inv.paidAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between font-bold text-[#081C15] border-t border-[#E5E7EB] pt-1">
                <span className="text-red-700">Due Balance:</span>
                <span className="font-mono text-red-700 font-bold">₹{inv.dueAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setSelectedInvoice(inv)}
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
                  Pay ₹{inv.dueAmount.toLocaleString('en-IN')} Now
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Invoice Modal */}
      {selectedInvoice && !showRazorpay && (
        <InvoiceModal
          invoice={selectedInvoice}
          isOpen={!!selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          onPayClick={() => setShowRazorpay(true)}
        />
      )}

      {/* Razorpay Modal */}
      {selectedInvoice && showRazorpay && (
        <RazorpayModal
          invoice={selectedInvoice}
          isOpen={showRazorpay}
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
