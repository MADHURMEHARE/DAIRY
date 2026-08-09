import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Milk,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Plus,
  Calendar,
  Filter,
  Search,
  ArrowUpRight,
  Truck
} from 'lucide-react';
import { DashboardOverview, DeliveryRecord } from '../../types';
import { ApiClient } from '../../api/client';

interface DashboardViewProps {
  onNavigate: (tab: string) => void;
  onPayInvoiceClick?: (invoice: any) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [deliveries, setDeliveries] = useState<DeliveryRecord[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const reportsData = await ApiClient.getReports();
      setOverview(reportsData.overview);

      const todayDeliveries = await ApiClient.getDeliveries({ date: '2026-08-08' });
      setDeliveries(todayDeliveries);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (deliveryId: string, newStatus: string) => {
    try {
      const updated = await ApiClient.updateDeliveryStatus(deliveryId, newStatus);
      setDeliveries((prev) => prev.map((d) => (d.id === deliveryId ? updated : d)));
      loadDashboardData();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const filteredDeliveries = deliveries.filter((d) => {
    const matchesStatus = statusFilter === 'ALL' || d.status === statusFilter;
    const matchesSearch =
      d.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.customerAddress.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#081C15] tracking-tight">Good morning, Owner 👋</h1>
            <span className="text-xs bg-[#D8E2DC] text-[#1B4332] font-bold px-2.5 py-1 rounded-full">
              Amravati Branch
            </span>
          </div>
          <p className="text-xs text-[#52796F] mt-1">Here is your dairy business overview for today, Saturday, 08 August 2026.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('customers')}
            className="px-4 py-2 bg-[#1B4332] hover:bg-[#143326] text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add Customer
          </button>
          <button
            onClick={() => onNavigate('deliveries')}
            className="px-4 py-2 border border-[#E5E7EB] hover:bg-[#F7F9F7] text-[#1B4332] font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5"
          >
            <Truck className="w-4 h-4 text-[#52796F]" /> Route View
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Today's Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#52796F] uppercase tracking-wider">Today's Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-[#F7F9F7] text-[#1B4332] flex items-center justify-center font-bold">
              ₹
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-[#1B4332]">
              ₹{overview ? overview.todayRevenue.toLocaleString('en-IN') : '18,450'}
            </p>
            <p className="text-[11px] text-green-700 font-medium flex items-center gap-0.5 mt-1">
              <TrendingUp className="w-3 h-3" /> +12.4% from yesterday
            </p>
          </div>
        </div>

        {/* Card 2: Milk Delivered */}
        <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#52796F] uppercase tracking-wider">Milk Delivered</span>
            <div className="w-8 h-8 rounded-xl bg-[#F7F9F7] text-[#1B4332] flex items-center justify-center font-bold">
              <Milk className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-[#1B4332]">
              {overview ? overview.milkDeliveredLitres : 324} L
            </p>
            <p className="text-[11px] text-[#52796F] mt-1">Cow, Buffalo & A2 Milk</p>
          </div>
        </div>

        {/* Card 3: Active Customers */}
        <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#52796F] uppercase tracking-wider">Active Customers</span>
            <div className="w-8 h-8 rounded-xl bg-[#F7F9F7] text-[#1B4332] flex items-center justify-center font-bold">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-[#1B4332]">
              {overview ? overview.activeCustomersCount : 186}
            </p>
            <p className="text-[11px] text-[#52796F] font-medium mt-1">Subscribed daily</p>
          </div>
        </div>

        {/* Card 4: Pending Deliveries */}
        <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#52796F] uppercase tracking-wider">Pending Deliveries</span>
            <div className="w-8 h-8 rounded-xl bg-[#F7F9F7] text-[#1B4332] flex items-center justify-center font-bold">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-[#1B4332]">
              {overview ? overview.pendingDeliveriesCount : 24}
            </p>
            <p className="text-[11px] text-[#52796F] font-medium mt-1">Morning & Evening routes</p>
          </div>
        </div>
      </div>

      {/* Today's Deliveries Section */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-[#081C15] tracking-tight">Today's Deliveries</h2>
            <p className="text-xs text-[#52796F]">Real-time delivery status for 08 August 2026</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#52796F] absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search customer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-[#F7F9F7] border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B4332] w-44 text-[#081C15]"
              />
            </div>

            {/* Filter pills */}
            <div className="flex items-center bg-[#F7F9F7] p-1 rounded-xl text-xs font-semibold border border-[#E5E7EB]">
              {['ALL', 'DELIVERED', 'PENDING', 'SCHEDULED', 'SKIPPED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] capitalize transition-colors ${
                    statusFilter === st ? 'bg-[#1B4332] text-white shadow-xs font-bold' : 'text-[#52796F] hover:text-[#081C15]'
                  }`}
                >
                  {st.toLowerCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Deliveries Table */}
        <div className="overflow-x-auto border border-[#E5E7EB] rounded-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FDFCF9] text-[#52796F] text-xs font-bold uppercase tracking-wider border-b border-[#E5E7EB]">
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Product / Quantity</th>
                <th className="py-3 px-4">Time</th>
                <th className="py-3 px-4">Address</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-[#081C15] font-medium">
              {filteredDeliveries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#52796F] text-xs">
                    No matching deliveries found
                  </td>
                </tr>
              ) : (
                filteredDeliveries.map((del) => (
                  <tr key={del.id} className="hover:bg-[#F9FAF9] transition-colors">
                    <td className="py-3.5 px-4 font-bold text-[#081C15]">
                      {del.customerName}
                      <span className="block text-[11px] font-mono text-[#52796F] font-normal">{del.customerPhone}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-[#081C15]">{del.productName}</span>
                      <span className="ml-1.5 font-bold text-[#1B4332] bg-[#D8E2DC]/60 px-2 py-0.5 rounded-md">
                        {del.quantity}L
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="capitalize font-semibold text-[#52796F]">{del.deliveryTime.toLowerCase()}</span>
                    </td>
                    <td className="py-3.5 px-4 text-[#52796F] max-w-xs truncate">{del.customerAddress}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 font-bold px-2.5 py-1 rounded-full text-[11px] ${
                          del.status === 'DELIVERED'
                            ? 'bg-green-100 text-green-800'
                            : del.status === 'PENDING'
                            ? 'bg-amber-100 text-amber-800'
                            : del.status === 'SCHEDULED'
                            ? 'bg-blue-100 text-blue-800'
                            : del.status === 'SKIPPED'
                            ? 'bg-gray-100 text-gray-700'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {del.status === 'DELIVERED' && <CheckCircle2 className="w-3 h-3" />}
                        {del.status === 'PENDING' && <Clock className="w-3 h-3" />}
                        {del.status === 'SKIPPED' && <XCircle className="w-3 h-3" />}
                        {del.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {del.status !== 'DELIVERED' ? (
                        <button
                          onClick={() => handleStatusChange(del.id, 'DELIVERED')}
                          className="px-2.5 py-1 bg-[#1B4332] hover:bg-[#143326] text-white font-bold rounded-lg text-[11px] transition-colors shadow-2xs"
                        >
                          Mark Delivered
                        </button>
                      ) : (
                        <span className="text-[11px] text-[#52796F] font-mono">Completed at {del.updatedAt || '07:00 AM'}</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
