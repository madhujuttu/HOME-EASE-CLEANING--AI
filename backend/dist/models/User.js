import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
const UserSchema = new Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    password: { type: String, select: false },
    role: {
        type: String,
        required: true,
        enum: ['admin', 'manager', 'sales', 'customer', 'provider'],
        default: 'customer',
        index: true
    },
    avatar: { type: String },
    phone: { type: String, trim: true, index: true },
    googleId: { type: String, trim: true, index: true },
    authProvider: { type: String, enum: ['local', 'google', 'phone'], default: 'local' },
    department: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    refreshToken: { type: String, select: false }
}, { timestamps: true });
UserSchema.pre('save', async function (next) {
    if (!this.password || !this.isModified('password'))
        return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    }
    catch (err) {
        next(err);
    }
});
UserSchema.methods.comparePassword = async function (candidate) {
    return bcrypt.compare(candidate, this.password);
};
export const User = mongoose.model('User', UserSchema);
