import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import { NotificationItem } from '../../types';
import {
  Bell,
  CheckCircle,
  Clock,
  Sparkles,
  Calendar,
  CreditCard,
  AlertTriangle,
  ExternalLink,
  Trash2,
  RotateCcw,
  Eye
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const NotificationsPage: React.FC = () => {
  const { activeNotifications, markNotificationRead, markAllNotificationsRead, toggleNotificationRead, deleteNotification } = useCrm();

  const [statusTab, setStatusTab] = useState<'unseen' | 'seen' | 'all'>('unseen');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const unseenList = activeNotifications.filter(n => !n.read);
  const seenList = activeNotifications.filter(n => n.read);

  const parseScheduledTime = (msg?: string): string | null => {
    if (!msg) return null;
    const regex = /(?:scheduled for|rescheduled to|scheduled on|scheduled follow-up:|next touchpoint:|touchpoint:)\s*([0-9]{4}-[0-9]{2}-[0-9]{2}[^.,;)]*|[A-Za-z]{3}\s+[0-9]{1,2}[^.,;)]*|today\s+at\s+[^.,;)]*)/i;
    const match = msg.match(regex);
    if (match && match[1]) {
      return match[1].trim();
    }
    return null;
  };

  const filteredNotifs = activeNotifications.filter(n => {
    // 1. Status Filter
    if (statusTab === 'unseen' && n.read) return false;
    if (statusTab === 'seen' && !n.read) return false;

    // 2. Category Filter
    if (categoryFilter !== 'all' && n.type !== categoryFilter) return false;

    return true;
  });

  const getNotifIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'followup': return <Clock className="w-4 h-4 text-amber-500" />;
      case 'ai': return <Sparkles className="w-4 h-4 text-electric-500 dark:text-electric-400" />;
      case 'booking': return <Calendar className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />;
      case 'payment': return <CreditCard className="w-4 h-4 text-purple-500 dark:text-purple-400" />;
      case 'reminder': return <Clock className="w-4 h-4 text-amber-500 dark:text-amber-400" />;
      case 'alert': return <AlertTriangle className="w-4 h-4 text-rose-500 dark:text-rose-400" />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            Notification & Escalation Center
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-electric-500/20 text-electric-600 dark:text-electric-400 font-mono font-bold">
              {unseenList.length} Unseen
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time operational alerts, follow-up queues, AI signals, and archived seen history.
          </p>
        </div>

        {unseenList.length > 0 && (
          <button
            onClick={markAllNotificationsRead}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white text-xs font-semibold self-start sm:self-auto shadow-sm transition-all"
          >
            <CheckCircle className="w-4 h-4 text-electric-500" />
            Mark All as Seen
          </button>
        )}
      </div>

      {/* Primary Status Tabs: Unseen vs Seen History vs All */}
      <div className="flex p-1 rounded-2xl bg-slate-100 dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-xs font-bold">
        <button
          onClick={() => setStatusTab('unseen')}
          className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
            statusTab === 'unseen'
              ? 'bg-white dark:bg-navy-800 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <span>Unseen Alerts</span>
          <span className="px-2 py-0.5 rounded-full bg-electric-500/20 text-electric-600 dark:text-electric-400 font-mono text-[11px]">
            {unseenList.length}
          </span>
        </button>

        <button
          onClick={() => setStatusTab('seen')}
          className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
            statusTab === 'seen'
              ? 'bg-white dark:bg-navy-800 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <span>Seen History</span>
          <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-navy-700 text-slate-600 dark:text-slate-300 font-mono text-[11px]">
            {seenList.length}
          </span>
        </button>

        <button
          onClick={() => setStatusTab('all')}
          className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
            statusTab === 'all'
              ? 'bg-white dark:bg-navy-800 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <span>All Notifications</span>
          <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-navy-700 text-slate-600 dark:text-slate-300 font-mono text-[11px]">
            {activeNotifications.length}
          </span>
        </button>
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-semibold custom-scrollbar">
        {['all', 'followup', 'ai', 'booking', 'payment', 'reminder', 'alert'].map(t => (
          <button
            key={t}
            onClick={() => setCategoryFilter(t)}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all uppercase font-mono text-[11px] ${
              categoryFilter === t
                ? 'bg-electric-500 text-navy-950 font-bold shadow-sm'
                : 'bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t === 'followup' ? 'Follow-ups' : t}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifs.length === 0 ? (
          <div className="p-12 text-center text-slate-400 bg-white dark:bg-navy-900 rounded-3xl border border-slate-200 dark:border-navy-800 space-y-1">
            <Bell className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
            <p className="font-bold text-slate-700 dark:text-slate-200 text-sm">
              {statusTab === 'unseen' ? 'No unseen notifications' : statusTab === 'seen' ? 'No seen notifications stored' : 'No notifications found'}
            </p>
            <p className="text-xs">
              {statusTab === 'unseen'
                ? 'All alerts have been marked as seen and moved to your Seen History.'
                : 'Archived and read notifications will remain permanently stored here.'}
            </p>
          </div>
        ) : (
          filteredNotifs.map(n => (
            <div
              key={n.id}
              className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 group ${
                n.read
                  ? 'bg-white dark:bg-navy-900/60 border-slate-200 dark:border-navy-800/80 opacity-80'
                  : 'bg-white dark:bg-navy-900 border-electric-500/50 shadow-sm'
              }`}
            >
              <div
                onClick={() => markNotificationRead(n.id)}
                className="flex items-start gap-3.5 flex-1 cursor-pointer"
              >
                <div className={`p-2.5 rounded-xl flex-shrink-0 mt-0.5 ${
                  n.type === 'followup'
                    ? 'bg-amber-500/10 text-amber-500'
                    : 'bg-slate-100 dark:bg-navy-800'
                }`}>
                  {getNotifIcon(n.type)}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {n.type === 'followup' ? (
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/30">
                        FOLLOW-UP
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-navy-800 text-slate-500 dark:text-slate-400 font-semibold">
                        {n.type}
                      </span>
                    )}

                    <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-electric-600 dark:group-hover:text-electric-400 transition-colors">
                      {n.title}
                    </h3>

                    {!n.read ? (
                      <span className="px-2 py-0.5 rounded-full bg-electric-500/15 text-electric-600 dark:text-electric-400 text-[10px] font-mono font-bold">
                        NEW
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-navy-800 text-slate-400 text-[10px] font-mono">
                        SEEN
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    {n.message}
                  </p>

                  {/* Explicit Scheduled Time Badge */}
                  {(n.scheduledTime || parseScheduledTime(n.message)) && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 mt-2 rounded-lg bg-electric-500/10 border border-electric-500/30 text-electric-600 dark:text-electric-400 font-mono text-xs font-bold w-fit shadow-xs">
                      <Clock className="w-3.5 h-3.5 text-electric-500 flex-shrink-0" />
                      <span>Scheduled Time: {n.scheduledTime || parseScheduledTime(n.message)}</span>
                    </div>
                  )}

                  <span className="text-[10px] font-mono text-slate-400 mt-2 block">
                    Logged: {n.timestamp}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  onClick={() => toggleNotificationRead(n.id)}
                  className={`p-2 rounded-xl transition-colors ${
                    n.read
                      ? 'text-slate-400 hover:text-electric-500 hover:bg-slate-100 dark:hover:bg-navy-800'
                      : 'text-electric-600 dark:text-electric-400 bg-electric-500/10 hover:bg-electric-500/20'
                  }`}
                  title={n.read ? 'Mark as Unseen' : 'Mark as Seen'}
                >
                  {n.read ? <RotateCcw className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                </button>

                {n.link && (
                  <Link
                    to={n.link}
                    onClick={() => markNotificationRead(n.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-electric-600 dark:hover:text-electric-400 hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
                    title="Open Associated Record"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                )}

                <button
                  onClick={() => deleteNotification(n.id)}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                  title="Delete from notifications"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
