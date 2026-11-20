import mongoose, { Schema } from 'mongoose';
const InteractionSchema = new Schema({
    type: { type: String, enum: ['call', 'email', 'meeting', 'note', 'whatsapp'], required: true },
    date: { type: String, required: true },
    agentName: { type: String, required: true },
    summary: { type: String, required: true },
    sentiment: { type: String, enum: ['positive', 'neutral', 'negative'], default: 'neutral' }
});
const AssignmentHistorySchema = new Schema({
    previousEmployeeId: { type: String },
    previousEmployeeName: { type: String },
    newEmployeeId: { type: String, required: true },
    newEmployeeName: { type: String, required: true },
    assignedBy: { type: String },
    assignedByName: { type: String },
    timestamp: { type: Date, default: Date.now },
    reason: { type: String }
});
const AuditEntrySchema = new Schema({
    field: { type: String, required: true },
    previousValue: { type: Schema.Types.Mixed },
    newValue: { type: Schema.Types.Mixed },
    changedBy: { type: String },
    changedByName: { type: String },
    timestamp: { type: Date, default: Date.now }
});
const LeadSchema = new Schema({
    name: { type: String, required: true, trim: true },
    company: { type: String, trim: true },
    phone: { type: String, required: true, trim: true, index: true },
    email: { type: String, trim: true, lowercase: true },
    address: { type: String, trim: true },
    serviceId: { type: Schema.Types.Mixed },
    serviceName: { type: String },
    serviceInterest: { type: String, required: true },
    services: [{ type: String }],
    servicePriceSnapshot: { type: Number },
    source: {
        type: String,
        enum: ['Google Ads', 'Website Form', 'Meta Ads', 'Referral', 'AI Inbound Call', 'Walk-in'],
        default: 'Website Form',
        index: true
    },
    assignedEmployeeId: { type: Schema.Types.Mixed, index: true },
    assignedEmployeeName: { type: String },
    status: {
        type: String,
        enum: ['new', 'assigned', 'unassigned', 'qualified', 'converted', 'lost'],
        default: 'new',
        index: true
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium',
        index: true
    },
    customerRequirements: [{ type: String }],
    contactPreference: {
        type: String,
        enum: ['phone', 'email', 'whatsapp'],
        default: 'phone'
    },
    preferredTimeline: { type: String },
    notes: { type: String },
    aiScore: { type: Number, default: 50, min: 0, max: 100, index: true },
    aiConversionProb: { type: Number, default: 45, min: 0, max: 100 },
    aiScoreReason: { type: String },
    interactionHistory: [InteractionSchema],
    assignmentHistory: [AssignmentHistorySchema],
    auditHistory: [AuditEntrySchema],
    createdBy: { type: Schema.Types.Mixed, ref: 'User' },
    createdByName: { type: String },
    updatedBy: { type: Schema.Types.Mixed, ref: 'User' },
    updatedByName: { type: String },
    nextFollowUp: { type: String },
    estimatedValue: { type: Number, default: 350 }
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
export const Lead = mongoose.model('Lead', LeadSchema);
export const Interaction = mongoose.model('Interaction', InteractionSchema);
