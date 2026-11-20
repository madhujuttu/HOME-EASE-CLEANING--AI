import mongoose from 'mongoose';
import { FollowUp, Employee, Lead, Notification } from '../models/index.js';
import { isConnected } from '../config/db.js';
import { MemoryStore } from '../data/memoryStore.js';
import { emitFollowUpCreated, emitFollowUpUpdated, emitFollowUpRescheduled, emitFollowUpCompleted, emitFollowUpCancelled, emitFollowUpDeleted, emitNotificationCreated } from '../sockets/socketHandler.js';
// Helper to resolve an employee record across DB or MemoryStore safely
async function findActiveEmployee(employeeId) {
    if (!employeeId)
        return null;
    const strId = String(employeeId).trim();
    if (isConnected) {
        let emp = null;
        if (mongoose.Types.ObjectId.isValid(strId)) {
            try {
                emp = await Employee.findById(strId);
            }
            catch { }
        }
        if (!emp) {
            try {
                emp = await Employee.findOne({
                    $or: [
                        { employeeId: strId },
                        { email: strId.toLowerCase() },
                        { name: strId }
                    ]
                });
            }
            catch { }
        }
        if (emp)
            return emp;
    }
    const mem = MemoryStore.employees.find(e => e.id === strId || e.email.toLowerCase() === strId.toLowerCase() || e.name.toLowerCase() === strId.toLowerCase());
    return mem || null;
}
export const getFollowUps = async (req, res, next) => {
    try {
        const { leadId, employeeId, status, priority, type, date, search } = req.query;
        const userRole = req.user?.role || 'admin';
        const userId = req.user?.id;
        if (!isConnected) {
            let filtered = [...MemoryStore.followUps];
            if (userRole === 'sales') {
                filtered = filtered.filter(f => f.employeeId === userId ||
                    f.employeeId === 'emp-1' ||
                    (req.user?.name && f.employeeName && f.employeeName.toLowerCase().trim() === req.user.name.toLowerCase().trim()));
            }
            else if (employeeId) {
                filtered = filtered.filter(f => f.employeeId === employeeId);
            }
            if (leadId)
                filtered = filtered.filter(f => f.leadId === leadId);
            if (status && status !== 'all')
                filtered = filtered.filter(f => f.status === status);
            if (priority && priority !== 'all')
                filtered = filtered.filter(f => f.priority === priority);
            if (type && type !== 'all')
                filtered = filtered.filter(f => f.type === type);
            if (date)
                filtered = filtered.filter(f => f.scheduledDateTime.startsWith(String(date)));
            if (search) {
                const s = String(search).toLowerCase();
                filtered = filtered.filter(f => f.customerName?.toLowerCase().includes(s) ||
                    f.purpose?.toLowerCase().includes(s) ||
                    f.employeeName?.toLowerCase().includes(s));
            }
            res.status(200).json({ success: true, count: filtered.length, followUps: filtered });
            return;
        }
        const filter = {};
        // Role-based visibility
        if (userRole === 'sales') {
            const orConditions = [
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
                    if (emp.employeeId)
                        orConditions.push({ employeeId: emp.employeeId });
                    orConditions.push({ employeeId: emp._id.toString() });
                    if (emp.name)
                        orConditions.push({ employeeName: emp.name });
                }
            }
            filter.$or = orConditions;
        }
        else if (employeeId) {
            filter.employeeId = employeeId;
        }
        if (leadId) {
            if (mongoose.Types.ObjectId.isValid(String(leadId))) {
                filter.leadId = { $in: [leadId, new mongoose.Types.ObjectId(String(leadId))] };
            }
            else {
                filter.leadId = leadId;
            }
        }
        if (status && status !== 'all')
            filter.status = status;
        if (priority && priority !== 'all')
            filter.priority = priority;
        if (type && type !== 'all')
            filter.type = type;
        if (date)
            filter.scheduledDateTime = { $regex: `^${date}` };
        if (search) {
            filter.$and = filter.$and || [];
            filter.$and.push({
                $or: [
                    { customerName: { $regex: search, $options: 'i' } },
                    { purpose: { $regex: search, $options: 'i' } },
                    { employeeName: { $regex: search, $options: 'i' } },
                    { customerPhone: { $regex: search, $options: 'i' } }
                ]
            });
        }
        const followUps = await FollowUp.find(filter).sort({ scheduledDateTime: 1 });
        res.status(200).json({ success: true, count: followUps.length, followUps });
    }
    catch (err) {
        next(err);
    }
};
export const getFollowUpById = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!isConnected) {
            const item = MemoryStore.followUps.find(f => f.id === id);
            if (!item) {
                res.status(404).json({ success: false, message: 'Follow-up not found.' });
                return;
            }
            res.status(200).json({ success: true, followUp: item });
            return;
        }
        let followUp = null;
        if (mongoose.Types.ObjectId.isValid(id)) {
            followUp = await FollowUp.findById(id);
        }
        if (!followUp) {
            res.status(404).json({ success: false, message: 'Follow-up not found.' });
            return;
        }
        res.status(200).json({ success: true, followUp });
    }
    catch (err) {
        next(err);
    }
};
export const createFollowUp = async (req, res, next) => {
    try {
        const { leadId, customerId, customerName, customerPhone, customerEmail, employeeId, type, scheduledDateTime, priority, purpose, notes } = req.body;
        if (!customerName || !customerName.trim()) {
            res.status(400).json({ success: false, message: 'Customer or Lead name is required.' });
            return;
        }
        if (!scheduledDateTime) {
            res.status(400).json({ success: false, message: 'Follow-up date and time is required.' });
            return;
        }
        if (!purpose || !purpose.trim()) {
            res.status(400).json({ success: false, message: 'Follow-up purpose/objective is required.' });
            return;
        }
        // Resolve employee
        const targetEmpId = employeeId || req.user?.id || 'emp-1';
        const emp = await findActiveEmployee(targetEmpId);
        const resolvedEmpId = emp ? String(emp.employeeId || emp.id || emp._id) : targetEmpId;
        const resolvedEmpName = emp?.name || req.user?.name || 'Sales Representative';
        let leadDoc = null;
        if (leadId && isConnected && mongoose.Types.ObjectId.isValid(leadId)) {
            leadDoc = await Lead.findById(leadId);
        }
        if (!isConnected) {
            const newFollowUp = {
                id: `fu-${Date.now()}`,
                leadId,
                leadName: leadDoc?.name || customerName,
                customerId,
                customerName: customerName.trim(),
                customerPhone: customerPhone || '+1 (555) 000-0000',
                customerEmail: customerEmail || 'client@example.com',
                employeeId: resolvedEmpId,
                employeeName: resolvedEmpName,
                type: type || 'call',
                scheduledDateTime,
                status: 'pending',
                priority: priority || 'medium',
                purpose: purpose.trim(),
                notes: notes || '',
                rescheduleHistory: [],
                createdBy: req.user?.id,
                createdByName: req.user?.name || 'Administrator',
                createdAt: new Date().toISOString()
            };
            MemoryStore.followUps.unshift(newFollowUp);
            emitFollowUpCreated(newFollowUp);
            const notif = {
                id: `notif-${Date.now()}-fu`,
                title: 'New Follow-Up Task Scheduled',
                message: `Scheduled ${newFollowUp.type.toUpperCase()} with ${newFollowUp.customerName} on ${newFollowUp.scheduledDateTime}. Purpose: ${newFollowUp.purpose}`,
                type: 'followup',
                scheduledTime: newFollowUp.scheduledDateTime,
                timestamp: newFollowUp.scheduledDateTime,
                read: false,
                recipientRole: 'sales',
                recipientId: resolvedEmpId,
                relatedEntityId: newFollowUp.id,
                relatedEntityType: 'followup',
                link: '/sales/follow-ups',
                createdAt: new Date().toISOString()
            };
            MemoryStore.notifications.unshift(notif);
            emitNotificationCreated(notif);
            const mgrNotif = {
                id: `notif-${Date.now()}-mgr-fu`,
                title: 'New Follow-Up Task Scheduled',
                message: `Follow-up ${newFollowUp.type.toUpperCase()} with ${newFollowUp.customerName} scheduled for ${newFollowUp.scheduledDateTime} (Rep: ${resolvedEmpName}). Objective: ${newFollowUp.purpose}`,
                type: 'followup',
                scheduledTime: newFollowUp.scheduledDateTime,
                timestamp: newFollowUp.scheduledDateTime,
                read: false,
                recipientRole: 'manager',
                relatedEntityId: newFollowUp.id,
                relatedEntityType: 'followup',
                link: '/admin/leads',
                createdAt: new Date().toISOString()
            };
            MemoryStore.notifications.unshift(mgrNotif);
            emitNotificationCreated(mgrNotif);
            res.status(201).json({ success: true, message: 'Follow-up scheduled.', followUp: newFollowUp });
            return;
        }
        const followUp = await FollowUp.create({
            leadId: leadId || undefined,
            leadName: leadDoc?.name || customerName.trim(),
            customerId: customerId || undefined,
            customerName: customerName.trim(),
            customerPhone: customerPhone || leadDoc?.phone || '+1 (555) 000-0000',
            customerEmail: customerEmail || leadDoc?.email || 'client@example.com',
            employeeId: resolvedEmpId,
            employeeName: resolvedEmpName,
            type: type || 'call',
            scheduledDateTime,
            status: 'pending',
            priority: priority || 'medium',
            purpose: purpose.trim(),
            notes: notes || '',
            rescheduleHistory: [],
            createdBy: req.user?.id,
            createdByName: req.user?.name || 'Administrator'
        });
        emitFollowUpCreated(followUp);
        // Update Lead's nextFollowUp if linked
        if (leadDoc) {
            leadDoc.nextFollowUp = scheduledDateTime;
            leadDoc.interactionHistory.push({
                type: (type === 'call' || type === 'email' || type === 'meeting' || type === 'whatsapp') ? type : 'note',
                date: scheduledDateTime,
                agentName: resolvedEmpName,
                summary: `Follow-up queued: ${purpose.trim()}`,
                sentiment: 'neutral'
            });
            await leadDoc.save();
        }
        // Format date string for notification
        const formattedDate = new Date(scheduledDateTime).toLocaleString([], {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        // Notify assigned sales employee
        const empNotif = await Notification.create({
            title: 'New Follow-Up Scheduled',
            message: `Follow-up ${type.toUpperCase()} with ${customerName} scheduled for ${formattedDate}. Objective: ${purpose.trim()}`,
            type: 'followup',
            scheduledTime: scheduledDateTime,
            timestamp: formattedDate,
            read: false,
            recipientRole: 'sales',
            recipientId: resolvedEmpId,
            relatedEntityId: followUp._id,
            relatedEntityType: 'followup',
            link: '/sales/follow-ups'
        });
        emitNotificationCreated(empNotif);
        // Notify manager with explicit scheduled time
        const mgrNotif = await Notification.create({
            title: 'New Follow-Up Scheduled',
            message: `Follow-up ${type.toUpperCase()} with ${customerName} scheduled for ${formattedDate} (Rep: ${resolvedEmpName}). Objective: ${purpose.trim()}`,
            type: 'followup',
            scheduledTime: scheduledDateTime,
            timestamp: formattedDate,
            read: false,
            recipientRole: 'manager',
            relatedEntityId: followUp._id,
            relatedEntityType: 'followup',
            link: '/admin/leads'
        });
        emitNotificationCreated(mgrNotif);
        // Notify admin
        const adminNotif = await Notification.create({
            title: 'New Follow-Up Scheduled',
            message: `Follow-up ${type.toUpperCase()} with ${customerName} scheduled for ${formattedDate} (Rep: ${resolvedEmpName}).`,
            type: 'followup',
            scheduledTime: scheduledDateTime,
            timestamp: formattedDate,
            read: false,
            recipientRole: 'admin',
            relatedEntityId: followUp._id,
            relatedEntityType: 'followup',
            link: '/admin/leads'
        });
        emitNotificationCreated(adminNotif);
        res.status(201).json({ success: true, message: 'Follow-up created successfully.', followUp });
    }
    catch (err) {
        next(err);
    }
};
export const updateFollowUp = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { scheduledDateTime, type, priority, purpose, notes, employeeId } = req.body;
        if (!isConnected) {
            const index = MemoryStore.followUps.findIndex(f => f.id === id);
            if (index === -1) {
                res.status(404).json({ success: false, message: 'Follow-up not found.' });
                return;
            }
            MemoryStore.followUps[index] = { ...MemoryStore.followUps[index], ...req.body };
            emitFollowUpUpdated(MemoryStore.followUps[index]);
            res.status(200).json({ success: true, message: 'Follow-up updated.', followUp: MemoryStore.followUps[index] });
            return;
        }
        let followUp = null;
        if (mongoose.Types.ObjectId.isValid(id)) {
            followUp = await FollowUp.findById(id);
        }
        if (!followUp) {
            res.status(404).json({ success: false, message: 'Follow-up not found.' });
            return;
        }
        if (scheduledDateTime)
            followUp.scheduledDateTime = scheduledDateTime;
        if (type)
            followUp.type = type;
        if (priority)
            followUp.priority = priority;
        if (purpose)
            followUp.purpose = purpose;
        if (notes !== undefined)
            followUp.notes = notes;
        if (employeeId && employeeId !== followUp.employeeId) {
            const emp = await findActiveEmployee(employeeId);
            if (emp) {
                followUp.employeeId = String(emp.employeeId || emp.id || emp._id);
                followUp.employeeName = emp.name;
            }
        }
        const updated = await followUp.save();
        emitFollowUpUpdated(updated);
        res.status(200).json({ success: true, message: 'Follow-up updated.', followUp: updated });
    }
    catch (err) {
        next(err);
    }
};
export const rescheduleFollowUp = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { scheduledDateTime, reason } = req.body;
        if (!scheduledDateTime) {
            res.status(400).json({ success: false, message: 'New date and time is required.' });
            return;
        }
        let followUp = null;
        if (isConnected) {
            if (mongoose.Types.ObjectId.isValid(id)) {
                followUp = await FollowUp.findById(id);
            }
            if (!followUp) {
                followUp = await FollowUp.findOne({ $or: [{ id }, { customId: id }] });
            }
        }
        if (followUp) {
            followUp.rescheduleHistory.push({
                previousDateTime: followUp.scheduledDateTime,
                newDateTime: scheduledDateTime,
                rescheduledBy: req.user?.id || 'admin',
                rescheduledByName: req.user?.name || 'Administrator',
                reason: reason || 'Rescheduled',
                timestamp: new Date()
            });
            followUp.scheduledDateTime = scheduledDateTime;
            followUp.status = 'rescheduled';
            followUp.rescheduleReason = reason;
            const updated = await followUp.save();
            emitFollowUpRescheduled(updated);
            if (updated.leadId && mongoose.Types.ObjectId.isValid(String(updated.leadId))) {
                await Lead.findByIdAndUpdate(updated.leadId, {
                    nextFollowUp: scheduledDateTime
                }).catch(() => { });
            }
            res.status(200).json({ success: true, message: 'Follow-up rescheduled.', followUp: updated });
            return;
        }
        // Check MemoryStore fallback
        let memItem = MemoryStore.followUps.find(f => f.id === id || f._id === id);
        if (!memItem) {
            memItem = {
                id,
                _id: id,
                customerName: req.body.customerName || 'Customer',
                customerPhone: req.body.customerPhone || '',
                employeeId: req.user?.id || 'emp-1',
                employeeName: req.user?.name || 'Administrator',
                type: 'call',
                scheduledDateTime,
                status: 'pending',
                priority: 'medium',
                purpose: 'Follow-Up',
                rescheduleHistory: []
            };
            MemoryStore.followUps.push(memItem);
        }
        if (!memItem.rescheduleHistory)
            memItem.rescheduleHistory = [];
        memItem.rescheduleHistory.push({
            previousDateTime: memItem.scheduledDateTime,
            newDateTime: scheduledDateTime,
            rescheduledBy: req.user?.id || 'admin',
            rescheduledByName: req.user?.name || 'Administrator',
            reason: reason || 'Rescheduled',
            timestamp: new Date()
        });
        memItem.scheduledDateTime = scheduledDateTime;
        memItem.status = 'rescheduled';
        memItem.rescheduleReason = reason;
        emitFollowUpRescheduled(memItem);
        res.status(200).json({ success: true, message: 'Follow-up rescheduled.', followUp: memItem });
    }
    catch (err) {
        next(err);
    }
};
export const completeFollowUp = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { outcome, discussionSummary, customerFeedback, nextAction, proofAttachment } = req.body;
        if (!outcome) {
            res.status(400).json({ success: false, message: 'Completion outcome is required (e.g., Connected, Callback Requested, Interested).' });
            return;
        }
        let followUp = null;
        if (isConnected) {
            if (mongoose.Types.ObjectId.isValid(id)) {
                followUp = await FollowUp.findById(id);
            }
            if (!followUp) {
                followUp = await FollowUp.findOne({ $or: [{ id }, { customId: id }, { leadId: id }] });
            }
        }
        if (followUp) {
            followUp.status = 'completed';
            followUp.outcome = outcome;
            followUp.discussionSummary = discussionSummary || '';
            followUp.customerFeedback = customerFeedback || '';
            followUp.nextAction = nextAction || '';
            followUp.proofAttachment = proofAttachment || '';
            followUp.completedAt = new Date();
            followUp.completedBy = req.user?.id || 'admin';
            followUp.completedByName = req.user?.name || 'Administrator';
            const updated = await followUp.save();
            emitFollowUpCompleted(updated);
            if (updated.leadId && mongoose.Types.ObjectId.isValid(String(updated.leadId))) {
                try {
                    const lead = await Lead.findById(updated.leadId);
                    if (lead) {
                        lead.interactionHistory.push({
                            type: (updated.type === 'call' || updated.type === 'email' || updated.type === 'meeting' || updated.type === 'whatsapp') ? updated.type : 'note',
                            date: new Date().toISOString().slice(0, 16).replace('T', ' '),
                            agentName: updated.completedByName || req.user?.name || 'Sales Representative',
                            summary: `Follow-Up Completed: [${outcome.toUpperCase()}] ${discussionSummary || updated.purpose}. Next: ${nextAction || 'None'}`,
                            sentiment: outcome.toLowerCase().includes('interested') || outcome.toLowerCase().includes('converted') ? 'positive' : 'neutral'
                        });
                        if (nextAction) {
                            lead.nextFollowUp = nextAction;
                        }
                        await lead.save();
                    }
                }
                catch (leadErr) {
                    console.warn('[completeFollowUp] Could not append to lead interaction history:', leadErr);
                }
            }
            res.status(200).json({ success: true, message: 'Follow-up completed successfully.', followUp: updated });
            return;
        }
        // Check MemoryStore fallback
        let memItem = MemoryStore.followUps.find(f => f.id === id || f._id === id);
        if (!memItem) {
            memItem = {
                id,
                _id: id,
                customerName: req.body.customerName || 'Customer',
                customerPhone: req.body.customerPhone || '',
                employeeId: req.user?.id || 'emp-1',
                employeeName: req.user?.name || 'Administrator',
                type: 'call',
                scheduledDateTime: new Date().toISOString(),
                status: 'pending',
                priority: 'medium',
                purpose: discussionSummary || 'Customer Follow-Up'
            };
            MemoryStore.followUps.push(memItem);
        }
        memItem.status = 'completed';
        memItem.outcome = outcome;
        memItem.discussionSummary = discussionSummary || '';
        memItem.customerFeedback = customerFeedback || '';
        memItem.nextAction = nextAction || '';
        memItem.proofAttachment = proofAttachment || '';
        memItem.completedAt = new Date();
        memItem.completedBy = req.user?.id || 'admin';
        memItem.completedByName = req.user?.name || 'Administrator';
        emitFollowUpCompleted(memItem);
        res.status(200).json({ success: true, message: 'Follow-up marked as completed.', followUp: memItem });
    }
    catch (err) {
        next(err);
    }
};
export const cancelFollowUp = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        let followUp = null;
        if (isConnected) {
            if (mongoose.Types.ObjectId.isValid(id)) {
                followUp = await FollowUp.findById(id);
            }
            if (!followUp) {
                followUp = await FollowUp.findOne({ $or: [{ id }, { customId: id }] });
            }
        }
        if (followUp) {
            followUp.status = 'cancelled';
            followUp.cancellationReason = reason || 'Cancelled by user';
            const updated = await followUp.save();
            emitFollowUpCancelled(updated);
            res.status(200).json({ success: true, message: 'Follow-up cancelled.', followUp: updated });
            return;
        }
        let memItem = MemoryStore.followUps.find(f => f.id === id || f._id === id);
        if (!memItem) {
            memItem = {
                id,
                _id: id,
                customerName: 'Customer',
                customerPhone: '',
                employeeId: req.user?.id || 'emp-1',
                employeeName: req.user?.name || 'Administrator',
                type: 'call',
                scheduledDateTime: new Date().toISOString(),
                status: 'cancelled',
                priority: 'medium',
                purpose: 'Follow-Up'
            };
            MemoryStore.followUps.push(memItem);
        }
        memItem.status = 'cancelled';
        memItem.cancellationReason = reason || 'Cancelled by user';
        emitFollowUpCancelled(memItem);
        res.status(200).json({ success: true, message: 'Follow-up cancelled.', followUp: memItem });
    }
    catch (err) {
        next(err);
    }
};
export const deleteFollowUp = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!isConnected) {
            const idx = MemoryStore.followUps.findIndex(f => f.id === id);
            if (idx === -1) {
                res.status(404).json({ success: false, message: 'Follow-up not found.' });
                return;
            }
            MemoryStore.followUps.splice(idx, 1);
            emitFollowUpDeleted(id);
            res.status(200).json({ success: true, message: 'Follow-up deleted.' });
            return;
        }
        let followUp = null;
        if (mongoose.Types.ObjectId.isValid(id)) {
            followUp = await FollowUp.findByIdAndDelete(id);
        }
        if (!followUp) {
            res.status(404).json({ success: false, message: 'Follow-up not found.' });
            return;
        }
        emitFollowUpDeleted(id);
        res.status(200).json({ success: true, message: 'Follow-up deleted successfully.' });
    }
    catch (err) {
        next(err);
    }
};
