import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import { CallLog } from '../../types';
import {
  PhoneCall,
  PhoneIncoming,
  PhoneOutgoing,
  Play,
  Pause,
  Clock,
  Sparkles,
  X,
  FileText
} from 'lucide-react';

export const SalesCallHistory: React.FC = () => {
  const { callLogs } = useCrm();

  const [selectedCall, setSelectedCall] = useState<CallLog | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            My Call Records & Recordings
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-electric-500/20 text-electric-400 font-mono font-bold">
              {callLogs.length} logs
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Replay recorded sales conversations, verify extracted customer requirements, and audit sentiment.
          </p>
        </div>
      </div>

      {/* Call History Table */}
      <div className="rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-navy-800 bg-slate-50/70 dark:bg-navy-950/70 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
                <th className="py-3.5 px-4 font-semibold">Caller Contact</th>
                <th className="py-3.5 px-4 font-semibold">Type & Agent</th>
                <th className="py-3.5 px-4 font-semibold">Duration</th>
                <th className="py-3.5 px-4 font-semibold">Sentiment</th>
                <th className="py-3.5 px-4 font-semibold">AI Call Summary</th>
                <th className="py-3.5 px-4 font-semibold text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-navy-800">
              {callLogs.map(call => (
                <tr
                  key={call.id}
                  onClick={() => setSelectedCall(call)}
                  className="hover:bg-slate-50 dark:hover:bg-navy-850/60 cursor-pointer transition-colors"
                >
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-slate-900 dark:text-white">{call.customerName}</p>
                    <p className="text-[11px] text-slate-400 font-mono">{call.phone}</p>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{call.agentName}</span>
                    <span className="block text-[10px] text-slate-400 font-mono">{call.timestamp}</span>
                  </td>

                  <td className="py-3.5 px-4 font-mono font-semibold text-slate-800 dark:text-slate-200">
                    {Math.floor(call.durationSeconds / 60)}m {call.durationSeconds % 60}s
                  </td>

                  <td className="py-3.5 px-4 capitalize">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-electric-500/15 text-electric-400">
                      {call.sentiment}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <p className="text-slate-600 dark:text-slate-300 line-clamp-2 max-w-sm leading-relaxed">
                      {call.summary}
                    </p>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        setSelectedCall(call);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-electric-500/15 text-electric-400 hover:bg-electric-500/25 font-semibold text-[11px]"
                    >
                      Audit →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL MODAL */}
      {selectedCall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-xl rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 shadow-2xl p-6 overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-navy-800">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  {selectedCall.customerName}
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">#{selectedCall.id} • {selectedCall.timestamp}</p>
              </div>
              <button onClick={() => setSelectedCall(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-800">
                <h4 className="font-bold text-slate-900 dark:text-white font-mono uppercase text-[11px] mb-1">
                  AI Summary & Outcome
                </h4>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{selectedCall.summary}</p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 dark:text-white font-mono uppercase text-[11px] mb-2">
                  Call Transcript
                </h4>
                <div className="space-y-2 p-3 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-800">
                  {selectedCall.transcript.map((line, idx) => (
                    <div key={idx} className="text-xs">
                      <span className="font-bold text-electric-400 font-mono">{line.speaker}:</span>
                      <span className="text-slate-700 dark:text-slate-200 ml-1.5">{line.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-navy-800 flex justify-end">
              <button
                onClick={() => setSelectedCall(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-navy-800 text-slate-800 dark:text-white font-semibold text-xs"
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
