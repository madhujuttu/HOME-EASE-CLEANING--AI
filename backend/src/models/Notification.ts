import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  id?: string;
  title: string;
  message: string;
  type: 'reminder' | 'alert' | 'ai' | 'booking' | 'payment' | 'followup';
  timestamp: string;
  scheduledTime?: string;
  read: boolean;
  link?: string;
  recipientRole?: string;
  recipientId?: mongoose.Types.ObjectId | string;
  relatedEntityId?: mongoose.Types.ObjectId | string;
  relatedEntityType?: 'lead' | 'meeting' | 'service' | 'booking' | 'system';
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
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
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id.toString();
        delete ret.__v;
        return ret;
      }
    },
    toObject: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id.toString();
        delete ret.__v;
        return ret;
      }
    }
  }
);

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);

export interface IAIInsight extends Document {
  title: string;
  category: 'lead' | 'revenue' | 'meeting' | 'bottleneck' | 'churn';
  description: string;
  impact: 'high' | 'medium' | 'low';
  metric: string;
  recommendedAction: string;
  confidenceScore: number;
  timestamp: string;
  applied: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AIInsightSchema = new Schema<IAIInsight>(
  {
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
  },
  { timestamps: true }
);

export const AIInsight = mongoose.model<IAIInsight>('AIInsight', AIInsightSchema);

export interface IAuditLog extends Document {
  userId?: mongoose.Types.ObjectId | string;
  userName: string;
  userRole: string;
  action: string;
  module: string;
  details: string;
  ipAddress?: string;
  timestamp: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    userId: { type: Schema.Types.Mixed },
    userName: { type: String, required: true },
    userRole: { type: String, required: true },
    action: { type: String, required: true, index: true },
    module: { type: String, required: true, index: true },
    details: { type: String, required: true },
    ipAddress: { type: String },
    timestamp: { type: Date, default: Date.now, index: true }
  },
  { timestamps: true }
);

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
