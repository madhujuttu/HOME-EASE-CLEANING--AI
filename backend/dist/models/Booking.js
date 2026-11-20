import mongoose, { Schema } from 'mongoose';
const ProviderSchema = new Schema({
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true, index: true },
    email: { type: String, trim: true, lowercase: true },
    avatar: { type: String },
    skills: [{ type: String }],
    verificationStatus: {
        type: String,
        enum: ['verified', 'pending', 'rejected'],
        default: 'verified',
        index: true
    },
    jobsCompleted: { type: Number, default: 0 },
    rating: { type: Number, default: 5.0, min: 1, max: 5 },
    activeJobs: { type: Number, default: 0 },
    availabilityStatus: {
        type: String,
        enum: ['available', 'on_job', 'off_duty'],
        default: 'available',
        index: true
    },
    location: { type: String, default: 'San Francisco Bay Area' },
    joinedDate: { type: String }
}, { timestamps: true });
export const Provider = mongoose.model('Provider', ProviderSchema);
const BookingSchema = new Schema({
    bookingRef: { type: String, required: true, unique: true, index: true },
    customerName: { type: String, required: true, trim: true },
    customerPhone: { type: String, required: true, trim: true },
    customerEmail: { type: String, trim: true, lowercase: true },
    customerAddress: { type: String, required: true },
    propertyType: {
        type: String,
        enum: ['Apartment', 'Villa', 'Independent House', 'Commercial Office'],
        default: 'Apartment'
    },
    serviceId: { type: Schema.Types.Mixed, ref: 'Service', required: true },
    serviceName: { type: String, required: true },
    subserviceId: { type: String },
    subserviceName: { type: String },
    serviceCategory: { type: String },
    timeSlot: { type: String, default: 'Morning (09:00 AM - 11:00 AM)' },
    problemImages: [{ type: String }],
    providerId: { type: Schema.Types.Mixed, ref: 'Provider' },
    providerName: { type: String },
    providerPhone: { type: String },
    dateTime: { type: String, required: true, index: true },
    status: {
        type: String,
        enum: [
            'pending',
            'confirmed',
            'assigned',
            'accepted',
            'on_the_way',
            'in_progress',
            'completed',
            'payment_pending',
            'paid',
            'cancelled',
            'rejected'
        ],
        default: 'confirmed',
        index: true
    },
    amount: { type: Number, required: true, min: 0 },
    pricingBreakdown: {
        basePrice: { type: Number },
        materialCharges: { type: Number, default: 0 },
        inspectionCharges: { type: Number, default: 0 },
        emergencyCharges: { type: Number, default: 0 },
        taxAmount: { type: Number, default: 0 },
        discountAmount: { type: Number, default: 0 },
        finalAmount: { type: Number }
    },
    paymentMethod: {
        type: String,
        enum: ['Cash on Service', 'UPI', 'Online / Card'],
        default: 'Online / Card'
    },
    paymentStatus: {
        type: String,
        enum: ['paid', 'pending', 'refunded'],
        default: 'paid',
        index: true
    },
    notes: { type: String, default: 'Standard booking' },
    trackingStep: { type: Number, default: 1, min: 1, max: 11 },
    statusHistory: [
        {
            status: { type: String },
            timestamp: { type: Date, default: Date.now },
            note: { type: String },
            updatedBy: { type: String }
        }
    ],
    review: {
        rating: { type: Number, min: 1, max: 5 },
        comment: { type: String },
        createdAt: { type: Date, default: Date.now },
        images: [{ type: String }]
    }
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: (_doc, ret) => {
            ret.id = ret._id ? ret._id.toString() : ret.bookingRef;
            delete ret.__v;
            return ret;
        }
    },
    toObject: {
        virtuals: true,
        transform: (_doc, ret) => {
            ret.id = ret._id ? ret._id.toString() : ret.bookingRef;
            delete ret.__v;
            return ret;
        }
    }
});
export const Booking = mongoose.model('Booking', BookingSchema);
