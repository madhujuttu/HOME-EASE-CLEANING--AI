import mongoose, { Schema } from 'mongoose';
const NotificationSchema = new Schema({
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
        type: String,
        enum: ['reminder', 'alert', 'ai', 'booking', 'payment', 'followup'],
        default: 'alert',
        index: true
    },
    timestamp: { type: String, required: true },
    scheduledTime: { type: String, index: true },
    read: { type: Boolean, default: false, index: true },
    link: { type: String },
    recipientRole: { type: String, default: 'admin', index: true },
    recipientId: { type: Schema.Types.Mixed, index: true },
    relatedEntityId: { type: Schema.Types.Mixed, index: true },
    relatedEntityType: { type: String, index: true }
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
export const Notification = mongoose.model('Notification', NotificationSchema);
const AIInsightSchema = new Schema({
    title: { type: String, required: true },
    category: {
        type: String,
        enum: ['lead', 'revenue', 'meeting', 'bottleneck', 'churn'],
        required: true,
        index: true
    },
    description: { type: String, required: true },
    impact: { type: String, enum: ['high', 'medium', 'low'], default: 'medium', index: true },
    metric: { type: String, required: true },
    recommendedAction: { type: String, required: true },
    confidenceScore: { type: Number, default: 90, min: 0, max: 100 },
    timestamp: { type: String, required: true },
    applied: { type: Boolean, default: false }
}, { timestamps: true });
export const AIInsight = mongoose.model('AIInsight', AIInsightSchema);
const AuditLogSchema = new Schema({
    userId: { type: Schema.Types.Mixed },
    userName: { type: String, required: true },
    userRole: { type: String, required: true },
    action: { type: String, required: true, index: true },
    module: { type: String, required: true, index: true },
    details: { type: String, required: true },
    ipAddress: { type: String },
    timestamp: { type: Date, default: Date.now, index: true }
}, { timestamps: true });
export const AuditLog = mongoose.model('AuditLog', AuditLogSchema);
