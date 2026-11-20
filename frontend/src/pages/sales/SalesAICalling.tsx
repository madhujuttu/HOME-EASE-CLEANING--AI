import React, { useState, useEffect } from 'react';
import { useCrm } from '../../context/CrmContext';
import {
  Mic,
  Phone,
  PhoneOff,
  Sparkles,
  Volume2,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  FileText,
  User,
  Clock,
  ShieldCheck
} from 'lucide-react';

export const SalesAICalling: React.FC = () => {
  const { leads, addCallLog, showToast } = useCrm();

  const [activeLead, setActiveLead] = useState<any>(leads[0]);
  const [isCalling, setIsCalling] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  // Live real-time transcript stream
  const [liveTranscript, setLiveTranscript] = useState<{ speaker: string; text: string; time: string }[]>([]);

  // AI live objection prompt suggestions
  const [aiPrompts, setAiPrompts] = useState<string[]>([
    'Greeting: Introduce yourself as Marcus Vance from HomeEase Guru.',
    'Ask about property size and key concerns (post-paint dust, limestone sealing).'
  ]);

  useEffect(() => {
    let interval: any;
    if (isCalling) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isCalling]);

  const handleStartCall = () => {
    setIsCalling(true);
    setCallDuration(0);
    setLiveTranscript([
      { speaker: 'System', text: 'Call connected to ' + activeLead.name + ' (' + activeLead.phone + ')', time: '00:01' },
      { speaker: 'Marcus Vance', text: 'Hello ' + activeLead.name + '! This is Marcus Vance calling from HomeEase Guru regarding your sanitization inquiry.', time: '00:04' }
    ]);

    setTimeout(() => {
      setLiveTranscript(prev => [
        ...prev,
        { speaker: activeLead.name, text: 'Hi Marcus! Yes, our contractors just finished painting and dust is everywhere. Are you able to come this Thursday?', time: '00:12' }
      ]);
      setAiPrompts([
        '⚡ OBJECTION / TIMELINE CUE: Confirm Thursday 8:00 AM availability with 4-person senior crew.',
        'Mention our 120-point hospital grade HEPA vacuuming to ensure no dust in AC vents.'
      ]);
    }, 4000);
  };

  const handleEndCall = () => {
    setIsCalling(false);
    addCallLog({
      type: 'outbound',
      customerName: activeLead.name,
      phone: activeLead.phone,
      durationSeconds: callDuration,
      status: 'completed',
      agentType: 'human_sales',
      agentName: 'Marcus Vance',
      sentiment: 'positive',
      consentGiven: true,
      summary: `Sales consultation with ${activeLead.name}. Customer agreed to Thursday 8:00 AM booking for villa sanitization. Verified 5,500 sqft residence.`,
      extractedRequirements: ['Thursday 8 AM execution', '120-point HEPA dust scrub'],
      recommendedAction: 'Send binding contract link with ₹750 deposit invoice.',
      transcript: liveTranscript
    });
    showToast('Sales Call Finalized', 'Auto-notes and CRM activity logged.', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            AI Sales Copilot Dialer & Calling Studio
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-electric-500/20 text-electric-400 font-mono font-bold">
              Real-time Copilot
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Live speech transcription, instant objection rebuttals, and auto-generated customer notes.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Lead Selector & Dial Pad */}
        <div className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm space-y-4 text-xs">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Target Lead</h3>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">Select Lead to Call</label>
            <select
              value={activeLead?.id}
              onChange={e => setActiveLead(leads.find(l => l.id === e.target.value))}
              disabled={isCalling}
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white font-medium"
            >
              {leads.map(l => (
                <option key={l.id} value={l.id}>
                  {l.name} ({l.serviceInterest})
                </option>
              ))}
            </select>
          </div>

          {activeLead && (
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-800 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Phone</span>
                <span className="font-mono text-slate-900 dark:text-white font-bold">{activeLead.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Service</span>
                <span className="font-bold text-electric-400 truncate max-w-[150px]">{activeLead.serviceInterest}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Estimated Value</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">₹{activeLead.estimatedValue}</span>
              </div>
            </div>
          )}

          {/* Call Trigger Button */}
          {!isCalling ? (
            <button
              onClick={handleStartCall}
              className="w-full py-3 rounded-xl bg-electric-500 hover:bg-electric-400 text-navy-950 font-bold text-xs shadow-glow-sm flex items-center justify-center gap-2 transition-all"
            >
              <Phone className="w-4 h-4" />
              Start Live AI Call Session
            </button>
          ) : (
            <button
              onClick={handleEndCall}
              className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg flex items-center justify-center gap-2 transition-all"
            >
              <PhoneOff className="w-4 h-4" />
              End Call & Save Notes
            </button>
          )}
        </div>

        {/* Center: Live Call Monitor & Audio Waveform */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-navy-800">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${isCalling ? 'bg-electric-400 animate-ping' : 'bg-slate-400'}`} />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {isCalling ? `On Call: ${activeLead?.name}` : 'Call Audio Inactive'}
                </h3>
              </div>
              <span className="font-mono text-xs font-bold text-electric-400">
                {Math.floor(callDuration / 60)}:{(callDuration % 60).toString().padStart(2, '0')}
              </span>
            </div>

            {/* Waveform visualizer */}
            <div className="my-3 p-3 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 flex items-center justify-center gap-1.5 h-14">
              {[30, 60, 90, 45, 100, 35, 75, 80, 20, 85, 95, 40, 70, 80, 50].map((h, i) => (
                <div
                  key={i}
                  className="w-1.5 bg-electric-400 rounded-full transition-all"
                  style={{ height: `${(h * (isCalling ? 1 : 0.15))}%` }}
                />
              ))}
            </div>

            {/* Live Transcript Stream */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 max-h-48 overflow-y-auto custom-scrollbar space-y-2 text-xs">
              {liveTranscript.length === 0 ? (
                <p className="text-slate-400 text-center py-6 italic">Press "Start Live AI Call Session" to begin conversation.</p>
              ) : (
                liveTranscript.map((t, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="font-mono text-[10px] text-slate-400 mt-0.5">{t.time}</span>
                    <span className="font-bold text-electric-400">{t.speaker}:</span>
                    <span className="text-slate-800 dark:text-slate-200">{t.text}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* AI Live Objection Handling Cues */}
          <div className="p-4 rounded-xl bg-electric-500/10 border border-electric-500/30 space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-electric-400" />
              <h4 className="font-bold text-xs text-white">AI Real-Time Sales Cues & Rebuttals</h4>
            </div>
            <div className="space-y-1.5">
              {aiPrompts.map((cue, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-slate-200">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <span>{cue}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
