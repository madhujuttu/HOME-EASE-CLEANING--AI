import React, { useState, useEffect } from 'react';
import { useCrm } from '../../context/CrmContext';
import { Lead, LeadStatus, Priority } from '../../types';
import {
  UserCheck,
  Search,
  Phone,
  Mail,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  Clock,
  MapPin,
  X,
  MessageSquare,
  DollarSign,
  Trash2,
  Plus,
  Building,
  Calendar,
  Tag,
  FileText
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export const SalesLeads: React.FC = () => {
  const { leads, services, employees, currentUser, addLead, updateLead, convertLead, deleteLead, showToast } = useCrm();
  const navigate = useNavigate();
  const location = useLocation();

  const matchingEmp = employees.find(e =>
    e.id === currentUser.id ||
    e.email?.toLowerCase() === currentUser.email?.toLowerCase() ||
    (currentUser.name && e.name?.toLowerCase().trim() === currentUser.name.toLowerCase().trim())
  );

  // Representative's personal assigned leads (filtered strictly by authenticated employee account or created by them)
  const myLeads = leads.filter(l => {
    if (l.createdBy === currentUser.id) return true;
    if (!l.assignedEmployeeId && !l.assignedEmployeeName) return false;
    const empId = String(l.assignedEmployeeId);
    if (empId === currentUser.id || empId === (currentUser as any).employeeId || empId === 'emp-1') return true;
    if (currentUser.name && l.assignedEmployeeName && l.assignedEmployeeName.toLowerCase().trim() === currentUser.name.toLowerCase().trim()) return true;
    if (matchingEmp) {
      if (empId === matchingEmp.id || empId === (matchingEmp as any)._id || empId === (matchingEmp as any).employeeId) return true;
      if (l.assignedEmployeeName && matchingEmp.name && l.assignedEmployeeName.toLowerCase().trim() === matchingEmp.name.toLowerCase().trim()) return true;
    }
    return false;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [newNote, setNewNote] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Check URL query parameters for ?action=new
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('action') === 'new' || params.get('action') === 'add') {
      setShowAddModal(true);
    }
  }, [location.search]);

  // Form State for Add Lead
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    phone: '',
    email: '',
    address: '',
    serviceId: '',
    serviceName: '',
    serviceInterest: 'Ultra Deep Villa Sanitization',
    source: 'AI Inbound Call' as Lead['source'],
    priority: 'high' as Priority,
    customerRequirements: '',
    contactPreference: 'phone' as 'phone' | 'email' | 'whatsapp',
    preferredTimeline: 'Within 48 hours',
    notes: '',
    estimatedValue: 349,
    nextFollowUp: new Date(Date.now() + 86400000).toISOString().slice(0, 16).replace('T', ' ')
  });

  const activeServices = services.filter(s => s.status === 'active');

  const filtered = myLeads.filter(l => {
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return (
        l.name.toLowerCase().includes(q) ||
        l.phone.includes(q) ||
        (l.serviceInterest && l.serviceInterest.toLowerCase().includes(q)) ||
        (l.serviceName && l.serviceName.toLowerCase().includes(q)) ||
        (l.company && l.company.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleAddLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      showToast('Validation Error', 'Customer Name and Phone Number are required.', 'error');
      return;
    }

    const assignedEmpId = matchingEmp?.id || (currentUser as any).employeeId || currentUser.id || 'emp-1';
    const assignedEmpName = matchingEmp?.name || currentUser.name || 'Marcus Vance';

    const success = await addLead({
      name: formData.name.trim(),
      company: formData.company.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim() || `${formData.name.toLowerCase().replace(/\s+/g, '.')}@client.com`,
      address: formData.address.trim() || 'Address on file',
      serviceId: formData.serviceId || undefined,
      serviceName: formData.serviceName || formData.serviceInterest || 'Ultra Deep Villa Sanitization',
      serviceInterest: formData.serviceInterest || formData.serviceName || 'Ultra Deep Villa Sanitization',
      services: formData.serviceName ? [formData.serviceName] : ['Ultra Deep Villa Sanitization'],
      servicePriceSnapshot: Number(formData.estimatedValue) || 349,
      estimatedValue: Number(formData.estimatedValue) || 349,
      source: formData.source || 'AI Inbound Call',
      priority: formData.priority || 'high',
      customerRequirements: formData.customerRequirements ? [formData.customerRequirements] : [],
      contactPreference: formData.contactPreference,
      preferredTimeline: formData.preferredTimeline,
      notes: formData.notes,
      assignedEmployeeId: assignedEmpId,
      assignedEmployeeName: assignedEmpName,
      status: 'assigned',
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
        serviceInterest: 'Ultra Deep Villa Sanitization',
        source: 'AI Inbound Call',
        priority: 'high',
        customerRequirements: '',
        contactPreference: 'phone',
        preferredTimeline: 'Within 48 hours',
        notes: '',
        estimatedValue: 349,
        nextFollowUp: new Date(Date.now() + 86400000).toISOString().slice(0, 16).replace('T', ' ')
      });
    }
  };

  const handleAddNote = () => {
    if (!selectedLead || !newNote.trim()) return;
    const int = {
      id: 'int-' + Math.random().toString(36).substring(2, 7),
      type: 'note' as const,
      date: new Date().toISOString().slice(0, 16).replace('T', ' '),
      agentName: `${currentUser.name} (Sales Rep)`,
      summary: newNote,
      sentiment: 'positive' as const
    };
    const updated = {
      ...selectedLead,
      interactionHistory: [int, ...(selectedLead.interactionHistory || [])]
    };
    updateLead(selectedLead.id, { interactionHistory: updated.interactionHistory });
    setSelectedLead(updated);
    setNewNote('');
    showToast('Interaction Logged', 'CRM note saved.', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            My Sales Pipeline & Leads
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-electric-500/20 text-electric-400 font-mono font-bold">
              {filtered.length} leads assigned
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Prioritized lead follow-ups, AI conversion scores, and deal closing actions.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-electric-500 hover:bg-electric-400 text-navy-950 font-bold text-xs shadow-glow transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Lead
        </button>
      </div>

      {/* Search Toolbar */}
      <div className="p-3.5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by customer name, phone or service interest..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full bg-transparent border-none text-slate-900 dark:text-white placeholder-slate-400 text-xs focus:outline-none"
        />
      </div>

      {/* Leads Table */}
      <div className="rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-navy-800 bg-slate-50/70 dark:bg-navy-950/70 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
                <th className="py-3.5 px-4 font-semibold">Lead Contact</th>
                <th className="py-3.5 px-4 font-semibold">Service Package</th>
                <th className="py-3.5 px-4 font-semibold">AI Lead Score</th>
                <th className="py-3.5 px-4 font-semibold">Status / Actions</th>
                <th className="py-3.5 px-4 font-semibold">Next Follow-up</th>
                <th className="py-3.5 px-4 font-semibold text-right">Quick Dial</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-navy-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <p className="font-semibold text-slate-600 dark:text-slate-300 text-sm">No leads assigned yet</p>
                    <p className="text-xs text-slate-400 mt-1 mb-4">Click "Add Lead" to register a client directly into your active sales pipeline.</p>
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-electric-500 hover:bg-electric-400 text-navy-950 font-bold text-xs cursor-pointer shadow-sm"
                    >
                      <Plus className="w-4 h-4" /> Add Lead Now
                    </button>
                  </td>
                </tr>
              ) : (
                filtered.map(lead => (
                <tr
                  key={lead.id}
                  onClick={() => setSelectedLead(lead)}
                  className="hover:bg-slate-50 dark:hover:bg-navy-850/60 cursor-pointer transition-colors group"
                >
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-slate-900 dark:text-white group-hover:text-electric-400 transition-colors">
                      {lead.name}
                    </p>
                    <p className="text-[11px] text-slate-400 font-mono">
                      {lead.phone} {lead.company ? `• ${lead.company}` : ''}
                    </p>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-slate-800 dark:text-slate-200 block truncate max-w-[180px]">
                      {lead.serviceInterest}
                    </span>
                    <span className="font-mono text-electric-400 text-[11px] font-bold">
                      ₹{lead.estimatedValue}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-extrabold text-electric-400 text-sm">
                        {lead.aiScore}
                      </span>
                      <span className="text-[11px] text-slate-400">({lead.aiConversionProb}% Win Prob)</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <select
                      value={lead.status}
                      onClick={e => e.stopPropagation()}
                      onChange={e => {
                        const newSt = e.target.value as LeadStatus;
                        updateLead(lead.id, { status: newSt });
                        if (newSt === 'converted') convertLead(lead.id);
                      }}
                      className="p-1.5 rounded-lg bg-slate-100 dark:bg-navy-850 border border-slate-300 dark:border-navy-750 text-slate-800 dark:text-slate-200 text-xs font-semibold capitalize"
                    >
                      <option value="new">New</option>
                      <option value="qualified">Qualified</option>
                      <option value="assigned">Assigned</option>
                      <option value="converted">Convert Deal</option>
                      <option value="lost">Lost</option>
                    </select>
                  </td>

                  <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400 text-[11px]">
                    {lead.nextFollowUp}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          deleteLead(lead.id);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="Delete Lead"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          navigate('/sales/ai-calling');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-electric-500 hover:bg-electric-400 text-navy-950 font-bold text-xs inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Phone className="w-3.5 h-3.5" /> Call
                      </button>
                    </div>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: ADD LEAD (EMPLOYEE INTAKE) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 shadow-2xl p-6 custom-scrollbar">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-navy-800 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Add New Lead to My Pipeline
                </h3>
                <p className="text-xs text-slate-400">
                  Direct client intake. The lead will be assigned to you ({currentUser.name}) and permanently saved in MongoDB.
                </p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddLeadSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                    Client Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ananya Deshmukh"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                    Company / Organization (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Prestige Estates Villa"
                    value={formData.company}
                    onChange={e => setFormData({ ...formData, company: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+1 (555) 987-6543"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="client@example.com"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                  Service / Property Address
                </label>
                <input
                  type="text"
                  placeholder="e.g. Villa 42, Palm Meadows, Whitefield"
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                    Service Package Interest
                  </label>
                  <select
                    value={formData.serviceId || formData.serviceName}
                    onChange={e => {
                      const val = e.target.value;
                      const selected = activeServices.find(s => s.id === val || s.name === val);
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
                          serviceName: val,
                          serviceInterest: val
                        });
                      }
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="Ultra Deep Villa Sanitization">Ultra Deep Villa Sanitization</option>
                    {activeServices.map(srv => (
                      <option key={srv.id} value={srv.id}>
                        {srv.name} (₹{srv.price})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                    Estimated Deal Value (₹)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.estimatedValue}
                    onChange={e => setFormData({ ...formData, estimatedValue: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={e => setFormData({ ...formData, priority: e.target.value as Priority })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                    Lead Source
                  </label>
                  <select
                    value={formData.source}
                    onChange={e => setFormData({ ...formData, source: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="AI Inbound Call">Direct Phone / AI Inbound Call</option>
                    <option value="Walk-in">In-Person Walk-in</option>
                    <option value="Referral">Client Referral</option>
                    <option value="Website Form">Website Form</option>
                    <option value="Google Ads">Google Ads Campaign</option>
                    <option value="Meta Ads">Meta / Social Ads</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                    Contact Preference
                  </label>
                  <select
                    value={formData.contactPreference}
                    onChange={e => setFormData({ ...formData, contactPreference: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="phone">Phone Call</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="email">Email</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                    Preferred Timeline
                  </label>
                  <select
                    value={formData.preferredTimeline}
                    onChange={e => setFormData({ ...formData, preferredTimeline: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="Immediate">Immediate (Today)</option>
                    <option value="Within 48 hours">Within 48 hours</option>
                    <option value="This week">This weekend</option>
                    <option value="Next week">Next week</option>
                    <option value="Next month">Next month</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                    First Follow-Up Schedule
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.nextFollowUp}
                    onChange={e => setFormData({ ...formData, nextFollowUp: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                  Customer Requirements & Discussion Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. 5,000 sqft villa, requested HEPA sanitization and marble polish demo."
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value, customerRequirements: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-slate-900 dark:text-white focus:outline-none"
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
                  className="px-5 py-2 rounded-xl bg-electric-500 hover:bg-electric-400 text-navy-950 font-bold cursor-pointer shadow-glow-sm"
                >
                  Save Lead & Add to My Pipeline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LEAD DETAILS DRAWER */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex justify-end bg-navy-950/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg h-full bg-white dark:bg-navy-900 border-l border-slate-200 dark:border-navy-700 shadow-2xl flex flex-col overflow-hidden">
            <div className="p-5 border-b border-slate-200 dark:border-navy-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  {selectedLead.name}
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">#{selectedLead.id} • Value: ₹{selectedLead.estimatedValue}</p>
              </div>
              <button onClick={() => setSelectedLead(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar text-xs">
              {/* Quick Conversion Action */}
              <button
                onClick={() => {
                  convertLead(selectedLead.id);
                  setSelectedLead(null);
                }}
                className="w-full py-2.5 rounded-xl bg-electric-500 hover:bg-electric-400 text-navy-950 font-bold text-xs shadow-glow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                Close Deal & Convert to Customer
              </button>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-800 space-y-1.5">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span className="font-mono text-slate-800 dark:text-slate-200">{selectedLead.phone}</span>
                </div>
                {selectedLead.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-800 dark:text-slate-200">{selectedLead.email}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-800 dark:text-slate-200">{selectedLead.address}</span>
                </div>
                {selectedLead.company && (
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-800 dark:text-slate-200">{selectedLead.company}</span>
                  </div>
                )}
              </div>

              {/* Add Note */}
              <div className="space-y-2">
                <label className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] font-mono">
                  Add Conversation Note
                </label>
                <textarea
                  rows={3}
                  value={newNote}
                  onChange={e => setNewNote(e.target.value)}
                  placeholder="Record customer comments, quote requested, objections..."
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none"
                />
                <button
                  onClick={handleAddNote}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-200 dark:bg-navy-800 text-slate-800 dark:text-white font-semibold text-xs cursor-pointer"
                >
                  Save Note
                </button>
              </div>

              {/* Interaction History */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] font-mono">
                  Interaction History
                </h4>
                {(selectedLead.interactionHistory || []).map((int, i) => (
                  <div key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-800 text-xs">
                    <div className="flex justify-between font-mono text-[10px] text-slate-400 mb-1">
                      <span className="text-electric-400 uppercase font-bold">{int.type}</span>
                      <span>{int.date}</span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300">{int.summary}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-navy-800 flex justify-end bg-slate-50 dark:bg-navy-950">
              <button
                onClick={() => setSelectedLead(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-navy-800 text-slate-800 dark:text-white font-semibold text-xs cursor-pointer"
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
