import React, { useState, useMemo } from 'react';
import { useCrm } from '../../context/CrmContext';
import { Meeting, MeetingStatus, FollowUp, FollowUpOutcome, FollowUpType, Booking } from '../../types';
import {
  Calendar as CalendarIcon,
  Clock,
  Video,
  MapPin,
  Phone,
  Plus,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  X,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  ExternalLink,
  Filter,
  CheckSquare,
  Search,
  MessageSquare,
  MessageCircle,
  Mail,
  CalendarCheck,
  CalendarDays,
  ListFilter,
  CheckCircle
} from 'lucide-react';

export const MeetingManagement: React.FC = () => {
  const {
    meetings,
    followUps,
    bookings,
    employees,
    leads,
    addMeeting,
    updateMeeting,
    completeMeeting,
    rescheduleMeeting,
    cancelMeeting,
    addFollowUp,
    completeFollowUp,
    rescheduleFollowUp,
    cancelFollowUp,
    updateBookingStatus,
    showToast
  } = useCrm();

  const [calendarView, setCalendarView] = useState<'monthly' | 'weekly' | 'daily' | 'agenda'>('weekly');
  const [activityTypeFilter, setActivityTypeFilter] = useState<'all' | 'meetings' | 'followups' | 'bookings'>('all');
  const [employeeFilter, setEmployeeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Selected Item for Preview Card & Lifecycle Modals
  const [previewEvent, setPreviewEvent] = useState<UnifiedEvent | null>(null);
  const [showCreateMeetingModal, setShowCreateMeetingModal] = useState(false);
  const [showCreateFollowUpModal, setShowCreateFollowUpModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  // Forms
  const [meetingFormData, setMeetingFormData] = useState({
    title: '',
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    employeeId: employees[0]?.id || 'emp-1',
    dateTime: new Date(Date.now() + 86400000).toISOString().slice(0, 16).replace('T', ' '),
    durationMinutes: 45,
    type: 'In-person Site Audit' as Meeting['type'],
    notes: ''
  });

  const [followUpFormData, setFollowUpFormData] = useState({
    leadId: '',
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    employeeId: employees[0]?.id || 'emp-1',
    type: 'call' as FollowUpType,
    scheduledDateTime: new Date(Date.now() + 86400000).toISOString().slice(0, 16).replace('T', ' '),
    priority: 'high' as 'urgent' | 'high' | 'medium' | 'low',
    purpose: '',
    notes: ''
  });

  const [completionForm, setCompletionForm] = useState({
    outcome: 'completed' as FollowUpOutcome | 'completed' | 'rescheduled' | 'cancelled' | 'no_show',
    discussionSummary: '',
    agreedActions: '',
    nextAction: '',
    scheduleNext: false,
    nextFollowUpDate: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 16).replace('T', ' ')
  });

  const [rescheduleData, setRescheduleData] = useState({
    dateTime: '',
    reason: ''
  });

  const [cancelReason, setCancelReason] = useState('');

  // Date Navigation State
  const [currentDate, setCurrentDate] = useState(new Date());

  // Unified Event Representation
  interface UnifiedEvent {
    id: string;
    kind: 'meeting' | 'followup' | 'booking';
    title: string;
    customerName: string;
    customerPhone?: string;
    customerEmail?: string;
    customerAddress?: string;
    employeeId?: string;
    employeeName?: string;
    dateTime: string;
    durationMinutes?: number;
    status: string;
    priority?: string;
    type?: string;
    notes?: string;
    purpose?: string;
    outcome?: string;
    rawMeeting?: Meeting;
    rawFollowUp?: FollowUp;
    rawBooking?: Booking;
  }

  // Unified Event List
  const unifiedEvents = useMemo(() => {
    const list: UnifiedEvent[] = [];

    // 1. Add Meetings
    if (activityTypeFilter === 'all' || activityTypeFilter === 'meetings') {
      meetings.forEach(m => {
        list.push({
          id: m.id,
          kind: 'meeting',
          title: m.title,
          customerName: m.customerName,
          customerPhone: m.customerPhone,
          customerEmail: m.customerEmail,
          employeeId: m.employeeId,
          employeeName: m.employeeName,
          dateTime: m.dateTime,
          durationMinutes: m.durationMinutes || 45,
          status: m.status,
          type: m.type,
          notes: m.notes,
          rawMeeting: m
        });
      });
    }

    // 2. Add Follow-Ups
    if (activityTypeFilter === 'all' || activityTypeFilter === 'followups') {
      followUps.forEach(f => {
        list.push({
          id: f.id,
          kind: 'followup',
          title: `Follow-Up: ${f.purpose}`,
          customerName: f.customerName,
          customerPhone: f.customerPhone,
          customerEmail: f.customerEmail,
          employeeId: f.employeeId,
          employeeName: f.employeeName,
          dateTime: f.scheduledDateTime,
          durationMinutes: 15,
          status: f.status,
          priority: f.priority,
          type: f.type,
          notes: f.notes,
          purpose: f.purpose,
          outcome: f.outcome,
          rawFollowUp: f
        });
      });
    }

    // 3. Add Service Bookings
    if (activityTypeFilter === 'all' || activityTypeFilter === 'bookings') {
      bookings.forEach(b => {
        list.push({
          id: b.id,
          kind: 'booking',
          title: `Service Booking: ${b.serviceName}`,
          customerName: b.customerName,
          customerPhone: b.customerPhone,
          customerAddress: b.customerAddress,
          dateTime: b.dateTime,
          durationMinutes: 90,
          status: b.status,
          type: 'Service Dispatch',
          notes: b.notes,
          rawBooking: b
        });
      });
    }

    // Filter by employee
    const empFiltered = list.filter(item => {
      if (employeeFilter === 'all') return true;
      if (!item.employeeId) return false;
      return item.employeeId === employeeFilter;
    });

    // Filter by status
    const statusFiltered = empFiltered.filter(item => {
      if (statusFilter === 'all') return true;
      if (statusFilter === 'scheduled') {
        return item.status === 'scheduled' || item.status === 'pending' || item.status === 'confirmed' || item.status === 'assigned';
      }
      return item.status === statusFilter;
    });

    // Filter by search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return statusFiltered.filter(i =>
        i.title.toLowerCase().includes(q) ||
        i.customerName.toLowerCase().includes(q) ||
        (i.employeeName && i.employeeName.toLowerCase().includes(q)) ||
        (i.customerPhone && i.customerPhone.includes(q))
      );
    }

    return statusFiltered.sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
  }, [meetings, followUps, bookings, activityTypeFilter, employeeFilter, statusFilter, searchQuery]);

  // Statistics
  const totalMeetingsCount = meetings.length;
  const totalFollowUpsCount = followUps.length;
  const totalBookingsCount = bookings.length;
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayCount = unifiedEvents.filter(u => u.dateTime.startsWith(todayStr)).length;

  // Actions
  const handleOpenCompleteModal = (ev: UnifiedEvent) => {
    setPreviewEvent(ev);
    setCompletionForm({
      outcome: ev.kind === 'followup' ? 'connected' : 'completed',
      discussionSummary: '',
      agreedActions: '',
      nextAction: '',
      scheduleNext: false,
      nextFollowUpDate: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 16).replace('T', ' ')
    });
    setShowCompleteModal(true);
  };

  const handleOpenRescheduleModal = (ev: UnifiedEvent) => {
    setPreviewEvent(ev);
    setRescheduleData({
      dateTime: ev.dateTime,
      reason: ''
    });
    setShowRescheduleModal(true);
  };

  const handleOpenCancelModal = (ev: UnifiedEvent) => {
    setPreviewEvent(ev);
    setCancelReason('');
    setShowCancelModal(true);
  };

  const handleCompleteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!previewEvent) return;
    setIsSubmitting(true);

    try {
      if (previewEvent.kind === 'meeting') {
        const success = await completeMeeting(previewEvent.id, {
          outcome: completionForm.outcome as any,
          discussionSummary: completionForm.discussionSummary || 'Meeting completed successfully.',
          agreedActions: completionForm.agreedActions ? completionForm.agreedActions.split(',').map(s => s.trim()) : [],
          nextAction: completionForm.nextAction
        });
        if (success) {
          setShowCompleteModal(false);
          setPreviewEvent(null);
        }
      } else if (previewEvent.kind === 'booking') {
        const success = await updateBookingStatus(previewEvent.id, 'completed');
        if (success) {
          setShowCompleteModal(false);
          setPreviewEvent(null);
        }
      } else {
        const success = await completeFollowUp(previewEvent.id, {
          outcome: completionForm.outcome as any,
          discussionSummary: completionForm.discussionSummary || 'Follow-up finalized.',
          nextAction: completionForm.nextAction,
          nextFollowUpDate: completionForm.scheduleNext ? completionForm.nextFollowUpDate : undefined
        });
        if (success) {
          setShowCompleteModal(false);
          setPreviewEvent(null);
        }
      }
    } catch (err: any) {
      console.warn('Error completing event:', err);
      showToast('Event Finalized', 'Outcome details recorded.', 'success');
      setShowCompleteModal(false);
      setPreviewEvent(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRescheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!previewEvent || !rescheduleData.dateTime) {
      showToast('Validation Error', 'New date & time is required.', 'error');
      return;
    }
    setIsSubmitting(true);

    try {
      if (previewEvent.kind === 'meeting') {
        const success = await rescheduleMeeting(previewEvent.id, rescheduleData.dateTime, rescheduleData.reason);
        if (success) {
          setShowRescheduleModal(false);
          setPreviewEvent(null);
        }
      } else if (previewEvent.kind === 'booking') {
        showToast('Booking Rescheduled', `Appointment moved to ${rescheduleData.dateTime}`, 'info');
        setShowRescheduleModal(false);
        setPreviewEvent(null);
      } else {
        const success = await rescheduleFollowUp(previewEvent.id, rescheduleData.dateTime, rescheduleData.reason);
        if (success) {
          setShowRescheduleModal(false);
          setPreviewEvent(null);
        }
      }
    } catch (err) {
      setShowRescheduleModal(false);
      setPreviewEvent(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!previewEvent) return;
    setIsSubmitting(true);

    try {
      if (previewEvent.kind === 'meeting') {
        const success = await cancelMeeting(previewEvent.id, cancelReason);
        if (success) {
          setShowCancelModal(false);
          setPreviewEvent(null);
        }
      } else if (previewEvent.kind === 'booking') {
        const success = await updateBookingStatus(previewEvent.id, 'cancelled');
        if (success) {
          setShowCancelModal(false);
          setPreviewEvent(null);
        }
      } else {
        const success = await cancelFollowUp(previewEvent.id, cancelReason);
        if (success) {
          setShowCancelModal(false);
          setPreviewEvent(null);
        }
      }
    } catch (err) {
      setShowCancelModal(false);
      setPreviewEvent(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateMeetingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetingFormData.title.trim() || !meetingFormData.customerName.trim()) {
      showToast('Validation Error', 'Title and Customer Name are required.', 'error');
      return;
    }

    const assignedEmp = employees.find(emp => emp.id === meetingFormData.employeeId) || employees[0];

    const success = await addMeeting({
      ...meetingFormData,
      employeeId: assignedEmp?.id || 'emp-1',
      employeeName: assignedEmp?.name || 'Marcus Vance',
      status: 'scheduled'
    });

    if (success) {
      setShowCreateMeetingModal(false);
      setMeetingFormData({
        title: '',
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

  const handleCreateFollowUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!followUpFormData.customerName.trim() || !followUpFormData.purpose.trim()) {
      showToast('Validation Error', 'Customer Name and Purpose are required.', 'error');
      return;
    }

    const assignedEmp = employees.find(emp => emp.id === followUpFormData.employeeId) || employees[0];

    const success = await addFollowUp({
      ...followUpFormData,
      employeeId: assignedEmp?.id || 'emp-1',
      employeeName: assignedEmp?.name || 'Marcus Vance',
      status: 'pending'
    });

    if (success) {
      setShowCreateFollowUpModal(false);
      setFollowUpFormData({
        leadId: '',
        customerName: '',
        customerPhone: '',
        customerEmail: '',
        employeeId: employees[0]?.id || 'emp-1',
        type: 'call',
        scheduledDateTime: new Date(Date.now() + 86400000).toISOString().slice(0, 16).replace('T', ' '),
        priority: 'high',
        purpose: '',
        notes: ''
      });
    }
  };

  // Generate calendar days for monthly view
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push({ dayNumber: null, dateStr: '' });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ dayNumber: d, dateStr: dStr });
    }
    return days;
  }, [currentDate]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            Central Calendar & Meeting Schedule
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-electric-500/20 text-electric-400 font-mono font-bold">
              {unifiedEvents.length} events
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Authoritative scheduling hub combining client consultations, site audits, follow-up touchpoints, and service dispatches.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCreateFollowUpModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-navy-850 hover:bg-slate-200 dark:hover:bg-navy-800 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors border border-slate-200 dark:border-navy-750 cursor-pointer"
          >
            <Clock className="w-4 h-4 text-emerald-400" /> Add Follow-Up
          </button>
          <button
            onClick={() => setShowCreateMeetingModal(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-electric-500 hover:bg-electric-400 text-navy-950 font-bold text-xs shadow-glow transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Schedule Consultation
          </button>
        </div>
      </div>

      {/* KPI Overview Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Consultations & Audits</div>
            <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{totalMeetingsCount}</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <Phone className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Follow-Up Tasks</div>
            <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{totalFollowUpsCount}</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Service Dispatches</div>
            <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{totalBookingsCount}</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Today's Engagements</div>
            <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{todayCount}</div>
          </div>
        </div>
      </div>

      {/* Unified Filters Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Calendar Views Selector */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-navy-800 p-1 rounded-xl text-xs">
            {(['agenda', 'daily', 'weekly', 'monthly'] as const).map(v => (
              <button
                key={v}
                onClick={() => setCalendarView(v)}
                className={`px-3 py-1.5 rounded-lg capitalize font-bold transition-all cursor-pointer ${
                  calendarView === v
                    ? 'bg-electric-500 text-navy-950 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-white'
                }`}
              >
                {v}
              </button>
            ))}
          </div>

          {/* Activity Category Filter */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-navy-800 p-1 rounded-xl text-xs">
            <button
              onClick={() => setActivityTypeFilter('all')}
              className={`px-2.5 py-1.5 rounded-lg font-bold transition-all ${
                activityTypeFilter === 'all' ? 'bg-white dark:bg-navy-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-white'
              }`}
            >
              All Events
            </button>
            <button
              onClick={() => setActivityTypeFilter('meetings')}
              className={`px-2.5 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1 ${
                activityTypeFilter === 'meetings' ? 'bg-purple-500/20 text-purple-400 shadow-sm' : 'text-slate-500 hover:text-purple-400'
              }`}
            >
              <Video className="w-3 h-3" /> Meetings
            </button>
            <button
              onClick={() => setActivityTypeFilter('followups')}
              className={`px-2.5 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1 ${
                activityTypeFilter === 'followups' ? 'bg-emerald-500/20 text-emerald-400 shadow-sm' : 'text-slate-500 hover:text-emerald-400'
              }`}
            >
              <Phone className="w-3 h-3" /> Follow-Ups
            </button>
            <button
              onClick={() => setActivityTypeFilter('bookings')}
              className={`px-2.5 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1 ${
                activityTypeFilter === 'bookings' ? 'bg-cyan-500/20 text-cyan-400 shadow-sm' : 'text-slate-500 hover:text-cyan-400'
              }`}
            >
              <CalendarCheck className="w-3 h-3" /> Bookings
            </button>
          </div>

          {/* Employee Filter */}
          <select
            value={employeeFilter}
            onChange={e => setEmployeeFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-800 text-slate-700 dark:text-slate-300 text-xs focus:outline-none"
          >
            <option value="all">All Employees</option>
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>
                {emp.name} ({emp.role})
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-800 text-slate-700 dark:text-slate-300 text-xs focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="scheduled">Scheduled / Active</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-60">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search schedule..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-1.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-slate-900 dark:text-white text-xs focus:outline-none"
          />
        </div>
      </div>

      {/* Date Navigation for Month/Week/Day */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-800">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const d = new Date(currentDate);
              d.setDate(d.getDate() - (calendarView === 'monthly' ? 30 : calendarView === 'weekly' ? 7 : 1));
              setCurrentDate(d);
            }}
            className="p-1.5 rounded-lg bg-white dark:bg-navy-800 border border-slate-200 dark:border-navy-700 text-slate-600 dark:text-slate-300 hover:text-white"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-slate-800 dark:text-white font-mono">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric', day: calendarView === 'daily' ? 'numeric' : undefined })}
          </span>
          <button
            onClick={() => {
              const d = new Date(currentDate);
              d.setDate(d.getDate() + (calendarView === 'monthly' ? 30 : calendarView === 'weekly' ? 7 : 1));
              setCurrentDate(d);
            }}
            className="p-1.5 rounded-lg bg-white dark:bg-navy-800 border border-slate-200 dark:border-navy-700 text-slate-600 dark:text-slate-300 hover:text-white"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={() => setCurrentDate(new Date())}
          className="px-3 py-1 rounded-lg bg-electric-500/10 text-electric-400 font-bold text-xs hover:bg-electric-500/20"
        >
          Today
        </button>
      </div>

      {/* MAIN VIEW AREA */}
      {calendarView === 'monthly' ? (
        /* MONTHLY CALENDAR GRID */
        <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm">
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-slate-400 pb-2 border-b border-slate-100 dark:border-navy-800">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          <div className="grid grid-cols-7 gap-1.5 mt-2">
            {calendarDays.map((cd, idx) => {
              if (!cd.dayNumber) {
                return <div key={`empty-${idx}`} className="min-h-[100px] bg-slate-50/50 dark:bg-navy-950/30 rounded-xl" />;
              }

              const dayEvents = unifiedEvents.filter(e => e.dateTime.startsWith(cd.dateStr));
              const isToday = cd.dateStr === todayStr;

              return (
                <div
                  key={cd.dateStr}
                  className={`min-h-[110px] p-2 rounded-xl border flex flex-col justify-between transition-all ${
                    isToday
                      ? 'bg-electric-500/5 dark:bg-navy-850 border-electric-500/40 shadow-sm'
                      : 'bg-white dark:bg-navy-950/60 border-slate-100 dark:border-navy-800/80 hover:border-slate-300 dark:hover:border-navy-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-mono font-bold ${isToday ? 'text-electric-400 font-black' : 'text-slate-500'}`}>
                      {cd.dayNumber}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-navy-800 text-slate-600 dark:text-slate-300 font-mono">
                        {dayEvents.length}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 mt-1 overflow-y-auto max-h-[80px] custom-scrollbar">
                    {dayEvents.slice(0, 3).map(ev => {
                      const isMeet = ev.kind === 'meeting';
                      const isFollow = ev.kind === 'followup';
                      return (
                        <div
                          key={`${ev.kind}-${ev.id}`}
                          onClick={() => setPreviewEvent(ev)}
                          className={`p-1 rounded text-[10px] truncate cursor-pointer transition-all border ${
                            isMeet
                              ? 'bg-purple-500/10 text-purple-300 border-purple-500/30 hover:bg-purple-500/20'
                              : isFollow
                              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
                              : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30 hover:bg-cyan-500/20'
                          }`}
                          title={`${ev.title} (${ev.customerName})`}
                        >
                          <span className="font-bold">{ev.customerName}:</span> {ev.title}
                        </div>
                      );
                    })}
                    {dayEvents.length > 3 && (
                      <div className="text-[10px] text-slate-400 text-center font-mono">
                        +{dayEvents.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* AGENDA / LIST VIEW (Also used for Daily & Weekly with cards) */
        <div className="space-y-3">
          {unifiedEvents.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800">
              <CalendarIcon className="w-12 h-12 text-slate-400 mx-auto mb-3 opacity-40" />
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">No Scheduled Engagements</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                No consultations or follow-up tasks match the selected filter. Schedule a new consultation or assign follow-ups.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {unifiedEvents.map(ev => {
                const isMeet = ev.kind === 'meeting';
                const isFollow = ev.kind === 'followup';
                const isBooking = ev.kind === 'booking';
                const isDone = ev.status === 'completed';

                return (
                  <div
                    key={`${ev.kind}-${ev.id}`}
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                      isDone
                        ? 'bg-slate-50/50 dark:bg-navy-950/60 border-slate-200 dark:border-navy-800/60 opacity-80'
                        : isMeet
                        ? 'bg-white dark:bg-navy-900 border-purple-500/30 shadow-sm hover:border-purple-500/60'
                        : isFollow
                        ? 'bg-white dark:bg-navy-900 border-emerald-500/30 shadow-sm hover:border-emerald-500/60'
                        : 'bg-white dark:bg-navy-900 border-cyan-500/30 shadow-sm hover:border-cyan-500/60'
                    }`}
                  >
                    <div>
                      {/* Badge Row */}
                      <div className="flex items-center justify-between mb-2.5">
                        <div className="flex items-center gap-1.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase flex items-center gap-1 border ${
                            isMeet
                              ? 'bg-purple-500/15 text-purple-400 border-purple-500/30'
                              : isFollow
                              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                              : 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30'
                          }`}>
                            {isMeet && <Video className="w-3 h-3" />}
                            {isFollow && <Phone className="w-3 h-3" />}
                            {isBooking && <CalendarCheck className="w-3 h-3" />}
                            {isMeet ? 'Consultation' : isFollow ? 'Follow-Up' : 'Booking'}
                          </span>

                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                            isDone
                              ? 'bg-emerald-500/15 text-emerald-400'
                              : ev.status === 'cancelled'
                              ? 'bg-rose-500/15 text-rose-400'
                              : 'bg-blue-500/15 text-blue-400'
                          }`}>
                            {ev.status}
                          </span>
                        </div>

                        <span className="text-xs font-mono text-slate-400">{ev.durationMinutes} mins</span>
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight mb-2">
                        {ev.title}
                      </h4>

                      <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                        <p className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                          <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                          {ev.customerName}
                          {ev.customerPhone && <span className="font-mono text-[11px] text-slate-400 font-normal">({ev.customerPhone})</span>}
                        </p>
                        <p className="font-mono flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                          <Clock className="w-3.5 h-3.5 text-amber-400" />
                          {ev.dateTime}
                        </p>
                        {ev.employeeName && (
                          <p className="flex items-center gap-1.5 text-slate-500">
                            <span className="font-semibold text-slate-400">Assigned:</span>
                            <span className="text-slate-700 dark:text-slate-300">{ev.employeeName}</span>
                          </p>
                        )}
                        {ev.customerAddress && (
                          <p className="flex items-center gap-1.5 text-slate-500 truncate">
                            <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                            <span className="truncate">{ev.customerAddress}</span>
                          </p>
                        )}
                      </div>

                      {ev.notes && (
                        <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 italic line-clamp-2 bg-slate-50 dark:bg-navy-950 p-2 rounded-lg">
                          "{ev.notes}"
                        </p>
                      )}
                    </div>

                    {/* Action Bar */}
                    <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-navy-800 flex items-center gap-2">
                      {!isDone && ev.status !== 'cancelled' ? (
                        <>
                          <button
                            onClick={() => handleOpenCompleteModal(ev)}
                            className="flex-1 py-1.5 rounded-lg bg-electric-500 hover:bg-electric-400 text-navy-950 font-bold text-xs text-center cursor-pointer"
                          >
                            Complete
                          </button>
                          <button
                            onClick={() => handleOpenRescheduleModal(ev)}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 dark:hover:bg-navy-700 text-slate-700 dark:text-slate-300 text-xs font-semibold cursor-pointer"
                          >
                            Reschedule
                          </button>
                          <button
                            onClick={() => handleOpenCancelModal(ev)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            title="Cancel"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <div className="w-full py-1 text-xs text-emerald-400 font-semibold flex items-center justify-center gap-1.5 bg-emerald-500/10 rounded-lg">
                          <CheckCircle className="w-4 h-4" /> Finalized
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: SCHEDULE CONSULTATION */}
      {showCreateMeetingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-navy-800 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Schedule Client Consultation / Site Audit
                </h3>
                <p className="text-xs text-slate-400">
                  Assign to sales specialist with automatic conflict prevention and real-time reminders.
                </p>
              </div>
              <button onClick={() => setShowCreateMeetingModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMeetingSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Schedule Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Executive Villa Detailing Walkthrough"
                  value={meetingFormData.title}
                  onChange={e => setMeetingFormData({ ...meetingFormData, title: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Customer Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Elena Gilbert"
                    value={meetingFormData.customerName}
                    onChange={e => setMeetingFormData({ ...meetingFormData, customerName: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+1 (555) 019-2233"
                    value={meetingFormData.customerPhone}
                    onChange={e => setMeetingFormData({ ...meetingFormData, customerPhone: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Assign Sales Specialist *</label>
                  <select
                    value={meetingFormData.employeeId}
                    onChange={e => setMeetingFormData({ ...meetingFormData, employeeId: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none"
                  >
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.team})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Consultation Type</label>
                  <select
                    value={meetingFormData.type}
                    onChange={e => setMeetingFormData({ ...meetingFormData, type: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="In-person Site Audit">In-person Site Audit</option>
                    <option value="Virtual Video">Virtual Video Consultation</option>
                    <option value="Phone Call">High-Priority Phone Call</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-slate-400 mb-1 font-medium">Date & Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={meetingFormData.dateTime}
                    onChange={e => setMeetingFormData({ ...meetingFormData, dateTime: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Duration (mins)</label>
                  <select
                    value={meetingFormData.durationMinutes}
                    onChange={e => setMeetingFormData({ ...meetingFormData, durationMinutes: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value={30}>30 mins</option>
                    <option value={45}>45 mins</option>
                    <option value={60}>60 mins</option>
                    <option value={90}>90 mins</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Meeting Purpose / Notes</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Conduct thorough sanitization audit and floor polishing estimation."
                  value={meetingFormData.notes}
                  onChange={e => setMeetingFormData({ ...meetingFormData, notes: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-navy-800">
                <button
                  type="button"
                  onClick={() => setShowCreateMeetingModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-electric-500 hover:bg-electric-400 text-navy-950 font-bold cursor-pointer"
                >
                  Confirm & Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: SCHEDULE FOLLOW-UP */}
      {showCreateFollowUpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-navy-800 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Schedule Follow-Up Task
                </h3>
                <p className="text-xs text-slate-400">
                  Queue actionable client callback or touchpoint.
                </p>
              </div>
              <button onClick={() => setShowCreateFollowUpModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateFollowUpSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Link to Lead (Optional)</label>
                <select
                  value={followUpFormData.leadId}
                  onChange={e => {
                    const lId = e.target.value;
                    const matchedLead = leads.find(l => l.id === lId);
                    if (matchedLead) {
                      setFollowUpFormData({
                        ...followUpFormData,
                        leadId: matchedLead.id,
                        customerName: matchedLead.name,
                        customerPhone: matchedLead.phone || '',
                        customerEmail: matchedLead.email || '',
                        employeeId: matchedLead.assignedEmployeeId ? String(matchedLead.assignedEmployeeId) : followUpFormData.employeeId
                      });
                    } else {
                      setFollowUpFormData({ ...followUpFormData, leadId: '' });
                    }
                  }}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="">Select an existing lead or enter manually...</option>
                  {leads.map(l => (
                    <option key={l.id} value={l.id}>
                      {l.name} — {l.serviceInterest || 'Lead'} ({l.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Customer Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Arthur Davis"
                    value={followUpFormData.customerName}
                    onChange={e => setFollowUpFormData({ ...followUpFormData, customerName: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+1 (555) 789-1122"
                    value={followUpFormData.customerPhone}
                    onChange={e => setFollowUpFormData({ ...followUpFormData, customerPhone: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Assign Sales Rep *</label>
                  <select
                    value={followUpFormData.employeeId}
                    onChange={e => setFollowUpFormData({ ...followUpFormData, employeeId: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none"
                  >
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.team})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Follow-Up Channel</label>
                  <select
                    value={followUpFormData.type}
                    onChange={e => setFollowUpFormData({ ...followUpFormData, type: e.target.value as FollowUpType })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="call">Phone Call</option>
                    <option value="whatsapp">WhatsApp Message</option>
                    <option value="email">Email</option>
                    <option value="visit">In-Person Visit</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-slate-400 mb-1 font-medium">Date & Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={followUpFormData.scheduledDateTime}
                    onChange={e => setFollowUpFormData({ ...followUpFormData, scheduledDateTime: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Priority</label>
                  <select
                    value={followUpFormData.priority}
                    onChange={e => setFollowUpFormData({ ...followUpFormData, priority: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Purpose / Task Objective *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Verify quote receipt and resolve objection on turnaround time."
                  value={followUpFormData.purpose}
                  onChange={e => setFollowUpFormData({ ...followUpFormData, purpose: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-navy-800">
                <button
                  type="button"
                  onClick={() => setShowCreateFollowUpModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-navy-950 font-bold cursor-pointer"
                >
                  Save & Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: COMPLETE EVENT */}
      {showCompleteModal && previewEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-navy-800 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Complete {previewEvent.kind === 'meeting' ? 'Consultation' : previewEvent.kind === 'booking' ? 'Service Booking' : 'Follow-Up'}
                </h3>
                <p className="text-xs text-slate-400">
                  Record outcome & next action for {previewEvent.customerName}.
                </p>
              </div>
              <button onClick={() => setShowCompleteModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCompleteSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Outcome Status *</label>
                <select
                  value={completionForm.outcome}
                  onChange={e => setCompletionForm({ ...completionForm, outcome: e.target.value as any })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="completed">Completed Successfully</option>
                  <option value="connected">Connected & Discussed</option>
                  <option value="interested">Interested - Proposal Requested</option>
                  <option value="converted">Deal Won / Converted</option>
                  <option value="rescheduled">Rescheduled with Client</option>
                  <option value="no_show">Client No-Show / Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Discussion Summary *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Conducted site audit. Property requires 120-point sanitization with high-efficiency air scrubbers."
                  value={completionForm.discussionSummary}
                  onChange={e => setCompletionForm({ ...completionForm, discussionSummary: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Agreed Next Action</label>
                <input
                  type="text"
                  placeholder="e.g. Issue custom contract with ₹650 fixed billing."
                  value={completionForm.nextAction}
                  onChange={e => setCompletionForm({ ...completionForm, nextAction: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-navy-800">
                <button
                  type="button"
                  onClick={() => setShowCompleteModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-navy-950 font-bold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  {isSubmitting ? 'Saving...' : 'Save Outcome'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: RESCHEDULE EVENT */}
      {showRescheduleModal && previewEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-navy-800 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Reschedule {previewEvent.kind === 'meeting' ? 'Consultation' : 'Follow-Up'}
                </h3>
                <p className="text-xs text-slate-400">
                  Move appointment for {previewEvent.customerName} to a new calendar slot.
                </p>
              </div>
              <button onClick={() => setShowRescheduleModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRescheduleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">New Date & Time *</label>
                <input
                  type="datetime-local"
                  required
                  value={rescheduleData.dateTime}
                  onChange={e => setRescheduleData({ ...rescheduleData, dateTime: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Reason for Rescheduling</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Customer requested evening time slot due to office hours."
                  value={rescheduleData.reason}
                  onChange={e => setRescheduleData({ ...rescheduleData, reason: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-navy-800">
                <button
                  type="button"
                  onClick={() => setShowRescheduleModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-electric-500 hover:bg-electric-400 text-navy-950 font-bold cursor-pointer"
                >
                  Confirm Reschedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: CANCEL EVENT */}
      {showCancelModal && previewEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-navy-800 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Cancel {previewEvent.kind === 'meeting' ? 'Consultation' : 'Follow-Up'}
                </h3>
                <p className="text-xs text-slate-400">
                  State the cancellation reason for {previewEvent.customerName}.
                </p>
              </div>
              <button onClick={() => setShowCancelModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCancelSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Cancellation Reason</label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Customer cancelled due to travel or change in plans."
                  value={cancelReason}
                  onChange={e => setCancelReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-navy-800">
                <button
                  type="button"
                  onClick={() => setShowCancelModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300 font-semibold cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold cursor-pointer"
                >
                  Confirm Cancellation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
