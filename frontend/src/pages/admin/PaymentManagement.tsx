import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import { Payment } from '../../types';
import {
  CreditCard,
  DollarSign,
  Download,
  Search,
  CheckCircle2,
  Clock,
  RotateCcw,
  FileText,
  X,
  Printer,
  ShieldCheck,
  Building2,
  Calendar
} from 'lucide-react';

export const PaymentManagement: React.FC = () => {
  const { payments, updatePayment, showToast } = useCrm();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedInvoice, setSelectedInvoice] = useState<Payment | null>(null);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundTarget, setRefundTarget] = useState<Payment | null>(null);
  const [refundReason, setRefundReason] = useState('Customer requested date cancellation within 24hr window');

  const totalGross = payments.reduce((sum, p) => sum + (p.status === 'completed' ? p.amount : 0), 0);
  const totalPayouts = payments.reduce((sum, p) => sum + (p.status === 'completed' ? p.providerPayout : 0), 0);
  const totalPending = payments.reduce((sum, p) => sum + (p.status === 'pending' ? p.amount : 0), 0);
  const netOperatingMargin = totalGross - totalPayouts;

  const filteredPayments = payments.filter(p => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const match =
        p.customerName.toLowerCase().includes(q) ||
        p.invoiceNumber.toLowerCase().includes(q) ||
        p.serviceName.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const handleProcessRefund = () => {
    if (!refundTarget) return;
    updatePayment(refundTarget.id, { status: 'refunded' });
    showToast('Refund Processed', `Amount ₹${refundTarget.amount} refunded to ${refundTarget.customerName}.`, 'info');
    setShowRefundModal(false);
    setRefundTarget(null);
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  const handleDownloadInvoice = (inv: Payment) => {
    const text = `=================================================\n` +
      `             HOMEEASE GURU TAX INVOICE           \n` +
      `=================================================\n` +
      `Invoice Number : ${inv.invoiceNumber}\n` +
      `Receipt No     : ${inv.receiptNumber || 'RCP-8891'}\n` +
      `Date           : ${inv.date}\n` +
      `Status         : ${inv.status.toUpperCase()}\n\n` +
      `BILLED TO:\n` +
      `Customer Name  : ${inv.customerName}\n` +
      `Email          : ${inv.customerEmail}\n\n` +
      `SERVICE PARTICULARS:\n` +
      `Package Name   : ${inv.serviceName}\n` +
      `Amount Paid    : ₹${inv.amount}\n` +
      `Payment Method : ${inv.method}\n` +
      `Provider Split : ₹${inv.providerPayout}\n` +
      `=================================================\n` +
      `Thank you for choosing HomeEase Guru!\n` +
      `Support: support@homeeaseguru.com\n`;

    const link = document.createElement('a');
    link.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(text);
    link.download = `Invoice_${inv.invoiceNumber}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Invoice Downloaded', `Saved ${inv.invoiceNumber} to downloads.`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            Payment & Financial Clearinghouse
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-electric-500/20 text-electric-400 font-mono font-bold">
              ₹{totalGross.toLocaleString()} Gross Volume
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time merchant clearing, provider splits, invoice generation, and refund processing.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Gross Collections</span>
          <p className="text-2xl font-black text-electric-400 font-mono mt-1">₹{totalGross.toLocaleString()}</p>
          <span className="text-[11px] text-slate-400">Card, Stripe & UPI verified</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Provider Payouts</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-1">₹{totalPayouts.toLocaleString()}</p>
          <span className="text-[11px] text-slate-400">65% Standard technician split</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Net Gross Margin</span>
          <p className="text-2xl font-black text-cyan-400 font-mono mt-1">₹{netOperatingMargin.toLocaleString()}</p>
          <span className="text-[11px] text-electric-400 font-mono font-semibold">35% Net retention</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Pending Invoices</span>
          <p className="text-2xl font-black text-amber-400 font-mono mt-1">₹{totalPending.toLocaleString()}</p>
          <span className="text-[11px] text-slate-400">Awaiting customer clearance</span>
        </div>
      </div>

      {/* Search and Status Filters */}
      <div className="p-3.5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search payments by customer, invoice number, or service..."
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
          <option value="all">Status: All</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>

      {/* Transaction History Table */}
      <div className="rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-navy-800 bg-slate-50/70 dark:bg-navy-950/70 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
                <th className="py-3.5 px-4 font-semibold">Invoice & Date</th>
                <th className="py-3.5 px-4 font-semibold">Customer</th>
                <th className="py-3.5 px-4 font-semibold">Service Package</th>
                <th className="py-3.5 px-4 font-semibold">Gross Amount</th>
                <th className="py-3.5 px-4 font-semibold">Provider Split</th>
                <th className="py-3.5 px-4 font-semibold">Status / Method</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-navy-800">
              {filteredPayments.map(p => (
                <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-navy-850/60 transition-colors">
                  <td className="py-3.5 px-4">
                    <span className="font-mono font-bold text-slate-900 dark:text-white block">{p.invoiceNumber}</span>
                    <span className="text-[11px] text-slate-400 font-mono">{p.date}</span>
                  </td>

                  <td className="py-3.5 px-4">
                    <p className="font-bold text-slate-900 dark:text-white">{p.customerName}</p>
                    <p className="text-[11px] text-slate-400 truncate max-w-[150px]">{p.customerEmail}</p>
                  </td>

                  <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-medium">
                    {p.serviceName}
                  </td>

                  <td className="py-3.5 px-4 font-mono font-bold text-electric-400 text-sm">
                    ₹{p.amount}
                  </td>

                  <td className="py-3.5 px-4 font-mono text-slate-400 text-xs">
                    ₹{p.providerPayout} (65%)
                  </td>

                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${
                      p.status === 'completed'
                        ? 'bg-electric-500/15 text-electric-400 border-electric-500/30'
                        : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                    }`}>
                      {p.status}
                    </span>
                    <span className="block text-[10px] text-slate-400 font-mono mt-0.5">{p.method}</span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setSelectedInvoice(p)}
                        className="px-2.5 py-1 rounded-lg bg-electric-500/15 text-electric-400 hover:bg-electric-500/25 font-semibold text-[11px]"
                      >
                        View Invoice
                      </button>
                      {p.status === 'completed' && (
                        <button
                          onClick={() => {
                            setRefundTarget(p);
                            setShowRefundModal(true);
                          }}
                          className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-navy-800 text-slate-400 hover:text-rose-400 text-[11px]"
                          title="Issue Refund"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* PROFESSIONAL INVOICE VIEWER MODAL */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-xl rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 shadow-2xl p-6 overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-navy-800">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-electric-400" />
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Invoice #{selectedInvoice.invoiceNumber}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownloadInvoice(selectedInvoice)}
                  className="p-1.5 rounded-lg bg-slate-100 dark:bg-navy-800 text-slate-400 hover:text-white"
                  title="Download Invoice"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={handlePrintInvoice}
                  className="p-1.5 rounded-lg bg-slate-100 dark:bg-navy-800 text-slate-400 hover:text-white"
                  title="Print Invoice"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button onClick={() => setSelectedInvoice(null)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="py-4 space-y-4 text-xs text-slate-700 dark:text-slate-300">
              {/* Invoice Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-black text-slate-900 dark:text-white text-base">HOMEEASE GURU</h4>
                  <p className="text-[11px] text-slate-400 font-mono">Enterprise Sanitization & Facility Care</p>
                  <p className="text-[11px] text-slate-400 mt-1">support@homeeaseguru.com • +1 (800) 555-EASE</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-mono font-bold text-electric-400 bg-electric-500/10 border border-electric-500/20 px-2 py-0.5 rounded">
                    PAID IN FULL
                  </span>
                  <p className="text-[11px] font-mono text-slate-400 mt-1">Date: {selectedInvoice.date}</p>
                </div>
              </div>

              {/* Billed to */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-800">
                <span className="text-[10px] text-slate-400 uppercase font-mono font-bold">Billed To:</span>
                <p className="font-bold text-slate-900 dark:text-white text-xs mt-0.5">{selectedInvoice.customerName}</p>
                <p className="text-[11px] text-slate-400">{selectedInvoice.customerEmail}</p>
              </div>

              {/* Line items */}
              <div className="border border-slate-200 dark:border-navy-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-navy-850 text-slate-400 font-mono text-[10px] uppercase">
                    <tr>
                      <th className="p-2.5">Item Description</th>
                      <th className="p-2.5 text-right">Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-navy-800">
                    <tr>
                      <td className="p-2.5 font-medium">{selectedInvoice.serviceName}</td>
                      <td className="p-2.5 text-right font-mono">₹{selectedInvoice.amount}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Total calculation */}
              <div className="pt-2 border-t border-slate-200 dark:border-navy-800 space-y-1 text-right font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal</span>
                  <span>₹{selectedInvoice.amount}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Sales Tax (0.00%)</span>
                  <span>₹0.00</span>
                </div>
                <div className="flex justify-between text-base font-extrabold text-electric-400 pt-1 border-t border-slate-200 dark:border-navy-800">
                  <span>Total Paid</span>
                  <span>₹{selectedInvoice.amount}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-navy-800 flex items-center justify-end">
              <button
                onClick={() => setSelectedInvoice(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-navy-800 text-slate-800 dark:text-white font-semibold text-xs"
              >
                Close Invoice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REFUND MODAL */}
      {showRefundModal && refundTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 shadow-2xl p-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Process Merchant Refund
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Refund ₹{refundTarget.amount} to {refundTarget.customerName} via original payment method ({refundTarget.method}).
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Refund Reason</label>
                <textarea
                  rows={3}
                  value={refundReason}
                  onChange={e => setRefundReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  onClick={() => setShowRefundModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleProcessRefund}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold"
                >
                  Execute Refund
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
