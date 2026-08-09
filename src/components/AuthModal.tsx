import React, { useState } from 'react';
import { X, Lock, Phone, User as UserIcon, ShieldCheck, Sparkles, MapPin, CheckCircle2, ArrowRight } from 'lucide-react';
import { User, UserRole } from '../types';
import { ApiClient } from '../api/client';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [loginMethod, setLoginMethod] = useState<'PASSWORD' | 'OTP'>('OTP');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('8812');
  const [otpSent, setOtpSent] = useState(false);
  const [role, setRole] = useState<UserRole>('ADMIN');
  const [isLoading, setIsLoading] = useState(false);

  // Register Form State
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regMilkType, setRegMilkType] = useState('Cow Milk (Fresh 3.5% Fat)');
  const [regQuantity, setRegQuantity] = useState(1);

  if (!isOpen) return null;

  const handleRoleSelect = (selectedRole: UserRole) => {
    setRole(selectedRole);
    if (selectedRole === 'ADMIN' || selectedRole === 'MASTER_ADMIN') {
      setLoginMethod('PASSWORD');
    } else {
      setLoginMethod('OTP');
    }
  };

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 10) {
      alert('Please enter a valid 10-digit mobile number');
      return;
    }
    setOtpSent(true);
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !password) {
      alert('Please enter your registered mobile/email and password');
      return;
    }
    setIsLoading(true);
    try {
      const result = await ApiClient.login(phone, role, undefined, password);
      localStorage.setItem('anandwan_user', JSON.stringify(result.user));
      onLoginSuccess(result.user);
      onClose();
    } catch (err: any) {
      alert(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const result = await ApiClient.login(phone, role, otp);
      localStorage.setItem('anandwan_user', JSON.stringify(result.user));
      onLoginSuccess(result.user);
      onClose();
    } catch (err: any) {
      alert(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regPhone || !regAddress) {
      alert('Please fill in all required fields');
      return;
    }
    setIsLoading(true);
    try {
      const res = await ApiClient.registerCustomer({
        name: regName,
        phone: regPhone,
        address: regAddress,
        milkType: regMilkType,
        quantity: regQuantity,
      });
      localStorage.setItem('anandwan_user', JSON.stringify(res.user));
      onLoginSuccess(res.user);
      onClose();
    } catch (err: any) {
      alert(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const quickDemoLogin = async (demoRole: UserRole, demoPhone: string) => {
    setIsLoading(true);
    try {
      const result = await ApiClient.login(demoPhone, demoRole);
      localStorage.setItem('anandwan_user', JSON.stringify(result.user));
      onLoginSuccess(result.user);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-[#E5E7EB] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-[#1B4332] text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-[#D8E2DC] hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-12 h-12 rounded-2xl bg-[#2D6A4F] text-white font-black text-2xl flex items-center justify-center mb-3 shadow-inner">
            🥛
          </div>
          <h2 className="text-xl font-bold">Anandwan Milk Dairy</h2>
          <p className="text-xs text-[#D8E2DC] mt-1">
            Sign in to manage your daily milk subscription & store purchases.
          </p>
        </div>

        {/* Mode Switcher Pills */}
        <div className="flex border-b border-[#E5E7EB] bg-[#F7F9F7]">
          <button
            onClick={() => setMode('LOGIN')}
            className={`flex-1 py-3 text-xs font-bold transition-all border-b-2 ${
              mode === 'LOGIN'
                ? 'border-[#1B4332] text-[#1B4332] bg-white'
                : 'border-transparent text-[#52796F] hover:text-[#081C15]'
            }`}
          >
            📱 Mobile OTP Login
          </button>
          <button
            onClick={() => setMode('REGISTER')}
            className={`flex-1 py-3 text-xs font-bold transition-all border-b-2 ${
              mode === 'REGISTER'
                ? 'border-[#1B4332] text-[#1B4332] bg-white'
                : 'border-transparent text-[#52796F] hover:text-[#081C15]'
            }`}
          >
            ✨ New Registration
          </button>
        </div>

        <div className="p-6 space-y-6">
          {mode === 'LOGIN' ? (
            <div className="space-y-4">
              {/* Role Selection Tabs */}
              <div>
                <label className="text-[11px] font-bold text-[#52796F] uppercase tracking-wider block mb-1.5">
                  Select Login Role
                </label>
                <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
                  {[
                    { id: 'CUSTOMER', label: 'Customer' },
                    { id: 'DELIVERY_STAFF', label: 'Delivery Staff' },
                    { id: 'ADMIN', label: 'Dairy Owner' },
                    { id: 'MASTER_ADMIN', label: 'Master Admin' },
                  ].map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => handleRoleSelect(r.id as UserRole)}
                      className={`py-2 px-1.5 rounded-xl text-[11px] font-bold border text-center transition-all ${
                        role === r.id
                          ? 'bg-[#1B4332] text-white border-[#1B4332] shadow-2xs'
                          : 'bg-white text-[#52796F] border-[#E5E7EB] hover:bg-[#F7F9F7]'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Login Method Toggle Pills */}
              <div className="flex bg-[#F7F9F7] p-1 rounded-xl border border-[#E5E7EB] text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setLoginMethod('PASSWORD')}
                  className={`flex-1 py-1.5 rounded-lg transition-all text-center flex items-center justify-center gap-1.5 ${
                    loginMethod === 'PASSWORD'
                      ? 'bg-[#1B4332] text-white shadow-xs'
                      : 'text-[#52796F] hover:text-[#081C15]'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Password Login</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLoginMethod('OTP')}
                  className={`flex-1 py-1.5 rounded-lg transition-all text-center flex items-center justify-center gap-1.5 ${
                    loginMethod === 'OTP'
                      ? 'bg-[#1B4332] text-white shadow-xs'
                      : 'text-[#52796F] hover:text-[#081C15]'
                  }`}
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Mobile OTP</span>
                </button>
              </div>

              {loginMethod === 'PASSWORD' ? (
                <form onSubmit={handlePasswordLogin} className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-[#081C15] block mb-1">
                      {role === 'ADMIN' ? 'Dairy Owner Phone / Email' : 'Mobile / Email Address'}
                    </label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 9850012345 or owner@shreedairy.com"
                      required
                      className="w-full px-3.5 py-2.5 bg-[#F7F9F7] rounded-xl border border-[#E5E7EB] text-xs font-bold text-[#081C15] focus:outline-none focus:border-[#1B4332]"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-bold text-[#081C15]">Password</label>
                      <span className="text-[10px] text-[#52796F]">Assigned by Master Admin</span>
                    </div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      required
                      className="w-full px-3.5 py-2.5 bg-[#F7F9F7] rounded-xl border border-[#E5E7EB] text-xs font-bold text-[#081C15] focus:outline-none focus:border-[#1B4332]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 bg-[#1B4332] hover:bg-[#143326] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <span>{isLoading ? 'Signing In...' : `Sign In as ${role === 'ADMIN' ? 'Dairy Owner' : role === 'MASTER_ADMIN' ? 'Master Admin' : 'User'}`}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              ) : !otpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-[#081C15] block mb-1">Registered Mobile Number</label>
                    <div className="relative">
                      <div className="absolute left-3 top-3 text-xs font-bold text-[#52796F]">+91</div>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Enter 10-digit mobile"
                        maxLength={10}
                        required
                        className="w-full pl-12 pr-4 py-2.5 bg-[#F7F9F7] rounded-xl border border-[#E5E7EB] text-xs font-bold text-[#081C15] focus:outline-none focus:border-[#1B4332]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-[#1B4332] hover:bg-[#143326] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>Send Login OTP</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyLogin} className="space-y-3">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-bold text-[#081C15]">Enter 4-Digit OTP</label>
                      <button
                        type="button"
                        onClick={() => setOtpSent(false)}
                        className="text-[11px] text-[#1B4332] font-bold hover:underline"
                      >
                        Change Mobile
                      </button>
                    </div>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="Enter OTP (e.g. 8812)"
                      maxLength={4}
                      required
                      className="w-full px-4 py-2.5 bg-[#F7F9F7] text-center tracking-widest font-mono text-base font-bold rounded-xl border border-[#E5E7EB] text-[#081C15] focus:outline-none focus:border-[#1B4332]"
                    />
                    <p className="text-[11px] text-emerald-700 mt-1 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> OTP sent to +91 {phone} (Demo Code: 8812)
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 bg-[#1B4332] hover:bg-[#143326] text-white font-bold text-xs rounded-xl shadow-md transition-all disabled:opacity-50"
                  >
                    {isLoading ? 'Verifying...' : 'Verify & Sign In'}
                  </button>
                </form>
              )}
            </div>
          ) : (
            <form onSubmit={handleRegister} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-[#081C15] block mb-1">Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g., Aniket Deshmukh"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-[#F7F9F7] rounded-xl border border-[#E5E7EB] text-xs font-semibold text-[#081C15] focus:outline-none focus:border-[#1B4332]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#081C15] block mb-1">Mobile Number *</label>
                <input
                  type="tel"
                  placeholder="10-digit phone number"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  maxLength={10}
                  required
                  className="w-full px-3.5 py-2.5 bg-[#F7F9F7] rounded-xl border border-[#E5E7EB] text-xs font-semibold text-[#081C15] focus:outline-none focus:border-[#1B4332]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#081C15] block mb-1">Delivery Address & Locality *</label>
                <input
                  type="text"
                  placeholder="Flat/House No., Area, Amravati"
                  value={regAddress}
                  onChange={(e) => setRegAddress(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-[#F7F9F7] rounded-xl border border-[#E5E7EB] text-xs font-semibold text-[#081C15] focus:outline-none focus:border-[#1B4332]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-[#081C15] block mb-1">Milk Variant</label>
                  <select
                    value={regMilkType}
                    onChange={(e) => setRegMilkType(e.target.value)}
                    className="w-full px-2.5 py-2.5 bg-[#F7F9F7] rounded-xl border border-[#E5E7EB] text-xs font-bold text-[#081C15] focus:outline-none focus:border-[#1B4332]"
                  >
                    <option value="Cow Milk (Fresh 3.5% Fat)">Cow Milk (Fresh)</option>
                    <option value="Buffalo Milk (Full Cream 6.5% Fat)">Buffalo Milk (Creamy)</option>
                    <option value="A2 Gir Cow Milk (Unpasteurized Pure)">A2 Gir Cow Milk</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#081C15] block mb-1">Daily Litres</label>
                  <select
                    value={regQuantity}
                    onChange={(e) => setRegQuantity(Number(e.target.value))}
                    className="w-full px-2.5 py-2.5 bg-[#F7F9F7] rounded-xl border border-[#E5E7EB] text-xs font-bold text-[#081C15] focus:outline-none focus:border-[#1B4332]"
                  >
                    <option value={1}>1.0 Litre / day</option>
                    <option value={1.5}>1.5 Litres / day</option>
                    <option value={2}>2.0 Litres / day</option>
                    <option value={3}>3.0 Litres / day</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-[#1B4332] hover:bg-[#143326] text-white font-bold text-xs rounded-xl shadow-md transition-all mt-2 disabled:opacity-50"
              >
                {isLoading ? 'Creating Account...' : 'Register New Account'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
