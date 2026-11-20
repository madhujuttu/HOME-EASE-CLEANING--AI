import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useCrm } from '../../context/CrmContext';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  Sun,
  Moon,
  Sparkles,
  ShieldCheck,
  Briefcase,
  Home,
  Wrench,
  CheckCircle2,
  Cpu,
  Layers,
  PhoneCall,
  Clock,
  Smartphone,
  Phone,
  Send
} from 'lucide-react';
import { UserRole } from '../../types';

export const StandardLogin: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { theme, toggleTheme, login, sendPhoneOtp, loginWithPhone, loginWithGoogle } = useCrm();

  const queryRole = searchParams.get('role');
  const [activePersona, setActivePersona] = useState<'all' | 'admin' | 'sales' | 'customer'>(() => {
    if (queryRole === 'admin') return 'admin';
    if (queryRole === 'sales') return 'sales';
    if (queryRole === 'customer') return 'customer';
    return 'all';
  });

  const [loginMethod, setLoginMethod] = useState<'credentials' | 'phone'>('credentials');
  const [email, setEmail] = useState('sophia.m@gmail.com');
  const [password, setPassword] = useState('password123');
  const [phone, setPhone] = useState('+1 (555) 432-8765');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [statusMsg, setStatusMsg] = useState('');

  const handlePersonaSelect = (persona: 'all' | 'admin' | 'sales' | 'customer') => {
    setActivePersona(persona);
    setErrorMsg('');
    setStatusMsg('');

    if (persona === 'admin') {
      setEmail('alexander@homeeaseguru.com');
      setPassword('password123');
      setLoginMethod('credentials');
    } else if (persona === 'sales') {
      setEmail('marcus.vance@homeeaseguru.com');
      setPassword('password123');
      setLoginMethod('credentials');
    } else if (persona === 'customer') {
      setEmail('sophia.m@gmail.com');
      setPassword('password123');
      setLoginMethod('phone');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setStatusMsg('');
    setIsLoading(true);

    const preferredRole: UserRole | undefined =
      activePersona === 'admin'
        ? 'admin'
        : activePersona === 'sales'
        ? 'sales'
        : activePersona === 'customer'
        ? 'customer'
        : undefined;

    const res = await login(email, password, preferredRole);
    setIsLoading(false);

    if (res.success) {
      const userRole = res.user?.role;
      setStatusMsg(`Authentication verified! Launching ${userRole?.toUpperCase()} workspace...`);

      setTimeout(() => {
        if (userRole === 'admin' || userRole === 'manager') {
          navigate('/admin/overview');
        } else if (userRole === 'sales') {
          navigate('/sales/dashboard');
        } else {
          navigate('/customer/home');
        }
      }, 400);
    } else {
      setErrorMsg(res.message || 'Invalid email or password. Please verify credentials or sign up.');
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg('');
    setStatusMsg('');
    setIsLoading(true);
    const res = await loginWithGoogle({
      email: 'sophia.m@gmail.com',
      name: 'Sophia Montgomery',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256'
    });
    setIsLoading(false);
    if (res.success) {
      setStatusMsg('Google authentication verified! Launching Customer Hub...');
      setTimeout(() => navigate('/customer/home'), 400);
    } else {
      setErrorMsg(res.message || 'Google sign-in failed.');
    }
  };

  const handleSendOtp = async () => {
    if (!phone) {
      setErrorMsg('Please enter a valid phone number.');
      return;
    }
    setErrorMsg('');
    setIsSendingOtp(true);
    const res = await sendPhoneOtp(phone);
    setIsSendingOtp(false);
    if (res.success) {
      setOtpSent(true);
      setStatusMsg(`Verification code dispatched to ${phone}. (Demo code: ${res.otp || '123456'})`);
    } else {
      setErrorMsg(res.message || 'Failed to dispatch verification code.');
    }
  };

  const handlePhoneLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) {
      setErrorMsg('Please enter the 6-digit OTP verification code.');
      return;
    }
    setErrorMsg('');
    setIsLoading(true);
    const res = await loginWithPhone(phone, otp, 'HomeEase Customer');
    setIsLoading(false);
    if (res.success) {
      setStatusMsg('Phone verified! Launching Customer Hub...');
      setTimeout(() => navigate('/customer/home'), 400);
    } else {
      setErrorMsg(res.message || 'Invalid or expired OTP code.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-navy-950 text-slate-800 dark:text-slate-100 flex flex-col justify-between transition-colors">
      {/* Top Navbar */}
      <header className="h-20 border-b border-slate-200 dark:border-navy-800 px-4 sm:px-8 flex items-center justify-between bg-white/85 dark:bg-navy-900/85 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl border border-electric-500/40 shadow-sm overflow-hidden flex-shrink-0 bg-white">
            <img
              src="/logo.png"
              alt="HomeEase Guru Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5 leading-none">
              <span className="font-black text-slate-900 dark:text-white text-base sm:text-lg tracking-tight">
                HOMEEASE
              </span>
              <span className="font-black text-electric-500 text-base sm:text-lg tracking-tight">
                GURU
              </span>
            </div>
            <p className="text-[10px] font-mono tracking-wider text-slate-500 dark:text-slate-400 font-semibold uppercase mt-0.5">
              Enterprise AI CRM & Operations
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/signup"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-electric-600 dark:text-electric-400 hover:text-electric-500 px-3.5 py-2 rounded-xl border border-electric-500/30 hover:border-electric-500 bg-electric-500/10 transition-all shadow-sm"
          >
            <span>Create Account</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-navy-800 hover:border-electric-500/40 text-slate-600 dark:text-slate-300 transition-all bg-white dark:bg-navy-900 shadow-sm cursor-pointer"
            title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>
        </div>
      </header>

      {/* Main Unique Login Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Visual Brand Identity & Enterprise Value */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            {/* Prominent Logo & Title Hero */}
            <div className="flex flex-col items-center lg:items-start">
              <div className="relative mb-4 group">
                <div className="absolute -inset-1.5 bg-gradient-to-r from-electric-500 to-blue-600 rounded-3xl blur-md opacity-35 group-hover:opacity-60 transition duration-500"></div>
                <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-3xl bg-white dark:bg-navy-900 border-2 border-electric-500/40 p-1.5 shadow-2xl overflow-hidden flex items-center justify-center">
                  <img
                    src="/logo.png"
                    alt="HomeEase Guru"
                    className="w-full h-full object-cover rounded-2xl"
                  />
                </div>
              </div>

              {/* Bold Title */}
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-electric-500/15 border border-electric-500/30 text-electric-600 dark:text-electric-400 text-xs font-mono font-bold">
                  <Cpu className="w-3.5 h-3.5 animate-pulse" />
                  <span>AI OPERATIONAL PLATFORM 2.0</span>
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                  HomeEase <span className="text-electric-500">Guru</span>
                </h1>
                <p className="text-sm sm:text-base font-medium text-slate-600 dark:text-slate-300 max-w-lg mx-auto lg:mx-0">
                  Unified AI-powered Customer Relationship Management, autonomous voice scheduling, and multi-service dispatch.
                </p>
              </div>
            </div>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-left">
              <div className="p-3.5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm flex items-start gap-3">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex-shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-slate-900 dark:text-white">Admin Command Center</h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Total pipeline oversight, lead scoring, and revenue intelligence.</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm flex items-start gap-3">
                <div className="p-2 rounded-xl bg-electric-500/10 text-electric-600 dark:text-electric-400 flex-shrink-0">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-slate-900 dark:text-white">Sales Rep Copilot</h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Autonomous voice calls, meeting intelligence & deal closure.</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm flex items-start gap-3 sm:col-span-2 lg:col-span-1">
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex-shrink-0">
                  <Home className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-slate-900 dark:text-white">Customer Client Hub</h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Instant sanitization bookings, live ETA tracking, & invoices.</p>
                </div>
              </div>
            </div>

            {/* Live System Status Indicator */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-200/60 dark:bg-navy-900 border border-slate-300/80 dark:border-navy-800 text-[11px] font-mono text-slate-600 dark:text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>SYSTEM ONLINE • REAL-TIME NOTIFICATIONS SYNCED</span>
            </div>
          </div>

          {/* Right Column: Unique Interactive Login Card */}
          <div className="lg:col-span-6">
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-electric-500/10 rounded-full blur-2xl pointer-events-none"></div>

              {/* Title & Description */}
              <div className="mb-6">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                  <span>Sign In to Platform</span>
                  <Sparkles className="w-5 h-5 text-electric-500" />
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Authenticate using your corporate email or select a 1-click workspace profile.
                </p>
              </div>

              {/* Workspace Persona Filter Tabs */}
              <div className="mb-5">
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Select Workspace Profile:
                </label>
                <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => handlePersonaSelect('admin')}
                    className={`py-2 px-1 rounded-xl transition-all flex flex-col items-center justify-center gap-1 ${
                      activePersona === 'admin'
                        ? 'bg-white dark:bg-navy-800 text-blue-600 dark:text-blue-400 shadow-sm font-bold'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span className="text-[10px] truncate">Admin</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePersonaSelect('sales')}
                    className={`py-2 px-1 rounded-xl transition-all flex flex-col items-center justify-center gap-1 ${
                      activePersona === 'sales'
                        ? 'bg-white dark:bg-navy-800 text-electric-600 dark:text-electric-400 shadow-sm font-bold'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Briefcase className="w-3.5 h-3.5" />
                    <span className="text-[10px] truncate">Employee</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePersonaSelect('customer')}
                    className={`py-2 px-1 rounded-xl transition-all flex flex-col items-center justify-center gap-1 ${
                      activePersona === 'customer'
                        ? 'bg-white dark:bg-navy-800 text-cyan-600 dark:text-cyan-400 shadow-sm font-bold'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Home className="w-3.5 h-3.5" />
                    <span className="text-[10px] truncate">Customer</span>
                  </button>
                </div>
              </div>

              {/* Status or Error Notifications */}
              {errorMsg && (
                <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs flex items-start gap-2">
                  <span className="font-bold">•</span>
                  <span>{errorMsg}</span>
                </div>
              )}

              {statusMsg && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>{statusMsg}</span>
                </div>
              )}

              {/* For Customers ONLY: Google Sign-In & Phone Number OTP options */}
              {activePersona === 'customer' ? (
                <>
                  {/* Google Sign-In Button */}
                  <div className="mb-4">
                    <button
                      type="button"
                      onClick={handleGoogleLogin}
                      disabled={isLoading}
                      className="w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-navy-700 hover:border-slate-300 dark:hover:border-navy-600 bg-white dark:bg-navy-950 text-slate-800 dark:text-slate-100 font-bold text-xs flex items-center justify-center gap-3 transition-all shadow-sm hover:shadow-md cursor-pointer disabled:opacity-60"
                    >
                      <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                      <span>Continue with Google</span>
                    </button>
                  </div>

                  {/* Divider */}
                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200 dark:border-navy-800" />
                    </div>
                    <div className="relative flex justify-center text-[10px] uppercase">
                      <span className="bg-white dark:bg-navy-900 px-3 text-slate-400 font-mono font-semibold">
                        Or sign in with
                      </span>
                    </div>
                  </div>

                  {/* Auth Method Toggle: Phone OTP vs Email/Password */}
                  <div className="flex p-1 rounded-xl bg-slate-100 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 mb-4 text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => { setLoginMethod('phone'); setErrorMsg(''); }}
                      className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                        loginMethod === 'phone'
                          ? 'bg-white dark:bg-navy-800 text-cyan-600 dark:text-cyan-400 shadow-sm'
                          : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>Phone Number OTP</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => { setLoginMethod('credentials'); setErrorMsg(''); }}
                      className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                        loginMethod === 'credentials'
                          ? 'bg-white dark:bg-navy-800 text-cyan-600 dark:text-cyan-400 shadow-sm'
                          : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Email & Password</span>
                    </button>
                  </div>
                </>
              ) : (
                /* Corporate Staff Notice for Admin, Sales Rep & Specialist (Email & Password Only) */
                <div className="mb-4 p-3 rounded-2xl bg-slate-100 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-400">
                  <ShieldCheck className="w-4 h-4 text-electric-500 flex-shrink-0" />
                  <span>
                    {activePersona === 'admin'
                      ? 'Executive Command Center: Corporate credentials (Email & Password) required.'
                      : activePersona === 'sales'
                      ? 'Sales Staff Portal: Enter your provisioned employee credentials (Email & Password).'
                      : 'Specialist Operations: Enter your registered credentials (Email & Password).'}
                  </span>
                </div>
              )}

              {activePersona === 'customer' && loginMethod === 'phone' ? (
                /* Phone Number OTP Verification Form */
                <form onSubmit={handlePhoneLogin} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1.5 font-semibold">
                      Mobile Phone Number
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={e => setPhone(e.target.value)}
                          placeholder="+1 (555) 432-8765"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-cyan-500 font-medium"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={isSendingOtp}
                        className="px-3.5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-navy-950 font-bold whitespace-nowrap transition-all shadow-sm flex items-center gap-1.5 text-xs disabled:opacity-50 cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{isSendingOtp ? 'Sending...' : otpSent ? 'Resend' : 'Send OTP'}</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-slate-600 dark:text-slate-400 font-semibold">
                        Enter 6-Digit OTP Code
                      </label>
                      <span className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400 font-bold">
                        Demo OTP: 123456
                      </span>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        maxLength={6}
                        required
                        value={otp}
                        onChange={e => setOtp(e.target.value)}
                        placeholder="123456"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-slate-900 dark:text-white text-sm font-mono tracking-widest text-center focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-navy-950 font-black transition-all shadow-glow flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer text-xs uppercase tracking-wider"
                  >
                    {isLoading ? (
                      <span>Verifying OTP...</span>
                    ) : (
                      <>
                        <span>Verify & Sign In</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* Login Form */
                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1.5 font-semibold">
                      Work or Account Email
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="name@homeeaseguru.com"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-electric-500 transition-colors font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-slate-600 dark:text-slate-400 font-semibold">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => alert('Demo password for all accounts is: password123')}
                        className="text-[11px] text-electric-600 dark:text-electric-400 hover:underline"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-electric-500 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-0.5">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={e => setRememberMe(e.target.checked)}
                        className="rounded border-slate-300 text-electric-500 focus:ring-electric-500"
                      />
                      <span className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                        Remember on this device
                      </span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 rounded-xl bg-electric-500 hover:bg-electric-400 text-navy-950 font-black transition-all shadow-glow hover:shadow-glow-lg flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer text-xs uppercase tracking-wider"
                  >
                    {isLoading ? (
                      <span>Verifying Credentials...</span>
                    ) : (
                      <>
                        <span>Launch Workspace</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* 1-Click Test Quick Profiles */}
              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-navy-800">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-2 font-bold">
                  Quick 1-Click Demo Profiles:
                </span>
                <div className="grid grid-cols-3 gap-2 text-[11px]">
                  <button
                    type="button"
                    onClick={() => handlePersonaSelect('admin')}
                    className="p-2 rounded-xl border border-slate-200 dark:border-navy-800 hover:border-blue-500/50 bg-slate-50 dark:bg-navy-950/60 text-left transition-all cursor-pointer"
                  >
                    <p className="font-bold text-slate-900 dark:text-white truncate">Alexander</p>
                    <p className="text-[10px] text-blue-600 dark:text-blue-400">Admin</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePersonaSelect('sales')}
                    className="p-2 rounded-xl border border-slate-200 dark:border-navy-800 hover:border-electric-500/50 bg-slate-50 dark:bg-navy-950/60 text-left transition-all cursor-pointer"
                  >
                    <p className="font-bold text-slate-900 dark:text-white truncate">Marcus V.</p>
                    <p className="text-[10px] text-electric-600 dark:text-electric-400">Employee</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePersonaSelect('customer')}
                    className="p-2 rounded-xl border border-slate-200 dark:border-navy-800 hover:border-cyan-500/50 bg-slate-50 dark:bg-navy-950/60 text-left transition-all cursor-pointer"
                  >
                    <p className="font-bold text-slate-900 dark:text-white truncate">Sophia M.</p>
                    <p className="text-[10px] text-cyan-600 dark:text-cyan-400">Customer</p>
                  </button>
                </div>
              </div>

              {/* Sign Up CTA */}
              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-navy-800 text-center">
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Don't have an account yet?{' '}
                  <Link to="/signup" className="font-bold text-electric-600 dark:text-electric-400 hover:underline">
                    Sign Up with custom properties &rarr;
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="h-14 border-t border-slate-200 dark:border-navy-800 px-6 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 bg-white/60 dark:bg-navy-900/60">
        <span>© 2026 HomeEase Guru Inc. All Rights Reserved. Enterprise AI Operations.</span>
        <div className="flex items-center gap-4">
          <span className="hover:underline cursor-pointer">Security Protocol</span>
          <span className="hover:underline cursor-pointer">Privacy Policy</span>
          <span className="hover:underline cursor-pointer">System Telemetry</span>
        </div>
      </footer>
    </div>
  );
};
