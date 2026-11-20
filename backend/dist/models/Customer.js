import mongoose, { Schema } from 'mongoose';
const CustomerSchema = new Schema({
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true, unique: true, index: true },
    email: { type: String, trim: true, lowercase: true, index: true },
    address: { type: String, trim: true },
    servicePreferences: [{ type: String }],
    totalBookings: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    loyaltyTier: { type: String, enum: ['Silver', 'Gold', 'Platinum'], default: 'Silver', index: true },
    satisfactionScore: { type: Number, default: 5.0, min: 1, max: 5 },
    notes: [{ type: String }],
    complaints: [
        {
            id: { type: String },
            date: { type: String },
            issue: { type: String },
            status: { type: String, enum: ['open', 'resolved'], default: 'open' }
        }
    ],
    interactionTimeline: []
}, { timestamps: true });
export const Customer = mongoose.model('Customer', CustomerSchema);
