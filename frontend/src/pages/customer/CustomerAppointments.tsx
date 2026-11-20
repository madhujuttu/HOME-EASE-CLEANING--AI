import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import { Meeting } from '../../types';
import {
  Calendar,
  Clock,
  Video,
  MapPin,
  CheckCircle,
  X,
  Plus
} from 'lucide-react';

export const CustomerAppointments: React.FC = () => {
  const { meetings, updateMeeting, cancelMeeting, showToast } = useCrm();

  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [showReschedule, setShowReschedule] = useState(false);
  const [newDate, setNewDate] = useState('');

  // Customer appointments
  const myAppointments = meetings;

  const handleReschedule = () => {
    if (!selectedMeeting || !newDate) return;
    updateMeeting(selectedMeeting.id, { dateTime: newDate, status: 'scheduled' });
    setShowReschedule(false);
    setSelectedMeeting(null);
    showToast('Appointment Rescheduled', `Consultation moved to ${newDate}.`, 'success');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            My Consultations & Appointments
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Site measurement audits, virtual video estimations, and specialist walkthroughs.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {myAppointments.map(meet => (
          <div
            key={meet.id}
            className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 dark:text-white text-xs">{meet.title}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                  meet.status === 'scheduled' ? 'bg-blue-500/15 text-blue-400' : 'bg-electric-500/15 text-electric-400'
                }`}>
                  {meet.status}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                {meet.dateTime} ({meet.durationMinutes} mins) • With: {meet.employeeName}
              </p>
              <p className="text-[11px] text-electric-400 flex items-center gap-1 mt-1 font-semibold">
                {meet.type === 'In-person Site Audit' ? <MapPin className="w-3.5 h-3.5" /> : <Video className="w-3.5 h-3.5" />}
                {meet.type}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {meet.status === 'scheduled' && (
                <>
                  <button
                    onClick={() => {
                      setSelectedMeeting(meet);
                      setShowReschedule(true);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:text-white"
                  >
                    Reschedule
                  </button>
                  <button
                    onClick={() => {
                      cancelMeeting(meet.id);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* RESCHEDULE MODAL */}
      {showReschedule && selectedMeeting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 shadow-2xl p-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              Reschedule Appointment
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Select a preferred new consultation time slot.
            </p>
            <input
              type="datetime-local"
              value={newDate}
              onChange={e => setNewDate(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white text-xs mb-4 focus:outline-none"
            />
            <div className="flex items-center justify-end gap-2.5">
              <button
                onClick={() => setShowReschedule(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleReschedule}
                className="px-4 py-2 rounded-xl bg-electric-500 hover:bg-electric-400 text-navy-950 text-xs font-bold"
              >
                Confirm New Slot
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
