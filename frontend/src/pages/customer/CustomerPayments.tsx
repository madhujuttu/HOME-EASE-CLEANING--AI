import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import { Payment } from '../../types';
import {
  CreditCard,
  Download,
  FileText,
  CheckCircle,
  X,
  Printer,
  ShieldCheck,
  Plus
} from 'lucide-react';

export const CustomerPayments: React.FC = () => {
  const { payments, updatePayment, showToast } = useCrm();

  const [selectedInvoice, setSelectedInvoice] = useState<Payment | null>(null);
  const [showPayModal, setShowPayModal] = useState(false);
  const [payTarget, setPayTarget] = useState<Payment | null>(null);

  // Sophia Montgomery's payments
  const myPayments = payments;

  const handlePayNow = () => {
    if (!payTarget) return;
    updatePayment(payTarget.id, { status: 'completed' });
    showToast('Payment Successful', `Paid ₹${payTarget.amount} for ${payTarget.serviceName}.`, 'success');
    setShowPayModal(false);
  };

  const handleDownloadReceipt = (inv: Payment) => {
    const text = `=================================================\n` +
      `          HOMEEASE GURU — PAYMENT RECEIPT         \n` +
      `=================================================\n` +
      `Receipt No     : ${inv.receiptNumber || 'RCP-8891'}\n` +
      `Invoice Ref    : ${inv.invoiceNumber}\n` +
      `Date           : ${inv.date}\n` +
      `Customer       : ${inv.customerName}\n` +
      `Service        : ${inv.serviceName}\n` +
      `Amount Paid    : ₹${inv.amount}\n` +
      `Method         : ${inv.method}\n` +
      `Status         : ${inv.status.toUpperCase()}\n` +
      `=================================================\n` +
      `Thank you for your business!\n`;
    const link = document.createElement('a');
    link.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(text);
    link.download = `Receipt_${inv.invoiceNumber}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Receipt Downloaded', `Saved receipt for ${inv.invoiceNumber}.`, 'success');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            Payment Records & Digital Receipts
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Download verified tax invoices, manage saved payment cards, and clear balances.
          </p>
        </div>
      </div>

      <div className="rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-navy-800 bg-slate-50/70 dark:bg-navy-950/70 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
                <th className="py-3.5 px-4 font-semibold">Invoice No</th>
                <th className="py-3.5 px-4 font-semibold">Service Package</th>
                <th className="py-3.5 px-4 font-semibold">Date</th>
                <th className="py-3.5 px-4 font-semibold">Amount</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold text-right">Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-navy-800">
              {myPayments.map(p => (
                <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-navy-850/60 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-electric-400">
                    {p.invoiceNumber}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">
                    {p.serviceName}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px]">
                    {p.date}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white text-sm">
                    ₹{p.amount}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                      p.status === 'completed'
                        ? 'bg-electric-500/15 text-electric-400'
                        : 'bg-amber-500/15 text-amber-400'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setSelectedInvoice(p)}
                        className="px-2.5 py-1 rounded-lg bg-electric-500/15 text-electric-400 hover:bg-electric-500/25 font-semibold text-[11px]"
                      >
                        Receipt
                      </button>
                      {p.status === 'pending' && (
                        <button
                          onClick={() => {
                            setPayTarget(p);
                            setShowPayModal(true);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-electric-500 hover:bg-electric-400 text-navy-950 font-bold text-[11px]"
                        >
                          Pay Now
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

      {/* INVOICE MODAL */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-navy-800">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Invoice #{selectedInvoice.invoiceNumber}
              </h3>
              <button onClick={() => setSelectedInvoice(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs text-slate-700 dark:text-slate-300">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">HOMEEASE GURU</h4>
                  <p className="text-[11px] text-slate-400 font-mono">Invoice #{selectedInvoice.invoiceNumber}</p>
                </div>
                <span className="text-xs font-mono font-bold text-electric-400 bg-electric-500/15 px-2.5 py-0.5 rounded">
                  {selectedInvoice.status.toUpperCase()}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-800 space-y-1">
                <p className="font-semibold text-slate-900 dark:text-white">{selectedInvoice.serviceName}</p>
                <p className="text-[11px] text-slate-400">Payment Method: {selectedInvoice.method}</p>
                <p className="text-[11px] text-slate-400 font-mono">Date: {selectedInvoice.date}</p>
              </div>

              <div className="flex justify-between items-center pt-2 font-mono text-base font-bold text-electric-400 border-t border-slate-200 dark:border-navy-800">
                <span>Total Amount</span>
                <span>₹{selectedInvoice.amount}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-navy-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownloadReceipt(selectedInvoice)}
                  className="px-3 py-1.5 rounded-xl bg-electric-500 hover:bg-electric-400 text-navy-950 font-bold text-xs flex items-center gap-1.5 shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" /> Download Receipt
                </button>
                <button
                  onClick={() => window.print()}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-navy-800 text-slate-400 hover:text-white"
                  title="Print Invoice"
                >
                  <Printer className="w-3.5 h-3.5" />
                </button>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-navy-800 text-slate-800 dark:text-white font-semibold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PAY NOW MODAL */}
      {showPayModal && payTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 shadow-2xl p-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              Pay Invoice #{payTarget.invoiceNumber}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Clear balance of ₹{payTarget.amount} for {payTarget.serviceName}.
            </p>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-800 space-y-2 mb-4 text-xs">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-electric-400" />
                <span className="font-mono">Ending in •••• 4492 (Visa)</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5">
              <button
                onClick={() => setShowPayModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handlePayNow}
                className="px-4 py-2 rounded-xl bg-electric-500 hover:bg-electric-400 text-navy-950 text-xs font-bold"
              >
                Confirm Payment of ₹{payTarget.amount}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
