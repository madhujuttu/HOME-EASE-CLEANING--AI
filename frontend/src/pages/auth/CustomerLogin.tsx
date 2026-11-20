import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCrm } from '../../context/CrmContext';
import {
  Home,
  Lock,
  Mail,
  User,
  Phone,
  MapPin,
  Eye,
  EyeOff,
  ArrowRight,
  Sun,
  Moon,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  Smartphone,
  Send
} from 'lucide-react';

interface CustomerLoginProps {
  defaultTab?: 'login' | 'register';
}

export const CustomerLogin: React.FC<CustomerLoginProps> = ({ defaultTab = 'login' }) => {
  const navigate = useNavigate();
  const { theme, toggleTheme, login, sendPhoneOtp, loginWithPhone, loginWithGoogle, addCustomer } = useCrm();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>(defaultTab);
  const [loginMethod, setLoginMethod] = useState<'phone' | 'credentials'>('phone');

  // Phone OTP login state
  const [phone, setPhone] = useState('+1 (555) 432-8765');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  // Email login form state
  const [email, setEmail] = useState('sophia.m@gmail.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [statusMsg, setStatusMsg] = useState('');

  const handleGoogleLogin = async () => {
    setErrorMsg('');
    setStatusMsg('');
    setIsLoading(true);
    const result = await loginWithGoogle({
      email: 'sophia.m@gmail.com',
      name: 'Sophia Montgomery',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256'
    });
    setIsLoading(false);
    if (result.success) {
      navigate('/customer/home');
    } else {
      setErrorMsg(result.message || 'Google authentication failed.');
    }
  };

  const handleSendOtp = async () => {
    if (!phone) {
      setErrorMsg('Please enter your mobile phone number.');
      return;
    }
    setErrorMsg('');
    setIsSendingOtp(true);
    const res = await sendPhoneOtp(phone);
    setIsSendingOtp(false);
    if (res.success) {
      setOtpSent(true);
      setStatusMsg(`OTP code sent to ${phone}. (Demo code: ${res.otp || '123456'})`);
    } else {
      setErrorMsg(res.message || 'Failed to send verification code.');
    }
  };

  const handlePhoneLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) {
      setErrorMsg('Please enter the 6-digit OTP code.');
      return;
    }
    setErrorMsg('');
    setIsLoading(true);
    const result = await loginWithPhone(phone, otp, 'HomeEase Customer');
    setIsLoading(false);
    if (result.success) {
      navigate('/customer/home');
    } else {
      setErrorMsg(result.message || 'Invalid or expired OTP code.');
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    const result = await login(email, password, 'customer');
    setIsLoading(false);

    if (result.success) {
      navigate('/customer/home');
    } else {
      setErrorMsg(result.message || 'Invalid email or password.');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    if (!regName || !regEmail || !regPhone) {
      setErrorMsg('Please fill in all required customer details.');
      setIsLoading(false);
      return;
    }

    addCustomer({
      name: regName,
      email: regEmail,
      phone: regPhone,
      address: regAddress || '1048 Ocean Avenue, Santa Monica, CA',
      servicePreferences: ['Ultra Deep Villa Sanitization'],
      loyaltyTier: 'Silver',
      totalSpent: 0,
      totalBookings: 0
    });

    const result = await login(regEmail, regPassword || 'password123', 'customer');
    setIsLoading(false);

    if (result.success) {
      navigate('/customer/home');
    } else {
      navigate('/customer/home');
    }
  };

  const handleQuickFill = () => {
    setEmail('sophia.m@gmail.com');
    setPassword('password123');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-navy-950 text-slate-800 dark:text-slate-100 flex flex-col justify-between transition-colors">
      {/* Top Navbar */}
      <header className="h-20 border-b border-slate-200 dark:border-navy-800 px-6 flex items-center justify-between bg-white/80 dark:bg-navy-900/80 backdrop-blur-md">
        <Link to="/login" className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>All Portals</span>
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-navy-800 hover:border-electric-500/40 text-slate-600 dark:text-slate-300 transition-all bg-white dark:bg-navy-900 shadow-sm"
            title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>
        </div>
      </header>

      {/* Main Card */}
      <main className="flex-1 max-w-md w-full mx-auto px-4 py-8 flex flex-col justify-center">
        <div className="p-8 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-xl">
          {/* Header */}
          <div className="flex items-center gap-3 mb-5">
            <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
              <Home className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-bold">
                CLIENT HUB
              </span>
              <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                Customer Portal
              </h1>
            </div>
          </div>

          {/* Tab Selector */}
          <div className="flex p-1 rounded-xl bg-slate-100 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 mb-6 text-xs font-bold">
            <button
              onClick={() => setActiveTab('login')}
              className={`flex-1 py-2 rounded-lg transition-all ${
                activeTab === 'login'
                  ? 'bg-white dark:bg-navy-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setActiveTab('register')}
              className={`flex-1 py-2 rounded-lg transition-all ${
                activeTab === 'register'
                  ? 'bg-white dark:bg-navy-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Create Account
            </button>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs">
              {errorMsg}
            </div>
          )}

          {statusMsg && (
            <div className="mb-4 p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{statusMsg}</span>
            </div>
          )}

          {activeTab === 'login' ? (
            <div className="space-y-4">
              {/* Google Sign In Button */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-navy-750 hover:border-cyan-500/50 bg-white dark:bg-navy-850 text-slate-800 dark:text-slate-100 font-bold text-xs flex items-center justify-center gap-3 transition-all shadow-sm cursor-pointer disabled:opacity-60"
              >
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Continue with Google</span>
              </button>

              {/* Divider */}
              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-navy-800" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase">
                  <span className="bg-white dark:bg-navy-900 px-2.5 text-slate-400 font-mono font-semibold">
                    Or sign in with
                  </span>
                </div>
              </div>

              {/* Method Tabs: Phone Number vs Email */}
              <div className="flex p-1 rounded-xl bg-slate-100 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => { setLoginMethod('phone'); setErrorMsg(''); }}
                  className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    loginMethod === 'phone'
                      ? 'bg-white dark:bg-navy-900 text-cyan-600 dark:text-cyan-400 shadow-sm'
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
                      ? 'bg-white dark:bg-navy-900 text-cyan-600 dark:text-cyan-400 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Email & Password</span>
                </button>
              </div>

              {loginMethod === 'phone' ? (
                /* Phone Number OTP Flow */
                <form onSubmit={handlePhoneLoginSubmit} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1.5 font-semibold">
                      Customer Phone Number
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Phone className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={e => setPhone(e.target.value)}
                          placeholder="+1 (555) 432-8765"
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-cyan-500 transition-colors"
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
                      <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                      <input
                        type="text"
                        maxLength={6}
                        required
                        value={otp}
                        onChange={e => setOtp(e.target.value)}
                        placeholder="123456"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white font-mono text-sm tracking-widest text-center focus:outline-none focus:border-cyan-500 transition-colors"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-navy-950 font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-md mt-2 disabled:opacity-50 cursor-pointer"
                  >
                    {isLoading ? (
                      <span>Verifying OTP...</span>
                    ) : (
                      <>
                        <span>Verify & Sign In</span>
                        <ArrowRight className="w-4 h-4 text-navy-950" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* Email Password Form */
                <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1.5 font-semibold">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="sophia.m@gmail.com"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-cyan-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1.5 font-semibold">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-cyan-500 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-400">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={e => setRememberMe(e.target.checked)}
                        className="rounded border-slate-300 text-cyan-500 focus:ring-0"
                      />
                      <span>Remember me</span>
                    </label>
                    <a href="#reset" onClick={(e) => { e.preventDefault(); alert('Demo password is: password123'); }} className="text-cyan-600 dark:text-cyan-400 hover:underline">
                      Forgot password?
                    </a>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-navy-950 font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-md mt-2 disabled:opacity-50 cursor-pointer"
                  >
                    {isLoading ? (
                      <span>Entering Portal...</span>
                    ) : (
                      <>
                        <span>Sign In to Customer Hub</span>
                        <ArrowRight className="w-4 h-4 text-navy-950" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Quick Demo Sign-in Account */}
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-navy-800">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-2">
                  1-Click Demo Client:
                </span>
                <button
                  type="button"
                  onClick={handleQuickFill}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-navy-800 hover:border-cyan-500/50 text-left bg-slate-50 dark:bg-navy-850 transition-colors flex items-center justify-between cursor-pointer"
                >
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white text-xs">Sophia Montgomery</p>
                    <p className="text-[10px] text-slate-400">Platinum VIP Member • 12 Bookings</p>
                  </div>
                  <span className="text-xs font-mono font-bold text-cyan-600 dark:text-cyan-400">
                    Auto-fill
                  </span>
                </button>
              </div>
            </div>
          ) : (
            /* CREATE ACCOUNT FORM */
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={e => setRegName(e.target.value)}
                    placeholder="e.g. Rachel Adams"
                    className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={e => setRegEmail(e.target.value)}
                    placeholder="rachel.adams@example.com"
                    className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="tel"
                    required
                    value={regPhone}
                    onChange={e => setRegPhone(e.target.value)}
                    placeholder="+1 (555) 234-5678"
                    className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">
                  Service Address
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={regAddress}
                    onChange={e => setRegAddress(e.target.value)}
                    placeholder="Apartment / Villa, Street, City"
                    className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="password"
                    value={regPassword}
                    onChange={e => setRegPassword(e.target.value)}
                    placeholder="Create a secure password"
                    className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-navy-950 font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-md mt-4 disabled:opacity-50"
              >
                <span>Register Customer Account</span>
                <ArrowRight className="w-4 h-4 text-navy-950" />
              </button>
            </form>
          )}

          {/* Alternate Portals */}
          <div className="mt-6 text-center text-xs text-slate-400 space-y-1">
            <p>
              Company Employee or Admin?{' '}
              <Link to="/admin/login" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
                Staff Login →
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-400">
        © 2026 HomeEase Guru • Customer Self-Service Experience
      </footer>
    </div>
  );
};
