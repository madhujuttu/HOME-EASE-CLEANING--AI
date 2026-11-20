import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCrm } from '../../context/CrmContext';
import {
  ShieldCheck,
  Briefcase,
  Home,
  ArrowRight,
  Sun,
  Moon,
  Sparkles,
  Lock,
  CheckCircle2,
  PhoneCall,
  UserCheck
} from 'lucide-react';

export const LoginGateway: React.FC = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme, login } = useCrm();

  const handleQuickDemo = async (role: 'admin' | 'sales' | 'customer') => {
    if (role === 'admin') {
      await login('alexander@homeeaseguru.com', 'password123', 'admin');
      navigate('/admin/overview');
    } else if (role === 'sales') {
      await login('marcus.vance@homeeaseguru.com', 'password123', 'sales');
      navigate('/sales/dashboard');
    } else {
      await login('sophia.m@gmail.com', 'password123', 'customer');
      navigate('/customer/home');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-navy-950 text-slate-800 dark:text-slate-100 flex flex-col justify-between transition-colors">
      {/* Top Navbar */}
      <header className="h-20 border-b border-slate-200 dark:border-navy-800 px-6 flex items-center justify-between bg-white/80 dark:bg-navy-900/80 backdrop-blur-md">
        <div className="flex items-center gap-3.5">
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
                ENTERPRISE
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              AI-Powered CRM & Operational Platform
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-navy-800 hover:border-electric-500/40 text-slate-600 dark:text-slate-300 transition-all bg-white dark:bg-navy-900 shadow-sm"
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

      {/* Main Portal Selector Hero */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-12 flex flex-col justify-center">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="px-3 py-1 rounded-full bg-electric-500/15 text-electric-600 dark:text-electric-400 text-xs font-mono font-bold inline-flex items-center gap-1.5 mb-3">
            <Lock className="w-3.5 h-3.5" /> SECURE ROLE-BASED ACCESS
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Select Your Portal Gateway
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            HomeEase Guru provides distinct, segregated portals for Executives, Sales Professionals, and Homeowners. Select your designated gateway below.
          </p>
        </div>

        {/* 3 Portal Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Admin & Executive */}
          <div className="p-7 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm hover:shadow-xl hover:border-electric-500/50 transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="p-3.5 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <span className="text-[11px] font-mono uppercase px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold">
                  ADMIN / EXEC
                </span>
              </div>

              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                Executive & Admin Portal
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                Complete enterprise oversight: fleet dispatch, AI voice calling command center, financial ledgers, provider credentials, and BI analytics.
              </p>

              <div className="mt-5 space-y-2 text-xs text-slate-600 dark:text-slate-300 font-medium">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-electric-500 flex-shrink-0" />
                  <span>Pipeline & Lead Allocation</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-electric-500 flex-shrink-0" />
                  <span>AI Voice Calling Operations</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-electric-500 flex-shrink-0" />
                  <span>Revenue & Settlement Ledgers (₹)</span>
                </div>
              </div>
            </div>

            <div className="mt-8 space-y-2.5">
              <button
                onClick={() => navigate('/admin/login')}
                className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-navy-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md group-hover:scale-[1.02]"
              >
                <span>Enter Admin Login</span>
                <ArrowRight className="w-4 h-4 text-electric-400" />
              </button>
              <button
                onClick={() => handleQuickDemo('admin')}
                className="w-full py-2 px-3 rounded-lg border border-slate-200 dark:border-navy-800 text-[11px] font-mono text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                1-Click Demo: Alexander (Admin)
              </button>
            </div>
          </div>

          {/* Card 2: Sales Representative */}
          <div className="p-7 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm hover:shadow-xl hover:border-electric-500/50 transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="p-3.5 rounded-2xl bg-electric-500/10 text-electric-600 dark:text-electric-400">
                  <Briefcase className="w-7 h-7" />
                </div>
                <span className="text-[11px] font-mono uppercase px-2.5 py-1 rounded-lg bg-electric-500/10 text-electric-600 dark:text-electric-400 font-bold">
                  SALES SUITE
                </span>
              </div>

              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                Sales Representative Workspace
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                Dedicated deal closing console: personal lead board, meeting intelligence, chronological client visits, AI sales copilot, and quota pacing.
              </p>

              <div className="mt-5 space-y-2 text-xs text-slate-600 dark:text-slate-300 font-medium">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-electric-500 flex-shrink-0" />
                  <span>Personal Leads & Propensity Scores</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-electric-500 flex-shrink-0" />
                  <span>AI Tele-calling & Meeting Intelligence</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-electric-500 flex-shrink-0" />
                  <span>Monthly Sales Quota Tracker</span>
                </div>
              </div>
            </div>

            <div className="mt-8 space-y-2.5">
              <button
                onClick={() => navigate('/sales/login')}
                className="w-full py-3 px-4 rounded-xl bg-electric-500 hover:bg-electric-400 text-navy-950 font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-md group-hover:scale-[1.02]"
              >
                <span>Enter Sales Login</span>
                <ArrowRight className="w-4 h-4 text-navy-950" />
              </button>
              <button
                onClick={() => handleQuickDemo('sales')}
                className="w-full py-2 px-3 rounded-lg border border-slate-200 dark:border-navy-800 text-[11px] font-mono text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                1-Click Demo: Marcus (Sales)
              </button>
            </div>
          </div>

          {/* Card 3: Customer Hub */}
          <div className="p-7 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm hover:shadow-xl hover:border-electric-500/50 transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="p-3.5 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                  <Home className="w-7 h-7" />
                </div>
                <span className="text-[11px] font-mono uppercase px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-bold">
                  CUSTOMER HUB
                </span>
              </div>

              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                Customer Service Portal
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                Client experience dashboard: browse hospital-grade sanitization packages, live technician GPS arrival tracking, invoices, and AI booking concierge.
              </p>

              <div className="mt-5 space-y-2 text-xs text-slate-600 dark:text-slate-300 font-medium">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-electric-500 flex-shrink-0" />
                  <span>Browse Sanitization Catalog</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-electric-500 flex-shrink-0" />
                  <span>Live Technician GPS Tracking</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-electric-500 flex-shrink-0" />
                  <span>Invoices & VIP Loyalty Rewards</span>
                </div>
              </div>
            </div>

            <div className="mt-8 space-y-2.5">
              <button
                onClick={() => navigate('/customer/login')}
                className="w-full py-3 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-navy-950 font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-md group-hover:scale-[1.02]"
              >
                <span>Enter Customer Login</span>
                <ArrowRight className="w-4 h-4 text-navy-950" />
              </button>
              <button
                onClick={() => handleQuickDemo('customer')}
                className="w-full py-2 px-3 rounded-lg border border-slate-200 dark:border-navy-800 text-[11px] font-mono text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                1-Click Demo: Sophia (Customer)
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-navy-800 py-6 text-center text-xs text-slate-400">
        <p>© 2026 HomeEase Guru Inc. All Rights Reserved. Enterprise AI CRM Platform.</p>
      </footer>
    </div>
  );
};
