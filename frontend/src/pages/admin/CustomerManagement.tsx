import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import { Customer } from '../../types';
import {
  Users,
  Search,
  Plus,
  Phone,
  Mail,
  MapPin,
  Star,
  Calendar,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  Clock,
  Sparkles,
  ChevronRight,
  X,
  MessageSquare,
  ShieldCheck,
  Award,
  Download
} from 'lucide-react';

export const CustomerManagement: React.FC = () => {
  const { customers, bookings, payments, meetings, addCustomer, updateCustomer, addCustomerNote, showToast } = useCrm();

  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newNote, setNewNote] = useState('');

  // Add customer form
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    servicePreferences: 'Deep Home Cleaning, Hypoallergenic',
    loyaltyTier: 'Silver' as Customer['loyaltyTier']
  });

  const filteredCustomers = customers.filter(c => {
    if (tierFilter !== 'all' && c.loyaltyTier !== tierFilter) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const match =
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.address.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      showToast('Validation Error', 'Name and Phone are mandatory.', 'error');
      return;
    }

    addCustomer({
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      address: formData.address,
      servicePreferences: formData.servicePreferences.split(',').map(s => s.trim()),
      loyaltyTier: formData.loyaltyTier,
      totalBookings: 0,
      totalSpent: 0
    });

    setShowAddModal(false);
    setFormData({
      name: '',
      phone: '',
      email: '',
      address: '',
      servicePreferences: 'Deep Home Cleaning',
      loyaltyTier: 'Silver'
    });
  };

  const handleSaveNote = () => {
    if (!selectedCustomer || !newNote.trim()) return;
    addCustomerNote(selectedCustomer.id, newNote);
    setSelectedCustomer({
      ...selectedCustomer,
      notes: [newNote, ...selectedCustomer.notes]
    });
    setNewNote('');
    showToast('Customer Note Saved', 'Added to Customer 360 profile.', 'success');
  };

  const handleExportCustomersCSV = () => {
    const headers = ['ID', 'Name', 'Phone', 'Email', 'Address', 'Tier', 'TotalSpent', 'Bookings', 'CSAT'];
    const rows = filteredCustomers.map(c => [
      c.id,
      `"${c.name}"`,
      `"${c.phone}"`,
      `"${c.email}"`,
      `"${c.address}"`,
      c.loyaltyTier,
      c.totalSpent,
      c.totalBookings,
      c.satisfactionScore
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `homeease_customers_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Customer Directory Exported', `Downloaded ${filteredCustomers.length} profiles.`, 'success');
  };

  const handleExportCustomerDossier = (cust: Customer) => {
    const content = `HOMEEASE GURU — CUSTOMER 360 DOSSIER\n` +
      `==========================================\n` +
      `Customer Name: ${cust.name}\n` +
      `Customer ID: #${cust.id}\n` +
      `Loyalty Tier: ${cust.loyaltyTier}\n` +
      `Phone: ${cust.phone}\n` +
      `Email: ${cust.email}\n` +
      `Address: ${cust.address}\n` +
      `Total Spend: ₹${cust.totalSpent}\n` +
      `Completed Bookings: ${cust.totalBookings}\n` +
      `CSAT Score: ${cust.satisfactionScore} / 5.0\n` +
      `Preferences: ${cust.servicePreferences.join(', ')}\n\n` +
      `ACCOUNT NOTES:\n` +
      cust.notes.map(n => `- ${n}`).join('\n');

    const link = document.createElement('a');
    link.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(content);
    link.download = `customer_360_${cust.name.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Dossier Downloaded', `Exported Customer 360 profile for ${cust.name}`, 'success');
  };

  const getTierBadge = (tier: Customer['loyaltyTier']) => {
    switch (tier) {
      case 'Platinum':
        return 'bg-purple-500/15 text-purple-400 border-purple-500/30';
      case 'Gold':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'Silver':
        return 'bg-slate-500/15 text-slate-300 border-slate-500/30';
    }
  };

  // Associated bookings & payments for selected customer
  const customerBookings = selectedCustomer
    ? bookings.filter(b => b.customerName.toLowerCase() === selectedCustomer.name.toLowerCase())
    : [];

  const customerPayments = selectedCustomer
    ? payments.filter(p => p.customerName.toLowerCase() === selectedCustomer.name.toLowerCase())
    : [];

  const customerMeetings = selectedCustomer
    ? meetings.filter(m => m.customerName.toLowerCase() === selectedCustomer.name.toLowerCase())
    : [];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            Customer 360 Hub
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-electric-500/20 text-electric-400 font-mono font-bold">
              {filteredCustomers.length} profiles
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Lifetime customer records, bookings, payment ledgers, and complaints tracking.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap self-start sm:self-auto">
          <button
            onClick={handleExportCustomersCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-slate-700 dark:text-slate-200 hover:text-white text-xs font-semibold shadow-sm transition-all"
          >
            <Download className="w-4 h-4 text-slate-400" />
            Export Directory
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-electric-500 hover:bg-electric-400 text-navy-950 font-bold text-xs shadow-glow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Customer Profile
          </button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="p-3.5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by customer name, phone, address, or email..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white placeholder-slate-400 text-xs focus:outline-none focus:border-electric-500/50"
          />
        </div>

        <select
          value={tierFilter}
          onChange={e => setTierFilter(e.target.value)}
          className="text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-700 dark:text-slate-200 focus:outline-none w-full sm:w-auto"
        >
          <option value="all">Loyalty Tier: All</option>
          <option value="Platinum">Platinum</option>
          <option value="Gold">Gold</option>
          <option value="Silver">Silver</option>
        </select>
      </div>

      {/* Customers Table */}
      <div className="rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-navy-800 bg-slate-50/70 dark:bg-navy-950/70 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
                <th className="py-3.5 px-4 font-semibold">Customer</th>
                <th className="py-3.5 px-4 font-semibold">Contact & Address</th>
                <th className="py-3.5 px-4 font-semibold">Loyalty & CSAT</th>
                <th className="py-3.5 px-4 font-semibold">Total Bookings</th>
                <th className="py-3.5 px-4 font-semibold">Lifetime Spend</th>
                <th className="py-3.5 px-4 font-semibold">Member Since</th>
                <th className="py-3.5 px-4 font-semibold text-right">360 View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-navy-800">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No customer accounts match your search.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map(cust => (
                  <tr
                    key={cust.id}
                    onClick={() => setSelectedCustomer(cust)}
                    className="hover:bg-slate-50 dark:hover:bg-navy-850/60 cursor-pointer transition-colors group"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-navy-800 to-navy-900 border border-electric-500/30 flex items-center justify-center font-bold text-electric-400">
                          {cust.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 dark:text-white group-hover:text-electric-400 transition-colors">
                              {cust.name}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">#{cust.id}</span>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border mt-1 inline-block ${getTierBadge(cust.loyaltyTier)}`}>
                            {cust.loyaltyTier}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="text-slate-800 dark:text-slate-200 font-medium">{cust.phone}</p>
                      <p className="text-slate-400 text-[11px] truncate max-w-[200px]">{cust.address}</p>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1 font-mono text-amber-400 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{cust.satisfactionScore} / 5.0</span>
                      </div>
                      <span className="text-[10px] text-slate-400">Satisfaction Score</span>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800 dark:text-slate-200">
                      {cust.totalBookings} Completed
                    </td>

                    <td className="py-3.5 px-4 font-mono font-extrabold text-electric-400 text-sm">
                      ₹{cust.totalSpent.toLocaleString()}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px]">
                      {cust.createdAt}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          setSelectedCustomer(cust);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-electric-500/15 text-electric-400 hover:bg-electric-500/25 font-semibold text-[11px] transition-colors"
                      >
                        Open 360 →
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CUSTOMER 360 PROFILE DRAWER */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-navy-950/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl h-full bg-white dark:bg-navy-900 border-l border-slate-200 dark:border-navy-700 shadow-2xl flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b border-slate-200 dark:border-navy-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-electric-500/15 border border-electric-500/30 flex items-center justify-center font-extrabold text-electric-400 text-lg">
                  {selectedCustomer.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    {selectedCustomer.name}
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${getTierBadge(selectedCustomer.loyaltyTier)}`}>
                      {selectedCustomer.loyaltyTier} Tier
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5 font-mono">
                    Customer 360 Master Profile • #{selectedCustomer.id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-100 dark:hover:bg-navy-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar text-xs">
              {/* Financial & Loyalty Metrics Summary */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-800 text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-mono">Total Spend</span>
                  <p className="text-lg font-black text-electric-400 font-mono mt-1">
                    ₹{selectedCustomer.totalSpent.toLocaleString()}
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-800 text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-mono">Completed Cleanings</span>
                  <p className="text-lg font-black text-slate-900 dark:text-white font-mono mt-1">
                    {selectedCustomer.totalBookings}
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-800 text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-mono">CSAT Score</span>
                  <p className="text-lg font-black text-amber-400 font-mono mt-1 flex items-center justify-center gap-1">
                    <Star className="w-4 h-4 fill-amber-400" />
                    {selectedCustomer.satisfactionScore}
                  </p>
                </div>
              </div>

              {/* Service Preferences */}
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] font-mono mb-2">
                  Service Preferences & Special Instructions
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedCustomer.servicePreferences.map((pref, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg bg-electric-500/10 border border-electric-500/30 text-electric-400 text-xs font-medium"
                    >
                      {pref}
                    </span>
                  ))}
                </div>
              </div>

              {/* Notes & Comments */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] font-mono">
                    Customer Account Notes
                  </h4>
                </div>

                <div className="space-y-2 mb-3">
                  {selectedCustomer.notes.map((note, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-800 text-slate-700 dark:text-slate-300 leading-relaxed">
                      {note}
                    </div>
                  ))}
                </div>

                {/* Add Note Input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add customer account note..."
                    value={newNote}
                    onChange={e => setNewNote(e.target.value)}
                    className="flex-1 p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-electric-500"
                  />
                  <button
                    onClick={handleSaveNote}
                    className="px-4 py-2.5 rounded-xl bg-electric-500 hover:bg-electric-400 text-navy-950 font-bold text-xs"
                  >
                    Save Note
                  </button>
                </div>
              </div>

              {/* Booking History */}
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] font-mono mb-2">
                  Booking History
                </h4>
                <div className="space-y-2">
                  {customerBookings.length === 0 ? (
                    <p className="text-slate-400 italic">No bookings recorded under this customer.</p>
                  ) : (
                    customerBookings.map(b => (
                      <div key={b.id} className="p-3 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-800 flex items-center justify-between">
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white">{b.serviceName}</span>
                          <p className="text-[11px] text-slate-400 font-mono mt-0.5">{b.dateTime} • Provider: {b.providerName || 'Pending'}</p>
                        </div>
                        <div className="text-right">
                          <span className="font-mono font-bold text-electric-400">₹{b.amount}</span>
                          <span className="block text-[10px] uppercase font-mono text-slate-400">{b.status}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Payment History */}
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] font-mono mb-2">
                  Payment History & Invoices
                </h4>
                <div className="space-y-2">
                  {customerPayments.length === 0 ? (
                    <p className="text-slate-400 italic">No invoice history.</p>
                  ) : (
                    customerPayments.map(p => (
                      <div key={p.id} className="p-3 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-800 flex items-center justify-between">
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white font-mono">{p.invoiceNumber}</span>
                          <p className="text-[11px] text-slate-400">{p.date} • {p.method}</p>
                        </div>
                        <div className="text-right">
                          <span className="font-mono font-bold text-electric-400">₹{p.amount}</span>
                          <span className="block text-[10px] uppercase font-mono text-electric-400">{p.status}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Complaints / Issues */}
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] font-mono mb-2">
                  Customer Complaints & Resolution
                </h4>
                {selectedCustomer.complaints.length === 0 ? (
                  <div className="p-3 rounded-xl bg-electric-500/10 border border-electric-500/20 text-electric-400 text-xs flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Clean Record: Zero unresolved complaints.
                  </div>
                ) : (
                  selectedCustomer.complaints.map(cmp => (
                    <div key={cmp.id} className="p-3 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-800 flex items-center justify-between">
                      <div>
                        <span className="text-[11px] text-slate-400 font-mono">{cmp.date}</span>
                        <p className="text-slate-800 dark:text-slate-200 mt-0.5">{cmp.issue}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
                        cmp.status === 'resolved' ? 'bg-electric-500/15 text-electric-400' : 'bg-rose-500/15 text-rose-400'
                      }`}>
                        {cmp.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-navy-800 flex items-center justify-between bg-slate-50 dark:bg-navy-950">
              <div className="flex items-center gap-2">
                <a
                  href={`tel:${selectedCustomer.phone}`}
                  className="px-3 py-2 rounded-xl bg-electric-500 hover:bg-electric-400 text-navy-950 font-bold text-xs flex items-center gap-1.5 shadow-sm"
                >
                  <Phone className="w-3.5 h-3.5" /> Call Customer
                </a>
                <button
                  onClick={() => handleExportCustomerDossier(selectedCustomer)}
                  className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-200 hover:text-white font-semibold text-xs flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" /> Export Dossier
                </button>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-navy-800 text-slate-800 dark:text-white font-semibold text-xs"
              >
                Close 360 View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD CUSTOMER MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-navy-800">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Register New Customer Profile
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-3.5 mt-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Customer Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Liam Hemsworth"
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
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none focus:border-electric-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Email Address</label>
                  <input
                    type="email"
                    placeholder="customer@example.com"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none focus:border-electric-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Primary Service Address</label>
                <input
                  type="text"
                  placeholder="Street, City, State, ZIP"
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none focus:border-electric-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Service Preferences (comma separated)</label>
                  <input
                    type="text"
                    value={formData.servicePreferences}
                    onChange={e => setFormData({ ...formData, servicePreferences: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Loyalty Tier</label>
                  <select
                    value={formData.loyaltyTier}
                    onChange={e => setFormData({ ...formData, loyaltyTier: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="Silver">Silver</option>
                    <option value="Gold">Gold</option>
                    <option value="Platinum">Platinum</option>
                  </select>
                </div>
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
                  Save Customer Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
