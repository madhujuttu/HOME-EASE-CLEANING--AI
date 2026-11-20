import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import { TaskItem } from '../../types';
import {
  CheckSquare,
  Plus,
  Clock,
  AlertTriangle,
  CheckCircle,
  X,
  Calendar
} from 'lucide-react';

export const SalesTasks: React.FC = () => {
  const { tasks, addTask, toggleTask, showToast } = useCrm();

  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    customerName: '',
    dueDate: new Date().toISOString().slice(0, 16).replace('T', ' '),
    priority: 'high' as TaskItem['priority']
  });

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;
    addTask(formData);
    setShowAddModal(false);
    setFormData({
      title: '',
      customerName: '',
      dueDate: new Date().toISOString().slice(0, 16).replace('T', ' '),
      priority: 'high'
    });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            My Actionable Tasks & To-Dos
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-electric-500/20 text-electric-400 font-mono font-bold">
              {tasks.filter(t => t.status === 'pending').length} Pending
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Prioritized daily checklist, quote follow-ups, and customer touchpoints.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-electric-500 hover:bg-electric-400 text-navy-950 font-bold text-xs shadow-glow-sm transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Task
        </button>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {tasks.map(t => {
          const isDone = t.status === 'completed';
          return (
            <div
              key={t.id}
              onClick={() => toggleTask(t.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                isDone
                  ? 'bg-slate-50/60 dark:bg-navy-900/60 border-slate-200 dark:border-navy-800 opacity-60'
                  : 'bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 shadow-sm hover:border-electric-500/40'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <input
                  type="checkbox"
                  checked={isDone}
                  onChange={() => toggleTask(t.id)}
                  onClick={e => e.stopPropagation()}
                  className="w-4 h-4 accent-electric-500 rounded cursor-pointer"
                />
                <div>
                  <h3 className={`text-xs font-bold ${isDone ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                    {t.title}
                  </h3>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono mt-0.5">
                    <span>{t.customerName}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Due: {t.dueDate}
                    </span>
                  </div>
                </div>
              </div>

              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                t.priority === 'urgent' ? 'bg-rose-500/15 text-rose-400' : 'bg-blue-500/15 text-blue-400'
              }`}>
                {t.priority}
              </span>
            </div>
          );
        })}
      </div>

      {/* ADD TASK MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-navy-800">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Create Sales Task
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3 mt-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Task Description *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Call back Dr. Raymond with updated scaffolding pricing"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Customer Reference</label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Raymond Thornton"
                  value={formData.customerName}
                  onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Due Date & Time</label>
                  <input
                    type="datetime-local"
                    value={formData.dueDate}
                    onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={e => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-electric-500 hover:bg-electric-400 text-navy-950 font-bold"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
