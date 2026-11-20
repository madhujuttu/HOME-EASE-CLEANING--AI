# HomeEase Guru — AI-Powered Enterprise CRM Platform

HomeEase Guru is a next-generation, enterprise-grade AI Customer Relationship Management (CRM) platform engineered specifically for home-services, facilities, and luxury villa sanitization operations.

---

## Architecture Overview

```
homeeasecleaning/
├── frontend/                     # Complete Modern React 18 + Vite + TypeScript Frontend
│   ├── src/
│   │   ├── components/           # Reusable UI components, header, sidebar, toast alerts
│   │   ├── context/              # Global CrmContext managing all state, CRUD, & AI triggers
│   │   ├── data/                 # Realistic mock database (360 profiles, calls, transcripts)
│   │   ├── layouts/              # Unified DashboardLayout with responsive sidebar & topnav
│   │   ├── pages/
│   │   │   ├── admin/            # 14 Full Admin & Manager Suite Modules
│   │   │   ├── sales/            # 12 Sales Representative Workspace Modules
│   │   │   └── customer/         # 9 Customer Self-Service Portal Modules
│   │   ├── types/                # Strict TypeScript schemas for all 18 CRM entities
│   │   ├── App.tsx               # 35 Interactive Routes with Role-Based Routing
│   │   └── main.tsx
│   ├── package.json
│   ├── tailwind.config.js        # Deep Navy (#0A1128) & Electric Green (#00F59B) Theme
│   └── vite.config.ts
├── backend/                      # Node.js + Express.js API & Socket.IO (Phase 2)
└── PROGRESS.md                   # Development Progress & Audit Verification
```

---

## 35 Implemented Modules

### 1. Admin & Manager Suite (14 Modules)
1. **Overview (`/admin/overview`)**: Executive KPI cards, Recharts revenue trajectories, active pipeline funnel, live AI business insights feed, team performance leaderboard.
2. **Lead Management (`/admin/leads`)**: Tabs (New, Unassigned, Assigned, Qualified, Converted, Lost), multi-variable search, filter by priority & source, CSV export/import, Lead 360 Drawer with AI score radar.
3. **Customer Management (`/admin/customers`)**: Unified Customer 360 directory, lifetime spend, loyalty tiers (Silver, Gold, Platinum), complaints log, customer account notes, historical bookings & payments.
4. **Sales Management (`/admin/sales`)**: Executive sales roster, quota achievement meters, revenue comparisons, automated lead allocation engine.
5. **Meeting Management (`/admin/meetings`)**: Daily, Weekly, and Monthly calendar views, site audit bookings, AI meeting intelligence drawer with objection analysis & checklist items.
6. **AI Calling Center (`/admin/ai-calling`)**: Live SIP trunk monitor, outbound voice dialer with real-time waveform & live speech stream, human handoff, call history with audio player, and AI voice config.
7. **Service Management (`/admin/services`)**: Category filters, add/edit service package modal, descriptions, pricing, equipment specs, and images.
8. **Provider Management (`/admin/providers`)**: Technician fleet directory, verification status badges, skills checklists, job count, star ratings, and registration modal.
9. **Booking Management (`/admin/bookings`)**: All booking stages (Pending, Confirmed, Assigned, In-Progress, Completed, Cancelled), 5-stage dispatch tracker, and technician allocation.
10. **Payment Management (`/admin/payments`)**: Transaction ledger, gross revenue & provider splits, refund processing modal, and printable HTML invoice generator.
11. **AI Intelligence Center (`/admin/ai-intelligence`)**: Neural scoring radar weights, conversion probability queue, follow-up cadence bot, script converters, and executive AI brief generator.
12. **Notifications (`/admin/notifications`)**: Centralized alert center with category filters, unread badges, and direct record navigation.
13. **Reports & Analytics (`/admin/reports`)**: Interactive Recharts analytics, service profitability breakdown, acquisition channel share pie chart, and CSV export.
14. **Settings (`/admin/settings`)**: Company profile, dispatch radius, AI voice models, RBAC permission matrix, and immutable audit logs.

### 2. Sales Employee Workspace (12 Modules)
1. **My Dashboard (`/sales/dashboard`)**: Personal KPIs, chronological today's schedule, quick action bar.
2. **My Leads (`/sales/leads`)**: Rep-assigned leads, quick status updates, note logging, deal closure actions.
3. **My Customers (`/sales/customers`)**: Rep's converted customer accounts and loyalty profiles.
4. **My Meetings (`/sales/meetings`)**: Consultation agenda, completion modal with note submission and AI synthesis trigger.
5. **My Follow-ups (`/sales/follow-ups`)**: Urgent overdue alerts, scheduled touchpoints, automated message drafts.
6. **AI Calling Assistant (`/sales/ai-calling`)**: Active calling studio with live audio waveform, real-time speech transcription stream, and objection handling cues.
7. **Call History (`/sales/call-history`)**: Verbatim transcripts and call audit modal.
8. **Meeting Intelligence (`/sales/meeting-intelligence`)**: Transcribed site audits, extracted client specs, and action items.
9. **AI Sales Copilot (`/sales/copilot`)**: Conversational AI assistant connected with live CRM state. Answering questions on today's meetings, overdue follow-ups, calling scripts, and performance.
10. **My Tasks (`/sales/tasks`)**: Priority to-dos, checkboxes, and task creation modal.
11. **Notifications (`/sales/notifications`)**: Rep-targeted lead handoffs and calendar reminders.
12. **My Performance (`/sales/performance`)**: Quota attainment gauge, weekly revenue run rate, deals won.

### 3. Customer Self-Service Portal (9 Modules)
1. **Home (`/customer/home`)**: Welcome banner, active booking card with live dispatch status, recommended packages.
2. **Browse Services (`/customer/services`)**: Categorized packages with transparent pricing, descriptions, and interactive "Book Package" modal.
3. **My Enquiries (`/customer/enquiries`)**: Submitted requests, quote estimates, and "Submit Custom Inquiry" modal.
4. **My Appointments (`/customer/appointments`)**: Consultation appointments, reschedule and cancellation modals.
5. **My Bookings (`/customer/bookings`)**: Interactive 5-stage dispatch tracker (Confirmed -> Specialist Assigned -> En Route -> In Progress -> Sanitized), certified technician profile, and download receipt.
6. **AI Customer Assistant (`/customer/assistant`)**: 24/7 Home care concierge chat helping select packages, calculate villa costs, and book directly in chat.
7. **Payment History (`/customer/payments`)**: Digital receipts, printable HTML invoices, and "Pay Now" modal for pending balances.
8. **Notifications (`/customer/notifications`)**: Dispatch alerts and payment confirmations.
9. **My Profile (`/customer/profile`)**: Personal details, residence address, and sanitization preferences.

---

## How to Run the Frontend

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Start the local development server:
   ```bash
   npm run dev
   ```
3. Open your browser at:
   ```
   http://localhost:5173
   ```
4. Build for production:
   ```bash
   npm run build
   ```
