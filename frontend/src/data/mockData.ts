import {
  Lead,
  Customer,
  Employee,
  Meeting,
  CallLog,
  ServiceCategory,
  Service,
  Provider,
  Booking,
  Payment,
  AIInsight,
  NotificationItem,
  TaskItem,
  User
} from '../types';
import { HOME_SERVICES_CATALOG } from './homeServicesCatalog';

export const mockUsers: Record<string, User> = {
  admin: {
    id: 'usr-admin-1',
    name: 'Alexander Sterling',
    email: 'alexander@homeeaseguru.com',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
    department: 'Executive Leadership',
    phone: '+1 (555) 019-2834'
  },
  manager: {
    id: 'usr-mgr-1',
    name: 'Elena Rostova',
    email: 'elena.rostova@homeeaseguru.com',
    role: 'manager',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=256',
    department: 'Sales & Operations',
    phone: '+1 (555) 019-8821'
  },
  sales: {
    id: 'emp-1',
    name: 'Marcus Vance',
    email: 'marcus.vance@homeeaseguru.com',
    role: 'sales',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256',
    department: 'Enterprise Sales',
    phone: '+1 (555) 019-4512'
  },
  customer: {
    id: 'cust-1',
    name: 'Sophia Montgomery',
    email: 'sophia.m@gmail.com',
    role: 'customer',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=256',
    phone: '+1 (555) 014-9921'
  }
};

export const initialCategories: ServiceCategory[] = HOME_SERVICES_CATALOG.map(cat => ({
  id: cat.id,
  name: cat.name,
  icon: cat.icon,
  description: cat.description,
  serviceCount: cat.services.length
}));

export const initialServices: Service[] = [
  {
    id: 'srv-1',
    categoryId: 'cat-home-cleaning',
    categoryName: 'Home Cleaning Services',
    name: 'Ultra Deep Villa Sanitization',
    description: '120-point hospital grade steam sanitation, window detailing, ceiling fans, switchboards, and floor polishing.',
    price: 349,
    pricingType: 'fixed',
    duration: '5 - 6 Hours',
    estimatedDuration: '5 - 6 Hours',
    availability: 'Monday - Sunday, 8 AM - 6 PM',
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=800',
    features: ['Hospital-grade HEPA extraction', 'Eco-certified pet-safe detergents', '3-Person Certified Crew', '100% Satisfaction Guarantee'],
    popular: true,
    status: 'active'
  },
  ...HOME_SERVICES_CATALOG.flatMap(cat =>
    cat.services.map(srv => ({
      id: srv.id,
      categoryId: cat.id,
      categoryName: cat.name,
      name: srv.name,
      description: srv.description,
      price: srv.price,
      pricingType: srv.pricingType,
      duration: srv.duration,
      estimatedDuration: srv.estimatedDuration || srv.duration,
      availability: srv.availability,
      image: srv.image,
      features: srv.features,
      inclusions: srv.inclusions,
      exclusions: srv.exclusions,
      inspectionCharges: srv.inspectionCharges,
      materialCharges: srv.materialCharges,
      emergencyCharges: srv.emergencyCharges,
      discountPercentage: srv.discountPercentage,
      popular: srv.popular,
      status: srv.status
    }))
  )
];

export const initialEmployees: Employee[] = [
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

export const initialLeads: Lead[] = [];

export const initialCustomers: Customer[] = [];

export const initialMeetings: Meeting[] = [
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
    notes: 'Review enterprise SLA, recurring discount schedule, and dedicated commercial crew roster.',
    meetingLink: 'https://meet.homeeaseguru.com/corp-techcorp-908'
  },
  {
    id: 'meet-3',
    title: 'Penthouse Marble Grinding Scoping Call',
    customerName: 'Vikramaditya Singhania',
    customerPhone: '+91 98112 90812',
    customerEmail: 'v.singhania@singhaniaholdings.in',
    employeeId: 'emp-3',
    employeeName: 'David Kalu',
    dateTime: '2026-11-17 14:00',
    durationMinutes: 20,
    type: 'Phone Consultation',
    status: 'completed',
    notes: 'Agreed on 5-stage diamond resin disc polishing and protective crystal seal.',
    aiSummary: 'Customer confirmed high satisfaction with prior portfolio photos and locked booking date.',
    actionItems: ['Send payment link for advance deposit', 'Dispatch crew supervisor on scheduled date at 8:00 AM'],
    suggestedFollowUp: 'Confirm security gate entry pass for equipment van.'
  },
  {
    id: 'meet-4',
    title: 'Quarterly Maintenance Review',
    customerName: 'Rohan Kapoor',
    customerPhone: '+91 99803 55670',
    customerEmail: 'rohan@kapoorhospitality.com',
    employeeId: 'emp-1',
    employeeName: 'Marcus Vance',
    dateTime: '2026-11-16 10:00',
    durationMinutes: 30,
    type: 'Virtual Video',
    status: 'completed',
    notes: 'Reviewed past commercial kitchen cleanings; customer renewed annual contract.',
    aiSummary: 'Renewal finalized at ₹48,000 annual prepaid plan with 15% VIP discount.',
    actionItems: ['Issue annual invoice to finance dept']
  }
];

export const initialCallLogs: CallLog[] = [
  {
    id: 'call-901',
    type: 'inbound',
    customerName: 'Rajesh Sharma',
    phone: '+91 98450 12891',
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
      { speaker: 'Rajesh Sharma', text: 'Hi Aria. I have a 5,500 sqft villa in Prestige Golfshire and our interior contractors just finished wood polish and painting today. The entire place is covered in fine dust. Can you handle large villas quickly?', time: '00:14' },
      { speaker: 'Aria (AI)', text: 'Absolutely Mr. Sharma. Our Villa Deep Sanitization service utilizes hospital-grade negative air extraction and 120-point detail scrubbing, specifically designed for post-renovation dust. What day would you need the service completed by?', time: '00:32' },
      { speaker: 'Rajesh Sharma', text: 'Ideally by Thursday or Friday morning because my family has a housewarming ceremony over the weekend. What is the process?', time: '00:46' },
      { speaker: 'Aria (AI)', text: 'We can definitely accommodate that timeline. I can dispatch our senior sales specialist, Marcus Vance, for an on-site audit today at 4:30 PM to measure the spaces and issue an immediate proposal. Would that work for you?', time: '01:02' },
      { speaker: 'Rajesh Sharma', text: 'Yes, 4:30 PM is perfect. Please send the confirmation to my mobile number.', time: '01:12' },
      { speaker: 'Aria (AI)', text: 'Appointment confirmed for 4:30 PM today at Villa 42, Prestige Golfshire. A confirmation SMS with Marcus\'s contact details has been dispatched. Have a wonderful day!', time: '01:25' }
    ]
  },
  {
    id: 'call-902',
    type: 'outbound',
    customerName: 'Ananya Iyer',
    phone: '+91 97411 77234',
    durationSeconds: 180,
    status: 'completed',
    timestamp: '2026-11-17 13:40',
    agentType: 'ai_voice',
    agentName: 'Orion (AI Outbound Follow-up)',
    sentiment: 'hesitant',
    consentGiven: true,
    summary: 'AI initiated automated callback following ad submission. Customer stated she has pre-occupancy move-in cleaning requirement in Hiranandani Powai. Sent visual hydro-extraction video and estimate.',
    extractedRequirements: ['Move-in cleaning', 'Balcony pressure jetting', 'Kitchen cabinet degreasing'],
    recommendedAction: 'Sales rep follow-up tomorrow at 11:30 AM with seasonal booking voucher.',
    transcript: [
      { speaker: 'Orion (AI)', text: 'Hello Ananya! This is Orion calling transparently on behalf of HomeEase Guru customer care. You recently requested info on our move-in deep cleaning in Mumbai. Do you have 2 minutes to discuss your requirements?', time: '00:03' },
      { speaker: 'Ananya Iyer', text: 'Oh hello! Yes, I was looking for full turnover sanitization before my furniture arrives next week.', time: '00:15' },
      { speaker: 'Orion (AI)', text: 'You are in good hands. We provide complete 80-point deep sanitization including tile scrub, acid-free lime scale removal, and balcony jet wash. I can text you a short service brochure right now.', time: '00:32' },
      { speaker: 'Ananya Iyer', text: 'That would be great, send it over.', time: '00:44' }
    ]
  },
  {
    id: 'call-903',
    type: 'inbound',
    customerName: 'Rohan Kapoor',
    phone: '+91 99803 55670',
    durationSeconds: 310,
    status: 'completed',
    timestamp: '2026-11-16 15:40',
    agentType: 'human_sales',
    agentName: 'Marcus Vance',
    sentiment: 'positive',
    consentGiven: true,
    summary: 'Direct sales conversation. Customer booked heavy kitchen steam blitz + modular chimney degreasing package. Paid booking deposit in full.',
    extractedRequirements: ['Stove burner carbon removal', 'King mattress dust mite eradication'],
    recommendedAction: 'Confirmed booking #BK-8821 assigned to Master Tech Carlos Mendes.',
    transcript: [
      { speaker: 'Marcus Vance', text: 'HomeEase Guru Executive Sales, Marcus Vance speaking.', time: '00:02' },
      { speaker: 'Arthur Pendelton', text: 'Hi Marcus, I reviewed the quotation for the kitchen and mattress package. I would like to lock in Saturday at 9 AM.', time: '00:15' }
    ]
  },
  {
    id: 'call-904',
    type: 'outbound',
    customerName: 'Reginald Croft',
    phone: '+1 (555) 441-9988',
    durationSeconds: 25,
    status: 'no_answer',
    timestamp: '2026-11-16 11:20',
    agentType: 'ai_voice',
    agentName: 'Aria (AI Voice Assistant)',
    sentiment: 'neutral',
    consentGiven: false,
    summary: 'Outbound scheduled check-in call was unanswered. Voicemail left automatically with digital callback link.',
    extractedRequirements: [],
    recommendedAction: 'Automated email sent; no further call for 48 hours in compliance with frequency limits.',
    transcript: []
  }
];

export const initialProviders: Provider[] = [
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
  },
  {
    id: 'prov-4',
    name: 'Mateo Ortiz',
    phone: '+1 (555) 773-9090',
    email: 'mateo.o@homeeasecleaning.pro',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=256',
    skills: ['Eco Pest Shield', 'Termite Eradication', 'Drain Sanitization'],
    verificationStatus: 'verified',
    jobsCompleted: 145,
    rating: 4.85,
    activeJobs: 0,
    availabilityStatus: 'available',
    location: 'Beverly Hills / Hollywood',
    joinedDate: '2024-03-20'
  }
];

export const initialBookings: Booking[] = [
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
    trackingStep: 4, // 1: Confirmed, 2: Provider Assigned, 3: On the way, 4: In Progress, 5: Completed
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
  },
  {
    id: 'BK-8820',
    customerName: 'Harrison Wells',
    customerPhone: '+1 (555) 382-7711',
    customerAddress: '320 Central Park West, Apt 14D, New York, NY',
    serviceId: 'srv-4',
    serviceName: 'Sofa & Mattress Hydro-Extraction Care',
    providerId: 'prov-3',
    providerName: 'Viktor Romanov',
    providerPhone: '+1 (555) 773-4554',
    dateTime: '2026-11-15 10:00',
    status: 'completed',
    amount: 298,
    paymentStatus: 'paid',
    notes: 'Completed with 5-star customer review.',
    trackingStep: 5,
    createdAt: '2026-11-13 14:00'
  }
];

export const initialPayments: Payment[] = [
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
  },
  {
    id: 'PAY-4090',
    invoiceNumber: 'INV-2026-1099',
    customerName: 'Harrison Wells',
    customerEmail: 'h.wells@starindustries.org',
    amount: 298,
    method: 'Credit Card',
    status: 'completed',
    date: '2026-11-15 10:10',
    serviceName: 'Sofa & Mattress Hydro-Extraction Care',
    providerPayout: 195,
    receiptNumber: 'RCP-889100'
  }
];

export const initialAIInsights: AIInsight[] = [
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
  },
  {
    id: 'ins-4',
    title: 'Top Performing Service: Villa Deep Sanitization',
    category: 'lead',
    description: 'Generates 54% of gross monthly profit margin with highest customer repeat rate (3.4 cleanings/year).',
    impact: 'high',
    metric: '54% Gross Margin Share',
    recommendedAction: 'Bundle villa sanitization with quarterly fabric protection packages for upsell.',
    confidenceScore: 97,
    timestamp: '2 days ago'
  }
];

export const initialNotifications: NotificationItem[] = [
  // Admin & Management Notifications
  {
    id: 'notif-admin-1',
    title: 'High-Intent Lead Assigned',
    message: 'Rajesh Sharma assigned to Marcus Vance. Site audit scheduled today at 4:30 PM.',
    type: 'ai',
    timestamp: '15 mins ago',
    read: false,
    link: '/admin/leads',
    targetRole: 'admin'
  },
  {
    id: 'notif-admin-2',
    title: 'Technician Job In Progress',
    message: 'Carlos Mendes started service on booking #BK-8821 for Rohan Kapoor.',
    type: 'booking',
    timestamp: '45 mins ago',
    read: false,
    link: '/admin/bookings',
    targetRole: 'admin'
  },
  {
    id: 'notif-admin-3',
    title: 'Payment Confirmed',
    message: 'UPI transaction #PAY-4092 of ₹24,500 confirmed from Sophia Montgomery.',
    type: 'payment',
    timestamp: '2 hours ago',
    read: true,
    link: '/admin/payments',
    targetRole: 'admin'
  },
  {
    id: 'notif-admin-4',
    title: 'Provider Verification Pending',
    message: 'David Rodriguez submitted EPA non-toxic chemical certification for verification.',
    type: 'alert',
    timestamp: '3 hours ago',
    read: false,
    link: '/admin/providers',
    targetRole: 'admin'
  },
  {
    id: 'notif-admin-5',
    title: 'AI Inbound Voice Call Completed',
    message: 'AI Voice Agent concluded consultation with Rajesh Sharma. Intent Score: 95/100.',
    type: 'ai',
    timestamp: '4 hours ago',
    read: true,
    link: '/admin/ai-calling',
    targetRole: 'admin'
  },

  // Sales Employee Notifications
  {
    id: 'notif-sales-1',
    title: 'New High-Value Lead Allocated',
    message: 'Rajesh Sharma allocated to you for Prestige Golfshire Villa Sanitization (₹34,500 value).',
    type: 'ai',
    timestamp: '15 mins ago',
    read: false,
    link: '/sales/leads',
    targetRole: 'sales'
  },
  {
    id: 'notif-sales-2',
    title: 'Client Site Inspection in 1 Hour',
    message: 'Post-Renovation Villa Site Inspection with Rajesh Sharma begins at 4:30 PM.',
    type: 'reminder',
    timestamp: '50 mins ago',
    read: false,
    link: '/sales/meetings',
    targetRole: 'sales'
  },
  {
    id: 'notif-sales-3',
    title: 'AI Meeting Intelligence Ready',
    message: 'Transcript & action items processed for meeting with Priya Sundaram (Commercial Facility Disinfection).',
    type: 'ai',
    timestamp: '2 hours ago',
    read: true,
    link: '/sales/meeting-intelligence',
    targetRole: 'sales'
  },
  {
    id: 'notif-sales-4',
    title: 'Monthly Quota Milestone',
    message: 'Congratulations! You reached 84.5% of your ₹4,50,000 monthly sales quota.',
    type: 'alert',
    timestamp: '5 hours ago',
    read: false,
    link: '/sales/performance',
    targetRole: 'sales'
  },
  {
    id: 'notif-sales-5',
    title: 'Pending Follow-up Callback',
    message: 'Automated reminder: Call Ananya Iyer regarding Hiranandani move-in deep cleaning proposal.',
    type: 'reminder',
    timestamp: 'Yesterday',
    read: true,
    link: '/sales/follow-ups',
    targetRole: 'sales'
  },

  // Customer Portal Notifications
  {
    id: 'notif-cust-1',
    title: 'Specialist En Route to Residence',
    message: 'Your verified specialist Carlos Mendes is en route. Live GPS arrival estimate: 25 minutes.',
    type: 'booking',
    timestamp: '10 mins ago',
    read: false,
    link: '/customer/bookings',
    targetRole: 'customer'
  },
  {
    id: 'notif-cust-2',
    title: 'Booking Confirmed (#BK-8820)',
    message: 'Your Ultra Deep Villa Sanitization is confirmed for tomorrow, Nov 18 at 09:00 AM.',
    type: 'booking',
    timestamp: '1 hour ago',
    read: false,
    link: '/customer/bookings',
    targetRole: 'customer'
  },
  {
    id: 'notif-cust-3',
    title: 'Payment Invoice Ready',
    message: 'Tax invoice #INV-4092 for ₹24,500 is generated and available in your billing ledger.',
    type: 'payment',
    timestamp: '2 hours ago',
    read: true,
    link: '/customer/payments',
    targetRole: 'customer'
  },
  {
    id: 'notif-cust-4',
    title: 'Appointment Consultation Booked',
    message: 'Pre-service walkthrough scheduled with Sales Specialist Marcus Vance for today 4:30 PM.',
    type: 'reminder',
    timestamp: '3 hours ago',
    read: false,
    link: '/customer/appointments',
    targetRole: 'customer'
  },
  {
    id: 'notif-cust-5',
    title: 'Platinum VIP Reward Credited',
    message: '500 bonus loyalty credits added to your account balance for high CSAT feedback.',
    type: 'ai',
    timestamp: 'Yesterday',
    read: true,
    link: '/customer/profile',
    targetRole: 'customer'
  }
];

export const initialTasks: TaskItem[] = [
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
  },
  {
    id: 'tsk-3',
    title: 'Send Diamond Crystallization Scope to Penthouse',
    customerName: 'Vikramaditya Singhania',
    dueDate: '2026-11-18 10:00',
    priority: 'urgent',
    status: 'pending',
    assignedTo: 'David Kalu'
  },
  {
    id: 'tsk-4',
    title: 'Dispatch Commercial Kitchen Contract to Hospitality Group',
    customerName: 'Rohan Kapoor',
    dueDate: '2026-11-16 17:00',
    priority: 'medium',
    status: 'completed',
    assignedTo: 'Marcus Vance'
  }
];
