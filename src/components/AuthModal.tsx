import React, { useState } from 'react';
import { X, Lock, Phone, User as UserIcon, ShieldCheck, Sparkles, MapPin, CheckCircle2, ArrowRight, Building2, Smartphone, Users } from 'lucide-react';
import { User, UserRole } from '../types';
import { ApiClient } from '../api/client';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  // Two consolidated roles: CUSTOMER or ADMIN (Owner & Staff)
  const [selectedMainRole, setSelectedMainRole] = useState<'CUSTOMER' | 'ADMIN'>('CUSTOMER');
  const [loginMethod, setLoginMethod] = useState<'OTP' | 'PASSWORD'>('OTP');
  
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Register Form State (Customer)
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regMilkType, setRegMilkType] = useState('Cow Milk (Fresh 3.5% Fat)');
  const [regQuantity, setRegQuantity] = useState(1);

  if (!isOpen) return null;

  const handleRoleSelect = (role: 'CUSTOMER' | 'OWNER') => {
    setSelectedMainRole(role);
    setErrorMessage(null);
    setSuccessMessage(null);
    if (role === 'OWNER') {
      setLoginMethod('PASSWORD');
    } else {
      setLoginMethod('OTP');
    }
  };

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!phone || phone.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number');
      return;
    }
    setOtpSent(true);
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!phone || !password) {
      setErrorMessage('Please enter your mobile/email and password');
      return;
    }
    setIsLoading(true);
    try {
      const result = await ApiClient.login(phone, selectedMainRole, undefined, password);
      localStorage.setItem('anandwan_user', JSON.stringify(result.user));
      onLoginSuccess(result.user);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);
    try {
      const result = await ApiClient.login(phone, selectedMainRole, otp);
      localStorage.setItem('anandwan_user', JSON.stringify(result.user));
      onLoginSuccess(result.user);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    if (!regName || !regPhone || !regEmail || !regPassword || !regConfirmPassword || !regAddress) {
      setErrorMessage('Please fill in all required registration fields');
      return;
    }

    if (regPhone.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number');
      return;
    }

    if (regPassword.length < 4) {
      setErrorMessage('Password must be at least 4 characters long');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMessage('Passwords do not match! Please re-check your password.');
      return;
    }

    setIsLoading(true);
    try {
      await ApiClient.registerCustomer({
        name: regName,
        phone: regPhone,
        email: regEmail,
        password: regPassword,
        address: regAddress,
        milkType: regMilkType,
        quantity: regQuantity,
      });

      // Show success message and redirect customer back to Login page
      setSuccessMessage(`Account registered successfully for ${regName}! Please sign in with your mobile number and password.`);
      setErrorMessage(null);

      // Pre-fill login details for immediate sign-in
      setPhone(regPhone);
      setPassword(regPassword);
      setSelectedMainRole('CUSTOMER');
      setLoginMethod('PASSWORD');
      setMode('LOGIN');

      // Clear registration form fields
      setRegName('');
      setRegEmail('');
      setRegPhone('');
      setRegPassword('');
      setRegConfirmPassword('');
      setRegAddress('');
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-[#E5E7EB]">
        {/* Top Header */}
        <div className="bg-[#1B4332] text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-[#D8E2DC] hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#2D6A4F] text-white font-black text-2xl flex items-center justify-center shadow-inner shrink-0">
              🥛
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">Anandwan Milk Dairy</h2>
              <p className="text-xs text-[#D8E2DC] mt-0.5">
                Sign in to manage your daily subscription, store purchases or dairy operations.
              </p>
            </div>
          </div>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex border-b border-[#E5E7EB] bg-[#F7F9F7]">
          <button
            onClick={() => { setMode('LOGIN'); setErrorMessage(null); setSuccessMessage(null); }}
            className={`flex-1 py-3 text-xs font-bold transition-all border-b-2 flex items-center justify-center gap-2 ${
              mode === 'LOGIN'
                ? 'border-[#1B4332] text-[#1B4332] bg-white'
                : 'border-transparent text-[#52796F] hover:text-[#081C15]'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
          <button
            onClick={() => { setMode('REGISTER'); setErrorMessage(null); setSuccessMessage(null); }}
            className={`flex-1 py-3 text-xs font-bold transition-all border-b-2 flex items-center justify-center gap-2 ${
              mode === 'REGISTER'
                ? 'border-[#1B4332] text-[#1B4332] bg-white'
                : 'border-transparent text-[#52796F] hover:text-[#081C15]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#D97706]" />
            <span>New Customer Register</span>
          </button>
        </div>

        <div className="p-6 space-y-5">
          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-[#1B4332] text-xs rounded-xl font-semibold flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
                <span>{successMessage}</span>
              </div>
              <button onClick={() => setSuccessMessage(null)} className="text-emerald-700 hover:text-emerald-950 font-bold ml-2 cursor-pointer">✕</button>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl font-semibold flex items-center justify-between">
              <span>{errorMessage}</span>
              <button onClick={() => setErrorMessage(null)} className="text-rose-500 hover:text-rose-800 font-bold ml-2">✕</button>
            </div>
          )}

          {mode === 'LOGIN' ? (
            <div className="space-y-5">
              {/* Step 1: Select Main Role (2 Roles Only) */}
              <div>
                <label className="text-[11px] font-bold text-[#52796F] uppercase tracking-wider block mb-2">
                  Select Role
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {/* Role 1: Customer */}
                  <button
                    type="button"
                    onClick={() => handleRoleSelect('CUSTOMER')}
                    className={`p-3.5 rounded-2xl border text-left transition-all flex items-start gap-3 relative ${
                      selectedMainRole === 'CUSTOMER'
                        ? 'bg-[#F0FDF4] border-[#1B4332] ring-2 ring-[#1B4332]/20 shadow-xs'
                        : 'bg-white border-[#E5E7EB] hover:bg-[#F7F9F7]'
                    }`}
                  >
                    <div className={`p-2 rounded-xl text-lg ${selectedMainRole === 'CUSTOMER' ? 'bg-[#1B4332] text-white' : 'bg-emerald-50 text-[#1B4332]'}`}>
                      👤
                    </div>
                    <div>
                      <div className="font-bold text-xs text-[#081C15]">Customer</div>
                      <div className="text-[10px] text-[#52796F] leading-tight mt-0.5">
                        Daily Milk Subscriber & Store Shopper
                      </div>
                    </div>
                    {selectedMainRole === 'CUSTOMER' && (
                      <CheckCircle2 className="w-4 h-4 text-[#1B4332] absolute top-3.5 right-3.5" />
                    )}
                  </button>

                  {/* Role 2: Owner & Staff */}
                  <button
                    type="button"
                    onClick={() => handleRoleSelect('OWNER')}
                    className={`p-3.5 rounded-2xl border text-left transition-all flex items-start gap-3 relative ${
                      selectedMainRole === 'ADMIN'
                        ? 'bg-[#F0FDF4] border-[#1B4332] ring-2 ring-[#1B4332]/20 shadow-xs'
                        : 'bg-white border-[#E5E7EB] hover:bg-[#F7F9F7]'
                    }`}
                  >
                    <div className={`p-2 rounded-xl text-lg ${selectedMainRole === 'ADMIN' ? 'bg-[#1B4332] text-white' : 'bg-emerald-50 text-[#1B4332]'}`}>
                      🚜
                    </div>
                    <div>
                      <div className="font-bold text-xs text-[#081C15]">Owner & Staff</div>
                      <div className="text-[10px] text-[#52796F] leading-tight mt-0.5">
                        Dairy Operations, Management & Delivery
                      </div>
                    </div>
                    {selectedMainRole === 'ADMIN' && (
                      <CheckCircle2 className="w-4 h-4 text-[#1B4332] absolute top-3.5 right-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Login Method Toggle for Selected Role */}
              <div className="flex bg-[#F7F9F7] p-1 rounded-xl border border-[#E5E7EB] text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setLoginMethod('OTP')}
                  className={`flex-1 py-2 rounded-lg transition-all text-center flex items-center justify-center gap-1.5 ${
                    loginMethod === 'OTP'
                      ? 'bg-[#1B4332] text-white shadow-xs'
                      : 'text-[#52796F] hover:text-[#081C15]'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Mobile OTP</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLoginMethod('PASSWORD')}
                  className={`flex-1 py-2 rounded-lg transition-all text-center flex items-center justify-center gap-1.5 ${
                    loginMethod === 'PASSWORD'
                      ? 'bg-[#1B4332] text-white shadow-xs'
                      : 'text-[#52796F] hover:text-[#081C15]'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Password</span>
                </button>
              </div>

              {/* Form Content */}
              {loginMethod === 'PASSWORD' ? (
                <form onSubmit={handlePasswordLogin} className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-[#081C15] block mb-1">
                      {selectedMainRole === 'ADMIN' ? 'Owner / Staff Phone or Email' : 'Customer Phone / Email'}
                    </label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder={selectedMainRole === 'ADMIN' ? 'e.g. 9850012345 or owner@anandwan.com' : 'e.g. 9823011223'}
                      required
                      className="w-full px-3.5 py-2.5 bg-[#F7F9F7] rounded-xl border border-[#E5E7EB] text-xs font-bold text-[#081C15] focus:outline-none focus:border-[#1B4332]"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-bold text-[#081C15]">Password</label>
                      <span className="text-[10px] text-[#52796F] font-medium">JWT Secure Verification</span>
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
                    className="w-full py-3 bg-[#1B4332] hover:bg-[#143326] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 mt-1 cursor-pointer"
                  >
                    <span>{isLoading ? 'Authenticating...' : `Sign In as ${selectedMainRole === 'ADMIN' ? 'Owner & Staff' : 'Customer'}`}</span>
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
                        placeholder="Enter 10-digit mobile number"
                        maxLength={10}
                        required
                        className="w-full pl-12 pr-4 py-2.5 bg-[#F7F9F7] rounded-xl border border-[#E5E7EB] text-xs font-bold text-[#081C15] focus:outline-none focus:border-[#1B4332]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-[#1B4332] hover:bg-[#143326] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
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
                        Change Phone
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
                    <p className="text-[11px] text-emerald-700 mt-1 flex items-center gap-1 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Verification OTP: <strong className="font-mono">8812</strong>
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 bg-[#1B4332] hover:bg-[#143326] text-white font-bold text-xs rounded-xl shadow-md transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isLoading ? 'Verifying Token...' : 'Verify & Sign In'}
                  </button>
                </form>
              )}
            </div>
          ) : (
            /* Registration Form for New Customers */
            <form onSubmit={handleRegister} className="space-y-2.5">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-[#081C15] block mb-1">Full Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Aniket Deshmukh"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-[#F7F9F7] rounded-xl border border-[#E5E7EB] text-xs font-semibold text-[#081C15] focus:outline-none focus:border-[#1B4332]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#081C15] block mb-1">Email Address *</label>
                  <input
                    type="email"
                    placeholder="e.g. aniket@gmail.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-[#F7F9F7] rounded-xl border border-[#E5E7EB] text-xs font-semibold text-[#081C15] focus:outline-none focus:border-[#1B4332]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#081C15] block mb-1">10-Digit Mobile Number *</label>
                <input
                  type="tel"
                  placeholder="e.g. 9823099887"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  maxLength={10}
                  required
                  className="w-full px-3 py-2 bg-[#F7F9F7] rounded-xl border border-[#E5E7EB] text-xs font-semibold text-[#081C15] focus:outline-none focus:border-[#1B4332]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-[#081C15] block mb-1">Password *</label>
                  <input
                    type="password"
                    placeholder="Create password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-[#F7F9F7] rounded-xl border border-[#E5E7EB] text-xs font-semibold text-[#081C15] focus:outline-none focus:border-[#1B4332]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#081C15] block mb-1">Re-check Password *</label>
                  <input
                    type="password"
                    placeholder="Confirm password"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-[#F7F9F7] rounded-xl border border-[#E5E7EB] text-xs font-semibold text-[#081C15] focus:outline-none focus:border-[#1B4332]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#081C15] block mb-1">Delivery Address & Area *</label>
                <input
                  type="text"
                  placeholder="e.g. Flat 302, Sai Heights, Rajapeth, Amravati"
                  value={regAddress}
                  onChange={(e) => setRegAddress(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-[#F7F9F7] rounded-xl border border-[#E5E7EB] text-xs font-semibold text-[#081C15] focus:outline-none focus:border-[#1B4332]"
                />
              </div>

              <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl text-[11px] text-[#1B4332] font-semibold flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#1B4332] shrink-0" />
                <span>Upon registration, the Dairy Owner will be immediately notified to activate your delivery account.</span>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-[#1B4332] hover:bg-[#143326] text-white font-bold text-xs rounded-xl shadow-md transition-all mt-2 disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? 'Registering Account...' : 'Create Customer Account & Sign In'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
