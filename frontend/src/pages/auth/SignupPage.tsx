import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCrm } from '../../context/CrmContext';
import {
  Lock,
  Mail,
  User,
  Phone,
  MapPin,
  Briefcase,
  Wrench,
  Home,
  Eye,
  EyeOff,
  ArrowRight,
  Sun,
  Moon,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Building,
  Layers
} from 'lucide-react';
import { UserRole } from '../../types';

export const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme, register } = useCrm();

  // Common customer fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Customer specific properties
  const [address, setAddress] = useState('');
  const [propertyType, setPropertyType] = useState('Luxury Villa');
  const [preferredService, setPreferredService] = useState('Ultra Deep Villa Sanitization');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please verify your entry.');
      return;
    }

    if (!agreeTerms) {
      setErrorMsg('You must agree to the Terms of Service to create an account.');
      return;
    }

    setIsLoading(true);

    const res = await register({
      name,
      email,
      password,
      role: 'customer',
      phone,
      address,
      propertyType,
      preferredService
    });

    setIsLoading(false);

    if (res.success) {
      navigate('/customer/home');
    } else {
      setErrorMsg(res.message || 'Could not complete registration. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-navy-950 text-slate-800 dark:text-slate-100 flex flex-col justify-between transition-colors">
      {/* Top Navbar */}
      <header className="h-20 border-b border-slate-200 dark:border-navy-800 px-6 flex items-center justify-between bg-white/80 dark:bg-navy-900/80 backdrop-blur-md">
        <Link to="/" className="flex items-center gap-3.5">
          <img
            src="/logo.png"
            alt="HomeEase Guru"
            className="w-12 h-12 rounded-xl object-cover border border-electric-500/40 shadow-sm"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-tight text-slate-900 dark:text-white text-lg">
                HomeEase Guru
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-electric-500/15 text-electric-600 dark:text-electric-400 font-bold">
                REGISTRATION
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Create an account with role-tailored properties
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-3 py-1.5 rounded-xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 shadow-sm transition-all"
          >
            Sign In &rarr;
          </Link>

          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-navy-800 hover:border-electric-500/40 text-slate-600 dark:text-slate-300 transition-all bg-white dark:bg-navy-900 shadow-sm"
            title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>
        </div>
      </header>

      {/* Main Registration Container */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-8 flex flex-col justify-center">
        <div className="p-8 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-xl transition-all">
          <div className="text-center max-w-lg mx-auto mb-8">
            <span className="px-3 py-1 rounded-full bg-electric-500/15 text-electric-600 dark:text-electric-400 text-xs font-mono font-bold inline-flex items-center gap-1.5 mb-2">
              <Sparkles className="w-3.5 h-3.5" /> SECURE ONBOARDING
            </span>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Create Your Account
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Select your workspace role to unlock customized workflows and real-time operations.
            </p>
          </div>

          {/* Admin Provisioning Notice for Employees & Specialists */}
          <div className="mb-6 p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-blue-700 dark:text-blue-300">
            <div className="flex items-center gap-2.5">
              <Briefcase className="w-4 h-4 flex-shrink-0 text-blue-500" />
              <span>
                <strong>Employee & Specialist Provisioning:</strong> Staff, sales rep, and specialist accounts are provisioned exclusively by the Administrator.
              </span>
            </div>
            <Link
              to="/login?role=sales"
              className="px-3 py-1.5 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-700 dark:text-blue-200 font-bold whitespace-nowrap text-[11px] transition-colors self-start sm:self-auto"
            >
              Staff Sign In &rarr;
            </Link>
          </div>

          {errorMsg && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs flex items-start gap-2">
              <span className="font-bold">•</span>
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Common Credentials */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1.5 font-semibold">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Eleanor Vance"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-electric-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1.5 font-semibold">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="eleanor@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-electric-500"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1.5 font-semibold">
                  Password (min 6 chars) *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-electric-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1.5 font-semibold">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-electric-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1.5 font-semibold">
                Phone Number *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+1 (555) 432-8765"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-electric-500"
                />
              </div>
            </div>

            {/* Customer Residence & Service Details */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 space-y-3.5 mt-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                <Layers className="w-4 h-4 text-electric-500" />
                <span>Customer Residence & Service Preferences</span>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">
                  Service Street Address & City
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    placeholder="e.g. 742 Evergreen Terrace, San Francisco, CA"
                    className="w-full pl-10 pr-4 py-2 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-slate-900 dark:text-white text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">
                    Residence Property Type
                  </label>
                  <select
                    value={propertyType}
                    onChange={e => setPropertyType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-slate-900 dark:text-white text-xs"
                  >
                    <option value="Luxury Villa">Luxury Villa</option>
                    <option value="Executive Penthouse">Executive Penthouse</option>
                    <option value="High-Rise Apartment">High-Rise Apartment</option>
                    <option value="Commercial Office">Commercial Office</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">
                    Primary Service Interest
                  </label>
                  <select
                    value={preferredService}
                    onChange={e => setPreferredService(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-slate-900 dark:text-white text-xs"
                  >
                    <option value="Ultra Deep Villa Sanitization">Ultra Deep Villa Sanitization</option>
                    <option value="Kitchen & Bath Steam Detox">Kitchen & Bath Steam Detox</option>
                    <option value="Sofa & Fabric Hydro-Extraction">Sofa & Fabric Hydro-Extraction</option>
                    <option value="Turnkey Move-In Detailing">Turnkey Move-In Detailing</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Terms Checkbox */}
            <div className="pt-2">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={e => setAgreeTerms(e.target.checked)}
                  className="rounded border-slate-300 text-electric-500 focus:ring-electric-500"
                />
                <span className="text-[11px] text-slate-600 dark:text-slate-400">
                  I agree to the HomeEase Guru Terms of Service and Privacy Policy.
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-electric-500 hover:bg-electric-400 text-navy-950 font-bold transition-all shadow-glow hover:shadow-glow-lg flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer text-xs mt-2"
            >
              {isLoading ? (
                <span>Creating Account & Provisioning Workspace...</span>
              ) : (
                <>
                  <span>Create Account & Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Switch to Login */}
          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-navy-800 text-center">
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-electric-600 dark:text-electric-400 hover:underline">
                Sign In &rarr;
              </Link>
            </p>
          </div>
        </div>

        {/* Separate Admin Portal Link */}
        <div className="mt-6 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Company Executive or System Administrator?{' '}
            <Link to="/admin/login" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
              Access Dedicated Executive Admin Portal &rarr;
            </Link>
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="h-14 border-t border-slate-200 dark:border-navy-800 px-6 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 bg-white/40 dark:bg-navy-900/40">
        <span>© 2026 HomeEase Guru Inc. Enterprise AI CRM Platform.</span>
        <div className="flex items-center gap-4">
          <span className="hover:underline cursor-pointer">Terms of Service</span>
          <span className="hover:underline cursor-pointer">Privacy Policy</span>
          <span className="hover:underline cursor-pointer">Security Safeguards</span>
        </div>
      </footer>
    </div>
  );
};
