import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import {
  Settings,
  Shield,
  Phone,
  Bell,
  Cpu,
  Save,
  CheckCircle,
  Building,
  Key,
  Database
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { showToast } = useCrm();

  const [activeTab, setActiveTab] = useState<'general' | 'ai' | 'roles' | 'security'>('general');

  // General settings state
  const [companyName, setCompanyName] = useState(() => localStorage.getItem('homeease_setting_company') || 'HomeEase Guru Facilities & Sanitization Inc.');
  const [supportEmail, setSupportEmail] = useState(() => localStorage.getItem('homeease_setting_email') || 'ops@homeeaseguru.com');
  const [supportPhone, setSupportPhone] = useState(() => localStorage.getItem('homeease_setting_phone') || '+1 (800) 555-EASE');
  const [serviceRadiusMiles, setServiceRadiusMiles] = useState(() => Number(localStorage.getItem('homeease_setting_radius')) || 45);

  // AI settings
  const [voiceModel, setVoiceModel] = useState(() => localStorage.getItem('homeease_setting_voice') || 'Gemini Voice 2.0 Live Streaming');
  const [telephonyCarrier, setTelephonyCarrier] = useState(() => localStorage.getItem('homeease_setting_carrier') || 'Twilio Enterprise SIP Trunk (Primary)');
  const [autoRecordingConsent, setAutoRecordingConsent] = useState(() => localStorage.getItem('homeease_setting_consent') !== 'false');

  const handleSave = (section: string) => {
    localStorage.setItem('homeease_setting_company', companyName);
    localStorage.setItem('homeease_setting_email', supportEmail);
    localStorage.setItem('homeease_setting_phone', supportPhone);
    localStorage.setItem('homeease_setting_radius', String(serviceRadiusMiles));
    localStorage.setItem('homeease_setting_voice', voiceModel);
    localStorage.setItem('homeease_setting_carrier', telephonyCarrier);
    localStorage.setItem('homeease_setting_consent', String(autoRecordingConsent));
    showToast('Settings Saved', `${section} parameters updated successfully.`, 'success');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            System & Enterprise Configuration
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Global CRM parameters, AI telephony trunks, security access control, and webhooks.
          </p>
        </div>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-navy-800 text-xs font-semibold">
        {[
          { key: 'general', label: 'Company Profile & Dispatch', icon: Building },
          { key: 'ai', label: 'AI Voice & Speech Models', icon: Cpu },
          { key: 'roles', label: 'Roles & Access Control', icon: Shield },
          { key: 'security', label: 'Telephony & Audit Logs', icon: Key },
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

      {/* TAB 1: GENERAL */}
      {activeTab === 'general' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm space-y-4 text-xs">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Operational Headquarters & Service Radius
          </h3>

          <div className="space-y-3.5">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Legal Company Name</label>
              <input
                type="text"
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Customer Support Email</label>
                <input
                  type="email"
                  value={supportEmail}
                  onChange={e => setSupportEmail(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Dispatch Hotline Phone</label>
                <input
                  type="text"
                  value={supportPhone}
                  onChange={e => setSupportPhone(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-400 font-medium">Service Dispatch Radius: {serviceRadiusMiles} miles</label>
                <span className="font-mono text-slate-400 text-[11px]">Radius from primary dispatch hub</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={serviceRadiusMiles}
                onChange={e => setServiceRadiusMiles(Number(e.target.value))}
                className="w-full accent-electric-400"
              />
            </div>

            <div className="pt-2">
              <button
                onClick={() => handleSave('Company Profile')}
                className="px-5 py-2.5 rounded-xl bg-electric-500 hover:bg-electric-400 text-navy-950 font-bold text-xs"
              >
                Save General Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: AI */}
      {activeTab === 'ai' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm space-y-4 text-xs">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Conversational AI & Speech Recognition Core
          </h3>

          <div className="space-y-3.5">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Speech & Language Model Engine</label>
              <select
                value={voiceModel}
                onChange={e => setVoiceModel(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none"
              >
                <option>Gemini Voice 2.0 Live Streaming (Ultra-Low Latency)</option>
                <option>Whisper Large v3 + ElevenLabs Neural</option>
                <option>Deepgram Nova-2 Real-Time STT</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Telephony Carrier Trunk</label>
              <select
                value={telephonyCarrier}
                onChange={e => setTelephonyCarrier(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none"
              >
                <option>Twilio Enterprise SIP Trunk (Primary)</option>
                <option>Vonage Nexmo Voice Gateway (Backup)</option>
                <option>Telnyx Elastic Inbound Carrier</option>
              </select>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-800 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white">Strict Recording Consent Verification</h4>
                <p className="text-[11px] text-slate-400">Blocks call recording if the customer does not agree to the consent notice.</p>
              </div>
              <input
                type="checkbox"
                checked={autoRecordingConsent}
                onChange={e => setAutoRecordingConsent(e.target.checked)}
                className="w-4 h-4 accent-electric-500 rounded"
              />
            </div>

            <div className="pt-2">
              <button
                onClick={() => handleSave('AI & Speech Parameters')}
                className="px-5 py-2.5 rounded-xl bg-electric-500 hover:bg-electric-400 text-navy-950 font-bold text-xs"
              >
                Save AI Configuration
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ROLES & ACCESS */}
      {activeTab === 'roles' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm space-y-4 text-xs">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Role-Based Access Control (RBAC) Matrix
          </h3>
          <p className="text-slate-400">
            Permission boundaries configured across Admin, Manager, Sales Executive, and Customer roles.
          </p>

          <div className="border border-slate-200 dark:border-navy-800 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-navy-850 text-slate-400 font-mono text-[10px] uppercase">
                <tr>
                  <th className="p-3">Module</th>
                  <th className="p-3 text-center">Admin</th>
                  <th className="p-3 text-center">Manager</th>
                  <th className="p-3 text-center">Sales Rep</th>
                  <th className="p-3 text-center">Customer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-navy-800">
                {[
                  { module: 'Lead Allocation & Reassignment', a: true, m: true, s: false, c: false },
                  { module: 'Customer 360 Full Ledger', a: true, m: true, s: true, c: false },
                  { module: 'AI Outbound Voice Trigger', a: true, m: true, s: true, c: false },
                  { module: 'Merchant Refund Execution', a: true, m: false, s: false, c: false },
                  { module: 'Service Catalog & Pricing', a: true, m: true, s: false, c: false },
                  { module: 'Personal Booking & Payments', a: true, m: true, s: true, c: true },
                ].map((row, i) => (
                  <tr key={i}>
                    <td className="p-3 font-medium text-slate-800 dark:text-slate-200">{row.module}</td>
                    <td className="p-3 text-center text-electric-400">{row.a ? '✓' : '—'}</td>
                    <td className="p-3 text-center text-electric-400">{row.m ? '✓' : '—'}</td>
                    <td className="p-3 text-center text-electric-400">{row.s ? '✓' : '—'}</td>
                    <td className="p-3 text-center text-electric-400">{row.c ? '✓' : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: SECURITY & AUDIT LOGS */}
      {activeTab === 'security' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm space-y-4 text-xs">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Immutable Audit Trail & Security Logs
          </h3>

          <div className="space-y-2">
            {[
              { time: '11:15 AM', user: 'Aria (AI Voice)', event: 'Auto-ingested new lead #lead-101 and generated score 94' },
              { time: '10:30 AM', user: 'Alexander Sterling', event: 'Approved monthly provider payout batch #PAY-4091' },
              { time: '09:05 AM', user: 'Elena Rostova', event: 'Reassigned 2 unassigned website leads to Sarah Jenkins' },
              { time: '08:00 AM', user: 'System Telephony', event: 'Twilio SIP Trunk health-check: 100% latency < 45ms' },
            ].map((log, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-800 flex items-center justify-between font-mono text-[11px]">
                <div className="flex items-center gap-3">
                  <span className="text-slate-400">{log.time}</span>
                  <span className="text-electric-400 font-bold">{log.user}:</span>
                  <span className="text-slate-700 dark:text-slate-300">{log.event}</span>
                </div>
                <span className="text-[10px] text-slate-500 uppercase">AUDIT VERIFIED</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
