import React from 'react';
import { NavLink } from 'react-router-dom';
import { useCrm } from '../../context/CrmContext';
import {
  LayoutDashboard,
  UserCheck,
  Users,
  Briefcase,
  Calendar,
  PhoneCall,
  Sparkles,
  ShieldCheck,
  CalendarCheck,
  CreditCard,
  Cpu,
  Bell,
  BarChart3,
  Settings,
  CheckSquare,
  MessageSquare,
  Mic,
  Clock,
  Award,
  Home,
  Layers,
  FileQuestion,
  HelpCircle,
  User
} from 'lucide-react';

interface NavItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

export const Sidebar: React.FC = () => {
  const { role, activeNotifications, tasks, leads, bookings } = useCrm();

  const unreadNotifs = activeNotifications.filter(n => !n.read).length;
  const pendingTasks = tasks.filter(t => t.status === 'pending').length;
  const activeLeadsCount = leads.length;
  const activeBookingsCount = bookings.filter(b => b.status === 'confirmed' || b.status === 'pending').length;

  const adminNav: NavItem[] = [
    { name: 'Overview', path: '/admin/overview', icon: LayoutDashboard },
    { name: 'Lead Management', path: '/admin/leads', icon: UserCheck, badge: activeLeadsCount > 0 ? `${activeLeadsCount}` : undefined },
    { name: 'Customer Management', path: '/admin/customers', icon: Users },
    { name: 'Sales Management', path: '/admin/sales', icon: Briefcase },
    { name: 'Meeting Management', path: '/admin/meetings', icon: Calendar },
    { name: 'AI Calling Center', path: '/admin/ai-calling', icon: PhoneCall, badge: 'Live' },
    { name: 'Service Management', path: '/admin/services', icon: Sparkles },
    { name: 'Provider Management', path: '/admin/providers', icon: ShieldCheck },
    { name: 'Booking Management', path: '/admin/bookings', icon: CalendarCheck, badge: activeBookingsCount > 0 ? `${activeBookingsCount}` : undefined },
    { name: 'Payment Management', path: '/admin/payments', icon: CreditCard },
    { name: 'AI Intelligence Center', path: '/admin/ai-intelligence', icon: Cpu },
    { name: 'Notifications', path: '/admin/notifications', icon: Bell, badge: unreadNotifs > 0 ? `${unreadNotifs}` : undefined },
    { name: 'Reports & Analytics', path: '/admin/reports', icon: BarChart3 },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  const salesNav: NavItem[] = [
    { name: 'My Dashboard', path: '/sales/dashboard', icon: LayoutDashboard },
    { name: 'My Leads', path: '/sales/leads', icon: UserCheck, badge: activeLeadsCount > 0 ? `${activeLeadsCount}` : undefined },
    { name: 'My Customers', path: '/sales/customers', icon: Users },
    { name: 'My Meetings', path: '/sales/meetings', icon: Calendar },
    { name: 'My Follow-ups', path: '/sales/follow-ups', icon: Clock },
    { name: 'AI Calling Assistant', path: '/sales/ai-calling', icon: Mic, badge: 'AI' },
    { name: 'Call History', path: '/sales/call-history', icon: PhoneCall },
    { name: 'Meeting Intelligence', path: '/sales/meeting-intelligence', icon: Sparkles },
    { name: 'AI Sales Copilot', path: '/sales/copilot', icon: MessageSquare, badge: 'Copilot' },
    { name: 'My Tasks', path: '/sales/tasks', icon: CheckSquare, badge: pendingTasks > 0 ? `${pendingTasks}` : undefined },
    { name: 'Notifications', path: '/sales/notifications', icon: Bell, badge: unreadNotifs > 0 ? `${unreadNotifs}` : undefined },
    { name: 'My Performance', path: '/sales/performance', icon: Award },
  ];

  const customerNav: NavItem[] = [
    { name: 'Home', path: '/customer/home', icon: Home },
    { name: 'Browse Services', path: '/customer/services', icon: Layers },
    { name: 'My Enquiries', path: '/customer/enquiries', icon: FileQuestion },
    { name: 'My Appointments', path: '/customer/appointments', icon: Calendar },
    { name: 'My Bookings', path: '/customer/bookings', icon: CalendarCheck, badge: activeBookingsCount > 0 ? `${activeBookingsCount}` : undefined },
    { name: 'AI Customer Assistant', path: '/customer/assistant', icon: Sparkles, badge: '24/7' },
    { name: 'Payment History', path: '/customer/payments', icon: CreditCard },
    { name: 'Notifications', path: '/customer/notifications', icon: Bell, badge: unreadNotifs > 0 ? `${unreadNotifs}` : undefined },
    { name: 'My Profile', path: '/customer/profile', icon: User },
  ];

  const currentNav = role === 'customer' ? customerNav : role === 'sales' ? salesNav : adminNav;

  return (
    <aside className="w-64 flex-shrink-0 border-r border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-950 flex flex-col h-full select-none transition-colors">
      {/* Nav List */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1 custom-scrollbar">
        {currentNav.map(item => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-electric-500/15 text-electric-400 dark:text-electric-400 border border-electric-500/30 font-semibold shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-navy-900'
                }`
              }
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon className="w-4 h-4 flex-shrink-0 group-hover:text-electric-400 transition-colors" />
                <span className="truncate">{item.name}</span>
              </div>
              {item.badge && (
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                  item.badge === 'Live' || item.badge === 'AI' || item.badge === 'Copilot'
                    ? 'bg-electric-500 text-navy-950'
                    : 'bg-slate-200 dark:bg-navy-800 text-slate-700 dark:text-slate-300'
                }`}>
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* AI Engine Status footer */}
      <div className="p-3 border-t border-slate-200 dark:border-navy-800 m-2 rounded-xl bg-slate-50 dark:bg-navy-900/60">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-2 h-2 rounded-full bg-electric-400 animate-ping" />
          <span className="text-[11px] font-mono font-semibold text-slate-800 dark:text-slate-200">AI Automation Engine</span>
        </div>
        <p className="text-[10px] text-slate-500 dark:text-slate-400">
          Inbound Voice, Copilot & Lead Scoring Active
        </p>
      </div>
    </aside>
  );
};
