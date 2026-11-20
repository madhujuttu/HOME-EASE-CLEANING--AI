import React, { createContext, useContext, useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import {
  UserRole,
  User,
  Lead,
  Customer,
  Employee,
  Meeting,
  FollowUp,
  CallLog,
  ServiceCategory,
  Service,
  Provider,
  Booking,
  Payment,
  AIInsight,
  NotificationItem,
  TaskItem,
  BookingStatus
} from '../types';
import {
  mockUsers,
  initialCategories,
  initialServices,
  initialEmployees,
  initialLeads,
  initialCustomers,
  initialMeetings,
  initialCallLogs,
  initialProviders,
  initialBookings,
  initialPayments,
  initialAIInsights,
  initialNotifications,
  initialTasks
} from '../data/mockData';
import { api } from '../services/api';

export interface Toast {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message?: string;
}

interface CrmContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  currentUser: User;
  isAuthenticated: boolean;
  login: (email: string, password: string, preferredRole?: UserRole) => Promise<{ success: boolean; message?: string; user?: any }>;
  sendPhoneOtp: (phone: string) => Promise<{ success: boolean; message: string; otp?: string }>;
  loginWithPhone: (phone: string, otp: string, name?: string) => Promise<{ success: boolean; message?: string; user?: any }>;
  loginWithGoogle: (payload: { email: string; name?: string; googleId?: string; avatar?: string }) => Promise<{ success: boolean; message?: string; user?: any }>;
  register: (userData: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    phone?: string;
    department?: string;
    address?: string;
    preferredService?: string;
    propertyType?: string;
    employeeCode?: string;
    territory?: string;
    skills?: string[];
    location?: string;
    experience?: string;
  }) => Promise<{ success: boolean; message?: string; user?: any }>;
  logout: () => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;

  leads: Lead[];
  addLead: (lead: Partial<Lead>) => Promise<boolean>;
  updateLead: (id: string, updates: Partial<Lead>) => Promise<boolean>;
  deleteLead: (id: string) => Promise<boolean>;
  assignLead: (leadId: string, employeeId: string, reason?: string) => Promise<boolean>;
  convertLead: (leadId: string) => Promise<boolean>;
  clearAllLeads: () => Promise<boolean>;
  addLeadNote: (leadId: string, note: string) => Promise<boolean>;

  customers: Customer[];
  addCustomer: (cust: Partial<Customer>) => void;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  addCustomerNote: (customerId: string, note: string) => void;

  employees: Employee[];
  addEmployee: (empData: {
    name: string;
    email: string;
    phone?: string;
    password?: string;
    role?: string;
    team?: string;
    targetRevenue?: number;
    avatar?: string;
  }) => Promise<boolean>;
  meetings: Meeting[];
  addMeeting: (meeting: Partial<Meeting>) => Promise<boolean>;
  updateMeeting: (id: string, updates: Partial<Meeting>) => Promise<boolean>;
  cancelMeeting: (id: string, reason?: string) => Promise<boolean>;
  rescheduleMeeting: (id: string, dateTime: string, reason?: string, durationMinutes?: number) => Promise<boolean>;
  completeMeeting: (id: string, outcomeData: {
    outcome: string;
    discussionSummary?: string;
    customerRequirements?: string[];
    objections?: string[];
    agreedActions?: string[];
    nextAction?: string;
    proofAttachment?: string;
  }) => Promise<boolean>;

  followUps: FollowUp[];
  addFollowUp: (followUp: Partial<FollowUp>) => Promise<boolean>;
  updateFollowUp: (id: string, updates: Partial<FollowUp>) => Promise<boolean>;
  rescheduleFollowUp: (id: string, scheduledDateTime: string, reason?: string) => Promise<boolean>;
  completeFollowUp: (id: string, outcomeData: {
    outcome: string;
    discussionSummary?: string;
    customerFeedback?: string;
    nextAction?: string;
    proofAttachment?: string;
    nextFollowUpDate?: string;
  }) => Promise<boolean>;
  cancelFollowUp: (id: string, reason?: string) => Promise<boolean>;
  deleteFollowUp: (id: string) => Promise<boolean>;

  callLogs: CallLog[];
  addCallLog: (call: Partial<CallLog>) => void;

  services: Service[];
  categories: ServiceCategory[];
  addService: (service: Partial<Service>) => Promise<boolean>;
  updateService: (id: string, updates: Partial<Service>) => Promise<boolean>;
  deleteService: (id: string) => Promise<boolean>;

  providers: Provider[];
  addProvider: (provider: Partial<Provider>) => void;
  updateProvider: (id: string, updates: Partial<Provider>) => void;

  bookings: Booking[];
  addBooking: (booking: Partial<Booking>) => Promise<{ success: boolean; booking?: Booking }>;
  updateBookingStatus: (id: string, status: BookingStatus, providerId?: string) => Promise<boolean>;
  assignBookingProvider: (bookingId: string, providerId: string) => Promise<boolean>;
  addBookingReview: (bookingId: string, review: { rating: number; comment?: string; images?: string[] }) => Promise<boolean>;
  respondBooking: (bookingId: string, action: 'accept' | 'reject', providerId: string, reason?: string) => Promise<boolean>;

  payments: Payment[];
  addPayment: (payment: Partial<Payment>) => void;
  updatePayment: (id: string, updates: Partial<Payment>) => void;

  insights: AIInsight[];
  notifications: NotificationItem[];
  activeNotifications: NotificationItem[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  toggleNotificationRead: (id: string) => void;
  deleteNotification: (id: string) => void;
  addNotification: (notif: Partial<NotificationItem>) => void;

  tasks: TaskItem[];
  addTask: (task: Partial<TaskItem>) => void;
  toggleTask: (id: string) => void;

  toasts: Toast[];
  showToast: (title: string, message?: string, type?: Toast['type']) => void;
  dismissToast: (id: string) => void;
}

const CrmContext = createContext<CrmContextType | undefined>(undefined);

const SEEN_NOTIFS_KEY = 'homeease_seen_notif_ids';
const REGISTERED_USERS_KEY = 'homeease_registered_users';
const LEADS_STORAGE_KEY = 'homeease_leads_v3';
const CUSTOMERS_STORAGE_KEY = 'homeease_customers_v3';

const getPersistedSeenIds = (): Set<string> => {
  try {
    const raw = localStorage.getItem(SEEN_NOTIFS_KEY);
    if (raw) return new Set(JSON.parse(raw));
  } catch {}
  return new Set();
};

const savePersistedSeenId = (id: string) => {
  const set = getPersistedSeenIds();
  set.add(id);
  localStorage.setItem(SEEN_NOTIFS_KEY, JSON.stringify(Array.from(set)));
};

const saveAllPersistedSeenIds = (ids: string[]) => {
  const set = getPersistedSeenIds();
  ids.forEach(id => set.add(id));
  localStorage.setItem(SEEN_NOTIFS_KEY, JSON.stringify(Array.from(set)));
};

const removePersistedSeenId = (id: string) => {
  const set = getPersistedSeenIds();
  set.delete(id);
  localStorage.setItem(SEEN_NOTIFS_KEY, JSON.stringify(Array.from(set)));
};

const getPersistedUsers = (): User[] => {
  try {
    const raw = localStorage.getItem(REGISTERED_USERS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
};

// Real-time broadcast channel across browser tabs
const realtimeChannel = typeof window !== 'undefined' && 'BroadcastChannel' in window 
  ? new BroadcastChannel('homeease_realtime_stream') 
  : null;

export const CrmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRoleState] = useState<UserRole>(() => {
    const saved = localStorage.getItem('homeease_role') as UserRole;
    return (saved === 'admin' || saved === 'sales' || saved === 'customer') ? saved : 'admin';
  });

  const [currentUser, setCurrentUser] = useState<User>(() => {
    const savedUser = localStorage.getItem('homeease_user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch {}
    }
    const savedRole = localStorage.getItem('homeease_role');
    return mockUsers[savedRole || 'admin'] || mockUsers.admin;
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return Boolean(localStorage.getItem('homeease_jwt_token') || localStorage.getItem('homeease_user'));
  });

  // Default to light theme on site access
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark' ? 'dark' : 'light';
  });

  // User leads & customers with persistent storage (Starts completely clean with NO predefined records)
  const [leads, setLeads] = useState<Lead[]>(() => {
    try {
      // Clear legacy predefined mock keys and purge any stale leads
      localStorage.removeItem('homeease_leads');
      localStorage.removeItem('homeease_leads_v2');
      localStorage.removeItem('homeease_user_leads');
      const saved = localStorage.getItem(LEADS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Filter out Arthur Davis test records and deduplicate
          const cleaned = parsed.filter(l => !l.name.toLowerCase().includes('arthur davis'));
          const seen = new Set<string>();
          const unique = cleaned.filter(l => {
            const phoneKey = l.phone?.replace(/\D/g, '') || l.id;
            if (seen.has(phoneKey)) return false;
            seen.add(phoneKey);
            return true;
          });
          localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(unique));
          return unique;
        }
      }
    } catch {}
    return [];
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    try {
      // Clear legacy predefined mock keys
      localStorage.removeItem('homeease_customers');
      localStorage.removeItem('homeease_customers_v2');
      localStorage.removeItem('homeease_user_customers');
      const saved = localStorage.getItem(CUSTOMERS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  });

  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);

  const [meetings, setMeetings] = useState<Meeting[]>(() => {
    try {
      const saved = localStorage.getItem('homeease_meetings_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {}
    return initialMeetings;
  });

  const [followUps, setFollowUps] = useState<FollowUp[]>(() => {
    try {
      const saved = localStorage.getItem('homeease_followups_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [];
  });

  const [callLogs, setCallLogs] = useState<CallLog[]>(initialCallLogs);
  const [services, setServices] = useState<Service[]>(initialServices);
  const [categories] = useState<ServiceCategory[]>(initialCategories);
  const [providers, setProviders] = useState<Provider[]>(initialProviders);
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [payments, setPayments] = useState<Payment[]>(initialPayments);
  const [insights, setInsights] = useState<AIInsight[]>(initialAIInsights);

  // Persist user leads in localStorage whenever modified
  useEffect(() => {
    try {
      localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(leads));
    } catch {}
  }, [leads]);

  // Persist user customers in localStorage whenever modified
  useEffect(() => {
    try {
      localStorage.setItem(CUSTOMERS_STORAGE_KEY, JSON.stringify(customers));
    } catch {}
  }, [customers]);

  // Persist meetings in localStorage whenever modified
  useEffect(() => {
    try {
      localStorage.setItem('homeease_meetings_v2', JSON.stringify(meetings));
    } catch {}
  }, [meetings]);

  // Persist follow-ups in localStorage whenever modified
  useEffect(() => {
    try {
      localStorage.setItem('homeease_followups_v1', JSON.stringify(followUps));
    } catch {}
  }, [followUps]);

  // Initialize notifications with bulletproof seen tracking
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const seenIds = getPersistedSeenIds();
    let baseList = initialNotifications;
    const saved = localStorage.getItem('homeease_notifications');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) baseList = parsed;
      } catch {}
    }
    // Any notification that was previously seen remains read: true on refresh!
    return baseList.map(n => ({
      ...n,
      read: n.read || seenIds.has(n.id)
    }));
  });

  const [tasks, setTasks] = useState<TaskItem[]>(initialTasks);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Persist seen/unseen notifications in localStorage
  useEffect(() => {
    localStorage.setItem('homeease_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Real-time synchronization via Socket.IO connected to backend server
  useEffect(() => {
    const wsUrl = ((import.meta as any).env?.VITE_WS_URL as string) || 'http://localhost:5000';
    const socket: Socket = io(wsUrl, {
      auth: { token: api.getToken() },
      query: { role, userId: currentUser.id },
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
      console.log('[Socket.IO] Connected to backend CRM real-time engine:', socket.id);
      socket.emit('register_role', { role, userId: currentUser.id });
    });

    socket.on('lead_created', (data: { lead: Lead }) => {
      if (!data?.lead) return;
      const canonicalLead = { ...data.lead, id: (data.lead as any)._id?.toString() || data.lead.id };
      setLeads(prev => {
        if (prev.some(l => l.id === canonicalLead.id)) return prev;
        return [canonicalLead, ...prev];
      });
    });

    socket.on('lead_updated', (data: { lead: Lead }) => {
      if (!data?.lead) return;
      const canonicalLead = { ...data.lead, id: (data.lead as any)._id?.toString() || data.lead.id };
      setLeads(prev => prev.map(l => (l.id === canonicalLead.id ? canonicalLead : l)));
    });

    socket.on('lead_assigned', (data: { lead: Lead; previousEmployeeId?: string }) => {
      if (!data?.lead) return;
      const canonicalLead = { ...data.lead, id: (data.lead as any)._id?.toString() || data.lead.id };
      setLeads(prev => {
        if (role === 'sales') {
          // If assigned to current employee, ensure in leads
          if (canonicalLead.assignedEmployeeId === currentUser.id || canonicalLead.assignedEmployeeId === 'emp-1') {
            const exists = prev.some(l => l.id === canonicalLead.id);
            return exists ? prev.map(l => (l.id === canonicalLead.id ? canonicalLead : l)) : [canonicalLead, ...prev];
          } else {
            // Reassigned away from current sales rep
            return prev.filter(l => l.id !== canonicalLead.id);
          }
        }
        const exists = prev.some(l => l.id === canonicalLead.id);
        return exists ? prev.map(l => (l.id === canonicalLead.id ? canonicalLead : l)) : [canonicalLead, ...prev];
      });
    });

    socket.on('lead_reassigned', (data: { lead: Lead; previousEmployeeId?: string }) => {
      if (!data?.lead) return;
      const canonicalLead = { ...data.lead, id: (data.lead as any)._id?.toString() || data.lead.id };
      if (role === 'sales' && data.previousEmployeeId === currentUser.id) {
        setLeads(prev => prev.filter(l => l.id !== canonicalLead.id));
      }
    });

    socket.on('lead_deleted', (data: { id: string }) => {
      if (!data?.id) return;
      if (data.id === 'all') {
        setLeads([]);
      } else {
        setLeads(prev => prev.filter(l => l.id !== data.id));
      }
    });

    socket.on('meeting_created', (data: { meeting: Meeting }) => {
      if (!data?.meeting) return;
      const canonical = { ...data.meeting, id: (data.meeting as any)._id?.toString() || data.meeting.id };
      setMeetings(prev => {
        if (prev.some(m => m.id === canonical.id)) return prev;
        return [canonical, ...prev];
      });
    });

    socket.on('meeting_updated', (data: { meeting: Meeting }) => {
      if (!data?.meeting) return;
      const canonical = { ...data.meeting, id: (data.meeting as any)._id?.toString() || data.meeting.id };
      setMeetings(prev => prev.map(m => (m.id === canonical.id ? canonical : m)));
    });

    socket.on('meeting_rescheduled', (data: { meeting: Meeting }) => {
      if (!data?.meeting) return;
      const canonical = { ...data.meeting, id: (data.meeting as any)._id?.toString() || data.meeting.id };
      setMeetings(prev => prev.map(m => (m.id === canonical.id ? canonical : m)));
    });

    socket.on('meeting_cancelled', (data: { meeting: Meeting }) => {
      if (!data?.meeting) return;
      const canonical = { ...data.meeting, id: (data.meeting as any)._id?.toString() || data.meeting.id };
      setMeetings(prev => prev.map(m => (m.id === canonical.id ? canonical : m)));
    });

    socket.on('meeting_completed', (data: { meeting: Meeting }) => {
      if (!data?.meeting) return;
      const canonical = { ...data.meeting, id: (data.meeting as any)._id?.toString() || data.meeting.id };
      setMeetings(prev => prev.map(m => (m.id === canonical.id ? canonical : m)));
    });

    socket.on('followup_created', (data: { followUp: FollowUp }) => {
      if (!data?.followUp) return;
      const canonical = { ...data.followUp, id: (data.followUp as any)._id?.toString() || data.followUp.id };
      setFollowUps(prev => {
        if (prev.some(f => f.id === canonical.id)) return prev;
        return [canonical, ...prev];
      });
    });

    socket.on('followup_updated', (data: { followUp: FollowUp }) => {
      if (!data?.followUp) return;
      const canonical = { ...data.followUp, id: (data.followUp as any)._id?.toString() || data.followUp.id };
      setFollowUps(prev => prev.map(f => (f.id === canonical.id ? canonical : f)));
    });

    socket.on('followup_rescheduled', (data: { followUp: FollowUp }) => {
      if (!data?.followUp) return;
      const canonical = { ...data.followUp, id: (data.followUp as any)._id?.toString() || data.followUp.id };
      setFollowUps(prev => prev.map(f => (f.id === canonical.id ? canonical : f)));
    });

    socket.on('followup_completed', (data: { followUp: FollowUp }) => {
      if (!data?.followUp) return;
      const canonical = { ...data.followUp, id: (data.followUp as any)._id?.toString() || data.followUp.id };
      setFollowUps(prev => prev.map(f => (f.id === canonical.id ? canonical : f)));
    });

    socket.on('followup_cancelled', (data: { followUp: FollowUp }) => {
      if (!data?.followUp) return;
      const canonical = { ...data.followUp, id: (data.followUp as any)._id?.toString() || data.followUp.id };
      setFollowUps(prev => prev.map(f => (f.id === canonical.id ? canonical : f)));
    });

    socket.on('followup_deleted', (data: { id: string }) => {
      if (!data?.id) return;
      setFollowUps(prev => prev.filter(f => f.id !== data.id));
    });

    socket.on('notification_created', (data: { notification: NotificationItem }) => {
      if (!data?.notification) return;
      const n = { ...data.notification, id: (data.notification as any)._id?.toString() || data.notification.id };
      setNotifications(prev => {
        if (prev.some(item => item.id === n.id)) return prev;
        return [n, ...prev];
      });
      showToast(n.title, n.message, n.type === 'alert' ? 'warning' : 'info');
    });

    socket.on('notification_read', (data: { id: string }) => {
      if (!data?.id) return;
      setNotifications(prev => prev.map(n => (n.id === data.id ? { ...n, read: true } : n)));
    });

    socket.on('service_created', (data: { service: Service }) => {
      if (!data?.service) return;
      const s = { ...data.service, id: (data.service as any)._id?.toString() || data.service.id };
      setServices(prev => {
        if (prev.some(item => item.id === s.id)) return prev;
        return [s, ...prev];
      });
    });

    socket.on('service_updated', (data: { service: Service }) => {
      if (!data?.service) return;
      const s = { ...data.service, id: (data.service as any)._id?.toString() || data.service.id };
      setServices(prev => prev.map(item => (item.id === s.id ? s : item)));
    });

    socket.on('service_deactivated', (data: { id: string; service?: Service }) => {
      if (!data?.id) return;
      setServices(prev => prev.map(item => (item.id === data.id ? { ...item, status: 'inactive' } : item)));
    });

    socket.on('booking_created', (data: { booking: Booking }) => {
      if (!data?.booking) return;
      const b = { ...data.booking, id: (data.booking as any).bookingRef || (data.booking as any)._id?.toString() || data.booking.id };
      setBookings(prev => {
        if (prev.some(item => item.id === b.id)) return prev;
        return [b, ...prev];
      });
      showToast('New Booking Received', `${b.customerName} - ${b.serviceName}`, 'info');
    });

    socket.on('booking_updated', (data: { booking: Booking }) => {
      if (!data?.booking) return;
      const b = { ...data.booking, id: (data.booking as any).bookingRef || (data.booking as any)._id?.toString() || data.booking.id };
      setBookings(prev => prev.map(item => (item.id === b.id ? b : item)));
    });

    return () => {
      socket.disconnect();
    };
  }, [role, currentUser.id]);

  // Ensure follow-ups are actively generated and shown upon login for real active leads
  const ensureFollowUpNotifications = (targetRole: UserRole) => {
    setNotifications(prev => {
      const seenIds = getPersistedSeenIds();
      const existingIds = new Set(prev.map(n => n.id));
      const followUps: NotificationItem[] = [];

      leads.forEach(l => {
        const notifId = `followup-${l.id}`;
        if (!existingIds.has(notifId)) {
          followUps.push({
            id: notifId,
            title: `Follow-Up: ${l.name}`,
            message: `Scheduled follow-up for ${l.serviceInterest || l.serviceName} (${l.phone}). Next touchpoint: ${l.nextFollowUp || 'Today'}.`,
            type: 'followup',
            timestamp: l.nextFollowUp || 'Today',
            scheduledTime: l.nextFollowUp || 'Today',
            read: seenIds.has(notifId),
            link: targetRole === 'sales' ? '/sales/leads' : '/admin/leads',
            targetRole: targetRole === 'sales' ? 'sales' : targetRole === 'manager' ? 'manager' : 'admin'
          });
        }
      });

      if (followUps.length === 0) return prev;
      return [...followUps, ...prev];
    });
  };

  useEffect(() => {
    ensureFollowUpNotifications(role);
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Synchronize with authoritative MongoDB backend API
  useEffect(() => {
    const syncBackendData = async () => {
      try {
        const [leadsData, srvData, bkgData, meetData, provData, notifData, empData, followUpsData] = await Promise.all([
          api.getLeads(),
          api.getServices(),
          api.getBookings(),
          api.getMeetings(),
          api.getProviders(),
          api.getNotifications(),
          api.getEmployees(),
          api.getFollowUps()
        ]);

        if (leadsData?.success && Array.isArray(leadsData.leads)) {
          const canonicalLeads = leadsData.leads
            .filter((l: any) => !['lead-101', 'lead-102', 'lead-103', 'lead-104', 'lead-105', 'lead-106'].includes(l.id) && l.name !== 'Dr. Raymond Thornton' && !l.name.toLowerCase().includes('arthur davis'))
            .map((l: any) => ({ ...l, id: l.id || l._id }));
          setLeads(canonicalLeads);
          try { localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(canonicalLeads)); } catch {}
        }

        if (srvData?.success && Array.isArray(srvData.services) && srvData.services.length > 0) {
          const canonicalServices = srvData.services.map((s: any) => ({ ...s, id: s.id || s._id }));
          setServices(prev => {
            const map = new Map<string, Service>();
            prev.forEach(item => map.set(item.id, item));
            canonicalServices.forEach(item => {
              const existing = map.get(item.id);
              map.set(item.id, existing ? { ...existing, ...item } : item);
            });
            return Array.from(map.values());
          });
        }

        if (bkgData?.success && Array.isArray(bkgData.bookings)) {
          const canonicalBookings = bkgData.bookings.map((b: any) => ({
            ...b,
            id: b.bookingRef || b.id || b._id?.toString()
          }));
          setBookings(canonicalBookings);
        }

        if (meetData?.success && Array.isArray(meetData.meetings)) {
          const canonicalMeetings = meetData.meetings.map((m: any) => ({ ...m, id: m.id || m._id }));
          setMeetings(canonicalMeetings);
          try { localStorage.setItem('homeease_meetings_v2', JSON.stringify(canonicalMeetings)); } catch {}
        }

        if (provData?.success && Array.isArray(provData.providers)) {
          const canonicalProviders = provData.providers.map((p: any) => ({
            ...p,
            id: p.id || p._id?.toString()
          }));
          setProviders(canonicalProviders);
        }

        if (notifData?.success && Array.isArray(notifData.notifications)) {
          const seenIds = getPersistedSeenIds();
          const canonicalNotifs = notifData.notifications.map((n: any) => ({
            ...n,
            id: n.id || n._id,
            read: seenIds.has(n.id || n._id) || Boolean(n.read)
          }));
          setNotifications(canonicalNotifs);
        }

        if (empData?.success && Array.isArray(empData.employees) && empData.employees.length > 0) {
          const canonicalEmployees = empData.employees.map((e: any) => ({
            ...e,
            id: e.employeeId || e.id || e._id
          }));
          setEmployees(canonicalEmployees);
        }

        if (followUpsData?.success && Array.isArray(followUpsData.followUps)) {
          const canonicalFollowUps = followUpsData.followUps.map((f: any) => ({
            ...f,
            id: f.id || f._id
          }));
          setFollowUps(canonicalFollowUps);
          try { localStorage.setItem('homeease_followups_v1', JSON.stringify(canonicalFollowUps)); } catch {}
        }
      } catch (err) {
        console.warn('Backend sync failed, maintaining current state:', err);
      }
    };

    syncBackendData();
  }, [role, currentUser.id]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const showToast = (title: string, message?: string, type: Toast['type'] = 'success') => {
    const id = 't-' + Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    const assignedUser = mockUsers[newRole] || mockUsers.admin;
    setCurrentUser(assignedUser);
    localStorage.setItem('homeease_role', newRole);
    localStorage.setItem('homeease_user', JSON.stringify(assignedUser));
    ensureFollowUpNotifications(newRole);
    showToast(`Switched view to ${newRole.toUpperCase()}`, `Active persona: ${assignedUser.name}`, 'info');
  };

  const login = async (email: string, password: string, preferredRole?: UserRole): Promise<{ success: boolean; message?: string; user?: any }> => {
    // 1. Backend API login
    try {
      const res = await api.login({ email, password });
      if (res?.success && res.user) {
        const uRole = (res.user.role === 'manager' ? 'admin' : res.user.role === 'provider' ? 'customer' : res.user.role) as UserRole;
        setRoleState(uRole);
        setCurrentUser(res.user);
        setIsAuthenticated(true);
        localStorage.setItem('homeease_user', JSON.stringify(res.user));
        localStorage.setItem('homeease_role', uRole);
        ensureFollowUpNotifications(uRole);
        showToast('Login Successful', `Welcome back, ${res.user.name}!`, 'success');
        return { success: true, user: res.user };
      }
    } catch {}

    // 2. Check locally registered users
    const registered = getPersistedUsers().find(u => u.email.toLowerCase() === email.toLowerCase().trim());
    if (registered) {
      const targetRole = registered.role;
      setRoleState(targetRole);
      setCurrentUser(registered);
      setIsAuthenticated(true);
      localStorage.setItem('homeease_jwt_token', `jwt_local_${Date.now()}`);
      localStorage.setItem('homeease_user', JSON.stringify(registered));
      localStorage.setItem('homeease_role', targetRole);
      ensureFollowUpNotifications(targetRole);
      showToast('Login Successful', `Welcome back, ${registered.name}!`, 'success');
      return { success: true, user: registered };
    }

    // 3. Provider demo account check
    if (email.toLowerCase().includes('carlos') || email.toLowerCase().includes('provider')) {
      const provUser: User = {
        id: 'prov-1',
        name: 'Carlos Mendes',
        email: 'carlos.m@homeeaseguru.com',
        role: 'customer',
        phone: '+1 (555) 902-1823',
        department: 'Field Operations Specialist',
        skills: ['Hospital Grade HEPA Detailing', 'Deep Sanitization'],
        avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=256'
      };
      setRoleState('customer');
      setCurrentUser(provUser);
      setIsAuthenticated(true);
      localStorage.setItem('homeease_jwt_token', `mock_prov_token_${Date.now()}`);
      localStorage.setItem('homeease_user', JSON.stringify(provUser));
      localStorage.setItem('homeease_role', 'customer');
      ensureFollowUpNotifications('customer');
      showToast('Provider Login Successful', `Welcome back, Carlos Mendes!`, 'success');
      return { success: true, user: provUser };
    }

    // 4. Default mock accounts
    const match = Object.values(mockUsers).find(
      u => u.email.toLowerCase() === email.toLowerCase().trim()
    );

    if (match || preferredRole) {
      const selectedUser = match || (preferredRole ? mockUsers[preferredRole] : mockUsers.admin);
      const targetRole = preferredRole || (selectedUser.role === 'manager' ? 'admin' : selectedUser.role as UserRole);
      setRoleState(targetRole);
      setCurrentUser(selectedUser);
      setIsAuthenticated(true);
      localStorage.setItem('homeease_jwt_token', `mock_jwt_token_${Date.now()}`);
      localStorage.setItem('homeease_user', JSON.stringify(selectedUser));
      localStorage.setItem('homeease_role', targetRole);
      ensureFollowUpNotifications(targetRole);
      showToast('Login Successful', `Welcome back, ${selectedUser.name}!`, 'success');
      return { success: true, user: selectedUser };
    }

    showToast('Authentication Error', 'Invalid email or password.', 'error');
    return { success: false, message: 'Invalid credentials.' };
  };

  const sendPhoneOtp = async (phone: string): Promise<{ success: boolean; message: string; otp?: string }> => {
    try {
      const res = await api.sendPhoneOtp(phone);
      if (res?.success) {
        showToast('OTP Sent', `Verification code sent to ${phone}. (Demo code: ${res.otp || '123456'})`, 'info');
        return { success: true, message: res.message || 'OTP sent successfully', otp: res.otp };
      }
      showToast('Failed to Send OTP', res?.message || 'Please check the phone number.', 'error');
      return { success: false, message: res?.message || 'Failed to send OTP' };
    } catch (err: any) {
      showToast('OTP Error', err.message || 'Failed to send OTP', 'error');
      return { success: false, message: err.message || 'Failed to send OTP' };
    }
  };

  const loginWithPhone = async (phone: string, otp: string, name?: string): Promise<{ success: boolean; message?: string; user?: any }> => {
    try {
      const res = await api.loginWithPhone({ phone, otp, name });
      if (res?.success && res.user) {
        const uRole = (res.user.role === 'manager' ? 'admin' : res.user.role === 'provider' ? 'customer' : res.user.role) as UserRole;
        setRoleState(uRole);
        setCurrentUser(res.user);
        setIsAuthenticated(true);
        localStorage.setItem('homeease_jwt_token', res.token || `jwt_${Date.now()}`);
        localStorage.setItem('homeease_user', JSON.stringify(res.user));
        localStorage.setItem('homeease_role', uRole);
        ensureFollowUpNotifications(uRole);
        showToast('Login Successful', `Welcome, ${res.user.name}!`, 'success');
        return { success: true, user: res.user };
      }
      showToast('Verification Failed', res?.message || 'Invalid or expired OTP', 'error');
      return { success: false, message: res?.message || 'Invalid OTP' };
    } catch (err: any) {
      showToast('Login Error', err.message || 'Phone verification failed', 'error');
      return { success: false, message: err.message || 'Verification failed' };
    }
  };

  const loginWithGoogle = async (payload: { email: string; name?: string; googleId?: string; avatar?: string }): Promise<{ success: boolean; message?: string; user?: any }> => {
    try {
      const res = await api.loginWithGoogle(payload);
      if (res?.success && res.user) {
        const uRole = (res.user.role === 'manager' ? 'admin' : res.user.role === 'provider' ? 'customer' : res.user.role) as UserRole;
        setRoleState(uRole);
        setCurrentUser(res.user);
        setIsAuthenticated(true);
        localStorage.setItem('homeease_jwt_token', res.token || `jwt_${Date.now()}`);
        localStorage.setItem('homeease_user', JSON.stringify(res.user));
        localStorage.setItem('homeease_role', uRole);
        ensureFollowUpNotifications(uRole);
        showToast('Google Sign-In Successful', `Welcome, ${res.user.name}!`, 'success');
        return { success: true, user: res.user };
      }
      showToast('Sign-In Failed', res?.message || 'Google authentication failed', 'error');
      return { success: false, message: res?.message || 'Google sign-in failed' };
    } catch (err: any) {
      showToast('Sign-In Error', err.message || 'Google authentication failed', 'error');
      return { success: false, message: err.message || 'Google sign-in failed' };
    }
  };

  const addEmployee = async (empData: {
    name: string;
    email: string;
    phone?: string;
    password?: string;
    role?: string;
    team?: string;
    targetRevenue?: number;
    avatar?: string;
  }): Promise<boolean> => {
    try {
      const res = await api.createEmployee(empData);
      if (res?.success && res.employee) {
        const canonicalEmp: Employee = {
          ...res.employee,
          id: res.employee.employeeId || res.employee.id || res.employee._id
        };
        setEmployees(prev => {
          const filtered = prev.filter(e => e.id !== canonicalEmp.id);
          return [canonicalEmp, ...filtered];
        });
        showToast('Employee Created', `${canonicalEmp.name} has been provisioned as ${canonicalEmp.role}.`, 'success');
        return true;
      } else {
        // Fallback local creation if offline
        const localEmp: Employee = {
          id: `emp-${Date.now()}`,
          name: empData.name,
          role: (empData.role as any) || 'Sales Executive',
          email: empData.email,
          phone: empData.phone || '+1 (555) 000-0000',
          team: empData.team || 'Sales Team Alpha',
          assignedLeadsCount: 0,
          closedDeals: 0,
          conversionRate: 0,
          targetRevenue: empData.targetRevenue || 25000,
          achievedRevenue: 0,
          status: 'active',
          avatar: empData.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256'
        };
        setEmployees(prev => [localEmp, ...prev]);
        showToast('Employee Provisioned (Local)', `${localEmp.name} added to roster.`, 'success');
        return true;
      }
    } catch (err: any) {
      showToast('Failed to Add Employee', err.message || 'Could not provision employee', 'error');
      return false;
    }
  };

  const register = async (userData: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    phone?: string;
    department?: string;
    address?: string;
    preferredService?: string;
    propertyType?: string;
    employeeCode?: string;
    territory?: string;
    skills?: string[];
    location?: string;
    experience?: string;
  }): Promise<{ success: boolean; message?: string; user?: any }> => {
    try {
      const apiRes = await api.register(userData);
      const id = apiRes?.user?.id || `usr-${Date.now()}`;
      const newUser: User = {
        id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        phone: userData.phone || '+1 (555) 000-0000',
        department: userData.department,
        address: userData.address,
        preferredService: userData.preferredService,
        propertyType: userData.propertyType,
        employeeCode: userData.employeeCode,
        territory: userData.territory,
        skills: userData.skills,
        location: userData.location,
        experience: userData.experience,
        avatar: userData.role === 'customer'
          ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256'
          : userData.role === 'sales'
          ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256'
          : 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=256'
      };

      // Store in registered users persistent archive
      const currentPersisted = getPersistedUsers();
      localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify([newUser, ...currentPersisted]));

      // If customer, add to customer list
      if (userData.role === 'customer') {
        const newCustomer: Customer = {
          id: `cust-${Date.now()}`,
          name: userData.name,
          phone: userData.phone || '+1 (555) 000-0000',
          email: userData.email,
          address: userData.address || 'San Francisco, CA',
          servicePreferences: userData.preferredService ? [userData.preferredService] : ['Deep Home Cleaning'],
          totalBookings: 0,
          totalSpent: 0,
          loyaltyTier: 'Silver',
          satisfactionScore: 5.0,
          notes: ['Self-registered customer account.'],
          complaints: [],
          interactionTimeline: [{
            id: `int-${Date.now()}`,
            type: 'note',
            date: new Date().toISOString().slice(0, 10),
            agentName: 'System Registration Bot',
            summary: `Customer registered with preferred service: ${userData.preferredService || 'Deep Clean'}`
          }],
          createdAt: new Date().toISOString().slice(0, 10)
        };
        setCustomers(prev => [newCustomer, ...prev]);
      } else if (userData.role === 'sales') {
        const newEmp: Employee = {
          id: `emp-${Date.now()}`,
          name: userData.name,
          role: 'Sales Executive',
          email: userData.email,
          phone: userData.phone || '+1 (555) 000-0000',
          team: userData.territory || userData.department || 'West Territory',
          assignedLeadsCount: 0,
          closedDeals: 0,
          conversionRate: 0,
          targetRevenue: 25000,
          achievedRevenue: 0,
          status: 'active',
          avatar: newUser.avatar || ''
        };
        setEmployees(prev => [newEmp, ...prev]);
      }

      // Auto login newly registered account
      setRoleState(userData.role);
      setCurrentUser(newUser);
      setIsAuthenticated(true);
      localStorage.setItem('homeease_jwt_token', apiRes?.token || `jwt_${Date.now()}`);
      localStorage.setItem('homeease_user', JSON.stringify(newUser));
      localStorage.setItem('homeease_role', userData.role);

      ensureFollowUpNotifications(userData.role);

      addNotification({
        title: `Welcome to HomeEase Guru, ${userData.name}!`,
        message: `Your ${userData.role.toUpperCase()} account is now active with personalized properties.`,
        type: 'alert',
        targetRole: userData.role,
        link: userData.role === 'customer' ? '/customer/home' : '/sales/dashboard'
      });

      showToast('Account Created!', `Welcome to HomeEase Guru, ${userData.name}.`, 'success');
      return { success: true, user: newUser };
    } catch (err: any) {
      showToast('Registration Error', err.message || 'Could not complete registration.', 'error');
      return { success: false, message: err.message };
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('homeease_jwt_token');
    localStorage.removeItem('homeease_user');
    api.setToken(null);
    showToast('Signed Out', 'You have been safely signed out.', 'info');
  };

  // Active role- & recipient-filtered notifications (Recipient-specific privacy)
  const activeNotifications = notifications.filter(n => {
    // If notification has a specific recipient ID, enforce recipient match
    if (n.recipientId) {
      if (role === 'sales') {
        const matchingEmp = employees.find(e => e.id === currentUser.id || e.email === currentUser.email || e.name === currentUser.name);
        return (
          n.recipientId === currentUser.id ||
          n.recipientId === (currentUser as any).employeeId ||
          n.recipientId === 'emp-1' ||
          (matchingEmp && (n.recipientId === matchingEmp.id || n.recipientId === (matchingEmp as any)._id)) ||
          n.recipientRole === 'sales'
        );
      }
      if (role === 'customer') {
        return n.recipientId === currentUser.id;
      }
      return role === 'admin' || role === 'manager' || n.recipientId === currentUser.id;
    }

    // Role-based or broadcast notifications
    const target = n.recipientRole || n.targetRole;
    if (!target || target === 'all') return true;
    if (target === role) return true;
    if ((role === 'admin' || role === 'manager') && (target === 'admin' || target === 'manager')) return true;
    return false;
  });

  const markNotificationRead = (id: string) => {
    savePersistedSeenId(id);
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
    api.markNotificationRead(id).catch(() => {});
    try {
      realtimeChannel?.postMessage({ type: 'NOTIF_SEEN', id });
    } catch {}
  };

  const toggleNotificationRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => {
        if (n.id === id) {
          const willBeRead = !n.read;
          if (willBeRead) savePersistedSeenId(id);
          else removePersistedSeenId(id);
          return { ...n, read: willBeRead };
        }
        return n;
      })
    );
  };

  const markAllNotificationsRead = () => {
    const idsToMark = notifications
      .filter(n => !n.targetRole || n.targetRole === 'all' || n.targetRole === role)
      .map(n => n.id);
    saveAllPersistedSeenIds(idsToMark);
    setNotifications(prev =>
      prev.map(n => {
        if (!n.targetRole || n.targetRole === 'all' || n.targetRole === role) {
          return { ...n, read: true };
        }
        return n;
      })
    );
    api.markAllNotificationsRead().catch(() => {});
    try {
      realtimeChannel?.postMessage({ type: 'NOTIF_ALL_SEEN', ids: idsToMark, role });
    } catch {}
    showToast('Notifications Marked Read', 'All alerts for current view are now stored in Seen.', 'info');
  };

  const deleteNotification = (id: string) => {
    removePersistedSeenId(id);
    setNotifications(prev => prev.filter(n => n.id !== id));
    showToast('Notification Dismissed', 'Alert removed from list.', 'info');
  };

  const addNotification = (notif: Partial<NotificationItem>) => {
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title: notif.title || 'System Notification',
      message: notif.message || '',
      type: notif.type || 'alert',
      timestamp: 'Just now',
      read: false,
      link: notif.link,
      targetRole: notif.targetRole || 'all'
    };
    setNotifications(prev => [newNotif, ...prev]);
    try {
      realtimeChannel?.postMessage({ type: 'NEW_NOTIF', notification: newNotif });
    } catch {}
  };

  // Lead actions with authoritative MongoDB persistence & Real-time sync
  const addLead = async (leadData: Partial<Lead>): Promise<boolean> => {
    if (!leadData.name || !leadData.name.trim()) {
      showToast('Validation Error', 'Lead name is required.', 'error');
      return false;
    }
    if (!leadData.phone || !leadData.phone.trim()) {
      showToast('Validation Error', 'Lead phone number is required.', 'error');
      return false;
    }

    const payload = {
      name: leadData.name.trim(),
      company: leadData.company?.trim() || '',
      phone: leadData.phone.trim(),
      email: leadData.email?.trim() || `${leadData.name.toLowerCase().replace(/\s+/g, '.')}@client.com`,
      address: leadData.address?.trim() || 'Address on file',
      serviceId: leadData.serviceId,
      serviceName: leadData.serviceName || leadData.serviceInterest || 'Ultra Deep Villa Sanitization',
      serviceInterest: leadData.serviceInterest || leadData.serviceName || 'Ultra Deep Villa Sanitization',
      services: leadData.services || [leadData.serviceName || leadData.serviceInterest || 'Ultra Deep Villa Sanitization'],
      servicePriceSnapshot: Number(leadData.servicePriceSnapshot) || Number(leadData.estimatedValue) || 350,
      source: leadData.source || 'Website Form',
      priority: leadData.priority || 'medium',
      customerRequirements: leadData.customerRequirements || [],
      contactPreference: leadData.contactPreference || 'phone',
      preferredTimeline: leadData.preferredTimeline || 'Immediate',
      notes: leadData.notes || '',
      estimatedValue: Number(leadData.estimatedValue) || Number(leadData.servicePriceSnapshot) || 350,
      assignedEmployeeId: leadData.assignedEmployeeId,
      assignedEmployeeName: leadData.assignedEmployeeName
    };

    const res = await api.createLead(payload);
    if (!res || !res.success || !res.lead) {
      if (res?.message?.toLowerCase().includes('already exists') || res?.message?.toLowerCase().includes('duplicate')) {
        showToast('Duplicate Lead Warning', res.message, 'warning');
      } else {
        showToast('Lead Submission Notice', res?.message || 'Could not record lead inquiry.', 'error');
      }
      return false;
    }

    const canonicalLead: Lead = {
      ...res.lead,
      id: res.lead.id || res.lead._id
    };

    setLeads(prev => {
      const exists = prev.some(l => l.id === canonicalLead.id);
      const nextList = exists
        ? prev.map(l => l.id === canonicalLead.id ? canonicalLead : l)
        : [canonicalLead, ...prev];
      try { localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(nextList)); } catch {}
      return nextList;
    });

    if ((res as any).isExistingUpdated) {
      showToast('Lead Updated', res.message || `${canonicalLead.name}'s active inquiry has been updated.`, 'info');
    } else {
      showToast('Lead Saved in Database', `${canonicalLead.name} (₹${(canonicalLead.estimatedValue || 0).toLocaleString('en-IN')})`, 'success');
    }
    return true;
  };

  const updateLead = async (id: string, updates: Partial<Lead>): Promise<boolean> => {
    const res = await api.updateLead(id, updates);
    if (!res || !res.success || !res.lead) {
      showToast('Update Failed', res?.message || 'Could not update lead in database.', 'error');
      return false;
    }

    const canonicalLead: Lead = {
      ...res.lead,
      id: res.lead.id || res.lead._id
    };

    setLeads(prev => {
      const nextList = prev.map(l => (l.id === id ? canonicalLead : l));
      try { localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(nextList)); } catch {}
      return nextList;
    });

    showToast('Lead Updated', `Lead #${id} changes saved.`, 'success');
    return true;
  };

  const deleteLead = async (id: string): Promise<boolean> => {
    const res = await api.deleteLead(id);
    if (!res || !res.success) {
      showToast('Deletion Failed', res?.message || 'Could not delete lead.', 'error');
      return false;
    }

    setLeads(prev => {
      const nextList = prev.filter(l => l.id !== id);
      try { localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(nextList)); } catch {}
      return nextList;
    });

    showToast('Lead Removed', `Lead #${id} was deleted from database.`, 'info');
    return true;
  };

  const assignLead = async (leadId: string, employeeId: string, reason?: string): Promise<boolean> => {
    const res = await api.assignLead(leadId, employeeId, reason);
    if (!res || !res.success || !res.lead) {
      showToast('Assignment Failed', res?.message || 'Could not assign lead in database.', 'error');
      return false;
    }

    const canonicalLead: Lead = {
      ...res.lead,
      id: res.lead.id || res.lead._id
    };

    setLeads(prev => {
      if (role === 'sales') {
        if (employeeId === currentUser.id || employeeId === 'emp-1') {
          return prev.map(l => (l.id === leadId ? canonicalLead : l));
        } else {
          return prev.filter(l => l.id !== leadId);
        }
      }
      const nextList = prev.map(l => (l.id === leadId ? canonicalLead : l));
      try { localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(nextList)); } catch {}
      return nextList;
    });

    const emp = employees.find(e => e.id === employeeId);
    showToast('Lead Assigned & Notified', `Assigned to ${canonicalLead.assignedEmployeeName || emp?.name || 'Sales Rep'}`, 'success');
    return true;
  };

  const convertLead = async (leadId: string): Promise<boolean> => {
    const res = await api.convertLead(leadId);
    if (!res || !res.success) {
      showToast('Conversion Failed', res?.message || 'Could not convert lead.', 'error');
      return false;
    }

    setLeads(prev => prev.map(l => (l.id === leadId ? { ...l, status: 'converted' } : l)));

    if (res.customer) {
      const canonicalCustomer = { ...res.customer, id: res.customer.id || res.customer._id };
      setCustomers(prev => [canonicalCustomer, ...prev]);
    }

    showToast('🎉 Lead Converted to Customer!', `Customer 360 profile successfully created.`, 'success');
    return true;
  };

  const clearAllLeads = async (): Promise<boolean> => {
    const res = await api.deleteLead('all');
    if (!res || !res.success) {
      showToast('Action Failed', res?.message || 'Could not clear leads.', 'error');
      return false;
    }

    setLeads([]);
    try { localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify([])); } catch {}
    showToast('All Leads Cleared', 'Lead list is now completely empty.', 'info');
    return true;
  };

  const addLeadNote = async (leadId: string, note: string): Promise<boolean> => {
    if (!note || !note.trim()) return false;
    const res = await api.addLeadNote(leadId, { summary: note.trim() });
    if (!res || !res.success) {
      showToast('Note Failed', res?.message || 'Could not save note to database.', 'error');
      return false;
    }
    if (res.lead) {
      const canonicalLead: Lead = { ...res.lead, id: res.lead.id || res.lead._id };
      setLeads(prev => prev.map(l => (l.id === leadId ? canonicalLead : l)));
    }
    showToast('Note Logged', 'CRM timeline updated.', 'success');
    return true;
  };

  // Customer actions
  const addCustomer = (custData: Partial<Customer>) => {
    const newCust: Customer = {
      id: `cust-${Math.floor(10 + Math.random() * 90)}`,
      name: custData.name || 'New Customer',
      phone: custData.phone || '+1 (555) 000-0000',
      email: custData.email || 'customer@example.com',
      address: custData.address || 'San Francisco, CA',
      servicePreferences: custData.servicePreferences || ['Deep Home Cleaning'],
      totalBookings: custData.totalBookings || 0,
      totalSpent: custData.totalSpent || 0,
      loyaltyTier: 'Silver',
      satisfactionScore: 5.0,
      notes: custData.notes || ['New customer profile created via portal.'],
      complaints: [],
      interactionTimeline: [],
      createdAt: new Date().toISOString().slice(0, 10)
    };
    setCustomers(prev => {
      const nextList = [newCust, ...prev];
      try {
        localStorage.setItem(CUSTOMERS_STORAGE_KEY, JSON.stringify(nextList));
      } catch {}
      return nextList;
    });

    try {
      realtimeChannel?.postMessage({
        type: 'CUSTOMER_CREATED',
        customer: newCust
      });
    } catch {}

    showToast('Customer Created', `${newCust.name} added to Customer 360.`, 'success');
  };

  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    setCustomers(prev => {
      const nextList = prev.map(c => (c.id === id ? { ...c, ...updates } : c));
      try {
        localStorage.setItem(CUSTOMERS_STORAGE_KEY, JSON.stringify(nextList));
      } catch {}
      return nextList;
    });
    showToast('Customer Profile Saved', `Profile #${id} updated.`, 'success');
  };

  const addCustomerNote = (customerId: string, note: string) => {
    setCustomers(prev =>
      prev.map(c =>
        c.id === customerId
          ? { ...c, notes: [note, ...c.notes] }
          : c
      )
    );
    showToast('Note Added', 'Note saved to customer timeline.', 'info');
  };

  // Meeting actions with authoritative MongoDB scheduling, conflict validation & real-time dispatch
  const addMeeting = async (data: Partial<Meeting>): Promise<boolean> => {
    if (!data.title || !data.title.trim()) {
      showToast('Validation Error', 'Schedule title is required.', 'error');
      return false;
    }
    if (!data.customerName || !data.customerName.trim()) {
      showToast('Validation Error', 'Customer or Lead name is required.', 'error');
      return false;
    }
    if (!data.employeeId) {
      showToast('Validation Error', 'Assigned employee is mandatory. Please select an active team member.', 'error');
      return false;
    }
    if (!data.dateTime) {
      showToast('Validation Error', 'Appointment date and time is required.', 'error');
      return false;
    }

    const res = await api.createMeeting(data);
    if (!res || !res.success || !res.meeting) {
      showToast('Scheduling Failed', res?.message || 'Could not save appointment in database.', 'error');
      return false;
    }

    const canonicalMeeting: Meeting = {
      ...res.meeting,
      id: res.meeting.id || res.meeting._id
    };

    setMeetings(prev => {
      if (prev.some(m => m.id === canonicalMeeting.id)) return prev;
      const nextList = [canonicalMeeting, ...prev];
      try { localStorage.setItem('homeease_meetings_v2', JSON.stringify(nextList)); } catch {}
      return nextList;
    });

    showToast('Meeting Scheduled & Dispatched', `Assigned to ${canonicalMeeting.employeeName} for ${canonicalMeeting.dateTime}`, 'success');
    return true;
  };

  const updateMeeting = async (id: string, updates: Partial<Meeting>): Promise<boolean> => {
    const res = await api.updateMeeting(id, updates);
    if (!res || !res.success || !res.meeting) {
      showToast('Meeting Update Failed', res?.message || 'Could not update meeting in database.', 'error');
      return false;
    }

    const canonical: Meeting = {
      ...res.meeting,
      id: res.meeting.id || res.meeting._id
    };

    setMeetings(prev => {
      const nextList = prev.map(m => (m.id === id ? canonical : m));
      try { localStorage.setItem('homeease_meetings_v2', JSON.stringify(nextList)); } catch {}
      return nextList;
    });

    showToast('Meeting Updated', `Meeting details updated in database.`, 'info');
    return true;
  };

  const cancelMeeting = async (id: string, reason?: string): Promise<boolean> => {
    let canonical: Meeting | null = null;
    try {
      const res = await api.cancelMeeting(id, reason);
      if (res && res.success && res.meeting) {
        canonical = {
          ...res.meeting,
          id: res.meeting.id || res.meeting._id
        };
      }
    } catch {}

    setMeetings(prev => {
      const existing = prev.find(m => m.id === id || (m as any)._id === id);
      const updated: Meeting = canonical || ({
        ...(existing || {
          id,
          title: 'Consultation',
          customerName: 'Customer',
          customerPhone: '+1 (555) 000-0000',
          customerEmail: 'customer@example.com',
          employeeId: 'emp-1',
          employeeName: 'Marcus Vance',
          dateTime: new Date().toISOString(),
          durationMinutes: 45,
          type: 'In-person Site Audit' as any,
          status: 'cancelled' as any
        }),
        status: 'cancelled',
        notes: (existing?.notes ? existing.notes + ' ' : '') + `[Cancelled: ${reason || 'ByUser'}]`
      } as Meeting);

      const nextList = prev.some(m => m.id === id || (m as any)._id === id)
        ? prev.map(m => (m.id === id || (m as any)._id === id ? updated : m))
        : [updated, ...prev];

      try { localStorage.setItem('homeease_meetings_v2', JSON.stringify(nextList)); } catch {}
      return nextList;
    });

    showToast('Meeting Cancelled', `Appointment was cancelled.`, 'warning');
    return true;
  };

  const rescheduleMeeting = async (id: string, dateTime: string, reason?: string, durationMinutes?: number): Promise<boolean> => {
    let canonical: Meeting | null = null;
    try {
      const res = await api.rescheduleMeeting(id, dateTime, reason, durationMinutes);
      if (res && res.success && res.meeting) {
        canonical = {
          ...res.meeting,
          id: res.meeting.id || res.meeting._id
        };
      }
    } catch {}

    setMeetings(prev => {
      const existing = prev.find(m => m.id === id || (m as any)._id === id);
      const updated: Meeting = canonical || ({
        ...(existing || {
          id,
          title: 'Consultation',
          customerName: 'Customer',
          customerPhone: '+1 (555) 000-0000',
          customerEmail: 'customer@example.com',
          employeeId: 'emp-1',
          employeeName: 'Marcus Vance',
          dateTime,
          durationMinutes: 45,
          type: 'In-person Site Audit' as any,
          status: 'rescheduled' as any
        }),
        dateTime,
        status: 'rescheduled'
      } as Meeting);

      const nextList = prev.some(m => m.id === id || (m as any)._id === id)
        ? prev.map(m => (m.id === id || (m as any)._id === id ? updated : m))
        : [updated, ...prev];

      try { localStorage.setItem('homeease_meetings_v2', JSON.stringify(nextList)); } catch {}
      return nextList;
    });

    showToast('Meeting Rescheduled', `Moved to ${dateTime}`, 'info');
    return true;
  };

  const completeMeeting = async (id: string, outcomeData: {
    outcome: string;
    discussionSummary?: string;
    customerRequirements?: string[];
    objections?: string[];
    agreedActions?: string[];
    nextAction?: string;
    proofAttachment?: string;
  }): Promise<boolean> => {
    let canonical: Meeting | null = null;
    try {
      const res = await api.completeMeeting(id, outcomeData);
      if (res && res.success && res.meeting) {
        canonical = {
          ...res.meeting,
          id: res.meeting.id || res.meeting._id
        };
      }
    } catch {}

    setMeetings(prev => {
      const existing = prev.find(m => m.id === id || (m as any)._id === id);
      const updated: Meeting = canonical || ({
        ...(existing || {
          id,
          title: 'Consultation',
          customerName: 'Customer',
          customerPhone: '+1 (555) 000-0000',
          customerEmail: 'customer@example.com',
          employeeId: 'emp-1',
          employeeName: 'Marcus Vance',
          dateTime: new Date().toISOString(),
          durationMinutes: 45,
          type: 'In-person Site Audit' as any,
          status: 'completed' as any
        }),
        status: 'completed',
        outcome: outcomeData.outcome,
        discussionSummary: outcomeData.discussionSummary || '',
        nextAction: outcomeData.nextAction || ''
      } as Meeting);

      const nextList = prev.some(m => m.id === id || (m as any)._id === id)
        ? prev.map(m => (m.id === id || (m as any)._id === id ? updated : m))
        : [updated, ...prev];

      try { localStorage.setItem('homeease_meetings_v2', JSON.stringify(nextList)); } catch {}
      return nextList;
    });

    showToast('Meeting Concluded', `Outcome: ${outcomeData.outcome.toUpperCase()}`, 'success');
    return true;
  };

  // Follow-Up actions with authoritative MongoDB persistence & Real-time sync
  const addFollowUp = async (followUpData: Partial<FollowUp>): Promise<boolean> => {
    if (!followUpData.customerName || !followUpData.customerName.trim()) {
      showToast('Validation Error', 'Customer or Lead name is required.', 'error');
      return false;
    }
    if (!followUpData.scheduledDateTime) {
      showToast('Validation Error', 'Follow-up date and time is required.', 'error');
      return false;
    }
    if (!followUpData.purpose || !followUpData.purpose.trim()) {
      showToast('Validation Error', 'Follow-up purpose is required.', 'error');
      return false;
    }

    const res = await api.createFollowUp(followUpData);
    if (!res || !res.success || !res.followUp) {
      showToast('Scheduling Failed', res?.message || 'Could not schedule follow-up.', 'error');
      return false;
    }

    const canonical: FollowUp = {
      ...res.followUp,
      id: res.followUp.id || res.followUp._id
    };

    setFollowUps(prev => {
      if (prev.some(f => f.id === canonical.id)) return prev;
      const nextList = [canonical, ...prev];
      try { localStorage.setItem('homeease_followups_v1', JSON.stringify(nextList)); } catch {}
      return nextList;
    });

    showToast('Follow-Up Scheduled & Synced', `${canonical.type.toUpperCase()} with ${canonical.customerName} on ${canonical.scheduledDateTime}`, 'success');
    return true;
  };

  const updateFollowUp = async (id: string, updates: Partial<FollowUp>): Promise<boolean> => {
    const res = await api.updateFollowUp(id, updates);
    if (!res || !res.success || !res.followUp) {
      showToast('Update Failed', res?.message || 'Could not update follow-up.', 'error');
      return false;
    }

    const canonical: FollowUp = {
      ...res.followUp,
      id: res.followUp.id || res.followUp._id
    };

    setFollowUps(prev => {
      const nextList = prev.map(f => (f.id === id ? canonical : f));
      try { localStorage.setItem('homeease_followups_v1', JSON.stringify(nextList)); } catch {}
      return nextList;
    });

    showToast('Follow-Up Saved', 'Details updated permanently.', 'info');
    return true;
  };

  const rescheduleFollowUp = async (id: string, scheduledDateTime: string, reason?: string): Promise<boolean> => {
    let canonical: FollowUp | null = null;
    try {
      const res = await api.rescheduleFollowUp(id, scheduledDateTime, reason);
      if (res && res.success && res.followUp) {
        canonical = {
          ...res.followUp,
          id: res.followUp.id || res.followUp._id
        };
      }
    } catch {}

    setFollowUps(prev => {
      const existing = prev.find(f => f.id === id || (f as any)._id === id);
      const updated: FollowUp = canonical || ({
        ...(existing || {
          id,
          customerName: 'Customer',
          customerPhone: '',
          employeeId: 'emp-1',
          employeeName: 'Marcus Vance',
          type: 'call',
          scheduledDateTime,
          status: 'rescheduled',
          priority: 'medium',
          purpose: 'Follow-Up'
        }),
        scheduledDateTime,
        status: 'rescheduled',
        rescheduleReason: reason
      } as FollowUp);

      const nextList = prev.some(f => f.id === id || (f as any)._id === id)
        ? prev.map(f => (f.id === id || (f as any)._id === id ? updated : f))
        : [updated, ...prev];

      try { localStorage.setItem('homeease_followups_v1', JSON.stringify(nextList)); } catch {}
      return nextList;
    });

    showToast('Follow-Up Rescheduled', `Moved to ${scheduledDateTime}`, 'info');
    return true;
  };

  const completeFollowUp = async (id: string, outcomeData: {
    outcome: string;
    discussionSummary?: string;
    customerFeedback?: string;
    nextAction?: string;
    proofAttachment?: string;
    nextFollowUpDate?: string;
  }): Promise<boolean> => {
    let canonical: FollowUp | null = null;
    try {
      const res = await api.completeFollowUp(id, outcomeData);
      if (res && res.success && res.followUp) {
        canonical = {
          ...res.followUp,
          id: res.followUp.id || res.followUp._id
        };
      }
    } catch {}

    setFollowUps(prev => {
      const existing = prev.find(f => f.id === id || (f as any)._id === id);
      const updated: FollowUp = canonical || ({
        ...(existing || {
          id,
          customerName: 'Customer',
          customerPhone: '',
          employeeId: 'emp-1',
          employeeName: 'Marcus Vance',
          type: 'call',
          scheduledDateTime: new Date().toISOString(),
          priority: 'medium',
          purpose: outcomeData.discussionSummary || 'Customer Follow-Up'
        }),
        status: 'completed',
        outcome: outcomeData.outcome as any,
        discussionSummary: outcomeData.discussionSummary || '',
        customerFeedback: outcomeData.customerFeedback || '',
        nextAction: outcomeData.nextAction || '',
        completedAt: new Date().toISOString()
      } as FollowUp);

      const nextList = prev.some(f => f.id === id || (f as any)._id === id)
        ? prev.map(f => (f.id === id || (f as any)._id === id ? updated : f))
        : [updated, ...prev];

      try { localStorage.setItem('homeease_followups_v1', JSON.stringify(nextList)); } catch {}
      return nextList;
    });

    showToast('Follow-Up Completed', `Outcome: ${outcomeData.outcome.toUpperCase()}`, 'success');
    return true;
  };

  const cancelFollowUp = async (id: string, reason?: string): Promise<boolean> => {
    let canonical: FollowUp | null = null;
    try {
      const res = await api.cancelFollowUp(id, reason);
      if (res && res.success && res.followUp) {
        canonical = {
          ...res.followUp,
          id: res.followUp.id || res.followUp._id
        };
      }
    } catch {}

    setFollowUps(prev => {
      const existing = prev.find(f => f.id === id || (f as any)._id === id);
      const updated: FollowUp = canonical || ({
        ...(existing || {
          id,
          customerName: 'Customer',
          customerPhone: '',
          employeeId: 'emp-1',
          employeeName: 'Marcus Vance',
          type: 'call',
          scheduledDateTime: new Date().toISOString(),
          priority: 'medium',
          purpose: 'Follow-Up',
          status: 'cancelled'
        }),
        status: 'cancelled',
        cancellationReason: reason || 'Cancelled by user'
      } as FollowUp);

      const nextList = prev.some(f => f.id === id || (f as any)._id === id)
        ? prev.map(f => (f.id === id || (f as any)._id === id ? updated : f))
        : [updated, ...prev];

      try { localStorage.setItem('homeease_followups_v1', JSON.stringify(nextList)); } catch {}
      return nextList;
    });

    showToast('Follow-Up Cancelled', 'Touchpoint cancelled.', 'warning');
    return true;
  };

  const deleteFollowUp = async (id: string): Promise<boolean> => {
    const res = await api.deleteFollowUp(id);
    if (!res || !res.success) {
      showToast('Delete Failed', res?.message || 'Could not delete follow-up.', 'error');
      return false;
    }

    setFollowUps(prev => {
      const nextList = prev.filter(f => f.id !== id);
      try { localStorage.setItem('homeease_followups_v1', JSON.stringify(nextList)); } catch {}
      return nextList;
    });

    showToast('Follow-Up Deleted', 'Touchpoint record deleted from database.', 'info');
    return true;
  };

  // Call actions
  const addCallLog = (data: Partial<CallLog>) => {
    const newCall: CallLog = {
      id: `call-${Math.floor(900 + Math.random() * 99)}`,
      type: data.type || 'outbound',
      customerName: data.customerName || 'Client',
      phone: data.phone || '+1 (555) 000-0000',
      durationSeconds: data.durationSeconds || 120,
      status: data.status || 'completed',
      timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
      agentType: data.agentType || 'ai_voice',
      agentName: data.agentName || 'Aria (AI Voice Assistant)',
      sentiment: data.sentiment || 'positive',
      consentGiven: data.consentGiven !== undefined ? data.consentGiven : true,
      transcript: data.transcript || [
        { speaker: 'Aria (AI)', text: 'Hello, this is HomeEase Guru AI following up on your inquiry.', time: '00:01' },
        { speaker: data.customerName || 'Client', text: 'Thank you for reaching out promptly.', time: '00:08' }
      ],
      summary: data.summary || 'AI automated contact completed. Customer confirmed availability for upcoming service.',
      extractedRequirements: data.extractedRequirements || ['Confirmed service details'],
      recommendedAction: data.recommendedAction || 'Send digital confirmation via SMS.'
    };
    setCallLogs(prev => [newCall, ...prev]);
    api.createCallLog(newCall).catch(() => {});
    showToast('Call Logged & Processed', `${newCall.type.toUpperCase()} call with ${newCall.customerName}`, 'success');
  };

  // Service actions with authoritative MongoDB persistence & image linking
  const addService = async (data: Partial<Service>): Promise<boolean> => {
    if (!data.name || !data.name.trim()) {
      showToast('Validation Error', 'Service name is required.', 'error');
      return false;
    }
    if (data.price === undefined || isNaN(Number(data.price))) {
      showToast('Validation Error', 'Service price is required.', 'error');
      return false;
    }

    const payload = {
      name: data.name.trim(),
      description: data.description || 'Professional deep cleaning and sanitization package.',
      price: Number(data.price),
      pricingType: data.pricingType || 'fixed',
      duration: data.duration || '3 Hours',
      estimatedDuration: data.estimatedDuration || data.duration || '3 Hours',
      categoryId: data.categoryId || 'cat-1',
      categoryName: categories.find(c => c.id === data.categoryId)?.name || 'Deep Home Cleaning',
      image: data.imageUrl || data.image || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=800',
      imageUrl: data.imageUrl || data.image,
      imageStorageKey: data.imageStorageKey,
      features: data.features || ['Hospital grade steam', 'Certified crew'],
      availability: data.availability || 'Daily',
      status: data.status || 'active'
    };

    const res = await api.createService(payload);
    if (!res || !res.success || !res.service) {
      showToast('Service Creation Failed', res?.message || 'Could not save service to database.', 'error');
      return false;
    }

    const canonical: Service = {
      ...res.service,
      id: res.service.id || res.service._id
    };

    setServices(prev => [canonical, ...prev]);
    showToast('New Service Created', `${canonical.name} (₹${canonical.price}) added to catalog.`, 'success');
    return true;
  };

  const updateService = async (id: string, updates: Partial<Service>): Promise<boolean> => {
    const res = await api.updateService(id, updates);
    if (!res || !res.success || !res.service) {
      showToast('Service Update Failed', res?.message || 'Could not update service.', 'error');
      return false;
    }

    const canonical: Service = {
      ...res.service,
      id: res.service.id || res.service._id
    };

    setServices(prev => prev.map(s => (s.id === id ? canonical : s)));
    showToast('Service Updated', `${canonical.name} saved to catalog.`, 'success');
    return true;
  };

  const deleteService = async (id: string): Promise<boolean> => {
    const res = await api.deleteService(id);
    if (!res || !res.success) {
      showToast('Deactivation Failed', res?.message || 'Could not deactivate service.', 'error');
      return false;
    }

    setServices(prev => prev.map(s => (s.id === id ? { ...s, status: 'inactive' } : s)));
    showToast('Service Deactivated', res.message || `Service was deactivated to preserve historical integrity.`, 'info');
    return true;
  };

  // Provider actions
  const addProvider = (data: Partial<Provider>) => {
    const newP: Provider = {
      id: `prov-${Math.floor(10 + Math.random() * 90)}`,
      name: data.name || 'New Verified Specialist',
      phone: data.phone || '+1 (555) 000-0000',
      email: data.email || 'specialist@homeeasecleaning.pro',
      avatar: data.avatar || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=256',
      skills: data.skills || ['Deep Sanitization Specialist', 'Eco Shield'],
      verificationStatus: data.verificationStatus || 'verified',
      jobsCompleted: 0,
      rating: 5.0,
      activeJobs: 0,
      availabilityStatus: 'available',
      location: data.location || 'San Francisco Bay Area',
      joinedDate: new Date().toISOString().slice(0, 10)
    };
    setProviders(prev => [newP, ...prev]);
    showToast('Service Provider Registered', `${newP.name} is now in provider roster.`, 'success');
  };

  const updateProvider = (id: string, updates: Partial<Provider>) => {
    setProviders(prev => prev.map(p => (p.id === id ? { ...p, ...updates } : p)));
    showToast('Provider Details Updated', `Provider #${id} saved.`, 'info');
  };

  // Booking actions
  const addBooking = async (data: Partial<Booking>): Promise<{ success: boolean; booking?: Booking }> => {
    const srv = services.find(s => s.id === data.serviceId);
    const bookingRef = data.id || `BK-${Math.floor(8830 + Math.random() * 999)}`;
    const finalAmount = Number(data.amount) || Number(data.pricingBreakdown?.total) || srv?.price || 349;
    const finalMethod = data.paymentMethod || 'Credit Card';

    const payload = {
      ...data,
      customerName: data.customerName || currentUser.name || 'Valued Customer',
      customerPhone: data.customerPhone || currentUser.phone || '+1 (555) 000-0000',
      customerAddress: data.customerAddress || (currentUser as any).address || 'Address on file',
      customerEmail: currentUser.email || 'customer@client.com',
      serviceId: data.serviceId || srv?.id || 'srv-clean-1',
      serviceName: data.serviceName || srv?.name || 'Full Home Deep Cleaning',
      subserviceId: data.subserviceId || srv?.id,
      subserviceName: data.subserviceName || data.serviceName || srv?.name,
      serviceCategory: data.serviceCategory || srv?.categoryName || 'Home Cleaning Services',
      propertyType: data.propertyType || 'Apartment',
      timeSlot: data.timeSlot || 'Morning (09:00 AM - 11:00 AM)',
      dateTime: data.dateTime || new Date().toISOString().slice(0, 16).replace('T', ' '),
      amount: finalAmount,
      pricingBreakdown: data.pricingBreakdown || {
        basePrice: finalAmount,
        materialCharges: 0,
        inspectionCharges: 0,
        emergencyCharges: 0,
        tax: Math.round(finalAmount * 0.18),
        discount: 0,
        total: Math.round(finalAmount * 1.18)
      },
      paymentMethod: finalMethod,
      problemImages: data.problemImages || [],
      notes: data.notes || 'Booked online via HomeEaseGuru portal.'
    };

    const res = await api.createBooking(payload);
    let canonicalBk: Booking;

    if (res && res.success && res.booking) {
      canonicalBk = {
        ...res.booking,
        id: res.booking.bookingRef || res.booking.id || res.booking._id?.toString()
      };
    } else {
      canonicalBk = {
        id: bookingRef,
        customerName: payload.customerName,
        customerPhone: payload.customerPhone,
        customerAddress: payload.customerAddress,
        serviceId: payload.serviceId,
        serviceName: payload.serviceName,
        subserviceId: payload.subserviceId,
        subserviceName: payload.subserviceName,
        serviceCategory: payload.serviceCategory,
        propertyType: payload.propertyType,
        timeSlot: payload.timeSlot,
        dateTime: payload.dateTime,
        status: 'confirmed',
        amount: payload.amount,
        paymentStatus: finalMethod === 'Cash on Service' ? 'pending' : 'paid',
        paymentMethod: finalMethod,
        notes: payload.notes,
        trackingStep: 2,
        pricingBreakdown: payload.pricingBreakdown,
        problemImages: payload.problemImages,
        createdAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
      };
    }

    setBookings(prev => {
      if (prev.some(b => b.id === canonicalBk.id)) return prev;
      const nextList = [canonicalBk, ...prev];
      try { localStorage.setItem('homeease_bookings_v2', JSON.stringify(nextList)); } catch {}
      return nextList;
    });

    // Also create corresponding payment record
    const newPayment: Payment = {
      id: `PAY-${Math.floor(4100 + Math.random() * 900)}`,
      invoiceNumber: `INV-2026-${Math.floor(1110 + Math.random() * 900)}`,
      customerName: canonicalBk.customerName,
      customerEmail: currentUser.email || 'customer@example.com',
      amount: canonicalBk.amount,
      method: (canonicalBk.paymentMethod as any) || 'Credit Card',
      status: canonicalBk.paymentStatus === 'paid' ? 'completed' : 'pending',
      date: new Date().toISOString().slice(0, 16).replace('T', ' '),
      serviceName: canonicalBk.serviceName,
      providerPayout: Math.round(canonicalBk.amount * 0.7),
      receiptNumber: `RCP-${Math.floor(889200 + Math.random() * 1000)}`
    };
    setPayments(prev => [newPayment, ...prev]);

    // Automatically synchronize booking appointment to Employee Meeting Schedule
    const assignedEmp = employees[0] || { id: 'emp-1', name: 'Marcus Vance' };
    addMeeting({
      title: `Service Appointment: ${canonicalBk.serviceName}`,
      customerName: canonicalBk.customerName,
      customerPhone: canonicalBk.customerPhone,
      customerEmail: `${canonicalBk.customerName.toLowerCase().replace(/\s+/g, '.')}@client.com`,
      employeeId: assignedEmp.id,
      employeeName: assignedEmp.name,
      dateTime: canonicalBk.dateTime,
      durationMinutes: 90,
      type: 'In-person Site Audit',
      notes: `Service Booking #${canonicalBk.id}. Address: ${canonicalBk.customerAddress}. Slot: ${canonicalBk.timeSlot || 'General'}. Notes: ${canonicalBk.notes}`
    }).catch(() => {});

    showToast('Booking Confirmed!', `Booking #${canonicalBk.id} confirmed for ${canonicalBk.customerName}.`, 'success');
    return { success: true, booking: canonicalBk };
  };

  const updateBookingStatus = async (id: string, status: BookingStatus, providerId?: string): Promise<boolean> => {
    const stepMap: Record<BookingStatus, number> = {
      pending: 1,
      confirmed: 2,
      assigned: 3,
      accepted: 4,
      on_the_way: 5,
      in_progress: 6,
      completed: 7,
      payment_pending: 8,
      paid: 9,
      cancelled: 1,
      rejected: 1
    };
    const prov = providerId ? providers.find(p => p.id === providerId) : undefined;

    setBookings(prev =>
      prev.map(b =>
        b.id === id
          ? {
              ...b,
              status,
              providerId: providerId || b.providerId,
              providerName: prov?.name || b.providerName,
              providerPhone: prov?.phone || b.providerPhone,
              trackingStep: stepMap[status] || b.trackingStep
            }
          : b
      )
    );

    const res = await api.updateBookingStatus(id, status, providerId);
    if (res && res.booking) {
      const canonical = { ...res.booking, id: res.booking.bookingRef || res.booking.id || res.booking._id?.toString() };
      setBookings(prev => prev.map(b => (b.id === id ? { ...b, ...canonical } : b)));
    }

    showToast('Booking Status Updated', `Booking #${id} status changed to ${status.toUpperCase().replace(/_/g, ' ')}`, 'info');
    return true;
  };

  const assignBookingProvider = async (bookingId: string, providerId: string): Promise<boolean> => {
    return updateBookingStatus(bookingId, 'assigned', providerId);
  };

  const addBookingReview = async (bookingId: string, reviewData: { rating: number; comment?: string; images?: string[] }): Promise<boolean> => {
    const res = await api.addBookingReview(bookingId, reviewData);
    if (res && res.success && res.booking) {
      const canonical = { ...res.booking, id: res.booking.bookingRef || res.booking.id || res.booking._id?.toString() };
      setBookings(prev => prev.map(b => (b.id === bookingId ? { ...b, ...canonical } : b)));
      showToast('Review Submitted', 'Thank you for your rating and feedback!', 'success');
      return true;
    }
    setBookings(prev =>
      prev.map(b =>
        b.id === bookingId
          ? {
              ...b,
              review: {
                rating: reviewData.rating,
                comment: reviewData.comment,
                images: reviewData.images,
                createdAt: new Date().toISOString()
              }
            }
          : b
      )
    );
    showToast('Review Submitted', 'Your review has been recorded.', 'success');
    return true;
  };

  const respondBooking = async (bookingId: string, action: 'accept' | 'reject', providerId: string, reason?: string): Promise<boolean> => {
    const res = await api.respondBooking(bookingId, action, providerId, reason);
    const newStatus: BookingStatus = action === 'accept' ? 'accepted' : 'rejected';
    if (res && res.success && res.booking) {
      const canonical = { ...res.booking, id: res.booking.bookingRef || res.booking.id || res.booking._id?.toString() };
      setBookings(prev => prev.map(b => (b.id === bookingId ? { ...b, ...canonical } : b)));
    } else {
      updateBookingStatus(bookingId, newStatus);
    }
    showToast(`Booking ${action === 'accept' ? 'Accepted' : 'Declined'}`, `Provider ${action}ed booking assignment.`, 'info');
    return true;
  };

  // Payment actions
  const addPayment = (data: Partial<Payment>) => {
    const newPay: Payment = {
      id: `PAY-${Math.floor(4100 + Math.random() * 99)}`,
      invoiceNumber: `INV-2026-${Math.floor(1110 + Math.random() * 90)}`,
      customerName: data.customerName || 'Valued Customer',
      customerEmail: data.customerEmail || 'billing@example.com',
      amount: data.amount || 250,
      method: data.method || 'Credit Card',
      status: data.status || 'completed',
      date: new Date().toISOString().slice(0, 16).replace('T', ' '),
      serviceName: data.serviceName || 'Cleaning Service',
      providerPayout: Math.round((data.amount || 250) * 0.65),
      receiptNumber: `RCP-${Math.floor(889200 + Math.random() * 100)}`
    };
    setPayments(prev => [newPay, ...prev]);
    showToast('Payment Recorded', `Invoice ${newPay.invoiceNumber} for ₹${newPay.amount}`, 'success');
  };

  const updatePayment = (id: string, updates: Partial<Payment>) => {
    setPayments(prev => prev.map(p => (p.id === id ? { ...p, ...updates } : p)));
    if (updates.status) {
      api.updatePaymentStatus(id, updates.status).catch(() => {});
    }
  };

  // Task actions
  const addTask = (data: Partial<TaskItem>) => {
    const newT: TaskItem = {
      id: `tsk-${Math.floor(10 + Math.random() * 90)}`,
      title: data.title || 'Follow up with client',
      customerName: data.customerName || 'Prospective Client',
      dueDate: data.dueDate || new Date().toISOString().slice(0, 16).replace('T', ' '),
      priority: data.priority || 'medium',
      status: 'pending',
      assignedTo: data.assignedTo || currentUser.name
    };
    setTasks(prev => [newT, ...prev]);
    showToast('Task Created', newT.title, 'success');
  };

  const toggleTask = (id: string) => {
    setTasks(prev =>
      prev.map(t =>
        t.id === id
          ? { ...t, status: t.status === 'completed' ? 'pending' : 'completed' }
          : t
      )
    );
  };

  return (
    <CrmContext.Provider
      value={{
        role,
        setRole,
        currentUser,
        isAuthenticated,
        login,
        sendPhoneOtp,
        loginWithPhone,
        loginWithGoogle,
        register,
        logout,
        theme,
        toggleTheme,

        leads,
        addLead,
        updateLead,
        deleteLead,
        assignLead,
        convertLead,
        clearAllLeads,
        addLeadNote,

        customers,
        addCustomer,
        updateCustomer,
        addCustomerNote,

        employees,
        addEmployee,
        meetings,
        addMeeting,
        updateMeeting,
        cancelMeeting,
        rescheduleMeeting,
        completeMeeting,

        followUps,
        addFollowUp,
        updateFollowUp,
        rescheduleFollowUp,
        completeFollowUp,
        cancelFollowUp,
        deleteFollowUp,

        callLogs,
        addCallLog,

        services,
        categories,
        addService,
        updateService,
        deleteService,

        providers,
        addProvider,
        updateProvider,

        bookings,
        addBooking,
        updateBookingStatus,
        assignBookingProvider,
        addBookingReview,
        respondBooking,

        payments,
        addPayment,
        updatePayment,

        insights,
        notifications,
        activeNotifications,
        markNotificationRead,
        markAllNotificationsRead,
        toggleNotificationRead,
        deleteNotification,
        addNotification,

        tasks,
        addTask,
        toggleTask,

        toasts,
        showToast,
        dismissToast
      }}
    >
      {children}
    </CrmContext.Provider>
  );
};

export const useCrm = () => {
  const context = useContext(CrmContext);
  if (!context) {
    throw new Error('useCrm must be used within a CrmProvider');
  }
  return context;
};
