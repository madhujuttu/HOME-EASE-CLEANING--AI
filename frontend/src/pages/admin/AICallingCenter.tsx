import React, { useState, useEffect } from 'react';
import { useCrm } from '../../context/CrmContext';
import { CallLog, CallStatus } from '../../types';
import {
  PhoneCall,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneOff,
  Mic,
  Volume2,
  Sparkles,
  Play,
  Pause,
  Sliders,
  ShieldCheck,
  UserCheck,
  CheckCircle,
  XCircle,
  Clock,
  Radio,
  Share2,
  ChevronRight,
  X,
  FileText,
  AlertTriangle
} from 'lucide-react';

export const AICallingCenter: React.FC = () => {
  const { callLogs, addCallLog, showToast } = useCrm();

  const [activeTab, setActiveTab] = useState<'monitoring' | 'outbound' | 'history' | 'config'>('monitoring');
  const [selectedCall, setSelectedCall] = useState<CallLog | null>(null);

  // Active call simulator state
  const [isSimulatingCall, setIsSimulatingCall] = useState(false);
  const [simCallStatus, setSimCallStatus] = useState<CallStatus>('initiated');
  const [simPhoneNumber, setSimPhoneNumber] = useState('+1 (555) 890-4412');
  const [simCustomerName, setSimCustomerName] = useState('Lady Katherine Vance');
  const [simSeconds, setSimSeconds] = useState(0);
  const [simLiveTranscript, setSimLiveTranscript] = useState<{ speaker: string; text: string; time: string }[]>([]);

  // Audio player simulation state
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [playbackSeconds, setPlaybackSeconds] = useState(0);

  // Config state
  const [voicePersona, setVoicePersona] = useState('Aria (Empathetic & Polished Concierge)');
  const [speechRate, setSpeechRate] = useState(1.0);
  const [handoffThreshold, setHandoffThreshold] = useState(85);
  const [recordConsentRequired, setRecordConsentRequired] = useState(true);

  // Timer for active call simulation
  useEffect(() => {
    let interval: any;
    if (isSimulatingCall && (simCallStatus === 'connected' || simCallStatus === 'ringing')) {
      interval = setInterval(() => {
        setSimSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isSimulatingCall, simCallStatus]);

  // Audio player simulator
  useEffect(() => {
    let interval: any;
    if (isPlayingAudio) {
      interval = setInterval(() => {
        setPlaybackSeconds(prev => {
          if (prev >= 45) {
            setIsPlayingAudio(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlayingAudio]);

  const handleToggleAudioPlayback = () => {
    if (!isPlayingAudio) {
      setIsPlayingAudio(true);
      if ('speechSynthesis' in window && selectedCall?.summary) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(selectedCall.summary);
        utterance.rate = 1.05;
        utterance.onend = () => setIsPlayingAudio(false);
        utterance.onerror = () => setIsPlayingAudio(false);
        window.speechSynthesis.speak(utterance);
      }
    } else {
      setIsPlayingAudio(false);
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    }
  };

  const handleStartOutboundCall = () => {
    setIsSimulatingCall(true);
    setSimCallStatus('initiated');
    setSimSeconds(0);
    setSimLiveTranscript([
      { speaker: 'System Engine', text: 'Initiating telephony session via authorized carrier SIP trunk...', time: '00:00' }
    ]);

    setTimeout(() => {
      setSimCallStatus('ringing');
      setSimLiveTranscript(prev => [
        ...prev,
        { speaker: 'Carrier Gateway', text: 'Cellular network ringing recipient handset...', time: '00:03' }
      ]);
    }, 1500);

    setTimeout(() => {
      setSimCallStatus('connected');
      setSimLiveTranscript(prev => [
        ...prev,
        { speaker: 'Aria (AI Voice)', text: `Hello ${simCustomerName}! This is Aria, an automated assistant calling transparently on behalf of HomeEase Guru. This call may be recorded for quality assurance. How can I assist with your sanitization inquiry today?`, time: '00:06' },
        { speaker: simCustomerName, text: 'Hello Aria. Yes, I saw your advertisement for villa sanitization. Do you use eco-friendly steam?', time: '00:15' }
      ]);
    }, 3500);
  };

  const handleEndSimCall = () => {
    setIsSimulatingCall(false);
    setSimCallStatus('completed');
    addCallLog({
      type: 'outbound',
      customerName: simCustomerName,
      phone: simPhoneNumber,
      durationSeconds: simSeconds,
      status: 'completed',
      agentType: 'ai_voice',
      agentName: 'Aria (AI Voice Assistant v4.2)',
      sentiment: 'positive',
      consentGiven: true,
      summary: `Automated outbound consultation with ${simCustomerName}. Customer confirmed inquiry regarding eco-friendly steam sanitization. Scheduled callback with sales specialist.`,
      extractedRequirements: ['Eco-friendly steam only', 'Villa floor polishing'],
      recommendedAction: 'Send digital rate brochure with non-toxic chemical certification.',
      transcript: simLiveTranscript
    });
    showToast('AI Voice Call Completed', 'Call audio transcribed and CRM record updated.', 'success');
  };

  const handleTriggerHumanHandoff = () => {
    setSimLiveTranscript(prev => [
      ...prev,
      { speaker: 'Aria (AI Voice)', text: 'Allow me to seamlessly connect you with our senior operations director, Marcus Vance, who is on standby.', time: '00:28' },
      { speaker: 'System Telephony', text: 'Transferred session to Marcus Vance (Extension #104). Warm handoff complete.', time: '00:30' }
    ]);
    showToast('Human Handoff Executed', 'Call successfully bridged to sales representative.', 'info');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            AI Voice Telephony Command Center
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-electric-500/20 text-electric-400 font-mono font-bold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-electric-400 animate-ping" />
              SIP TRUNK LIVE
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Autonomous inbound reception, outbound lead follow-up, real-time transcription, and warm human handoff.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('outbound')}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-electric-500 hover:bg-electric-400 text-navy-950 font-bold text-xs shadow-glow-sm transition-all self-start sm:self-auto"
        >
          <PhoneOutgoing className="w-4 h-4" />
          Launch AI Outbound Call
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-navy-800 text-xs font-semibold">
        {[
          { key: 'monitoring', label: 'Inbound & Live Monitoring', icon: Radio },
          { key: 'outbound', label: 'Outbound Voice Dialer', icon: PhoneOutgoing },
          { key: 'history', label: 'Call History & Transcripts', icon: FileText },
          { key: 'config', label: 'AI Voice Configuration', icon: Sliders },
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`pb-3 px-3.5 flex items-center gap-2 transition-all border-b-2 ${
                activeTab === tab.key
                  ? 'border-electric-400 text-electric-400 font-bold'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: MONITORING */}
      {activeTab === 'monitoring' && (
        <div className="space-y-6">
          {/* Real-time Status Badges */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Inbound AI Lines</span>
              <p className="text-2xl font-black text-electric-400 font-mono mt-1">4 / 4 Active</p>
              <span className="text-[11px] text-slate-400">0 calls queued in IVR</span>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Average Handle Time</span>
              <p className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-1">2m 45s</p>
              <span className="text-[11px] text-electric-400 font-mono font-semibold">-34s faster than human</span>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">First-Call Resolution</span>
              <p className="text-2xl font-black text-cyan-400 font-mono mt-1">78.4%</p>
              <span className="text-[11px] text-slate-400">Direct bookings or audits</span>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Human Handoff Rate</span>
              <p className="text-2xl font-black text-purple-400 font-mono mt-1">12.2%</p>
              <span className="text-[11px] text-slate-400">Complex enterprise scopes</span>
            </div>
          </div>

          {/* Active Call Live Feed or Simulation status */}
          {isSimulatingCall ? (
            <div className="p-6 rounded-2xl bg-gradient-to-r from-navy-900 via-navy-850 to-navy-900 border-2 border-electric-500/50 shadow-glow">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-4">
                  <img src="/logo.png" alt="Aria AI Voice" className="w-16 h-16 rounded-2xl object-cover border-2 border-electric-500/50 shadow-glow flex-shrink-0" />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-extrabold text-white">
                        Active Call: {simCustomerName}
                      </h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-electric-500 text-navy-950">
                        {simCallStatus}
                      </span>
                    </div>
                    <p className="text-xs font-mono text-slate-300 mt-0.5">
                      {simPhoneNumber} • Duration: {Math.floor(simSeconds / 60)}:{(simSeconds % 60).toString().padStart(2, '0')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    onClick={handleTriggerHumanHandoff}
                    className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-navy-950 font-bold text-xs flex items-center gap-1.5 transition-all"
                  >
                    <UserCheck className="w-4 h-4" /> Transfer to Human
                  </button>
                  <button
                    onClick={handleEndSimCall}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg transition-all"
                  >
                    <PhoneOff className="w-4 h-4" /> End Call
                  </button>
                </div>
              </div>

              {/* Simulated Real-Time Audio Waveform */}
              <div className="my-4 p-3 rounded-xl bg-navy-950/80 border border-navy-800 flex items-center justify-center gap-1 h-16">
                {[40, 65, 80, 30, 95, 45, 75, 85, 30, 90, 60, 45, 80, 100, 50, 70, 90, 40, 60, 85].map((h, i) => (
                  <div
                    key={i}
                    className="w-1.5 bg-electric-400 rounded-full animate-pulse"
                    style={{ height: `${(h * (simCallStatus === 'connected' ? 1 : 0.2))}%`, animationDelay: `${i * 0.05}s` }}
                  />
                ))}
              </div>

              {/* Live Transcript Stream */}
              <div className="p-4 rounded-xl bg-navy-950 border border-navy-800 space-y-2.5 max-h-56 overflow-y-auto custom-scrollbar text-xs">
                {simLiveTranscript.map((t, idx) => (
                  <div key={idx} className="flex items-start gap-2.5">
                    <span className="font-mono text-[10px] text-slate-500 mt-0.5">{t.time}</span>
                    <div>
                      <span className={`font-bold font-mono text-[11px] ${
                        t.speaker.includes('AI') ? 'text-electric-400' : 'text-blue-400'
                      }`}>
                        {t.speaker}:
                      </span>
                      <span className="text-slate-200 ml-1.5 leading-relaxed">{t.text}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-center space-y-3">
              <Radio className="w-10 h-10 text-electric-400/40 mx-auto" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Telephony Gateway Idle • Standing by for Inbound Calls
              </h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                AI Voice Agents (Aria & Orion) are actively listening on inbound lines. Any caller will be greeted with instant speech recognition.
              </p>
              <button
                onClick={handleStartOutboundCall}
                className="mt-2 px-4 py-2 rounded-xl bg-electric-500 hover:bg-electric-400 text-navy-950 font-bold text-xs shadow-glow-sm"
              >
                Simulate Live Outbound Call
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: OUTBOUND VOICE DIALER */}
      {activeTab === 'outbound' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Automated Voice Follow-Up Dispatcher
            </h3>
            <p className="text-xs text-slate-400">
              Trigger instant authorized outbound AI follow-ups to qualified leads.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Customer Full Name</label>
                <input
                  type="text"
                  value={simCustomerName}
                  onChange={e => setSimCustomerName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Phone Number</label>
                <input
                  type="text"
                  value={simPhoneNumber}
                  onChange={e => setSimPhoneNumber(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Outbound Objective / Campaign</label>
                <select className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none">
                  <option>Post-Ad Submission 5-Minute Express Callback</option>
                  <option>Site Audit Confirmation & Reminder</option>
                  <option>Biannual Service Renewal Reminder</option>
                  <option>Deposit Invoice Follow-up</option>
                </select>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-electric-400" />
                  <span className="text-[11px] text-slate-700 dark:text-slate-300">
                    Consent & TCPA Compliance Verified
                  </span>
                </div>
                <span className="text-[10px] font-mono text-electric-400 font-bold">APPROVED</span>
              </div>

              <button
                disabled={isSimulatingCall}
                onClick={handleStartOutboundCall}
                className="w-full py-3 rounded-xl bg-electric-500 hover:bg-electric-400 disabled:opacity-50 text-navy-950 font-bold text-xs shadow-glow-sm transition-all"
              >
                {isSimulatingCall ? 'Call In Progress...' : 'Initiate AI Call Now'}
              </button>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-electric-400" />
              AI Script & Objective Guide
            </h3>
            <p className="text-xs text-slate-400">
              The AI Voice model uses dynamic Retrieval-Augmented Generation (RAG) based on our service catalogue.
            </p>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-800 space-y-2 text-xs text-slate-700 dark:text-slate-300">
              <p className="font-bold text-white font-mono">Approved Conversation Strategy:</p>
              <ul className="list-disc pl-4 space-y-1 text-slate-400 text-[11px]">
                <li>Transparent identity: "I am Aria, an AI concierge for HomeEase Guru."</li>
                <li>Mandatory Recording Consent statement within first 10 seconds.</li>
                <li>Ask property square footage and key pain points (grout, dust, stains).</li>
                <li>Offer 2 available consultation time slots (today 4:30 PM or tomorrow 11 AM).</li>
                <li>Escalate to human rep if customer mentions legal dispute or custom commercial RFP.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CALL HISTORY & TRANSCRIPTS */}
      {activeTab === 'history' && (
        <div className="rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-navy-800 bg-slate-50/70 dark:bg-navy-950/70 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
                  <th className="py-3.5 px-4 font-semibold">Caller & Type</th>
                  <th className="py-3.5 px-4 font-semibold">Agent / Model</th>
                  <th className="py-3.5 px-4 font-semibold">Duration</th>
                  <th className="py-3.5 px-4 font-semibold">Status / Sentiment</th>
                  <th className="py-3.5 px-4 font-semibold">Call Summary</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Transcript</th>
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
                      <div className="flex items-center gap-2.5">
                        <div className={`p-2 rounded-xl ${
                          call.type === 'inbound' ? 'bg-blue-500/10 text-blue-400' : 'bg-electric-500/10 text-electric-400'
                        }`}>
                          {call.type === 'inbound' ? <PhoneIncoming className="w-4 h-4" /> : <PhoneOutgoing className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{call.customerName}</p>
                          <p className="text-[11px] text-slate-400 font-mono">{call.phone}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{call.agentName}</span>
                      <span className="block text-[10px] text-slate-400 font-mono">{call.timestamp}</span>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-800 dark:text-slate-200">
                      {Math.floor(call.durationSeconds / 60)}m {call.durationSeconds % 60}s
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex flex-col gap-1 items-start">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                          call.status === 'completed' ? 'bg-electric-500/15 text-electric-400' : 'bg-amber-500/15 text-amber-400'
                        }`}>
                          {call.status}
                        </span>
                        <span className="text-[10px] text-slate-400 capitalize">
                          Sentiment: {call.sentiment}
                        </span>
                      </div>
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
                        className="px-2.5 py-1 rounded-lg bg-electric-500/15 text-electric-400 hover:bg-electric-500/25 font-semibold text-[11px] transition-colors"
                      >
                        View & Listen →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: CONFIGURATION */}
      {activeTab === 'config' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm max-w-2xl space-y-5">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            AI Voice Agent Engine Parameters
          </h3>
          <p className="text-xs text-slate-400">
            Configure speech synthesis, automatic consent disclosures, and warm transfer thresholds.
          </p>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Default Voice Persona</label>
              <select
                value={voicePersona}
                onChange={e => setVoicePersona(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none"
              >
                <option>Aria (Empathetic & Polished Concierge)</option>
                <option>Orion (Direct & Authoritative Sales Closer)</option>
                <option>Atlas (Technical & Precise Commercial Specialist)</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-400 font-medium">Speaking Pace: {speechRate}x</label>
                <span className="text-slate-400 font-mono text-[11px]">Optimal: 1.0x</span>
              </div>
              <input
                type="range"
                min="0.8"
                max="1.3"
                step="0.05"
                value={speechRate}
                onChange={e => setSpeechRate(Number(e.target.value))}
                className="w-full accent-electric-400"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-400 font-medium">Human Handoff Confidence Threshold: {handoffThreshold}%</label>
                <span className="text-slate-400 font-mono text-[11px]">Triggers transfer if AI confidence falls below</span>
              </div>
              <input
                type="range"
                min="60"
                max="95"
                step="5"
                value={handoffThreshold}
                onChange={e => setHandoffThreshold(Number(e.target.value))}
                className="w-full accent-electric-400"
              />
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-800 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-xs">Mandatory Call Recording Disclosure</h4>
                <p className="text-[11px] text-slate-400">Play "This call may be recorded" disclosure on every connected line.</p>
              </div>
              <input
                type="checkbox"
                checked={recordConsentRequired}
                onChange={e => setRecordConsentRequired(e.target.checked)}
                className="w-4 h-4 accent-electric-500 rounded"
              />
            </div>

            <button
              onClick={() => showToast('Voice Settings Saved', 'Telephony parameters updated.', 'success')}
              className="px-5 py-2.5 rounded-xl bg-electric-500 hover:bg-electric-400 text-navy-950 font-bold text-xs"
            >
              Save Configuration
            </button>
          </div>
        </div>
      )}

      {/* CALL DETAIL & TRANSCRIPT MODAL */}
      {selectedCall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 shadow-2xl p-6 max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-navy-800">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  Call Audit: {selectedCall.customerName}
                  <span className="text-xs px-2 py-0.5 rounded-full bg-electric-500/20 text-electric-400 font-mono">
                    #{selectedCall.id}
                  </span>
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  {selectedCall.timestamp} • {selectedCall.type.toUpperCase()} • {selectedCall.agentName}
                </p>
              </div>
              <button
                onClick={() => {
                  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
                  setIsPlayingAudio(false);
                  setSelectedCall(null);
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-4 custom-scrollbar text-xs">
              {/* Simulated Audio Player */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-800 flex items-center gap-3">
                <button
                  onClick={handleToggleAudioPlayback}
                  className="w-10 h-10 rounded-full bg-electric-500 text-navy-950 flex items-center justify-center font-bold flex-shrink-0 shadow-glow-sm transition-transform active:scale-95"
                >
                  {isPlayingAudio ? <Pause className="w-4 h-4 fill-navy-950" /> : <Play className="w-4 h-4 fill-navy-950 ml-0.5" />}
                </button>
                <div className="flex-1">
                  <div className="flex items-center justify-between font-mono text-[11px] text-slate-400 mb-1">
                    <span>Call Recording Playback</span>
                    <span>00:{playbackSeconds.toString().padStart(2, '0')} / 00:45</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-navy-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-electric-400 h-full rounded-full transition-all"
                      style={{ width: `${(playbackSeconds / 45) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Summary & Recommended Action */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-800 space-y-2">
                <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] font-mono">
                  AI Call Summary
                </h4>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  {selectedCall.summary}
                </p>
                <div className="pt-2 border-t border-slate-200 dark:border-navy-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>Sentiment: <strong className="text-electric-400 capitalize">{selectedCall.sentiment}</strong></span>
                  <span>Consent: <strong className="text-electric-400">{selectedCall.consentGiven ? 'Given' : 'N/A'}</strong></span>
                </div>
              </div>

              {/* Full Transcript */}
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] font-mono mb-2">
                  Verbatim Call Transcript
                </h4>
                <div className="space-y-2.5 max-h-64 overflow-y-auto p-3.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-800 custom-scrollbar">
                  {selectedCall.transcript.length === 0 ? (
                    <p className="text-slate-400 italic">No audio was captured for this call attempt.</p>
                  ) : (
                    selectedCall.transcript.map((line, i) => (
                      <div key={i} className="space-y-0.5">
                        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                          <span className={`font-bold ${
                            line.speaker.includes('AI') ? 'text-electric-400' : 'text-blue-400'
                          }`}>
                            {line.speaker}
                          </span>
                          <span>{line.time}</span>
                        </div>
                        <p className="text-slate-700 dark:text-slate-200 leading-relaxed text-xs">
                          {line.text}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-navy-800 flex items-center justify-end">
              <button
                onClick={() => {
                  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
                  setIsPlayingAudio(false);
                  setSelectedCall(null);
                }}
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
