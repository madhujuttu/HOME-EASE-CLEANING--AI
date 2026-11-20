import React from 'react';
import { useCrm } from '../../context/CrmContext';
import {
  Award,
  TrendingUp,
  Target,
  DollarSign,
  UserCheck,
  CheckCircle2,
  Sparkles,
  BarChart2
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const personalTrend = [
  { week: 'Week 1', revenue: 7800, deals: 8 },
  { week: 'Week 2', revenue: 9400, deals: 11 },
  { week: 'Week 3', revenue: 10800, deals: 12 },
  { week: 'Week 4', revenue: 10200, deals: 11 },
];

export const SalesPerformance: React.FC = () => {
  const { employees } = useCrm();
  const myProfile = employees[0]; // Marcus Vance

  const quotaPct = Math.round((myProfile.achievedRevenue / myProfile.targetRevenue) * 100);

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Sales Performance & Quota Tracker
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Individual deal conversion metrics, quota pacing, and monthly commission estimates.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm">
          <span className="text-xs text-slate-400">Monthly Quota</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-1">₹{myProfile.targetRevenue.toLocaleString()}</p>
          <span className="text-[11px] text-slate-400">Base target</span>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm">
          <span className="text-xs text-slate-400">Achieved Revenue</span>
          <p className="text-2xl font-black text-electric-400 font-mono mt-1">₹{myProfile.achievedRevenue.toLocaleString()}</p>
          <span className="text-[11px] text-electric-400 font-mono font-bold">{quotaPct}% Attained</span>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm">
          <span className="text-xs text-slate-400">Closed Deals Won</span>
          <p className="text-2xl font-black text-cyan-400 font-mono mt-1">{myProfile.closedDeals}</p>
          <span className="text-[11px] text-slate-400">Residential & Villa</span>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm">
          <span className="text-xs text-slate-400">Lead Conversion Rate</span>
          <p className="text-2xl font-black text-amber-400 font-mono mt-1">{myProfile.conversionRate}%</p>
          <span className="text-[11px] text-electric-400 font-mono font-bold">+5.6% vs Team Avg</span>
        </div>
      </div>

      {/* Monthly Weekly Trend Chart */}
      <div className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
          Weekly Revenue Run Rate
        </h3>
        <p className="text-xs text-slate-400 mb-4">Pacing across November calendar weeks</p>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={personalTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" opacity={0.3} />
              <XAxis dataKey="week" stroke="#64748B" fontSize={11} />
              <YAxis stroke="#64748B" fontSize={11} tickFormatter={v => `₹${v / 1000}k`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0A1128',
                  borderColor: '#1D2E62',
                  borderRadius: '0.75rem',
                  color: '#fff',
                  fontSize: '12px'
                }}
              />
              <Area type="monotone" dataKey="revenue" name="Weekly Revenue (₹)" stroke="#00F59B" strokeWidth={2.5} fill="#00F59B" fillOpacity={0.2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
