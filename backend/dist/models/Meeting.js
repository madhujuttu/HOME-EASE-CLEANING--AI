import mongoose, { Schema } from 'mongoose';
const RescheduleHistorySchema = new Schema({
    previousDateTime: { type: String, required: true },
    newDateTime: { type: String, required: true },
    rescheduledBy: { type: String },
    rescheduledByName: { type: String },
    timestamp: { type: Date, default: Date.now },
    reason: { type: String }
});
const MeetingEditHistorySchema = new Schema({
    editedBy: { type: String },
    editedByName: { type: String },
    timestamp: { type: Date, default: Date.now },
    changes: { type: String }
});
const MeetingSchema = new Schema({
    title: { type: String, required: true, trim: true },
    customerName: { type: String, required: true, trim: true },
    customerPhone: { type: String, required: true, trim: true },
    customerEmail: { type: String, trim: true },
    customerId: { type: Schema.Types.Mixed },
    leadId: { type: Schema.Types.Mixed },
    employeeId: { type: Schema.Types.Mixed, required: true, index: true },
    employeeName: { type: String, required: true },
    createdBy: { type: Schema.Types.Mixed },
    createdByName: { type: String },
    createdByRole: { type: String },
    dateTime: { type: String, required: true, index: true },
    durationMinutes: { type: Number, default: 30 },
    type: {
        type: String,
        enum: ['Virtual Video', 'In-person Site Audit', 'Phone Consultation'],
        default: 'Virtual Video'
    },
    status: {
        type: String,
        enum: ['scheduled', 'confirmed', 'in_progress', 'completed', 'missed', 'rescheduled', 'cancelled'],
        default: 'scheduled',
        index: true
    },
    notes: { type: String },
    aiSummary: { type: String },
    outcome: { type: String },
    discussionSummary: { type: String },
    customerRequirements: [{ type: String }],
    objections: [{ type: String }],
    actionItems: [{ type: String }],
    agreedActions: [{ type: String }],
    suggestedFollowUp: { type: String },
    nextAction: { type: String },
    proofAttachment: { type: String },
    meetingLink: { type: String },
    rescheduleHistory: [RescheduleHistorySchema],
    editHistory: [MeetingEditHistorySchema],
    cancellationReason: { type: String },
    reminderPreferences: [{ type: String }]
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: (_doc, ret) => {
            ret.id = ret._id.toString();
            delete ret.__v;
            return ret;
        }
    },
    toObject: {
        virtuals: true,
        transform: (_doc, ret) => {
            ret.id = ret._id.toString();
            delete ret.__v;
            return ret;
        }
    }
});
export const Meeting = mongoose.model('Meeting', MeetingSchema);
const TaskSchema = new Schema({
    title: { type: String, required: true, trim: true },
    customerName: { type: String, required: true, trim: true },
    dueDate: { type: String, required: true },
    priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium', index: true },
    status: { type: String, enum: ['pending', 'completed', 'overdue'], default: 'pending', index: true },
    assignedTo: { type: String, required: true }
}, { timestamps: true });
export const Task = mongoose.model('Task', TaskSchema);
