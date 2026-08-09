import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Plus,
  Phone,
  MapPin,
  Calendar,
  AlertCircle,
  PauseCircle,
  PlayCircle,
  FileText,
  History,
  X,
  CheckCircle2
} from 'lucide-react';
import { Customer } from '../../types';
import { ApiClient } from '../../api/client';

export const CustomersView: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: 'Amravati',
    pincode: '444601',
    milkType: 'Cow Milk',
    quantityPerDay: '2',
    deliveryTime: 'MORNING',
    startDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const list = await ApiClient.getCustomers(searchQuery);
      setCustomers(list);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    ApiClient.getCustomers(e.target.value).then(setCustomers);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.address) {
      alert('Please fill in required fields');
      return;
    }

    try {
      const created = await ApiClient.createCustomer(formData);
      alert(`✅ Customer "${created.name}" created successfully! Daily milk subscription & delivery schedule activated.`);
      setShowAddModal(false);
      setFormData({
        name: '',
        phone: '',
        email: '',
        address: '',
        city: 'Amravati',
        pincode: '444601',
        milkType: 'Cow Milk',
        quantityPerDay: '2',
        deliveryTime: 'MORNING',
        startDate: new Date().toISOString().split('T')[0]
      });
      loadCustomers();
    } catch (err: any) {
      alert(err.message || 'Failed to add customer');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-[#081C15] tracking-tight">Customers</h1>
          <p className="text-xs text-[#52796F] mt-1">Manage subscribed households, milk quantities, and accounts.</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-[#1B4332] hover:bg-[#143326] text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Add Customer
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-xs flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#52796F] absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by customer name, phone, or address..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full pl-9 pr-4 py-2 text-xs bg-[#F7F9F7] border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B4332] text-[#081C15]"
          />
        </div>
      </div>

      {/* Customer List Table */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FDFCF9] text-[#52796F] text-xs font-bold uppercase tracking-wider border-b border-[#E5E7EB]">
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Address</th>
                <th className="py-3.5 px-4">Subscription</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Monthly Est.</th>
                <th className="py-3.5 px-4 text-right">Outstanding</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-[#081C15] font-medium">
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#52796F] text-xs">
                    No customers found matching search.
                  </td>
                </tr>
              ) : (
                customers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-[#F9FAF9] transition-colors">
                    <td className="py-3.5 px-4 font-bold text-[#081C15]">
                      {cust.name}
                      <span className="block text-[11px] font-mono text-[#52796F] font-normal flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-[#52796F]" /> {cust.phone}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs text-[#52796F] truncate">{cust.address}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-[#081C15]">{cust.milkType}</span>
                      <span className="ml-1.5 font-bold text-[#1B4332] bg-[#D8E2DC]/60 px-2 py-0.5 rounded-md">
                        {cust.quantityPerDay}L / Day
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 font-bold px-2.5 py-1 rounded-full text-[11px] ${
                          cust.subscriptionStatus === 'ACTIVE'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {cust.subscriptionStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-semibold text-[#081C15]">
                      ₹{cust.monthlyEstimate.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {cust.outstandingBalance > 0 ? (
                        <span className="font-mono font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-md">
                          ₹{cust.outstandingBalance.toLocaleString('en-IN')}
                        </span>
                      ) : (
                        <span className="font-mono font-semibold text-green-700">₹0 (Paid)</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => setSelectedCustomer(cust)}
                        className="px-3 py-1 bg-[#F7F9F7] hover:bg-[#E5E7EB] text-[#1B4332] font-bold rounded-lg text-[11px] transition-colors border border-[#E5E7EB]"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-[#E5E7EB] w-full max-w-lg overflow-hidden my-6">
            <div className="bg-[#1B4332] text-white p-5 flex items-center justify-between">
              <h3 className="font-bold text-base">Add New Customer</h3>
              <button onClick={() => setShowAddModal(false)} className="text-[#D8E2DC] hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-4 text-xs font-medium text-[#081C15]">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block font-semibold mb-1">Customer Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Patil"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F7F9F7] border border-[#E5E7EB] rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98230 11223"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F7F9F7] border border-[#E5E7EB] rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="rahul@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F7F9F7] border border-[#E5E7EB] rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block font-semibold mb-1">Street Address *</label>
                  <input
                    type="text"
                    required
                    placeholder="Flat / House No, Building, Colony"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F7F9F7] border border-[#E5E7EB] rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Milk Type</label>
                  <select
                    value={formData.milkType}
                    onChange={(e) => setFormData({ ...formData, milkType: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F7F9F7] border border-[#E5E7EB] rounded-lg text-xs font-medium focus:outline-none"
                  >
                    <option value="Cow Milk">Cow Milk (₹60/L)</option>
                    <option value="Buffalo Milk">Buffalo Milk (₹70/L)</option>
                    <option value="A2 Desi Cow Milk">A2 Desi Cow Milk (₹90/L)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Quantity Per Day (L)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    value={formData.quantityPerDay}
                    onChange={(e) => setFormData({ ...formData, quantityPerDay: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F7F9F7] border border-[#E5E7EB] rounded-lg text-xs font-medium focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Delivery Time</label>
                  <select
                    value={formData.deliveryTime}
                    onChange={(e) => setFormData({ ...formData, deliveryTime: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F7F9F7] border border-[#E5E7EB] rounded-lg text-xs font-medium focus:outline-none"
                  >
                    <option value="MORNING">Morning (06:00 AM)</option>
                    <option value="EVENING">Evening (06:00 PM)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F7F9F7] border border-[#E5E7EB] rounded-lg text-xs font-medium focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 border border-[#E5E7EB] hover:bg-[#F7F9F7] font-semibold rounded-xl text-xs text-[#52796F]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#1B4332] hover:bg-[#143326] text-white font-bold rounded-xl text-xs shadow-md"
                >
                  Create Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer Detail Drawer / Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-[#E5E7EB] w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-[#1B4332] text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg">{selectedCustomer.name}</h3>
                <p className="text-xs text-[#D8E2DC]">{selectedCustomer.phone}</p>
              </div>
              <button onClick={() => setSelectedCustomer(null)} className="text-[#D8E2DC] hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs font-medium text-[#081C15]">
              <div className="bg-[#F7F9F7] p-3 rounded-xl border border-[#E5E7EB] space-y-1">
                <span className="text-[#52796F] font-semibold">Address:</span>
                <p className="font-semibold text-[#081C15]">{selectedCustomer.address}, Amravati</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#F7F9F7] p-3 rounded-xl border border-[#E5E7EB]">
                  <span className="text-[#1B4332] font-semibold">Subscription</span>
                  <p className="font-bold text-[#081C15] text-sm mt-0.5">{selectedCustomer.milkType}</p>
                  <p className="text-[11px] text-[#52796F] font-semibold">{selectedCustomer.quantityPerDay}L / Day ({selectedCustomer.deliveryTime})</p>
                </div>

                <div className="bg-[#F7F9F7] p-3 rounded-xl border border-[#E5E7EB]">
                  <span className="text-[#52796F] font-semibold">Monthly Estimate</span>
                  <p className="font-bold text-[#081C15] text-base mt-0.5">₹{selectedCustomer.monthlyEstimate.toLocaleString('en-IN')}</p>
                </div>
              </div>

              <div className="bg-red-50 p-3 rounded-xl border border-red-200 flex items-center justify-between">
                <div>
                  <span className="text-red-700 font-semibold">Outstanding Due</span>
                  <p className="font-bold text-red-700 text-lg">₹{selectedCustomer.outstandingBalance.toLocaleString('en-IN')}</p>
                </div>
                <button
                  onClick={() => {
                    alert(`Reminder SMS sent to ${selectedCustomer.phone}`);
                  }}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs"
                >
                  Send Reminder
                </button>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="w-full py-2.5 bg-[#1B4332] hover:bg-[#143326] text-white font-bold rounded-xl text-xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
