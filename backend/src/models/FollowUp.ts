import mongoose, { Schema, Document } from 'mongoose';

export type FollowUpType = 'call' | 'email' | 'whatsapp' | 'meeting' | 'visit';
export type FollowUpStatus = 'pending' | 'completed' | 'rescheduled' | 'cancelled' | 'overdue';
export type FollowUpPriority = 'low' | 'medium' | 'high' | 'urgent';
export type FollowUpOutcome = 'connected' | 'busy' | 'callback_requested' | 'interested' | 'not_interested' | 'converted' | string;

export interface IFollowUpRescheduleHistory {
  previousDateTime: string;
  newDateTime: string;
  rescheduledBy?: string;
  rescheduledByName?: string;
  reason?: string;
  timestamp: Date;
}

export interface IFollowUp extends Document {
  id?: string;
  leadId?: mongoose.Types.ObjectId | string;
  leadName?: string;
  customerId?: mongoose.Types.ObjectId | string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  employeeId: mongoose.Types.ObjectId | string;
  employeeName: string;
  type: FollowUpType;
  scheduledDateTime: string;
  status: FollowUpStatus;
  priority: FollowUpPriority;
  purpose: string;
  notes?: string;
  outcome?: FollowUpOutcome;
  discussionSummary?: string;
  customerFeedback?: string;
  completedAt?: Date;
  completedBy?: string;
  completedByName?: string;
  proofAttachment?: string;
  nextAction?: string;
  rescheduleReason?: string;
  cancellationReason?: string;
  rescheduleHistory: IFollowUpRescheduleHistory[];
  createdBy?: mongoose.Types.ObjectId | string;
  createdByName?: string;
  createdAt: Date;
  updatedAt: Date;
}

const FollowUpRescheduleSchema = new Schema<IFollowUpRescheduleHistory>({
  previousDateTime: { type: String, required: true },
  newDateTime: { type: String, required: true },
  rescheduledBy: { type: String },
  rescheduledByName: { type: String },
  reason: { type: String },
  timestamp: { type: Date, default: Date.now }
});

const FollowUpSchema = new Schema<IFollowUp>(
  {
    leadId: { type: Schema.Types.Mixed, index: true },
    leadName: { type: String },
    customerId: { type: Schema.Types.Mixed, index: true },
    customerName: { type: String, required: true, trim: true },
    customerPhone: { type: String, required: true, trim: true },
    customerEmail: { type: String, trim: true },
    employeeId: { type: Schema.Types.Mixed, required: true, index: true },
    employeeName: { type: String, required: true },
    type: {
      type: String,
      enum: ['call', 'email', 'whatsapp', 'meeting', 'visit'],
      default: 'call',
      index: true
    },
    scheduledDateTime: { type: String, required: true, index: true },
    status: {
      type: String,
      enum: ['pending', 'completed', 'rescheduled', 'cancelled', 'overdue'],
      default: 'pending',
      index: true
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
      index: true
    },
    purpose: { type: String, required: true, trim: true },
    notes: { type: String, trim: true },
    outcome: { type: String },
    discussionSummary: { type: String },
    customerFeedback: { type: String },
    completedAt: { type: Date },
    completedBy: { type: String },
    completedByName: { type: String },
    proofAttachment: { type: String },
    nextAction: { type: String },
    rescheduleReason: { type: String },
    cancellationReason: { type: String },
    rescheduleHistory: [FollowUpRescheduleSchema],
    createdBy: { type: Schema.Types.Mixed, ref: 'User' },
    createdByName: { type: String }
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

export const FollowUp = mongoose.model<IFollowUp>('FollowUp', FollowUpSchema);
