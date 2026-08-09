import React, { useState, useEffect } from 'react';
import { CreditCard, FileText, CheckCircle2, Clock, DollarSign, Download, Plus } from 'lucide-react';
import { Invoice, Payment } from '../../types';
import { ApiClient } from '../../api/client';
import { InvoiceModal } from '../../components/InvoiceModal';
import { RazorpayModal } from '../../components/RazorpayModal';

export const PaymentsView: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showRazorpay, setShowRazorpay] = useState(false);
  const [activeTab, setActiveTab] = useState<'INVOICES' | 'TRANSACTIONS'>('INVOICES');

  useEffect(() => {
    loadBillingData();
  }, []);

  const loadBillingData = async () => {
    try {
      const invs = await ApiClient.getInvoices();
      const pays = await ApiClient.getPayments();
      setInvoices(invs);
      setPayments(pays);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-[#081C15] tracking-tight">Billing & Payments</h1>
          <p className="text-xs text-[#52796F] mt-1">
            Automated monthly invoices based on actual delivered milk quantities.
          </p>
        </div>

        <div className="flex items-center bg-[#F7F9F7] p-1 rounded-xl text-xs font-semibold border border-[#E5E7EB]">
          <button
            onClick={() => setActiveTab('INVOICES')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'INVOICES' ? 'bg-[#1B4332] text-white shadow-xs font-bold' : 'text-[#52796F]'
            }`}
          >
            Invoices
          </button>
          <button
            onClick={() => setActiveTab('TRANSACTIONS')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'TRANSACTIONS' ? 'bg-[#1B4332] text-white shadow-xs font-bold' : 'text-[#52796F]'
            }`}
          >
            Payment Transactions
          </button>
        </div>
      </div>

      {activeTab === 'INVOICES' ? (
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FDFCF9] text-[#52796F] text-xs font-bold uppercase tracking-wider border-b border-[#E5E7EB]">
                  <th className="py-3.5 px-4">Invoice #</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Billing Month</th>
                  <th className="py-3.5 px-4 text-right">Total Amount</th>
                  <th className="py-3.5 px-4 text-right">Paid</th>
                  <th className="py-3.5 px-4 text-right">Due Balance</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-[#081C15] font-medium">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-[#F9FAF9] transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#081C15]">{inv.invoiceNumber}</td>
                    <td className="py-3.5 px-4 font-bold text-[#081C15]">{inv.customerName}</td>
                    <td className="py-3.5 px-4 font-semibold text-[#52796F]">{inv.month}</td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-[#081C15]">
                      ₹{inv.totalAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-semibold text-green-700">
                      ₹{inv.paidAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-red-700">
                      ₹{inv.dueAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 font-bold px-2.5 py-1 rounded-full text-[11px] ${
                          inv.status === 'PAID'
                            ? 'bg-[#D8E2DC] text-[#1B4332]'
                            : inv.status === 'PARTIAL'
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center space-x-1">
                      <button
                        onClick={() => setSelectedInvoice(inv)}
                        className="px-2.5 py-1 bg-[#F7F9F7] hover:bg-[#E5E7EB] text-[#1B4332] font-bold rounded-lg text-[11px] border border-[#E5E7EB]"
                      >
                        View Bill
                      </button>
                      {inv.dueAmount > 0 && (
                        <button
                          onClick={() => {
                            setSelectedInvoice(inv);
                            setShowRazorpay(true);
                          }}
                          className="px-2.5 py-1 bg-[#1B4332] hover:bg-[#143326] text-white font-bold rounded-lg text-[11px]"
                        >
                          Collect Payment
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FDFCF9] text-[#52796F] text-xs font-bold uppercase tracking-wider border-b border-[#E5E7EB]">
                  <th className="py-3.5 px-4">Txn Ref ID</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Method</th>
                  <th className="py-3.5 px-4 text-right">Amount</th>
                  <th className="py-3.5 px-4">Date & Time</th>
                  <th className="py-3.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-[#081C15] font-medium">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-[#F9FAF9] transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#081C15]">{p.paymentId}</td>
                    <td className="py-3.5 px-4 font-bold text-[#081C15]">{p.customerName}</td>
                    <td className="py-3.5 px-4 font-semibold text-[#52796F]">{p.paymentMethod.replace('RAZORPAY_', '')}</td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-green-700">
                      +₹{p.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-[#52796F]">{p.transactionDate}</td>
                    <td className="py-3.5 px-4">
                      <span className="bg-[#D8E2DC] text-[#1B4332] px-2 py-0.5 rounded-md font-bold text-[10px]">
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

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
            loadBillingData();
          }}
        />
      )}
    </div>
  );
};
