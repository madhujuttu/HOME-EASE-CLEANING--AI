import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import {
  Sparkles,
  Calendar,
  CheckCircle,
  AlertTriangle,
  CheckSquare,
  Clock,
  UserCheck,
  Plus
} from 'lucide-react';

export const SalesMeetingIntelligence: React.FC = () => {
  const { meetings, addTask, showToast } = useCrm();

  const handleConvertActionItems = (m: any) => {
    if (!m.actionItems || m.actionItems.length === 0) return;
    m.actionItems.forEach((act: string) => {
      addTask({
        title: act,
        customerName: m.customerName,
        priority: 'high',
        dueDate: 'Tomorrow, 5:00 PM'
      });
    });
    showToast('Action Items Queued', `Created ${m.actionItems.length} tasks in your to-do checklist.`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            Meeting Intelligence & Transcription Hub
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Automated requirement extraction, objection breakdown, and actionable next steps.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {meetings.map(m => (
          <div
            key={m.id}
            className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-navy-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{m.title}</h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Client: {m.customerName} • {m.dateTime} • Rep: {m.employeeName}
                </p>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-electric-500/15 text-electric-400 border border-electric-500/30 self-start sm:self-auto">
                {m.status}
              </span>
            </div>

            {m.aiSummary && (
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                <Sparkles className="w-4 h-4 text-electric-400 inline mr-2" />
                <strong>AI Executive Synthesis: </strong>{m.aiSummary}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {m.customerRequirements && (
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-800 space-y-2">
                  <h4 className="font-bold text-slate-900 dark:text-white font-mono uppercase text-[11px]">
                    Extracted Customer Specifications
                  </h4>
                  <ul className="space-y-1">
                    {m.customerRequirements.map((r, i) => (
                      <li key={i} className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                        <CheckCircle className="w-3.5 h-3.5 text-electric-400 flex-shrink-0" />
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {m.actionItems && (
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 dark:text-white font-mono uppercase text-[11px]">
                      Action Items Checklist
                    </h4>
                    <button
                      onClick={() => handleConvertActionItems(m)}
                      className="px-2.5 py-1 rounded-lg bg-electric-500 hover:bg-electric-400 text-navy-950 font-bold text-[10px] flex items-center gap-1 shadow-sm transition-all"
                    >
                      <Plus className="w-3 h-3" /> Queue as CRM Tasks
                    </button>
                  </div>
                  <ul className="space-y-1">
                    {m.actionItems.map((act, i) => (
                      <li key={i} className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                        <CheckSquare className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                        <span>{act}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
