import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import { Booking, BookingStatus } from '../../types';
import {
  CalendarCheck,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  User,
  ShieldCheck,
  ChevronRight,
  X,
  CreditCard,
  AlertCircle,
  Truck
} from 'lucide-react';

export const BookingManagement: React.FC = () => {
  const { bookings, providers, updateBookingStatus, assignBookingProvider, showToast } = useCrm();

  const [activeTab, setActiveTab] = useState<BookingStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const filteredBookings = bookings.filter(b => {
    if (activeTab !== 'all' && b.status !== activeTab) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const match =
        b.customerName.toLowerCase().includes(q) ||
        b.serviceName.toLowerCase().includes(q) ||
        b.id.toLowerCase().includes(q) ||
        b.customerAddress.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case 'pending': return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'confirmed': return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
      case 'assigned': return 'bg-purple-500/15 text-purple-400 border-purple-500/30';
      case 'accepted': return 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30';
      case 'on_the_way': return 'bg-sky-500/15 text-sky-400 border-sky-500/30';
      case 'in_progress': return 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30';
      case 'completed': return 'bg-electric-500/15 text-electric-400 border-electric-500/30';
      case 'payment_pending': return 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30';
      case 'paid': return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'cancelled': return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
      case 'rejected': return 'bg-red-500/15 text-red-400 border-red-500/30';
      default: return 'bg-slate-500/15 text-slate-400 border-slate-500/30';
    }
  };

  const trackingStages = [
    'Pending Intake',
    'Confirmed & Scheduled',
    'Provider Assigned',
    'Provider Accepted',
    'Technician En Route',
    'Service In Progress',
    'Service Completed',
    'Payment Pending',
    'Payment Completed'
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            Job & Booking Dispatch Center
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-electric-500/20 text-electric-400 font-mono font-bold">
              {filteredBookings.length} orders
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Dispatch verification, provider allocation, live GPS status, and completion audits.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-slate-200 dark:border-navy-800 text-xs font-semibold custom-scrollbar">
        {[
          { key: 'all', label: 'All Jobs', count: bookings.length },
          { key: 'pending', label: 'Pending Dispatch', count: bookings.filter(b => b.status === 'pending').length },
          { key: 'confirmed', label: 'Confirmed', count: bookings.filter(b => b.status === 'confirmed').length },
          { key: 'assigned', label: 'Assigned', count: bookings.filter(b => b.status === 'assigned').length },
          { key: 'accepted', label: 'Accepted', count: bookings.filter(b => b.status === 'accepted').length },
          { key: 'on_the_way', label: 'On The Way', count: bookings.filter(b => b.status === 'on_the_way').length },
          { key: 'in_progress', label: 'In Progress', count: bookings.filter(b => b.status === 'in_progress').length },
          { key: 'completed', label: 'Completed', count: bookings.filter(b => b.status === 'completed').length },
          { key: 'payment_pending', label: 'Payment Pending', count: bookings.filter(b => b.status === 'payment_pending').length },
          { key: 'paid', label: 'Paid', count: bookings.filter(b => b.status === 'paid').length },
          { key: 'cancelled', label: 'Cancelled', count: bookings.filter(b => b.status === 'cancelled').length },
          { key: 'rejected', label: 'Rejected', count: bookings.filter(b => b.status === 'rejected').length },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === tab.key
                ? 'bg-electric-500 text-navy-950 font-bold shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-white hover:bg-slate-100 dark:hover:bg-navy-900'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
              activeTab === tab.key ? 'bg-navy-950/20 text-navy-950' : 'bg-slate-200 dark:bg-navy-800 text-slate-500'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Search Toolbar */}
      <div className="p-3.5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search bookings by customer name, address, ID or service..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full bg-transparent border-none text-slate-900 dark:text-white placeholder-slate-400 text-xs focus:outline-none"
        />
      </div>

      {/* Bookings Table */}
      <div className="rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-navy-800 bg-slate-50/70 dark:bg-navy-950/70 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
                <th className="py-3.5 px-4 font-semibold">Booking ID</th>
                <th className="py-3.5 px-4 font-semibold">Customer & Address</th>
                <th className="py-3.5 px-4 font-semibold">Service Package</th>
                <th className="py-3.5 px-4 font-semibold">Assigned Specialist</th>
                <th className="py-3.5 px-4 font-semibold">Scheduled Time</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-navy-800">
              {filteredBookings.map(bk => (
                <tr
                  key={bk.id}
                  onClick={() => setSelectedBooking(bk)}
                  className="hover:bg-slate-50 dark:hover:bg-navy-850/60 cursor-pointer transition-colors group"
                >
                  <td className="py-3.5 px-4 font-mono font-bold text-electric-400">
                    #{bk.id}
                  </td>

                  <td className="py-3.5 px-4">
                    <p className="font-bold text-slate-900 dark:text-white group-hover:text-electric-400 transition-colors">
                      {bk.customerName}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate max-w-[180px]">{bk.customerAddress}</p>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-slate-800 dark:text-slate-200 block truncate max-w-[180px]">
                      {bk.serviceName}
                    </span>
                    <span className="font-mono text-electric-400 text-[11px] font-bold">
                      ₹{bk.amount} • {bk.paymentStatus.toUpperCase()}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    {bk.providerName ? (
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-3.5 h-3.5 text-electric-400" />
                        <span className="font-medium text-slate-800 dark:text-slate-200">{bk.providerName}</span>
                      </div>
                    ) : (
                      <span className="text-amber-400 text-[11px] font-semibold flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> Unassigned
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400 text-[11px]">
                    {bk.dateTime}
                  </td>

                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${getStatusBadge(bk.status)}`}>
                      {bk.status}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        setSelectedBooking(bk);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-electric-400"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* BOOKING DETAILS DRAWER */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex justify-end bg-navy-950/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-xl h-full bg-white dark:bg-navy-900 border-l border-slate-200 dark:border-navy-700 shadow-2xl flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b border-slate-200 dark:border-navy-800 flex items-center justify-between">
              <div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${getStatusBadge(selectedBooking.status)}`}>
                  {selectedBooking.status}
                </span>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-1.5">
                  Booking #{selectedBooking.id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-100 dark:hover:bg-navy-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar text-xs">
              {/* 5-Stage Live Dispatch Tracker */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-800">
                <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] font-mono mb-3">
                  Live Dispatch Execution Stages
                </h4>
                <div className="space-y-3">
                  {trackingStages.map((stage, idx) => {
                    const stepNum = idx + 1;
                    const isDone = selectedBooking.trackingStep >= stepNum;
                    const isCurrent = selectedBooking.trackingStep === stepNum;
                    return (
                      <div key={idx} className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center font-mono font-bold text-xs ${
                          isDone ? 'bg-electric-500 text-navy-950' : 'bg-slate-200 dark:bg-navy-800 text-slate-400'
                        }`}>
                          {stepNum}
                        </div>
                        <span className={`text-xs ${isCurrent ? 'font-bold text-electric-400' : isDone ? 'text-slate-200' : 'text-slate-500'}`}>
                          {stage}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Status Selector & Quick Actions */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] font-mono">
                  Update Booking Lifecycle Status (11-Stage Workflow)
                </h4>
                <select
                  value={selectedBooking.status}
                  onChange={e => {
                    const nextSt = e.target.value as BookingStatus;
                    updateBookingStatus(selectedBooking.id, nextSt);
                    setSelectedBooking({ ...selectedBooking, status: nextSt });
                  }}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white font-medium capitalize"
                >
                  <option value="pending">Pending Dispatch</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="assigned">Provider Assigned</option>
                  <option value="accepted">Provider Accepted</option>
                  <option value="on_the_way">On The Way</option>
                  <option value="in_progress">Service Started / In Progress</option>
                  <option value="completed">Service Completed</option>
                  <option value="payment_pending">Payment Pending</option>
                  <option value="paid">Payment Completed / Paid</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="rejected">Rejected by Provider</option>
                </select>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  <button
                    onClick={() => {
                      updateBookingStatus(selectedBooking.id, 'on_the_way');
                      setSelectedBooking({ ...selectedBooking, status: 'on_the_way', trackingStep: 5 });
                    }}
                    className="py-1.5 px-2 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-400 font-bold text-[10px] text-center"
                  >
                    En Route
                  </button>
                  <button
                    onClick={() => {
                      updateBookingStatus(selectedBooking.id, 'in_progress');
                      setSelectedBooking({ ...selectedBooking, status: 'in_progress', trackingStep: 6 });
                    }}
                    className="py-1.5 px-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 font-bold text-[10px] text-center"
                  >
                    Start Service
                  </button>
                  <button
                    onClick={() => {
                      updateBookingStatus(selectedBooking.id, 'completed');
                      setSelectedBooking({ ...selectedBooking, status: 'completed', trackingStep: 7 });
                    }}
                    className="py-1.5 px-2 rounded-xl bg-electric-500/20 hover:bg-electric-500/30 text-electric-400 font-bold text-[10px] text-center"
                  >
                    Complete Job
                  </button>
                  <button
                    onClick={() => {
                      updateBookingStatus(selectedBooking.id, 'paid');
                      setSelectedBooking({ ...selectedBooking, status: 'paid', trackingStep: 9, paymentStatus: 'paid' });
                    }}
                    className="py-1.5 px-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 font-bold text-[10px] text-center"
                  >
                    Mark Paid
                  </button>
                </div>
              </div>

              {/* Provider Allocation Selector */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] font-mono">
                  Assign Lead Technician
                </h4>
                <select
                  value={selectedBooking.providerId || ''}
                  onChange={e => {
                    assignBookingProvider(selectedBooking.id, e.target.value);
                    const p = providers.find(prov => prov.id === e.target.value);
                    setSelectedBooking({
                      ...selectedBooking,
                      providerId: e.target.value,
                      providerName: p?.name,
                      status: 'assigned',
                      trackingStep: 2
                    });
                  }}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white"
                >
                  <option value="">Select available certified technician...</option>
                  {providers.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.location} • {p.rating}★)
                    </option>
                  ))}
                </select>
              </div>

              {/* Booking Specifications */}
              <div className="space-y-2 p-3.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-800">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Customer</span>
                  <span className="font-bold text-slate-900 dark:text-white">{selectedBooking.customerName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Phone</span>
                  <span className="font-mono text-slate-900 dark:text-white">{selectedBooking.customerPhone}</span>
                </div>
                <div className="flex items-start justify-between">
                  <span className="text-slate-400">Address</span>
                  <span className="text-right text-slate-900 dark:text-white max-w-xs">{selectedBooking.customerAddress}</span>
                </div>
                {selectedBooking.propertyType && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Property Type</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedBooking.propertyType}</span>
                  </div>
                )}
                {selectedBooking.timeSlot && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Time Slot</span>
                    <span className="font-mono text-slate-800 dark:text-slate-200 text-[11px]">{selectedBooking.timeSlot}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Service Fee</span>
                  <span className="font-mono font-bold text-electric-400 text-sm">₹{selectedBooking.amount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Payment Status</span>
                  <span className="font-mono font-semibold text-electric-400 uppercase">{selectedBooking.paymentStatus}</span>
                </div>
                {selectedBooking.problemImages && selectedBooking.problemImages.length > 0 && (
                  <div className="pt-2 border-t border-slate-200 dark:border-navy-750">
                    <span className="text-slate-400 block mb-1.5 font-medium">Customer Uploaded Site / Problem Images:</span>
                    <div className="flex gap-2 overflow-x-auto">
                      {selectedBooking.problemImages.map((img, i) => (
                        <a key={i} href={img} target="_blank" rel="noreferrer" className="block w-16 h-16 rounded-lg overflow-hidden border border-electric-500/30 flex-shrink-0">
                          <img src={img} alt="Problem Site" className="w-full h-full object-cover" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-navy-800 flex items-center justify-end bg-slate-50 dark:bg-navy-950">
              <button
                onClick={() => setSelectedBooking(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-navy-800 text-slate-800 dark:text-white font-semibold text-xs"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
