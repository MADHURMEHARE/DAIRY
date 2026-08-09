import React from 'react';
import { X, Printer, Download, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Invoice } from '../types';

interface InvoiceModalProps {
  invoice: Invoice | null;
  isOpen: boolean;
  onClose: () => void;
  onPayClick?: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ invoice, isOpen, onClose, onPayClick }) => {
  if (!isOpen || !invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header toolbar */}
        <div className="bg-[#1B4332] text-white px-6 py-4 flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-base">Bill Invoice</span>
            <span className="text-xs font-mono bg-[#143326] text-[#D8E2DC] px-2 py-0.5 rounded-md">
              {invoice.invoiceNumber}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 text-xs bg-[#143326] hover:bg-[#081C15] text-white px-3 py-1.5 rounded-lg transition-colors"
            >
              <Printer className="w-3.5 h-3.5" /> Print Bill
            </button>
            <button
              onClick={onClose}
              className="text-[#D8E2DC] hover:text-white p-1 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Invoice Printable Sheet */}
        <div className="p-8 space-y-6 text-slate-800 print:p-0">
          {/* Top Brand Header */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-start border-b border-slate-200 pb-6 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🥛</span>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Anandwan Milk Dairy</h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">Plot 42, Green Park Road, Rajapeth Square, Amravati</p>
              <p className="text-xs text-slate-500">Phone: +91 98500 12345 • GSTIN: 27AABCU9603R1ZM</p>
            </div>

            <div className="sm:text-right space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Monthly Invoice</span>
              <p className="text-lg font-bold text-slate-900">{invoice.month}</p>
              <div className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium mt-1" style={{
                backgroundColor: invoice.status === 'PAID' ? '#dcfce7' : invoice.status === 'PARTIAL' ? '#fef3c7' : '#fee2e2',
                color: invoice.status === 'PAID' ? '#166534' : invoice.status === 'PARTIAL' ? '#92400e' : '#991b1b',
              }}>
                {invoice.status === 'PAID' && <CheckCircle className="w-3.5 h-3.5" />}
                {invoice.status === 'PARTIAL' && <Clock className="w-3.5 h-3.5" />}
                {invoice.status === 'OVERDUE' && <AlertCircle className="w-3.5 h-3.5" />}
                {invoice.status}
              </div>
            </div>
          </div>

          {/* Customer & Dates Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Billed To
              </span>
              <p className="font-bold text-slate-900 text-base">{invoice.customerName}</p>
              <p className="text-xs text-slate-600 mt-0.5">{invoice.customerAddress}</p>
              <p className="text-xs text-slate-600 font-mono mt-0.5">{invoice.customerPhone}</p>
            </div>

            <div className="sm:text-right space-y-1">
              <div>
                <span className="text-xs text-slate-500">Billing Cycle: </span>
                <span className="text-xs font-semibold text-slate-800">{invoice.startDate} to {invoice.endDate}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500">Invoice Date: </span>
                <span className="text-xs font-semibold text-slate-800">{invoice.createdAt}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500">Payment Due: </span>
                <span className="text-xs font-bold text-red-600">{invoice.dueDate}</span>
              </div>
            </div>
          </div>

          {/* Itemized Table */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Itemized Delivery Summary</h4>
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-100 text-slate-700 text-xs uppercase font-semibold">
                  <tr>
                    <th className="px-4 py-3">Product Item</th>
                    <th className="px-4 py-3 text-center">Delivered / Skipped</th>
                    <th className="px-4 py-3 text-right">Total Qty</th>
                    <th className="px-4 py-3 text-right">Rate</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium text-slate-800">
                  {invoice.items.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3.5">
                        <span className="font-semibold text-slate-900 block">{item.productName}</span>
                      </td>
                      <td className="px-4 py-3.5 text-center text-xs">
                        <span className="inline-block bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-md mr-1">
                          {item.deliveredDaysCount} Days
                        </span>
                        {item.skippedDaysCount > 0 && (
                          <span className="inline-block bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded-md">
                            {item.skippedDaysCount} Skipped
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono">
                        {item.quantity} {item.unit}
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono">₹{item.rate}/{item.unit}</td>
                      <td className="px-4 py-3.5 text-right font-bold text-slate-900 font-mono">
                        ₹{item.amount.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pricing Totals */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end pt-2 gap-4">
            <div className="text-xs text-slate-500 max-w-sm">
              <p className="font-semibold text-slate-700 mb-1">Notes & Terms:</p>
              <p>• Charges are strictly based on daily verified deliveries.</p>
              <p>• Deliveries paused by customer before 05:00 AM are exempted.</p>
              <p>• For UPI/Online payments, click "Pay Now" or scan dairy QR code.</p>
            </div>

            <div className="w-full sm:w-64 space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex justify-between text-xs text-slate-600">
                <span>Subtotal:</span>
                <span className="font-mono font-medium">₹{invoice.subtotal.toLocaleString('en-IN')}</span>
              </div>
              {invoice.adjustments !== 0 && (
                <div className="flex justify-between text-xs text-emerald-600 font-medium">
                  <span>Pause Adjustment:</span>
                  <span className="font-mono">₹{invoice.adjustments.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-slate-900 border-t border-slate-200 pt-2">
                <span>Total Amount:</span>
                <span className="font-mono text-base">₹{invoice.totalAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-xs text-emerald-700 font-semibold">
                <span>Paid So Far:</span>
                <span className="font-mono">₹{invoice.paidAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-sm font-black text-red-600 border-t border-slate-200 pt-2">
                <span>Remaining Due:</span>
                <span className="font-mono text-lg">₹{invoice.dueAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Pay Button inside modal if unpaid */}
          {invoice.dueAmount > 0 && onPayClick && (
            <div className="no-print pt-4 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => {
                  onClose();
                  onPayClick();
                }}
                className="w-full sm:w-auto px-6 py-3 bg-[#1B4332] hover:bg-[#143326] text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                💳 Pay ₹{invoice.dueAmount.toLocaleString('en-IN')} Now
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
