import jwt from 'jsonwebtoken';
let ioInstance = null;
export const getIO = () => ioInstance;
export const setupSocketHandlers = (io) => {
    ioInstance = io;
    // Authentication middleware for Socket.IO
    io.use((socket, next) => {
        const token = socket.handshake.auth?.token ||
            socket.handshake.headers?.authorization?.replace(/^Bearer\s+/, '') ||
            socket.handshake.query?.token;
        const secret = process.env.JWT_SECRET || 'homeeaseguru_enterprise_jwt_super_secret_key_2026';
        if (token) {
            try {
                const decoded = jwt.verify(token, secret);
                socket.user = decoded;
            }
            catch (err) {
                console.warn(`[Socket.IO] Token verification failed for socket ${socket.id}: ${err.message}`);
            }
        }
        next();
    });
    io.on('connection', (socket) => {
        const user = socket.user;
        const queryUserId = socket.handshake.query?.userId;
        const queryRole = socket.handshake.query?.role;
        const finalUserId = user?.id || queryUserId;
        const finalRole = user?.role || queryRole;
        console.log(`[Socket.IO] Client connected: ${socket.id} (User: ${user?.name || finalUserId || 'Guest'}, Role: ${finalRole || 'anonymous'})`);
        // Automatically join user and role rooms
        if (finalUserId) {
            socket.join(`user:${finalUserId}`);
            console.log(`[Socket.IO] Socket ${socket.id} joined personal room user:${finalUserId}`);
            if (finalUserId === 'emp-1' || finalRole === 'sales') {
                socket.join('user:emp-1');
            }
        }
        if (finalRole) {
            socket.join(`role:${finalRole}`);
            console.log(`[Socket.IO] Socket ${socket.id} joined role room role:${finalRole}`);
            if (['admin', 'manager', 'sales'].includes(finalRole)) {
                socket.join('org');
            }
        }
        // Support both register_user and register_role event names
        const handleRegister = (data) => {
            const targetUserId = user?.id || data?.userId || queryUserId;
            const targetRole = user?.role || data?.role || queryRole;
            if (targetUserId) {
                socket.join(`user:${targetUserId}`);
                console.log(`[Socket.IO] Socket ${socket.id} registered user:${targetUserId}`);
                if (targetUserId === 'emp-1' || targetRole === 'sales') {
                    socket.join('user:emp-1');
                }
            }
            if (targetRole) {
                socket.join(`role:${targetRole}`);
                console.log(`[Socket.IO] Socket ${socket.id} registered role:${targetRole}`);
                if (['admin', 'manager', 'sales'].includes(targetRole)) {
                    socket.join('org');
                }
            }
        };
        socket.on('register_user', handleRegister);
        socket.on('register_role', handleRegister);
        socket.on('join_room', (data) => {
            if (data?.room) {
                socket.join(data.room);
                console.log(`[Socket.IO] Socket ${socket.id} joined custom room ${data.room}`);
            }
        });
        // Handle real-time speech-to-text live stream simulation
        socket.on('call_audio_stream', (data) => {
            io.to('telephony_room').emit('live_transcript_update', {
                ...data,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
            });
        });
        // Handle warm human handoff event
        socket.on('trigger_handoff', (data) => {
            io.emit('human_handoff_alert', {
                ...data,
                message: 'Live AI call escalated for warm transfer to senior sales executive.'
            });
        });
        socket.on('disconnect', () => {
            console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
        });
    });
};
// ----------------- Real-Time Broadcast Helpers -----------------
export const emitLeadCreated = (lead) => {
    if (!ioInstance)
        return;
    // Admins, managers, and sales representatives all receive lead created events
    ioInstance.to('role:admin').to('role:manager').to('role:sales').emit('lead_created', { lead });
    if (lead.assignedEmployeeId) {
        const empId = String(lead.assignedEmployeeId);
        ioInstance.to(`user:${empId}`).emit('lead_created', { lead });
        if (empId === 'emp-1') {
            ioInstance.to('user:emp-1').emit('lead_created', { lead });
        }
    }
};
export const emitLeadUpdated = (lead) => {
    if (!ioInstance)
        return;
    ioInstance.to('role:admin').to('role:manager').to('role:sales').emit('lead_updated', { lead });
    if (lead.assignedEmployeeId) {
        const empId = String(lead.assignedEmployeeId);
        ioInstance.to(`user:${empId}`).emit('lead_updated', { lead });
        if (empId === 'emp-1') {
            ioInstance.to('user:emp-1').emit('lead_updated', { lead });
        }
    }
};
export const emitLeadAssigned = (lead, previousEmployeeId) => {
    if (!ioInstance)
        return;
    ioInstance.to('role:admin').to('role:manager').to('role:sales').emit('lead_assigned', { lead, previousEmployeeId });
    if (lead.assignedEmployeeId) {
        const empId = String(lead.assignedEmployeeId);
        ioInstance.to(`user:${empId}`).emit('lead_assigned', { lead });
        if (empId === 'emp-1') {
            ioInstance.to('user:emp-1').emit('lead_assigned', { lead });
        }
    }
    if (previousEmployeeId && previousEmployeeId !== lead.assignedEmployeeId) {
        ioInstance.to(`user:${previousEmployeeId}`).emit('lead_reassigned', { lead, previousEmployeeId });
    }
};
export const emitLeadDeleted = (leadId) => {
    if (!ioInstance)
        return;
    ioInstance.to('role:admin').to('role:manager').to('role:sales').emit('lead_deleted', { id: leadId });
};
// ----------------- Booking Real-Time Broadcast Helpers -----------------
export const emitBookingCreated = (booking) => {
    if (!ioInstance)
        return;
    ioInstance.to('role:admin').to('role:manager').to('role:sales').to('role:customer').emit('booking_created', { booking });
    if (booking.providerId) {
        ioInstance.to(`user:${booking.providerId}`).emit('booking_created', { booking });
    }
};
export const emitBookingUpdated = (booking) => {
    if (!ioInstance)
        return;
    ioInstance.to('role:admin').to('role:manager').to('role:sales').to('role:customer').emit('booking_updated', { booking });
    if (booking.providerId) {
        ioInstance.to(`user:${booking.providerId}`).emit('booking_updated', { booking });
    }
};
export const emitMeetingCreated = (meeting) => {
    if (!ioInstance)
        return;
    ioInstance.to('role:admin').to('role:manager').to('role:sales').emit('meeting_created', { meeting });
    if (meeting.employeeId) {
        const empId = String(meeting.employeeId);
        ioInstance.to(`user:${empId}`).emit('meeting_created', { meeting });
        if (empId === 'emp-1') {
            ioInstance.to('user:emp-1').emit('meeting_created', { meeting });
        }
    }
};
export const emitMeetingUpdated = (meeting) => {
    if (!ioInstance)
        return;
    ioInstance.to('role:admin').to('role:manager').to('role:sales').emit('meeting_updated', { meeting });
    if (meeting.employeeId) {
        const empId = String(meeting.employeeId);
        ioInstance.to(`user:${empId}`).emit('meeting_updated', { meeting });
        if (empId === 'emp-1') {
            ioInstance.to('user:emp-1').emit('meeting_updated', { meeting });
        }
    }
};
export const emitMeetingRescheduled = (meeting) => {
    if (!ioInstance)
        return;
    ioInstance.to('role:admin').to('role:manager').to('role:sales').emit('meeting_rescheduled', { meeting });
    if (meeting.employeeId) {
        const empId = String(meeting.employeeId);
        ioInstance.to(`user:${empId}`).emit('meeting_rescheduled', { meeting });
        if (empId === 'emp-1') {
            ioInstance.to('user:emp-1').emit('meeting_rescheduled', { meeting });
        }
    }
};
export const emitMeetingCancelled = (meeting) => {
    if (!ioInstance)
        return;
    ioInstance.to('role:admin').to('role:manager').to('role:sales').emit('meeting_cancelled', { meeting });
    if (meeting.employeeId) {
        const empId = String(meeting.employeeId);
        ioInstance.to(`user:${empId}`).emit('meeting_cancelled', { meeting });
        if (empId === 'emp-1') {
            ioInstance.to('user:emp-1').emit('meeting_cancelled', { meeting });
        }
    }
};
export const emitMeetingCompleted = (meeting) => {
    if (!ioInstance)
        return;
    ioInstance.to('role:admin').to('role:manager').to('role:sales').emit('meeting_completed', { meeting });
    if (meeting.employeeId) {
        const empId = String(meeting.employeeId);
        ioInstance.to(`user:${empId}`).emit('meeting_completed', { meeting });
        if (empId === 'emp-1') {
            ioInstance.to('user:emp-1').emit('meeting_completed', { meeting });
        }
    }
};
export const emitNotificationCreated = (notification) => {
    if (!ioInstance)
        return;
    if (notification.recipientId) {
        const rId = String(notification.recipientId);
        ioInstance.to(`user:${rId}`).emit('notification_created', { notification });
        if (rId === 'emp-1' || notification.recipientRole === 'sales') {
            ioInstance.to('user:emp-1').emit('notification_created', { notification });
        }
    }
    if (notification.recipientRole === 'all') {
        ioInstance.emit('notification_created', { notification });
    }
    else if (notification.recipientRole) {
        ioInstance.to(`role:${notification.recipientRole}`).emit('notification_created', { notification });
    }
};
export const emitNotificationRead = (notificationId, recipientId, recipientRole) => {
    if (!ioInstance)
        return;
    if (recipientId) {
        ioInstance.to(`user:${recipientId}`).emit('notification_read', { id: notificationId });
    }
    else if (recipientRole) {
        ioInstance.to(`role:${recipientRole}`).emit('notification_read', { id: notificationId });
    }
    else {
        ioInstance.emit('notification_read', { id: notificationId });
    }
};
export const emitNotificationCountUpdated = (recipientId, recipientRole, unreadCount) => {
    if (!ioInstance)
        return;
    const payload = { unreadCount };
    if (recipientId) {
        ioInstance.to(`user:${recipientId}`).emit('notification_count_updated', payload);
    }
    else if (recipientRole) {
        ioInstance.to(`role:${recipientRole}`).emit('notification_count_updated', payload);
    }
};
export const emitServiceCreated = (service) => {
    if (!ioInstance)
        return;
    ioInstance.emit('service_created', { service });
};
export const emitServiceUpdated = (service) => {
    if (!ioInstance)
        return;
    ioInstance.emit('service_updated', { service });
};
export const emitServiceDeactivated = (serviceId, service) => {
    if (!ioInstance)
        return;
    ioInstance.emit('service_deactivated', { id: serviceId, service });
};
// ----------------- Follow-Up Real-Time Broadcast Helpers -----------------
export const emitFollowUpCreated = (followUp) => {
    if (!ioInstance)
        return;
    ioInstance.to('role:admin').to('role:manager').to('role:sales').emit('followup_created', { followUp });
    if (followUp.employeeId) {
        const empId = String(followUp.employeeId);
        ioInstance.to(`user:${empId}`).emit('followup_created', { followUp });
        if (empId === 'emp-1') {
            ioInstance.to('user:emp-1').emit('followup_created', { followUp });
        }
    }
};
export const emitFollowUpUpdated = (followUp) => {
    if (!ioInstance)
        return;
    ioInstance.to('role:admin').to('role:manager').to('role:sales').emit('followup_updated', { followUp });
    if (followUp.employeeId) {
        const empId = String(followUp.employeeId);
        ioInstance.to(`user:${empId}`).emit('followup_updated', { followUp });
        if (empId === 'emp-1') {
            ioInstance.to('user:emp-1').emit('followup_updated', { followUp });
        }
    }
};
export const emitFollowUpRescheduled = (followUp) => {
    if (!ioInstance)
        return;
    ioInstance.to('role:admin').to('role:manager').to('role:sales').emit('followup_rescheduled', { followUp });
    if (followUp.employeeId) {
        const empId = String(followUp.employeeId);
        ioInstance.to(`user:${empId}`).emit('followup_rescheduled', { followUp });
        if (empId === 'emp-1') {
            ioInstance.to('user:emp-1').emit('followup_rescheduled', { followUp });
        }
    }
};
export const emitFollowUpCompleted = (followUp) => {
    if (!ioInstance)
        return;
    ioInstance.to('role:admin').to('role:manager').to('role:sales').emit('followup_completed', { followUp });
    if (followUp.employeeId) {
        const empId = String(followUp.employeeId);
        ioInstance.to(`user:${empId}`).emit('followup_completed', { followUp });
        if (empId === 'emp-1') {
            ioInstance.to('user:emp-1').emit('followup_completed', { followUp });
        }
    }
};
export const emitFollowUpCancelled = (followUp) => {
    if (!ioInstance)
        return;
    ioInstance.to('role:admin').to('role:manager').to('role:sales').emit('followup_cancelled', { followUp });
    if (followUp.employeeId) {
        const empId = String(followUp.employeeId);
        ioInstance.to(`user:${empId}`).emit('followup_cancelled', { followUp });
        if (empId === 'emp-1') {
            ioInstance.to('user:emp-1').emit('followup_cancelled', { followUp });
        }
    }
};
export const emitFollowUpDeleted = (followUpId) => {
    if (!ioInstance)
        return;
    ioInstance.to('role:admin').to('role:manager').to('role:sales').emit('followup_deleted', { id: followUpId });
};
