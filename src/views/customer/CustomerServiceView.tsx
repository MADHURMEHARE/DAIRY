import React, { useState, useEffect } from 'react';
import { LifeBuoy, Plus, Clock, CheckCircle2, AlertCircle, Phone, MessageSquare, Send, RefreshCw } from 'lucide-react';
import { ServiceTicket, TicketCategory, User } from '../../types';
import { ApiClient } from '../../api/client';
import { getActiveCustomerId } from '../../utils/userUtils';

interface CustomerServiceViewProps {
  currentUser?: User | null;
}

export const CustomerServiceView: React.FC<CustomerServiceViewProps> = ({ currentUser }) => {
  const [tickets, setTickets] = useState<ServiceTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);

  // New ticket state
  const [category, setCategory] = useState<TicketCategory>('MISSING_MILK');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('HIGH');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadTickets();
  }, [currentUser]);

  const loadTickets = async () => {
    setIsLoading(true);
    try {
      const activeCustId = getActiveCustomerId(currentUser);
      const data = await ApiClient.getServiceTickets(activeCustId);
      setTickets(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !description) {
      alert('Please enter a subject and detailed description');
      return;
    }

    setIsSubmitting(true);
    try {
      const activeCustId = getActiveCustomerId(currentUser);
      await ApiClient.createServiceTicket({
        customerId: activeCustId,
        customerName: currentUser?.name || 'Valued Customer',
        customerPhone: currentUser?.phone || '',
        category,
        subject,
        description,
        priority,
      });

      setSubject('');
      setDescription('');
      setShowNewModal(false);
      loadTickets();
    } catch (err: any) {
      alert(err.message || 'Failed to submit service request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryLabel = (cat: TicketCategory) => {
    switch (cat) {
      case 'MISSING_MILK':
        return '🥛 Missing / Undelivered Milk';
      case 'QUALITY_ISSUE':
        return '🧪 Milk Quality or Sourness';
      case 'CHANGE_ADDRESS':
        return '📍 Change Delivery Location';
      case 'PAUSE_RESUME':
        return '⏸️ Pause / Resume Request';
      case 'BILLING':
        return '🧾 Billing & Payment Query';
      default:
        return '❓ General Question';
    }
  };

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      {/* Banner */}
      <div className="bg-[#1B4332] text-white p-5 rounded-2xl shadow-sm space-y-3 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LifeBuoy className="w-6 h-6 text-[#D8E2DC]" />
            <h1 className="text-xl font-bold">Anandwan Care & Support</h1>
          </div>
          <button
            onClick={() => setShowNewModal(true)}
            className="px-3.5 py-1.5 bg-[#2D6A4F] hover:bg-[#23533e] text-white font-bold text-xs rounded-xl shadow-2xs flex items-center gap-1 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Raise Request
          </button>
        </div>
        <p className="text-xs text-[#D8E2DC]">
          Have an issue with morning milk delivery, quality, or billing? Our dedicated support team responds within 15 minutes.
        </p>
      </div>

      {/* Quick Helpline Hotline Cards */}
      <div className="grid grid-cols-2 gap-3">
        <a
          href="tel:+919850012345"
          className="bg-white p-3.5 rounded-2xl border border-[#E5E7EB] shadow-2xs hover:border-[#1B4332] transition-colors flex items-center gap-3"
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-[#1B4332] flex items-center justify-center shrink-0">
            <Phone className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-[#52796F] uppercase block">Direct Phone</span>
            <span className="text-xs font-bold text-[#081C15]">+91 98500 12345</span>
          </div>
        </a>

        <a
          href="https://wa.me/919850012345?text=Hello%20Anandwan%20Milk%20Dairy%20Support"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white p-3.5 rounded-2xl border border-[#E5E7EB] shadow-2xs hover:border-[#1B4332] transition-colors flex items-center gap-3"
        >
          <div className="w-9 h-9 rounded-xl bg-green-100 text-green-700 flex items-center justify-center shrink-0">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-[#52796F] uppercase block">WhatsApp Care</span>
            <span className="text-xs font-bold text-[#081C15]">Instant Chat</span>
          </div>
        </a>
      </div>

      {/* Tickets List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#081C15]">Your Active Support Requests</h2>
          <button
            onClick={loadTickets}
            className="text-xs text-[#1B4332] font-semibold hover:underline flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" /> Refresh
          </button>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-xs text-[#52796F]">Loading support requests...</div>
        ) : tickets.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-[#E5E7EB] text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#F7F9F7] text-[#1B4332] flex items-center justify-center mx-auto text-2xl">
              👍
            </div>
            <h3 className="font-bold text-[#081C15] text-sm">No support requests</h3>
            <p className="text-xs text-[#52796F]">Everything looks great! Need help? Click 'Raise Request'.</p>
          </div>
        ) : (
          tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-2xs space-y-3"
            >
              <div className="flex items-start justify-between gap-2 border-b border-[#E5E7EB] pb-2.5">
                <div>
                  <span className="font-mono text-[11px] font-bold text-[#52796F] block">{ticket.ticketNumber}</span>
                  <h3 className="font-bold text-[#081C15] text-xs leading-snug mt-0.5">{ticket.subject}</h3>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap ${
                    ticket.status === 'RESOLVED'
                      ? 'bg-green-100 text-green-800 border-green-200'
                      : ticket.status === 'IN_PROGRESS'
                      ? 'bg-amber-100 text-amber-800 border-amber-200'
                      : 'bg-blue-100 text-blue-800 border-blue-200'
                  }`}
                >
                  {ticket.status.replace(/_/g, ' ')}
                </span>
              </div>

              <div className="text-xs space-y-1">
                <span className="text-[11px] font-semibold text-[#1B4332] bg-[#F7F9F7] px-2 py-0.5 rounded border border-[#E5E7EB] inline-block">
                  {getCategoryLabel(ticket.category)}
                </span>
                <p className="text-[#52796F] text-xs leading-relaxed pt-1">{ticket.description}</p>
              </div>

              {ticket.resolutionNote && (
                <div className="bg-[#F7F9F7] p-2.5 rounded-xl border border-emerald-200 text-xs space-y-0.5">
                  <span className="font-bold text-[#1B4332] flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Resolution Response:
                  </span>
                  <p className="text-[#081C15] pl-4">{ticket.resolutionNote}</p>
                </div>
              )}

              <div className="flex justify-between items-center text-[10px] text-[#52796F] pt-1">
                <span>Created: {ticket.createdAt}</span>
                {ticket.updatedAt && <span>Updated: {ticket.updatedAt}</span>}
              </div>
            </div>
          ))
        )}
      </div>

      {/* New Ticket Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-5 border border-[#E5E7EB] space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
              <h3 className="font-bold text-[#081C15] text-sm">Raise Service Request</h3>
              <button
                onClick={() => setShowNewModal(false)}
                className="text-[#52796F] hover:text-[#081C15] p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitTicket} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-[#081C15] block mb-1">Service Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as TicketCategory)}
                  className="w-full px-3 py-2 bg-[#F7F9F7] rounded-xl border border-[#E5E7EB] text-xs font-bold text-[#081C15] focus:outline-none focus:border-[#1B4332]"
                >
                  <option value="MISSING_MILK">🥛 Missing / Undelivered Milk</option>
                  <option value="QUALITY_ISSUE">🧪 Milk Quality or Sourness Issue</option>
                  <option value="CHANGE_ADDRESS">📍 Change Delivery Address</option>
                  <option value="PAUSE_RESUME">⏸️ Pause / Resume Subscription</option>
                  <option value="BILLING">🧾 Billing or Payment Issue</option>
                  <option value="OTHER">❓ Other Inquiry</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[#081C15] block mb-1">Short Subject *</label>
                <input
                  type="text"
                  placeholder="e.g. Milk bottle missing for today morning"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-[#F7F9F7] rounded-xl border border-[#E5E7EB] text-xs font-semibold text-[#081C15] focus:outline-none focus:border-[#1B4332]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#081C15] block mb-1">Detailed Description *</label>
                <textarea
                  rows={3}
                  placeholder="Describe what happened so our team can resolve it immediately..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-[#F7F9F7] rounded-xl border border-[#E5E7EB] text-xs font-semibold text-[#081C15] focus:outline-none focus:border-[#1B4332]"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-[#081C15] font-bold text-xs rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 bg-[#1B4332] hover:bg-[#143326] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" /> Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
