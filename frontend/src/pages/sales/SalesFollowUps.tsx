import React, { useState, useMemo } from 'react';
import { useCrm } from '../../context/CrmContext';
import { FollowUp, FollowUpOutcome, FollowUpStatus, FollowUpType } from '../../types';
import {
  Clock,
  AlertTriangle,
  Phone,
  MessageSquare,
  CheckCircle,
  Calendar,
  Sparkles,
  ChevronRight,
  X,
  Plus,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  CalendarCheck,
  UserCheck,
  Mail,
  MessageCircle,
  FileText
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const SalesFollowUps: React.FC = () => {
  const {
    followUps,
    leads,
    currentUser,
    employees,
    addFollowUp,
    completeFollowUp,
    rescheduleFollowUp,
    cancelFollowUp,
    showToast
  } = useCrm();

  const navigate = useNavigate();

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [selectedFollowUp, setSelectedFollowUp] = useState<FollowUp | null>(null);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Complete Form State
  const [completeForm, setCompleteForm] = useState({
    outcome: 'connected' as FollowUpOutcome,
    discussionSummary: '',
    customerFeedback: '',
    nextAction: '',
    scheduleNext: false,
    nextFollowUpDate: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 16).replace('T', ' ')
  });

  // Reschedule Form State
  const [rescheduleForm, setRescheduleForm] = useState({
    scheduledDateTime: '',
    reason: ''
  });

  // Cancel Form State
  const [cancelReason, setCancelReason] = useState('');

  // Add Follow-Up Form State
  const [addForm, setAddForm] = useState({
    leadId: '',
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    type: 'call' as FollowUpType,
    scheduledDateTime: new Date(Date.now() + 86400000).toISOString().slice(0, 16).replace('T', ' '),
    priority: 'high' as 'urgent' | 'high' | 'medium' | 'low',
    purpose: '',
    notes: ''
  });

  const matchingEmp = employees.find(e =>
    e.id === currentUser.id ||
    e.email?.toLowerCase() === currentUser.email?.toLowerCase() ||
    (currentUser.name && e.name?.toLowerCase().trim() === currentUser.name.toLowerCase().trim())
  );

  // Representative's personal follow-ups
  const myFollowUps = useMemo(() => {
    return followUps.filter(f => {
      if (!f.employeeId && !f.employeeName) return true; // Show unassigned to rep as well
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

  // Derived categorized lists
  const now = new Date().getTime();
  const todayStr = new Date().toISOString().slice(0, 10);

  const categorized = useMemo(() => {
    let filtered = myFollowUps;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(f => f.status === statusFilter);
    }
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(f => f.priority === priorityFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(f =>
        f.customerName.toLowerCase().includes(q) ||
        (f.customerPhone && f.customerPhone.includes(q)) ||
        f.purpose.toLowerCase().includes(q)
      );
    }

    const overdue = filtered.filter(f => {
      if (f.status === 'completed' || f.status === 'cancelled') return false;
      const scheduledTime = new Date(f.scheduledDateTime).getTime();
      return scheduledTime < now;
    });

    const today = filtered.filter(f => {
      if (f.status === 'completed' || f.status === 'cancelled') return false;
      const scheduledTime = new Date(f.scheduledDateTime).getTime();
      return scheduledTime >= now && f.scheduledDateTime.startsWith(todayStr);
    });

    const upcoming = filtered.filter(f => {
      if (f.status === 'completed' || f.status === 'cancelled') return false;
      const scheduledTime = new Date(f.scheduledDateTime).getTime();
      return scheduledTime >= now && !f.scheduledDateTime.startsWith(todayStr);
    });

    const completed = filtered.filter(f => f.status === 'completed');

    return {
      all: filtered,
      overdue,
      today,
      upcoming,
      completed
    };
  }, [myFollowUps, statusFilter, priorityFilter, searchQuery, now, todayStr]);

  const handleOpenCompleteModal = (item: FollowUp) => {
    setSelectedFollowUp(item);
    setCompleteForm({
      outcome: 'connected',
      discussionSummary: '',
      customerFeedback: '',
      nextAction: '',
      scheduleNext: false,
      nextFollowUpDate: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 16).replace('T', ' ')
    });
    setShowCompleteModal(true);
  };

  const handleOpenRescheduleModal = (item: FollowUp) => {
    setSelectedFollowUp(item);
    setRescheduleForm({
      scheduledDateTime: item.scheduledDateTime,
      reason: ''
    });
    setShowRescheduleModal(true);
  };

  const handleOpenCancelModal = (item: FollowUp) => {
    setSelectedFollowUp(item);
    setCancelReason('');
    setShowCancelModal(true);
  };

  const handleCompleteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFollowUp) return;

    try {
      await completeFollowUp(selectedFollowUp.id, {
        outcome: completeForm.outcome,
        discussionSummary: completeForm.discussionSummary || 'Follow-up touchpoint concluded.',
        customerFeedback: completeForm.customerFeedback,
        nextAction: completeForm.nextAction,
        nextFollowUpDate: completeForm.scheduleNext ? completeForm.nextFollowUpDate : undefined
      });
    } finally {
      setShowCompleteModal(false);
      setSelectedFollowUp(null);
    }
  };

  const handleRescheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFollowUp || !rescheduleForm.scheduledDateTime) {
      showToast('Validation Error', 'New date & time is required.', 'error');
      return;
    }

    const success = await rescheduleFollowUp(selectedFollowUp.id, rescheduleForm.scheduledDateTime, rescheduleForm.reason);
    if (success) {
      setShowRescheduleModal(false);
      setSelectedFollowUp(null);
    }
  };

  const handleCancelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFollowUp) return;

    const success = await cancelFollowUp(selectedFollowUp.id, cancelReason);
    if (success) {
      setShowCancelModal(false);
      setSelectedFollowUp(null);
    }
  };

  const handleAddFollowUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.customerName.trim() || !addForm.purpose.trim()) {
      showToast('Validation Error', 'Customer Name and Follow-up Purpose are required.', 'error');
      return;
    }

    const assignedEmpId = matchingEmp?.id || currentUser.id || 'emp-1';
    const assignedEmpName = matchingEmp?.name || currentUser.name || 'Marcus Vance';

    const success = await addFollowUp({
      ...addForm,
      employeeId: assignedEmpId,
      employeeName: assignedEmpName,
      status: 'pending'
    });

    if (success) {
      setShowAddModal(false);
      setAddForm({
        leadId: '',
        customerName: '',
        customerPhone: '',
        customerEmail: '',
        type: 'call',
        scheduledDateTime: new Date(Date.now() + 86400000).toISOString().slice(0, 16).replace('T', ' '),
        priority: 'high',
        purpose: '',
        notes: ''
      });
    }
  };

  const renderFollowUpCard = (item: FollowUp, isUrgent = false) => {
    const isCompleted = item.status === 'completed';
    const isCancelled = item.status === 'cancelled';

    return (
      <div
        key={item.id}
        className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
          isUrgent
            ? 'bg-rose-500/5 dark:bg-navy-900 border-rose-500/30 shadow-sm'
            : isCompleted
            ? 'bg-emerald-500/5 dark:bg-navy-900 border-emerald-500/20'
            : 'bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 shadow-sm hover:border-slate-300 dark:hover:border-navy-700'
        }`}
      >
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                item.priority === 'urgent'
                  ? 'bg-rose-500/15 text-rose-400'
                  : item.priority === 'high'
                  ? 'bg-amber-500/15 text-amber-400'
                  : 'bg-blue-500/15 text-blue-400'
              }`}>
                {item.priority}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold capitalize ${
                item.type === 'call' ? 'bg-emerald-500/15 text-emerald-400' :
                item.type === 'whatsapp' ? 'bg-green-500/15 text-green-400' :
                item.type === 'email' ? 'bg-cyan-500/15 text-cyan-400' : 'bg-purple-500/15 text-purple-400'
              }`}>
                {item.type.replace('_', ' ')}
              </span>
            </div>

            <span className={`text-[11px] font-mono font-bold ${isUrgent ? 'text-rose-400' : 'text-slate-400'}`}>
              Due: {item.scheduledDateTime}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              {item.customerName}
            </h4>
            {item.customerPhone && (
              <span className="text-xs font-mono text-slate-500">{item.customerPhone}</span>
            )}
          </div>

          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-1">
            {item.purpose}
          </p>

          {item.notes && (
            <p className="text-[11px] text-slate-500 italic mt-1 line-clamp-2 bg-slate-50 dark:bg-navy-950 p-2 rounded-lg">
              "{item.notes}"
            </p>
          )}

          {item.outcome && (
            <div className="mt-2 p-2 rounded-lg bg-slate-100 dark:bg-navy-850 text-[11px] text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span className="font-semibold text-emerald-400 uppercase">Outcome: {item.outcome.replace('_', ' ')}</span>
              {item.nextAction && <span className="text-slate-400 truncate max-w-[180px]">Next: {item.nextAction}</span>}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-navy-800 flex items-center gap-2">
          {!isCompleted && !isCancelled ? (
            <>
              {item.customerPhone && (
                <button
                  onClick={() => {
                    navigate('/sales/ai-calling');
                    showToast('Initiating Call', `Connecting to ${item.customerName}...`, 'info');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-electric-500 hover:bg-electric-400 text-navy-950 font-bold text-xs flex items-center gap-1 cursor-pointer"
                  title="Call via CRM AI Dialer"
                >
                  <Phone className="w-3.5 h-3.5" /> Call
                </button>
              )}

              <button
                onClick={() => handleOpenCompleteModal(item)}
                className="flex-1 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-navy-950 font-bold text-xs text-center cursor-pointer"
              >
                Complete & Log
              </button>

              <button
                onClick={() => handleOpenRescheduleModal(item)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 dark:hover:bg-navy-700 text-slate-700 dark:text-slate-300 text-xs font-semibold cursor-pointer"
                title="Reschedule"
              >
                Reschedule
              </button>

              <button
                onClick={() => handleOpenCancelModal(item)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                title="Cancel Follow-Up"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          ) : (
            <div className="w-full py-1 text-xs text-emerald-400 font-semibold flex items-center justify-center gap-1.5 bg-emerald-500/10 rounded-lg">
              <CheckCircle className="w-4 h-4" /> Finalized & Recorded
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            My Actionable Follow-Up Pipeline
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-electric-500/20 text-electric-400 font-mono font-bold">
              {categorized.all.length} total tasks
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Systematic client touchpoints and algorithmic reminders preventing lead decay and driving conversion.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-electric-500 hover:bg-electric-400 text-navy-950 font-bold text-xs shadow-glow transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Schedule New Follow-Up
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-rose-300 font-medium">Overdue / Urgent</div>
            <div className="text-xl font-black text-rose-400 mt-0.5">{categorized.overdue.length}</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Due Today</div>
            <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{categorized.today.length}</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Upcoming Scheduled</div>
            <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{categorized.upcoming.length}</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Completed Follow-ups</div>
            <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{categorized.completed.length}</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-navy-800 p-1 rounded-xl text-xs">
            {(['all', 'pending', 'completed', 'cancelled'] as const).map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg capitalize font-bold transition-all cursor-pointer ${
                  statusFilter === st
                    ? 'bg-electric-500 text-navy-950 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Priority filter */}
          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-800 text-slate-700 dark:text-slate-300 text-xs focus:outline-none"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search customer, purpose..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-1.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-slate-900 dark:text-white text-xs focus:outline-none"
          />
        </div>
      </div>

      {/* SECTION 1: OVERDUE / ATTENTION NEEDED */}
      {categorized.overdue.length > 0 && (
        <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/30 space-y-3">
          <div className="flex items-center gap-2 text-rose-400 text-xs font-bold font-mono">
            <AlertTriangle className="w-4 h-4" />
            <span>URGENT / OVERDUE CLIENT ENGAGEMENTS ({categorized.overdue.length})</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {categorized.overdue.map(item => renderFollowUpCard(item, true))}
          </div>
        </div>
      )}

      {/* SECTION 2: DUE TODAY */}
      {categorized.today.length > 0 && (
        <div className="p-5 rounded-2xl bg-amber-500/5 dark:bg-navy-900 border border-amber-500/20 space-y-3">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold font-mono">
            <Clock className="w-4 h-4" />
            <span>TODAY'S SCHEDULED TOUCHPOINTS ({categorized.today.length})</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {categorized.today.map(item => renderFollowUpCard(item, false))}
          </div>
        </div>
      )}

      {/* SECTION 3: UPCOMING SCHEDULED TOUCHPOINTS */}
      <div className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-electric-400" />
            Upcoming Scheduled Client Touchpoints
            <span className="text-xs font-mono font-normal text-slate-400">({categorized.upcoming.length})</span>
          </h3>
        </div>

        {categorized.upcoming.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No upcoming follow-ups scheduled. Use the "Schedule New Follow-Up" button to queue client callbacks.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {categorized.upcoming.map(item => renderFollowUpCard(item, false))}
          </div>
        )}
      </div>

      {/* SECTION 4: RECENTLY COMPLETED */}
      {categorized.completed.length > 0 && (
        <div className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Completed Follow-Up History
              <span className="text-xs font-mono font-normal text-slate-400">({categorized.completed.length})</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {categorized.completed.slice(0, 6).map(item => renderFollowUpCard(item, false))}
          </div>
        </div>
      )}

      {/* COMPLETE FOLLOW-UP MODAL */}
      {showCompleteModal && selectedFollowUp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-navy-800 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Complete Follow-Up Touchpoint
                </h3>
                <p className="text-xs text-slate-400">
                  Record outcome and next action for {selectedFollowUp.customerName}.
                </p>
              </div>
              <button onClick={() => setShowCompleteModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCompleteSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Interaction Outcome *</label>
                <select
                  value={completeForm.outcome}
                  onChange={e => setCompleteForm({ ...completeForm, outcome: e.target.value as FollowUpOutcome })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="connected">Connected & Discussed</option>
                  <option value="interested">Interested - Proposal Requested</option>
                  <option value="converted">Deal Won / Converted</option>
                  <option value="callback_requested">Client Requested Callback</option>
                  <option value="busy">Client Busy / Try Later</option>
                  <option value="voicemail">Left Voicemail / Audio Note</option>
                  <option value="wrong_number">Wrong Number / Inactive</option>
                  <option value="not_interested">Not Interested / Disqualified</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Discussion Summary *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Spoke with client regarding the 4,500 sqft villa cleaning proposal. Client inquired about hospital grade HEPA sanitation and pet safe products."
                  value={completeForm.discussionSummary}
                  onChange={e => setCompleteForm({ ...completeForm, discussionSummary: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Customer Feedback / Objections</label>
                  <input
                    type="text"
                    placeholder="e.g. Requested 10% multi-room discount"
                    value={completeForm.customerFeedback}
                    onChange={e => setCompleteForm({ ...completeForm, customerFeedback: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Immediate Next Action</label>
                  <input
                    type="text"
                    placeholder="e.g. Email updated quote with weekend slot"
                    value={completeForm.nextAction}
                    onChange={e => setCompleteForm({ ...completeForm, nextAction: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Schedule Next Touchpoint Toggle */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={completeForm.scheduleNext}
                    onChange={e => setCompleteForm({ ...completeForm, scheduleNext: e.target.checked })}
                    className="w-4 h-4 rounded text-electric-500 focus:ring-0"
                  />
                  <span>Schedule Next Follow-Up Touchpoint</span>
                </label>

                {completeForm.scheduleNext && (
                  <div>
                    <label className="block text-slate-400 mb-1">Next Follow-Up Date & Time</label>
                    <input
                      type="datetime-local"
                      value={completeForm.nextFollowUpDate}
                      onChange={e => setCompleteForm({ ...completeForm, nextFollowUpDate: e.target.value })}
                      className="w-full p-2 rounded-lg bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white"
                    />
                  </div>
                )}
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
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-navy-950 font-bold cursor-pointer"
                >
                  Save Outcome & Complete
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESCHEDULE MODAL */}
      {showRescheduleModal && selectedFollowUp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-navy-800 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Reschedule Follow-Up
                </h3>
                <p className="text-xs text-slate-400">
                  Move follow-up for {selectedFollowUp.customerName} to a new date.
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
                  value={rescheduleForm.scheduledDateTime}
                  onChange={e => setRescheduleForm({ ...rescheduleForm, scheduledDateTime: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Reason for Rescheduling</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Customer requested call back tomorrow afternoon."
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

      {/* CANCEL MODAL */}
      {showCancelModal && selectedFollowUp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-navy-800 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Cancel Follow-Up
                </h3>
                <p className="text-xs text-slate-400">
                  State the reason for cancelling this touchpoint.
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
                  placeholder="e.g. Lead disqualified due to out of service zone."
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

      {/* ADD FOLLOW-UP MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-navy-800 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Schedule New Follow-Up Touchpoint
                </h3>
                <p className="text-xs text-slate-400">
                  Assign actionable task to ensure high conversion velocity.
                </p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddFollowUpSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Link to Lead (Optional)</label>
                <select
                  value={addForm.leadId}
                  onChange={e => {
                    const lId = e.target.value;
                    const matchedLead = leads.find(l => l.id === lId);
                    if (matchedLead) {
                      setAddForm({
                        ...addForm,
                        leadId: matchedLead.id,
                        customerName: matchedLead.name,
                        customerPhone: matchedLead.phone || '',
                        customerEmail: matchedLead.email || ''
                      });
                    } else {
                      setAddForm({ ...addForm, leadId: '' });
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
                    value={addForm.customerName}
                    onChange={e => setAddForm({ ...addForm, customerName: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+1 (555) 789-1122"
                    value={addForm.customerPhone}
                    onChange={e => setAddForm({ ...addForm, customerPhone: e.target.value })}
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
                    value={addForm.scheduledDateTime}
                    onChange={e => setAddForm({ ...addForm, scheduledDateTime: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Priority</label>
                  <select
                    value={addForm.priority}
                    onChange={e => setAddForm({ ...addForm, priority: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Channel / Type</label>
                  <select
                    value={addForm.type}
                    onChange={e => setAddForm({ ...addForm, type: e.target.value as FollowUpType })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="call">Phone Call</option>
                    <option value="whatsapp">WhatsApp Message</option>
                    <option value="email">Email</option>
                    <option value="visit">In-Person Visit</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Purpose / Objective *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Closing sanitization contract"
                    value={addForm.purpose}
                    onChange={e => setAddForm({ ...addForm, purpose: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Context / Notes</label>
                <textarea
                  rows={2}
                  placeholder="Key background, customer preferences, or special remarks..."
                  value={addForm.notes}
                  onChange={e => setAddForm({ ...addForm, notes: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-navy-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-electric-500 hover:bg-electric-400 text-navy-950 font-bold cursor-pointer"
                >
                  Schedule Follow-Up
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
