export type UserRole = 'admin' | 'manager' | 'sales' | 'customer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
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
}

export type LeadStatus = 'new' | 'assigned' | 'unassigned' | 'qualified' | 'converted' | 'lost';
export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export interface Interaction {
  id: string;
  type: 'call' | 'email' | 'meeting' | 'note' | 'whatsapp';
  date: string;
  agentName: string;
  summary: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
}

export interface LeadAuditEntry {
  field: string;
  previousValue?: any;
  newValue?: any;
  changedBy?: string;
  changedByName?: string;
  timestamp: string;
}

export interface Lead {
  id: string;
  name: string;
  company?: string;
  phone: string;
  email: string;
  address: string;
  serviceId?: string;
  serviceName?: string;
  serviceInterest: string;
  services?: string[];
  servicePriceSnapshot?: number;
  source: 'Google Ads' | 'Website Form' | 'Meta Ads' | 'Referral' | 'AI Inbound Call' | 'Walk-in';
  assignedEmployeeId?: string;
  assignedEmployeeName?: string;
  status: LeadStatus;
  priority: Priority;
  customerRequirements?: string[];
  contactPreference?: 'phone' | 'email' | 'whatsapp';
  preferredTimeline?: string;
  notes?: string;
  aiScore: number; // 0-100
  aiConversionProb: number; // 0-100%
  aiScoreReason: string;
  interactionHistory: Interaction[];
  assignmentHistory?: any[];
  auditHistory?: LeadAuditEntry[];
  createdBy?: string;
  createdByName?: string;
  updatedBy?: string;
  updatedByName?: string;
  nextFollowUp: string;
  estimatedValue: number;
  createdAt: string;
  updatedAt?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  servicePreferences: string[];
  totalBookings: number;
  totalSpent: number;
  loyaltyTier: 'Silver' | 'Gold' | 'Platinum';
  satisfactionScore: number; // 1-5
  notes: string[];
  complaints: { id: string; date: string; issue: string; status: 'open' | 'resolved' }[];
  interactionTimeline: Interaction[];
  createdAt: string;
}

export interface Employee {
  id: string;
  name: string;
  role: 'Sales Executive' | 'Senior Sales Manager' | 'Team Lead' | 'AI Operations Lead';
  email: string;
  phone: string;
  team: string;
  assignedLeadsCount: number;
  closedDeals: number;
  conversionRate: number; // %
  targetRevenue: number;
  achievedRevenue: number;
  status: 'active' | 'on_call' | 'offline';
  avatar: string;
}

export type MeetingStatus = 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'missed' | 'rescheduled';

export interface Meeting {
  id: string;
  title: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerId?: string;
  leadId?: string;
  employeeId: string;
  employeeName: string;
  dateTime: string;
  durationMinutes: number;
  type: 'Virtual Video' | 'In-person Site Audit' | 'Phone Consultation';
  status: MeetingStatus;
  notes?: string;
  cancellationReason?: string;
  reminderPreferences?: string[];
  rescheduleHistory?: any[];
  editHistory?: any[];
  createdBy?: string;
  createdByName?: string;
  createdByRole?: string;
  aiSummary?: string;
  outcome?: string;
  discussionSummary?: string;
  customerRequirements?: string[];
  objections?: string[];
  actionItems?: string[];
  agreedActions?: string[];
  suggestedFollowUp?: string;
  nextAction?: string;
  proofAttachment?: string;
  meetingLink?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type FollowUpType = 'call' | 'email' | 'whatsapp' | 'meeting' | 'visit';
export type FollowUpStatus = 'pending' | 'completed' | 'rescheduled' | 'cancelled' | 'overdue';
export type FollowUpOutcome = 'connected' | 'busy' | 'callback_requested' | 'interested' | 'not_interested' | 'converted' | string;

export interface FollowUpRescheduleEntry {
  previousDateTime: string;
  newDateTime: string;
  rescheduledBy?: string;
  rescheduledByName?: string;
  reason?: string;
  timestamp: string;
}

export interface FollowUp {
  id: string;
  leadId?: string;
  leadName?: string;
  customerId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  employeeId: string;
  employeeName: string;
  type: FollowUpType;
  scheduledDateTime: string;
  status: FollowUpStatus;
  priority: Priority;
  purpose: string;
  notes?: string;
  outcome?: FollowUpOutcome;
  discussionSummary?: string;
  customerFeedback?: string;
  completedAt?: string;
  completedBy?: string;
  completedByName?: string;
  proofAttachment?: string;
  nextAction?: string;
  rescheduleReason?: string;
  cancellationReason?: string;
  rescheduleHistory?: FollowUpRescheduleEntry[];
  createdBy?: string;
  createdByName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type CallStatus = 'scheduled' | 'initiated' | 'ringing' | 'connected' | 'completed' | 'failed' | 'no_answer';

export interface CallLog {
  id: string;
  type: 'inbound' | 'outbound';
  customerName: string;
  phone: string;
  durationSeconds: number;
  status: CallStatus;
  timestamp: string;
  agentType: 'ai_voice' | 'human_sales';
  agentName: string;
  sentiment: 'positive' | 'neutral' | 'hesitant' | 'frustrated';
  consentGiven: boolean;
  transcript: { speaker: string; text: string; time: string }[];
  summary: string;
  extractedRequirements: string[];
  recommendedAction: string;
  recordingSimulationUrl?: string;
  cost?: number;
}

export interface ServiceCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  serviceCount: number;
}

export interface Service {
  id: string;
  categoryId: string;
  categoryName: string;
  name: string;
  description: string;
  price: number;
  pricingType: 'fixed' | 'starting_from' | 'hourly' | 'unit' | 'sqft';
  duration: string;
  estimatedDuration?: string;
  availability: string;
  image: string;
  imageUrl?: string;
  imageStorageKey?: string;
  features: string[];
  inclusions?: string[];
  exclusions?: string[];
  inspectionCharges?: number;
  materialCharges?: number;
  emergencyCharges?: number;
  discountPercentage?: number;
  taxRate?: number;
  popular?: boolean;
  status: 'active' | 'inactive';
  createdBy?: string;
  createdAt?: string;
}

export interface Provider {
  id: string;
  name: string;
  phone: string;
  email: string;
  avatar: string;
  skills: string[];
  verificationStatus: 'verified' | 'pending' | 'rejected';
  jobsCompleted: number;
  rating: number; // 1-5
  activeJobs: number;
  availabilityStatus: 'available' | 'on_job' | 'off_duty';
  location: string;
  joinedDate: string;
}

export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'assigned'
  | 'accepted'
  | 'on_the_way'
  | 'in_progress'
  | 'completed'
  | 'payment_pending'
  | 'paid'
  | 'cancelled'
  | 'rejected';

export interface BookingReview {
  rating: number; // 1-5
  comment?: string;
  images?: string[];
  createdAt?: string;
}

export interface PricingBreakdown {
  basePrice: number;
  inspectionCharges: number;
  materialCharges: number;
  emergencyCharges: number;
  discount: number;
  tax: number;
  total: number;
}

export interface Booking {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  serviceId: string;
  serviceName: string;
  serviceCategory?: string;
  subserviceId?: string;
  subserviceName?: string;
  propertyType?: string;
  timeSlot?: string;
  problemImages?: string[];
  pricingBreakdown?: PricingBreakdown;
  paymentMethod?: 'Cash on Service' | 'Credit Card' | 'UPI' | 'Net Banking' | 'Stripe';
  providerId?: string;
  providerName?: string;
  providerPhone?: string;
  dateTime: string;
  status: BookingStatus;
  amount: number;
  paymentStatus: 'paid' | 'pending' | 'refunded';
  notes: string;
  trackingStep: number; // 1 to 11
  statusHistory?: {
    status: BookingStatus;
    timestamp: string;
    note?: string;
    updatedBy?: string;
  }[];
  review?: BookingReview;
  createdAt: string;
}

export interface Payment {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  method: 'Credit Card' | 'UPI' | 'Net Banking' | 'Cash on Service' | 'Stripe';
  status: 'completed' | 'pending' | 'refunded' | 'failed';
  date: string;
  serviceName: string;
  providerPayout: number;
  receiptNumber: string;
}

export interface AIInsight {
  id: string;
  title: string;
  category: 'lead' | 'revenue' | 'meeting' | 'bottleneck' | 'churn';
  description: string;
  impact: 'high' | 'medium' | 'low';
  metric: string;
  recommendedAction: string;
  confidenceScore: number; // %
  timestamp: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'reminder' | 'alert' | 'ai' | 'booking' | 'payment' | 'followup';
  timestamp: string;
  scheduledTime?: string;
  read: boolean;
  link?: string;
  targetRole?: 'all' | UserRole;
  recipientRole?: string;
  recipientId?: string;
  relatedEntityId?: string;
  relatedEntityType?: string;
}

export interface TaskItem {
  id: string;
  title: string;
  customerName: string;
  dueDate: string;
  priority: Priority;
  status: 'pending' | 'completed' | 'overdue';
  assignedTo: string;
}
