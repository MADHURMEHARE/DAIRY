import React, { useState, useEffect } from 'react';
import { Building2, Key, MessageSquare, Save, CheckCircle2, ShieldAlert } from 'lucide-react';
import { DairyStore } from '../../types';
import { ApiClient } from '../../api/client';

export const SettingsView: React.FC = () => {
  const [dairy, setDairy] = useState<DairyStore | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    ApiClient.getDairy().then(setDairy);
  }, []);

  if (!dairy) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updated = await ApiClient.updateDairy(dairy);
      setDairy(updated);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    } catch (e) {
      alert('Failed to save settings');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-xs">
        <h1 className="text-2xl font-bold text-[#081C15] tracking-tight">Dairy Settings</h1>
        <p className="text-xs text-[#52796F] mt-1">
          Configure business details, GSTIN, Razorpay payment gateway credentials, and SMS notifications.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Business Profile */}
        <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-4">
          <h3 className="font-bold text-[#081C15] text-sm flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#1B4332]" /> Business Profile
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-[#081C15] mb-1">Dairy Business Name</label>
              <input
                type="text"
                value={dairy.name}
                onChange={(e) => setDairy({ ...dairy, name: e.target.value })}
                className="w-full px-3 py-2 bg-[#F7F9F7] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#081C15] mb-1">Owner Name</label>
              <input
                type="text"
                value={dairy.ownerName}
                onChange={(e) => setDairy({ ...dairy, ownerName: e.target.value })}
                className="w-full px-3 py-2 bg-[#F7F9F7] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#081C15] mb-1">Contact Phone</label>
              <input
                type="text"
                value={dairy.phone}
                onChange={(e) => setDairy({ ...dairy, phone: e.target.value })}
                className="w-full px-3 py-2 bg-[#F7F9F7] border border-[#E5E7EB] rounded-lg focus:outline-none font-mono focus:ring-2 focus:ring-[#1B4332]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#081C15] mb-1">GSTIN Number</label>
              <input
                type="text"
                value={dairy.gstNumber || ''}
                onChange={(e) => setDairy({ ...dairy, gstNumber: e.target.value })}
                className="w-full px-3 py-2 bg-[#F7F9F7] border border-[#E5E7EB] rounded-lg focus:outline-none font-mono focus:ring-2 focus:ring-[#1B4332]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-[#081C15] mb-1">Dairy Address</label>
              <input
                type="text"
                value={dairy.address}
                onChange={(e) => setDairy({ ...dairy, address: e.target.value })}
                className="w-full px-3 py-2 bg-[#F7F9F7] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
              />
            </div>
          </div>
        </div>

        {/* Payment Integration */}
        <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-4">
          <h3 className="font-bold text-[#081C15] text-sm flex items-center gap-2">
            <Key className="w-4 h-4 text-[#1B4332]" /> Razorpay Payment Gateway Integration
          </h3>

          <div className="bg-[#F7F9F7] p-4 rounded-xl border border-[#E5E7EB] text-xs space-y-3">
            <div>
              <label className="block font-semibold text-[#081C15] mb-1">Razorpay Key ID</label>
              <input
                type="text"
                value={dairy.razorpayKeyId || ''}
                onChange={(e) => setDairy({ ...dairy, razorpayKeyId: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-[#E5E7EB] rounded-lg focus:outline-none font-mono"
                placeholder="rzp_live_xxxxxxxx"
              />
            </div>
            <p className="text-[11px] text-[#52796F]">
              Keys are securely passed from server environment variables at runtime. Razorpay API is ready for live transaction webhooks.
            </p>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-4">
          <h3 className="font-bold text-[#081C15] text-sm flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[#1B4332]" /> Customer Notifications
          </h3>

          <div className="space-y-3 text-xs">
            <label className="flex items-center gap-3 p-3 bg-[#F7F9F7] rounded-xl border border-[#E5E7EB] cursor-pointer">
              <input
                type="checkbox"
                checked={dairy.enableSmsNotifs}
                onChange={(e) => setDairy({ ...dairy, enableSmsNotifs: e.target.checked })}
                className="w-4 h-4 text-[#1B4332] rounded"
              />
              <div>
                <span className="font-bold text-[#081C15]">Enable Automated SMS Delivery Alerts</span>
                <p className="text-[#52796F] text-[11px]">Send instant drop-off SMS alerts upon delivery confirmation.</p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 bg-[#F7F9F7] rounded-xl border border-[#E5E7EB] cursor-pointer">
              <input
                type="checkbox"
                checked={dairy.enableWhatsappNotifs}
                onChange={(e) => setDairy({ ...dairy, enableWhatsappNotifs: e.target.checked })}
                className="w-4 h-4 text-[#1B4332] rounded"
              />
              <div>
                <span className="font-bold text-[#081C15]">Enable WhatsApp Monthly Bill Reminders</span>
                <p className="text-[#52796F] text-[11px]">Automatically send itemized monthly PDF bills via WhatsApp API.</p>
              </div>
            </label>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3">
          {isSaved && (
            <span className="text-xs text-green-700 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Settings Saved!
            </span>
          )}
          <button
            type="submit"
            className="px-6 py-2.5 bg-[#1B4332] hover:bg-[#143326] text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};
