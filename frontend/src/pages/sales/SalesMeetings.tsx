import React, { useState, useMemo } from 'react';
import { useCrm } from '../../context/CrmContext';
import { Meeting, MeetingStatus, Booking } from '../../types';
import {
  Calendar as CalendarIcon,
  Clock,
  Video,
  MapPin,
  CheckCircle,
  Plus,
  Sparkles,
  CheckSquare,
  X,
  UserCheck,
  Phone,
  Mail,
  AlertCircle,
  CalendarCheck,
  ArrowRight,
  Filter,
  RefreshCw,
  Search,
  CheckCircle2,
  CalendarDays,
  ListFilter
} from 'lucide-react';

export const SalesMeetings: React.FC = () => {
  const {
    meetings,
    bookings,
    currentUser,
    employees,
    updateMeeting,
    addMeeting,
    completeMeeting,
    rescheduleMeeting,
    cancelMeeting,
    updateBookingStatus,
    showToast
  } = useCrm();

  const [activeTab, setActiveTab] = useState<'all' | 'meetings' | 'bookings'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'scheduled' | 'completed' | 'cancelled'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'agenda' | 'day' | 'week'>('agenda');

  // Modals state
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);

  // Complete Form State
  const [completionForm, setCompletionForm] = useState({
    outcome: 'completed' as 'completed' | 'rescheduled' | 'cancelled' | 'no_show',
    discussionSummary: '',
    agreedActions: '',
    nextAction: ''
  });

  // Reschedule Form State
  const [rescheduleForm, setRescheduleForm] = useState({
    dateTime: '',
    reason: ''
  });

  // New Schedule Form State
  const [newScheduleForm, setNewScheduleForm] = useState({
    title: '',
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    dateTime: new Date(Date.now() + 86400000).toISOString().slice(0, 16).replace('T', ' '),
    durationMinutes: 45,
    type: 'In-person Site Audit' as Meeting['type'],
    notes: ''
  });

  const matchingEmp = employees.find(e =>
    e.id === currentUser.id ||
    e.email?.toLowerCase() === currentUser.email?.toLowerCase() ||
    (currentUser.name && e.name?.toLowerCase().trim() === currentUser.name.toLowerCase().trim())
  );

  // 1. Authorized Consultations & Meetings
  const myMeetings = useMemo(() => {
    return meetings.filter(m => {
      if (!m.employeeId && !m.employeeName) return true; // Show unassigned to rep as well
      const empId = String(m.employeeId);
      if (empId === currentUser.id || empId === (currentUser as any).employeeId || empId === 'emp-1') return true;
      if (currentUser.name && m.employeeName && m.employeeName.toLowerCase().trim() === currentUser.name.toLowerCase().trim()) return true;
      if (matchingEmp) {
        if (empId === matchingEmp.id || empId === (matchingEmp as any)._id || empId === (matchingEmp as any).employeeId) return true;
        if (m.employeeName && matchingEmp.name && m.employeeName.toLowerCase().trim() === matchingEmp.name.toLowerCase().trim()) return true;
      }
      return false;
    });
  }, [meetings, currentUser, matchingEmp]);

  // 2. Service Bookings Assigned / Relevant to Representative
  const myBookings = useMemo(() => {
    return bookings; // In HomeEaseGuru, all active service bookings are accessible to sales for coordination & dispatch
  }, [bookings]);

  // Unified items
  interface UnifiedAppointment {
    id: string;
    kind: 'meeting' | 'booking';
    title: string;
    customerName: string;
    customerPhone?: string;
    customerEmail?: string;
    customerAddress?: string;
    dateTime: string;
    durationMinutes?: number;
    status: string;
    type?: string;
    amount?: number;
    notes?: string;
    aiSummary?: string;
    actionItems?: string[];
    rawMeeting?: Meeting;
    rawBooking?: Booking;
  }

  const unifiedList = useMemo(() => {
    const list: UnifiedAppointment[] = [];

    if (activeTab === 'all' || activeTab === 'meetings') {
      myMeetings.forEach(m => {
        list.push({
          id: m.id,
          kind: 'meeting',
          title: m.title,
          customerName: m.customerName,
          customerPhone: m.customerPhone,
          customerEmail: m.customerEmail,
          dateTime: m.dateTime,
          durationMinutes: m.durationMinutes || 45,
          status: m.status,
          type: m.type,
          notes: m.notes,
          aiSummary: m.aiSummary,
          actionItems: m.actionItems,
          rawMeeting: m
        });
      });
    }

    if (activeTab === 'all' || activeTab === 'bookings') {
      myBookings.forEach(b => {
        list.push({
          id: b.id,
          kind: 'booking',
          title: `Service Booking: ${b.serviceName}`,
          customerName: b.customerName,
          customerPhone: b.customerPhone,
          customerAddress: b.customerAddress,
          dateTime: b.dateTime,
          durationMinutes: 90,
          status: ['confirmed', 'assigned', 'accepted', 'on_the_way', 'in_progress', 'pending'].includes(b.status) ? 'scheduled' : b.status,
          type: 'Service Dispatch',
          amount: b.amount,
          notes: b.notes,
          rawBooking: b
        });
      });
    }

    // Filter by status
    const statusFiltered = list.filter(item => {
      if (statusFilter === 'all') return true;
      if (statusFilter === 'scheduled') {
        return item.status === 'scheduled' || item.status === 'in_progress' || item.status === 'confirmed' || item.status === 'assigned' || item.status === 'accepted' || item.status === 'on_the_way' || item.status === 'pending';
      }
      return item.status === statusFilter;
    });

    // Filter by search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return statusFiltered.filter(i =>
        i.title.toLowerCase().includes(q) ||
        i.customerName.toLowerCase().includes(q) ||
        (i.customerPhone && i.customerPhone.includes(q)) ||
        (i.customerAddress && i.customerAddress.toLowerCase().includes(q))
      );
    }

    // Sort chronologically
    return statusFiltered.sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
  }, [myMeetings, myBookings, activeTab, statusFilter, searchQuery]);

  // Statistics
  const totalCount = myMeetings.length + myBookings.length;
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayCount = unifiedList.filter(u => u.dateTime.startsWith(todayStr)).length;
  const completedCount = unifiedList.filter(u => u.status === 'completed').length;

  const handleOpenCompleteModal = (item: UnifiedAppointment) => {
    if (item.rawMeeting) {
      setSelectedMeeting(item.rawMeeting);
      setSelectedBooking(null);
    } else if (item.rawBooking) {
      setSelectedBooking(item.rawBooking);
      setSelectedMeeting(null);
    }
    setCompletionForm({
      outcome: 'completed',
      discussionSummary: '',
      agreedActions: '',
      nextAction: ''
    });
    setShowCompleteModal(true);
  };

  const handleOpenRescheduleModal = (item: UnifiedAppointment) => {
    if (item.rawMeeting) {
      setSelectedMeeting(item.rawMeeting);
      setSelectedBooking(null);
    } else if (item.rawBooking) {
      setSelectedBooking(item.rawBooking);
      setSelectedMeeting(null);
    }
    setRescheduleForm({
      dateTime: item.dateTime,
      reason: ''
    });
    setShowRescheduleModal(true);
  };

  const handleCompleteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMeeting) {
      const success = await completeMeeting(selectedMeeting.id, {
        outcome: completionForm.outcome,
        discussionSummary: completionForm.discussionSummary || 'Consultation concluded successfully.',
        agreedActions: completionForm.agreedActions ? completionForm.agreedActions.split(',').map(s => s.trim()) : ['Follow up with customer next week'],
        nextAction: completionForm.nextAction || 'Send quotation and contract'
      });
      if (success) {
        setShowCompleteModal(false);
        setSelectedMeeting(null);
      }
    } else if (selectedBooking) {
      updateBookingStatus(selectedBooking.id, 'completed');
      showToast('Booking Completed', `Service order #${selectedBooking.id} marked as completed.`, 'success');
      setShowCompleteModal(false);
      setSelectedBooking(null);
    }
  };

  const handleRescheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleForm.dateTime) {
      showToast('Validation Error', 'New date & time is required.', 'error');
      return;
    }

    if (selectedMeeting) {
      const success = await rescheduleMeeting(selectedMeeting.id, rescheduleForm.dateTime, rescheduleForm.reason);
      if (success) {
        setShowRescheduleModal(false);
        setSelectedMeeting(null);
      }
    } else if (selectedBooking) {
      showToast('Booking Rescheduled', `Order #${selectedBooking.id} moved to ${rescheduleForm.dateTime}.`, 'info');
      setShowRescheduleModal(false);
      setSelectedBooking(null);
    }
  };

  const handleScheduleNewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newScheduleForm.title.trim() || !newScheduleForm.customerName.trim()) {
      showToast('Validation Error', 'Title and Customer Name are required.', 'error');
      return;
    }

    const assignedEmpId = matchingEmp?.id || currentUser.id || 'emp-1';
    const assignedEmpName = matchingEmp?.name || currentUser.name || 'Marcus Vance';

    const success = await addMeeting({
      ...newScheduleForm,
      customerPhone: newScheduleForm.customerPhone || '+1 (555) 234-8901',
      customerEmail: newScheduleForm.customerEmail || 'client@example.com',
      employeeId: assignedEmpId,
      employeeName: assignedEmpName,
      status: 'scheduled'
    });

    if (success) {
      setShowScheduleModal(false);
      setNewScheduleForm({
        title: '',
        customerName: '',
        customerPhone: '',
        customerEmail: '',
        dateTime: new Date(Date.now() + 86400000).toISOString().slice(0, 16).replace('T', ' '),
        durationMinutes: 45,
        type: 'In-person Site Audit',
        notes: ''
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            My Appointments & Site Inspections
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-electric-500/20 text-electric-400 font-mono font-bold">
              {unifiedList.length} scheduled
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time schedule of client consultations, on-site villa audits, and booked sanitization appointments.
          </p>
        </div>

        <button
          onClick={() => setShowScheduleModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-electric-500 hover:bg-electric-400 text-navy-950 font-bold text-xs shadow-glow transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Schedule New Consultation
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Total Assigned Appointments</div>
            <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{totalCount}</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-electric-500/10 text-electric-400 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Today's Active Engagements</div>
            <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{todayCount}</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Completed & Audited</div>
            <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{completedCount}</div>
          </div>
        </div>
      </div>

      {/* Controls Bar: Search, Category Filter, Status Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-navy-800 p-1 rounded-xl text-xs">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-electric-500 text-navy-950 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-white'
              }`}
            >
              All Appointments ({myMeetings.length + myBookings.length})
            </button>
            <button
              onClick={() => setActiveTab('meetings')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                activeTab === 'meetings'
                  ? 'bg-electric-500 text-navy-950 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-white'
              }`}
            >
              Consultations ({myMeetings.length})
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                activeTab === 'bookings'
                  ? 'bg-electric-500 text-navy-950 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-white'
              }`}
            >
              Service Bookings ({myBookings.length})
            </button>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-navy-800 p-1 rounded-xl text-xs">
            {(['all', 'scheduled', 'completed', 'cancelled'] as const).map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1.5 rounded-lg capitalize font-medium transition-all cursor-pointer ${
                  statusFilter === st
                    ? 'bg-white dark:bg-navy-900 text-slate-900 dark:text-white shadow-sm font-bold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search appointments..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-1.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-slate-900 dark:text-white text-xs focus:outline-none"
          />
        </div>
      </div>

      {/* Appointments Grid */}
      {unifiedList.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800">
          <CalendarIcon className="w-12 h-12 text-slate-400 mx-auto mb-3 opacity-40" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">No Appointments Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            You currently have no scheduled appointments matching this filter. Schedule a new consultation or check incoming customer bookings.
          </p>
          <button
            onClick={() => setShowScheduleModal(true)}
            className="mt-4 px-4 py-2 rounded-xl bg-electric-500 text-navy-950 font-bold text-xs"
          >
            Schedule Consultation Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {unifiedList.map(item => {
            const isCompleted = item.status === 'completed';
            const isBooking = item.kind === 'booking';

            return (
              <div
                key={`${item.kind}-${item.id}`}
                className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm flex flex-col justify-between hover:border-slate-300 dark:hover:border-navy-700 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                        isBooking
                          ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                          : 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
                      }`}>
                        {isBooking ? 'Service Booking' : 'Consultation'}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                        isCompleted
                          ? 'bg-emerald-500/15 text-emerald-400'
                          : item.status === 'cancelled'
                          ? 'bg-rose-500/15 text-rose-400'
                          : 'bg-blue-500/15 text-blue-400'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                    <span className="text-xs font-mono text-slate-400">{item.durationMinutes} mins</span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2 leading-tight">
                    {item.title}
                  </h3>

                  <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                    <p className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                      {item.customerName}
                    </p>
                    <p className="font-mono flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      {item.dateTime}
                    </p>
                    {item.customerPhone && (
                      <p className="flex items-center gap-1.5 text-slate-500">
                        <Phone className="w-3.5 h-3.5" />
                        {item.customerPhone}
                      </p>
                    )}
                    {item.customerAddress && (
                      <p className="flex items-center gap-1.5 text-slate-500 truncate">
                        <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        <span className="truncate">{item.customerAddress}</span>
                      </p>
                    )}
                    {item.type && !item.customerAddress && (
                      <p className="flex items-center gap-1.5 text-electric-400">
                        {item.type === 'In-person Site Audit' ? <MapPin className="w-3.5 h-3.5" /> : <Video className="w-3.5 h-3.5" />}
                        {item.type}
                      </p>
                    )}
                  </div>

                  {item.notes && (
                    <p className="mt-2.5 text-[11px] text-slate-500 dark:text-slate-400 italic line-clamp-2 bg-slate-50 dark:bg-navy-950 p-2 rounded-lg">
                      "{item.notes}"
                    </p>
                  )}

                  {item.aiSummary && (
                    <div className="mt-2.5 p-2 rounded-xl bg-electric-500/5 border border-electric-500/20 text-[11px] text-slate-700 dark:text-slate-300">
                      <Sparkles className="w-3 h-3 text-electric-400 inline mr-1" />
                      {item.aiSummary}
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-navy-800 flex items-center gap-2">
                  {!isCompleted && item.status !== 'cancelled' ? (
                    <>
                      <button
                        onClick={() => handleOpenCompleteModal(item)}
                        className="flex-1 py-2 rounded-xl bg-electric-500 hover:bg-electric-400 text-navy-950 font-bold text-xs text-center cursor-pointer transition-all"
                      >
                        Complete & Log
                      </button>
                      <button
                        onClick={() => handleOpenRescheduleModal(item)}
                        className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 dark:hover:bg-navy-700 text-slate-700 dark:text-slate-300 text-xs font-semibold cursor-pointer"
                        title="Reschedule"
                      >
                        Reschedule
                      </button>
                    </>
                  ) : (
                    <div className="w-full py-1.5 text-xs text-emerald-400 font-semibold flex items-center justify-center gap-1.5 bg-emerald-500/10 rounded-xl">
                      <CheckCircle className="w-4 h-4" /> Finalized & Recorded
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* SCHEDULE NEW CONSULTATION MODAL */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-navy-800 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Schedule Client Consultation / Site Audit
                </h3>
                <p className="text-xs text-slate-400">
                  Direct appointment dispatch with conflict protection and real-time reminders.
                </p>
              </div>
              <button onClick={() => setShowScheduleModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleScheduleNewSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Meeting Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Luxury Penthouse Sanitization Walkthrough"
                  value={newScheduleForm.title}
                  onChange={e => setNewScheduleForm({ ...newScheduleForm, title: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Customer / Client Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Katherine Pierce"
                    value={newScheduleForm.customerName}
                    onChange={e => setNewScheduleForm({ ...newScheduleForm, customerName: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+1 (555) 987-6543"
                    value={newScheduleForm.customerPhone}
                    onChange={e => setNewScheduleForm({ ...newScheduleForm, customerPhone: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-slate-400 mb-1 font-medium">Date & Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={newScheduleForm.dateTime}
                    onChange={e => setNewScheduleForm({ ...newScheduleForm, dateTime: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Duration (mins)</label>
                  <select
                    value={newScheduleForm.durationMinutes}
                    onChange={e => setNewScheduleForm({ ...newScheduleForm, durationMinutes: Number(e.target.value) })}
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
                <label className="block text-slate-400 mb-1 font-medium">Consultation Type</label>
                <select
                  value={newScheduleForm.type}
                  onChange={e => setNewScheduleForm({ ...newScheduleForm, type: e.target.value as any })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="In-person Site Audit">In-person Site Audit</option>
                  <option value="Virtual Video">Virtual Video Consultation</option>
                  <option value="Phone Call">High-Priority Phone Call</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Special Requirements / Notes</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Marble floor stain assessment, pet allergy considerations."
                  value={newScheduleForm.notes}
                  onChange={e => setNewScheduleForm({ ...newScheduleForm, notes: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-navy-800">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
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

      {/* COMPLETE APPOINTMENT MODAL */}
      {showCompleteModal && (selectedMeeting || selectedBooking) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-navy-800 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Complete & Log Engagement Outcome
                </h3>
                <p className="text-xs text-slate-400">
                  {selectedMeeting ? `Consultation with ${selectedMeeting.customerName}` : `Booking #${selectedBooking?.id} for ${selectedBooking?.customerName}`}
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
                  <option value="rescheduled">Rescheduled with Client</option>
                  <option value="no_show">Client No-Show / Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Discussion Summary *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Conducted detailed villa walk-through. Customer selected hospital-grade HEPA sanitization package with 20% bundle discount."
                  value={completionForm.discussionSummary}
                  onChange={e => setCompletionForm({ ...completionForm, discussionSummary: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Agreed Action Items</label>
                <input
                  type="text"
                  placeholder="e.g. Send formal estimate, reserve technician team for Saturday"
                  value={completionForm.agreedActions}
                  onChange={e => setCompletionForm({ ...completionForm, agreedActions: e.target.value })}
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
                  className="px-5 py-2 rounded-xl bg-electric-500 hover:bg-electric-400 text-navy-950 font-bold cursor-pointer"
                >
                  Save Outcome & Update CRM
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESCHEDULE MODAL */}
      {showRescheduleModal && (selectedMeeting || selectedBooking) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-navy-800 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Reschedule Appointment
                </h3>
                <p className="text-xs text-slate-400">
                  Select a new calendar time slot. Real-time updates will be synced across CRM.
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
                  value={rescheduleForm.dateTime}
                  onChange={e => setRescheduleForm({ ...rescheduleForm, dateTime: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Reason for Rescheduling</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Client requested evening schedule due to travel."
                  value={rescheduleForm.reason}
                  onChange={e => setRescheduleForm({ ...rescheduleForm, reason: e.target.value })}
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
    </div>
  );
};
