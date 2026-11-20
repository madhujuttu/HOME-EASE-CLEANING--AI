import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import { Provider } from '../../types';
import {
  ShieldCheck,
  Plus,
  Search,
  Star,
  MapPin,
  Phone,
  Mail,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Briefcase,
  UserCheck,
  X,
  Award
} from 'lucide-react';

export const ProviderManagement: React.FC = () => {
  const { providers, addProvider, updateProvider, showToast } = useCrm();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    location: 'San Francisco Bay Area',
    skills: 'Deep Sanitization, High-Pressure Steam, Upholstery Care',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=256'
  });

  const filteredProviders = providers.filter(p => {
    if (statusFilter !== 'all' && p.verificationStatus !== statusFilter) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const match =
        p.name.toLowerCase().includes(q) ||
        p.phone.includes(q) ||
        p.location.toLowerCase().includes(q) ||
        p.skills.some(s => s.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  const handleRegisterProvider = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      showToast('Validation Error', 'Provider name and phone are required.', 'error');
      return;
    }

    addProvider({
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      location: formData.location,
      skills: formData.skills.split(',').map(s => s.trim()),
      avatar: formData.avatar,
      verificationStatus: 'verified'
    });

    setShowAddModal(false);
    setFormData({
      name: '',
      phone: '',
      email: '',
      location: 'San Francisco Bay Area',
      skills: 'Deep Sanitization, High-Pressure Steam, Upholstery Care',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=256'
    });
  };

  const getVerificationBadge = (v: Provider['verificationStatus']) => {
    switch (v) {
      case 'verified': return 'bg-electric-500/15 text-electric-400 border-electric-500/30';
      case 'pending': return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'rejected': return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
    }
  };

  const getAvailabilityBadge = (a: Provider['availabilityStatus']) => {
    switch (a) {
      case 'available': return 'bg-electric-400';
      case 'on_job': return 'bg-blue-400';
      case 'off_duty': return 'bg-slate-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            Service Provider & Technician Fleet
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-electric-500/20 text-electric-400 font-mono font-bold">
              {filteredProviders.length} Specialists
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Certified sanitization technicians, background verifications, and real-time field dispatch.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-electric-500 hover:bg-electric-400 text-navy-950 font-bold text-xs shadow-glow-sm transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Register New Provider
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3.5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search provider by name, skill, location or contact..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white placeholder-slate-400 text-xs focus:outline-none focus:border-electric-500/50"
          />
        </div>

        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-700 dark:text-slate-200 focus:outline-none w-full sm:w-auto"
        >
          <option value="all">Verification: All</option>
          <option value="verified">Verified Only</option>
          <option value="pending">Pending Review</option>
        </select>
      </div>

      {/* Providers Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredProviders.map(prov => (
          <div
            key={prov.id}
            onClick={() => setSelectedProvider(prov)}
            className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm hover:border-electric-500/40 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="relative">
                    <img
                      src={prov.avatar}
                      alt={prov.name}
                      className="w-12 h-12 rounded-2xl object-cover border-2 border-electric-500/30 group-hover:border-electric-400 transition-colors"
                    />
                    <span
                      title={`Status: ${prov.availabilityStatus}`}
                      className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-navy-900 ${getAvailabilityBadge(prov.availabilityStatus)}`}
                    />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-electric-400 transition-colors">
                      {prov.name}
                    </h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-500" /> {prov.location}
                    </p>
                  </div>
                </div>

                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${getVerificationBadge(prov.verificationStatus)}`}>
                  {prov.verificationStatus}
                </span>
              </div>

              {/* Skills Tags */}
              <div className="flex flex-wrap gap-1.5 mt-3">
                {prov.skills.map((skill, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-navy-800 text-[11px] text-slate-600 dark:text-slate-300 font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-navy-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1 font-mono text-amber-400 font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span>{prov.rating}</span>
                <span className="text-slate-400 font-normal">({prov.jobsCompleted} jobs)</span>
              </div>

              <span className="text-[11px] font-mono font-semibold text-slate-400">
                {prov.activeJobs > 0 ? `${prov.activeJobs} Job Active` : 'Available for Dispatch'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* REGISTER PROVIDER MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-navy-800">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Register Verified Specialist
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterProvider} className="space-y-3.5 mt-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Technician Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mateo Ortiz"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none focus:border-electric-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Phone Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="+1 (555) 000-0000"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Email Address</label>
                  <input
                    type="email"
                    placeholder="mateo@homeeasecleaning.pro"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Assigned Hub / Territory</label>
                <input
                  type="text"
                  placeholder="e.g. Marina Bay / Downtown"
                  value={formData.location}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Skills & Certifications (comma separated)</label>
                <input
                  type="text"
                  value={formData.skills}
                  onChange={e => setFormData({ ...formData, skills: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-2.5 border-t border-slate-200 dark:border-navy-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-electric-500 hover:bg-electric-400 text-navy-950 font-bold shadow-glow-sm"
                >
                  Save & Verify Provider
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* PROVIDER DETAILS DRAWER */}
      {selectedProvider && (
        <div className="fixed inset-0 z-50 flex justify-end bg-navy-950/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg h-full bg-white dark:bg-navy-900 border-l border-slate-200 dark:border-navy-700 shadow-2xl flex flex-col overflow-hidden">
            <div className="p-5 border-b border-slate-200 dark:border-navy-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={selectedProvider.avatar}
                  alt={selectedProvider.name}
                  className="w-12 h-12 rounded-2xl object-cover border-2 border-electric-500/40"
                />
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    {selectedProvider.name}
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${getVerificationBadge(selectedProvider.verificationStatus)}`}>
                      {selectedProvider.verificationStatus}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    #{selectedProvider.id} • {selectedProvider.location}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedProvider(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-100 dark:hover:bg-navy-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar text-xs">
              {/* Quick Actions Bar */}
              <div className="grid grid-cols-2 gap-2.5">
                <a
                  href={`tel:${selectedProvider.phone}`}
                  className="py-2.5 px-3 rounded-xl bg-electric-500 hover:bg-electric-400 text-navy-950 font-bold text-center flex items-center justify-center gap-1.5 shadow-sm transition-all"
                >
                  <Phone className="w-3.5 h-3.5" /> Call Technician
                </a>
                <a
                  href={`mailto:${selectedProvider.email || 'support@homeeaseguru.com'}`}
                  className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-navy-800 text-slate-800 dark:text-white hover:text-electric-400 font-semibold text-center flex items-center justify-center gap-1.5 transition-all"
                >
                  <Mail className="w-3.5 h-3.5" /> Send Dispatch Email
                </a>
              </div>

              {/* Verification & Credentialing Action */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white uppercase font-mono text-[11px]">
                    Verification Status
                  </span>
                  <button
                    onClick={() => {
                      const newStatus = selectedProvider.verificationStatus === 'verified' ? 'pending' : 'verified';
                      updateProvider(selectedProvider.id, { verificationStatus: newStatus });
                      setSelectedProvider({ ...selectedProvider, verificationStatus: newStatus });
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      selectedProvider.verificationStatus === 'verified'
                        ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400'
                        : 'bg-electric-500 hover:bg-electric-400 text-navy-950 shadow-glow-sm'
                    }`}
                  >
                    {selectedProvider.verificationStatus === 'verified' ? 'Revoke Verification' : 'Approve & Verify Credentials'}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">
                  Background check verified, valid liability insurance COI on file, and hospital-grade certification active.
                </p>
              </div>

              {/* Availability Status Toggles */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-800 space-y-2.5">
                <span className="font-bold text-slate-900 dark:text-white uppercase font-mono text-[11px]">
                  Dispatch Availability
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {(['available', 'on_job', 'off_duty'] as const).map(st => (
                    <button
                      key={st}
                      onClick={() => {
                        updateProvider(selectedProvider.id, { availabilityStatus: st });
                        setSelectedProvider({ ...selectedProvider, availabilityStatus: st });
                      }}
                      className={`py-2 px-2 rounded-xl text-xs font-bold capitalize transition-all ${
                        selectedProvider.availabilityStatus === st
                          ? 'bg-electric-500 text-navy-950 shadow-glow-sm'
                          : 'bg-white dark:bg-navy-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-navy-800 hover:text-white'
                      }`}
                    >
                      {st.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-800 text-center">
                  <span className="text-[10px] text-slate-400 font-mono uppercase">Rating</span>
                  <p className="text-base font-bold text-amber-400 font-mono mt-0.5 flex items-center justify-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400" /> {selectedProvider.rating}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-800 text-center">
                  <span className="text-[10px] text-slate-400 font-mono uppercase">Completed Jobs</span>
                  <p className="text-base font-bold text-electric-400 font-mono mt-0.5">
                    {selectedProvider.jobsCompleted}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-800 text-center">
                  <span className="text-[10px] text-slate-400 font-mono uppercase">Active Jobs</span>
                  <p className="text-base font-bold text-cyan-400 font-mono mt-0.5">
                    {selectedProvider.activeJobs}
                  </p>
                </div>
              </div>

              {/* Certified Skills */}
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white uppercase font-mono text-[11px] mb-2">
                  Skills & Equipment Proficiencies
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedProvider.skills.map((s, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-electric-500/10 border border-electric-500/20 text-electric-400 text-xs font-medium"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-navy-800 flex justify-end bg-slate-50 dark:bg-navy-950">
              <button
                onClick={() => setSelectedProvider(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-navy-800 text-slate-800 dark:text-white font-semibold text-xs"
              >
                Close Provider View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
