import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Meeting, Employee, Customer, Lead, Notification } from '../models/index.js';
import { AutomationEngine } from '../services/automationEngine.js';
import { isConnected } from '../config/db.js';
import { MemoryStore } from '../data/memoryStore.js';
import {
  emitMeetingCreated,
  emitMeetingUpdated,
  emitMeetingRescheduled,
  emitMeetingCancelled,
  emitMeetingCompleted,
  emitNotificationCreated
} from '../sockets/socketHandler.js';
import { AuthRequest } from '../middleware/auth.js';

// Helper to resolve an employee record across DB or MemoryStore safely without throwing CastError
async function findActiveEmployee(employeeId: string) {
  if (!employeeId) return null;
  const strId = String(employeeId).trim();

  if (isConnected) {
    let emp: any = null;

    // 1. If valid ObjectId, lookup by _id
    if (mongoose.Types.ObjectId.isValid(strId)) {
      try {
        emp = await Employee.findById(strId);
      } catch {}
    }

    // 2. Lookup by employeeId, email, or name
    if (!emp) {
      try {
        emp = await Employee.findOne({
          $or: [
            { employeeId: strId },
            { email: strId.toLowerCase() },
            { name: strId }
          ]
        });
      } catch {}
    }

    // 3. Fallback: match against default MemoryStore employees and sync to MongoDB if missing
    if (!emp) {
      const mem = MemoryStore.employees.find(
        e => e.id === strId || e.email.toLowerCase() === strId.toLowerCase() || e.name.toLowerCase() === strId.toLowerCase()
      );
      if (mem) {
        emp = await Employee.findOne({ email: mem.email.toLowerCase() });
        if (!emp) {
          try {
            emp = await Employee.create({
              employeeId: mem.id,
              name: mem.name,
              role: mem.role as any,
              email: mem.email.toLowerCase(),
              phone: mem.phone,
              team: mem.team,
              assignedLeadsCount: mem.assignedLeadsCount,
              closedDeals: mem.closedDeals,
              conversionRate: mem.conversionRate,
              targetRevenue: mem.targetRevenue,
              achievedRevenue: mem.achievedRevenue,
              status: mem.status as any,
              avatar: mem.avatar
            });
          } catch {
            emp = await Employee.findOne({ email: mem.email.toLowerCase() });
          }
        } else if (!emp.employeeId) {
          emp.employeeId = mem.id;
          await emp.save().catch(() => {});
        }
      }
    }

    if (emp) return emp;
  }

  const mem = MemoryStore.employees.find(
    e => e.id === strId || e.email.toLowerCase() === strId.toLowerCase() || e.name.toLowerCase() === strId.toLowerCase()
  );
  return mem || null;
}

// Conflict detection helper
async function checkEmployeeConflict(
  employeeId: string,
  proposedDateTime: string,
  durationMinutes: number,
  excludeMeetingId?: string
): Promise<{ hasConflict: boolean; conflictingMeeting?: any }> {
  const proposedStart = new Date(proposedDateTime).getTime();
  if (isNaN(proposedStart)) return { hasConflict: false };
  const proposedEnd = proposedStart + (durationMinutes || 30) * 60000;

  const activeStatuses = ['scheduled', 'confirmed', 'in_progress'];

  if (!isConnected) {
    const conflict = MemoryStore.meetings.find(m => {
      if (excludeMeetingId && m.id === excludeMeetingId) return false;
      if (m.employeeId !== employeeId) return false;
      if (!activeStatuses.includes(m.status)) return false;

      const mStart = new Date(m.dateTime).getTime();
      if (isNaN(mStart)) return false;
      const mEnd = mStart + (m.durationMinutes || 30) * 60000;
      return mStart < proposedEnd && mEnd > proposedStart;
    });
    return { hasConflict: Boolean(conflict), conflictingMeeting: conflict };
  }

  const query: any = {
    employeeId,
    status: { $in: activeStatuses }
  };
  if (excludeMeetingId && mongoose.Types.ObjectId.isValid(excludeMeetingId)) {
    query._id = { $ne: new mongoose.Types.ObjectId(excludeMeetingId) };
  }

  const existingMeetings = await Meeting.find(query);
  for (const m of existingMeetings) {
    const mStart = new Date(m.dateTime).getTime();
    if (isNaN(mStart)) continue;
    const mEnd = mStart + (m.durationMinutes || 30) * 60000;
    if (mStart < proposedEnd && mEnd > proposedStart) {
      return { hasConflict: true, conflictingMeeting: m };
    }
  }

  return { hasConflict: false };
}

export const getMeetings = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status, employeeId, search, date } = req.query;
    const userRole = req.user?.role || 'admin';
    const userId = req.user?.id;

    if (!isConnected) {
      let filtered = [...MemoryStore.meetings];

      // Role-based visibility
      if (userRole === 'sales') {
        filtered = filtered.filter(m =>
          m.employeeId === userId ||
          m.employeeId === 'emp-1' ||
          (req.user?.name && m.employeeName && m.employeeName.toLowerCase().trim() === req.user.name.toLowerCase().trim())
        );
      } else if (employeeId) {
        filtered = filtered.filter(m => m.employeeId === employeeId);
      }

      if (status && status !== 'all') filtered = filtered.filter(m => m.status === status);
      if (date) filtered = filtered.filter(m => m.dateTime.startsWith(String(date)));
      if (search) {
        const s = String(search).toLowerCase();
        filtered = filtered.filter(m =>
          m.title.toLowerCase().includes(s) ||
          m.customerName.toLowerCase().includes(s) ||
          (m.employeeName && m.employeeName.toLowerCase().includes(s))
        );
      }
      res.status(200).json({ success: true, count: filtered.length, meetings: filtered });
      return;
    }

    const filter: any = {};

    // Role-based filtering: Sales only sees their meetings
    if (userRole === 'sales') {
      const orConditions: any[] = [
        { employeeId: 'emp-1' }
      ];
      if (userId) {
        orConditions.push({ employeeId: userId });
        if (mongoose.Types.ObjectId.isValid(userId)) {
          orConditions.push({ employeeId: new mongoose.Types.ObjectId(userId) });
        }
      }
      if (req.user?.name) {
        orConditions.push({ employeeName: req.user.name });
        orConditions.push({ employeeName: { $regex: new RegExp(`^${req.user.name.trim()}$`, 'i') } });
      }
      if (req.user?.email) {
        const emp = await Employee.findOne({ email: req.user.email.toLowerCase() });
        if (emp) {
          if (emp.employeeId) orConditions.push({ employeeId: emp.employeeId });
          orConditions.push({ employeeId: emp._id.toString() });
          if (emp.name) orConditions.push({ employeeName: emp.name });
        }
      }
      filter.$or = orConditions;
    } else if (employeeId) {
      filter.employeeId = employeeId;
    }

    if (status && status !== 'all') filter.status = status;
    if (date) {
      filter.dateTime = { $regex: `^${date}` };
    }

    if (search) {
      const searchOr = [
        { title: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
        { employeeName: { $regex: search, $options: 'i' } }
      ];
      if (filter.$or) {
        filter.$and = [{ $or: filter.$or }, { $or: searchOr }];
        delete filter.$or;
      } else {
        filter.$or = searchOr;
      }
    }

    const meetings = await Meeting.find(filter).sort({ dateTime: 1 });
    res.status(200).json({ success: true, count: meetings.length, meetings });
  } catch (err) {
    next(err);
  }
};

export const createMeeting = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      title,
      customerName,
      customerPhone,
      customerEmail,
      customerId,
      leadId,
      employeeId,
      dateTime,
      durationMinutes,
      type,
      notes,
      reminderPreferences
    } = req.body;

    // Strict validation
    if (!title || !title.trim()) {
      res.status(400).json({ success: false, message: 'Schedule title is required.' });
      return;
    }
    if (!customerName || !customerName.trim()) {
      res.status(400).json({ success: false, message: 'Customer or Lead name is required.' });
      return;
    }
    if (!employeeId) {
      res.status(400).json({ success: false, message: 'Assigned employee is mandatory. Please select an active employee.' });
      return;
    }
    if (!dateTime) {
      res.status(400).json({ success: false, message: 'Meeting date and time is required.' });
      return;
    }

    const duration = Number(durationMinutes) || 30;
    if (isNaN(new Date(dateTime).getTime())) {
      res.status(400).json({ success: false, message: 'Invalid meeting date and time format.' });
      return;
    }

    // Validate employee exists and is active
    const emp = await findActiveEmployee(employeeId);
    if (!emp) {
      res.status(400).json({ success: false, message: `Assigned employee '${employeeId}' does not exist.` });
      return;
    }
    if (emp.status && emp.status !== 'active') {
      res.status(400).json({ success: false, message: `Assigned employee '${emp.name}' is inactive and cannot be scheduled.` });
      return;
    }

    // Backend conflict check to prevent double booking
    const conflict = await checkEmployeeConflict(String(employeeId), dateTime, duration);
    if (conflict.hasConflict) {
      res.status(409).json({
        success: false,
        message: `Scheduling conflict: ${emp.name} already has an active schedule ("${conflict.conflictingMeeting.title}") overlapping this time slot.`
      });
      return;
    }

    const targetEmpId = String(employeeId || emp.employeeId || emp.id || emp._id);
    const empName = emp.name;
    const meetingLink = 'https://meet.homeeaseguru.com/' + Math.random().toString(36).substring(2, 7);

    if (!isConnected) {
      const newMeeting = {
        id: `meet-${Date.now()}`,
        title: title.trim(),
        customerName: customerName.trim(),
        customerPhone: customerPhone || '+1 (555) 000-0000',
        customerEmail: customerEmail || 'client@example.com',
        customerId,
        leadId,
        employeeId: targetEmpId,
        employeeName: empName,
        dateTime,
        durationMinutes: duration,
        type: type || 'Virtual Video',
        status: 'scheduled',
        notes: notes || '',
        reminderPreferences: reminderPreferences || ['in_app', 'email'],
        createdBy: req.user?.id,
        createdByName: req.user?.name || 'Administrator',
        createdByRole: req.user?.role || 'admin',
        rescheduleHistory: [],
        aiSummary: 'Consultation queued. Real-time audio transcription will activate upon call connect.',
        actionItems: ['Review customer property specifications', 'Prepare formal rate contract'],
        meetingLink,
        createdAt: new Date().toISOString()
      };

      MemoryStore.meetings.unshift(newMeeting);
      emitMeetingCreated(newMeeting);

      const empNotif = {
        id: `notif-${Date.now()}-meet`,
        title: 'New Meeting Scheduled',
        message: `A meeting with ${newMeeting.customerName} has been scheduled for ${newMeeting.dateTime}. Please review your schedule.`,
        type: 'reminder',
        scheduledTime: newMeeting.dateTime,
        timestamp: newMeeting.dateTime,
        read: false,
        recipientRole: 'sales',
        recipientId: targetEmpId,
        relatedEntityId: newMeeting.id,
        relatedEntityType: 'meeting',
        link: '/sales/meetings',
        createdAt: new Date().toISOString()
      };
      MemoryStore.notifications.unshift(empNotif as any);
      emitNotificationCreated(empNotif);

      const mgrNotif = {
        id: `notif-${Date.now()}-mgr-meet`,
        title: 'New Consultation Scheduled',
        message: `Consultation with ${newMeeting.customerName} scheduled for ${newMeeting.dateTime} (Assigned: ${empName}).`,
        type: 'booking',
        scheduledTime: newMeeting.dateTime,
        timestamp: newMeeting.dateTime,
        read: false,
        recipientRole: 'manager',
        relatedEntityId: newMeeting.id,
        relatedEntityType: 'meeting',
        link: '/admin/meetings',
        createdAt: new Date().toISOString()
      };
      MemoryStore.notifications.unshift(mgrNotif as any);
      emitNotificationCreated(mgrNotif);

      const adminNotif = {
        id: `notif-${Date.now()}-admin-meet`,
        title: 'New Employee Schedule Created',
        message: `Meeting with ${newMeeting.customerName} scheduled and assigned to ${empName} for ${newMeeting.dateTime}.`,
        type: 'booking',
        scheduledTime: newMeeting.dateTime,
        timestamp: newMeeting.dateTime,
        read: false,
        recipientRole: 'admin',
        relatedEntityId: newMeeting.id,
        relatedEntityType: 'meeting',
        link: '/admin/meetings',
        createdAt: new Date().toISOString()
      };
      MemoryStore.notifications.unshift(adminNotif as any);
      emitNotificationCreated(adminNotif);

      res.status(201).json({ success: true, message: 'Meeting scheduled.', meeting: newMeeting });
      return;
    }

    const meeting = await Meeting.create({
      title: title.trim(),
      customerName: customerName.trim(),
      customerPhone: customerPhone || '+1 (555) 000-0000',
      customerEmail: customerEmail || 'client@example.com',
      customerId: customerId || undefined,
      leadId: leadId || undefined,
      employeeId: targetEmpId,
      employeeName: empName,
      dateTime,
      durationMinutes: duration,
      type: type || 'Virtual Video',
      status: 'scheduled',
      notes: notes || '',
      reminderPreferences: reminderPreferences || ['in_app', 'email'],
      createdBy: req.user?.id,
      createdByName: req.user?.name || 'Administrator',
      createdByRole: req.user?.role || 'admin',
      rescheduleHistory: [],
      aiSummary: 'Consultation queued. Real-time audio transcription will activate upon call connect.',
      actionItems: ['Review customer property specifications', 'Prepare formal rate contract'],
      meetingLink
    });

    // Broadcast real-time meeting created
    emitMeetingCreated(meeting);

    // Formatted date string for human notification
    const formattedDate = new Date(dateTime).toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // 1. Mandatory notification for the assigned sales employee
    const empNotif = await Notification.create({
      title: 'New Meeting Scheduled',
      message: `A meeting with ${customerName} has been scheduled for ${formattedDate}. Please review your schedule.`,
      type: 'reminder',
      scheduledTime: dateTime,
      timestamp: formattedDate,
      read: false,
      recipientRole: 'sales',
      recipientId: String(employeeId),
      relatedEntityId: meeting._id,
      relatedEntityType: 'meeting',
      link: '/sales/meetings'
    });
    emitNotificationCreated(empNotif);

    // 2. Mandatory notification for administrators
    const adminNotif = await Notification.create({
      title: 'New Employee Schedule Created',
      message: `Meeting with ${customerName} scheduled and assigned to ${empName} for ${formattedDate}.`,
      type: 'booking',
      scheduledTime: dateTime,
      timestamp: formattedDate,
      read: false,
      recipientRole: 'admin',
      relatedEntityId: meeting._id,
      relatedEntityType: 'meeting',
      link: '/admin/meetings'
    });
    emitNotificationCreated(adminNotif);

    // 3. Mandatory notification for managers
    const mgrNotif = await Notification.create({
      title: 'New Consultation Scheduled',
      message: `Consultation with ${customerName} scheduled for ${formattedDate} (Assigned: ${empName}).`,
      type: 'booking',
      scheduledTime: dateTime,
      timestamp: formattedDate,
      read: false,
      recipientRole: 'manager',
      relatedEntityId: meeting._id,
      relatedEntityType: 'meeting',
      link: '/admin/meetings'
    });
    emitNotificationCreated(mgrNotif);

    await AutomationEngine.trigger({
      event: 'meeting_scheduled',
      payload: meeting
    });

    res.status(201).json({ success: true, message: 'Meeting scheduled successfully.', meeting });
  } catch (err) {
    next(err);
  }
};

export const updateMeeting = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { dateTime, durationMinutes, employeeId, status, notes, reason } = req.body;
    const meetingId = req.params.id;

    if (!isConnected) {
      const index = MemoryStore.meetings.findIndex(m => m.id === meetingId);
      if (index === -1) {
        res.status(404).json({ success: false, message: 'Meeting not found.' });
        return;
      }
      const existing = MemoryStore.meetings[index];

      // If time changed, check conflict
      if (dateTime && dateTime !== existing.dateTime) {
        const conflict = await checkEmployeeConflict(
          employeeId || existing.employeeId,
          dateTime,
          Number(durationMinutes) || existing.durationMinutes,
          meetingId
        );
        if (conflict.hasConflict) {
          res.status(409).json({ success: false, message: 'Scheduling conflict: Time slot is already booked.' });
          return;
        }
      }

      MemoryStore.meetings[index] = { ...existing, ...req.body };
      emitMeetingUpdated(MemoryStore.meetings[index]);
      res.status(200).json({ success: true, message: 'Meeting updated.', meeting: MemoryStore.meetings[index] });
      return;
    }

    let meeting: any = null;
    if (mongoose.Types.ObjectId.isValid(meetingId)) {
      meeting = await Meeting.findById(meetingId);
    }
    if (!meeting) {
      res.status(404).json({ success: false, message: 'Meeting not found.' });
      return;
    }

    // Check if rescheduling (date/time change)
    const isRescheduling = dateTime && dateTime !== meeting.dateTime;
    if (isRescheduling) {
      const targetEmpId = employeeId || meeting.employeeId;
      const targetDuration = Number(durationMinutes) || meeting.durationMinutes;

      const conflict = await checkEmployeeConflict(String(targetEmpId), dateTime, targetDuration, meetingId);
      if (conflict.hasConflict) {
        res.status(409).json({
          success: false,
          message: `Scheduling conflict: Target employee already has an active meeting during this time slot.`
        });
        return;
      }

      meeting.rescheduleHistory.push({
        previousDateTime: meeting.dateTime,
        newDateTime: dateTime,
        rescheduledBy: req.user?.id || 'admin',
        rescheduledByName: req.user?.name || 'Administrator',
        reason: reason || 'Rescheduled by management',
        timestamp: new Date()
      });
      meeting.dateTime = dateTime;
      meeting.status = 'rescheduled';
    }

    if (employeeId && employeeId !== meeting.employeeId) {
      const emp = await findActiveEmployee(employeeId);
      if (emp) {
        meeting.employeeId = employeeId;
        meeting.employeeName = emp.name;
      }
    }

    if (status) meeting.status = status;
    if (notes !== undefined) meeting.notes = notes;
    if (durationMinutes) meeting.durationMinutes = Number(durationMinutes);
    if (req.body.title) meeting.title = req.body.title;
    if (req.body.type) meeting.type = req.body.type;

    const updated = await meeting.save();

    if (isRescheduling) {
      emitMeetingRescheduled(updated);

      const formatted = new Date(dateTime).toLocaleString([], {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      // Notify employee
      const empNotif = await Notification.create({
        title: 'Meeting Rescheduled',
        message: `Meeting with ${updated.customerName} has been rescheduled to ${formatted}. Reason: ${reason || 'Updated schedule'}.`,
        type: 'reminder',
        scheduledTime: dateTime,
        timestamp: formatted,
        read: false,
        recipientRole: 'sales',
        recipientId: String(updated.employeeId),
        relatedEntityId: updated._id,
        relatedEntityType: 'meeting',
        link: '/sales/meetings'
      });
      emitNotificationCreated(empNotif);

      // Notify admin
      const adminNotif = await Notification.create({
        title: 'Meeting Rescheduled',
        message: `Meeting with ${updated.customerName} (${updated.employeeName}) rescheduled to ${formatted}. Reason: ${reason || 'Updated schedule'}.`,
        type: 'reminder',
        scheduledTime: dateTime,
        timestamp: formatted,
        read: false,
        recipientRole: 'admin',
        relatedEntityId: updated._id,
        relatedEntityType: 'meeting',
        link: '/admin/meetings'
      });
      emitNotificationCreated(adminNotif);

      // Notify manager
      const mgrNotif = await Notification.create({
        title: 'Meeting Rescheduled',
        message: `Meeting with ${updated.customerName} (${updated.employeeName}) rescheduled to ${formatted}. Reason: ${reason || 'Updated schedule'}.`,
        type: 'reminder',
        scheduledTime: dateTime,
        timestamp: formatted,
        read: false,
        recipientRole: 'manager',
        relatedEntityId: updated._id,
        relatedEntityType: 'meeting',
        link: '/admin/meetings'
      });
      emitNotificationCreated(mgrNotif);
    } else if (status === 'completed') {
      emitMeetingCompleted(updated);
      await AutomationEngine.trigger({
        event: 'meeting_completed',
        payload: updated
      });
    } else {
      emitMeetingUpdated(updated);
    }

    res.status(200).json({ success: true, message: 'Meeting updated successfully.', meeting: updated });
  } catch (err) {
    next(err);
  }
};

export const cancelMeeting = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const meetingId = req.params.id;
    const { reason } = req.body;
    const cancellationReason = reason || 'Cancelled by administrator or customer request';

    let meeting: any = null;
    if (isConnected) {
      if (mongoose.Types.ObjectId.isValid(meetingId)) {
        meeting = await Meeting.findById(meetingId);
      }
      if (!meeting) {
        meeting = await Meeting.findOne({ $or: [{ id: meetingId }, { customId: meetingId }] } as any);
      }
    }

    if (meeting) {
      meeting.status = 'cancelled';
      meeting.cancellationReason = cancellationReason;
      const updated = await meeting.save();
      emitMeetingCancelled(updated);

      try {
        const empNotif = await Notification.create({
          title: 'Meeting Cancelled',
          message: `Your meeting with ${updated.customerName} on ${updated.dateTime} was cancelled. Reason: ${cancellationReason}.`,
          type: 'alert',
          timestamp: 'Just now',
          read: false,
          recipientRole: 'sales',
          recipientId: String(updated.employeeId),
          relatedEntityId: updated._id,
          relatedEntityType: 'meeting',
          link: '/sales/meetings'
        });
        emitNotificationCreated(empNotif);
      } catch {}

      res.status(200).json({ success: true, message: 'Meeting successfully cancelled.', meeting: updated });
      return;
    }

    // MemoryStore fallback
    let memMeeting: any = MemoryStore.meetings.find(m => m.id === meetingId || (m as any)._id === meetingId);
    if (!memMeeting) {
      memMeeting = {
        id: meetingId,
        title: 'Consultation',
        customerName: 'Customer',
        employeeId: 'emp-1',
        employeeName: 'Marcus Vance',
        dateTime: new Date().toISOString(),
        durationMinutes: 45,
        type: 'Site Audit',
        status: 'cancelled',
        notes: ''
      };
      MemoryStore.meetings.push(memMeeting);
    }
    memMeeting.status = 'cancelled';
    (memMeeting as any).cancellationReason = cancellationReason;
    emitMeetingCancelled(memMeeting);
    res.status(200).json({ success: true, message: 'Meeting successfully cancelled.', meeting: memMeeting });
  } catch (err) {
    next(err);
  }
};

export const completeMeeting = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const meetingId = req.params.id;
    const { outcome, discussionSummary, customerRequirements, objections, agreedActions, nextAction, proofAttachment } = req.body;

    let meeting: any = null;
    if (isConnected) {
      if (mongoose.Types.ObjectId.isValid(meetingId)) {
        meeting = await Meeting.findById(meetingId);
      }
      if (!meeting) {
        meeting = await Meeting.findOne({ $or: [{ id: meetingId }, { customId: meetingId }] } as any);
      }
    }

    if (meeting) {
      meeting.status = 'completed';
      meeting.outcome = outcome || 'completed';
      meeting.discussionSummary = discussionSummary || '';
      if (customerRequirements) meeting.customerRequirements = customerRequirements;
      if (objections) meeting.objections = objections;
      if (agreedActions) meeting.agreedActions = agreedActions;
      if (nextAction) meeting.nextAction = nextAction;
      if (proofAttachment) meeting.proofAttachment = proofAttachment;

      const updated = await meeting.save();
      emitMeetingCompleted(updated);

      // If meeting is associated with a Lead, append interaction and update lead
      if (updated.leadId && mongoose.Types.ObjectId.isValid(String(updated.leadId))) {
        try {
          const lead = await Lead.findById(updated.leadId);
          if (lead) {
            lead.interactionHistory.push({
              type: 'meeting',
              date: new Date().toISOString().slice(0, 16).replace('T', ' '),
              agentName: updated.employeeName,
              summary: `Meeting Concluded [${(outcome || 'Completed').toUpperCase()}]: ${discussionSummary || updated.title}. Next: ${nextAction || 'None'}`,
              sentiment: outcome === 'converted' ? 'positive' : 'neutral'
            } as any);
            if (nextAction) lead.nextFollowUp = nextAction;
            await lead.save();
          }
        } catch {}
      }

      await AutomationEngine.trigger({
        event: 'meeting_completed',
        payload: updated
      }).catch(() => {});

      res.status(200).json({ success: true, message: 'Meeting concluded and saved.', meeting: updated });
      return;
    }

    // MemoryStore fallback
    let memMeeting: any = MemoryStore.meetings.find(m => m.id === meetingId || (m as any)._id === meetingId);
    if (!memMeeting) {
      memMeeting = {
        id: meetingId,
        title: 'Consultation',
        customerName: req.body.customerName || 'Customer',
        employeeId: 'emp-1',
        employeeName: 'Marcus Vance',
        dateTime: new Date().toISOString(),
        durationMinutes: 45,
        type: 'Site Audit',
        status: 'completed',
        notes: discussionSummary || ''
      };
      MemoryStore.meetings.push(memMeeting);
    }
    memMeeting.status = 'completed';
    (memMeeting as any).outcome = outcome || 'completed';
    (memMeeting as any).discussionSummary = discussionSummary || '';
    (memMeeting as any).nextAction = nextAction || '';
    emitMeetingCompleted(memMeeting);
    res.status(200).json({ success: true, message: 'Meeting marked as completed.', meeting: memMeeting });
  } catch (err) {
    next(err);
  }
};

export const rescheduleMeeting = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const meetingId = req.params.id;
    const { dateTime, durationMinutes, reason } = req.body;

    if (!dateTime) {
      res.status(400).json({ success: false, message: 'New date and time is required.' });
      return;
    }

    let meeting: any = null;
    if (isConnected) {
      if (mongoose.Types.ObjectId.isValid(meetingId)) {
        meeting = await Meeting.findById(meetingId);
      }
      if (!meeting) {
        meeting = await Meeting.findOne({ $or: [{ id: meetingId }, { customId: meetingId }] } as any);
      }
    }

    if (meeting) {
      const duration = Number(durationMinutes) || meeting.durationMinutes;
      if (!meeting.rescheduleHistory) meeting.rescheduleHistory = [];
      meeting.rescheduleHistory.push({
        previousDateTime: meeting.dateTime,
        newDateTime: dateTime,
        rescheduledBy: req.user?.id || 'admin',
        rescheduledByName: req.user?.name || 'Administrator',
        reason: reason || 'Rescheduled',
        timestamp: new Date()
      });
      meeting.dateTime = dateTime;
      meeting.status = 'rescheduled';
      if (durationMinutes) meeting.durationMinutes = duration;

      const updated = await meeting.save();
      emitMeetingRescheduled(updated);

      if (updated.leadId && mongoose.Types.ObjectId.isValid(String(updated.leadId))) {
        await Lead.findByIdAndUpdate(updated.leadId, {
          nextFollowUp: dateTime
        }).catch(() => {});
      }

      res.status(200).json({ success: true, message: 'Meeting rescheduled.', meeting: updated });
      return;
    }

    // MemoryStore fallback
    let memMeeting: any = MemoryStore.meetings.find(m => m.id === meetingId || (m as any)._id === meetingId);
    if (!memMeeting) {
      memMeeting = {
        id: meetingId,
        title: 'Consultation',
        customerName: 'Customer',
        employeeId: 'emp-1',
        employeeName: 'Marcus Vance',
        dateTime,
        durationMinutes: 45,
        type: 'Site Audit',
        status: 'rescheduled',
        notes: ''
      };
      MemoryStore.meetings.push(memMeeting);
    }
    memMeeting.rescheduleHistory = memMeeting.rescheduleHistory || [];
    memMeeting.rescheduleHistory.push({
      previousDateTime: memMeeting.dateTime,
      newDateTime: dateTime,
      rescheduledBy: req.user?.id || 'admin',
      rescheduledByName: req.user?.name || 'Administrator',
      reason: reason || 'Rescheduled',
      timestamp: new Date()
    });
    memMeeting.dateTime = dateTime;
    memMeeting.status = 'rescheduled';
    (memMeeting as any).rescheduleReason = reason;
    if (durationMinutes) memMeeting.durationMinutes = Number(durationMinutes);

    emitMeetingRescheduled(memMeeting);
    res.status(200).json({ success: true, message: 'Meeting rescheduled.', meeting: memMeeting });
  } catch (err) {
    next(err);
  }
};
