import mongoose, { Schema } from 'mongoose';
const EmployeeSchema = new Schema({
    employeeId: { type: String, trim: true, index: true },
    userId: { type: Schema.Types.Mixed, default: null },
    name: { type: String, required: true, trim: true },
    role: {
        type: String,
        required: true,
        enum: ['Sales Executive', 'Senior Sales Manager', 'Team Lead', 'AI Operations Lead'],
        default: 'Sales Executive'
    },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    team: { type: String, default: 'Residential Metro Hub' },
    assignedLeadsCount: { type: Number, default: 0 },
    closedDeals: { type: Number, default: 0 },
    conversionRate: { type: Number, default: 0 },
    targetRevenue: { type: Number, default: 35000 },
    achievedRevenue: { type: Number, default: 0 },
    status: { type: String, enum: ['active', 'on_call', 'offline'], default: 'active', index: true },
    avatar: { type: String, default: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256' }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
EmployeeSchema.virtual('id').get(function () {
    return this.employeeId || this._id.toHexString();
});
export const Employee = mongoose.model('Employee', EmployeeSchema);
