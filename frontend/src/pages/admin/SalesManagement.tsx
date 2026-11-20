import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import { Employee } from '../../types';
import {
  Briefcase,
  Users,
  TrendingUp,
  Target,
  Award,
  Phone,
  Mail,
  UserPlus,
  ShieldAlert,
  CheckCircle2,
  ChevronRight,
  X,
  Sparkles,
  BarChart2,
  UserCheck,
  Lock
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

export const SalesManagement: React.FC = () => {
  const { employees, leads, assignLead, addEmployee, showToast } = useCrm();

  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showAllocateModal, setShowAllocateModal] = useState(false);
  const [leadToAllocate, setLeadToAllocate] = useState<string>(leads[0]?.id || '');
  const [targetRep, setTargetRep] = useState<string>(employees[0]?.id || '');

  // Provisioning state
  const [showCreateEmpModal, setShowCreateEmpModal] = useState(false);
  const [newEmpName, setNewEmpName] = useState('');
  const [newEmpEmail, setNewEmpEmail] = useState('');
  const [newEmpPhone, setNewEmpPhone] = useState('');
  const [newEmpPassword, setNewEmpPassword] = useState('password123');
  const [newEmpRole, setNewEmpRole] = useState('Sales Executive');
  const [newEmpTeam, setNewEmpTeam] = useState('Sales Team Alpha');
  const [newEmpQuota, setNewEmpQuota] = useState(25000);
  const [newEmpAvatar, setNewEmpAvatar] = useState('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256');
  const [isSubmittingEmp, setIsSubmittingEmp] = useState(false);

  // Calculate team aggregate performance metrics
  const totalTargetRevenue = employees.reduce((sum, e) => sum + e.targetRevenue, 0);
  const totalAchievedRevenue = employees.reduce((sum, e) => sum + e.achievedRevenue, 0);
  const totalClosedDeals = employees.reduce((sum, e) => sum + e.closedDeals, 0);
  const avgTeamConversion = (employees.reduce((sum, e) => sum + e.conversionRate, 0) / employees.length).toFixed(1);

  const chartData = employees.map(e => ({
    name: e.name.split(' ')[0],
    Target: e.targetRevenue,
    Achieved: e.achievedRevenue,
    Deals: e.closedDeals
  }));

  const handleAllocateLead = () => {
    if (!leadToAllocate || !targetRep) return;
    assignLead(leadToAllocate, targetRep);
    setShowAllocateModal(false);
    showToast('Lead Allocation Successful', 'Assigned lead to selected sales executive.', 'success');
  };

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmpName || !newEmpEmail) {
      showToast('Missing Fields', 'Please enter employee name and email.', 'error');
      return;
    }
    setIsSubmittingEmp(true);
    const success = await addEmployee({
      name: newEmpName,
      email: newEmpEmail,
      phone: newEmpPhone || '+1 (555) 000-0000',
      password: newEmpPassword || 'password123',
      role: newEmpRole,
      team: newEmpTeam,
      targetRevenue: Number(newEmpQuota) || 25000,
      avatar: newEmpAvatar
    });
    setIsSubmittingEmp(false);
    if (success) {
      setShowCreateEmpModal(false);
      setNewEmpName('');
      setNewEmpEmail('');
      setNewEmpPhone('');
      setNewEmpPassword('password123');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            Sales Force & Team Operations
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-electric-500/20 text-electric-400 font-mono font-bold">
              {employees.length} Executives
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Quota tracking, automated lead allocation, conversion pipelines, and sales coaching insights.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setShowCreateEmpModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-electric-500 hover:bg-electric-400 text-navy-950 font-bold text-xs shadow-glow-sm transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            Provision New Employee
          </button>
          <button
            onClick={() => setShowAllocateModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 dark:hover:bg-navy-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition-all border border-slate-200 dark:border-navy-700 cursor-pointer"
          >
            <UserCheck className="w-4 h-4" />
            Lead Allocation Engine
          </button>
        </div>
      </div>

      {/* Team Aggregates Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Team Target Revenue</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-1">
            ₹{totalTargetRevenue.toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-400">Total Monthly Quota</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Achieved Revenue</span>
          <p className="text-2xl font-black text-electric-400 font-mono mt-1">
            ₹{totalAchievedRevenue.toLocaleString()}
          </p>
          <span className="text-[11px] text-electric-400 font-mono font-semibold">
            {Math.round((totalAchievedRevenue / totalTargetRevenue) * 100)}% Quota Attainment
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Closed Deals Won</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-1">
            {totalClosedDeals} Deals
          </p>
          <span className="text-[11px] text-slate-400">Across residential & commercial</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Average Conv Rate</span>
          <p className="text-2xl font-black text-amber-400 font-mono mt-1">
            {avgTeamConversion}%
          </p>
          <span className="text-[11px] text-electric-400 font-mono font-semibold">+8.4% vs Industry</span>
        </div>
      </div>

      {/* Target vs Achieved Chart */}
      <div className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Revenue Performance vs Target Quota</h3>
            <p className="text-xs text-slate-400">Direct comparison across sales managers & executives</p>
          </div>
          <span className="text-xs font-mono text-electric-400 px-2 py-0.5 rounded bg-electric-500/10 border border-electric-500/20 font-bold">
            Live Rep Comparison
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" opacity={0.3} />
              <XAxis dataKey="name" stroke="#64748B" fontSize={11} />
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
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              <Bar dataKey="Target" name="Monthly Target (₹)" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Achieved" name="Achieved Revenue (₹)" fill="#00F59B" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sales Employee Directory Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {employees.map(emp => {
          const quotaPercent = Math.min(100, Math.round((emp.achievedRevenue / emp.targetRevenue) * 100));
          return (
            <div
              key={emp.id}
              onClick={() => setSelectedEmployee(emp)}
              className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm hover:border-electric-500/40 transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3.5">
                  <img
                    src={emp.avatar}
                    alt={emp.name}
                    className="w-12 h-12 rounded-2xl object-cover border-2 border-electric-500/30 group-hover:border-electric-400 transition-colors"
                  />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-electric-400 transition-colors">
                      {emp.name}
                    </h3>
                    <p className="text-xs text-slate-400">{emp.role} • {emp.team}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`w-2 h-2 rounded-full ${emp.status === 'active' ? 'bg-electric-400' : 'bg-amber-400'}`} />
                      <span className="text-[10px] uppercase font-mono text-slate-400">{emp.status.replace('_', ' ')}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-base font-black font-mono text-electric-400">
                    ₹{emp.achievedRevenue.toLocaleString()}
                  </span>
                  <p className="text-[10px] text-slate-400">of ₹{emp.targetRevenue.toLocaleString()}</p>
                </div>
              </div>

              {/* Quota Progress */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1">
                  <span>Quota Attainment</span>
                  <span className="text-electric-400 font-bold">{quotaPercent}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-navy-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-electric-400 h-full rounded-full"
                    style={{ width: `${quotaPercent}%` }}
                  />
                </div>
              </div>

              {/* Stats Bar */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-navy-800 grid grid-cols-3 gap-2 text-center text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 font-mono">Assigned Leads</span>
                  <p className="font-bold font-mono text-slate-800 dark:text-slate-200">{emp.assignedLeadsCount}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-mono">Deals Won</span>
                  <p className="font-bold font-mono text-slate-800 dark:text-slate-200">{emp.closedDeals}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-mono">Conversion</span>
                  <p className="font-bold font-mono text-electric-400">{emp.conversionRate}%</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* LEAD ALLOCATION MODAL */}
      {showAllocateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 shadow-2xl p-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Automated Lead Allocation Engine
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Allocate incoming unassigned leads or reassign deals to optimal sales executives.
            </p>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Select Lead to Allocate</label>
                <select
                  value={leadToAllocate}
                  onChange={e => setLeadToAllocate(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white"
                >
                  {leads.map(l => (
                    <option key={l.id} value={l.id}>
                      {l.name} — {l.serviceInterest} (AI Score: {l.aiScore})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Assign to Sales Executive</label>
                <select
                  value={targetRep}
                  onChange={e => setTargetRep(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white"
                >
                  {employees.map(e => (
                    <option key={e.id} value={e.id}>
                      {e.name} — {e.team} ({e.assignedLeadsCount} active leads)
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 rounded-xl bg-electric-500/10 border border-electric-500/20 text-electric-400 text-xs flex items-center gap-2">
                <Sparkles className="w-4 h-4 flex-shrink-0" />
                <span>AI Recommendation: Marcus Vance has highest win rate for large villa inquiries.</span>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  onClick={() => setShowAllocateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAllocateLead}
                  className="px-4 py-2 rounded-xl bg-electric-500 hover:bg-electric-400 text-navy-950 font-bold cursor-pointer"
                >
                  Confirm Allocation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PROVISION NEW EMPLOYEE MODAL */}
      {showCreateEmpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-electric-500/10 text-electric-600 dark:text-electric-400">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Provision New Sales Employee
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Creates authenticated staff user login and employee profile in CRM.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateEmpModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateEmployee} className="space-y-4 text-xs mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newEmpName}
                    onChange={e => setNewEmpName(e.target.value)}
                    placeholder="e.g. Liam Henderson"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-electric-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">
                    Corporate Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={newEmpEmail}
                    onChange={e => setNewEmpEmail(e.target.value)}
                    placeholder="liam.h@homeeaseguru.com"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-electric-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={newEmpPhone}
                    onChange={e => setNewEmpPhone(e.target.value)}
                    placeholder="+1 (555) 349-1100"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-electric-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">
                    Initial Staff Password *
                  </label>
                  <input
                    type="text"
                    required
                    value={newEmpPassword}
                    onChange={e => setNewEmpPassword(e.target.value)}
                    placeholder="password123"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-electric-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">
                    Role & Title
                  </label>
                  <select
                    value={newEmpRole}
                    onChange={e => setNewEmpRole(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white"
                  >
                    <option value="Sales Executive">Sales Executive</option>
                    <option value="Field Service Specialist">Field Service Specialist</option>
                    <option value="Senior Sales Manager">Senior Sales Manager</option>
                    <option value="Team Lead">Team Lead</option>
                    <option value="AI Operations Specialist">AI Operations Specialist</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">
                    Assigned Team / Territory
                  </label>
                  <select
                    value={newEmpTeam}
                    onChange={e => setNewEmpTeam(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white"
                  >
                    <option value="Sales Team Alpha">Sales Team Alpha</option>
                    <option value="West Territory Enterprise">West Territory Enterprise</option>
                    <option value="East Bay VIP Accounts">East Bay VIP Accounts</option>
                    <option value="North Metro Inbound">North Metro Inbound</option>
                    <option value="AI Autonomous Telephony">AI Autonomous Telephony</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">
                  Monthly Target Revenue Quota (₹)
                </label>
                <input
                  type="number"
                  step="5000"
                  min="5000"
                  value={newEmpQuota}
                  onChange={e => setNewEmpQuota(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1.5 font-semibold">
                  Profile Avatar Preset
                </label>
                <div className="flex items-center gap-2.5">
                  {[
                    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256',
                    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=256',
                    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=256',
                    'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=256'
                  ].map((url, idx) => (
                    <img
                      key={idx}
                      src={url}
                      alt="avatar option"
                      onClick={() => setNewEmpAvatar(url)}
                      className={`w-10 h-10 rounded-xl object-cover cursor-pointer border-2 transition-all ${
                        newEmpAvatar === url ? 'border-electric-400 scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-100 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-500 dark:text-slate-400 text-[11px] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-electric-500 flex-shrink-0" />
                <span>
                  The employee will be able to log in at <code>/login?role=sales</code> using the email and initial password specified above.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateEmpModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingEmp}
                  className="px-4 py-2 rounded-xl bg-electric-500 hover:bg-electric-400 text-navy-950 font-bold cursor-pointer disabled:opacity-60 flex items-center gap-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>{isSubmittingEmp ? 'Provisioning...' : 'Create Employee'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
