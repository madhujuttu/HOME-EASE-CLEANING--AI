import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import { Customer } from '../../types';
import {
  Users,
  Search,
  Phone,
  Mail,
  MapPin,
  Star,
  ChevronRight,
  Calendar,
  CreditCard,
  MessageSquare
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const SalesCustomers: React.FC = () => {
  const { customers } = useCrm();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCust, setSelectedCust] = useState<Customer | null>(null);

  const filtered = customers.filter(c => {
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return c.name.toLowerCase().includes(q) || c.phone.includes(q) || c.address.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            My Converted Customer Accounts
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-electric-500/20 text-electric-400 font-mono font-bold">
              {filtered.length} Accounts
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Maintain relationship health, review recurring booking frequency, and upsell packages.
          </p>
        </div>
      </div>

      {/* Search Toolbar */}
      <div className="p-3.5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by customer name, address or contact..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full bg-transparent border-none text-slate-900 dark:text-white placeholder-slate-400 text-xs focus:outline-none"
        />
      </div>

      {/* Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(cust => (
          <div
            key={cust.id}
            onClick={() => setSelectedCust(cust)}
            className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm hover:border-electric-500/40 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-electric-400 transition-colors">
                    {cust.name}
                  </h3>
                  <span className="text-[10px] font-mono text-electric-400 font-bold uppercase">
                    {cust.loyaltyTier} Tier
                  </span>
                </div>
                <div className="flex items-center gap-1 font-mono text-amber-400 font-bold text-xs">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{cust.satisfactionScore}</span>
                </div>
              </div>

              <div className="mt-3 space-y-1 text-xs text-slate-600 dark:text-slate-400">
                <p className="flex items-center gap-1.5 font-mono">{cust.phone}</p>
                <p className="truncate">{cust.address}</p>
              </div>

              <div className="flex flex-wrap gap-1 mt-3">
                {cust.servicePreferences.map((pref, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-slate-100 dark:bg-navy-800 text-[10px] text-slate-300">
                    {pref}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-navy-800 flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] text-slate-400">Total Spent</span>
                <p className="font-mono font-bold text-electric-400">₹{cust.totalSpent}</p>
              </div>

              <button
                onClick={e => {
                  e.stopPropagation();
                  navigate('/sales/ai-calling');
                }}
                className="px-3 py-1.5 rounded-lg bg-electric-500 hover:bg-electric-400 text-navy-950 font-bold text-xs flex items-center gap-1"
              >
                <Phone className="w-3.5 h-3.5" /> Call
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
