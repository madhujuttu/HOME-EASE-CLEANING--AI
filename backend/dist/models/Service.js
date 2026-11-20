import mongoose, { Schema } from 'mongoose';
const CategorySchema = new Schema({
    name: { type: String, required: true, unique: true, trim: true },
    icon: { type: String, default: 'Sparkles' },
    description: { type: String, trim: true },
    serviceCount: { type: Number, default: 0 }
}, { timestamps: true });
export const Category = mongoose.model('Category', CategorySchema);
const ServiceSchema = new Schema({
    categoryId: { type: Schema.Types.Mixed, ref: 'Category', required: true, index: true },
    categoryName: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    pricingType: { type: String, enum: ['fixed', 'starting_from', 'hourly', 'unit', 'sqft'], default: 'fixed' },
    duration: { type: String, default: '1 - 2 Hours' },
    estimatedDuration: { type: String },
    availability: { type: String, default: 'Daily, 8 AM - 8 PM' },
    image: { type: String },
    imageUrl: { type: String },
    imageStorageKey: { type: String },
    features: [{ type: String }],
    inclusions: [{ type: String }],
    exclusions: [{ type: String }],
    inspectionCharges: { type: Number, default: 150 },
    materialCharges: { type: Number, default: 0 },
    emergencyCharges: { type: Number, default: 0 },
    discountPercentage: { type: Number, default: 0 },
    taxRate: { type: Number, default: 18 },
    popular: { type: Boolean, default: false },
    status: { type: String, enum: ['active', 'inactive'], default: 'active', index: true },
    createdBy: { type: Schema.Types.Mixed, ref: 'User' }
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: (_doc, ret) => {
            ret.id = ret._id.toString();
            // ensure image and imageUrl are synced
            ret.imageUrl = ret.imageUrl || ret.image;
            ret.image = ret.image || ret.imageUrl;
            delete ret.__v;
            return ret;
        }
    },
    toObject: {
        virtuals: true,
        transform: (_doc, ret) => {
            ret.id = ret._id.toString();
            ret.imageUrl = ret.imageUrl || ret.image;
            ret.image = ret.image || ret.imageUrl;
            delete ret.__v;
            return ret;
        }
    }
});
export const Service = mongoose.model('Service', ServiceSchema);
