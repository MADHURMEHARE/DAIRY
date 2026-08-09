import React, { useState } from 'react';
import {
  Building2,
  Users,
  Milk,
  TrendingUp,
  Plus,
  Search,
  ShieldAlert,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  Settings,
  Activity,
  Database,
  BarChart3,
  Lock,
  Key,
  Eye,
  EyeOff
} from 'lucide-react';
import { DairyStore, User } from '../../types';

interface MasterAdminViewProps {
  currentUser?: User | null;
}

export const MasterAdminView: React.FC<MasterAdminViewProps> = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState<'dairies' | 'users' | 'system'>('dairies');

  // Mock list of Dairies on the platform
  const [dairies, setDairies] = useState<DairyStore[]>([
    {
      id: 'dairy_anandwan_01',
      name: 'Anandwan Milk Dairy',
      ownerName: 'Vijay Deshmukh',
      tagline: 'Fresh farm milk, paneer, bilona ghee and sweets delivered directly to your doorstep.',
      phone: '+91 98500 12345',
      email: 'contact@anandwandairy.com',
      address: 'Plot 42, Green Park Road, Near Rajapeth Square',
      city: 'Amravati',
      state: 'Maharashtra',
      pincode: '444601',
      gstNumber: '27AABCU9603R1ZM',
      razorpayKeyId: 'rzp_test_AnandwanDairy8812',
      enableSmsNotifs: true,
      enableWhatsappNotifs: true,
    },
    {
      id: 'dairy_shree_02',
      name: 'Shree Krishna Organic Dairy',
      ownerName: 'Rajesh Patil',
      tagline: 'Pure A2 Gir Cow Milk and organic dairy essentials.',
      phone: '+91 97654 32109',
      email: 'info@shreekrishnadairy.in',
      address: 'Sector 5, Badnera Road',
      city: 'Amravati',
      state: 'Maharashtra',
      pincode: '444607',
      gstNumber: '27XYZCU1234R1ZP',
      razorpayKeyId: 'rzp_test_ShreeKrishna12',
      enableSmsNotifs: true,
      enableWhatsappNotifs: true,
    }
  ]);

  // Owner Passwords managed by Master Admin
  const [ownerPasswords, setOwnerPasswords] = useState<{ [dairyId: string]: string }>({
    dairy_anandwan_01: 'Owner@123',
    dairy_shree_02: 'Shree@123',
  });

  const [visiblePasswords, setVisiblePasswords] = useState<{ [dairyId: string]: boolean }>({});

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddDairyModal, setShowAddDairyModal] = useState(false);

  // New Dairy Form
  const [newDairyName, setNewDairyName] = useState('');
  const [newOwnerName, setNewOwnerName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newOwnerPassword, setNewOwnerPassword] = useState('Owner@123');
  const [newCity, setNewCity] = useState('Amravati');
  const [newAddress, setNewAddress] = useState('');

  const togglePasswordVisibility = (dairyId: string) => {
    setVisiblePasswords((prev) => ({ ...prev, [dairyId]: !prev[dairyId] }));
  };

  const handleResetPassword = (dairyId: string, ownerName: string) => {
    const freshPass = prompt(`Enter new login password for Owner "${ownerName}":`, 'Owner@123');
    if (freshPass && freshPass.trim()) {
      setOwnerPasswords((prev) => ({ ...prev, [dairyId]: freshPass.trim() }));
      alert(`🔑 Login password for ${ownerName} updated to: ${freshPass.trim()}`);
    }
  };

  const handleCreateDairy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDairyName || !newOwnerName || !newPhone) return;

    const dairyId = `dairy_${Date.now()}`;
    const assignedPassword = newOwnerPassword || 'Owner@123';

    const created: DairyStore = {
      id: dairyId,
      name: newDairyName,
      ownerName: newOwnerName,
      tagline: 'Fresh farm dairy products.',
      phone: newPhone,
      email: newEmail || `${newDairyName.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
      address: newAddress || 'Main Street',
      city: newCity,
      state: 'Maharashtra',
      pincode: '444601',
      enableSmsNotifs: true,
      enableWhatsappNotifs: true,
    };

    setOwnerPasswords((prev) => ({ ...prev, [dairyId]: assignedPassword }));
    setDairies([created, ...dairies]);
    setShowAddDairyModal(false);

    alert(
      `🎉 Dairy Store & Owner Account Created!\n\n` +
      `• Store Name: ${newDairyName}\n` +
      `• Owner Name: ${newOwnerName}\n` +
      `• Login Mobile/Phone: ${newPhone}\n` +
      `• Owner Password: ${assignedPassword}\n\n` +
      `The Dairy Owner can now sign in using their phone and this password!`
    );

    setNewDairyName('');
    setNewOwnerName('');
    setNewPhone('');
    setNewEmail('');
    setNewOwnerPassword('Owner@123');
    setNewAddress('');
  };

  const filteredDairies = dairies.filter(
    (d) =>
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 bg-[#FDFCF9] min-h-screen">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-[#1B4332] via-[#2D6A4F] to-[#143326] rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-amber-400/20 text-amber-300 border border-amber-400/30 px-3 py-1 rounded-full text-xs font-bold mb-3">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Platform Master Admin Portal</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">Super Control Panel</h1>
            <p className="text-sm text-[#D8E2DC] mt-1 max-w-xl">
              Oversee all registered dairy stores, monitor platform-wide milk volume distribution, manage dairy owners, and system configurations.
            </p>
          </div>

          <button
            onClick={() => setShowAddDairyModal(true)}
            className="self-start md:self-auto bg-amber-400 hover:bg-amber-300 text-[#081C15] px-5 py-3 rounded-2xl font-bold text-xs shadow-lg transition-all flex items-center gap-2 hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span>Onboard New Dairy Store</span>
          </button>
        </div>

        {/* Global Platform Metrics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/10">
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
            <span className="text-[11px] font-bold text-[#D8E2DC] block">Active Dairy Stores</span>
            <span className="text-2xl font-black text-white mt-1 block">{dairies.length}</span>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
            <span className="text-[11px] font-bold text-[#D8E2DC] block">Daily Milk Delivered</span>
            <span className="text-2xl font-black text-amber-300 mt-1 block">4,850 L</span>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
            <span className="text-[11px] font-bold text-[#D8E2DC] block">Total Subscribers</span>
            <span className="text-2xl font-black text-white mt-1 block">1,240</span>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
            <span className="text-[11px] font-bold text-[#D8E2DC] block">Monthly GMV</span>
            <span className="text-2xl font-black text-emerald-300 mt-1 block">₹9.82 Lakhs</span>
          </div>
        </div>
      </div>

      {/* View Navigation Tabs */}
      <div className="flex border-b border-[#E5E7EB] gap-6 text-sm font-bold">
        <button
          onClick={() => setActiveTab('dairies')}
          className={`pb-3 border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'dairies'
              ? 'border-[#1B4332] text-[#1B4332]'
              : 'border-transparent text-[#52796F] hover:text-[#081C15]'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Dairy Stores Directory ({dairies.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'users'
              ? 'border-[#1B4332] text-[#1B4332]'
              : 'border-transparent text-[#52796F] hover:text-[#081C15]'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Roles & Access Control</span>
        </button>
        <button
          onClick={() => setActiveTab('system')}
          className={`pb-3 border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'system'
              ? 'border-[#1B4332] text-[#1B4332]'
              : 'border-transparent text-[#52796F] hover:text-[#081C15]'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Database & Server Logs</span>
        </button>
      </div>

      {/* Tab 1: Dairy Stores Directory */}
      {activeTab === 'dairies' && (
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-[#52796F] absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search dairy store by name, owner, or city..."
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#E5E7EB] rounded-2xl text-xs font-semibold text-[#081C15] focus:outline-none focus:border-[#1B4332] shadow-2xs"
              />
            </div>
            <span className="text-xs text-[#52796F] font-semibold">
              Showing {filteredDairies.length} of {dairies.length} onboarded stores
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredDairies.map((d) => (
              <div
                key={d.id}
                className="bg-white rounded-3xl p-6 border border-[#E5E7EB] shadow-sm hover:shadow-md transition-shadow space-y-4 relative"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#1B4332] text-white font-black text-2xl flex items-center justify-center shrink-0">
                      🥛
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-[#081C15]">{d.name}</h3>
                      <p className="text-xs text-[#52796F] font-medium flex items-center gap-1 mt-0.5">
                        <Users className="w-3 h-3 text-[#2D6A4F]" />
                        <span>Owner: <strong className="text-[#081C15]">{d.ownerName}</strong></span>
                      </p>
                    </div>
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Active Store
                  </span>
                </div>

                <p className="text-xs text-[#52796F] italic line-clamp-2">"{d.tagline}"</p>

                <div className="grid grid-cols-2 gap-2 text-xs bg-[#F7F9F7] p-3 rounded-2xl border border-[#E5E7EB]">
                  <div className="flex items-center gap-1.5 text-[#081C15] font-semibold">
                    <Phone className="w-3.5 h-3.5 text-[#2D6A4F]" />
                    <span>{d.phone}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#081C15] font-semibold truncate">
                    <Mail className="w-3.5 h-3.5 text-[#2D6A4F]" />
                    <span className="truncate">{d.email}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#081C15] font-semibold col-span-2">
                    <MapPin className="w-3.5 h-3.5 text-[#2D6A4F] shrink-0" />
                    <span className="truncate">{d.address}, {d.city}</span>
                  </div>
                </div>

                {/* Owner Login Password Box (Created by Master Admin) */}
                <div className="bg-amber-50 border border-amber-200/80 p-3 rounded-2xl space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold text-amber-900 uppercase tracking-wider flex items-center gap-1">
                      <Lock className="w-3 h-3 text-amber-700" />
                      <span>Owner Sign-In Password</span>
                    </span>
                    <button
                      onClick={() => handleResetPassword(d.id, d.ownerName)}
                      className="text-[10px] font-bold text-amber-800 hover:text-amber-950 underline flex items-center gap-1"
                    >
                      <Key className="w-3 h-3" />
                      <span>Change Password</span>
                    </button>
                  </div>
                  <div className="flex items-center justify-between text-xs font-mono font-bold bg-white/80 px-3 py-1.5 rounded-xl border border-amber-200">
                    <span className="text-[#081C15]">
                      {visiblePasswords[d.id]
                        ? ownerPasswords[d.id] || 'Owner@123'
                        : '••••••••••••'}
                    </span>
                    <button
                      onClick={() => togglePasswordVisibility(d.id)}
                      className="text-[#52796F] hover:text-[#081C15]"
                      title="Toggle Password Visibility"
                    >
                      {visiblePasswords[d.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#E5E7EB]">
                  <span className="text-[11px] font-mono text-[#52796F]">
                    GST: {d.gstNumber || 'N/A'}
                  </span>
                  <button className="text-xs font-bold text-[#1B4332] hover:underline flex items-center gap-1">
                    <Settings className="w-3.5 h-3.5" />
                    <span>Manage Store Settings</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Roles Overview */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl p-6 border border-[#E5E7EB] space-y-4">
          <h3 className="font-bold text-base text-[#081C15]">Role-Based Privilege System</h3>
          <p className="text-xs text-[#52796F]">
            The Anandwan Dairy OS architecture supports 4 hierarchical role levels:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200">
              <span className="text-xs font-bold text-amber-900 uppercase tracking-wider block">1. MASTER_ADMIN</span>
              <h4 className="font-bold text-sm text-[#081C15] mt-1">Platform Master Admin</h4>
              <p className="text-xs text-amber-800 mt-1">
                Full super-user authority over the entire platform. Can onboard dairy stores, create Dairy Owners (`ADMIN`), monitor global sales, and inspect server logs.
              </p>
            </div>

            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
              <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider block">2. ADMIN</span>
              <h4 className="font-bold text-sm text-[#081C15] mt-1">Dairy Store Owner</h4>
              <p className="text-xs text-emerald-800 mt-1">
                Owner of a specific dairy store. Manages daily milk pricing, store inventory, subscriptions, billing invoices, and can create Delivery Staff accounts.
              </p>
            </div>

            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200">
              <span className="text-xs font-bold text-blue-900 uppercase tracking-wider block">3. DELIVERY_STAFF</span>
              <h4 className="font-bold text-sm text-[#081C15] mt-1">Field Delivery Partner</h4>
              <p className="text-xs text-blue-800 mt-1">
                Assigned delivery staff. Sees daily door-to-door delivery routes, marks deliveries as Delivered / Skipped, and collects cash payments.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">4. CUSTOMER</span>
              <h4 className="font-bold text-sm text-[#081C15] mt-1">Self-Registered Customer</h4>
              <p className="text-xs text-slate-800 mt-1">
                End consumer who registers their own account via Mobile OTP. Can buy dairy products, manage milk subscriptions, pause deliveries, and pay bills.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: System Database Status */}
      {activeTab === 'system' && (
        <div className="bg-white rounded-3xl p-6 border border-[#E5E7EB] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-[#081C15] flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#2D6A4F]" />
              <span>Database Architecture Status</span>
            </h3>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full">
              System Health: OK
            </span>
          </div>

          <div className="p-4 bg-[#F7F9F7] rounded-2xl border border-[#E5E7EB] space-y-2 text-xs">
            <div className="flex justify-between font-mono">
              <span className="text-[#52796F]">Primary Persistence Engine:</span>
              <span className="font-bold text-[#081C15]">MongoDB / Mongoose ODM (Auto Fallback Store)</span>
            </div>
            <div className="flex justify-between font-mono">
              <span className="text-[#52796F]">Active Collections:</span>
              <span className="font-bold text-[#081C15]">10 (Users, Dairies, Customers, Products, Subscriptions, Deliveries, Payments, Orders, ServiceTickets, Notifications)</span>
            </div>
            <div className="flex justify-between font-mono">
              <span className="text-[#52796F]">API Gateway Port:</span>
              <span className="font-bold text-[#081C15]">Port 3000 (Express API Proxy)</span>
            </div>
          </div>
        </div>
      )}

      {/* Add Dairy Modal */}
      {showAddDairyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-[#E5E7EB] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
              <h3 className="font-bold text-lg text-[#081C15]">Onboard New Dairy Store</h3>
              <button
                onClick={() => setShowAddDairyModal(false)}
                className="text-xs font-bold text-[#52796F] hover:text-[#081C15]"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleCreateDairy} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-[#081C15] block mb-1">Dairy Store Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Amravati Organic Farm Dairy"
                  value={newDairyName}
                  onChange={(e) => setNewDairyName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F7F9F7] rounded-xl border border-[#E5E7EB] text-xs font-semibold text-[#081C15] focus:outline-none focus:border-[#1B4332]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-[#081C15] block mb-1">Dairy Owner Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Aniket Deshmukh"
                    value={newOwnerName}
                    onChange={(e) => setNewOwnerName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#F7F9F7] rounded-xl border border-[#E5E7EB] text-xs font-semibold text-[#081C15] focus:outline-none focus:border-[#1B4332]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#081C15] block mb-1">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="10-digit phone"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#F7F9F7] rounded-xl border border-[#E5E7EB] text-xs font-semibold text-[#081C15] focus:outline-none focus:border-[#1B4332]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-[#081C15] block mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="owner@dairy.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#F7F9F7] rounded-xl border border-[#E5E7EB] text-xs font-semibold text-[#081C15] focus:outline-none focus:border-[#1B4332]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#081C15] block mb-1">City</label>
                  <input
                    type="text"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#F7F9F7] rounded-xl border border-[#E5E7EB] text-xs font-semibold text-[#081C15] focus:outline-none focus:border-[#1B4332]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#081C15] block mb-1">
                  Assign Owner Login Password *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="e.g. Owner@123"
                    value={newOwnerPassword}
                    onChange={(e) => setNewOwnerPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#F7F9F7] rounded-xl border border-[#E5E7EB] text-xs font-bold font-mono text-[#081C15] focus:outline-none focus:border-[#1B4332]"
                  />
                </div>
                <p className="text-[11px] text-[#52796F] mt-1">
                  🔑 Master Admin creates this password for the Dairy Owner to log in.
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-[#081C15] block mb-1">Store Address</label>
                <input
                  type="text"
                  placeholder="Street / Locality"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F7F9F7] rounded-xl border border-[#E5E7EB] text-xs font-semibold text-[#081C15] focus:outline-none focus:border-[#1B4332]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#1B4332] hover:bg-[#143326] text-white font-bold text-xs rounded-xl shadow-md transition-all mt-2"
              >
                Create Dairy Store & Assign Owner Role
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
