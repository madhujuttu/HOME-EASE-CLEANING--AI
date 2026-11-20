import mongoose, { Schema } from 'mongoose';
const TranscriptLineSchema = new Schema({
    speaker: { type: String, required: true },
    text: { type: String, required: true },
    time: { type: String, required: true }
});
const CallLogSchema = new Schema({
    callRef: { type: String, required: true, unique: true, index: true },
    type: { type: String, enum: ['inbound', 'outbound'], required: true, index: true },
    customerName: { type: String, required: true },
    phone: { type: String, required: true, index: true },
    durationSeconds: { type: Number, default: 0 },
    status: {
        type: String,
        enum: ['scheduled', 'initiated', 'ringing', 'connected', 'completed', 'failed', 'no_answer'],
        default: 'completed',
        index: true
    },
    timestamp: { type: String, required: true },
    agentType: { type: String, enum: ['ai_voice', 'human_sales'], default: 'ai_voice' },
    agentName: { type: String, required: true },
    sentiment: {
        type: String,
        enum: ['positive', 'neutral', 'hesitant', 'frustrated'],
        default: 'positive'
    },
    consentGiven: { type: Boolean, default: true },
    transcript: [TranscriptLineSchema],
    summary: { type: String },
    extractedRequirements: [{ type: String }],
    recommendedAction: { type: String },
    recordingSimulationUrl: { type: String },
    cost: { type: Number, default: 0.12 }
}, { timestamps: true });
export const CallLog = mongoose.model('CallLog', CallLogSchema);
const CallConsentSchema = new Schema({
    phoneNumber: { type: String, required: true, index: true },
    customerName: { type: String, required: true },
    consentType: { type: String, enum: ['tcpa_call', 'recording', 'marketing_sms'], required: true },
    consentGranted: { type: Boolean, default: true },
    ipAddress: { type: String },
    source: { type: String, default: 'IVR Speech Confirmation' },
    timestamp: { type: Date, default: Date.now }
}, { timestamps: true });
export const CallConsent = mongoose.model('CallConsent', CallConsentSchema);
const PaymentSchema = new Schema({
    paymentRef: { type: String, required: true, unique: true, index: true },
    invoiceNumber: { type: String, required: true, unique: true, index: true },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    method: {
        type: String,
        enum: ['Credit Card', 'UPI', 'Net Banking', 'Cash on Service', 'Stripe'],
        default: 'Credit Card'
    },
    status: {
        type: String,
        enum: ['completed', 'pending', 'refunded', 'failed'],
        default: 'completed',
        index: true
    },
    date: { type: String, required: true },
    serviceName: { type: String, required: true },
    providerPayout: { type: Number, default: 0 },
    receiptNumber: { type: String, required: true },
    refundReason: { type: String }
}, { timestamps: true });
export const Payment = mongoose.model('Payment', PaymentSchema);
