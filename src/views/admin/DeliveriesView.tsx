import React, { useState, useEffect } from 'react';
import { Truck, CheckCircle2, XCircle, Clock, Calendar, Filter, Search, UserPlus, Phone, MapPin, X } from 'lucide-react';
import { DeliveryRecord } from '../../types';
import { ApiClient } from '../../api/client';

export const DeliveriesView: React.FC = () => {
  const [deliveries, setDeliveries] = useState<DeliveryRecord[]>([]);
  const [selectedDate, setSelectedDate] = useState('2026-08-08');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [timeFilter, setTimeFilter] = useState('ALL');

  // Staff Modal State
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [staffList, setStaffList] = useState([
    { id: 'staff_01', name: 'Ramesh Kumar', phone: '9123456789', route: 'Rajapeth & Green Park' },
    { id: 'staff_02', name: 'Suresh Patil', phone: '9876543210', route: 'Badnera Road & Camp Area' }
  ]);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffPhone, setNewStaffPhone] = useState('');
  const [newStaffRoute, setNewStaffRoute] = useState('');

  useEffect(() => {
    loadDeliveries();
  }, [selectedDate]);

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName || !newStaffPhone) return;
    const newStaff = {
      id: `staff_${Date.now()}`,
      name: newStaffName,
      phone: newStaffPhone,
      route: newStaffRoute || 'Central Route'
    };
    setStaffList([...staffList, newStaff]);
    alert(`Delivery Staff ${newStaffName} created! Mobile: ${newStaffPhone}`);
    setNewStaffName('');
    setNewStaffPhone('');
    setNewStaffRoute('');
    setShowStaffModal(false);
  };

  useEffect(() => {
    loadDeliveries();
  }, [selectedDate]);

  const loadDeliveries = async () => {
    try {
      const list = await ApiClient.getDeliveries({ date: selectedDate });
      setDeliveries(list);
    } catch (e) {
      console.error(e);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const updated = await ApiClient.updateDeliveryStatus(id, newStatus);
      setDeliveries((prev) => prev.map((d) => (d.id === id ? updated : d)));
    } catch (e) {
      alert('Failed to update status');
    }
  };

  const filteredDeliveries = deliveries.filter((d) => {
    const matchStatus = statusFilter === 'ALL' || d.status === statusFilter;
    const matchTime = timeFilter === 'ALL' || d.deliveryTime === timeFilter;
    return matchStatus && matchTime;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-[#081C15] tracking-tight">Daily Deliveries</h1>
          <p className="text-xs text-[#52796F] mt-1">
            Track daily milk drop-offs, mark completed routes, and review skipped dates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowStaffModal(true)}
            className="px-3.5 py-2 bg-[#1B4332] hover:bg-[#143326] text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Add Delivery Staff</span>
          </button>
          <Calendar className="w-4 h-4 text-[#52796F]" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 bg-[#F7F9F7] border border-[#E5E7EB] rounded-xl text-xs font-bold text-[#081C15] focus:outline-none"
          />
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className="text-[#52796F]">Shift:</span>
          {['ALL', 'MORNING', 'EVENING'].map((tm) => (
            <button
              key={tm}
              onClick={() => setTimeFilter(tm)}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                timeFilter === tm
                  ? 'bg-[#1B4332] text-white font-bold'
                  : 'bg-[#F7F9F7] text-[#52796F] hover:bg-[#E5E7EB]'
              }`}
            >
              {tm === 'ALL' ? 'All Shifts' : tm}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className="text-[#52796F]">Status:</span>
          {['ALL', 'DELIVERED', 'PENDING', 'SCHEDULED', 'SKIPPED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded-lg transition-colors text-[11px] ${
                statusFilter === st
                  ? 'bg-[#1B4332] text-white font-bold'
                  : 'bg-[#F7F9F7] text-[#52796F] hover:bg-[#E5E7EB]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Deliveries List */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FDFCF9] text-[#52796F] text-xs font-bold uppercase tracking-wider border-b border-[#E5E7EB]">
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Item & Quantity</th>
                <th className="py-3.5 px-4">Time & Staff</th>
                <th className="py-3.5 px-4">Address</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Update Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-[#081C15] font-medium">
              {filteredDeliveries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#52796F] text-xs">
                    No delivery records found for this date and filter.
                  </td>
                </tr>
              ) : (
                filteredDeliveries.map((del) => (
                  <tr key={del.id} className="hover:bg-[#F9FAF9] transition-colors">
                    <td className="py-3.5 px-4 font-bold text-[#081C15]">
                      {del.customerName}
                      <span className="block text-[11px] text-[#52796F] font-mono font-normal">{del.customerPhone}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-[#081C15]">{del.productName}</span>
                      <span className="ml-1.5 font-bold text-[#1B4332] bg-[#D8E2DC] px-2 py-0.5 rounded-md">
                        {del.quantity}L
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="capitalize font-semibold text-[#081C15]">{del.deliveryTime.toLowerCase()}</span>
                      <span className="block text-[11px] text-[#52796F]">{del.deliveryStaffName || 'Ramesh Kumar'}</span>
                    </td>
                    <td className="py-3.5 px-4 text-[#52796F] max-w-xs truncate">{del.customerAddress}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 font-bold px-2.5 py-1 rounded-full text-[11px] ${
                          del.status === 'DELIVERED'
                            ? 'bg-[#D8E2DC] text-[#1B4332]'
                            : del.status === 'PENDING'
                            ? 'bg-amber-100 text-amber-900'
                            : del.status === 'SCHEDULED'
                            ? 'bg-[#F7F9F7] text-[#1B4332] border border-[#E5E7EB]'
                            : del.status === 'SKIPPED'
                            ? 'bg-slate-200 text-slate-700'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {del.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1">
                      {del.status !== 'DELIVERED' && (
                        <button
                          onClick={() => handleStatusChange(del.id, 'DELIVERED')}
                          className="px-2.5 py-1 bg-[#1B4332] hover:bg-[#143326] text-white font-bold rounded-lg text-[11px]"
                        >
                          Delivered
                        </button>
                      )}
                      {del.status !== 'SKIPPED' && (
                        <button
                          onClick={() => handleStatusChange(del.id, 'SKIPPED')}
                          className="px-2.5 py-1 bg-[#F7F9F7] hover:bg-[#E5E7EB] text-[#52796F] font-semibold rounded-lg text-[11px] border border-[#E5E7EB]"
                        >
                          Skipped
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Staff Onboarding Modal */}
      {showStaffModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-[#E5E7EB] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
              <div>
                <h3 className="font-bold text-base text-[#081C15]">Create Delivery Staff</h3>
                <p className="text-xs text-[#52796F]">Onboard field delivery agent for your dairy store</p>
              </div>
              <button
                onClick={() => setShowStaffModal(false)}
                className="text-[#52796F] hover:text-[#081C15] p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Existing Staff List */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-[#52796F] uppercase tracking-wider block">Existing Delivery Staff ({staffList.length})</span>
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {staffList.map((st) => (
                  <div key={st.id} className="p-2.5 bg-[#F7F9F7] rounded-xl border border-[#E5E7EB] flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-[#081C15] block">{st.name}</span>
                      <span className="text-[10px] text-[#52796F]">Route: {st.route}</span>
                    </div>
                    <span className="font-mono text-[11px] font-semibold text-[#1B4332]">{st.phone}</span>
                  </div>
                ))}
              </div>
            </div>

            <form onSubmit={handleAddStaff} className="space-y-3 pt-2 border-t border-[#E5E7EB]">
              <span className="text-xs font-bold text-[#081C15] block">+ Onboard New Staff Agent</span>
              <div>
                <label className="text-[11px] font-bold text-[#52796F] block mb-1">Staff Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={newStaffName}
                  onChange={(e) => setNewStaffName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F7F9F7] rounded-xl border border-[#E5E7EB] text-xs font-semibold text-[#081C15] focus:outline-none focus:border-[#1B4332]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#52796F] block mb-1">Mobile Number (For Login OTP) *</label>
                <input
                  type="tel"
                  required
                  placeholder="10-digit phone"
                  maxLength={10}
                  value={newStaffPhone}
                  onChange={(e) => setNewStaffPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F7F9F7] rounded-xl border border-[#E5E7EB] text-xs font-semibold text-[#081C15] focus:outline-none focus:border-[#1B4332]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#52796F] block mb-1">Assigned Route / Area</label>
                <input
                  type="text"
                  placeholder="e.g. Sector 4, Rajapeth"
                  value={newStaffRoute}
                  onChange={(e) => setNewStaffRoute(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F7F9F7] rounded-xl border border-[#E5E7EB] text-xs font-semibold text-[#081C15] focus:outline-none focus:border-[#1B4332]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#1B4332] hover:bg-[#143326] text-white font-bold text-xs rounded-xl shadow-xs transition-all mt-1"
              >
                Save & Authorize Staff Login
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
