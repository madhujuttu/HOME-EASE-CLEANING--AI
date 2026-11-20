import { HOME_SERVICES_CATALOG } from './homeServicesCatalog.js';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'sales' | 'customer';
  avatar?: string;
  phone?: string;
  department?: string;
  password?: string;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  serviceId?: string;
  serviceName?: string;
  serviceInterest: string;
  servicePriceSnapshot?: number;
  source: string;
  assignedEmployeeId?: string;
  assignedEmployeeName?: string;
  status: string;
  priority: string;
  aiScore: number;
  aiConversionProb: number;
  aiScoreReason: string;
  interactionHistory: any[];
  assignmentHistory?: any[];
  createdBy?: string;
  nextFollowUp: string;
  estimatedValue: number;
  createdAt: string;
}

export interface MeetingItem {
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
  type: string;
  status: string;
  notes?: string;
  cancellationReason?: string;
  reminderPreferences?: string[];
  rescheduleHistory?: any[];
  createdBy?: string;
  createdByName?: string;
  createdByRole?: string;
  aiSummary?: string;
  customerRequirements?: string[];
  objections?: string[];
  actionItems?: string[];
  suggestedFollowUp?: string;
  meetingLink?: string;
  createdAt?: string;
}

export interface CustomerItem {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  servicePreferences: string[];
  totalBookings: number;
  totalSpent: number;
  loyaltyTier: string;
  satisfactionScore: number;
  notes: string[];
  complaints: any[];
  interactionTimeline: any[];
  createdAt: string;
}

export interface BookingItem {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  serviceId: string;
  serviceName: string;
  providerId?: string;
  providerName?: string;
  providerPhone?: string;
  dateTime: string;
  status: any;
  amount: number;
  paymentStatus: any;
  notes: string;
  trackingStep: number;
  createdAt: string;
}

export interface PaymentItem {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  method: any;
  status: any;
  date: string;
  serviceName: string;
  providerPayout: number;
  receiptNumber: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  timestamp: string;
  scheduledTime?: string;
  read: boolean;
  link?: string;
  recipientRole?: string;
  recipientId?: string;
  relatedEntityId?: string;
  relatedEntityType?: string;
}

export interface ServiceItem {
  id: string;
  categoryId: string;
  categoryName: string;
  name: string;
  description: string;
  price: number;
  pricingType: string;
  duration: string;
  estimatedDuration?: string;
  availability: string;
  image: string;
  imageUrl?: string;
  imageStorageKey?: string;
  features: string[];
  popular?: boolean;
  status: string;
  createdBy?: string;
  createdAt?: string;
}

export interface ProviderItem {
  id: string;
  name: string;
  phone: string;
  email: string;
  avatar: string;
  skills: string[];
  verificationStatus: string;
  jobsCompleted: number;
  rating: number;
  activeJobs: number;
  availabilityStatus: string;
  location: string;
  joinedDate: string;
}

export interface EmployeeItem {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  team: string;
  assignedLeadsCount: number;
  closedDeals: number;
  conversionRate: number;
  targetRevenue: number;
  achievedRevenue: number;
  status: string;
  avatar: string;
}

export class MemoryStore {
  public static users: User[] = [
    {
      id: 'usr-admin-1',
      name: 'Alexander Sterling',
      email: 'alexander@homeeaseguru.com',
      password: 'password123',
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
      department: 'Executive Leadership',
      phone: '+1 (555) 019-2834'
    },
    {
      id: 'usr-mgr-1',
      name: 'Elena Rostova',
      email: 'elena.rostova@homeeaseguru.com',
      password: 'password123',
      role: 'manager',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=256',
      department: 'Sales & Operations',
      phone: '+1 (555) 019-8821'
    },
    {
      id: 'emp-1',
      name: 'Marcus Vance',
      email: 'marcus.vance@homeeaseguru.com',
      password: 'password123',
      role: 'sales',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256',
      department: 'Enterprise Sales',
      phone: '+1 (555) 019-4512'
    },
    {
      id: 'cust-1',
      name: 'Sophia Montgomery',
      email: 'sophia.m@gmail.com',
      password: 'password123',
      role: 'customer',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=256',
      phone: '+1 (555) 014-9921'
    }
  ];

  public static categories = [
    { id: 'cat-1', name: 'Deep Home Cleaning', icon: 'Sparkles', description: 'Comprehensive sanitization, detailing and floor-to-ceiling scrub', serviceCount: 16 },
    ...HOME_SERVICES_CATALOG.map(cat => ({
      id: cat.id,
      name: cat.name,
      icon: cat.icon,
      description: cat.description,
      serviceCount: cat.services.length
    }))
  ];

  public static services: ServiceItem[] = [
    {
      id: 'srv-1',
      categoryId: 'cat-1',
      categoryName: 'Deep Home Cleaning',
      name: 'Ultra Deep Villa Sanitization',
      description: '120-point hospital grade steam sanitation, window detailing, ceiling fans, switchboards, and floor polishing.',
      price: 349,
      pricingType: 'fixed',
      duration: '5 - 6 Hours',
      availability: 'Monday - Sunday, 8 AM - 6 PM',
      image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=800',
      imageUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=800',
      features: ['Hospital-grade HEPA extraction', 'Eco-certified pet-safe detergents', '3-Person Certified Crew', '100% Satisfaction Guarantee'],
      popular: true,
      status: 'active'
    },
    {
      id: 'srv-2',
      categoryId: 'cat-1',
      categoryName: 'Deep Home Cleaning',
      name: 'Executive Apartment Express Deep Clean',
      description: 'Targeted deep clean for 1-2 bedroom apartments. Covers kitchen degrease, bath descaling, and high-touch points.',
      price: 199,
      pricingType: 'fixed',
      duration: '3 - 4 Hours',
      availability: 'Daily',
      image: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&q=80&w=800',
      imageUrl: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&q=80&w=800',
      features: ['2-Person Tech Crew', 'Steam sanitization', 'Zero odor formula'],
      popular: false,
      status: 'active'
    },
    ...HOME_SERVICES_CATALOG.flatMap(cat =>
      cat.services.map(s => ({
        id: s.id,
        categoryId: cat.id,
        categoryName: cat.name,
        name: s.name,
        description: s.description,
        price: s.price,
        pricingType: s.pricingType,
        duration: s.duration,
        estimatedDuration: s.estimatedDuration || s.duration,
        availability: s.availability,
        image: s.image,
        imageUrl: s.image,
        features: s.features,
        popular: Boolean(s.popular),
        status: s.status || 'active'
      }))
    )
  ];

  public static employees: EmployeeItem[] = [
    {
      id: 'emp-1',
      name: 'Marcus Vance',
      role: 'Senior Sales Manager',
      email: 'marcus.vance@homeeaseguru.com',
      phone: '+1 (555) 019-4512',
      team: 'North Metro Tier 1',
      assignedLeadsCount: 18,
      closedDeals: 42,
      conversionRate: 34.8,
      targetRevenue: 45000,
      achievedRevenue: 38200,
      status: 'active',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256'
    },
    {
      id: 'emp-2',
      name: 'Sarah Jenkins',
      role: 'Sales Executive',
      email: 'sarah.j@homeeaseguru.com',
      phone: '+1 (555) 019-3329',
      team: 'West Suburbs Residential',
      assignedLeadsCount: 14,
      closedDeals: 28,
      conversionRate: 29.2,
      targetRevenue: 32000,
      achievedRevenue: 27500,
      status: 'on_call',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=256'
    },
    {
      id: 'emp-3',
      name: 'David Kalu',
      role: 'Sales Executive',
      email: 'david.kalu@homeeaseguru.com',
      phone: '+1 (555) 019-7711',
      team: 'Commercial & Property Accounts',
      assignedLeadsCount: 22,
      closedDeals: 36,
      conversionRate: 31.5,
      targetRevenue: 40000,
      achievedRevenue: 35100,
      status: 'active',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=256'
    },
    {
      id: 'emp-4',
      name: 'Priya Sharma',
      role: 'AI Operations Lead',
      email: 'priya.s@homeeaseguru.com',
      phone: '+1 (555) 019-1144',
      team: 'AI Automation & Inbound',
      assignedLeadsCount: 31,
      closedDeals: 58,
      conversionRate: 41.2,
      targetRevenue: 50000,
      achievedRevenue: 49200,
      status: 'active',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256'
    }
  ];

  public static leads: Lead[] = [];

  public static customers: CustomerItem[] = [];

  public static followUps: any[] = [];

  public static meetings: MeetingItem[] = [
    {
      id: 'meet-1',
      title: 'Post-Renovation Villa Site Inspection',
      customerName: 'Rajesh Sharma',
      customerPhone: '+91 98450 12891',
      customerEmail: 'rajesh.sharma@prestigegolfshire.in',
      employeeId: 'emp-1',
      employeeName: 'Marcus Vance',
      dateTime: '2026-11-17 16:30',
      durationMinutes: 45,
      type: 'In-person Site Audit',
      status: 'scheduled',
      notes: 'Walkthrough 5,500 sqft residence to measure floor square footage and inspect high-ceiling chandeliers.',
      aiSummary: 'Customer requires special scaffolding for 18ft double-height living room windows and non-abrasive limestone cleaning.',
      customerRequirements: ['High ceiling scaffolding', 'Italian marble crystallization', 'Post-paint residue removal'],
      objections: ['Timeline is tight (needs completion before family housewarming on Friday)'],
      actionItems: ['Provide final binding estimate by 7 PM', 'Reserve 4-person senior crew for Thursday morning'],
      suggestedFollowUp: 'Send contract agreement with deposit payment link by 8:00 PM today.',
      meetingLink: 'https://meet.homeeaseguru.com/audit-sharma-844'
    },
    {
      id: 'meet-2',
      title: 'Commercial Multi-Unit Portfolio Discovery',
      customerName: 'Priya Sundaram',
      customerPhone: '+91 98201 44521',
      customerEmail: 'priya.sundaram@novasoft-tech.com',
      employeeId: 'emp-2',
      employeeName: 'Sarah Jenkins',
      dateTime: '2026-11-18 11:00',
      durationMinutes: 30,
      type: 'Virtual Video',
      status: 'scheduled',
      notes: 'Review enterprise SLA, recurring discount schedule, and dedicated crew roster.',
      meetingLink: 'https://meet.homeeaseguru.com/corp-sterling-908'
    },
    {
      id: 'meet-3',
      title: 'Move-in Deep Clean Scoping Call',
      customerName: 'Claire Beauchamp',
      customerPhone: '+1 (555) 345-6712',
      customerEmail: 'c.beauchamp@luxuryhome.io',
      employeeId: 'emp-2',
      employeeName: 'Sarah Jenkins',
      dateTime: '2026-11-17 14:00',
      durationMinutes: 20,
      type: 'Phone Consultation',
      status: 'completed',
      notes: 'Agreed on 6-hour turnkey turnover package. Customer confirmed keys will be in lockbox #882.',
      aiSummary: 'Customer expressed satisfaction with guaranteed deposit refund policy and agreed to package without pricing objections.',
      actionItems: ['Send payment link for ₹420', 'Dispatch crew supervisor on scheduled date at 8:00 AM'],
      suggestedFollowUp: 'Confirm key code receipt on morning of service.'
    }
  ];

  public static calls = [
    {
      id: 'call-901',
      type: 'inbound',
      customerName: 'Dr. Raymond Thornton',
      phone: '+1 (555) 234-8901',
      durationSeconds: 245,
      status: 'completed',
      timestamp: '2026-11-17 11:15',
      agentType: 'ai_voice',
      agentName: 'Aria (AI Voice Assistant v4.2)',
      sentiment: 'positive',
      consentGiven: true,
      summary: 'Customer called asking for immediate 5,500 sqft villa cleaning following construction contractors. AI answered pricing FAQs, verified location within service area, and booked 4:30 PM site audit with Marcus Vance.',
      extractedRequirements: ['Post-construction dust extraction', '18ft high ceiling windows', 'Immediate Thursday execution'],
      recommendedAction: 'Prepare high-tier proposal with dedicated 4-person crew and express scheduling surcharge.',
      transcript: [
        { speaker: 'Aria (AI)', text: 'Thank you for calling HomeEase Guru premium home sanitization. My name is Aria, your AI concierge. This call may be recorded for quality and compliance. How may I assist your residence today?', time: '00:01' },
        { speaker: 'Dr. Raymond', text: 'Hi Aria. I have a 5,500 sqft villa in Marina Bay and our general contractors just finished painting and cabinetry today. The entire place is covered in fine drywall dust. Can you handle large properties quickly?', time: '00:14' },
        { speaker: 'Aria (AI)', text: 'Absolutely Dr. Thornton. Our Villa Deep Sanitization service utilizes hospital-grade negative air extraction and 120-point detail scrubbing, specifically designed for post-renovation dust. What day would you need the service completed by?', time: '00:32' },
        { speaker: 'Dr. Raymond', text: 'Ideally by Thursday or Friday morning because my family is moving in over the weekend. What is the process?', time: '00:46' },
        { speaker: 'Aria (AI)', text: 'We can definitely accommodate that timeline. I can dispatch our senior sales specialist, Marcus Vance, for an on-site audit today at 4:30 PM to measure the spaces and issue an immediate proposal. Would that work for you?', time: '01:02' },
        { speaker: 'Dr. Raymond', text: 'Yes, 4:30 PM is perfect. Please send the confirmation to my mobile number.', time: '01:12' },
        { speaker: 'Aria (AI)', text: 'Appointment confirmed for 4:30 PM today at 844 Marina Bay Blvd. A confirmation SMS with Marcus contact details has been dispatched. Have a wonderful day!', time: '01:25' }
      ]
    },
    {
      id: 'call-902',
      type: 'outbound',
      customerName: 'Melinda Vasquez',
      phone: '+1 (555) 672-9901',
      durationSeconds: 180,
      status: 'completed',
      timestamp: '2026-11-17 13:40',
      agentType: 'ai_voice',
      agentName: 'Orion (AI Outbound Follow-up)',
      sentiment: 'hesitant',
      consentGiven: true,
      summary: 'AI initiated automated callback following ad submission. Customer stated she has 2 velvet sectional couches with food stains and pet dander. Sent visual hydro-extraction video and offer for ₹200 off first service.',
      extractedRequirements: ['2 Velvet sectionals', 'Pet dander removal', 'Sensitive fabric protection'],
      recommendedAction: 'Sales rep follow-up tomorrow at 11:30 AM with seasonal coupon code.',
      transcript: [
        { speaker: 'Orion (AI)', text: 'Hello Melinda! This is Orion calling transparently on behalf of HomeEase Guru customer care. You recently requested info on our sofa hydro-extraction care. Do you have 2 minutes to discuss your requirements?', time: '00:03' },
        { speaker: 'Melinda Vasquez', text: 'Oh hello! Yes, I was looking for someone who can clean velvet without water stains.', time: '00:15' },
        { speaker: 'Orion (AI)', text: 'You are in good hands. We use temperature-controlled moisture extraction specifically formulated for delicate velvet and microfibers with no residue. I can text you a short 30-second demonstration video right now.', time: '00:32' },
        { speaker: 'Melinda Vasquez', text: 'That would be great, send it over.', time: '00:44' }
      ]
    }
  ];

  public static providers: ProviderItem[] = [
    {
      id: 'prov-1',
      name: 'Carlos Mendes',
      phone: '+1 (555) 773-1092',
      email: 'carlos.m@homeeasecleaning.pro',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=256',
      skills: ['Deep Sanitization Specialist', 'High-Pressure Steam', 'Grout Restoration', 'Team Captain'],
      verificationStatus: 'verified',
      jobsCompleted: 342,
      rating: 4.95,
      activeJobs: 1,
      availabilityStatus: 'on_job',
      location: 'Marina Bay / Downtown Hub',
      joinedDate: '2023-04-12'
    },
    {
      id: 'prov-2',
      name: 'Amara Washington',
      phone: '+1 (555) 773-8821',
      email: 'amara.w@homeeasecleaning.pro',
      avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=256',
      skills: ['Upholstery Hydro-Extraction', 'Mattress Sanitization', 'Pet Odor Neutralization'],
      verificationStatus: 'verified',
      jobsCompleted: 218,
      rating: 4.92,
      activeJobs: 0,
      availabilityStatus: 'available',
      location: 'Pasadena / East Valley',
      joinedDate: '2023-09-01'
    },
    {
      id: 'prov-3',
      name: 'Viktor Romanov',
      phone: '+1 (555) 773-4554',
      email: 'viktor.r@homeeasecleaning.pro',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=256',
      skills: ['Commercial Kitchen Degreasing', 'Duct & HVAC Coil Sanitization', 'Ozone Odor Eradication'],
      verificationStatus: 'verified',
      jobsCompleted: 189,
      rating: 4.88,
      activeJobs: 0,
      availabilityStatus: 'available',
      location: 'West LA / Santa Monica',
      joinedDate: '2024-01-15'
    }
  ];

  public static bookings: BookingItem[] = [
    {
      id: 'BK-8821',
      customerName: 'Arthur Pendelton',
      customerPhone: '+1 (555) 881-2299',
      customerAddress: '42 Silverado Canyon, Irvine, CA',
      serviceId: 'srv-3',
      serviceName: 'Heavy Kitchen Degrease & Steam Blitz',
      providerId: 'prov-1',
      providerName: 'Carlos Mendes',
      providerPhone: '+1 (555) 773-1092',
      dateTime: '2026-11-17 14:30',
      status: 'in_progress',
      amount: 480,
      paymentStatus: 'paid',
      notes: 'Include oven degrease and king mattress extraction.',
      trackingStep: 4,
      createdAt: '2026-11-16 16:00'
    },
    {
      id: 'BK-8822',
      customerName: 'Sophia Montgomery',
      customerPhone: '+1 (555) 014-9921',
      customerAddress: '742 Evergreen Terrace, Pasadena, CA 91101',
      serviceId: 'srv-1',
      serviceName: 'Ultra Deep Villa Sanitization',
      providerId: 'prov-2',
      providerName: 'Amara Washington',
      providerPhone: '+1 (555) 773-8821',
      dateTime: '2026-11-18 08:30',
      status: 'confirmed',
      amount: 720,
      paymentStatus: 'paid',
      notes: 'Gate code #4491. Use hypoallergenic cleaning solutions for pets.',
      trackingStep: 2,
      createdAt: '2026-11-16 11:30'
    },
    {
      id: 'BK-8823',
      customerName: 'Claire Beauchamp',
      customerPhone: '+1 (555) 345-6712',
      customerAddress: '1204 Oak Ridge Crest, Beverly Hills, CA',
      serviceId: 'srv-6',
      serviceName: 'Turnkey Tenant Security Deposit Guarantee Clean',
      providerId: undefined,
      providerName: undefined,
      dateTime: '2026-11-19 09:00',
      status: 'pending',
      amount: 420,
      paymentStatus: 'pending',
      notes: 'Property manager audit at 4 PM on same day.',
      trackingStep: 1,
      createdAt: '2026-11-17 10:15'
    }
  ];

  public static payments: PaymentItem[] = [
    {
      id: 'PAY-4091',
      invoiceNumber: 'INV-2026-1101',
      customerName: 'Arthur Pendelton',
      customerEmail: 'arthur.p@techcapital.vc',
      amount: 480,
      method: 'Credit Card',
      status: 'completed',
      date: '2026-11-16 16:05',
      serviceName: 'Heavy Kitchen Degrease & Steam Blitz',
      providerPayout: 310,
      receiptNumber: 'RCP-889102'
    },
    {
      id: 'PAY-4092',
      invoiceNumber: 'INV-2026-1102',
      customerName: 'Sophia Montgomery',
      customerEmail: 'sophia.m@gmail.com',
      amount: 720,
      method: 'Stripe',
      status: 'completed',
      date: '2026-11-16 11:35',
      serviceName: 'Ultra Deep Villa Sanitization',
      providerPayout: 468,
      receiptNumber: 'RCP-889103'
    },
    {
      id: 'PAY-4093',
      invoiceNumber: 'INV-2026-1103',
      customerName: 'Claire Beauchamp',
      customerEmail: 'c.beauchamp@luxuryhome.io',
      amount: 420,
      method: 'Net Banking',
      status: 'pending',
      date: '2026-11-17 10:20',
      serviceName: 'Turnkey Tenant Security Deposit Guarantee Clean',
      providerPayout: 275,
      receiptNumber: 'RCP-889104'
    }
  ];

  public static aiInsights = [
    {
      id: 'ins-1',
      title: 'High-Value Conversion Spike in North Metro',
      category: 'revenue',
      description: 'Leads generated from AI Inbound Voice calling convert at 41.2% higher rate compared to standard web forms. Average deal size is +₹280 larger.',
      impact: 'high',
      metric: '+41.2% Conversion Lift',
      recommendedAction: 'Increase Google Ads call-only extension budget by 25% during peak hours 9 AM - 2 PM.',
      confidenceScore: 94,
      timestamp: 'Today at 08:30 AM'
    },
    {
      id: 'ins-2',
      title: 'Follow-Up Bottleneck Detected for Lead #104',
      category: 'bottleneck',
      description: 'Melinda Vasquez has been in unassigned status for over 4 hours after initial AI engagement. Risk of lead decay increases by 60% after 6 hours.',
      impact: 'high',
      metric: '60% Decay Velocity',
      recommendedAction: 'Auto-assign to Sarah Jenkins (current capacity: 14/25 leads) and trigger instant WhatsApp catalog.',
      confidenceScore: 91,
      timestamp: 'Today at 12:15 PM'
    },
    {
      id: 'ins-3',
      title: 'Predictive Churn Alert on Commercial Accounts',
      category: 'churn',
      description: '2 property management leads showed hesitation regarding certificate of insurance lead times.',
      impact: 'medium',
      metric: '18% Churn Risk',
      recommendedAction: 'Pre-load standardized COI templates in customer booking portal to eliminate 48hr delay.',
      confidenceScore: 86,
      timestamp: 'Yesterday at 04:10 PM'
    }
  ];

  public static notifications: NotificationItem[] = [
    {
      id: 'notif-1',
      title: 'High-Intent Lead Assigned',
      message: 'Rajesh Sharma assigned to Marcus Vance. Site audit scheduled today at 4:30 PM.',
      type: 'ai',
      timestamp: '15 mins ago',
      read: false,
      link: '/admin/leads'
    },
    {
      id: 'notif-2',
      title: 'Booking In Progress',
      message: 'Carlos Mendes started service on booking #BK-8821 for Rohan Kapoor.',
      type: 'booking',
      timestamp: '45 mins ago',
      read: false,
      link: '/admin/bookings'
    },
    {
      id: 'notif-3',
      title: 'Payment Received',
      message: 'UPI transaction #PAY-4092 of ₹24,500 confirmed from Sophia Montgomery.',
      type: 'payment',
      timestamp: '2 hours ago',
      read: true,
      link: '/admin/payments'
    }
  ];

  public static tasks = [
    {
      id: 'tsk-1',
      title: 'Conduct Site Walkthrough & Take Measurements',
      customerName: 'Rajesh Sharma',
      dueDate: '2026-11-17 16:30',
      priority: 'urgent',
      status: 'pending',
      assignedTo: 'Marcus Vance'
    },
    {
      id: 'tsk-2',
      title: 'Send Revised Corporate Facility RFP Proposal',
      customerName: 'Priya Sundaram',
      dueDate: '2026-11-17 17:00',
      priority: 'high',
      status: 'pending',
      assignedTo: 'Sarah Jenkins'
    }
  ];
}
