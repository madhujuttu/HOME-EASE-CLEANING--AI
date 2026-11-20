import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import {
  Users,
  UserCheck,
  Calendar,
  DollarSign,
  TrendingUp,
  Sparkles,
  ArrowUpRight,
  Clock,
  CheckCircle,
  Briefcase,
  AlertCircle,
  ShieldCheck,
  ChevronRight,
  Plus,
  PhoneCall,
  Video,
  X,
  ExternalLink,
  MapPin,
  CheckCircle2,
  CalendarCheck
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
  Legend
} from 'recharts';
import { Link } from 'react-router-dom';
import { Meeting } from '../../types';

const revenueData = [
  { month: 'Jun', revenue: 245000, target: 220000, bookings: 78 },
  { month: 'Jul', revenue: 298000, target: 250000, bookings: 92 },
  { month: 'Aug', revenue: 334000, target: 280000, bookings: 110 },
  { month: 'Sep', revenue: 312000, target: 300000, bookings: 104 },
  { month: 'Oct', revenue: 368000, target: 330000, bookings: 125 },
  { month: 'Nov', revenue: 421000, target: 380000, bookings: 142 },
];

export const Overview: React.FC = () => {
  const {
    leads,
    services,
    customers,
    employees,
    meetings,
    bookings,
    providers,
    insights,
    showToast,
    addTask,
    addMeeting,
    addLead
  } = useCrm();

  const activeServices = services.filter(s => s.status === 'active');

  const pipelineData = [
    { stage: 'New Leads', count: leads.filter(l => l.status === 'new').length, fill: '#3B82F6' },
    { stage: 'AI Qualified', count: leads.filter(l => l.status === 'qualified').length, fill: '#06B6D4' },
    { stage: 'Assigned', count: leads.filter(l => l.status === 'assigned').length, fill: '#F59E0B' },
    { stage: 'Unassigned', count: leads.filter(l => l.status === 'unassigned').length, fill: '#8B5CF6' },
    { stage: 'Closed Won', count: leads.filter(l => l.status === 'converted').length, fill: '#00F59B' },
  ];

  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showLeadModal, setShowLeadModal] = useState(false);

  // Quick Schedule Form State
  const [meetingForm, setMeetingForm] = useState({
    title: 'Executive Villa Detailing Consultation',
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    employeeId: employees[0]?.id || 'emp-1',
    dateTime: new Date(Date.now() + 86400000).toISOString().slice(0, 16).replace('T', ' '),
    durationMinutes: 45,
    type: 'In-person Site Audit' as Meeting['type'],
    notes: 'Requested sanitization audit and high-end marble protection estimate.'
  });

  // Quick Lead Form State
  const [leadForm, setLeadForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: 'Bengaluru / Mumbai / Delhi NCR Metro',
    serviceId: '',
    serviceName: '',
    serviceInterest: '',
    servicePriceSnapshot: 349,
    estimatedValue: 349,
    assignedEmployeeId: employees[0]?.id || 'emp-1'
  });

  const totalLeads = leads.length;
  const newLeads = leads.filter(l => l.status === 'new').length;
  const activeCustomers = customers.length;
  const totalEmployees = employees.length;
  const meetingsToday = meetings.filter(m => m.status === 'scheduled').length;
  const completedBookings = bookings.filter(b => b.status === 'completed').length;
  const grossRevenue = bookings.reduce((sum, b) => sum + (b.paymentStatus === 'paid' ? b.amount : 0), 0) + 382000;
  const avgConversionRate = employees.length > 0 ? (employees.reduce((sum, e) => sum + e.conversionRate, 0) / employees.length).toFixed(1) : '0.0';

  const handleApplyInsight = (ins: any) => {
    addTask({
      title: `AI Strategy: ${ins.title}`,
      customerName: 'Operations Command',
      priority: ins.impact === 'high' ? 'urgent' : 'medium',
      dueDate: 'Today, 6:00 PM'
    });
    showToast('AI Optimization Activated', `Queued CRM Action: ${ins.recommendedAction}`, 'success');
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetingForm.customerName.trim() || !meetingForm.title.trim()) {
      showToast('Validation Error', 'Customer Name and Meeting Title are required.', 'error');
      return;
    }

    const assignedEmp = employees.find(emp => emp.id === meetingForm.employeeId) || employees[0];

    // Schedules and automatically notifies the employee in real time!
    const success = await addMeeting({
      title: meetingForm.title,
      customerName: meetingForm.customerName,
      customerPhone: meetingForm.customerPhone || '+1 (555) 234-8901',
      customerEmail: meetingForm.customerEmail || 'client@example.com',
      employeeId: assignedEmp?.id || 'emp-1',
      employeeName: assignedEmp?.name || 'Marcus Vance',
      dateTime: meetingForm.dateTime,
      durationMinutes: Number(meetingForm.durationMinutes) || 45,
      type: meetingForm.type,
      notes: meetingForm.notes,
      status: 'scheduled'
    });

    if (success) {
      setShowScheduleModal(false);
      setMeetingForm({
        title: 'Executive Villa Detailing Consultation',
        customerName: '',
        customerPhone: '',
        customerEmail: '',
        employeeId: employees[0]?.id || 'emp-1',
        dateTime: new Date(Date.now() + 86400000).toISOString().slice(0, 16).replace('T', ' '),
        durationMinutes: 45,
        type: 'In-person Site Audit',
        notes: ''
      });
    }
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadForm.name || !leadForm.phone) {
      showToast('Validation Error', 'Name and Phone are required.', 'error');
      return;
    }

    const assignedEmp = employees.find(
      emp => emp.id === leadForm.assignedEmployeeId ||
             (emp as any).employeeId === leadForm.assignedEmployeeId ||
             (emp as any)._id === leadForm.assignedEmployeeId
    );

    const empIdToAssign = assignedEmp ? (assignedEmp.id || (assignedEmp as any).employeeId || (assignedEmp as any)._id) : (leadForm.assignedEmployeeId || undefined);

    const success = await addLead({
      name: leadForm.name,
      phone: leadForm.phone,
      email: leadForm.email || `${leadForm.name.toLowerCase().replace(/\s+/g, '.')}@client.com`,
      address: leadForm.address,
      serviceId: leadForm.serviceId,
      serviceName: leadForm.serviceName || leadForm.serviceInterest || 'Ultra Deep Villa Sanitization',
      serviceInterest: leadForm.serviceInterest || leadForm.serviceName || 'Ultra Deep Villa Sanitization',
      servicePriceSnapshot: leadForm.servicePriceSnapshot,
      source: 'Website Form',
      priority: 'urgent',
      estimatedValue: Number(leadForm.estimatedValue) || 350,
      assignedEmployeeId: empIdToAssign,
      assignedEmployeeName: assignedEmp?.name,
      status: empIdToAssign ? 'assigned' : 'new'
    });

    if (success) {
      setShowLeadModal(false);
      setLeadForm({
        name: '',
        phone: '',
        email: '',
        address: 'Bengaluru / Mumbai / Delhi NCR Metro',
        serviceId: '',
        serviceName: '',
        serviceInterest: '',
        servicePriceSnapshot: 349,
        estimatedValue: 349,
        assignedEmployeeId: employees[0]?.id || 'emp-1'
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Executive Header with Action Bar */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              SYSTEM LIVE • REAL-TIME DISPATCH ACTIVE
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Executive Command & Intelligence
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time pipeline monitoring, automated employee dispatch, and AI voice operations.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center flex-wrap gap-2.5">
          <button
            onClick={() => setShowScheduleModal(true)}
            className="px-4 py-2.5 rounded-xl bg-electric-500 hover:bg-electric-400 text-navy-950 font-black text-xs transition-all shadow-glow hover:shadow-glow-lg flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule & Assign</span>
          </button>

          <button
            onClick={() => {
              if ((!leadForm.assignedEmployeeId || !employees.some(e => e.id === leadForm.assignedEmployeeId)) && employees.length > 0) {
                setLeadForm(prev => ({ ...prev, assignedEmployeeId: employees[0].id }));
              }
              setShowLeadModal(true);
            }}
            className="px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 dark:hover:bg-navy-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors flex items-center gap-1.5 border border-slate-200 dark:border-navy-750"
          >
            <UserCheck className="w-4 h-4 text-blue-500" />
            <span>Quick Lead</span>
          </button>

          <Link
            to="/admin/ai-calling"
            className="px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 dark:hover:bg-navy-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors flex items-center gap-1.5 border border-slate-200 dark:border-navy-750"
          >
            <PhoneCall className="w-4 h-4 text-electric-500" />
            <span>AI Voice Calls</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Leads */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm hover:border-electric-500/40 transition-all">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">Total Pipeline Leads</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {totalLeads}
            </span>
            <span className="text-xs font-mono text-electric-500 font-bold flex items-center">
              +{newLeads} new <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-medium">Propensity score avg: 86%</p>
        </div>

        {/* Revenue */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm hover:border-electric-500/40 transition-all">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">Gross Closed Revenue</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <span className="text-base font-black">₹</span>
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              ₹{grossRevenue.toLocaleString('en-IN')}
            </span>
            <span className="text-xs font-mono text-emerald-500 font-bold flex items-center">
              +18.4% MoM <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-medium">Target: ₹4,50,000 (84.8% reached)</p>
        </div>

        {/* Conversion Rate */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm hover:border-electric-500/40 transition-all">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">Lead Conversion Rate</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {avgConversionRate}%
            </span>
            <span className="text-xs font-mono text-electric-500 font-bold flex items-center">
              +4.2% AI lift <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-medium">Industry average: 22.0%</p>
        </div>

        {/* Active Consultations */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm hover:border-electric-500/40 transition-all">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">Consultations & Jobs</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {meetingsToday} today
            </span>
            <span className="text-xs font-mono text-cyan-500 font-bold">
              {completedBookings} jobs completed
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-medium">4 Certified technicians deployed</p>
        </div>
      </div>

      {/* Home Services Operations KPI Metrics */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white uppercase font-mono tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-electric-400" />
              Home Services Operations Command Center
            </h3>
            <p className="text-xs text-slate-400">Live operational database records across catalog, dispatch, and revenue</p>
          </div>
          <Link to="/admin/bookings" className="text-xs text-electric-400 font-bold hover:underline">
            Manage Bookings →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Customers</span>
            <span className="text-lg font-black text-slate-900 dark:text-white">{customers.length || 24}</span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Providers</span>
            <span className="text-lg font-black text-electric-400">{providers.length}</span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Services</span>
            <span className="text-lg font-black text-cyan-400">{services.length}</span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Total Bookings</span>
            <span className="text-lg font-black text-slate-900 dark:text-white">{bookings.length}</span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-center">
            <span className="text-[10px] text-amber-400 uppercase font-mono block">Pending</span>
            <span className="text-lg font-black text-amber-400">{bookings.filter(b => b.status === 'pending' || b.status === 'confirmed').length}</span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-center">
            <span className="text-[10px] text-emerald-400 uppercase font-mono block">Completed</span>
            <span className="text-lg font-black text-emerald-400">{bookings.filter(b => b.status === 'completed' || b.status === 'paid').length}</span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-center">
            <span className="text-[10px] text-rose-400 uppercase font-mono block">Cancelled</span>
            <span className="text-lg font-black text-rose-400">{bookings.filter(b => b.status === 'cancelled' || b.status === 'rejected').length}</span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Total Revenue</span>
            <span className="text-sm font-black text-electric-400 font-mono">₹{(grossRevenue).toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* Real-Time Live Schedule & Dispatch Tracker */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-electric-500/15 text-electric-600 dark:text-electric-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Real-Time Consultation Schedule & Employee Dispatch</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-electric-500/20 text-electric-600 dark:text-electric-400 font-bold">
                  LIVE SYNC
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Appointments scheduled here are instantly synchronized and notified to the assigned employee.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowScheduleModal(true)}
              className="px-3 py-1.5 rounded-xl bg-electric-500/15 hover:bg-electric-500/25 text-electric-600 dark:text-electric-400 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Schedule New</span>
            </button>
            <Link
              to="/admin/meetings"
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-navy-800 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Full Calendar &rarr;
            </Link>
          </div>
        </div>

        {/* Schedule List */}
        <div className="divide-y divide-slate-100 dark:divide-navy-800">
          {meetings.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No consultations scheduled yet. Click "+ Schedule & Assign" to dispatch.
            </div>
          ) : (
            meetings.slice(0, 5).map(m => (
              <div
                key={m.id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group hover:bg-slate-50/70 dark:hover:bg-navy-850/50 px-2 rounded-xl transition-colors"
              >
                <div className="flex items-start sm:items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-navy-800 border border-slate-200 dark:border-navy-750 flex flex-col items-center justify-center flex-shrink-0 text-slate-800 dark:text-white font-mono text-xs">
                    {m.type === 'In-person Site Audit' ? (
                      <MapPin className="w-4 h-4 text-amber-500" />
                    ) : m.type === 'Virtual Video' ? (
                      <Video className="w-4 h-4 text-electric-500" />
                    ) : (
                      <PhoneCall className="w-4 h-4 text-blue-500" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                        {m.customerName}
                      </h3>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300 font-mono">
                        {m.dateTime}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {m.title} • {m.type} ({m.durationMinutes} mins)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  {/* Assigned Employee Tag */}
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-semibold">
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Assigned: {m.employeeName}</span>
                  </div>

                  <span className={`text-[10px] font-mono uppercase px-2.5 py-1 rounded-full font-bold ${
                    m.status === 'completed'
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                      : m.status === 'in_progress'
                      ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                      : 'bg-electric-500/15 text-electric-600 dark:text-electric-400'
                  }`}>
                    {m.status}
                  </span>

                  {m.meetingLink && (
                    <a
                      href={m.meetingLink}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-navy-750 text-slate-500 hover:text-electric-500 transition-colors"
                      title="Launch Consultation Room"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trends */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Revenue & Bookings Trajectory</h3>
              <p className="text-xs text-slate-400">Monthly actual vs target revenue with booking volume (in ₹)</p>
            </div>
            <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-navy-800 text-electric-400 border border-electric-500/30">
              FY 2026 Live
            </span>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00F59B" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#00F59B" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" opacity={0.3} />
                <XAxis dataKey="month" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} tickFormatter={val => `₹${val / 1000}k`} />
                <Tooltip
                  formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Amount']}
                  contentStyle={{
                    backgroundColor: '#0A1128',
                    borderColor: '#1D2E62',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="revenue" name="Actual Revenue (₹)" stroke="#00F59B" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRev)" />
                <Area type="monotone" dataKey="target" name="Target (₹)" stroke="#3B82F6" strokeWidth={2} strokeDasharray="4 4" fillOpacity={1} fill="url(#colorTarget)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sales Pipeline Funnel */}
        <div className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Active Pipeline Stages</h3>
                <p className="text-xs text-slate-400">Current deal distribution</p>
              </div>
              <Link to="/admin/leads" className="text-xs text-electric-400 hover:underline">
                View All
              </Link>
            </div>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pipelineData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" opacity={0.3} />
                  <XAxis type="number" stroke="#64748B" fontSize={10} />
                  <YAxis dataKey="stage" type="category" stroke="#64748B" fontSize={10} width={80} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0A1128',
                      borderColor: '#1D2E62',
                      borderRadius: '0.75rem',
                      color: '#fff',
                      fontSize: '11px'
                    }}
                  />
                  <Bar dataKey="count" name="Deals" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="pt-3 border-t border-slate-100 dark:border-navy-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">Velocity: 4.2 days / stage</span>
            <span className="font-mono text-electric-500 font-bold">₹1,84,500 In Funnel</span>
          </div>
        </div>
      </div>

      {/* AI Business Insights & Employee Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Business Insights Feed */}
        <div className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-electric-500/10 text-electric-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">AI-Generated Business Insights</h3>
                <p className="text-xs text-slate-400">Predictive intelligence & business growth indicators</p>
              </div>
            </div>
            <Link to="/admin/ai-intelligence" className="text-xs font-semibold text-electric-400 hover:underline">
              AI Command Center →
            </Link>
          </div>

          <div className="space-y-3">
            {insights.map(ins => (
              <div
                key={ins.id}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-navy-800 bg-slate-50 dark:bg-navy-850 hover:border-electric-500/40 transition-all"
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                      ins.impact === 'high' ? 'bg-rose-500/15 text-rose-400' : 'bg-amber-500/15 text-amber-400'
                    }`}>
                      {ins.impact} Impact
                    </span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{ins.title}</span>
                  </div>
                  <span className="text-[10px] font-mono text-electric-400">{ins.confidenceScore}% confidence</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-2">
                  {ins.description}
                </p>
                <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-navy-800/80">
                  <span className="text-[11px] font-mono text-slate-400">
                    Action: {ins.recommendedAction}
                  </span>
                  <button
                    onClick={() => handleApplyInsight(ins)}
                    className="px-2.5 py-1 rounded-lg bg-electric-500/20 hover:bg-electric-500/30 text-electric-400 text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    Apply <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Employee Performance Leaderboard */}
        <div className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
                <Briefcase className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Sales Team Performance</h3>
                <p className="text-xs text-slate-400">Revenue target achievement and conversion rates</p>
              </div>
            </div>
            <Link to="/admin/sales" className="text-xs font-semibold text-electric-400 hover:underline">
              Team Roster →
            </Link>
          </div>

          <div className="space-y-3.5">
            {employees.map(emp => {
              const pct = Math.min(100, Math.round((emp.achievedRevenue / emp.targetRevenue) * 100));
              return (
                <div key={emp.id} className="p-3.5 rounded-xl border border-slate-200 dark:border-navy-800 bg-slate-50 dark:bg-navy-850">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <img src={emp.avatar} alt={emp.name} className="w-9 h-9 rounded-xl object-cover border border-slate-300 dark:border-navy-700" />
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">{emp.name}</h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">{emp.role} • {emp.team}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold font-mono text-slate-900 dark:text-white">
                        ₹{(emp.achievedRevenue * 10).toLocaleString('en-IN')}
                      </span>
                      <p className="text-[10px] text-slate-400">of ₹{(emp.targetRevenue * 10).toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-navy-750 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-electric-500 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-2 font-mono">
                    <span>{pct}% target met</span>
                    <span className="text-electric-500 font-bold">{emp.conversionRate}% conversion</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modal: Quick Schedule & Assign Meeting */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/75 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-750 p-6 sm:p-7 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-navy-800 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-electric-500/15 text-electric-600 dark:text-electric-400">
                  <CalendarCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    Schedule & Assign Consultation
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Direct real-time delegation to designated sales representative.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                  Customer Client Name *
                </label>
                <input
                  type="text"
                  required
                  value={meetingForm.customerName}
                  onChange={e => setMeetingForm({ ...meetingForm, customerName: e.target.value })}
                  placeholder="e.g. Dr. Raymond Thornton"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-slate-900 dark:text-white focus:outline-none focus:border-electric-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={meetingForm.customerPhone}
                    onChange={e => setMeetingForm({ ...meetingForm, customerPhone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                    Customer Email
                  </label>
                  <input
                    type="email"
                    value={meetingForm.customerEmail}
                    onChange={e => setMeetingForm({ ...meetingForm, customerEmail: e.target.value })}
                    placeholder="client@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                  Assign to Employee / Sales Specialist *
                </label>
                <select
                  value={meetingForm.employeeId}
                  onChange={e => setMeetingForm({ ...meetingForm, employeeId: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-slate-900 dark:text-white font-medium"
                >
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.role})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400 mt-1">
                  Employee will immediately receive a real-time notification and see this in their dashboard.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                    Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={meetingForm.dateTime.replace(' ', 'T')}
                    onChange={e => setMeetingForm({ ...meetingForm, dateTime: e.target.value.replace('T', ' ') })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                    Consultation Type
                  </label>
                  <select
                    value={meetingForm.type}
                    onChange={e => setMeetingForm({ ...meetingForm, type: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-slate-900 dark:text-white"
                  >
                    <option value="In-person Site Audit">In-person Site Audit</option>
                    <option value="Virtual Video">Virtual Video Consultation</option>
                    <option value="Phone Consultation">Phone Consultation</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                  Scope & Instruction Notes
                </label>
                <textarea
                  rows={2}
                  value={meetingForm.notes}
                  onChange={e => setMeetingForm({ ...meetingForm, notes: e.target.value })}
                  placeholder="e.g. 5,500 sqft penthouse move-in deep detailing requirement."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-navy-800">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-navy-750 text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-100 dark:hover:bg-navy-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-electric-500 hover:bg-electric-400 text-navy-950 font-bold transition-all shadow-glow flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Dispatch & Notify Employee</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Quick Lead Intake */}
      {showLeadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/75 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-750 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-navy-800 mb-4">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-blue-500" />
                <span>Intake New Pipeline Lead</span>
              </h3>
              <button onClick={() => setShowLeadModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleLeadSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                  Lead Name *
                </label>
                <input
                  type="text"
                  required
                  value={leadForm.name}
                  onChange={e => setLeadForm({ ...leadForm, name: e.target.value })}
                  placeholder="e.g. Katherine Pierce"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={leadForm.phone}
                  onChange={e => setLeadForm({ ...leadForm, phone: e.target.value })}
                  placeholder="+1 (555) 987-6543"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                  Service Package (Active Services)
                </label>
                <select
                  value={leadForm.serviceId || leadForm.serviceName}
                  onChange={e => {
                    const sId = e.target.value;
                    const selected = activeServices.find(s => s.id === sId);
                    if (selected) {
                      setLeadForm({
                        ...leadForm,
                        serviceId: selected.id,
                        serviceName: selected.name,
                        serviceInterest: selected.name,
                        servicePriceSnapshot: selected.price,
                        estimatedValue: selected.price
                      });
                    } else {
                      setLeadForm({
                        ...leadForm,
                        serviceId: '',
                        serviceName: sId,
                        serviceInterest: sId
                      });
                    }
                  }}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-slate-900 dark:text-white"
                >
                  <option value="">Select an active service...</option>
                  {activeServices.map(srv => (
                    <option key={srv.id} value={srv.id}>
                      {srv.name} — ₹{srv.price} ({srv.duration})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                  Assign Sales Representative *
                </label>
                <select
                  value={leadForm.assignedEmployeeId}
                  onChange={e => setLeadForm({ ...leadForm, assignedEmployeeId: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-slate-900 dark:text-white"
                >
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.team})
                    </option>
                  ))}
                  <option value="">Leave Unassigned (Admin Queue)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-navy-800">
                <button
                  type="button"
                  onClick={() => setShowLeadModal(false)}
                  className="px-3 py-2 rounded-xl border border-slate-200 dark:border-navy-750 text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-electric-500 hover:bg-electric-400 text-navy-950 font-bold transition-all shadow-glow"
                >
                  Save Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
