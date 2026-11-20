import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import { Booking, BookingStatus } from '../../types';
import {
  CalendarCheck,
  Clock,
  MapPin,
  Phone,
  ShieldCheck,
  Star,
  CheckCircle2,
  FileText,
  Truck,
  Sparkles,
  Download,
  AlertCircle,
  X,
  MessageSquare,
  Upload,
  CreditCard,
  Layers,
  ChevronRight,
  Info
} from 'lucide-react';

export const CustomerBookings: React.FC = () => {
  const { bookings, providers, addBookingReview, showToast } = useCrm();

  const [selectedBookingId, setSelectedBookingId] = useState<string>(bookings[0]?.id || '');
  const selectedBooking = bookings.find(b => b.id === selectedBookingId) || bookings[0];

  // Review modal state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewImage, setReviewImage] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // 11 Lifecycle Tracking Stages
  const trackingMilestones: { status: BookingStatus; step: number; title: string; sub: string }[] = [
    { status: 'pending', step: 1, title: 'Intake Registered', sub: 'Order logged & awaiting dispatch allocation' },
    { status: 'confirmed', step: 2, title: 'Booking Confirmed', sub: 'Job scheduled into technician calendar' },
    { status: 'assigned', step: 3, title: 'Specialist Assigned', sub: 'Certified technician allocated to order' },
    { status: 'accepted', step: 4, title: 'Assignment Accepted', sub: 'Technician verified schedule & equipment' },
    { status: 'on_the_way', step: 5, title: 'Technician En Route', sub: 'Service vehicle traveling to residence' },
    { status: 'in_progress', step: 6, title: 'Service In Progress', sub: 'Active detailing & hospital-grade sanitization' },
    { status: 'completed', step: 7, title: 'Service Completed', sub: 'Customer walk-through & satisfaction verified' },
    { status: 'payment_pending', step: 8, title: 'Invoice Issued', sub: 'Post-service final invoice awaiting payment' },
    { status: 'paid', step: 9, title: 'Payment Completed', sub: 'Full payment received & receipt archived' }
  ];

  const getStatusStep = (status: BookingStatus): number => {
    switch (status) {
      case 'pending': return 1;
      case 'confirmed': return 2;
      case 'assigned': return 3;
      case 'accepted': return 4;
      case 'on_the_way': return 5;
      case 'in_progress': return 6;
      case 'completed': return 7;
      case 'payment_pending': return 8;
      case 'paid': return 9;
      case 'cancelled': return 1;
      case 'rejected': return 1;
      default: return 2;
    }
  };

  const assignedTech = providers.find(p => p.id === selectedBooking?.providerId) || providers[0];
  const currentStep = selectedBooking ? (selectedBooking.trackingStep || getStatusStep(selectedBooking.status)) : 1;

  const handleDownloadTaxInvoice = () => {
    if (!selectedBooking) return;
    const b = selectedBooking;
    const breakdown = b.pricingBreakdown || {
      basePrice: Math.round(b.amount / 1.18),
      inspectionCharges: 0,
      emergencyCharges: 0,
      materialCharges: 0,
      tax: Math.round(b.amount - (b.amount / 1.18)),
      discount: 0,
      total: b.amount
    };

    const invoiceContent = `========================================================================\n` +
      `                   HOMEEASE GURU — OFFICIAL TAX INVOICE                 \n` +
      `             (GSTIN: 06AAACH7409R1ZZ | HomeEase Services Pvt Ltd)       \n` +
      `========================================================================\n` +
      `Invoice Number : INV-2026-${b.id.replace(/\D/g, '') || '9921'}\n` +
      `Booking Ref ID : #${b.id}\n` +
      `Invoice Date   : ${new Date().toISOString().slice(0, 10)}\n` +
      `Service Date   : ${b.dateTime}\n` +
      `------------------------------------------------------------------------\n` +
      `CUSTOMER DETAILS:\n` +
      `Customer Name  : ${b.customerName}\n` +
      `Phone Number   : ${b.customerPhone}\n` +
      `Service Address: ${b.customerAddress}\n` +
      `Property Type  : ${b.propertyType || 'Residential Flat'}\n` +
      `------------------------------------------------------------------------\n` +
      `SERVICE & CHARGES BREAKDOWN:\n` +
      `Service Name   : ${b.serviceName}\n` +
      `Subservice     : ${b.subserviceName || b.serviceName}\n` +
      `Category       : ${b.serviceCategory || 'Home Services'}\n` +
      `Base Tariff    : ₹${breakdown.basePrice}\n` +
      `Inspection Fee : ₹${breakdown.inspectionCharges || 0}\n` +
      `Emergency Fee  : ₹${breakdown.emergencyCharges || 0}\n` +
      `Material Parts : ₹${breakdown.materialCharges || 0}\n` +
      `Discount (Promo): -₹${breakdown.discount || 0}\n` +
      `GST / Tax (18%): ₹${breakdown.tax}\n` +
      `------------------------------------------------------------------------\n` +
      `TOTAL AMOUNT   : ₹${b.amount}\n` +
      `Payment Method : ${b.paymentMethod || 'Credit Card / UPI'}\n` +
      `Payment Status : ${b.paymentStatus.toUpperCase()}\n` +
      `Assigned Tech  : ${b.providerName || assignedTech?.name || 'Verified Master Technician'}\n` +
      `Current Status : ${b.status.toUpperCase().replace(/_/g, ' ')}\n` +
      `========================================================================\n` +
      `       Thank you for choosing HomeEase Guru. 100% Satisfaction Guaranteed. \n` +
      `========================================================================\n`;

    const link = document.createElement('a');
    link.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(invoiceContent);
    link.download = `HomeEaseGuru_Tax_Invoice_${b.id}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Tax Invoice Saved', `Official invoice for booking #${b.id} downloaded.`, 'success');
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking) return;
    setIsSubmittingReview(true);

    try {
      const success = await addBookingReview(selectedBooking.id, {
        rating: reviewRating,
        comment: reviewComment.trim(),
        images: reviewImage.trim() ? [reviewImage.trim()] : []
      });

      if (success) {
        setShowReviewModal(false);
        setReviewComment('');
        setReviewImage('');
      }
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            My Service Bookings & Real-Time Tracker
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-electric-500/20 text-electric-400 font-mono font-bold">
              {bookings.length} Orders
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Live technician milestones, transparent tariff invoices, and verified post-service feedback.
          </p>
        </div>
      </div>

      {bookings.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800">
          <CalendarCheck className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No Bookings Found</h3>
          <p className="text-xs text-slate-400 mt-1 mb-4">You have not scheduled any service appointments yet.</p>
          <a
            href="/customer/services"
            className="px-5 py-2.5 rounded-xl bg-electric-500 hover:bg-electric-400 text-navy-950 font-bold text-xs"
          >
            Explore Services & Book Now
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Bookings List */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase font-mono tracking-wider">
              Booking History ({bookings.length})
            </h3>
            <div className="space-y-2.5 max-h-[75vh] overflow-y-auto custom-scrollbar pr-1">
              {bookings.map(b => {
                const isSelected = selectedBooking?.id === b.id;
                return (
                  <div
                    key={b.id}
                    onClick={() => setSelectedBookingId(b.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-electric-500/10 border-electric-500/50 shadow-glow-sm'
                        : 'bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 hover:border-slate-300 dark:hover:border-navy-700'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-mono font-bold text-electric-400">#{b.id}</span>
                      <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                        b.status === 'completed' || b.status === 'paid'
                          ? 'bg-emerald-500/15 text-emerald-400'
                          : b.status === 'in_progress' || b.status === 'on_the_way'
                          ? 'bg-cyan-500/15 text-cyan-400 animate-pulse'
                          : 'bg-slate-100 dark:bg-navy-800 text-slate-400'
                      }`}>
                        {b.status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                      {b.serviceName}
                    </h4>

                    <div className="flex items-center justify-between text-xs text-slate-400 font-mono mt-1.5 pt-1.5 border-t border-slate-100 dark:border-navy-800">
                      <span>{b.dateTime}</span>
                      <span className="font-black text-slate-900 dark:text-white">₹{b.amount}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Center/Right: Live Tracking Execution View */}
          {selectedBooking && (
            <div className="lg:col-span-2 space-y-5">
              {/* Order Header & Action Bar */}
              <div className="p-6 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-navy-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-mono text-electric-400 font-bold px-2 py-0.5 rounded bg-electric-500/10 border border-electric-500/30">
                        Order #{selectedBooking.id}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        {selectedBooking.serviceCategory || 'Home Services'}
                      </span>
                    </div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">
                      {selectedBooking.serviceName}
                    </h3>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      Scheduled: {selectedBooking.dateTime} {selectedBooking.timeSlot ? `• ${selectedBooking.timeSlot}` : ''}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleDownloadTaxInvoice}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 dark:hover:bg-navy-750 text-slate-800 dark:text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                    >
                      <Download className="w-4 h-4 text-electric-400" /> Tax Invoice
                    </button>

                    {(selectedBooking.status === 'completed' || selectedBooking.status === 'paid') && (
                      <button
                        onClick={() => setShowReviewModal(true)}
                        className="px-3.5 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Star className="w-4 h-4 fill-amber-400" /> Rate Tech
                      </button>
                    )}
                  </div>
                </div>

                {/* 11-Stage Visual Progress Timeline */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-mono uppercase font-bold text-slate-400 tracking-wider">
                      Live Lifecycle Timeline (Current: {selectedBooking.status.toUpperCase().replace(/_/g, ' ')})
                    </h4>
                    <span className="text-xs font-mono font-bold text-electric-400">
                      Stage {Math.min(currentStep, 9)} of 9
                    </span>
                  </div>

                  <div className="space-y-4 pt-2">
                    {trackingMilestones.map((m, idx) => {
                      const isDone = currentStep >= m.step;
                      const isCurrent = currentStep === m.step;

                      return (
                        <div key={idx} className="flex items-start gap-3.5">
                          <div className="relative flex flex-col items-center">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center font-mono font-bold text-xs z-10 transition-all ${
                              isDone
                                ? 'bg-electric-500 text-navy-950 shadow-glow-sm'
                                : 'bg-slate-200 dark:bg-navy-800 text-slate-400'
                            }`}>
                              {isDone ? <CheckCircle2 className="w-4 h-4 text-navy-950" /> : m.step}
                            </div>
                            {idx < trackingMilestones.length - 1 && (
                              <div className={`w-0.5 h-7 my-1 ${
                                currentStep > m.step ? 'bg-electric-500' : 'bg-slate-200 dark:bg-navy-800'
                              }`} />
                            )}
                          </div>

                          <div className="pt-0.5">
                            <h5 className={`text-xs font-bold ${
                              isCurrent ? 'text-electric-400' : isDone ? 'text-slate-900 dark:text-white' : 'text-slate-500'
                            }`}>
                              {m.title}
                            </h5>
                            <p className="text-[11px] text-slate-400 mt-0.5">{m.sub}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Status History Audit Trail */}
                {selectedBooking.statusHistory && selectedBooking.statusHistory.length > 0 && (
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-800 space-y-2">
                    <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                      Status Change History & Timestamps:
                    </span>
                    <div className="space-y-1.5">
                      {selectedBooking.statusHistory.map((h, i) => (
                        <div key={i} className="flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-slate-700 dark:text-slate-300 capitalize">
                            • {h.status.replace(/_/g, ' ')}: {h.note || 'Milestone verified'}
                          </span>
                          <span className="font-mono text-slate-400 text-[10px]">
                            {new Date(h.timestamp).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Assigned Specialist Card */}
              {assignedTech && (
                <div className="p-5 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={assignedTech.avatar}
                      alt={assignedTech.name}
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-electric-500/40"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono uppercase text-electric-400 font-bold">
                          Lead Certified Specialist
                        </span>
                        <span className="text-[10px] px-2 py-0.2 rounded-full bg-emerald-500/15 text-emerald-400 font-bold flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" /> Verified Pro
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                        {selectedBooking.providerName || assignedTech.name}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                        <span className="flex items-center gap-1 font-mono text-amber-400 font-bold">
                          <Star className="w-3.5 h-3.5 fill-amber-400" /> {assignedTech.rating}
                        </span>
                        <span>•</span>
                        <span>{assignedTech.jobsCompleted} Completed Jobs</span>
                        <span>•</span>
                        <span>{assignedTech.location}</span>
                      </div>
                    </div>
                  </div>

                  <a
                    href={`tel:${selectedBooking.providerPhone || assignedTech.phone}`}
                    className="px-4 py-2.5 rounded-xl bg-electric-500 hover:bg-electric-400 text-navy-950 font-bold text-xs flex items-center justify-center gap-2 shadow-sm self-start sm:self-auto cursor-pointer"
                  >
                    <Phone className="w-4 h-4" /> Call Specialist
                  </a>
                </div>
              )}

              {/* Customer Review Card (if already reviewed) */}
              {selectedBooking.review && (
                <div className="p-5 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-mono text-electric-400 font-bold">
                      Your Submitted Review & Rating
                    </span>
                    <div className="flex items-center gap-1 text-amber-400">
                      {[1, 2, 3, 4, 5].map(st => (
                        <Star
                          key={st}
                          className={`w-3.5 h-3.5 ${
                            st <= selectedBooking.review!.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-600'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic">
                    "{selectedBooking.review.comment || 'High quality service executed on time.'}"
                  </p>
                  {selectedBooking.review.createdAt && (
                    <span className="text-[10px] text-slate-400 font-mono block">
                      Submitted on: {new Date(selectedBooking.review.createdAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* REVIEW & RATING MODAL */}
      {showReviewModal && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-navy-800">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Rate Service & Specialist
                </h3>
                <p className="text-xs text-slate-400">Booking #{selectedBooking.id} • {selectedBooking.serviceName}</p>
              </div>
              <button onClick={() => setShowReviewModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-bold mb-2 text-center uppercase font-mono text-[11px]">
                  How would you rate the experience? (1 - 5 Stars)
                </label>
                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="p-1.5 cursor-pointer transition-transform hover:scale-125"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          star <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-slate-600'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1 uppercase font-mono text-[11px]">
                  Written Feedback / Comments
                </label>
                <textarea
                  rows={3}
                  required
                  value={reviewComment}
                  onChange={e => setReviewComment(e.target.value)}
                  placeholder="Share details about technician punctuality, work quality, cleanliness..."
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none focus:border-electric-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1 uppercase font-mono text-[11px]">
                  Post-Service Photo URL (Optional)
                </label>
                <input
                  type="url"
                  value={reviewImage}
                  onChange={e => setReviewImage(e.target.value)}
                  placeholder="https://example.com/clean-sofa-result.jpg"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-navy-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="px-5 py-2 rounded-xl bg-electric-500 hover:bg-electric-400 text-navy-950 font-bold shadow-glow-sm cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingReview ? 'Submitting...' : 'Submit Rating'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
