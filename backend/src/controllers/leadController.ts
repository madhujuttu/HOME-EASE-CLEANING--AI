import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Lead, Customer, Employee, Notification, Meeting, FollowUp } from '../models/index.js';
import { AIService } from '../services/aiService.js';
import { AutomationEngine } from '../services/automationEngine.js';
import { isConnected } from '../config/db.js';
import { MemoryStore } from '../data/memoryStore.js';
import {
  emitLeadCreated,
  emitLeadUpdated,
  emitLeadAssigned,
  emitLeadDeleted,
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

export const getLeads = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status, priority, source, search } = req.query;
    const userRole = req.user?.role || 'admin';
    const userId = req.user?.id;

    if (!isConnected) {
      let filtered = [...MemoryStore.leads];

      // Role-based visibility
      if (userRole === 'sales') {
        filtered = filtered.filter(l =>
          Boolean(l.assignedEmployeeId) &&
          (l.assignedEmployeeId === userId || l.assignedEmployeeId === 'emp-1' || (req.user?.name && l.assignedEmployeeName === req.user.name))
        );
      }

      if (status && status !== 'all') filtered = filtered.filter(l => l.status === status);
      if (priority && priority !== 'all') filtered = filtered.filter(l => l.priority === priority);
      if (source && source !== 'all') filtered = filtered.filter(l => l.source === source);
      if (search) {
        const s = String(search).toLowerCase();
        filtered = filtered.filter(l =>
          l.name.toLowerCase().includes(s) ||
          l.phone.toLowerCase().includes(s) ||
          (l.email && l.email.toLowerCase().includes(s)) ||
          (l.serviceInterest && l.serviceInterest.toLowerCase().includes(s))
        );
      }
      res.status(200).json({ success: true, count: filtered.length, leads: filtered });
      return;
    }

    const filter: any = {};

    // Role-based visibility: Sales employees ONLY view leads assigned to them.
    // Unassigned leads are visible only to Admin and Manager.
    if (userRole === 'sales' && userId) {
      const orConditions: any[] = [
        { assignedEmployeeId: userId },
        { assignedEmployeeId: 'emp-1' }
      ];
      if (req.user?.name) {
        orConditions.push({ assignedEmployeeName: req.user.name });
      }
      if (mongoose.Types.ObjectId.isValid(userId)) {
        orConditions.push({ assignedEmployeeId: new mongoose.Types.ObjectId(userId) });
      }
      if (req.user?.email) {
        const emp = await Employee.findOne({ email: req.user.email.toLowerCase() });
        if (emp) {
          if (emp.employeeId) orConditions.push({ assignedEmployeeId: emp.employeeId });
          orConditions.push({ assignedEmployeeId: emp._id.toString() });
          if (emp.name) orConditions.push({ assignedEmployeeName: emp.name });
        }
      }
      filter.$or = orConditions;
    }

    if (status && status !== 'all') filter.status = status;
    if (priority && priority !== 'all') filter.priority = priority;
    if (source && source !== 'all') filter.source = source;

    if (search) {
      filter.$and = filter.$and || [];
      filter.$and.push({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { serviceInterest: { $regex: search, $options: 'i' } },
          { serviceName: { $regex: search, $options: 'i' } }
        ]
      });
    }

    const legacyNames = ['Dr. Raymond Thornton', 'Rajesh Sharma', 'Priya Sundaram', 'Vikramaditya Singhania', 'Ananya Deshmukh', 'Col. Balwinder Singh', 'Meera Krishnan'];
    const leads = await Lead.find({
      ...filter,
      name: { $nin: legacyNames }
    }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: leads.length, leads });
  } catch (err) {
    next(err);
  }
};

export const getLeadById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userRole = req.user?.role || 'admin';
    const userId = req.user?.id;

    if (!isConnected) {
      const lead = MemoryStore.leads.find(l => l.id === req.params.id);
      if (!lead) {
        res.status(404).json({ success: false, message: 'Lead not found.' });
        return;
      }
      if (userRole === 'sales' && lead.assignedEmployeeId !== userId && lead.assignedEmployeeId !== 'emp-1') {
        res.status(403).json({ success: false, message: 'Access denied: You can only view leads assigned to you.' });
        return;
      }
      res.status(200).json({ success: true, lead });
      return;
    }

    let lead: any = null;
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      lead = await Lead.findById(req.params.id);
    }
    if (!lead) {
      res.status(404).json({ success: false, message: 'Lead not found.' });
      return;
    }

    if (userRole === 'sales' && String(lead.assignedEmployeeId) !== String(userId)) {
      res.status(403).json({ success: false, message: 'Access denied: You can only view leads assigned to you.' });
      return;
    }

    res.status(200).json({ success: true, lead });
  } catch (err) {
    next(err);
  }
};

export const createLead = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      name,
      company,
      phone,
      email,
      address,
      serviceId,
      serviceName,
      serviceInterest,
      services,
      servicePriceSnapshot,
      source,
      priority,
      customerRequirements,
      contactPreference,
      preferredTimeline,
      notes,
      estimatedValue,
      assignedEmployeeId,
      forceCreate
    } = req.body;

    if (!name || !name.trim()) {
      res.status(400).json({ success: false, message: 'Lead name is required.' });
      return;
    }
    if (!phone || !phone.trim()) {
      res.status(400).json({ success: false, message: 'Lead phone number is required.' });
      return;
    }

    const finalServiceName = serviceName || serviceInterest || 'Ultra Deep Villa Sanitization';

    // Validate assigned employee if provided, or auto-assign to sales employee creator
    let assignedEmp: any = null;
    let targetEmployeeId = assignedEmployeeId;

    if (req.user?.role === 'sales' && !targetEmployeeId) {
      targetEmployeeId = req.user.id || 'emp-1';
    }

    if (targetEmployeeId) {
      assignedEmp = await findActiveEmployee(targetEmployeeId);
      if (!assignedEmp && req.user?.role === 'sales') {
        assignedEmp = await findActiveEmployee('emp-1');
      }
      if (!assignedEmp) {
        res.status(400).json({ success: false, message: `Assigned employee ID '${targetEmployeeId}' was not found.` });
        return;
      }
      if (assignedEmp.status && assignedEmp.status !== 'active') {
        res.status(400).json({ success: false, message: `Assigned employee '${assignedEmp.name}' is not currently active.` });
        return;
      }
    }

    // Run AI Lead Scoring
    const aiEvaluation = AIService.calculateLeadScore({
      serviceInterest: finalServiceName,
      source: source || 'Website Form',
      estimatedValue: Number(estimatedValue) || Number(servicePriceSnapshot) || 350,
      urgency: priority || 'medium'
    });

    if (!isConnected) {
      if (!forceCreate) {
        const existingInMem = MemoryStore.leads.find(l =>
          (l.phone === phone.trim() || (email && l.email?.toLowerCase() === email.trim().toLowerCase())) &&
          (l.serviceInterest === finalServiceName || (l as any).serviceName === finalServiceName) &&
          !['converted', 'lost'].includes(l.status)
        );

        if (existingInMem) {
          (existingInMem as any).notes = (existingInMem as any).notes
            ? `${(existingInMem as any).notes}\n[Update ${new Date().toLocaleDateString()}]: ${notes || 'Repeat inquiry'}`
            : notes || 'Repeat inquiry';
          (existingInMem as any).interactionHistory = (existingInMem as any).interactionHistory || [];
          (existingInMem as any).interactionHistory.push({
            type: 'note',
            date: new Date().toISOString().slice(0, 10),
            agentName: req.user?.name || 'Inbound Portal',
            summary: `Repeat inquiry for ${finalServiceName}. Requirements: ${Array.isArray(customerRequirements) ? customerRequirements.join(', ') : (customerRequirements || notes || 'None specified')}`,
            sentiment: 'positive'
          } as any);
          emitLeadUpdated(existingInMem);

          res.status(200).json({
            success: true,
            message: `Active inquiry for ${existingInMem.name} found. Updated lead record with new requirements.`,
            lead: existingInMem,
            isExistingUpdated: true
          });
          return;
        }
      }

      const targetEmpId = assignedEmp ? String(targetEmployeeId || assignedEmp.employeeId || assignedEmp.id || assignedEmp._id) : undefined;
      const newLead = {
        id: `lead-${Date.now()}`,
        name: name.trim(),
        company: company?.trim() || '',
        phone: phone.trim(),
        email: email?.trim() || `${name.toLowerCase().replace(/\s+/g, '.')}@client.com`,
        address: address?.trim() || 'Address on file',
        serviceId,
        serviceName: finalServiceName,
        serviceInterest: finalServiceName,
        services: Array.isArray(services) ? services : [finalServiceName],
        servicePriceSnapshot: Number(servicePriceSnapshot) || Number(estimatedValue) || 350,
        source: source || 'Website Form',
        priority: priority || 'medium',
        customerRequirements: Array.isArray(customerRequirements) ? customerRequirements : (customerRequirements ? [customerRequirements] : []),
        contactPreference: contactPreference || 'phone',
        preferredTimeline: preferredTimeline || 'Immediate',
        notes: notes || '',
        estimatedValue: Number(estimatedValue) || Number(servicePriceSnapshot) || 350,
        assignedEmployeeId: targetEmpId,
        assignedEmployeeName: assignedEmp?.name,
        status: assignedEmp ? 'assigned' : 'new',
        aiScore: aiEvaluation.score,
        aiConversionProb: aiEvaluation.conversionProb,
        aiScoreReason: aiEvaluation.reason,
        interactionHistory: [],
        assignmentHistory: assignedEmp ? [{
          newEmployeeId: targetEmpId!,
          newEmployeeName: assignedEmp.name,
          assignedBy: req.user?.id || 'admin',
          assignedByName: req.user?.name || 'Administrator',
          timestamp: new Date(),
          reason: 'Initial assignment upon lead intake'
        }] : [],
        auditHistory: [{
          field: 'lead',
          newValue: 'Created',
          changedBy: req.user?.id || 'admin',
          changedByName: req.user?.name || 'Administrator',
          timestamp: new Date()
        }],
        createdBy: req.user?.id,
        createdByName: req.user?.name || 'Administrator',
        nextFollowUp: new Date(Date.now() + 86400000).toISOString().slice(0, 16).replace('T', ' '),
        createdAt: new Date().toISOString()
      };
      MemoryStore.leads.unshift(newLead);
      emitLeadCreated(newLead);

      if (assignedEmp && targetEmpId) {
        const empNotif = {
          id: `notif-${Date.now()}-emp`,
          title: 'New Lead Assigned',
          message: `A new lead, ${newLead.name}, has been assigned to you for ${newLead.serviceName}. Priority: ${newLead.priority.toUpperCase()}.`,
          type: 'ai',
          timestamp: 'Just now',
          read: false,
          recipientRole: 'sales',
          recipientId: targetEmpId,
          relatedEntityId: newLead.id,
          relatedEntityType: 'lead',
          link: '/sales/leads',
          createdAt: new Date().toISOString()
        };
        MemoryStore.notifications.unshift(empNotif as any);
        emitNotificationCreated(empNotif);
      }

      res.status(201).json({ success: true, message: 'Lead created & saved permanently.', lead: newLead });
      return;
    }

    // Check duplicate active inquiry for the same customer & service in MongoDB
    if (!forceCreate) {
      const duplicateQuery: any[] = [{ phone: phone.trim() }];
      if (email && email.trim()) {
        duplicateQuery.push({ email: email.trim().toLowerCase() });
      }

      const existingLead = await Lead.findOne({
        $or: duplicateQuery,
        $and: [
          {
            $or: [
              { serviceInterest: finalServiceName },
              { serviceName: finalServiceName }
            ]
          },
          { status: { $in: ['new', 'assigned', 'unassigned', 'qualified'] } }
        ]
      });

      if (existingLead) {
        existingLead.interactionHistory.push({
          type: 'note',
          date: new Date().toISOString().slice(0, 10),
          agentName: req.user?.name || 'Inbound Portal',
          summary: `Repeat inquiry for ${finalServiceName}. Requirements: ${Array.isArray(customerRequirements) ? customerRequirements.join(', ') : (customerRequirements || notes || 'None specified')}`,
          sentiment: 'positive'
        });
        if (notes) {
          existingLead.notes = existingLead.notes
            ? `${existingLead.notes}\n[Update ${new Date().toLocaleDateString()}]: ${notes}`
            : notes;
        }
        existingLead.updatedAt = new Date();
        await existingLead.save();
        emitLeadUpdated(existingLead);

        res.status(200).json({
          success: true,
          message: `Active inquiry for ${existingLead.name} found. Updated lead record with new requirements.`,
          lead: existingLead,
          isExistingUpdated: true
        });
        return;
      }
    }

    const targetEmpId = assignedEmp ? String(targetEmployeeId || assignedEmp.employeeId || assignedEmp.id || assignedEmp._id) : undefined;
    const leadDoc = new Lead({
      name: name.trim(),
      company: company?.trim() || '',
      phone: phone.trim(),
      email: email?.trim() || `${name.toLowerCase().replace(/\s+/g, '.')}@client.com`,
      address: address?.trim() || 'Address on file',
      serviceId: serviceId || undefined,
      serviceName: finalServiceName,
      serviceInterest: finalServiceName,
      services: Array.isArray(services) ? services : [finalServiceName],
      servicePriceSnapshot: Number(servicePriceSnapshot) || Number(estimatedValue) || 350,
      source: source || 'Website Form',
      priority: priority || 'medium',
      customerRequirements: Array.isArray(customerRequirements) ? customerRequirements : (customerRequirements ? [customerRequirements] : []),
      contactPreference: contactPreference || 'phone',
      preferredTimeline: preferredTimeline || 'Immediate',
      notes: notes || '',
      estimatedValue: Number(estimatedValue) || Number(servicePriceSnapshot) || 350,
      assignedEmployeeId: targetEmpId,
      assignedEmployeeName: assignedEmp?.name,
      status: assignedEmp ? 'assigned' : 'new',
      aiScore: aiEvaluation.score,
      aiConversionProb: aiEvaluation.conversionProb,
      aiScoreReason: aiEvaluation.reason,
      interactionHistory: [],
      assignmentHistory: assignedEmp && targetEmpId ? [{
        newEmployeeId: targetEmpId,
        newEmployeeName: assignedEmp.name,
        assignedBy: req.user?.id || 'admin',
        assignedByName: req.user?.name || 'Administrator',
        timestamp: new Date(),
        reason: 'Initial assignment upon lead intake'
      }] : [],
      auditHistory: [{
        field: 'lead',
        newValue: 'Created',
        changedBy: req.user?.id || 'admin',
        changedByName: req.user?.name || 'Administrator',
        timestamp: new Date()
      }],
      createdBy: req.user?.id,
      createdByName: req.user?.name || 'Administrator',
      nextFollowUp: new Date(Date.now() + 86400000).toISOString().slice(0, 16).replace('T', ' ')
    });

    const savedLead = await leadDoc.save();

    // Broadcast real-time lead created event
    emitLeadCreated(savedLead);

    // Create notifications for Admin and Manager
    const fuMessage = savedLead.nextFollowUp ? ` Scheduled follow-up: ${savedLead.nextFollowUp}.` : '';
    const adminNotif = await Notification.create({
      title: 'New Lead Created',
      message: `Lead ${savedLead.name} (${savedLead.phone}) registered for ${savedLead.serviceName}.${fuMessage}`,
      type: 'ai',
      scheduledTime: savedLead.nextFollowUp,
      timestamp: savedLead.nextFollowUp || 'Just now',
      read: false,
      recipientRole: 'admin',
      relatedEntityId: savedLead._id,
      relatedEntityType: 'lead',
      link: '/admin/leads'
    });
    emitNotificationCreated(adminNotif);

    const mgrNotif = await Notification.create({
      title: 'New Lead Created',
      message: `Lead ${savedLead.name} (${savedLead.phone}) registered for ${savedLead.serviceName}.${fuMessage}`,
      type: 'ai',
      scheduledTime: savedLead.nextFollowUp,
      timestamp: savedLead.nextFollowUp || 'Just now',
      read: false,
      recipientRole: 'manager',
      relatedEntityId: savedLead._id,
      relatedEntityType: 'lead',
      link: '/admin/leads'
    });
    emitNotificationCreated(mgrNotif);

    // If assigned at creation, notify assigned employee
    if (assignedEmp && targetEmpId) {
      const empNotif = await Notification.create({
        title: 'New Lead Assigned',
        message: `A new lead, ${savedLead.name}, has been assigned to you for ${savedLead.serviceName}.${fuMessage} Priority: ${savedLead.priority.toUpperCase()}.`,
        type: 'ai',
        scheduledTime: savedLead.nextFollowUp,
        timestamp: savedLead.nextFollowUp || 'Just now',
        read: false,
        recipientRole: 'sales',
        recipientId: targetEmpId,
        relatedEntityId: savedLead._id,
        relatedEntityType: 'lead',
        link: '/sales/leads'
      });
      emitNotificationCreated(empNotif);
    }

    await AutomationEngine.trigger({
      event: 'lead_created',
      payload: savedLead
    });

    res.status(201).json({
      success: true,
      message: 'Lead permanently created & synchronized.',
      lead: savedLead
    });
  } catch (err) {
    next(err);
  }
};

export const updateLead = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const leadId = req.params.id;
    const updates = req.body;

    if (!isConnected) {
      const index = MemoryStore.leads.findIndex(l => l.id === leadId);
      if (index === -1) {
        res.status(404).json({ success: false, message: 'Lead not found.' });
        return;
      }
      const existing = MemoryStore.leads[index];
      const merged = { ...existing, ...updates };
      MemoryStore.leads[index] = merged;
      emitLeadUpdated(merged);
      res.status(200).json({ success: true, message: 'Lead updated.', lead: merged });
      return;
    }

    let lead: any = null;
    if (mongoose.Types.ObjectId.isValid(leadId)) {
      lead = await Lead.findById(leadId);
    }
    if (!lead) {
      res.status(404).json({ success: false, message: 'Lead not found.' });
      return;
    }
    // Keep track of audit changes
    const auditEntries: any[] = [];
    const fieldsToTrack = [
      'name', 'company', 'phone', 'email', 'address', 'serviceInterest',
      'source', 'priority', 'status', 'preferredTimeline', 'contactPreference',
      'notes', 'estimatedValue'
    ];

    for (const f of fieldsToTrack) {
      if (updates[f] !== undefined && updates[f] !== null && String(updates[f]) !== String((lead as any)[f])) {
        auditEntries.push({
          field: f,
          previousValue: (lead as any)[f],
          newValue: updates[f],
          changedBy: req.user?.id || 'admin',
          changedByName: req.user?.name || 'Administrator',
          timestamp: new Date()
        });
        (lead as any)[f] = updates[f];
      }
    }

    // Handle customerRequirements array if provided
    if (updates.customerRequirements !== undefined) {
      lead.customerRequirements = Array.isArray(updates.customerRequirements)
        ? updates.customerRequirements
        : [updates.customerRequirements];
    }

    // Handle serviceId & serviceName
    if (updates.serviceName) {
      lead.serviceName = updates.serviceName;
      lead.serviceInterest = updates.serviceName;
    }
    if (updates.serviceId) lead.serviceId = updates.serviceId;
    if (updates.servicePriceSnapshot) lead.servicePriceSnapshot = Number(updates.servicePriceSnapshot);

    // Check if employee assignment changed via update
    if (updates.assignedEmployeeId && String(updates.assignedEmployeeId) !== String(lead.assignedEmployeeId)) {
      const newEmp = await findActiveEmployee(updates.assignedEmployeeId);
      if (newEmp) {
        const prevId = lead.assignedEmployeeId ? String(lead.assignedEmployeeId) : undefined;
        const prevName = lead.assignedEmployeeName;
        lead.assignedEmployeeId = String(updates.assignedEmployeeId);
        lead.assignedEmployeeName = newEmp.name;
        lead.status = 'assigned';
        lead.assignmentHistory.push({
          previousEmployeeId: prevId,
          previousEmployeeName: prevName,
          newEmployeeId: String(updates.assignedEmployeeId),
          newEmployeeName: newEmp.name,
          assignedBy: req.user?.id || 'admin',
          assignedByName: req.user?.name || 'Administrator',
          reason: 'Reassigned via Lead Edit',
          timestamp: new Date()
        });
        auditEntries.push({
          field: 'assignedEmployee',
          previousValue: prevName || 'Unassigned',
          newValue: newEmp.name,
          changedBy: req.user?.id || 'admin',
          changedByName: req.user?.name || 'Administrator',
          timestamp: new Date()
        });
      }
    }

    // Append new audit entries
    if (auditEntries.length > 0) {
      lead.auditHistory.push(...auditEntries);
    }

    // Update who edited the lead
    lead.updatedBy = req.user?.id;
    lead.updatedByName = req.user?.name || 'Administrator';

    const saved = await lead.save();
    emitLeadUpdated(saved);

    res.status(200).json({ success: true, message: 'Lead updated successfully.', lead: saved });
  } catch (err) {
    next(err);
  }
};

export const deleteLead = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (req.params.id === 'all') {
      if (!isConnected) {
        MemoryStore.leads = [];
        res.status(200).json({ success: true, message: 'All leads deleted.' });
        return;
      }
      await Lead.deleteMany({});
      emitLeadDeleted('all');
      res.status(200).json({ success: true, message: 'All leads deleted.' });
      return;
    }

    if (!isConnected) {
      const index = MemoryStore.leads.findIndex(l => l.id === req.params.id);
      if (index === -1) {
        res.status(404).json({ success: false, message: 'Lead not found.' });
        return;
      }
      MemoryStore.leads.splice(index, 1);
      emitLeadDeleted(req.params.id);
      res.status(200).json({ success: true, message: 'Lead deleted.' });
      return;
    }

    const lead = await Lead.findByIdAndDelete(req.params.id);
    if (!lead) {
      res.status(404).json({ success: false, message: 'Lead not found.' });
      return;
    }

    emitLeadDeleted(req.params.id);
    res.status(200).json({ success: true, message: 'Lead deleted.' });
  } catch (err) {
    next(err);
  }
};

export const assignLead = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { employeeId, reason } = req.body;

    if (!employeeId) {
      res.status(400).json({ success: false, message: 'Employee ID is required for assignment.' });
      return;
    }

    // Validate employee exists and is active
    const emp = await findActiveEmployee(employeeId);
    if (!emp) {
      res.status(400).json({ success: false, message: `Employee '${employeeId}' not found.` });
      return;
    }
    if (emp.status && emp.status !== 'active') {
      res.status(400).json({ success: false, message: `Employee '${emp.name}' is inactive and cannot be assigned leads.` });
      return;
    }

    if (!isConnected) {
      const lead = MemoryStore.leads.find(l => l.id === req.params.id);
      if (!lead) {
        res.status(404).json({ success: false, message: 'Lead not found.' });
        return;
      }

      const prevEmpId = lead.assignedEmployeeId ? String(lead.assignedEmployeeId) : undefined;
      const prevEmpName = lead.assignedEmployeeName;

      lead.assignedEmployeeId = employeeId;
      lead.assignedEmployeeName = emp.name;
      lead.status = 'assigned';
      lead.assignmentHistory = lead.assignmentHistory || [];
      lead.assignmentHistory.push({
        previousEmployeeId: prevEmpId,
        previousEmployeeName: prevEmpName,
        newEmployeeId: String(employeeId),
        newEmployeeName: emp.name,
        assignedBy: req.user?.id || 'admin',
        assignedByName: req.user?.name || 'Administrator',
        timestamp: new Date(),
        reason: reason || (prevEmpId ? 'Lead reassigned by management' : 'Initial assignment')
      });

      emitLeadAssigned(lead, prevEmpId);

      const assignedNotif = {
        id: `notif-${Date.now()}-assign`,
        title: 'New Lead Assigned',
        message: `A new lead, ${lead.name}, has been assigned to you for ${lead.serviceName || lead.serviceInterest}. Priority: ${lead.priority?.toUpperCase() || 'MEDIUM'}.`,
        type: 'ai',
        timestamp: 'Just now',
        read: false,
        recipientRole: 'sales',
        recipientId: String(employeeId),
        relatedEntityId: lead.id,
        relatedEntityType: 'lead',
        link: '/sales/leads',
        createdAt: new Date().toISOString()
      };
      MemoryStore.notifications.unshift(assignedNotif as any);
      emitNotificationCreated(assignedNotif);

      res.status(200).json({ success: true, message: `Lead assigned to ${emp.name}.`, lead });
      return;
    }

    let lead: any = null;
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      lead = await Lead.findById(req.params.id);
    }
    if (!lead) {
      res.status(404).json({ success: false, message: 'Lead not found.' });
      return;
    }

    const previousEmployeeId = lead.assignedEmployeeId ? String(lead.assignedEmployeeId) : undefined;
    const previousEmployeeName = lead.assignedEmployeeName;

    lead.assignedEmployeeId = employeeId;
    lead.assignedEmployeeName = emp.name;
    lead.status = 'assigned';

    lead.assignmentHistory.push({
      previousEmployeeId,
      previousEmployeeName,
      newEmployeeId: String(employeeId),
      newEmployeeName: emp.name,
      assignedBy: req.user?.id || 'admin',
      assignedByName: req.user?.name || 'Administrator',
      timestamp: new Date(),
      reason: reason || (previousEmployeeId ? 'Lead reassigned by management' : 'Initial assignment')
    });

    const updatedLead = await lead.save();

    // Broadcast assignment real-time
    emitLeadAssigned(updatedLead, previousEmployeeId);

    // 1. Create persistent notification for newly assigned employee
    const assignedNotif = await Notification.create({
      title: 'New Lead Assigned',
      message: `A new lead, ${updatedLead.name}, has been assigned to you for ${updatedLead.serviceName || updatedLead.serviceInterest}. Priority: ${updatedLead.priority.toUpperCase()}.`,
      type: 'ai',
      timestamp: 'Just now',
      read: false,
      recipientRole: 'sales',
      recipientId: employeeId,
      relatedEntityId: updatedLead._id,
      relatedEntityType: 'lead',
      link: '/sales/leads'
    });
    emitNotificationCreated(assignedNotif);

    // 2. If reassigned from another employee, notify previous employee
    if (previousEmployeeId && previousEmployeeId !== employeeId) {
      const prevNotif = await Notification.create({
        title: 'Lead Reassigned',
        message: `Lead ${updatedLead.name} has been reassigned to ${emp.name}.`,
        type: 'alert',
        timestamp: 'Just now',
        read: false,
        recipientRole: 'sales',
        recipientId: previousEmployeeId,
        relatedEntityId: updatedLead._id,
        relatedEntityType: 'lead',
        link: '/sales/leads'
      });
      emitNotificationCreated(prevNotif);
    }

    // 3. Notify authorized managers
    const mgrNotif = await Notification.create({
      title: 'Lead Assigned',
      message: `Lead ${updatedLead.name} was ${previousEmployeeId ? 'reassigned' : 'assigned'} to ${emp.name} by ${req.user?.name || 'Administrator'}.`,
      type: 'ai',
      timestamp: 'Just now',
      read: false,
      recipientRole: 'manager',
      relatedEntityId: updatedLead._id,
      relatedEntityType: 'lead',
      link: '/admin/leads'
    });
    emitNotificationCreated(mgrNotif);

    res.status(200).json({
      success: true,
      message: `Lead successfully assigned to ${emp.name}.`,
      lead: updatedLead
    });
  } catch (err) {
    next(err);
  }
};

export const convertLeadToCustomer = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!isConnected) {
      const lead = MemoryStore.leads.find(l => l.id === req.params.id);
      if (!lead) {
        res.status(404).json({ success: false, message: 'Lead not found.' });
        return;
      }
      lead.status = 'converted';
      const newCustomer = {
        id: `cust-${Date.now()}`,
        name: lead.name,
        phone: lead.phone,
        email: lead.email,
        address: lead.address,
        servicePreferences: [lead.serviceName || lead.serviceInterest],
        totalBookings: 1,
        totalSpent: lead.estimatedValue,
        loyaltyTier: 'Silver',
        satisfactionScore: 5.0,
        notes: [`Converted from Lead #${lead.id} on ${new Date().toLocaleDateString()}`],
        complaints: [],
        interactionTimeline: lead.interactionHistory || [],
        createdAt: new Date().toISOString()
      };
      MemoryStore.customers.unshift(newCustomer);
      res.status(200).json({
        success: true,
        message: '🎉 Lead converted to Customer 360 profile.',
        customer: newCustomer
      });
      return;
    }

    let lead: any = null;
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      lead = await Lead.findById(req.params.id);
    }
    if (!lead) {
      res.status(404).json({ success: false, message: 'Lead not found.' });
      return;
    }

    lead.status = 'converted';
    await lead.save();

    // Create Customer 360 Record
    const customer = await Customer.create({
      name: lead.name,
      phone: lead.phone,
      email: lead.email,
      address: lead.address,
      servicePreferences: [lead.serviceName || lead.serviceInterest],
      totalBookings: 1,
      totalSpent: lead.estimatedValue,
      loyaltyTier: 'Silver',
      satisfactionScore: 5.0,
      notes: [`Converted from Lead #${lead._id} on ${new Date().toLocaleDateString()}`],
      complaints: [],
      interactionTimeline: lead.interactionHistory
    });

    emitLeadUpdated(lead);

    res.status(200).json({
      success: true,
      message: '🎉 Lead converted to Customer 360 profile.',
      customer
    });
  } catch (err) {
    next(err);
  }
};

export const getLeadHistory = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const leadId = req.params.id;

    if (!isConnected) {
      const lead = MemoryStore.leads.find(l => l.id === leadId);
      if (!lead) {
        res.status(404).json({ success: false, message: 'Lead not found.' });
        return;
      }
      const meetings = MemoryStore.meetings.filter(m => m.leadId === leadId);
      const followUps = MemoryStore.followUps.filter(f => f.leadId === leadId);
      res.status(200).json({
        success: true,
        lead,
        interactionHistory: lead.interactionHistory || [],
        assignmentHistory: lead.assignmentHistory || [],
        auditHistory: (lead as any).auditHistory || [],
        meetings,
        followUps
      });
      return;
    }

    let lead: any = null;
    if (mongoose.Types.ObjectId.isValid(leadId)) {
      lead = await Lead.findById(leadId);
    }
    if (!lead) {
      res.status(404).json({ success: false, message: 'Lead not found.' });
      return;
    }

    const [meetings, followUps] = await Promise.all([
      Meeting.find({ leadId: { $in: [leadId, lead._id] } }).sort({ dateTime: -1 }),
      FollowUp.find({ leadId: { $in: [leadId, lead._id] } }).sort({ scheduledDateTime: -1 })
    ]);

    res.status(200).json({
      success: true,
      lead,
      interactionHistory: lead.interactionHistory || [],
      assignmentHistory: lead.assignmentHistory || [],
      auditHistory: lead.auditHistory || [],
      meetings,
      followUps
    });
  } catch (err) {
    next(err);
  }
};

export const addLeadNote = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const leadId = req.params.id;
    const { summary, type, sentiment } = req.body;

    if (!summary || !summary.trim()) {
      res.status(400).json({ success: false, message: 'Note summary cannot be empty.' });
      return;
    }

    const noteEntry = {
      type: type || 'note',
      date: new Date().toISOString().slice(0, 16).replace('T', ' '),
      agentName: req.user?.name || 'Administrator',
      summary: summary.trim(),
      sentiment: sentiment || 'positive'
    };

    if (!isConnected) {
      const lead = MemoryStore.leads.find(l => l.id === leadId);
      if (!lead) {
        res.status(404).json({ success: false, message: 'Lead not found.' });
        return;
      }
      lead.interactionHistory = lead.interactionHistory || [];
      lead.interactionHistory.unshift(noteEntry as any);
      emitLeadUpdated(lead);
      res.status(200).json({ success: true, message: 'Note added.', lead });
      return;
    }

    let lead: any = null;
    if (mongoose.Types.ObjectId.isValid(leadId)) {
      lead = await Lead.findById(leadId);
    }
    if (!lead) {
      res.status(404).json({ success: false, message: 'Lead not found.' });
      return;
    }

    lead.interactionHistory.unshift(noteEntry as any);
    await lead.save();
    emitLeadUpdated(lead);

    res.status(200).json({ success: true, message: 'Note logged to customer timeline.', lead });
  } catch (err) {
    next(err);
  }
};
