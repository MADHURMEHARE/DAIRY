import React, { useState } from 'react';
import { X, CheckCircle2, CreditCard, Smartphone, Building2, ShieldCheck, Loader2 } from 'lucide-react';
import { Invoice } from '../types';
import { ApiClient } from '../api/client';

interface RazorpayModalProps {
  invoice: Invoice;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const RazorpayModal: React.FC<RazorpayModalProps> = ({ invoice, isOpen, onClose, onSuccess }) => {
  const [method, setMethod] = useState<'RAZORPAY_UPI' | 'RAZORPAY_CARD' | 'RAZORPAY_NETBANKING'>('RAZORPAY_UPI');
  const [upiId, setUpiId] = useState('rahul.patil@upi');
  const [customAmount, setCustomAmount] = useState<number>(invoice.dueAmount || invoice.totalAmount);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [txnRef, setTxnRef] = useState('');

  if (!isOpen) return null;

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate Razorpay Gateway network delay
    setTimeout(async () => {
      try {
        const result = await ApiClient.recordPayment(invoice.id, customAmount, method, `Razorpay Payment via ${method}`);
        setTxnRef(result.payment.razorpayPaymentId || result.payment.paymentId);
        setIsProcessing(false);
        setIsCompleted(true);
        setTimeout(() => {
          onSuccess();
        }, 1800);
      } catch (err: any) {
        setIsProcessing(false);
        alert(err.message || 'Payment failed');
      }
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden relative animate-in fade-in zoom-in-95 duration-150">
        {/* Header with Razorpay badge */}
        <div className="bg-[#1B4332] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#2D6A4F] flex items-center justify-center font-bold text-sm tracking-wider text-white">
              RZP
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Anandwan Dairy Checkout</h3>
              <p className="text-xs text-[#D8E2DC] flex items-center gap-1 mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" /> Secured by Razorpay
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="text-[#D8E2DC] hover:text-white p-1 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Amount bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Invoice #{invoice.invoiceNumber}</p>
            <p className="text-xs text-slate-600 font-medium">{invoice.month} Bill</p>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-500 font-medium">Paying Amount</span>
            <p className="text-xl font-bold text-slate-900">₹{customAmount.toLocaleString('en-IN')}</p>
          </div>
        </div>

        {/* Modal Body */}
        {isCompleted ? (
          <div className="p-8 text-center flex flex-col items-center justify-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="text-xl font-bold text-slate-900">Payment Successful!</h4>
            <p className="text-sm text-slate-600">
              ₹{customAmount.toLocaleString('en-IN')} paid to Shree Dairy.
            </p>
            <div className="bg-slate-100 rounded-lg p-3 text-xs font-mono text-slate-600 w-full text-center mt-2">
              Txn ID: {txnRef}
            </div>
            <p className="text-xs text-slate-400 pt-2">Receipt sent to customer SMS & App notifications</p>
          </div>
        ) : (
          <form onSubmit={handlePay} className="p-5 space-y-4">
            {/* Custom Payment Amount Input if partial pay */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Amount to Pay (₹)
              </label>
              <input
                type="number"
                min="1"
                max={invoice.dueAmount || invoice.totalAmount}
                value={customAmount}
                onChange={(e) => setCustomAmount(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              />
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Select Payment Method
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setMethod('RAZORPAY_UPI')}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-medium transition-all ${
                    method === 'RAZORPAY_UPI'
                      ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold shadow-xs'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <Smartphone className="w-5 h-5 mb-1 text-blue-600" />
                  UPI / GPay
                </button>

                <button
                  type="button"
                  onClick={() => setMethod('RAZORPAY_CARD')}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-medium transition-all ${
                    method === 'RAZORPAY_CARD'
                      ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold shadow-xs'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <CreditCard className="w-5 h-5 mb-1 text-blue-600" />
                  Card
                </button>

                <button
                  type="button"
                  onClick={() => setMethod('RAZORPAY_NETBANKING')}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-medium transition-all ${
                    method === 'RAZORPAY_NETBANKING'
                      ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold shadow-xs'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <Building2 className="w-5 h-5 mb-1 text-blue-600" />
                  NetBanking
                </button>
              </div>
            </div>

            {/* Method Details Input */}
            {method === 'RAZORPAY_UPI' && (
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                <label className="block text-xs font-medium text-slate-600">VPA / Virtual Payment Address</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="mobile@upi"
                    className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    required
                  />
                  <span className="text-xs bg-emerald-100 text-emerald-700 font-medium px-2 py-1.5 rounded-lg flex items-center">
                    Verified
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">Google Pay, PhonePe, Paytm or BHIM UPI supported</p>
              </div>
            )}

            {method === 'RAZORPAY_CARD' && (
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                <input
                  type="text"
                  placeholder="Card Number (4532 •••• •••• 8821)"
                  defaultValue="4532 9812 3341 8821"
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="MM/YY"
                    defaultValue="08/28"
                    className="px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none"
                  />
                  <input
                    type="password"
                    placeholder="CVV"
                    defaultValue="821"
                    className="px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none"
                  />
                </div>
              </div>
            )}

            {method === 'RAZORPAY_NETBANKING' && (
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <select className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none">
                  <option>SBI - State Bank of India</option>
                  <option>HDFC Bank</option>
                  <option>ICICI Bank</option>
                  <option>Axis Bank</option>
                </select>
              </div>
            )}

            {/* Pay Button */}
            <button
              type="submit"
              disabled={isProcessing || customAmount <= 0}
              className="w-full py-3 bg-[#1B4332] hover:bg-[#143326] active:bg-[#081C15] text-white font-bold rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing Payment...
                </>
              ) : (
                `Pay ₹${customAmount.toLocaleString('en-IN')}`
              )}
            </button>

            <p className="text-[11px] text-center text-slate-400">
              🔒 256-Bit Bank Grade Encryption • Instant Confirmation
            </p>
          </form>
        )}
      </div>
    </div>
  );
};
