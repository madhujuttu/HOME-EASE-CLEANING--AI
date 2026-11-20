import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import {
  FileQuestion,
  Plus,
  Clock,
  Sparkles,
  CheckCircle,
  MessageSquare,
  X
} from 'lucide-react';

export const CustomerEnquiries: React.FC = () => {
  const { currentUser, addLead, showToast } = useCrm();

  const [showEnquiryModal, setShowEnquiryModal] = useState(false);
  const [formData, setFormData] = useState({
    serviceInterest: 'Ultra Deep Villa Sanitization',
    propertySize: '5,500 sqft',
    preferredTime: 'Morning (8 AM - 12 PM)',
    message: 'Looking for a complete steam clean post remodel.'
  });

  const [enquiries, setEnquiries] = useState([
    {
      id: 'ENQ-2041',
      date: '2026-11-16',
      service: 'Ultra Deep Villa Sanitization',
      status: 'Reviewed & Quote Sent',
      estimatedQuote: '₹750',
      rep: 'Marcus Vance'
    },
    {
      id: 'ENQ-1980',
      date: '2026-08-10',
      service: 'Sofa & Mattress Hydro-Extraction Care',
      status: 'Converted to Booking',
      estimatedQuote: '₹298',
      rep: 'Elena Rostova'
    }
  ]);

  const handleSubmitEnquiry = (e: React.FormEvent) => {
    e.preventDefault();
    const newEnq = {
      id: `ENQ-${Math.floor(2050 + Math.random() * 90)}`,
      date: new Date().toISOString().slice(0, 10),
      service: formData.serviceInterest,
      status: 'AI Reviewing Scope',
      estimatedQuote: 'Calculating...',
      rep: 'Aria (AI Voice Concierge)'
    };

    setEnquiries([newEnq, ...enquiries]);

    // Also trigger CRM lead creation
    addLead({
      name: currentUser?.name || 'Sophia Montgomery',
      phone: currentUser?.phone || '+1 (555) 014-9921',
      email: currentUser?.email || 'sophia.m@gmail.com',
      serviceInterest: formData.serviceInterest,
      source: 'Website Form',
      priority: 'high',
      customerRequirements: [formData.propertySize, formData.preferredTime],
      notes: formData.message
    });

    setShowEnquiryModal(false);
    showToast('Enquiry Submitted', 'Our sales concierge will dispatch an instant quote estimate.', 'success');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            My Service Inquiries & Custom Quotes
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track custom estate sanitization requests, volume commercial quotes, and callback requests.
          </p>
        </div>

        <button
          onClick={() => setShowEnquiryModal(true)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-electric-500 hover:bg-electric-400 text-navy-950 font-bold text-xs shadow-glow-sm transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Submit Custom Inquiry
        </button>
      </div>

      {/* Enquiries List */}
      <div className="space-y-3">
        {enquiries.map(enq => (
          <div
            key={enq.id}
            className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-electric-400 font-bold text-xs">#{enq.id}</span>
                <span className="text-xs font-bold text-slate-900 dark:text-white">{enq.service}</span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Submitted on {enq.date} • Assigned Concierge: {enq.rep}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-xs font-mono font-bold text-electric-400">{enq.estimatedQuote}</span>
                <span className="block text-[10px] uppercase font-mono text-slate-400">{enq.status}</span>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-electric-500/15 text-electric-400 text-xs font-semibold">
                Active
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* SUBMIT ENQUIRY MODAL */}
      {showEnquiryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-navy-800">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Submit Service Inquiry
              </h3>
              <button onClick={() => setShowEnquiryModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitEnquiry} className="space-y-3 mt-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Service Package</label>
                <select
                  value={formData.serviceInterest}
                  onChange={e => setFormData({ ...formData, serviceInterest: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none"
                >
                  <option>Ultra Deep Villa Sanitization</option>
                  <option>Executive Apartment Express Deep Clean</option>
                  <option>Heavy Kitchen Degrease & Steam Blitz</option>
                  <option>Sofa & Mattress Hydro-Extraction Care</option>
                  <option>Custom Architectural Estate Detailing</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Approximate Area / Scope</label>
                <input
                  type="text"
                  value={formData.propertySize}
                  onChange={e => setFormData({ ...formData, propertySize: e.target.value })}
                  placeholder="e.g. 5,000 sqft or 4 bedrooms"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Specific Requests / Timelines</label>
                <textarea
                  rows={3}
                  value={formData.message}
                  onChange={e => setFormData({ ...formData, message: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEnquiryModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-electric-500 hover:bg-electric-400 text-navy-950 font-bold"
                >
                  Submit Inquiry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
