import React, { useState, useRef, useEffect } from 'react';
import { useCrm } from '../../context/CrmContext';
import { Lead, LeadStatus, Priority, Meeting, FollowUp, FollowUpType, FollowUpOutcome } from '../../types';
import {
  Search,
  Filter,
  Plus,
  Download,
  Upload,
  UserCheck,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Sparkles,
  ChevronRight,
  X,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Clock,
  ArrowUpDown,
  MessageSquare,
  UserPlus,
  Trash2,
  Edit3,
  Building,
  Video,
  CheckSquare,
  RefreshCw,
  FileText,
  Tag,
  Send,
  ExternalLink
} from 'lucide-react';

export const LeadManagement: React.FC = () => {
  const {
    leads,
    services,
    employees,
    meetings,
    followUps,
    addLead,
    updateLead,
    assignLead,
    convertLead,
    deleteLead,
    clearAllLeads,
    addLeadNote,
    addMeeting,
    updateMeeting,
    rescheduleMeeting,
    completeMeeting,
    cancelMeeting,
    addFollowUp,
    updateFollowUp,
    rescheduleFollowUp,
    completeFollowUp,
    cancelFollowUp,
    showToast
  } = useCrm();

  const activeServices = services.filter(s => s.status === 'active');

  const [activeTab, setActiveTab] = useState<LeadStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  // Workspace tab within Lead Details Drawer
  const [workspaceTab, setWorkspaceTab] = useState<'overview' | 'activities' | 'meetings' | 'followups' | 'notes' | 'history'>('overview');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [showScheduleMeetingModal, setShowScheduleMeetingModal] = useState(false);
  const [showAddFollowUpModal, setShowAddFollowUpModal] = useState(false);
  const [showCompleteFollowUpModal, setShowCompleteFollowUpModal] = useState(false);
  const [showRescheduleFollowUpModal, setShowRescheduleFollowUpModal] = useState(false);
  const [showCompleteMeetingModal, setShowCompleteMeetingModal] = useState(false);
  const [showRescheduleMeetingModal, setShowRescheduleMeetingModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  // Active item references for child modals
  const [activeFollowUp, setActiveFollowUp] = useState<FollowUp | null>(null);
  const [activeMeeting, setActiveMeeting] = useState<Meeting | null>(null);

  // Quick Note text
  const [newNoteText, setNewNoteText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State for Add Lead with full fields
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    phone: '',
    email: '',
    address: '',
    serviceId: '',
    serviceName: '',
    serviceInterest: '',
    source: 'Website Form' as Lead['source'],
    priority: 'high' as Priority,
    customerRequirements: '',
    contactPreference: 'phone' as 'phone' | 'email' | 'whatsapp',
    preferredTimeline: 'Within 48 hours',
    notes: '',
    estimatedValue: 349,
    assignedEmployeeId: employees[0]?.id || 'emp-1',
    nextFollowUp: new Date(Date.now() + 86400000).toISOString().slice(0, 16).replace('T', ' ')
  });

  // Form State for Edit Lead (pre-populated)
  const [editFormData, setEditFormData] = useState({
    name: '',
    company: '',
    phone: '',
    email: '',
    address: '',
    serviceId: '',
    serviceName: '',
    serviceInterest: '',
    source: 'Website Form' as Lead['source'],
    priority: 'medium' as Priority,
    status: 'new' as LeadStatus,
    customerRequirements: '',
    contactPreference: 'phone' as 'phone' | 'email' | 'whatsapp',
    preferredTimeline: 'Immediate',
    notes: '',
    estimatedValue: 350,
    assignedEmployeeId: '',
    nextFollowUp: ''
  });

  // Form State for Reassign Lead
  const [reassignData, setReassignData] = useState({
    employeeId: '',
    reason: ''
  });

  // Form State for Schedule Meeting
  const [meetingFormData, setMeetingFormData] = useState({
    title: '',
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    employeeId: '',
    dateTime: new Date(Date.now() + 86400000).toISOString().slice(0, 16).replace('T', ' '),
    durationMinutes: 30,
    type: 'Virtual Video' as Meeting['type'],
    notes: ''
  });

  // Form State for Follow-Up
  const [followUpFormData, setFollowUpFormData] = useState({
    type: 'call' as FollowUpType,
    scheduledDateTime: new Date(Date.now() + 86400000).toISOString().slice(0, 16).replace('T', ' '),
    priority: 'medium' as Priority,
    purpose: '',
    notes: '',
    employeeId: ''
  });

  // Form State for Complete Follow-Up
  const [completeFollowUpData, setCompleteFollowUpData] = useState({
    outcome: 'connected' as FollowUpOutcome,
    discussionSummary: '',
    customerFeedback: '',
    nextAction: ''
  });

  // Form State for Reschedule Follow-Up
  const [rescheduleFollowUpData, setRescheduleFollowUpData] = useState({
    scheduledDateTime: '',
    reason: ''
  });

  // Form State for Complete Meeting
  const [completeMeetingData, setCompleteMeetingData] = useState({
    outcome: 'completed',
    discussionSummary: '',
    customerRequirements: '',
    objections: '',
    agreedActions: '',
    nextAction: ''
  });

  // Form State for Reschedule Meeting
  const [rescheduleMeetingData, setRescheduleMeetingData] = useState({
    dateTime: '',
    reason: ''
  });

  // Sync selectedLead state when global leads update (e.g. via Socket.IO)
  useEffect(() => {
    if (selectedLead) {
      const fresh = leads.find(l => l.id === selectedLead.id);
      if (fresh) {
        setSelectedLead(fresh);
      }
    }
  }, [leads]);

  // Open Edit Lead Modal with PRE-POPULATED values
  const handleOpenEditModal = (lead: Lead) => {
    setEditFormData({
      name: lead.name || '',
      company: lead.company || '',
      phone: lead.phone || '',
      email: lead.email || '',
      address: lead.address || '',
      serviceId: lead.serviceId || '',
      serviceName: lead.serviceName || lead.serviceInterest || '',
      serviceInterest: lead.serviceInterest || lead.serviceName || '',
      source: lead.source || 'Website Form',
      priority: lead.priority || 'medium',
      status: lead.status || 'new',
      customerRequirements: Array.isArray(lead.customerRequirements) ? lead.customerRequirements.join(', ') : (lead.customerRequirements || ''),
      contactPreference: lead.contactPreference || 'phone',
      preferredTimeline: lead.preferredTimeline || 'Immediate',
      notes: lead.notes || '',
      estimatedValue: lead.estimatedValue || 350,
      assignedEmployeeId: lead.assignedEmployeeId ? String(lead.assignedEmployeeId) : '',
      nextFollowUp: lead.nextFollowUp || ''
    });
    setShowEditModal(true);
  };

  const handleSaveEditLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead) return;

    if (!editFormData.name.trim() || !editFormData.phone.trim()) {
      showToast('Validation Error', 'Customer Name and Phone number are required.', 'error');
      return;
    }

    const assignedEmp = employees.find(emp => emp.id === editFormData.assignedEmployeeId);

    const updates: Partial<Lead> = {
      name: editFormData.name.trim(),
      company: editFormData.company.trim(),
      phone: editFormData.phone.trim(),
      email: editFormData.email.trim(),
      address: editFormData.address.trim(),
      serviceId: editFormData.serviceId,
      serviceName: editFormData.serviceName || editFormData.serviceInterest,
      serviceInterest: editFormData.serviceInterest || editFormData.serviceName,
      source: editFormData.source,
      priority: editFormData.priority,
      status: editFormData.status,
      customerRequirements: editFormData.customerRequirements
        ? editFormData.customerRequirements.split(',').map(s => s.trim()).filter(Boolean)
        : [],
      contactPreference: editFormData.contactPreference,
      preferredTimeline: editFormData.preferredTimeline,
      notes: editFormData.notes,
      estimatedValue: Number(editFormData.estimatedValue) || 350,
      assignedEmployeeId: editFormData.assignedEmployeeId || undefined,
      assignedEmployeeName: assignedEmp?.name || (editFormData.assignedEmployeeId ? selectedLead.assignedEmployeeName : undefined),
      nextFollowUp: editFormData.nextFollowUp
    };

    const success = await updateLead(selectedLead.id, updates);
    if (success) {
      setSelectedLead({
        ...selectedLead,
        ...updates
      });
      setShowEditModal(false);
    }
  };

  const handleOpenReassignModal = (lead: Lead) => {
    setReassignData({
      employeeId: lead.assignedEmployeeId ? String(lead.assignedEmployeeId) : (employees[0]?.id || ''),
      reason: ''
    });
    setShowReassignModal(true);
  };

  const handleReassignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead || !reassignData.employeeId) return;

    const success = await assignLead(selectedLead.id, reassignData.employeeId, reassignData.reason);
    if (success) {
      const assignedEmp = employees.find(emp => emp.id === reassignData.employeeId);
      setSelectedLead({
        ...selectedLead,
        assignedEmployeeId: reassignData.employeeId,
        assignedEmployeeName: assignedEmp?.name,
        status: 'assigned'
      });
      setShowReassignModal(false);
    }
  };

  const handleOpenScheduleMeeting = (lead: Lead) => {
    setMeetingFormData({
      title: `Consultation with ${lead.name}`,
      customerName: lead.name,
      customerPhone: lead.phone,
      customerEmail: lead.email || '',
      employeeId: lead.assignedEmployeeId ? String(lead.assignedEmployeeId) : (employees[0]?.id || ''),
      dateTime: new Date(Date.now() + 86400000).toISOString().slice(0, 16).replace('T', ' '),
      durationMinutes: 30,
      type: 'Virtual Video',
      notes: `Lead #${lead.id} • Service: ${lead.serviceInterest}`
    });
    setShowScheduleMeetingModal(true);
  };

  const handleCreateMeetingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead) return;

    const assignedEmp = employees.find(emp => emp.id === meetingFormData.employeeId);
    const success = await addMeeting({
      ...meetingFormData,
      leadId: selectedLead.id,
      employeeName: assignedEmp?.name || 'Assigned Rep',
      status: 'scheduled'
    });

    if (success) {
      setShowScheduleMeetingModal(false);
    }
  };

  const handleOpenAddFollowUp = (lead: Lead) => {
    setFollowUpFormData({
      type: 'call',
      scheduledDateTime: new Date(Date.now() + 86400000).toISOString().slice(0, 16).replace('T', ' '),
      priority: lead.priority || 'medium',
      purpose: `Follow-up regarding ${lead.serviceInterest}`,
      notes: '',
      employeeId: lead.assignedEmployeeId ? String(lead.assignedEmployeeId) : (employees[0]?.id || '')
    });
    setShowAddFollowUpModal(true);
  };

  const handleAddFollowUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead) return;

    const assignedEmp = employees.find(emp => emp.id === followUpFormData.employeeId);
    const success = await addFollowUp({
      ...followUpFormData,
      leadId: selectedLead.id,
      customerName: selectedLead.name,
      customerPhone: selectedLead.phone,
      customerEmail: selectedLead.email,
      employeeName: assignedEmp?.name || 'Sales Representative',
      status: 'pending'
    });

    if (success) {
      setShowAddFollowUpModal(false);
    }
  };

  const handleCompleteFollowUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeFollowUp) return;

    try {
      await completeFollowUp(activeFollowUp.id, {
        outcome: completeFollowUpData.outcome,
        discussionSummary: completeFollowUpData.discussionSummary,
        customerFeedback: completeFollowUpData.customerFeedback,
        nextAction: completeFollowUpData.nextAction
      });
    } finally {
      setShowCompleteFollowUpModal(false);
      setActiveFollowUp(null);
    }
  };

  const handleRescheduleFollowUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeFollowUp || !rescheduleFollowUpData.scheduledDateTime) return;

    const success = await rescheduleFollowUp(
      activeFollowUp.id,
      rescheduleFollowUpData.scheduledDateTime,
      rescheduleFollowUpData.reason
    );

    if (success) {
      setShowRescheduleFollowUpModal(false);
      setActiveFollowUp(null);
    }
  };

  const handleCompleteMeetingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeMeeting) return;

    const success = await completeMeeting(activeMeeting.id, {
      outcome: completeMeetingData.outcome,
      discussionSummary: completeMeetingData.discussionSummary,
      customerRequirements: completeMeetingData.customerRequirements ? completeMeetingData.customerRequirements.split(',').map(s => s.trim()) : [],
      objections: completeMeetingData.objections ? completeMeetingData.objections.split(',').map(s => s.trim()) : [],
      agreedActions: completeMeetingData.agreedActions ? completeMeetingData.agreedActions.split(',').map(s => s.trim()) : [],
      nextAction: completeMeetingData.nextAction
    });

    if (success) {
      setShowCompleteMeetingModal(false);
      setActiveMeeting(null);
    }
  };

  const handleRescheduleMeetingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeMeeting || !rescheduleMeetingData.dateTime) return;

    const success = await rescheduleMeeting(activeMeeting.id, rescheduleMeetingData.dateTime, rescheduleMeetingData.reason);
    if (success) {
      setShowRescheduleMeetingModal(false);
      setActiveMeeting(null);
    }
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      showToast('Validation Error', 'Customer Name and Phone number are required.', 'error');
      return;
    }

    const assignedEmp = employees.find(
      emp => emp.id === formData.assignedEmployeeId ||
             (emp as any).employeeId === formData.assignedEmployeeId ||
             (emp as any)._id === formData.assignedEmployeeId
    );

    const empIdToAssign = assignedEmp ? (assignedEmp.id || (assignedEmp as any).employeeId || (assignedEmp as any)._id) : (formData.assignedEmployeeId || undefined);

    const success = await addLead({
      name: formData.name.trim(),
      company: formData.company.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      address: formData.address.trim(),
      serviceId: formData.serviceId,
      serviceName: formData.serviceName || formData.serviceInterest || 'Ultra Deep Villa Sanitization',
      serviceInterest: formData.serviceInterest || formData.serviceName || 'Ultra Deep Villa Sanitization',
      source: formData.source,
      priority: formData.priority,
      customerRequirements: formData.customerRequirements ? formData.customerRequirements.split(',').map(s => s.trim()).filter(Boolean) : [],
      contactPreference: formData.contactPreference,
      preferredTimeline: formData.preferredTimeline,
      notes: formData.notes,
      estimatedValue: Number(formData.estimatedValue) || 349,
      assignedEmployeeId: empIdToAssign,
      assignedEmployeeName: assignedEmp?.name,
      status: empIdToAssign ? 'assigned' : 'new',
      nextFollowUp: formData.nextFollowUp
    });

    if (success) {
      setShowAddModal(false);
      setFormData({
        name: '',
        company: '',
        phone: '',
        email: '',
        address: '',
        serviceId: '',
        serviceName: '',
        serviceInterest: '',
        source: 'Website Form',
        priority: 'high',
        customerRequirements: '',
        contactPreference: 'phone',
        preferredTimeline: 'Within 48 hours',
        notes: '',
        estimatedValue: 349,
        assignedEmployeeId: employees[0]?.id || 'emp-1',
        nextFollowUp: new Date(Date.now() + 86400000).toISOString().slice(0, 16).replace('T', ' ')
      });
    }
  };

  const handleAddInteraction = async () => {
    if (!selectedLead || !newNoteText.trim()) return;
    const success = await addLeadNote(selectedLead.id, newNoteText.trim());
    if (success) {
      setNewNoteText('');
      setShowNoteModal(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = event => {
      const text = event.target?.result as string;
      if (!text) return;
      const lines = text.split('\n').filter(l => l.trim().length > 0);
      if (lines.length > 1) {
        let count = 0;
        for (let i = 1; i < lines.length; i++) {
          const parts = lines[i].split(',').map(p => p.replace(/^"|"$/g, '').trim());
          if (parts.length >= 2 && parts[1]) {
            addLead({
              name: parts[1] || 'Imported Lead',
              phone: parts[2] || '+1 (555) 000-0000',
              email: parts[3] || '',
              address: parts[4] || '',
              serviceInterest: parts[5] || 'Ultra Deep Villa Sanitization',
              source: 'Website Form',
              estimatedValue: Number(parts[10]) || 450
            });
            count++;
          }
        }
        setShowImportModal(false);
        showToast('CSV Ingestion Complete', `Ingested & scored ${count} leads from file.`, 'success');
      } else {
        showToast('Import Warning', 'File contained no data rows.', 'error');
      }
    };
    reader.readAsText(file);
  };

  // Filter leads
  const filteredLeads = leads.filter(lead => {
    if (activeTab !== 'all' && lead.status !== activeTab) return false;
    if (priorityFilter !== 'all' && lead.priority !== priorityFilter) return false;
    if (sourceFilter !== 'all' && lead.source !== sourceFilter) return false;

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const match =
        lead.name.toLowerCase().includes(q) ||
        (lead.company && lead.company.toLowerCase().includes(q)) ||
        lead.phone.includes(q) ||
        lead.email.toLowerCase().includes(q) ||
        lead.serviceInterest.toLowerCase().includes(q) ||
        lead.address.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const handleExportCSV = () => {
    const headers = ['ID', 'Name', 'Company', 'Phone', 'Email', 'Address', 'Service', 'Source', 'Status', 'Priority', 'AIScore', 'Value'];
    const rows = filteredLeads.map(l => [
      l.id,
      `"${l.name}"`,
      `"${l.company || ''}"`,
      `"${l.phone}"`,
      `"${l.email}"`,
      `"${l.address}"`,
      `"${l.serviceInterest}"`,
      l.source,
      l.status,
      l.priority,
      l.aiScore,
      l.estimatedValue
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `homeease_leads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Leads Exported', `Downloaded ${filteredLeads.length} lead records.`, 'success');
  };

  const getStatusColor = (status: LeadStatus) => {
    switch (status) {
      case 'new': return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
      case 'qualified': return 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30';
      case 'assigned': return 'bg-purple-500/15 text-purple-400 border-purple-500/30';
      case 'unassigned': return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'converted': return 'bg-electric-500/15 text-electric-400 border-electric-500/30';
      case 'lost': return 'bg-slate-500/15 text-slate-400 border-slate-500/30';
    }
  };

  const getPriorityBadge = (p: Priority) => {
    switch (p) {
      case 'urgent': return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
      case 'high': return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'medium': return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
      case 'low': return 'text-slate-400 bg-slate-500/10 border-slate-500/30';
    }
  };

  // Meetings and Follow-ups linked to selected lead
  const leadMeetings = selectedLead
    ? meetings.filter(m => m.leadId === selectedLead.id || m.customerName === selectedLead.name)
    : [];

  const leadFollowUps = selectedLead
    ? followUps.filter(f => f.leadId === selectedLead.id || f.customerName === selectedLead.name)
    : [];

  return (
    <div className="space-y-6">
      {/* Top Banner & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            Lead Management Engine
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-electric-500/20 text-electric-400 font-mono font-bold">
              {filteredLeads.length} records
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Permanent intake, AI propensity scoring, employee dispatch, meetings, and conversion lifecycle.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {leads.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to remove all leads?')) {
                  clearAllLeads();
                }
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 text-xs font-semibold border border-rose-500/30 transition-all cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              Clear All Leads
            </button>
          )}
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-slate-700 dark:text-slate-200 hover:text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            <Upload className="w-4 h-4 text-slate-400" />
            Import Leads
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-slate-700 dark:text-slate-200 hover:text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-400" />
            Export CSV
          </button>
          <button
            onClick={() => {
              if ((!formData.assignedEmployeeId || !employees.some(e => e.id === formData.assignedEmployeeId)) && employees.length > 0) {
                setFormData(prev => ({ ...prev, assignedEmployeeId: employees[0].id }));
              }
              setShowAddModal(true);
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-electric-500 hover:bg-electric-400 text-navy-950 font-bold text-xs shadow-glow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            New Lead
          </button>
        </div>
      </div>

      {/* Tabs Row */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-slate-200 dark:border-navy-800 text-xs font-medium custom-scrollbar">
        {[
          { key: 'all', label: 'All Leads', count: leads.length },
          { key: 'new', label: 'New', count: leads.filter(l => l.status === 'new').length },
          { key: 'unassigned', label: 'Unassigned', count: leads.filter(l => l.status === 'unassigned').length },
          { key: 'assigned', label: 'Assigned', count: leads.filter(l => l.status === 'assigned').length },
          { key: 'qualified', label: 'AI Qualified', count: leads.filter(l => l.status === 'qualified').length },
          { key: 'converted', label: 'Converted', count: leads.filter(l => l.status === 'converted').length },
          { key: 'lost', label: 'Lost', count: leads.filter(l => l.status === 'lost').length },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === tab.key
                ? 'bg-electric-500 text-navy-950 font-bold shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-navy-850'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold ${
                activeTab === tab.key
                  ? 'bg-navy-950/20 text-navy-950'
                  : 'bg-slate-200 dark:bg-navy-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by customer name, company, phone, service interest, address..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-electric-500 shadow-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-slate-700 dark:text-slate-200 focus:outline-none shadow-sm cursor-pointer"
          >
            <option value="all">Priority: All</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select
            value={sourceFilter}
            onChange={e => setSourceFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-slate-700 dark:text-slate-200 focus:outline-none shadow-sm cursor-pointer"
          >
            <option value="all">Source: All</option>
            <option value="AI Inbound Call">AI Inbound Call</option>
            <option value="Website Form">Website Form</option>
            <option value="Meta Ads">Meta Ads</option>
            <option value="Google Ads">Google Ads</option>
            <option value="Referral">Referral</option>
            <option value="Walk-in">Walk-in</option>
          </select>
        </div>
      </div>

      {/* LEADS DATA TABLE */}
      <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-navy-800 text-[11px] font-mono text-slate-400 bg-slate-50/50 dark:bg-navy-850/50 uppercase tracking-wider">
                <th className="py-3.5 px-4 font-semibold">Lead Details</th>
                <th className="py-3.5 px-4 font-semibold">Service & Value</th>
                <th className="py-3.5 px-4 font-semibold">AI Lead Score</th>
                <th className="py-3.5 px-4 font-semibold">Status / Priority</th>
                <th className="py-3.5 px-4 font-semibold">Assigned Rep</th>
                <th className="py-3.5 px-4 font-semibold">Next Follow-Up</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-navy-800/60 font-sans">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <AlertCircle className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                    <p className="font-medium text-slate-600 dark:text-slate-300">No leads found in this view</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {searchQuery ? 'Try adjusting your search criteria.' : 'Create a new lead to start the AI conversion lifecycle.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredLeads.map(lead => (
                  <tr
                    key={lead.id}
                    onClick={() => {
                      setSelectedLead(lead);
                      setWorkspaceTab('overview');
                    }}
                    className="hover:bg-slate-50 dark:hover:bg-navy-850/60 transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-electric-500/10 border border-electric-500/30 flex items-center justify-center font-bold text-electric-400 text-xs flex-shrink-0">
                          {lead.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-slate-900 dark:text-white truncate">
                              {lead.name}
                            </span>
                            {lead.company && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-navy-800 text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                <Building className="w-2.5 h-2.5" />
                                {lead.company}
                              </span>
                            )}
                            <span className="text-[10px] text-slate-400 font-mono">
                              #{lead.id}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-slate-400" />
                              {lead.phone}
                            </span>
                            {lead.email && (
                              <>
                                <span>•</span>
                                <span className="truncate max-w-[140px]">{lead.email}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-900 dark:text-white">
                        {lead.serviceInterest || lead.serviceName}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                        <span className="text-electric-400 font-mono font-bold">
                          ₹{(lead.estimatedValue || 0).toLocaleString('en-IN')}
                        </span>
                        <span>•</span>
                        <span>{lead.source}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-electric-500/15 border border-electric-500/30 flex items-center justify-center font-mono font-bold text-electric-400 text-xs">
                          {lead.aiScore}
                        </div>
                        <div>
                          <div className="flex items-center gap-1 text-[11px] text-electric-400 font-bold">
                            <Sparkles className="w-3 h-3" />
                            {lead.aiConversionProb}% Win Prob
                          </div>
                          <p className="text-[10px] text-slate-400 truncate max-w-[150px]">
                            {lead.aiScoreReason}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex flex-col gap-1 items-start">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(lead.status)}`}>
                          {lead.status}
                        </span>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getPriorityBadge(lead.priority)}`}>
                          {lead.priority}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      {lead.assignedEmployeeName ? (
                        <div className="flex items-center gap-2 text-xs">
                          <div className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center font-bold text-[10px]">
                            {lead.assignedEmployeeName.charAt(0)}
                          </div>
                          <span className="font-medium text-slate-800 dark:text-slate-200">
                            {lead.assignedEmployeeName}
                          </span>
                        </div>
                      ) : (
                        <span className="text-amber-400 text-[11px] font-semibold flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" /> Unassigned
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400 text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {lead.nextFollowUp || 'None'}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            handleOpenEditModal(lead);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-electric-400 hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
                          title="Edit Lead Information"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            deleteLead(lead.id);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                          title="Delete Lead"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            setSelectedLead(lead);
                            setWorkspaceTab('overview');
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-electric-400 hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
                          title="Open Lead Workspace"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* UNIFIED LEAD DETAILS WORKSPACE (COMPREHENSIVE 6-TAB MODAL / DRAWER)     */}
      {/* ========================================================================= */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex justify-end bg-navy-950/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-3xl h-full bg-white dark:bg-navy-900 border-l border-slate-200 dark:border-navy-700 shadow-2xl flex flex-col overflow-hidden">
            {/* WORKSPACE HEADER */}
            <div className="p-5 border-b border-slate-200 dark:border-navy-800 bg-slate-50/70 dark:bg-navy-950/70 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-electric-500/15 border border-electric-500/40 flex items-center justify-center font-black text-electric-400 text-xl shadow-glow-sm flex-shrink-0">
                    {selectedLead.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-lg font-black text-slate-900 dark:text-white truncate">
                        {selectedLead.name}
                      </h2>
                      {selectedLead.company && (
                        <span className="text-xs px-2 py-0.5 rounded-md bg-slate-200 dark:bg-navy-800 text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-1">
                          <Building className="w-3 h-3" />
                          {selectedLead.company}
                        </span>
                      )}
                      <span className="font-mono text-xs text-slate-400 font-bold">
                        #{selectedLead.id}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-1 flex-wrap">
                      <span className="text-electric-400 font-bold">{selectedLead.serviceInterest}</span>
                      <span>•</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(selectedLead.status)}`}>
                        {selectedLead.status}
                      </span>
                      <span>•</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getPriorityBadge(selectedLead.priority)}`}>
                        {selectedLead.priority}
                      </span>
                      <span>•</span>
                      <span className="text-slate-600 dark:text-slate-300 font-medium">
                        Rep: {selectedLead.assignedEmployeeName || 'Unassigned'}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedLead(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-200 dark:hover:bg-navy-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* HEADER ACTIONS BAR */}
              <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-200/60 dark:border-navy-800/60">
                <button
                  onClick={() => handleOpenEditModal(selectedLead)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-electric-500 hover:bg-electric-400 text-navy-950 font-bold text-xs shadow-glow-sm transition-all cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Edit Lead
                </button>
                <button
                  onClick={() => handleOpenReassignModal(selectedLead)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 dark:hover:bg-navy-750 text-slate-800 dark:text-slate-200 font-semibold text-xs border border-slate-300 dark:border-navy-700 transition-all cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5 text-purple-400" />
                  Assign / Reassign
                </button>
                <button
                  onClick={() => handleOpenScheduleMeeting(selectedLead)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 dark:hover:bg-navy-750 text-slate-800 dark:text-slate-200 font-semibold text-xs border border-slate-300 dark:border-navy-700 transition-all cursor-pointer"
                >
                  <Video className="w-3.5 h-3.5 text-blue-400" />
                  Schedule Meeting
                </button>
                <button
                  onClick={() => handleOpenAddFollowUp(selectedLead)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 dark:hover:bg-navy-750 text-slate-800 dark:text-slate-200 font-semibold text-xs border border-slate-300 dark:border-navy-700 transition-all cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                  Add Follow-Up
                </button>
                <button
                  onClick={() => {
                    showToast('Calling Customer', `Connecting telephone route to ${selectedLead.phone}...`, 'info');
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 dark:hover:bg-navy-750 text-slate-800 dark:text-slate-200 font-semibold text-xs border border-slate-300 dark:border-navy-700 transition-all cursor-pointer"
                >
                  <Phone className="w-3.5 h-3.5 text-amber-400" />
                  Call Customer
                </button>
                <button
                  onClick={() => setShowNoteModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 dark:hover:bg-navy-750 text-slate-800 dark:text-slate-200 font-semibold text-xs border border-slate-300 dark:border-navy-700 transition-all cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-electric-400" />
                  Add Note
                </button>

                {selectedLead.status !== 'converted' ? (
                  <button
                    onClick={() => convertLead(selectedLead.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 font-bold text-xs border border-emerald-500/30 transition-all ml-auto cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Convert to Customer
                  </button>
                ) : (
                  <span className="text-emerald-400 font-bold text-xs flex items-center gap-1 ml-auto">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Converted Profile
                  </span>
                )}
              </div>

              {/* 6 WORKSPACE TABS */}
              <div className="flex items-center gap-1 border-t border-slate-200 dark:border-navy-800 pt-2 text-xs font-semibold overflow-x-auto custom-scrollbar">
                {[
                  { key: 'overview', label: '1. Overview' },
                  { key: 'activities', label: `2. Activities (${selectedLead.interactionHistory?.length || 0})` },
                  { key: 'meetings', label: `3. Meetings (${leadMeetings.length})` },
                  { key: 'followups', label: `4. Follow-ups (${leadFollowUps.length})` },
                  { key: 'notes', label: '5. Notes' },
                  { key: 'history', label: `6. History (${(selectedLead.auditHistory?.length || 0) + (selectedLead.assignmentHistory?.length || 0)})` }
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setWorkspaceTab(tab.key as any)}
                    className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                      workspaceTab === tab.key
                        ? 'bg-electric-500 text-navy-950 font-bold shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-white hover:bg-slate-100 dark:hover:bg-navy-800'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* WORKSPACE CONTENT BODY */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar text-xs">
              {/* TAB 1: OVERVIEW */}
              {workspaceTab === 'overview' && (
                <div className="space-y-5">
                  {/* AI Propensity Score Banner */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-navy-850 to-navy-900 border border-electric-500/30 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-electric-400" />
                        <span className="font-bold text-white text-xs">AI Lead Conversion Propensity</span>
                      </div>
                      <span className="text-xl font-mono font-extrabold text-electric-400">
                        {selectedLead.aiScore} / 100
                      </span>
                    </div>
                    <div className="w-full bg-navy-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-electric-500 h-full rounded-full transition-all duration-500" style={{ width: `${selectedLead.aiScore}%` }} />
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      {selectedLead.aiScoreReason}
                    </p>
                    <div className="pt-2 border-t border-navy-800 flex items-center justify-between font-mono text-[11px] text-slate-400">
                      <span>Win Probability: <strong className="text-white">{selectedLead.aiConversionProb}%</strong></span>
                      <span>Estimated Deal Size: <strong className="text-electric-400">₹{(selectedLead.estimatedValue || 0).toLocaleString('en-IN')}</strong></span>
                    </div>
                  </div>

                  {/* Customer & Organization Details */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-800 space-y-3">
                    <h4 className="font-mono text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-electric-400" />
                      Client Contact & Property Profile
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-slate-400 text-[11px] block">Customer Name</span>
                        <strong className="text-slate-900 dark:text-white text-sm">{selectedLead.name}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[11px] block">Company / Property Entity</span>
                        <span className="text-slate-800 dark:text-slate-200">{selectedLead.company || 'Private Residence / Not specified'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[11px] block">Phone Number</span>
                        <span className="text-slate-800 dark:text-slate-200 font-mono font-medium">{selectedLead.phone}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[11px] block">Email Address</span>
                        <span className="text-slate-800 dark:text-slate-200 font-mono">{selectedLead.email || 'No email provided'}</span>
                      </div>
                      <div className="sm:col-span-2">
                        <span className="text-slate-400 text-[11px] block">Service Location</span>
                        <span className="text-slate-800 dark:text-slate-200">{selectedLead.address || 'Address on file'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Service & Operational Requirements */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-800 space-y-3">
                    <h4 className="font-mono text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-electric-400" />
                      Service Interest & Requirements
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <span className="text-slate-400 text-[11px] block">Service Interest</span>
                        <span className="font-bold text-slate-900 dark:text-white text-xs">{selectedLead.serviceInterest}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[11px] block">Lead Intake Source</span>
                        <span className="text-slate-800 dark:text-slate-200">{selectedLead.source}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[11px] block">Contact Preference</span>
                        <span className="text-slate-800 dark:text-slate-200 capitalize font-medium">{selectedLead.contactPreference || 'Phone'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[11px] block">Preferred Timeline</span>
                        <span className="text-slate-800 dark:text-slate-200 font-medium">{selectedLead.preferredTimeline || 'Immediate'}</span>
                      </div>
                      {selectedLead.customerRequirements && selectedLead.customerRequirements.length > 0 && (
                        <div className="sm:col-span-2">
                          <span className="text-slate-400 text-[11px] block mb-1">Customer Requirements</span>
                          <div className="flex flex-wrap gap-1.5">
                            {selectedLead.customerRequirements.map((req, i) => (
                              <span key={i} className="px-2 py-0.5 rounded-md bg-electric-500/10 text-electric-400 border border-electric-500/30 text-[11px]">
                                {req}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {selectedLead.notes && (
                        <div className="sm:col-span-2">
                          <span className="text-slate-400 text-[11px] block mb-1">Internal Notes</span>
                          <p className="text-slate-700 dark:text-slate-300 italic bg-white dark:bg-navy-900 p-2.5 rounded-xl border border-slate-200 dark:border-navy-750">
                            "{selectedLead.notes}"
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Next Touchpoint Quick Reference */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-800 flex items-center justify-between">
                    <div>
                      <span className="text-slate-400 text-[11px] font-mono uppercase block">Next Scheduled Touchpoint</span>
                      <strong className="text-slate-900 dark:text-white font-mono text-sm">{selectedLead.nextFollowUp || 'No follow-up queued'}</strong>
                    </div>
                    <button
                      onClick={() => handleOpenAddFollowUp(selectedLead)}
                      className="px-3 py-1.5 rounded-xl bg-electric-500 hover:bg-electric-400 text-navy-950 font-bold text-xs"
                    >
                      Update Touchpoint
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: ACTIVITIES */}
              {workspaceTab === 'activities' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 dark:text-white text-xs">
                      Customer Interaction Timeline
                    </h4>
                    <button
                      onClick={() => setShowNoteModal(true)}
                      className="flex items-center gap-1 text-xs text-electric-400 hover:text-electric-300 font-semibold cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Log Interaction
                    </button>
                  </div>

                  {selectedLead.interactionHistory.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 border border-dashed border-slate-200 dark:border-navy-750 rounded-2xl">
                      <MessageSquare className="w-6 h-6 mx-auto mb-2 opacity-50" />
                      <p>No customer interactions logged yet.</p>
                      <button
                        onClick={() => setShowNoteModal(true)}
                        className="mt-2 text-electric-400 text-xs font-bold hover:underline"
                      >
                        Add first touchpoint note
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedLead.interactionHistory.map((int, idx) => (
                        <div key={idx} className="p-3.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-800 space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-electric-400 uppercase font-mono px-2 py-0.5 rounded bg-electric-500/10">
                              {int.type}
                            </span>
                            <span className="text-slate-400 font-mono">{int.date}</span>
                          </div>
                          <p className="text-slate-800 dark:text-slate-200 text-xs leading-relaxed mt-1">
                            {int.summary}
                          </p>
                          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                            <span>Logged by: <strong>{int.agentName}</strong></span>
                            {int.sentiment && (
                              <span className="capitalize">Sentiment: {int.sentiment}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: MEETINGS */}
              {workspaceTab === 'meetings' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 dark:text-white text-xs">
                      Consultations & Site Audits
                    </h4>
                    <button
                      onClick={() => handleOpenScheduleMeeting(selectedLead)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-electric-500 hover:bg-electric-400 text-navy-950 font-bold text-xs shadow-glow-sm cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Schedule New Meeting
                    </button>
                  </div>

                  {leadMeetings.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 border border-dashed border-slate-200 dark:border-navy-750 rounded-2xl">
                      <Video className="w-6 h-6 mx-auto mb-2 opacity-50" />
                      <p>No meetings scheduled for this lead.</p>
                      <button
                        onClick={() => handleOpenScheduleMeeting(selectedLead)}
                        className="mt-2 text-electric-400 text-xs font-bold hover:underline"
                      >
                        Schedule a Consultation Now
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {leadMeetings.map(meet => (
                        <div key={meet.id} className="p-4 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-800 space-y-2">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div>
                              <strong className="text-slate-900 dark:text-white text-sm block">{meet.title}</strong>
                              <span className="text-[11px] text-slate-400 font-mono">{meet.dateTime} ({meet.durationMinutes} mins) • {meet.type}</span>
                            </div>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-500/15 text-blue-400 border border-blue-500/30">
                              {meet.status}
                            </span>
                          </div>

                          <div className="text-[11px] text-slate-400 flex items-center gap-2">
                            <span>Assigned Rep: <strong className="text-slate-300">{meet.employeeName}</strong></span>
                            {meet.meetingLink && (
                              <a
                                href={meet.meetingLink}
                                target="_blank"
                                rel="noreferrer"
                                className="text-electric-400 hover:underline flex items-center gap-1 ml-auto"
                              >
                                Join Room <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>

                          {meet.outcome && (
                            <div className="p-2.5 rounded-lg bg-navy-900 text-[11px] border border-slate-200 dark:border-navy-750">
                              <span className="text-electric-400 font-bold block">Outcome: {meet.outcome.toUpperCase()}</span>
                              <p className="text-slate-300 mt-0.5">{meet.discussionSummary}</p>
                            </div>
                          )}

                          {meet.status !== 'completed' && meet.status !== 'cancelled' && (
                            <div className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-navy-800">
                              <button
                                onClick={() => {
                                  setActiveMeeting(meet);
                                  setCompleteMeetingData({
                                    outcome: 'completed',
                                    discussionSummary: '',
                                    customerRequirements: '',
                                    objections: '',
                                    agreedActions: '',
                                    nextAction: ''
                                  });
                                  setShowCompleteMeetingModal(true);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 font-bold text-xs"
                              >
                                Complete Meeting
                              </button>
                              <button
                                onClick={() => {
                                  setActiveMeeting(meet);
                                  setRescheduleMeetingData({
                                    dateTime: meet.dateTime,
                                    reason: ''
                                  });
                                  setShowRescheduleMeetingModal(true);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-navy-800 text-slate-700 dark:text-slate-200 font-semibold text-xs"
                              >
                                Reschedule
                              </button>
                              <button
                                onClick={() => {
                                  const reason = prompt('Cancellation reason:');
                                  if (reason) cancelMeeting(meet.id, reason);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 font-semibold text-xs ml-auto"
                              >
                                Cancel
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: FOLLOW-UPS */}
              {workspaceTab === 'followups' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 dark:text-white text-xs">
                      Follow-Up Schedule & Outcomes
                    </h4>
                    <button
                      onClick={() => handleOpenAddFollowUp(selectedLead)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-electric-500 hover:bg-electric-400 text-navy-950 font-bold text-xs shadow-glow-sm cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Schedule Follow-Up
                    </button>
                  </div>

                  {leadFollowUps.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 border border-dashed border-slate-200 dark:border-navy-750 rounded-2xl">
                      <Calendar className="w-6 h-6 mx-auto mb-2 opacity-50" />
                      <p>No follow-ups recorded for this lead.</p>
                      <button
                        onClick={() => handleOpenAddFollowUp(selectedLead)}
                        className="mt-2 text-electric-400 text-xs font-bold hover:underline"
                      >
                        Queue a follow-up touchpoint
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {leadFollowUps.map(fu => (
                        <div key={fu.id} className="p-4 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-800 space-y-2">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded font-mono font-bold uppercase text-[10px] bg-electric-500/10 text-electric-400 border border-electric-500/30">
                                {fu.type}
                              </span>
                              <strong className="text-slate-900 dark:text-white text-xs">{fu.purpose}</strong>
                            </div>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              fu.status === 'completed'
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                : fu.status === 'cancelled'
                                ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                                : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                            }`}>
                              {fu.status}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-slate-400">
                            <span className="font-mono">Due: {fu.scheduledDateTime}</span>
                            <span>Assigned Rep: <strong className="text-slate-300">{fu.employeeName}</strong></span>
                          </div>

                          {fu.notes && (
                            <p className="text-[11px] text-slate-400 italic">Notes: "{fu.notes}"</p>
                          )}

                          {fu.status === 'completed' && (
                            <div className="p-2.5 rounded-lg bg-navy-900 text-[11px] border border-slate-200 dark:border-navy-750">
                              <span className="text-emerald-400 font-bold block">Outcome: {fu.outcome?.toUpperCase()}</span>
                              {fu.discussionSummary && <p className="text-slate-300 mt-0.5">{fu.discussionSummary}</p>}
                              {fu.nextAction && <span className="text-electric-400 text-[10px] block mt-1">Next Action: {fu.nextAction}</span>}
                            </div>
                          )}

                          {fu.status !== 'completed' && fu.status !== 'cancelled' && (
                            <div className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-navy-800">
                              <button
                                onClick={() => {
                                  setActiveFollowUp(fu);
                                  setCompleteFollowUpData({
                                    outcome: 'connected',
                                    discussionSummary: '',
                                    customerFeedback: '',
                                    nextAction: ''
                                  });
                                  setShowCompleteFollowUpModal(true);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 font-bold text-xs"
                              >
                                Complete Follow-Up
                              </button>
                              <button
                                onClick={() => {
                                  setActiveFollowUp(fu);
                                  setRescheduleFollowUpData({
                                    scheduledDateTime: fu.scheduledDateTime,
                                    reason: ''
                                  });
                                  setShowRescheduleFollowUpModal(true);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-navy-800 text-slate-700 dark:text-slate-200 font-semibold text-xs"
                              >
                                Reschedule
                              </button>
                              <button
                                onClick={() => {
                                  const reason = prompt('Cancellation reason:');
                                  if (reason) cancelFollowUp(fu.id, reason);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 font-semibold text-xs ml-auto"
                              >
                                Cancel
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: NOTES */}
              {workspaceTab === 'notes' && (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-800 space-y-2">
                    <h4 className="font-bold text-slate-900 dark:text-white text-xs">
                      Add New Observation / Requirements Note
                    </h4>
                    <textarea
                      rows={3}
                      value={newNoteText}
                      onChange={e => setNewNoteText(e.target.value)}
                      placeholder="Type details regarding customer requirements, quotation changes, or property inspection notes..."
                      className="w-full p-2.5 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-electric-500"
                    />
                    <div className="flex justify-end">
                      <button
                        onClick={handleAddInteraction}
                        disabled={!newNoteText.trim()}
                        className="px-4 py-2 rounded-xl bg-electric-500 hover:bg-electric-400 text-navy-950 font-bold text-xs disabled:opacity-50"
                      >
                        Save Note to Lead
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-bold text-slate-900 dark:text-white text-xs">
                      Lead Notes Repository
                    </h4>
                    {selectedLead.notes && (
                      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-800">
                        <span className="text-[10px] text-electric-400 font-mono font-bold block mb-1">Lead Intake Note</span>
                        <p className="text-slate-700 dark:text-slate-300 text-xs">{selectedLead.notes}</p>
                      </div>
                    )}
                    {selectedLead.interactionHistory
                      ?.filter(int => int.type === 'note')
                      .map((n, i) => (
                        <div key={i} className="p-3.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-800">
                          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                            <span className="font-semibold text-slate-300">{n.agentName}</span>
                            <span className="font-mono">{n.date}</span>
                          </div>
                          <p className="text-slate-800 dark:text-slate-200 text-xs">{n.summary}</p>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* TAB 6: HISTORY */}
              {workspaceTab === 'history' && (
                <div className="space-y-4">
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs">
                    Complete Audit Trail & Modification History
                  </h4>

                  <div className="space-y-2.5">
                    {/* Creation record */}
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-800 flex items-start gap-2.5 text-xs">
                      <div className="w-6 h-6 rounded-lg bg-blue-500/15 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">
                        IN
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <strong className="text-slate-900 dark:text-white">Lead Created & Ingested</strong>
                          <span className="text-slate-400 font-mono">{selectedLead.createdAt}</span>
                        </div>
                        <p className="text-slate-400 text-[11px] mt-0.5">
                          Source: {selectedLead.source} • Intake Service: {selectedLead.serviceInterest}
                        </p>
                      </div>
                    </div>

                    {/* Assignment history */}
                    {selectedLead.assignmentHistory?.map((ah, i) => (
                      <div key={`ah-${i}`} className="p-3 rounded-xl bg-slate-50 dark:bg-navy-850 border border-purple-500/20 flex items-start gap-2.5 text-xs">
                        <div className="w-6 h-6 rounded-lg bg-purple-500/15 text-purple-400 border border-purple-500/30 flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">
                          AS
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <strong className="text-slate-900 dark:text-white">
                              Assigned to {ah.newEmployeeName}
                            </strong>
                            <span className="text-slate-400 font-mono">{new Date(ah.timestamp).toLocaleDateString()}</span>
                          </div>
                          <p className="text-slate-400 text-[11px] mt-0.5">
                            Previous: {ah.previousEmployeeName || 'Unassigned'} • Reason: {ah.reason || 'Assignment updated'} • By: {ah.assignedByName || 'Management'}
                          </p>
                        </div>
                      </div>
                    ))}

                    {/* Audit history of field edits */}
                    {selectedLead.auditHistory?.map((ae, i) => (
                      <div key={`ae-${i}`} className="p-3 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-800 flex items-start gap-2.5 text-xs">
                        <div className="w-6 h-6 rounded-lg bg-electric-500/15 text-electric-400 border border-electric-500/30 flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">
                          ED
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <strong className="text-slate-900 dark:text-white">
                              Field Modified: <span className="text-electric-400 capitalize">{ae.field}</span>
                            </strong>
                            <span className="text-slate-400 font-mono">{new Date(ae.timestamp).toLocaleDateString()}</span>
                          </div>
                          <p className="text-slate-400 text-[11px] mt-0.5">
                            Changed to <strong className="text-slate-200">"{String(ae.newValue)}"</strong> from "{String(ae.previousValue || '')}" by {ae.changedByName || 'Administrator'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* WORKSPACE FOOTER */}
            <div className="p-4 border-t border-slate-200 dark:border-navy-800 flex items-center justify-between bg-slate-50 dark:bg-navy-950">
              <button
                onClick={() => {
                  if (window.confirm(`Delete lead #${selectedLead.id}?`)) {
                    deleteLead(selectedLead.id);
                    setSelectedLead(null);
                  }
                }}
                className="text-xs text-rose-400 hover:text-rose-300 font-semibold cursor-pointer"
              >
                Delete Lead Permanently
              </button>
              <button
                onClick={() => setSelectedLead(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-navy-800 text-slate-800 dark:text-white font-semibold text-xs cursor-pointer"
              >
                Close Workspace
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* EDIT LEAD MODAL (FULL PRE-POPULATED DATABASE FORM)                         */}
      {/* ========================================================================= */}
      {showEditModal && selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/75 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 shadow-2xl p-6 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-navy-800">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-electric-400" />
                  Edit Lead Information
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Update database fields for lead #{selectedLead.id}. All existing fields are pre-populated.
                </p>
              </div>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditLead} className="space-y-4 mt-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Customer Name *</label>
                  <input
                    type="text"
                    required
                    value={editFormData.name}
                    onChange={e => setEditFormData({ ...editFormData, name: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none focus:border-electric-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Company / Property</label>
                  <input
                    type="text"
                    value={editFormData.company}
                    onChange={e => setEditFormData({ ...editFormData, company: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none focus:border-electric-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Phone Number *</label>
                  <input
                    type="text"
                    required
                    value={editFormData.phone}
                    onChange={e => setEditFormData({ ...editFormData, phone: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none focus:border-electric-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Email Address</label>
                  <input
                    type="email"
                    value={editFormData.email}
                    onChange={e => setEditFormData({ ...editFormData, email: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none focus:border-electric-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Address</label>
                <input
                  type="text"
                  value={editFormData.address}
                  onChange={e => setEditFormData({ ...editFormData, address: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none focus:border-electric-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Service Interest</label>
                  <select
                    value={editFormData.serviceId || editFormData.serviceName}
                    onChange={e => {
                      const sId = e.target.value;
                      const selected = activeServices.find(s => s.id === sId);
                      if (selected) {
                        setEditFormData({
                          ...editFormData,
                          serviceId: selected.id,
                          serviceName: selected.name,
                          serviceInterest: selected.name,
                          estimatedValue: selected.price
                        });
                      } else {
                        setEditFormData({
                          ...editFormData,
                          serviceId: '',
                          serviceName: sId,
                          serviceInterest: sId
                        });
                      }
                    }}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none"
                  >
                    {activeServices.map(srv => (
                      <option key={srv.id} value={srv.id}>
                        {srv.name} (₹{srv.price})
                      </option>
                    ))}
                    {!activeServices.some(s => s.id === editFormData.serviceId || s.name === editFormData.serviceName) && (
                      <option value={editFormData.serviceName}>{editFormData.serviceName}</option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Lead Source</label>
                  <select
                    value={editFormData.source}
                    onChange={e => setEditFormData({ ...editFormData, source: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="AI Inbound Call">AI Inbound Call</option>
                    <option value="Website Form">Website Form</option>
                    <option value="Meta Ads">Meta Ads</option>
                    <option value="Google Ads">Google Ads</option>
                    <option value="Referral">Referral</option>
                    <option value="Walk-in">Walk-in</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Status</label>
                  <select
                    value={editFormData.status}
                    onChange={e => setEditFormData({ ...editFormData, status: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none capitalize"
                  >
                    <option value="new">New</option>
                    <option value="qualified">Qualified</option>
                    <option value="assigned">Assigned</option>
                    <option value="unassigned">Unassigned</option>
                    <option value="converted">Converted</option>
                    <option value="lost">Lost</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Priority</label>
                  <select
                    value={editFormData.priority}
                    onChange={e => setEditFormData({ ...editFormData, priority: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none capitalize"
                  >
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Est. Value (₹)</label>
                  <input
                    type="number"
                    value={editFormData.estimatedValue}
                    onChange={e => setEditFormData({ ...editFormData, estimatedValue: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Assigned Representative</label>
                  <select
                    value={editFormData.assignedEmployeeId}
                    onChange={e => setEditFormData({ ...editFormData, assignedEmployeeId: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="">Leave Unassigned</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.team})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Contact Preference</label>
                  <select
                    value={editFormData.contactPreference}
                    onChange={e => setEditFormData({ ...editFormData, contactPreference: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none capitalize"
                  >
                    <option value="phone">Phone Call</option>
                    <option value="email">Email</option>
                    <option value="whatsapp">WhatsApp</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Customer Requirements (Comma Separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Pet safe detergents, Balcony pressure wash, Move-in deadline"
                  value={editFormData.customerRequirements}
                  onChange={e => setEditFormData({ ...editFormData, customerRequirements: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Internal Notes</label>
                <textarea
                  rows={3}
                  value={editFormData.notes}
                  onChange={e => setEditFormData({ ...editFormData, notes: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-2.5 border-t border-slate-200 dark:border-navy-800">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-electric-500 hover:bg-electric-400 text-navy-950 font-bold shadow-glow-sm cursor-pointer"
                >
                  Save Lead Updates
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* REASSIGN LEAD MODAL                                                       */}
      {/* ========================================================================= */}
      {showReassignModal && selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/75 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-navy-800">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-purple-400" />
                Assign / Reassign Lead
              </h3>
              <button onClick={() => setShowReassignModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReassignSubmit} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Select Employee *</label>
                <select
                  required
                  value={reassignData.employeeId}
                  onChange={e => setReassignData({ ...reassignData, employeeId: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="">Select an active sales representative...</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} — {emp.team} ({emp.assignedLeadsCount} active leads)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Reason for Reassignment</label>
                <input
                  type="text"
                  placeholder="e.g. Territory alignment, sales capacity adjustment, customer request"
                  value={reassignData.reason}
                  onChange={e => setReassignData({ ...reassignData, reason: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-200 dark:border-navy-800">
                <button
                  type="button"
                  onClick={() => setShowReassignModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-bold shadow-glow-sm"
                >
                  Confirm Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SCHEDULE MEETING MODAL (PRE-POPULATED WITH LEAD DATA)                      */}
      {/* ========================================================================= */}
      {showScheduleMeetingModal && selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/75 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 shadow-2xl p-6 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-navy-800">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Video className="w-4 h-4 text-blue-400" />
                Schedule Consultation / Site Audit
              </h3>
              <button onClick={() => setShowScheduleMeetingModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMeetingSubmit} className="space-y-3.5 mt-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Meeting Title *</label>
                <input
                  type="text"
                  required
                  value={meetingFormData.title}
                  onChange={e => setMeetingFormData({ ...meetingFormData, title: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Date & Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={meetingFormData.dateTime}
                    onChange={e => setMeetingFormData({ ...meetingFormData, dateTime: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Duration</label>
                  <select
                    value={meetingFormData.durationMinutes}
                    onChange={e => setMeetingFormData({ ...meetingFormData, durationMinutes: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value={15}>15 Minutes</option>
                    <option value={30}>30 Minutes</option>
                    <option value={45}>45 Minutes</option>
                    <option value={60}>60 Minutes</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Assigned Representative *</label>
                  <select
                    required
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
                  <label className="block text-slate-400 mb-1 font-medium">Meeting Type</label>
                  <select
                    value={meetingFormData.type}
                    onChange={e => setMeetingFormData({ ...meetingFormData, type: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="Virtual Video">Virtual Video</option>
                    <option value="In-person Site Audit">In-person Site Audit</option>
                    <option value="Phone Consultation">Phone Consultation</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Notes & Agenda</label>
                <textarea
                  rows={3}
                  value={meetingFormData.notes}
                  onChange={e => setMeetingFormData({ ...meetingFormData, notes: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-200 dark:border-navy-800">
                <button
                  type="button"
                  onClick={() => setShowScheduleMeetingModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-bold shadow-glow-sm"
                >
                  Schedule Meeting
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADD FOLLOW-UP MODAL (SCHEDULE NEW FOLLOW-UP)                               */}
      {/* ========================================================================= */}
      {showAddFollowUpModal && selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/75 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-navy-800">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-400" />
                Schedule Client Follow-Up
              </h3>
              <button onClick={() => setShowAddFollowUpModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddFollowUpSubmit} className="space-y-3.5 mt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Follow-Up Channel</label>
                  <select
                    value={followUpFormData.type}
                    onChange={e => setFollowUpFormData({ ...followUpFormData, type: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none uppercase"
                  >
                    <option value="call">Phone Call</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="email">Email</option>
                    <option value="meeting">Meeting</option>
                    <option value="visit">Site Visit</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Priority</label>
                  <select
                    value={followUpFormData.priority}
                    onChange={e => setFollowUpFormData({ ...followUpFormData, priority: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none capitalize"
                  >
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Scheduled Date & Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={followUpFormData.scheduledDateTime}
                    onChange={e => setFollowUpFormData({ ...followUpFormData, scheduledDateTime: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Assigned Representative</label>
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
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Follow-Up Objective / Purpose *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Confirm quotation approval, check marble sample preference"
                  value={followUpFormData.purpose}
                  onChange={e => setFollowUpFormData({ ...followUpFormData, purpose: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Preparation Notes</label>
                <textarea
                  rows={3}
                  value={followUpFormData.notes}
                  onChange={e => setFollowUpFormData({ ...followUpFormData, notes: e.target.value })}
                  placeholder="Additional context for the sales representative..."
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-200 dark:border-navy-800">
                <button
                  type="button"
                  onClick={() => setShowAddFollowUpModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-navy-950 font-bold shadow-glow-sm"
                >
                  Queue Follow-Up
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* COMPLETE FOLLOW-UP MODAL (RECORD OUTCOME & NEXT ACTION)                   */}
      {/* ========================================================================= */}
      {showCompleteFollowUpModal && activeFollowUp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/75 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-navy-800">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-emerald-400" />
                Complete Follow-Up Touchpoint
              </h3>
              <button onClick={() => setShowCompleteFollowUpModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCompleteFollowUpSubmit} className="space-y-3.5 mt-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Touchpoint Outcome *</label>
                <select
                  required
                  value={completeFollowUpData.outcome}
                  onChange={e => setCompleteFollowUpData({ ...completeFollowUpData, outcome: e.target.value as any })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none capitalize font-semibold"
                >
                  <option value="connected">Connected & Discussed</option>
                  <option value="interested">High Interest / Quote Requested</option>
                  <option value="callback_requested">Callback Requested</option>
                  <option value="busy">Busy / Reschedule Required</option>
                  <option value="not_interested">Not Interested</option>
                  <option value="converted">Deal Converted 🎉</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Discussion Summary *</label>
                <textarea
                  required
                  rows={3}
                  value={completeFollowUpData.discussionSummary}
                  onChange={e => setCompleteFollowUpData({ ...completeFollowUpData, discussionSummary: e.target.value })}
                  placeholder="Summary of conversation, key points discussed, objections resolved..."
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Next Action Item</label>
                <input
                  type="text"
                  placeholder="e.g. Send finalized contract tomorrow 10 AM"
                  value={completeFollowUpData.nextAction}
                  onChange={e => setCompleteFollowUpData({ ...completeFollowUpData, nextAction: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-200 dark:border-navy-800">
                <button
                  type="button"
                  onClick={() => setShowCompleteFollowUpModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-navy-950 font-bold shadow-glow-sm"
                >
                  Save Outcome
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* RESCHEDULE FOLLOW-UP MODAL                                                */}
      {/* ========================================================================= */}
      {showRescheduleFollowUpModal && activeFollowUp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/75 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-navy-800">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-amber-400" />
                Reschedule Follow-Up
              </h3>
              <button onClick={() => setShowRescheduleFollowUpModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRescheduleFollowUpSubmit} className="space-y-3.5 mt-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">New Date & Time *</label>
                <input
                  type="datetime-local"
                  required
                  value={rescheduleFollowUpData.scheduledDateTime}
                  onChange={e => setRescheduleFollowUpData({ ...rescheduleFollowUpData, scheduledDateTime: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Reschedule Reason</label>
                <input
                  type="text"
                  placeholder="e.g. Customer in meeting, requested callback after 4 PM"
                  value={rescheduleFollowUpData.reason}
                  onChange={e => setRescheduleFollowUpData({ ...rescheduleFollowUpData, reason: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-200 dark:border-navy-800">
                <button
                  type="button"
                  onClick={() => setShowRescheduleFollowUpModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-navy-950 font-bold shadow-glow-sm"
                >
                  Confirm Reschedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* COMPLETE MEETING MODAL                                                    */}
      {/* ========================================================================= */}
      {showCompleteMeetingModal && activeMeeting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/75 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-navy-800">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-emerald-400" />
                Conclude Meeting & Record Outcomes
              </h3>
              <button onClick={() => setShowCompleteMeetingModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCompleteMeetingSubmit} className="space-y-3.5 mt-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Meeting Outcome</label>
                <select
                  value={completeMeetingData.outcome}
                  onChange={e => setCompleteMeetingData({ ...completeMeetingData, outcome: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none capitalize font-bold"
                >
                  <option value="completed">Completed Successfully</option>
                  <option value="converted">Deal Converted 🎉</option>
                  <option value="no_show">Client No Show</option>
                  <option value="rescheduled">Rescheduled</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Discussion Summary *</label>
                <textarea
                  required
                  rows={3}
                  value={completeMeetingData.discussionSummary}
                  onChange={e => setCompleteMeetingData({ ...completeMeetingData, discussionSummary: e.target.value })}
                  placeholder="Key topics discussed, property specs reviewed, scope agreed upon..."
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Customer Objections</label>
                <input
                  type="text"
                  placeholder="e.g. Price sensitivity on chemical-free sanitization"
                  value={completeMeetingData.objections}
                  onChange={e => setCompleteMeetingData({ ...completeMeetingData, objections: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Agreed Action Items</label>
                <input
                  type="text"
                  placeholder="e.g. Send rate card, prepare 15% promotional quote"
                  value={completeMeetingData.agreedActions}
                  onChange={e => setCompleteMeetingData({ ...completeMeetingData, agreedActions: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-200 dark:border-navy-800">
                <button
                  type="button"
                  onClick={() => setShowCompleteMeetingModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-navy-950 font-bold shadow-glow-sm"
                >
                  Complete Consultation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* RESCHEDULE MEETING MODAL                                                  */}
      {/* ========================================================================= */}
      {showRescheduleMeetingModal && activeMeeting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/75 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-navy-800">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-amber-400" />
                Reschedule Meeting
              </h3>
              <button onClick={() => setShowRescheduleMeetingModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRescheduleMeetingSubmit} className="space-y-3.5 mt-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">New Date & Time *</label>
                <input
                  type="datetime-local"
                  required
                  value={rescheduleMeetingData.dateTime}
                  onChange={e => setRescheduleMeetingData({ ...rescheduleMeetingData, dateTime: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Reschedule Reason</label>
                <input
                  type="text"
                  placeholder="e.g. Client requested postponement"
                  value={rescheduleMeetingData.reason}
                  onChange={e => setRescheduleMeetingData({ ...rescheduleMeetingData, reason: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-200 dark:border-navy-800">
                <button
                  type="button"
                  onClick={() => setShowRescheduleMeetingModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-navy-950 font-bold shadow-glow-sm"
                >
                  Confirm Reschedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADD LEAD MODAL (FULL CREATION WORKFLOW)                                   */}
      {/* ========================================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 shadow-2xl p-6 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-navy-800">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Intake New Customer Lead
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Register new client, configure service requirements, and trigger AI propensity scoring.
                </p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLead} className="space-y-3.5 mt-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Customer Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Jennifer Lawrence"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none focus:border-electric-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Company Name (If Applicable)</label>
                  <input
                    type="text"
                    placeholder="e.g. Apex Property Holdings"
                    value={formData.company}
                    onChange={e => setFormData({ ...formData, company: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none focus:border-electric-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Phone Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98450 12891"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none focus:border-electric-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Email Address</label>
                  <input
                    type="email"
                    placeholder="client@example.com"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none focus:border-electric-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Service Address</label>
                <input
                  type="text"
                  placeholder="Street address, apartment/villa no., locality, city"
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none focus:border-electric-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Service Interest (Active Catalog) *</label>
                  <select
                    value={formData.serviceId || formData.serviceName}
                    onChange={e => {
                      const sId = e.target.value;
                      const selected = activeServices.find(s => s.id === sId);
                      if (selected) {
                        setFormData({
                          ...formData,
                          serviceId: selected.id,
                          serviceName: selected.name,
                          serviceInterest: selected.name,
                          estimatedValue: selected.price
                        });
                      } else {
                        setFormData({
                          ...formData,
                          serviceId: '',
                          serviceName: sId,
                          serviceInterest: sId
                        });
                      }
                    }}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none"
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
                  <label className="block text-slate-400 mb-1 font-medium">Lead Source</label>
                  <select
                    value={formData.source}
                    onChange={e => setFormData({ ...formData, source: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="AI Inbound Call">AI Inbound Call</option>
                    <option value="Website Form">Website Form</option>
                    <option value="Meta Ads">Meta Ads</option>
                    <option value="Google Ads">Google Ads</option>
                    <option value="Referral">Referral</option>
                    <option value="Walk-in">Walk-in</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={e => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none capitalize"
                  >
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Estimated Value (₹)</label>
                  <input
                    type="number"
                    value={formData.estimatedValue}
                    onChange={e => setFormData({ ...formData, estimatedValue: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Assign Sales Rep *</label>
                  <select
                    value={formData.assignedEmployeeId}
                    onChange={e => setFormData({ ...formData, assignedEmployeeId: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none"
                  >
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.team})
                      </option>
                    ))}
                    <option value="">Leave Unassigned</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Contact Preference</label>
                  <select
                    value={formData.contactPreference}
                    onChange={e => setFormData({ ...formData, contactPreference: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none capitalize"
                  >
                    <option value="phone">Phone Call</option>
                    <option value="email">Email</option>
                    <option value="whatsapp">WhatsApp</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Preferred Timeline</label>
                  <select
                    value={formData.preferredTimeline}
                    onChange={e => setFormData({ ...formData, preferredTimeline: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="Immediate / Today">Immediate / Today</option>
                    <option value="Within 48 hours">Within 48 hours</option>
                    <option value="This Weekend">This Weekend</option>
                    <option value="Next Week">Next Week</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Customer Requirements (Comma Separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Deep sanitization, HEPA air scrub, Balcony pressure wash"
                  value={formData.customerRequirements}
                  onChange={e => setFormData({ ...formData, customerRequirements: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Internal Notes</label>
                <textarea
                  rows={2}
                  placeholder="Initial observations or special customer notes..."
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-2.5 border-t border-slate-200 dark:border-navy-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-electric-500 hover:bg-electric-400 text-navy-950 font-bold shadow-glow-sm cursor-pointer"
                >
                  Create & AI Score Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADD INTERACTION NOTE MODAL                                                */}
      {/* ========================================================================= */}
      {showNoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 shadow-2xl p-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              Add Interaction Note
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Log client conversation, site audit notes, or pricing adjustments.
            </p>
            <textarea
              rows={4}
              value={newNoteText}
              onChange={e => setNewNoteText(e.target.value)}
              placeholder="e.g. Discussed 10% discount on 2-year recurring contract. Customer requested COI."
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-electric-500"
            />
            <div className="flex items-center justify-end gap-2.5 mt-4">
              <button
                onClick={() => setShowNoteModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleAddInteraction}
                disabled={!newNoteText.trim()}
                className="px-4 py-2 rounded-xl bg-electric-500 hover:bg-electric-400 text-navy-950 text-xs font-bold shadow-glow-sm disabled:opacity-50"
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* IMPORT LEADS MODAL                                                        */}
      {/* ========================================================================= */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 shadow-2xl p-6 text-center">
            <Upload className="w-10 h-10 text-electric-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Import Leads from CSV / Excel
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              Bulk upload leads from Facebook Ads, Google Ads, or property management lists.
            </p>
            <input
              type="file"
              ref={fileInputRef}
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 dark:border-navy-700 rounded-2xl p-8 mb-4 hover:border-electric-500 transition-colors cursor-pointer group"
            >
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 group-hover:text-electric-400 transition-colors">
                Click to browse and upload CSV file
              </p>
              <p className="text-[11px] text-slate-400 mt-1">Accepts standard Lead CSV exports</p>
            </div>
            <div className="flex items-center justify-end gap-2.5">
              <button
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
