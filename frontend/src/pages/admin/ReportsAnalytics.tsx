import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import {
  BarChart3,
  Calendar,
  Download,
  TrendingUp,
  DollarSign,
  UserCheck,
  CheckCircle,
  Clock,
  Sparkles,
  FileSpreadsheet
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

const servicePerfData = [
  { name: 'Villa Deep Clean', revenue: 24800, bookings: 71, fill: '#00F59B' },
  { name: 'Apt Express Clean', revenue: 14200, bookings: 68, fill: '#3B82F6' },
  { name: 'Kitchen Degrease', revenue: 11400, bookings: 54, fill: '#06B6D4' },
  { name: 'Sofa Hydro Care', revenue: 9800, bookings: 62, fill: '#F59E0B' },
  { name: 'Tenant Guarantee', revenue: 16800, bookings: 40, fill: '#8B5CF6' },
];

const sourceShareData = [
  { name: 'AI Voice Inbound', value: 38, color: '#00F59B' },
  { name: 'Google Ads', value: 26, color: '#3B82F6' },
  { name: 'Meta Ads', value: 18, color: '#F59E0B' },
  { name: 'Organic Referral', value: 18, color: '#8B5CF6' },
];

export const ReportsAnalytics: React.FC = () => {
  const { showToast } = useCrm();
  const [dateRange, setDateRange] = useState('30d');

  const handleExportFullReport = () => {
    const headers = ['Metric_Service', 'Revenue_INR', 'Volume_Share', 'Category'];
    const rows = [
      ...servicePerfData.map(s => [`"${s.name}"`, s.revenue, s.bookings, 'Service Line']),
      ...sourceShareData.map(src => [`"${src.name}"`, '0', `${src.value}%`, 'Customer Acquisition Channel'])
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `homeease_bi_report_${dateRange}_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Comprehensive Intelligence Report Exported', `Downloaded analytical CSV for ${dateRange}.`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            Business Intelligence & Executive Analytics
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-electric-500/20 text-electric-400 font-mono font-bold">
              Real-time BI
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Conversion funnels, technician yield, customer acquisition cost (CAC), and service line profitability.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Date range pills */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-xs font-semibold">
            {[
              { id: '7d', label: '7 Days' },
              { id: '30d', label: '30 Days' },
              { id: 'quarter', label: 'This Quarter' },
              { id: 'ytd', label: 'YTD' }
            ].map(r => (
              <button
                key={r.id}
                onClick={() => setDateRange(r.id)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  dateRange === r.id
                    ? 'bg-electric-500 text-navy-950 font-bold shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-white'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportFullReport}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-electric-500 hover:bg-electric-400 text-navy-950 font-bold text-xs shadow-glow-sm transition-all"
          >
            <Download className="w-4 h-4" /> Export Report
          </button>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Service Performance Revenue Breakdown */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Service Line Profitability</h3>
              <p className="text-xs text-slate-400">Gross revenue generated across distinct cleaning packages</p>
            </div>
            <span className="text-xs font-mono text-electric-400 font-bold">Top Yield: Villa Clean</span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={servicePerfData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" opacity={0.3} />
                <XAxis dataKey="name" stroke="#64748B" fontSize={10} />
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
                <Bar dataKey="revenue" name="Gross Revenue (₹)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lead Source Distribution */}
        <div className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Customer Acquisition Channel Share</h3>
            <p className="text-xs text-slate-400 mb-4">Inbound source breakdown</p>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sourceShareData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {sourceShareData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0A1128',
                      borderColor: '#1D2E62',
                      borderRadius: '0.75rem',
                      color: '#fff',
                      fontSize: '12px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-navy-800 text-xs">
            {sourceShareData.map(s => (
              <div key={s.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="text-slate-600 dark:text-slate-400">{s.name}</span>
                </div>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{s.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm">
          <span className="text-xs text-slate-400">Customer Acquisition Cost</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-1">₹42.80</p>
          <span className="text-[11px] text-electric-400 font-mono font-semibold">-18% vs Q3</span>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm">
          <span className="text-xs text-slate-400">Customer Lifetime Value</span>
          <p className="text-2xl font-black text-electric-400 font-mono mt-1">₹1,890</p>
          <span className="text-[11px] text-slate-400">44:1 LTV to CAC Ratio</span>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm">
          <span className="text-xs text-slate-400">Repeat Booking Rate</span>
          <p className="text-2xl font-black text-cyan-400 font-mono mt-1">68.2%</p>
          <span className="text-[11px] text-slate-400">Biannual retention</span>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm">
          <span className="text-xs text-slate-400">Technician Punctuality</span>
          <p className="text-2xl font-black text-amber-400 font-mono mt-1">98.6%</p>
          <span className="text-[11px] text-electric-400 font-mono font-semibold">On-time arrival</span>
        </div>
      </div>
    </div>
  );
};
