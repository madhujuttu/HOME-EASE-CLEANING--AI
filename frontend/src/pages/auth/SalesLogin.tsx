import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCrm } from '../../context/CrmContext';
import {
  Briefcase,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  Sun,
  Moon,
  ArrowLeft,
  Sparkles,
  PhoneCall
} from 'lucide-react';

export const SalesLogin: React.FC = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme, login } = useCrm();

  const [email, setEmail] = useState('marcus.vance@homeeaseguru.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    const result = await login(email, password, 'sales');
    setIsLoading(false);

    if (result.success) {
      navigate('/sales/dashboard');
    } else {
      setErrorMsg(result.message || 'Invalid email or password.');
    }
  };

  const handleQuickFill = () => {
    setEmail('marcus.vance@homeeaseguru.com');
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

      {/* Login Card */}
      <main className="flex-1 max-w-md w-full mx-auto px-4 py-8 flex flex-col justify-center">
        <div className="p-8 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-xl">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-2xl bg-electric-500/10 text-electric-600 dark:text-electric-400">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-electric-500/10 text-electric-600 dark:text-electric-400 font-bold">
                FIELD SALES WORKSPACE
              </span>
              <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                Sales Representative Login
              </h1>
            </div>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
            Personal lead pipeline, AI assisted dialing, meeting intelligence, and commission tracking.
          </p>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1.5 font-semibold">
                Sales Account Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="marcus.vance@homeeaseguru.com"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-electric-500 transition-colors"
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
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-electric-500 transition-colors"
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
                  className="rounded border-slate-300 text-electric-500 focus:ring-0"
                />
                <span>Remember this terminal</span>
              </label>
              <a href="#reset" onClick={(e) => { e.preventDefault(); alert('Demo password is: password123'); }} className="text-electric-600 dark:text-electric-400 hover:underline">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-electric-500 hover:bg-electric-400 text-navy-950 font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-md mt-2 disabled:opacity-50"
            >
              {isLoading ? (
                <span>Entering Workspace...</span>
              ) : (
                <>
                  <span>Enter Sales Workspace</span>
                  <ArrowRight className="w-4 h-4 text-navy-950" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Sign-in Account */}
          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-navy-800">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-2.5">
              1-Click Demo Profile:
            </span>
            <button
              type="button"
              onClick={handleQuickFill}
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-navy-800 hover:border-electric-500/50 text-left bg-slate-50 dark:bg-navy-850 transition-colors flex items-center justify-between"
            >
              <div>
                <p className="font-bold text-slate-900 dark:text-white">Marcus Vance</p>
                <p className="text-[10px] text-slate-400">Senior Field Sales Specialist • #1 Top Performer</p>
              </div>
              <span className="text-xs font-mono font-bold text-electric-600 dark:text-electric-400">
                Auto-fill
              </span>
            </button>
          </div>

          {/* Alternate Portals */}
          <div className="mt-5 text-center text-xs text-slate-400 space-y-1">
            <p>
              Are you an Admin or Manager?{' '}
              <Link to="/admin/login" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
                Admin Console →
              </Link>
            </p>
            <p>
              Are you a Customer?{' '}
              <Link to="/customer/login" className="text-cyan-600 dark:text-cyan-400 font-semibold hover:underline">
                Customer Portal →
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-400">
        © 2026 HomeEase Guru • Field Sales & Tele-Calling Console
      </footer>
    </div>
  );
};
