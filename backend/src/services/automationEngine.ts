import { Notification, Task } from '../models/index.js';
import { isConnected } from '../config/db.js';
import { MemoryStore } from '../data/memoryStore.js';

export interface WorkflowEvent {
  event: 'lead_created' | 'meeting_scheduled' | 'meeting_completed' | 'followup_overdue' | 'booking_confirmed' | 'payment_completed';
  payload: any;
}

export class AutomationEngine {
  public static async trigger(event: WorkflowEvent): Promise<void> {
    console.log(`[Automation Engine] Triggering event: ${event.event}`);

    try {
      switch (event.event) {
        case 'lead_created':
          await this.handleLeadCreated(event.payload);
          break;

        case 'meeting_scheduled':
          await this.handleMeetingScheduled(event.payload);
          break;

        case 'meeting_completed':
          await this.handleMeetingCompleted(event.payload);
          break;

        case 'followup_overdue':
          await this.handleFollowUpOverdue(event.payload);
          break;

        case 'booking_confirmed':
          await this.handleBookingConfirmed(event.payload);
          break;

        case 'payment_completed':
          await this.handlePaymentCompleted(event.payload);
          break;

        default:
          console.warn(`[Automation Engine] Unknown event: ${event.event}`);
      }
    } catch (err: any) {
      console.error(`[Automation Engine] Error executing workflow: ${err.message}`);
    }
  }

  // 1. Lead Created Workflow
  private static async handleLeadCreated(lead: any): Promise<void> {
    if (!isConnected) {
      MemoryStore.notifications.unshift({
        id: `notif-${Date.now()}`,
        title: 'New Lead Ingested',
        message: `Lead ${lead.name} (${lead.serviceInterest}) ingested via ${lead.source}. Initial AI score: ${lead.aiScore || 85}.`,
        type: 'ai',
        timestamp: 'Just now',
        read: false,
        link: '/admin/leads'
      });

      MemoryStore.tasks.unshift({
        id: `tsk-${Date.now()}`,
        title: `Conduct Initial Qualification Call for ${lead.name}`,
        customerName: lead.name,
        dueDate: new Date(Date.now() + 2 * 3600 * 1000).toISOString().slice(0, 16).replace('T', ' '),
        priority: lead.priority || 'high',
        status: 'pending',
        assignedTo: lead.assignedEmployeeName || 'Marcus Vance'
      });
      return;
    }

    // Notify sales reps & managers
    await Notification.create({
      title: 'New Lead Ingested',
      message: `Lead ${lead.name} (${lead.serviceInterest}) ingested via ${lead.source}. Initial AI score: ${lead.aiScore || 85}.`,
      type: 'ai',
      timestamp: 'Just now',
      link: '/admin/leads'
    });

    // Auto-create initial follow-up task
    await Task.create({
      title: `Conduct Initial Qualification Call for ${lead.name}`,
      customerName: lead.name,
      dueDate: new Date(Date.now() + 2 * 3600 * 1000).toISOString().slice(0, 16).replace('T', ' '),
      priority: lead.priority || 'high',
      status: 'pending',
      assignedTo: lead.assignedEmployeeName || 'Marcus Vance'
    });
  }

  // 2. Meeting Scheduled Workflow
  private static async handleMeetingScheduled(meeting: any): Promise<void> {
    const empName = meeting.employeeName || 'Marcus Vance';

    if (!isConnected) {
      // 1. Employee notification
      MemoryStore.notifications.unshift({
        id: `notif-${Date.now()}-emp`,
        title: `New Meeting Assigned: ${meeting.customerName}`,
        message: `Admin scheduled "${meeting.title || 'Consultation'}" for ${meeting.dateTime} (${meeting.type}). Assigned to ${empName}.`,
        type: 'reminder',
        timestamp: 'Just now',
        read: false,
        link: '/sales/meetings'
      });

      // 2. Admin operations notification
      MemoryStore.notifications.unshift({
        id: `notif-${Date.now()}-adm`,
        title: `Meeting Dispatched: ${meeting.customerName}`,
        message: `Consultation on ${meeting.dateTime} delegated to ${empName}.`,
        type: 'booking',
        timestamp: 'Just now',
        read: false,
        link: '/admin/meetings'
      });
      return;
    }

    // Database mode: persist notifications for both roles
    await Notification.create([
      {
        title: `New Meeting Assigned: ${meeting.customerName}`,
        message: `Admin scheduled "${meeting.title || 'Consultation'}" for ${meeting.dateTime} (${meeting.type}). Assigned to ${empName}.`,
        type: 'reminder',
        timestamp: 'Just now',
        read: false,
        link: '/sales/meetings',
        recipientRole: 'sales'
      },
      {
        title: `Meeting Dispatched: ${meeting.customerName}`,
        message: `Consultation on ${meeting.dateTime} delegated to ${empName}.`,
        type: 'booking',
        timestamp: 'Just now',
        read: false,
        link: '/admin/meetings',
        recipientRole: 'admin'
      }
    ]);
  }

  // 3. Meeting Completed Workflow
  private static async handleMeetingCompleted(meeting: any): Promise<void> {
    if (!isConnected) {
      MemoryStore.notifications.unshift({
        id: `notif-${Date.now()}`,
        title: 'Meeting Notes & AI Synthesis Ready',
        message: `Consultation with ${meeting.customerName} finalized. AI extracted specifications & action items.`,
        type: 'ai',
        timestamp: 'Just now',
        read: false,
        link: '/admin/meetings'
      });

      MemoryStore.tasks.unshift({
        id: `tsk-${Date.now()}`,
        title: `Dispatch Binding Proposal to ${meeting.customerName}`,
        customerName: meeting.customerName,
        dueDate: new Date(Date.now() + 4 * 3600 * 1000).toISOString().slice(0, 16).replace('T', ' '),
        priority: 'high',
        status: 'pending',
        assignedTo: meeting.employeeName || 'Marcus Vance'
      });
      return;
    }

    await Notification.create({
      title: 'Meeting Notes & AI Synthesis Ready',
      message: `Consultation with ${meeting.customerName} finalized. AI extracted specifications & action items.`,
      type: 'ai',
      timestamp: 'Just now',
      link: '/admin/meetings'
    });

    await Task.create({
      title: `Dispatch Binding Proposal to ${meeting.customerName}`,
      customerName: meeting.customerName,
      dueDate: new Date(Date.now() + 4 * 3600 * 1000).toISOString().slice(0, 16).replace('T', ' '),
      priority: 'high',
      status: 'pending',
      assignedTo: meeting.employeeName || 'Marcus Vance'
    });
  }

  // 4. Follow-up Overdue Workflow
  private static async handleFollowUpOverdue(data: any): Promise<void> {
    if (!isConnected) {
      MemoryStore.notifications.unshift({
        id: `notif-${Date.now()}`,
        title: 'URGENT: Lead Follow-up Overdue',
        message: `Lead ${data.customerName} is past scheduled contact interval. Escalated to Sales Director.`,
        type: 'alert',
        timestamp: 'Just now',
        read: false,
        link: '/admin/leads'
      });
      return;
    }

    await Notification.create({
      title: 'URGENT: Lead Follow-up Overdue',
      message: `Lead ${data.customerName} is past scheduled contact interval. Escalated to Sales Director.`,
      type: 'alert',
      timestamp: 'Just now',
      link: '/admin/leads'
    });
  }

  // 5. Booking Confirmed Workflow
  private static async handleBookingConfirmed(booking: any): Promise<void> {
    if (!isConnected) {
      MemoryStore.notifications.unshift({
        id: `notif-${Date.now()}`,
        title: 'Booking Confirmed & Dispatched',
        message: `Job #${booking.bookingRef || booking.id} for ${booking.customerName} confirmed. Provider ${booking.providerName || 'dispatched'}.`,
        type: 'booking',
        timestamp: 'Just now',
        read: false,
        link: '/admin/bookings'
      });
      return;
    }

    await Notification.create({
      title: 'Booking Confirmed & Dispatched',
      message: `Job #${booking.bookingRef || booking.id} for ${booking.customerName} confirmed. Provider ${booking.providerName || 'dispatched'}.`,
      type: 'booking',
      timestamp: 'Just now',
      link: '/admin/bookings'
    });
  }

  // 6. Payment Completed Workflow
  private static async handlePaymentCompleted(payment: any): Promise<void> {
    if (!isConnected) {
      MemoryStore.notifications.unshift({
        id: `notif-${Date.now()}`,
        title: 'Payment Cleared',
        message: `Received ₹${payment.amount} for ${payment.serviceName}. Invoice ${payment.invoiceNumber}.`,
        type: 'payment',
        timestamp: 'Just now',
        read: false,
        link: '/admin/payments'
      });
      return;
    }

    await Notification.create({
      title: 'Payment Cleared',
      message: `Received ₹${payment.amount} for ${payment.serviceName}. Invoice ${payment.invoiceNumber}.`,
      type: 'payment',
      timestamp: 'Just now',
      link: '/admin/payments'
    });
  }
}
