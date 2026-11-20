import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  Save,
  CheckCircle,
  ShieldCheck,
  Star
} from 'lucide-react';

export const CustomerProfile: React.FC = () => {
  const { currentUser, showToast } = useCrm();

  const [name, setName] = useState(() => {
    return localStorage.getItem('homeease_cust_name') || currentUser.name || 'Sophia Montgomery';
  });
  const [email, setEmail] = useState(() => {
    return localStorage.getItem('homeease_cust_email') || currentUser.email || 'sophia.m@gmail.com';
  });
  const [phone, setPhone] = useState(() => {
    return localStorage.getItem('homeease_cust_phone') || currentUser.phone || '+1 (555) 014-9921';
  });
  const [address, setAddress] = useState(() => {
    return localStorage.getItem('homeease_cust_address') || '742 Evergreen Terrace, Pasadena, CA 91101';
  });
  const [preferences, setPreferences] = useState(() => {
    return localStorage.getItem('homeease_cust_prefs') || 'Hypoallergenic botanical solutions, Morning 8 AM preference, Two Golden Retrievers';
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('homeease_cust_name', name);
    localStorage.setItem('homeease_cust_email', email);
    localStorage.setItem('homeease_cust_phone', phone);
    localStorage.setItem('homeease_cust_address', address);
    localStorage.setItem('homeease_cust_prefs', preferences);
    showToast('Profile Saved', 'Personal preferences and service address updated.', 'success');
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-navy-900 via-navy-850 to-navy-900 border border-electric-500/25 shadow-xl">
        <div className="flex items-center gap-4">
          <img
            src={currentUser.avatar}
            alt={name}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-electric-500/40"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-white">{name}</h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-electric-500/20 text-electric-400">
                PLATINUM VIP
              </span>
            </div>
            <p className="text-xs text-slate-300 font-mono mt-0.5">{phone} • {email}</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="p-6 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase font-mono tracking-wider mb-4">
          Contact Details & Service Address
        </h3>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Phone</label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">Primary Residence Address</label>
            <input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">Sanitization Preferences & Pet Notes</label>
            <textarea
              rows={3}
              value={preferences}
              onChange={e => setPreferences(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none leading-relaxed"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-electric-500 hover:bg-electric-400 text-navy-950 font-bold text-xs shadow-glow-sm"
            >
              Save Profile Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
