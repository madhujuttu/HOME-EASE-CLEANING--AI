import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import {
  Cpu,
  Sparkles,
  TrendingUp,
  Brain,
  MessageSquare,
  AlertTriangle,
  FileCheck,
  CheckCircle,
  Download,
  Flame,
  Zap,
  Target,
  ArrowRight
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

const radarData = [
  { subject: 'Voice Intent', A: 95, fullMark: 100 },
  { subject: 'Square Footage', A: 85, fullMark: 100 },
  { subject: 'Urgency Velocity', A: 90, fullMark: 100 },
  { subject: 'Budget Alignment', A: 88, fullMark: 100 },
  { subject: 'Decision Authority', A: 92, fullMark: 100 },
  { subject: 'History Repeat', A: 75, fullMark: 100 },
];

export const AIIntelligenceCenter: React.FC = () => {
  const { insights, leads, showToast } = useCrm();

  const [activeModelTab, setActiveModelTab] = useState<'scoring' | 'followup' | 'analytics' | 'reports'>('scoring');
  const [reportGenerated, setReportGenerated] = useState(false);

  const handleApplyFollowUp = (customerName: string) => {
    showToast('AI Action Dispatched', `Automated follow-up message queued for ${customerName}.`, 'success');
  };

  const handleGenerateExecutiveReport = () => {
    setReportGenerated(true);
    setActiveModelTab('reports');
    showToast('AI Synthesis Complete', 'Executive Strategic Briefing generated.', 'success');
  };

  const handleExportExecutiveBrief = () => {
    const content = `HOMEEASE GURU — EXECUTIVE STRATEGIC BRIEFING\n` +
      `============================================================\n` +
      `Autonomous AI Synthesis • Generated: ${new Date().toLocaleDateString()}\n` +
      `Confidence Index: 96.4% • AI Model: Gemini 2.0 Decisions Engine\n\n` +
      `1. OPERATIONAL VELOCITY:\n` +
      `The integration of autonomous inbound voice handling has decreased lead\n` +
      `response latency from 42 minutes to 14 seconds (+41.2% conversion lift).\n\n` +
      `2. REVENUE PROJECTIONS:\n` +
      `Active pipeline funnel stands at ₹18,450. Projected Q4 target exceeded by\n` +
      `₹14,200 (+18.4% above budget).\n\n` +
      `3. TECHNICIAN UTILIZATION & FLEET:\n` +
      `Fleet operating at 74% capacity. Recommended onboarding: 2 specialists\n` +
      `prior to upcoming holiday demand surge.\n` +
      `============================================================\n`;

    const link = document.createElement('a');
    link.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(content);
    link.download = `HomeEase_Executive_AI_Brief_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Report Exported', 'Downloaded Executive AI Briefing report.', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            AI Intelligence Center
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Explainable lead scoring, automated sales forecasting, objection synthesis, and follow-up bots.
          </p>
        </div>

        <button
          onClick={handleGenerateExecutiveReport}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-electric-500 hover:bg-electric-400 text-navy-950 font-bold text-xs shadow-sm transition-all self-start sm:self-auto"
        >
          <FileCheck className="w-4 h-4" />
          Generate Executive AI Brief
        </button>
      </div>

      {/* Model Selector Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-navy-800 text-xs font-semibold">
        {[
          { key: 'scoring', label: 'AI Lead Scoring Engine' },
          { key: 'followup', label: 'Follow-up Intelligence Bot' },
          { key: 'analytics', label: 'Meeting & Voice Intelligence' },
          { key: 'reports', label: 'Executive Intelligence Briefing' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveModelTab(tab.key as any)}
            className={`pb-3 px-3.5 transition-all border-b-2 ${
              activeModelTab === tab.key
                ? 'border-electric-400 text-electric-400 font-bold'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: LEAD SCORING ENGINE */}
      {activeModelTab === 'scoring' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Explainability Radar */}
            <div className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                  Neural Scoring Factor Weights
                </h3>
                <p className="text-xs text-slate-400 mb-4">
                  Multi-variable model evaluates intent, property area, and response latency.
                </p>
                <div className="h-60 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                      <PolarGrid stroke="#1E293B" />
                      <PolarAngleAxis dataKey="subject" stroke="#64748B" fontSize={10} />
                      <PolarRadiusAxis stroke="#64748B" fontSize={8} />
                      <Radar name="Score Weight" dataKey="A" stroke="#00F59B" fill="#00F59B" fillOpacity={0.4} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <p className="text-[11px] font-mono text-electric-400 text-center">
                Accuracy: 94.2% verified by actual deal closures
              </p>
            </div>

            {/* Top Scored Leads Ready to Close */}
            <div className="lg:col-span-2 p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    High-Propensity Conversion Queue
                  </h3>
                  <p className="text-xs text-slate-400">Leads with 80%+ conversion probability requiring rep contact</p>
                </div>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-electric-500/15 text-electric-400 font-bold">
                  Top Priority
                </span>
              </div>

              <div className="space-y-3">
                {leads.filter(l => l.aiScore >= 80).map(lead => (
                  <div
                    key={lead.id}
                    className="p-4 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-800 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white text-xs">{lead.name}</span>
                        <span className="text-xs font-mono font-bold text-electric-400">Score: {lead.aiScore}/100</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{lead.aiScoreReason}</p>
                    </div>

                    <div className="text-right">
                      <span className="font-mono font-bold text-electric-400 text-sm">₹{lead.estimatedValue}</span>
                      <p className="text-[10px] text-slate-400 uppercase font-mono">{lead.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: FOLLOW-UP INTELLIGENCE BOT */}
      {activeModelTab === 'followup' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-electric-400" />
              Automated Follow-Up Recommendations
            </h3>
            <p className="text-xs text-slate-400">
              AI detects inactive leads, analyzes customer hesitation signals, and generates draft messages.
            </p>

            <div className="space-y-3">
              {[
                {
                  client: 'Melinda Vasquez',
                  leadId: 'lead-104',
                  reason: 'Ad submitter silent for 4+ hours; viewed sofa extraction video.',
                  draft: 'Hi Melinda! Orion from HomeEase Guru here. We have a crew in Pasadena tomorrow at 11 AM that can handle your velvet sofa with our ₹200 off first-time coupon. Would you like me to reserve the spot?',
                  channel: 'SMS / WhatsApp'
                },
                {
                  client: 'Claire Beauchamp',
                  leadId: 'lead-102',
                  reason: 'Turnkey deposit clean needed in 5 days; awaiting formal guarantee COI.',
                  draft: 'Dear Claire, attached is our signed Security Deposit Clearance Guarantee certificate for your Beverly Hills property manager. You can lock in Thursday with zero deposit risk here: [Invoice Link]',
                  channel: 'Email & SMS'
                }
              ].map((item, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white">{item.client}</span>
                    <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">{item.channel}</span>
                  </div>
                  <p className="text-[11px] text-slate-400">{item.reason}</p>
                  <div className="p-2.5 rounded-lg bg-navy-950/80 border border-navy-800 text-[11px] text-slate-200 font-mono leading-relaxed">
                    "{item.draft}"
                  </div>
                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => handleApplyFollowUp(item.client)}
                      className="px-3.5 py-1.5 rounded-lg bg-electric-500 hover:bg-electric-400 text-navy-950 font-bold text-xs"
                    >
                      Approve & Dispatch
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Cadence & Automation Rules
            </h3>
            <p className="text-xs text-slate-400">
              Centralized workflow triggers for follow-up notifications.
            </p>
            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-800">
                <span className="font-mono text-electric-400 font-bold uppercase text-[10px]">Rule #1</span>
                <p className="font-semibold text-slate-900 dark:text-white mt-0.5">New Web Lead Intake</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Auto-assign sales executive within 60 seconds; trigger Aria AI outbound follow-up within 5 minutes.</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-800">
                <span className="font-mono text-electric-400 font-bold uppercase text-[10px]">Rule #2</span>
                <p className="font-semibold text-slate-900 dark:text-white mt-0.5">Consultation Completed</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Auto-transcribe call audio; extract customer objections; dispatch PDF proposal within 2 hours.</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-800">
                <span className="font-mono text-electric-400 font-bold uppercase text-[10px]">Rule #3</span>
                <p className="font-semibold text-slate-900 dark:text-white mt-0.5">Overdue Follow-up Escalation</p>
                <p className="text-[11px] text-slate-400 mt-0.5">If assigned sales rep does not update lead within 24 hours, escalate deal to Sales Director.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MEETING & VOICE INTELLIGENCE */}
      {activeModelTab === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Customer Objection Synthesis</h3>
            <p className="text-xs text-slate-400">Top customer hesitation points extracted from voice calls</p>
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-800">
                <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                  <span>Chemical / Odor Concerns</span>
                  <span className="text-electric-400 font-mono">42%</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Rebuttal: Highlight pet-safe zero-odor natural botanicals.</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-800">
                <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                  <span>Tight Move-in Deadlines</span>
                  <span className="text-electric-400 font-mono">31%</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Rebuttal: Guarantee 4-person crew completion within 6 hours.</p>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Top Converting Sales Scripts</h3>
            <p className="text-xs text-slate-400">Phrases with highest statistically verified deal close rates</p>
            <div className="space-y-2 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-800">
                <span className="text-[10px] font-mono text-electric-400 font-bold uppercase">+28% Close Probability</span>
                <p className="text-slate-200 font-semibold mt-1">"We provide a 100% full deposit security guarantee for your property inspection."</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-800">
                <span className="text-[10px] font-mono text-electric-400 font-bold uppercase">+19% Close Probability</span>
                <p className="text-slate-200 font-semibold mt-1">"Our hospital-grade HEPA steam extraction operates at 140°C with no chemical residue."</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: EXECUTIVE AI BRIEFING */}
      {activeModelTab === 'reports' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm space-y-4 max-w-3xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-navy-800">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Autonomous Executive Strategic Brief
              </h3>
              <p className="text-xs text-slate-400 font-mono">Generated: Today at 08:30 AM • Confidence: 96.4%</p>
            </div>
            <button
              onClick={handleExportExecutiveBrief}
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-navy-800 text-slate-800 dark:text-white hover:text-electric-400 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
            >
              <Download className="w-4 h-4" /> Export Report
            </button>
          </div>

          <div className="space-y-3 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
            <p>
              <strong>1. Operational Velocity:</strong> The integration of autonomous inbound voice handling has decreased lead response latency from an average of 42 minutes to 14 seconds. This has generated a <strong>+41.2% conversion lift</strong> across the high-value residential villa segment.
            </p>
            <p>
              <strong>2. Revenue Projection:</strong> Based on current pipeline deal flow (₹18,450 active funnel) and historical win rates, HomeEase Guru is projected to exceed Q4 revenue targets by <strong>₹14,200 (18.4% above budget)</strong>.
            </p>
            <p>
              <strong>3. Technician Utilization:</strong> Fleet capacity is currently operating at 74% utilization. Recommendation: Onboard 2 additional verified sanitization specialists in the West LA/Santa Monica territory prior to peak holiday season.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
