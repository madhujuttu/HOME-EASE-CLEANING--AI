import React, { useState, useMemo, useEffect } from 'react';
import { useCrm } from '../../context/CrmContext';
import {
  UserCheck,
  Calendar,
  Clock,
  PhoneCall,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  Plus,
  Phone,
  Video,
  MessageSquare,
  Sparkles,
  ChevronRight,
  ArrowUpRight,
  CheckSquare,
  X,
  ExternalLink,
  MapPin,
  CalendarCheck,
  ShieldAlert,
  Flame,
  Zap,
  Filter
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const SalesDashboard: React.FC = () => {
  const {
    currentUser,
    leads,
    meetings,
    bookings,
    employees,
    tasks,
    followUps,
    showToast,
    addMeeting,
    updateMeeting,
    updateLead,
    completeFollowUp
  } = useCrm();

  const navigate = useNavigate();

  const matchingEmp = employees.find(e =>
    e.id === currentUser.id ||
    e.email?.toLowerCase() === currentUser.email?.toLowerCase() ||
    (currentUser.name && e.name?.toLowerCase().trim() === currentUser.name.toLowerCase().trim())
  );

  // Filter items specifically for the active sales representative (authenticated employee session)
  const myLeads = leads.filter(l =>
    Boolean(l.assignedEmployeeId) &&
    (
      l.assignedEmployeeId === currentUser.id ||
      l.assignedEmployeeId === (currentUser as any).employeeId ||
      l.assignedEmployeeId === 'emp-1' ||
      (currentUser.name && l.assignedEmployeeName && l.assignedEmployeeName.toLowerCase().trim() === currentUser.name.toLowerCase().trim()) ||
      (matchingEmp && (l.assignedEmployeeId === matchingEmp.id || l.assignedEmployeeId === (matchingEmp as any)._id))
    )
  );
  const myNewLeads = myLeads.filter(l => l.status === 'new' || l.status === 'assigned');

  // Dynamic real-time assigned meetings & service bookings
  const myMeetings = meetings.filter(m => {
    if (!m.employeeId && !m.employeeName) return true;
    const empId = String(m.employeeId);
    if (empId === currentUser.id || empId === (currentUser as any).employeeId || empId === 'emp-1') return true;
    if (currentUser.name && m.employeeName && m.employeeName.toLowerCase().trim() === currentUser.name.toLowerCase().trim()) return true;
    if (matchingEmp) {
      if (empId === matchingEmp.id || empId === (matchingEmp as any)._id || empId === (matchingEmp as any).employeeId) return true;
      if (m.employeeName && matchingEmp.name && m.employeeName.toLowerCase().trim() === matchingEmp.name.toLowerCase().trim()) return true;
    }
    return false;
  });

  const allAppointments = useMemo(() => {
    const list: Array<{
      id: string;
      kind: 'meeting' | 'booking';
      title: string;
      customerName: string;
      customerPhone?: string;
      customerEmail?: string;
      dateTime: string;
      status: string;
      type: string;
      notes?: string;
      meetingLink?: string;
    }> = [];

    myMeetings.forEach(m => {
      list.push({
        id: m.id,
        kind: 'meeting',
        title: m.title,
        customerName: m.customerName,
        customerPhone: m.customerPhone,
        customerEmail: m.customerEmail,
        dateTime: m.dateTime,
        status: m.status,
        type: m.type,
        notes: m.notes,
        meetingLink: m.meetingLink
      });
    });

    bookings.forEach(b => {
      list.push({
        id: b.id,
        kind: 'booking',
        title: `Service Booking: ${b.serviceName}`,
        customerName: b.customerName,
        customerPhone: b.customerPhone,
        customerEmail: '',
        dateTime: b.dateTime,
        status: b.status === 'completed' ? 'completed' : 'scheduled',
        type: 'Service Dispatch',
        notes: b.notes
      });
    });

    return list.sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
  }, [myMeetings, bookings]);

  // Filter follow-ups assigned to the current employee
  const myFollowUps = useMemo(() => {
    return (followUps || []).filter(f => {
      if (!f.employeeId && !f.employeeName) return true;
      const empId = String(f.employeeId);
      if (empId === currentUser.id || empId === (currentUser as any).employeeId || empId === 'emp-1') return true;
      if (currentUser.name && f.employeeName && f.employeeName.toLowerCase().trim() === currentUser.name.toLowerCase().trim()) return true;
      if (matchingEmp) {
        if (empId === matchingEmp.id || empId === (matchingEmp as any)._id || empId === (matchingEmp as any).employeeId) return true;
        if (f.employeeName && matchingEmp.name && f.employeeName.toLowerCase().trim() === matchingEmp.name.toLowerCase().trim()) return true;
      }
      return false;
    });
  }, [followUps, currentUser, matchingEmp]);

  // Unified priority-sorted schedules for Today and Tomorrow (Popup Modal Data)
  const schedulePopupItems = useMemo(() => {
    const list: Array<{
      id: string;
      kind: 'meeting' | 'booking' | 'followup';
      title: string;
      customerName: string;
      customerPhone?: string;
      customerEmail?: string;
      customerAddress?: string;
      dateTime: string;
      timeDisplay: string;
      dayCategory: 'today' | 'tomorrow' | 'other';
      priority: 'urgent' | 'high' | 'medium' | 'low';
      priorityRank: number;
      status: string;
      type: string;
      notes?: string;
      meetingLink?: string;
      leadId?: string;
    }> = [];

    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    const tomDate = new Date(now);
    tomDate.setDate(tomDate.getDate() + 1);
    const tomStr = `${tomDate.getFullYear()}-${pad(tomDate.getMonth() + 1)}-${pad(tomDate.getDate())}`;

    const getDayCategory = (dt: string): 'today' | 'tomorrow' | 'other' => {
      if (!dt) return 'other';
      const clean = dt.trim().replace('T', ' ');
      if (clean.startsWith(todayStr) || clean.toLowerCase().includes('today')) return 'today';
      if (clean.startsWith(tomStr) || clean.toLowerCase().includes('tomorrow')) return 'tomorrow';
      try {
        const d = new Date(dt);
        if (!isNaN(d.getTime())) {
          const ds = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
          if (ds === todayStr) return 'today';
          if (ds === tomStr) return 'tomorrow';
        }
      } catch {}
      return 'other';
    };

    const formatTimeDisplay = (dt: string, dayCat: 'today' | 'tomorrow' | 'other'): string => {
      if (!dt) return 'Scheduled Time TBA';
      try {
        const d = new Date(dt);
        if (!isNaN(d.getTime())) {
          const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          if (dayCat === 'today') return `Today at ${time}`;
          if (dayCat === 'tomorrow') return `Tomorrow at ${time}`;
          return `${d.toLocaleDateString([], { month: 'short', day: 'numeric' })} at ${time}`;
        }
      } catch {}
      return dt;
    };

    // 1. Meetings
    myMeetings.forEach(m => {
      const dayCat = getDayCategory(m.dateTime);
      let prio: 'urgent' | 'high' | 'medium' | 'low' = 'medium';
      const linkedLead = m.leadId ? leads.find(l => l.id === m.leadId) : undefined;
      if (linkedLead?.priority) {
        prio = linkedLead.priority;
      } else if (
        m.title.toLowerCase().includes('emergency') ||
        m.notes?.toLowerCase().includes('urgent') ||
        m.notes?.toLowerCase().includes('asap')
      ) {
        prio = 'urgent';
      } else if (m.type === 'In-person Site Audit' || m.type === 'Virtual Video') {
        prio = 'high';
      }

      const rank = prio === 'urgent' ? 1 : prio === 'high' ? 2 : prio === 'medium' ? 3 : 4;

      list.push({
        id: m.id,
        kind: 'meeting',
        title: m.title || `Client Consultation: ${m.customerName}`,
        customerName: m.customerName,
        customerPhone: m.customerPhone,
        customerEmail: m.customerEmail,
        dateTime: m.dateTime,
        timeDisplay: formatTimeDisplay(m.dateTime, dayCat),
        dayCategory: dayCat,
        priority: prio,
        priorityRank: rank,
        status: m.status || 'scheduled',
        type: m.type || 'Consultation',
        notes: m.notes,
        meetingLink: m.meetingLink,
        leadId: m.leadId
      });
    });

    // 2. Bookings
    bookings.forEach(b => {
      const dayCat = getDayCategory(b.dateTime);
      let prio: 'urgent' | 'high' | 'medium' | 'low' = 'medium';
      if (b.notes?.toLowerCase().includes('urgent') || b.notes?.toLowerCase().includes('emergency')) {
        prio = 'urgent';
      } else if (b.amount >= 500 || b.serviceCategory?.toLowerCase().includes('ac') || b.serviceCategory?.toLowerCase().includes('cleaning')) {
        prio = 'high';
      }

      const rank = prio === 'urgent' ? 1 : prio === 'high' ? 2 : prio === 'medium' ? 3 : 4;

      list.push({
        id: b.id,
        kind: 'booking',
        title: `Service Booking: ${b.serviceName || b.subserviceName}`,
        customerName: b.customerName,
        customerPhone: b.customerPhone,
        customerEmail: (b as any).customerEmail || '',
        customerAddress: b.customerAddress,
        dateTime: b.dateTime,
        timeDisplay: formatTimeDisplay(b.dateTime, dayCat),
        dayCategory: dayCat,
        priority: prio,
        priorityRank: rank,
        status: b.status || 'confirmed',
        type: b.subserviceName || b.serviceName || 'Service Dispatch',
        notes: b.notes ? `${b.notes}${b.timeSlot ? ` • ${b.timeSlot}` : ''}` : b.timeSlot
      });
    });

    // 3. Follow-Ups
    myFollowUps.forEach(f => {
      const dayCat = getDayCategory(f.scheduledDateTime);
      const prio: 'urgent' | 'high' | 'medium' | 'low' = (f.priority as any) || 'medium';
      const rank = prio === 'urgent' ? 1 : prio === 'high' ? 2 : prio === 'medium' ? 3 : 4;

      list.push({
        id: f.id,
        kind: 'followup',
        title: `Follow-Up ${f.type.toUpperCase()}: ${f.purpose || 'Client Touchpoint'}`,
        customerName: f.customerName,
        customerPhone: f.customerPhone,
        customerEmail: f.customerEmail,
        dateTime: f.scheduledDateTime,
        timeDisplay: formatTimeDisplay(f.scheduledDateTime, dayCat),
        dayCategory: dayCat,
        priority: prio,
        priorityRank: rank,
        status: f.status || 'pending',
        type: `Follow-Up (${f.type})`,
        notes: f.notes || f.purpose,
        leadId: f.leadId
      });
    });

    // 4. Leads with upcoming nextFollowUp not covered in followUps
    myLeads.forEach(l => {
      if (l.nextFollowUp && !myFollowUps.some(f => f.leadId === l.id)) {
        const dayCat = getDayCategory(l.nextFollowUp);
        if (dayCat === 'today' || dayCat === 'tomorrow') {
          const prio: 'urgent' | 'high' | 'medium' | 'low' = l.priority || 'medium';
          const rank = prio === 'urgent' ? 1 : prio === 'high' ? 2 : prio === 'medium' ? 3 : 4;
          list.push({
            id: `lead-fu-${l.id}`,
            kind: 'followup',
            title: `Lead Touchpoint: ${l.name}`,
            customerName: l.name,
            customerPhone: l.phone,
            customerEmail: l.email,
            customerAddress: l.address,
            dateTime: l.nextFollowUp,
            timeDisplay: formatTimeDisplay(l.nextFollowUp, dayCat),
            dayCategory: dayCat,
            priority: prio,
            priorityRank: rank,
            status: l.status,
            type: l.serviceInterest || 'Home Service Consultation',
            notes: l.notes || `Preferred timeline: ${l.preferredTimeline || 'Immediate'}`,
            leadId: l.id
          });
        }
      }
    });

    // Only active today & tomorrow schedules that are not finished
    const targetItems = list.filter(item =>
      (item.dayCategory === 'today' || item.dayCategory === 'tomorrow') &&
      item.status !== 'completed' &&
      item.status !== 'cancelled'
    );

    // Primary sort: Priority (urgent=1 -> high=2 -> medium=3 -> low=4)
    // Secondary sort: Scheduled time chronological
    return targetItems.sort((a, b) => {
      if (a.priorityRank !== b.priorityRank) {
        return a.priorityRank - b.priorityRank;
      }
      return new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime();
    });
  }, [myMeetings, bookings, myFollowUps, myLeads, leads]);

  // Modal and Filtering state
  const [showScheduleModal, setShowScheduleModal] = useState<boolean>(true);
  const [scheduleTab, setScheduleTab] = useState<'today' | 'tomorrow' | 'all'>('today');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'urgent' | 'high'>('all');
  const [liveTime, setLiveTime] = useState<string>(() =>
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setLiveTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const todayCount = schedulePopupItems.filter(i => i.dayCategory === 'today').length;
  const tomorrowCount = schedulePopupItems.filter(i => i.dayCategory === 'tomorrow').length;
  const urgentCount = schedulePopupItems.filter(i => i.priority === 'urgent').length;
  const highCount = schedulePopupItems.filter(i => i.priority === 'high').length;

  const displayedScheduleItems = useMemo(() => {
    return schedulePopupItems.filter(item => {
      if (scheduleTab === 'today' && item.dayCategory !== 'today') return false;
      if (scheduleTab === 'tomorrow' && item.dayCategory !== 'tomorrow') return false;
      if (priorityFilter === 'urgent' && item.priority !== 'urgent') return false;
      if (priorityFilter === 'high' && item.priority !== 'urgent' && item.priority !== 'high') return false;
      return true;
    });
  }, [schedulePopupItems, scheduleTab, priorityFilter]);

  const myMeetingsToday = allAppointments.filter(m => m.status === 'scheduled');
  const myCompletedMeetings = allAppointments.filter(m => m.status === 'completed');
  const myConverted = myLeads.filter(l => l.status === 'converted');
  const myPendingTasks = tasks.filter(t => t.status === 'pending');

  const [quickNote, setQuickNote] = useState('');
  const [selectedLeadForNote, setSelectedLeadForNote] = useState(myLeads[0]?.id || '');
  const [showQuickNoteModal, setShowQuickNoteModal] = useState(false);

  const handleSaveQuickNote = () => {
    if (!selectedLeadForNote || !quickNote.trim()) return;
    const targetLead = leads.find(l => l.id === selectedLeadForNote);
    if (targetLead) {
      const newInt = {
        id: 'int-' + Math.random().toString(36).substring(2, 7),
        type: 'note' as const,
        date: new Date().toISOString().slice(0, 16).replace('T', ' '),
        agentName: currentUser.name || 'Marcus Vance',
        summary: quickNote,
        sentiment: 'positive' as const
      };
      updateLead(selectedLeadForNote, {
        interactionHistory: [newInt, ...(targetLead.interactionHistory || [])]
      });
      showToast('Field Note Saved', `Logged note for ${targetLead.name}.`, 'success');
    }
    setQuickNote('');
    setShowQuickNoteModal(false);
  };

  const handleCompleteMeeting = (id: string, customerName: string) => {
    updateMeeting(id, {
      status: 'completed',
      notes: 'Consultation concluded successfully. Follow-up proposal requested.'
    });
    showToast('Meeting Marked Completed', `Consultation with ${customerName} completed.`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Rep Profile & Real-Time Sync Indicator */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              REAL-TIME DISPATCH CONNECTED • QUEUE SYNCHRONIZED
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Field Sales Command & Action Queue
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Representative: <span className="font-bold text-slate-800 dark:text-white">{currentUser.name}</span> • North Metro Tier 1 • Real-time dispatch active
          </p>
        </div>

        {/* Quick Action Tools */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Priority Schedule Briefing Button */}
          <button
            onClick={() => setShowScheduleModal(true)}
            className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500/20 via-rose-500/20 to-electric-500/20 hover:from-amber-500/30 hover:to-electric-500/30 text-slate-900 dark:text-white font-bold text-xs border border-amber-500/40 shadow-sm transition-all flex items-center gap-2 cursor-pointer group"
            title="Open Today & Tomorrow Priority Schedule"
          >
            <CalendarCheck className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
            <span>Schedule Briefing</span>
            <span className="px-1.5 py-0.5 rounded-full bg-slate-900 dark:bg-navy-800 text-electric-400 font-mono text-[10px] font-black border border-electric-500/30">
              {schedulePopupItems.length}
            </span>
            {urgentCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white font-mono text-[9px] font-black animate-pulse">
                {urgentCount} URGENT
              </span>
            )}
          </button>

          <button
            onClick={() => navigate('/sales/leads?action=new')}
            className="px-3.5 py-2.5 rounded-xl bg-electric-500 hover:bg-electric-400 text-navy-950 font-bold text-xs shadow-glow transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Lead</span>
          </button>

          <button
            onClick={() => setShowQuickNoteModal(true)}
            className="px-3.5 py-2.5 rounded-xl bg-white dark:bg-navy-800 hover:bg-slate-50 dark:hover:bg-navy-750 text-slate-800 dark:text-white font-bold text-xs border border-slate-200 dark:border-navy-700 transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <MessageSquare className="w-4 h-4 text-electric-500" />
            <span>Log Client Note</span>
          </button>

          <button
            onClick={() => navigate('/sales/ai-calling')}
            className="px-4 py-2.5 rounded-xl bg-electric-500 hover:bg-electric-400 text-navy-950 font-black text-xs transition-all shadow-glow hover:shadow-glow-lg flex items-center gap-1.5 cursor-pointer"
          >
            <PhoneCall className="w-4 h-4" />
            <span>AI Voice Copilot</span>
          </button>

          <button
            onClick={() => navigate('/sales/copilot')}
            className="px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 dark:hover:bg-navy-750 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors flex items-center gap-1.5 border border-slate-200 dark:border-navy-700"
          >
            <Sparkles className="w-4 h-4 text-blue-500" />
            <span>Sales Copilot</span>
          </button>
        </div>
      </div>

      {/* Rep KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Assigned Leads */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm hover:border-electric-500/40 transition-all">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">My Active Leads</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {myLeads.length}
            </span>
            <span className="text-xs font-mono text-electric-500 font-bold">
              +{myNewLeads.length} new
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-medium">Ready for qualification</p>
        </div>

        {/* Assigned Consultations Today */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm hover:border-electric-500/40 transition-all">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">Consultations Today</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {myMeetingsToday.length}
            </span>
            <span className="text-xs font-mono text-cyan-500 font-bold">
              {myCompletedMeetings.length} completed
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-medium">Live agenda updated by HQ</p>
        </div>

        {/* Pending Follow-ups */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm hover:border-electric-500/40 transition-all">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">Pending Follow-ups</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-amber-500">
              {myPendingTasks.length}
            </span>
            <span className="text-xs font-mono text-rose-500 font-bold">1 urgent</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-medium">Due before 5:00 PM today</p>
        </div>

        {/* Closed Revenue */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm hover:border-electric-500/40 transition-all">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">Closed Revenue (MTD)</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <span className="text-base font-black">₹</span>
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              ₹3,82,000
            </span>
            <span className="text-xs font-mono text-emerald-500 font-bold flex items-center">
              +34.8% Conv <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-medium">Target: ₹4,50,000</p>
        </div>
      </div>

      {/* Real-Time Live Assigned Schedule & Engagements */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Today's Assigned Schedule & Action Queue</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-electric-500/20 text-electric-600 dark:text-electric-400 font-bold">
                  LIVE ASSIGNMENT
                </span>
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Consultations scheduled by Admin or Manager appear here immediately in real time.
            </p>
          </div>

          <Link
            to="/sales/meetings"
            className="text-xs font-bold text-electric-600 dark:text-electric-400 hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            <span>View All Consultations</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="space-y-3">
          {allAppointments.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs rounded-2xl bg-slate-50 dark:bg-navy-950">
              No consultations or booking appointments scheduled currently. New assignments from management will populate here live.
            </div>
          ) : (
            allAppointments.map(item => (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 ${
                  item.status === 'completed'
                    ? 'bg-slate-50/50 dark:bg-navy-950/40 border-slate-200 dark:border-navy-800/60 opacity-80'
                    : 'bg-white dark:bg-navy-850 border-slate-200 dark:border-navy-750 shadow-sm hover:border-electric-500/40'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className="p-3 rounded-xl bg-slate-100 dark:bg-navy-800 text-electric-500 font-mono font-bold text-xs flex flex-col items-center justify-center flex-shrink-0">
                    <Clock className="w-4 h-4 mb-1" />
                    <span>{item.dateTime.slice(11) || '10:00 AM'}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                        {item.customerName}
                      </h4>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                        item.status === 'completed'
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                          : 'bg-electric-500/15 text-electric-600 dark:text-electric-400'
                      }`}>
                        {item.status}
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300 font-mono">
                        {item.type}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {item.title} • {item.customerPhone} {item.customerEmail ? `• ${item.customerEmail}` : ''}
                    </p>
                    {item.notes && (
                      <p className="text-[11px] text-slate-400 italic mt-0.5">
                        Notes: {item.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Quick Action Buttons for the Assigned Representative */}
                <div className="flex items-center flex-wrap gap-2 self-end sm:self-auto">
                  <button
                    onClick={() => {
                      navigate('/sales/ai-calling');
                      showToast('Dialing Customer', `Connecting with ${item.customerName}...`, 'info');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-electric-500 hover:bg-electric-400 text-navy-950 font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Client</span>
                  </button>

                  {item.meetingLink && (
                    <a
                      href={item.meetingLink}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-navy-800 text-slate-800 dark:text-white font-semibold text-xs flex items-center gap-1.5 hover:bg-slate-200 dark:hover:bg-navy-700 transition-colors"
                    >
                      <Video className="w-3.5 h-3.5 text-blue-500" />
                      <span>Meet Room</span>
                    </a>
                  )}

                  {item.status !== 'completed' && (
                    <button
                      onClick={() => handleCompleteMeeting(item.id, item.customerName)}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-navy-750 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Done</span>
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Field Sales Quick Actions Dock */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
          <span>Field Specialist Action Hub</span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-navy-800 text-slate-500">
            Shortcuts
          </span>
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <button
            onClick={() => navigate('/sales/leads')}
            className="p-3.5 rounded-2xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-800 hover:border-electric-500/50 flex flex-col items-center text-center group transition-all"
          >
            <UserCheck className="w-5 h-5 text-electric-500 mb-2 group-hover:scale-110 transition-transform" />
            <span className="font-bold text-slate-900 dark:text-white">Review My Leads</span>
            <span className="text-[10px] text-slate-500 mt-0.5">{myLeads.length} assigned leads</span>
          </button>

          <button
            onClick={() => navigate('/sales/ai-calling')}
            className="p-3.5 rounded-2xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-800 hover:border-electric-500/50 flex flex-col items-center text-center group transition-all"
          >
            <PhoneCall className="w-5 h-5 text-blue-500 mb-2 group-hover:scale-110 transition-transform" />
            <span className="font-bold text-slate-900 dark:text-white">AI Voice Assistant</span>
            <span className="text-[10px] text-slate-500 mt-0.5">Automated inbound/outbound</span>
          </button>

          <button
            onClick={() => navigate('/sales/follow-ups')}
            className="p-3.5 rounded-2xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-800 hover:border-electric-500/50 flex flex-col items-center text-center group transition-all"
          >
            <Clock className="w-5 h-5 text-amber-500 mb-2 group-hover:scale-110 transition-transform" />
            <span className="font-bold text-slate-900 dark:text-white">Pending Follow-ups</span>
            <span className="text-[10px] text-slate-500 mt-0.5">{myPendingTasks.length} action items</span>
          </button>

          <button
            onClick={() => navigate('/sales/performance')}
            className="p-3.5 rounded-2xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-800 hover:border-electric-500/50 flex flex-col items-center text-center group transition-all"
          >
            <TrendingUp className="w-5 h-5 text-emerald-500 mb-2 group-hover:scale-110 transition-transform" />
            <span className="font-bold text-slate-900 dark:text-white">Performance Quota</span>
            <span className="text-[10px] text-slate-500 mt-0.5">₹3.82L achieved (84.8%)</span>
          </button>
        </div>
      </div>

      {/* Modal: Log Client Field Note */}
      {showQuickNoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/75 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-750 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-navy-800 mb-4">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-electric-500" />
                <span>Log Client Interaction Note</span>
              </h3>
              <button
                onClick={() => setShowQuickNoteModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                  Select Target Lead / Customer
                </label>
                <select
                  value={selectedLeadForNote}
                  onChange={e => setSelectedLeadForNote(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-slate-900 dark:text-white"
                >
                  {myLeads.map(l => (
                    <option key={l.id} value={l.id}>
                      {l.name} — {l.serviceInterest}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                  Interaction Summary & Field Notes
                </label>
                <textarea
                  rows={4}
                  value={quickNote}
                  onChange={e => setQuickNote(e.target.value)}
                  placeholder="Detail client feedback, budget expectations, property walkthrough measurements, or requested discounts..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-navy-800">
                <button
                  type="button"
                  onClick={() => setShowQuickNoteModal(false)}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-navy-750 text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveQuickNote}
                  className="px-4 py-2 rounded-xl bg-electric-500 hover:bg-electric-400 text-navy-950 font-bold transition-all shadow-glow"
                >
                  Save Note to CRM
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Re-Open Schedule Trigger Button */}
      {!showScheduleModal && (
        <button
          onClick={() => setShowScheduleModal(true)}
          className="fixed bottom-6 right-6 z-40 px-4 py-3 rounded-2xl bg-slate-900/90 dark:bg-navy-900/90 hover:bg-slate-900 dark:hover:bg-navy-850 text-white border-2 border-electric-500/50 shadow-2xl backdrop-blur-md flex items-center gap-3 transition-all hover:scale-105 cursor-pointer group"
          title="Open Today & Tomorrow Priority Schedule Briefing"
        >
          <div className="relative">
            <CalendarCheck className="w-5 h-5 text-electric-400 group-hover:rotate-6 transition-transform" />
            {urgentCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
            )}
          </div>
          <div className="text-left">
            <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Schedule Briefing</p>
            <p className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>Today & Tomorrow</span>
              <span className="px-1.5 py-0.2 rounded-full bg-electric-500 text-navy-950 text-[10px] font-black">
                {schedulePopupItems.length}
              </span>
            </p>
          </div>
        </button>
      )}

      {/* TODAY & TOMORROW SCHEDULE POP-UP MODAL (ORGANIZED BY PRIORITY) */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-white dark:bg-navy-950 border border-slate-200 dark:border-navy-750 shadow-2xl overflow-hidden transition-all">
            {/* Top glowing priority accent line */}
            <div className="h-1.5 w-full bg-gradient-to-r from-rose-500 via-amber-400 via-electric-500 to-emerald-400"></div>

            {/* Modal Header */}
            <div className="p-4 sm:p-6 pb-4 border-b border-slate-100 dark:border-navy-800 bg-slate-50/70 dark:bg-navy-900/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-electric-500/10 border border-electric-500/25 text-electric-600 dark:text-electric-400 text-[10px] font-mono font-bold uppercase tracking-wider">
                    <span className="w-2 h-2 rounded-full bg-electric-500 animate-pulse"></span>
                    PRIORITY ACTION BRIEFING • DISPATCH QUEUE
                  </span>
                  {urgentCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-[10px] font-mono font-black uppercase flex items-center gap-1 animate-pulse">
                      <Flame className="w-3 h-3" />
                      {urgentCount} URGENT
                    </span>
                  )}
                  {highCount > 0 && (
                    <span className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-[10px] font-mono font-bold uppercase">
                      <Zap className="w-3 h-3" />
                      {highCount} HIGH
                    </span>
                  )}
                </div>

                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Today & Tomorrow Schedule
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Assigned agenda for <span className="font-bold text-slate-800 dark:text-slate-200">{currentUser.name}</span> • Sorted by Priority & Scheduled Time
                </p>
              </div>

              {/* Right: Live Digital Clock & Close */}
              <div className="flex items-center gap-2.5 self-end sm:self-center">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-xs font-mono font-bold text-slate-700 dark:text-slate-300 shadow-xs">
                  <Clock className="w-3.5 h-3.5 text-electric-500" />
                  <span>{liveTime}</span>
                </div>

                <button
                  onClick={() => setShowScheduleModal(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-navy-800 transition-all cursor-pointer"
                  title="Acknowledge and Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Filter Tabs & Priority Slices */}
            <div className="px-4 sm:px-6 py-3 border-b border-slate-100 dark:border-navy-800 bg-white dark:bg-navy-950 flex flex-wrap items-center justify-between gap-3">
              {/* Day Category Tabs */}
              <div className="flex items-center gap-1 p-1 rounded-2xl bg-slate-100 dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-xs font-bold">
                <button
                  onClick={() => setScheduleTab('today')}
                  className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                    scheduleTab === 'today'
                      ? 'bg-white dark:bg-navy-800 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5 text-electric-500" />
                  <span>Today's Schedule</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-electric-500/20 text-electric-600 dark:text-electric-400 font-mono text-[10px]">
                    {todayCount}
                  </span>
                </button>

                <button
                  onClick={() => setScheduleTab('tomorrow')}
                  className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                    scheduleTab === 'tomorrow'
                      ? 'bg-white dark:bg-navy-800 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span>Tomorrow's Schedule</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 font-mono text-[10px]">
                    {tomorrowCount}
                  </span>
                </button>

                <button
                  onClick={() => setScheduleTab('all')}
                  className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                    scheduleTab === 'all'
                      ? 'bg-white dark:bg-navy-800 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span>All Next 48 Hours</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-navy-700 text-slate-700 dark:text-slate-300 font-mono text-[10px]">
                    {schedulePopupItems.length}
                  </span>
                </button>
              </div>

              {/* Priority Filter Selector */}
              <div className="flex items-center gap-1 text-xs">
                <span className="text-slate-400 text-[11px] font-semibold mr-1 flex items-center gap-1">
                  <Filter className="w-3 h-3" /> Priority:
                </span>
                {(['all', 'urgent', 'high'] as const).map(p => (
                  <button
                    key={p}
                    onClick={() => setPriorityFilter(p)}
                    className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-semibold transition-all cursor-pointer ${
                      priorityFilter === p
                        ? p === 'urgent'
                          ? 'bg-rose-500 text-white font-bold'
                          : p === 'high'
                          ? 'bg-amber-500 text-navy-950 font-bold'
                          : 'bg-slate-900 dark:bg-white text-white dark:text-navy-950 font-bold'
                        : 'bg-slate-100 dark:bg-navy-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-navy-800'
                    }`}
                  >
                    {p === 'all' ? 'All' : p === 'urgent' ? '🔥 Urgent Only' : '⚡ High & Urgent'}
                  </button>
                ))}
              </div>
            </div>

            {/* Scrollable Schedule Cards Body */}
            <div className="p-4 sm:p-6 overflow-y-auto max-h-[58vh] space-y-3.5 custom-scrollbar">
              {displayedScheduleItems.length === 0 ? (
                <div className="py-12 px-6 text-center rounded-2xl bg-slate-50 dark:bg-navy-900/50 border border-dashed border-slate-200 dark:border-navy-800">
                  <div className="w-12 h-12 rounded-2xl bg-electric-500/10 text-electric-500 flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                    No Pending Schedule Items for this Filter
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1">
                    {scheduleTab === 'today'
                      ? "No remaining appointments or tasks scheduled for today. Check tomorrow's schedule or log new customer leads!"
                      : scheduleTab === 'tomorrow'
                      ? "Your agenda for tomorrow is clear right now. Review incoming leads or queue proactive follow-ups."
                      : "All caught up! No pending urgent meetings or service bookings for the next 48 hours."}
                  </p>
                  <button
                    onClick={() => { setScheduleTab('all'); setPriorityFilter('all'); }}
                    className="mt-4 px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-navy-800 hover:bg-electric-500 hover:text-navy-950 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-all inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    Reset Filters & View All
                  </button>
                </div>
              ) : (
                displayedScheduleItems.map((item, idx) => {
                  const isUrgent = item.priority === 'urgent';
                  const isHigh = item.priority === 'high';
                  const isMedium = item.priority === 'medium';

                  return (
                    <div
                      key={item.id + idx}
                      className={`p-4 sm:p-5 rounded-2xl transition-all border ${
                        isUrgent
                          ? 'border-l-4 border-l-rose-500 border-rose-500/40 bg-gradient-to-r from-rose-500/10 via-rose-500/5 to-transparent shadow-[0_0_15px_rgba(244,63,94,0.1)]'
                          : isHigh
                          ? 'border-l-4 border-l-amber-500 border-amber-500/40 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent shadow-[0_0_15px_rgba(245,158,11,0.08)]'
                          : isMedium
                          ? 'border-l-4 border-l-blue-500 border-blue-500/30 bg-slate-50/80 dark:bg-navy-900/60 shadow-xs'
                          : 'border-l-4 border-l-slate-400 border-slate-200 dark:border-navy-800 bg-slate-50 dark:bg-navy-900/40'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                        <div className="space-y-2 flex-1">
                          {/* Badges Row */}
                          <div className="flex items-center flex-wrap gap-2">
                            {/* Priority Badge */}
                            {isUrgent ? (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black uppercase tracking-wider bg-rose-500 text-white shadow-glow-sm flex items-center gap-1 animate-pulse">
                                <Flame className="w-3 h-3" />
                                URGENT PRIORITY
                              </span>
                            ) : isHigh ? (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/40 flex items-center gap-1">
                                <Zap className="w-3 h-3" />
                                HIGH PRIORITY
                              </span>
                            ) : isMedium ? (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30">
                                MEDIUM PRIORITY
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-slate-200 dark:bg-navy-800 text-slate-600 dark:text-slate-400">
                                STANDARD
                              </span>
                            )}

                            {/* Scheduled Time Pill */}
                            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-white dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white font-mono text-xs font-black shadow-xs">
                              <Clock className={`w-3.5 h-3.5 ${isUrgent ? 'text-rose-500' : isHigh ? 'text-amber-500' : 'text-electric-500'}`} />
                              <span>{item.timeDisplay}</span>
                            </div>

                            {/* Kind & Category Badge */}
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono uppercase font-semibold bg-slate-200 dark:bg-navy-800 text-slate-600 dark:text-slate-300">
                              {item.kind === 'meeting' ? '📹 Consultation' : item.kind === 'booking' ? '🛠️ Service Dispatch' : '📞 Follow-Up'}
                            </span>

                            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-electric-500/10 text-electric-600 dark:text-electric-400 font-bold">
                              {item.type}
                            </span>
                          </div>

                          {/* Item Title & Customer Details */}
                          <div>
                            <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                              <span>{item.title}</span>
                              <span className="text-xs px-2 py-0.5 rounded-md font-mono font-normal bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-400">
                                Status: {item.status}
                              </span>
                            </h3>

                            <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-slate-300 mt-1">
                              <span className="font-semibold text-slate-900 dark:text-white">
                                Customer: {item.customerName}
                              </span>

                              {item.customerPhone && (
                                <a
                                  href={`tel:${item.customerPhone}`}
                                  className="text-electric-600 dark:text-electric-400 hover:underline flex items-center gap-1 font-mono font-semibold"
                                  title="Click to dial customer"
                                >
                                  <Phone className="w-3 h-3 text-emerald-500" />
                                  <span>{item.customerPhone}</span>
                                </a>
                              )}

                              {item.customerEmail && (
                                <span className="text-slate-400 font-mono text-[11px] truncate max-w-[200px]">
                                  {item.customerEmail}
                                </span>
                              )}

                              {item.customerAddress && (
                                <span className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                                  <MapPin className="w-3 h-3 text-rose-400" />
                                  <span>{item.customerAddress}</span>
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Notes / Purpose */}
                          {item.notes && (
                            <p className="text-xs text-slate-600 dark:text-slate-300 bg-white/70 dark:bg-navy-950/60 p-2.5 rounded-xl border border-slate-100 dark:border-navy-800 leading-relaxed font-sans">
                              <span className="font-bold text-slate-800 dark:text-white mr-1">Briefing Notes:</span>
                              {item.notes}
                            </p>
                          )}
                        </div>

                        {/* Action Buttons for Card */}
                        <div className="flex md:flex-col items-center md:items-end gap-2 flex-shrink-0 pt-2 md:pt-0">
                          {item.customerPhone && (
                            <a
                              href={`tel:${item.customerPhone}`}
                              className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-navy-950 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
                            >
                              <Phone className="w-3.5 h-3.5" />
                              <span>Call Client</span>
                            </a>
                          )}

                          {item.kind === 'meeting' && (
                            <>
                              <button
                                onClick={() => {
                                  setShowScheduleModal(false);
                                  if (item.meetingLink) {
                                    window.open(item.meetingLink, '_blank');
                                  } else {
                                    navigate('/sales/meetings');
                                  }
                                }}
                                className="px-3.5 py-1.5 rounded-xl bg-electric-500 hover:bg-electric-400 text-navy-950 font-bold text-xs flex items-center gap-1.5 shadow-glow transition-all cursor-pointer"
                              >
                                <Video className="w-3.5 h-3.5" />
                                <span>{item.meetingLink ? 'Join Video Call' : 'Open Consultation'}</span>
                              </button>

                              <button
                                onClick={() => handleCompleteMeeting(item.id, item.customerName)}
                                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-navy-800 hover:bg-emerald-500 hover:text-navy-950 text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center gap-1 transition-all cursor-pointer"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                <span>Mark Concluded</span>
                              </button>
                            </>
                          )}

                          {item.kind === 'followup' && (
                            <button
                              onClick={async () => {
                                await completeFollowUp(item.id, {
                                  outcome: 'completed',
                                  discussionSummary: 'Completed touchpoint directly from priority briefing schedule modal.'
                                });
                                showToast('Follow-Up Completed', `Concluded touchpoint with ${item.customerName}.`, 'success');
                              }}
                              className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-navy-950 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Conclude Follow-Up</span>
                            </button>
                          )}

                          {item.kind === 'booking' && (
                            <button
                              onClick={() => {
                                setShowScheduleModal(false);
                                navigate('/sales/meetings');
                              }}
                              className="px-3.5 py-1.5 rounded-xl bg-electric-500 hover:bg-electric-400 text-navy-950 font-bold text-xs flex items-center gap-1.5 shadow-glow transition-all cursor-pointer"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span>View Dispatch</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-navy-800 bg-slate-50/90 dark:bg-navy-900/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Active Shift: {schedulePopupItems.length} agenda items across Today & Tomorrow</span>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setShowScheduleModal(false);
                    navigate('/sales/meetings');
                  }}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-navy-750 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Full Calendar View</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-5 py-2 rounded-xl bg-electric-500 hover:bg-electric-400 text-navy-950 font-black text-xs transition-all shadow-glow hover:shadow-glow-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckSquare className="w-4 h-4" />
                  <span>Acknowledge & Enter Dashboard</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
