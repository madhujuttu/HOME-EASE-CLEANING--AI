import React, { useState, useRef, useEffect } from 'react';
import { useCrm } from '../../context/CrmContext';
import {
  Bell,
  Sun,
  Moon,
  Search,
  Bot,
  UserCheck,
  Building,
  CheckCircle,
  ExternalLink,
  Sparkles,
  Command,
  LogOut,
  Trash2,
  ChevronDown,
  ShieldCheck,
  Briefcase,
  Home,
  Clock,
  Calendar
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { UserRole, NotificationItem } from '../../types';

export const Header: React.FC = () => {
  const {
    role,
    setRole,
    currentUser,
    logout,
    theme,
    toggleTheme,
    activeNotifications,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification,
    leads,
    customers,
    services
  } = useCrm();

  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [notifTab, setNotifTab] = useState<'unseen' | 'seen'>('unseen');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifDropdown(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unseenNotifs = activeNotifications.filter(n => !n.read);
  const seenNotifs = activeNotifications.filter(n => n.read);
  const unreadCount = unseenNotifs.length;
  const displayNotifs = notifTab === 'unseen' ? unseenNotifs : seenNotifs;

  const parseScheduledTime = (msg?: string): string | null => {
    if (!msg) return null;
    const regex = /(?:scheduled for|rescheduled to|scheduled on|scheduled follow-up:|next touchpoint:|touchpoint:)\s*([0-9]{4}-[0-9]{2}-[0-9]{2}[^.,;)]*|[A-Za-z]{3}\s+[0-9]{1,2}[^.,;)]*|today\s+at\s+[^.,;)]*)/i;
    const match = msg.match(regex);
    if (match && match[1]) {
      return match[1].trim();
    }
    return null;
  };

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    if (newRole === 'customer') {
      navigate('/customer/home');
    } else if (newRole === 'sales') {
      navigate('/sales/dashboard');
    } else {
      navigate('/admin/overview');
    }
  };

  const handleNotificationClick = (n: NotificationItem) => {
    markNotificationRead(n.id);
    setShowNotifDropdown(false);
    if (n.link) {
      navigate(n.link);
    }
  };

  const handleLogout = () => {
    setShowUserMenu(false);
    logout();
    navigate('/login');
  };

  const filteredResults = searchQuery.trim() === '' ? [] : [
    ...leads
      .filter(l => l.name.toLowerCase().includes(searchQuery.toLowerCase()) || l.phone.includes(searchQuery))
      .map(l => ({ type: 'Lead', title: l.name, sub: `${l.serviceInterest} • ₹${l.estimatedValue}`, link: role === 'sales' ? '/sales/leads' : '/admin/leads' })),
    ...customers
      .filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.email.toLowerCase().includes(searchQuery.toLowerCase()))
      .map(c => ({ type: 'Customer', title: c.name, sub: `${c.phone} • Tier: ${c.loyaltyTier}`, link: role === 'sales' ? '/sales/customers' : '/admin/customers' })),
    ...services
      .filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
      .map(s => ({ type: 'Service', title: s.name, sub: `₹${s.price} • ${s.categoryName}`, link: role === 'customer' ? '/customer/services' : '/admin/services' }))
  ];

  return (
    <>
      <header className="sticky top-0 z-30 h-20 border-b border-slate-200 dark:border-navy-800 bg-white/95 dark:bg-navy-950/95 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between transition-colors">
        {/* Left: Branding & Role Badge */}
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-3.5 group">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-navy-850 to-navy-950 border-2 border-electric-500/40 flex items-center justify-center shadow-glow group-hover:border-electric-400 group-hover:scale-105 transition-all overflow-hidden p-0.5 flex-shrink-0">
              <img src="/logo.png" alt="HomeEase Guru Logo" className="w-full h-full object-cover rounded-xl" />
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-1.5 leading-none">
                <span className="font-black tracking-tight text-slate-900 dark:text-white text-lg sm:text-xl">HOMEEASE</span>
                <span className="font-black tracking-tight text-electric-500 text-lg sm:text-xl">GURU</span>
              </div>
              <p className="text-[11px] font-mono tracking-wider text-slate-500 dark:text-slate-400 mt-1 font-semibold">AI ENTERPRISE CRM</p>
            </div>
          </Link>
        </div>

        {/* Center: Global Search trigger */}
        <div className="flex-1 max-w-md mx-4">
          <button
            onClick={() => setShowSearchModal(true)}
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-slate-400 hover:border-electric-500/50 hover:text-slate-300 text-xs transition-all shadow-inner"
          >
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-electric-400" />
              <span>Search leads, customers, bookings, AI calls...</span>
            </div>
            <div className="flex items-center gap-1 bg-slate-200 dark:bg-navy-800 px-1.5 py-0.5 rounded text-[10px] font-mono">
              <Command className="w-3 h-3" />
              <span>K</span>
            </div>
          </button>
        </div>

        {/* Right Action Icons & User info */}
        <div className="flex items-center gap-2.5">
          {/* Mobile role select */}
          <select
            value={role}
            onChange={e => handleRoleChange(e.target.value as UserRole)}
            className="lg:hidden text-xs py-1 px-2 rounded-lg bg-slate-100 dark:bg-navy-900 border border-slate-300 dark:border-navy-700 text-slate-800 dark:text-slate-200 capitalize"
          >
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="sales">Sales Rep</option>
            <option value="customer">Customer</option>
          </select>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-electric-400 hover:bg-slate-100 dark:hover:bg-navy-900 border border-transparent hover:border-slate-300 dark:hover:border-navy-800 transition-all"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-brand-amber" /> : <Moon className="w-4 h-4 text-navy-800" />}
          </button>

          {/* Notifications Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => {
                setShowNotifDropdown(!showNotifDropdown);
                setShowUserMenu(false);
              }}
              className="relative p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-electric-500 hover:bg-slate-100 dark:hover:bg-navy-900 border border-transparent hover:border-slate-300 dark:hover:border-navy-800 transition-all"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-electric-500 shadow-glow-sm flex items-center justify-center text-[8px] font-bold text-navy-950 font-mono">
                  {unreadCount > 9 ? '9+' : ''}
                </span>
              )}
            </button>

            {showNotifDropdown && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900 shadow-2xl p-4 z-50 animate-fade-in">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-navy-800">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Notifications
                    </h3>
                    {unreadCount > 0 && (
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-electric-500/20 text-electric-600 dark:text-electric-400 font-mono font-bold">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllNotificationsRead}
                      className="text-xs text-electric-600 dark:text-electric-400 hover:underline font-semibold"
                    >
                      Mark all as seen
                    </button>
                  )}
                </div>

                {/* Unseen vs Seen Stored Tabs */}
                <div className="flex items-center gap-1.5 my-2.5 p-1 rounded-xl bg-slate-100 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-xs font-semibold">
                  <button
                    onClick={() => setNotifTab('unseen')}
                    className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                      notifTab === 'unseen'
                        ? 'bg-white dark:bg-navy-900 text-slate-900 dark:text-white shadow-sm font-bold'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <span>Unseen</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-electric-500/15 text-electric-600 dark:text-electric-400 font-mono">
                      {unseenNotifs.length}
                    </span>
                  </button>
                  <button
                    onClick={() => setNotifTab('seen')}
                    className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                      notifTab === 'seen'
                        ? 'bg-white dark:bg-navy-900 text-slate-900 dark:text-white shadow-sm font-bold'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <span>Seen History</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-navy-800 text-slate-600 dark:text-slate-400 font-mono">
                      {seenNotifs.length}
                    </span>
                  </button>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-navy-800 max-h-80 overflow-y-auto my-2 custom-scrollbar">
                  {displayNotifs.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-xs space-y-1">
                      <p className="font-semibold text-slate-600 dark:text-slate-300">
                        {notifTab === 'unseen' ? 'All caught up!' : 'No seen notifications stored yet.'}
                      </p>
                      <p className="text-[11px]">
                        {notifTab === 'unseen'
                          ? 'All active notifications have been marked as seen.'
                          : 'Read notifications will be archived here for reference.'}
                      </p>
                    </div>
                  ) : (
                    displayNotifs.map(n => (
                      <div
                        key={n.id}
                        className={`p-3 rounded-xl transition-all flex items-start justify-between gap-2.5 group ${
                          n.read
                            ? 'opacity-75 hover:bg-slate-50 dark:hover:bg-navy-850'
                            : 'bg-slate-50 dark:bg-navy-850/80 border-l-2 border-electric-500'
                        }`}
                      >
                        <div
                          onClick={() => handleNotificationClick(n)}
                          className="flex-1 cursor-pointer"
                        >
                          <div className="flex items-center justify-between text-xs mb-0.5">
                            <div className="flex items-center gap-1.5">
                              {n.type === 'followup' ? (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                                  FOLLOW-UP
                                </span>
                              ) : (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-slate-200 dark:bg-navy-800 text-slate-600 dark:text-slate-400">
                                  {n.type}
                                </span>
                              )}
                              <span className="font-bold text-slate-900 dark:text-white group-hover:text-electric-600 dark:group-hover:text-electric-400 transition-colors line-clamp-1">
                                {n.title}
                              </span>
                            </div>
                            <span className="text-[10px] font-mono text-slate-400 flex-shrink-0">{n.timestamp}</span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed line-clamp-2">
                            {n.message}
                          </p>

                          {/* Explicit Scheduled Time Badge for Consultations, Follow-Ups & Bookings */}
                          {(n.scheduledTime || parseScheduledTime(n.message)) && (
                            <div className="flex items-center gap-1.5 px-2 py-0.5 mt-1.5 rounded-md bg-electric-500/15 border border-electric-500/30 text-electric-600 dark:text-electric-400 font-mono text-[11px] font-bold w-fit shadow-xs">
                              <Clock className="w-3 h-3 text-electric-500 flex-shrink-0" />
                              <span>Scheduled: {n.scheduledTime || parseScheduledTime(n.message)}</span>
                            </div>
                          )}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(n.id);
                          }}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-navy-800 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
                          title="Dismiss notification"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                <div className="pt-2 text-center border-t border-slate-100 dark:border-navy-800">
                  <Link
                    to={role === 'customer' ? '/customer/notifications' : role === 'sales' ? '/sales/notifications' : '/admin/notifications'}
                    onClick={() => setShowNotifDropdown(false)}
                    className="text-xs font-semibold text-electric-600 dark:text-electric-400 hover:underline inline-flex items-center gap-1"
                  >
                    Manage All Notifications <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Pill & Dropdown */}
          <div className="relative pl-2 border-l border-slate-200 dark:border-navy-800" ref={userMenuRef}>
            <button
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowNotifDropdown(false);
              }}
              className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-navy-900 transition-all text-left"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-8 h-8 rounded-full object-cover border border-electric-500/40 shadow-sm"
              />
              <div className="hidden md:block text-left">
                <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">{currentUser.name}</p>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-electric-500 animate-pulse" />
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">{role}</p>
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </button>

            {/* User Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900 shadow-2xl p-3 z-50 animate-fade-in text-xs">
                {/* Account Header */}
                <div className="p-2.5 pb-3 border-b border-slate-100 dark:border-navy-800">
                  <p className="font-extrabold text-slate-900 dark:text-white">{currentUser.name}</p>
                  <p className="text-slate-400 font-mono text-[11px] truncate mt-0.5">{currentUser.email}</p>
                  <span className="inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-electric-500/15 text-electric-600 dark:text-electric-400">
                    Role: {role}
                  </span>
                </div>

                {/* Portal Switchers */}
                <div className="py-2 space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 px-2 block mb-1">
                    Dedicated Logins:
                  </span>
                  <Link
                    to="/admin/login"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors font-medium"
                  >
                    <ShieldCheck className="w-4 h-4 text-blue-500" />
                    <span>Admin & Exec Login</span>
                  </Link>
                  <Link
                    to="/sales/login"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors font-medium"
                  >
                    <Briefcase className="w-4 h-4 text-electric-500" />
                    <span>Sales Rep Login</span>
                  </Link>
                  <Link
                    to="/customer/login"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors font-medium"
                  >
                    <Home className="w-4 h-4 text-cyan-500" />
                    <span>Customer Portal Login</span>
                  </Link>
                </div>

                {/* Log Out */}
                <div className="pt-2 border-t border-slate-100 dark:border-navy-800">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 font-bold transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out of Portal</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Global Quick Search Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-navy-950/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900 shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-navy-800 flex items-center gap-3">
              <Search className="w-5 h-5 text-electric-400" />
              <input
                type="text"
                autoFocus
                placeholder="Type to search leads, customers, services..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-none text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none text-sm"
              />
              <button
                onClick={() => {
                  setShowSearchModal(false);
                  setSearchQuery('');
                }}
                className="text-xs px-2 py-1 rounded bg-slate-100 dark:bg-navy-800 text-slate-400 hover:text-white"
              >
                ESC
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto p-4 space-y-2">
              {searchQuery.trim() === '' ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  <Bot className="w-8 h-8 mx-auto text-electric-400/40 mb-2" />
                  Type a customer name, phone number, or service to search across CRM records.
                </div>
              ) : filteredResults.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  No matching results found for "{searchQuery}".
                </div>
              ) : (
                filteredResults.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setShowSearchModal(false);
                      setSearchQuery('');
                      navigate(item.link);
                    }}
                    className="p-3 rounded-xl border border-slate-100 dark:border-navy-800 bg-slate-50 dark:bg-navy-850 hover:border-electric-500/50 cursor-pointer flex items-center justify-between group transition-all"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-navy-800 text-electric-400 font-semibold uppercase">
                          {item.type}
                        </span>
                        <h4 className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-electric-400 transition-colors">
                          {item.title}
                        </h4>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{item.sub}</p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-electric-400" />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
