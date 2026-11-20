import mongoose, { Schema, Document } from 'mongoose';

export interface IRescheduleHistory {
  previousDateTime: string;
  newDateTime: string;
  rescheduledBy?: string;
  rescheduledByName?: string;
  timestamp: Date;
  reason?: string;
}

export interface IMeetingEditHistory {
  editedBy?: string;
  editedByName?: string;
  timestamp: Date;
  changes?: string;
}

export interface IMeeting extends Document {
  id?: string;
  title: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerId?: mongoose.Types.ObjectId | string;
  leadId?: mongoose.Types.ObjectId | string;
  employeeId: mongoose.Types.ObjectId | string;
  employeeName: string;
  createdBy?: mongoose.Types.ObjectId | string;
  createdByName?: string;
  createdByRole?: string;
  dateTime: string;
  durationMinutes: number;
  type: 'Virtual Video' | 'In-person Site Audit' | 'Phone Consultation';
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'missed' | 'rescheduled' | 'cancelled';
  notes?: string;
  aiSummary?: string;
  outcome?: string;
  discussionSummary?: string;
  customerRequirements?: string[];
  objections?: string[];
  actionItems?: string[];
  agreedActions?: string[];
  suggestedFollowUp?: string;
  nextAction?: string;
  proofAttachment?: string;
  meetingLink?: string;
  rescheduleHistory: IRescheduleHistory[];
  editHistory: IMeetingEditHistory[];
  cancellationReason?: string;
  reminderPreferences?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const RescheduleHistorySchema = new Schema<IRescheduleHistory>({
  previousDateTime: { type: String, required: true },
  newDateTime: { type: String, required: true },
  rescheduledBy: { type: String },
  rescheduledByName: { type: String },
  timestamp: { type: Date, default: Date.now },
  reason: { type: String }
});

const MeetingEditHistorySchema = new Schema<IMeetingEditHistory>({
  editedBy: { type: String },
  editedByName: { type: String },
  timestamp: { type: Date, default: Date.now },
  changes: { type: String }
});

const MeetingSchema = new Schema<IMeeting>(
  {
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

export const Meeting = mongoose.model<IMeeting>('Meeting', MeetingSchema);

export interface ITask extends Document {
  title: string;
  customerName: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'completed' | 'overdue';
  assignedTo: string;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITask>(
  {
    title: { type: String, required: true, trim: true },
    customerName: { type: String, required: true, trim: true },
    dueDate: { type: String, required: true },
    priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium', index: true },
    status: { type: String, enum: ['pending', 'completed', 'overdue'], default: 'pending', index: true },
    assignedTo: { type: String, required: true }
  },
  { timestamps: true }
);

export const Task = mongoose.model<ITask>('Task', TaskSchema);
