import React, { useState, useEffect } from 'react';
import { LifeBuoy, CheckCircle2, Clock, AlertCircle, RefreshCw, Send, Phone, MessageSquare } from 'lucide-react';
import { ServiceTicket } from '../../types';
import { ApiClient } from '../../api/client';

export const AdminServiceTicketsView: React.FC = () => {
  const [tickets, setTickets] = useState<ServiceTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'OPEN' | 'IN_PROGRESS' | 'RESOLVED'>('ALL');
  const [selectedTicket, setSelectedTicket] = useState<ServiceTicket | null>(null);
  const [resolutionText, setResolutionText] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    setIsLoading(true);
    try {
      const data = await ApiClient.getServiceTickets();
      setTickets(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (status: ServiceTicket['status']) => {
    if (!selectedTicket) return;
    setIsUpdating(true);
    try {
      await ApiClient.updateServiceTicketStatus(selectedTicket.id, status, resolutionText);
      setSelectedTicket(null);
      setResolutionText('');
      loadTickets();
    } catch (e) {
      alert('Failed to update ticket status');
    } finally {
      setIsUpdating(false);
    }
  };

  const filtered = tickets.filter((t) => {
    if (filter === 'ALL') return true;
    return t.status === filter;
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-[#1B4332] text-white p-6 rounded-2xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <LifeBuoy className="w-6 h-6 text-[#D8E2DC]" />
            <h1 className="text-xl font-bold">Service Now Desk (Customer Care)</h1>
          </div>
          <p className="text-xs text-[#D8E2DC] mt-1">
            Manage, respond to, and resolve customer complaints, missing milk tickets, and subscription pause queries.
          </p>
        </div>

        <button
          onClick={loadTickets}
          className="px-3.5 py-1.5 bg-[#2D6A4F] hover:bg-[#23533e] text-white font-bold text-xs rounded-xl shadow-2xs flex items-center gap-1 transition-colors shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Tickets
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-[#E5E7EB] text-xs font-bold w-fit">
        {(['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filter === tab
                ? 'bg-[#1B4332] text-white shadow-2xs'
                : 'text-[#52796F] hover:text-[#081C15]'
            }`}
          >
            {tab.replace(/_/g, ' ')} ({tickets.filter((t) => tab === 'ALL' || t.status === tab).length})
          </button>
        ))}
      </div>

      {/* Tickets Grid */}
      {isLoading ? (
        <div className="p-12 text-center text-xs text-[#52796F]">Loading service tickets...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-[#E5E7EB] text-center space-y-2">
          <p className="text-sm font-bold text-[#081C15]">No tickets found</p>
          <p className="text-xs text-[#52796F]">No customer service requests match this filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((ticket) => (
            <div
              key={ticket.id}
              className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-2xs space-y-3 hover:border-[#1B4332] transition-colors"
            >
              <div className="flex items-start justify-between gap-2 border-b border-[#E5E7EB] pb-2.5">
                <div>
                  <span className="font-mono text-[11px] font-bold text-[#52796F] block">{ticket.ticketNumber}</span>
                  <h3 className="font-bold text-[#081C15] text-xs mt-0.5">{ticket.subject}</h3>
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

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="font-bold text-[#081C15]">{ticket.customerName}</span>
                  <a href={`tel:${ticket.customerPhone}`} className="text-[#1B4332] font-semibold flex items-center gap-1 hover:underline">
                    <Phone className="w-3 h-3" /> {ticket.customerPhone}
                  </a>
                </div>

                <p className="text-[#52796F] text-xs leading-relaxed bg-[#F7F9F7] p-2.5 rounded-xl border border-[#E5E7EB]">
                  {ticket.description}
                </p>
              </div>

              {ticket.resolutionNote && (
                <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 text-xs">
                  <span className="font-bold text-emerald-800 block">Resolution:</span>
                  <p className="text-emerald-900 mt-0.5">{ticket.resolutionNote}</p>
                </div>
              )}

              <div className="pt-2 flex items-center justify-between border-t border-[#E5E7EB]">
                <span className="text-[10px] text-[#52796F]">{ticket.createdAt}</span>

                <button
                  onClick={() => {
                    setSelectedTicket(ticket);
                    setResolutionText(ticket.resolutionNote || '');
                  }}
                  className="px-3 py-1 bg-[#1B4332] hover:bg-[#143326] text-white text-xs font-bold rounded-lg shadow-2xs transition-colors"
                >
                  Respond / Resolve
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Respond Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-5 border border-[#E5E7EB] space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-[#52796F]">
                  Ticket #{selectedTicket.ticketNumber}
                </span>
                <h3 className="font-bold text-[#081C15] text-sm">{selectedTicket.subject}</h3>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="text-[#52796F] hover:text-[#081C15] p-1"
              >
                ✕
              </button>
            </div>

            <div className="bg-[#F7F9F7] p-3 rounded-xl border border-[#E5E7EB] space-y-1 text-xs">
              <span className="font-bold text-[#081C15]">{selectedTicket.customerName} ({selectedTicket.customerPhone})</span>
              <p className="text-[#52796F]">{selectedTicket.description}</p>
            </div>

            <div>
              <label className="text-xs font-bold text-[#081C15] block mb-1">Owner / Support Resolution Note</label>
              <textarea
                rows={3}
                placeholder="e.g., Replacement 1.5L bottle delivered by Ramesh Kumar or credited ₹68 to walllet balance."
                value={resolutionText}
                onChange={(e) => setResolutionText(e.target.value)}
                className="w-full px-3 py-2 bg-[#F7F9F7] rounded-xl border border-[#E5E7EB] text-xs font-semibold text-[#081C15] focus:outline-none focus:border-[#1B4332]"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleUpdateStatus('IN_PROGRESS')}
                disabled={isUpdating}
                className="py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-2xs transition-colors"
              >
                Mark In Progress
              </button>

              <button
                type="button"
                onClick={() => handleUpdateStatus('RESOLVED')}
                disabled={isUpdating}
                className="py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-2xs transition-colors flex items-center justify-center gap-1"
              >
                <CheckCircle2 className="w-3 h-3" /> Mark Resolved
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
