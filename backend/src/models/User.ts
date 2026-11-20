import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: 'admin' | 'manager' | 'sales' | 'customer' | 'provider';
  avatar?: string;
  phone?: string;
  googleId?: string;
  authProvider?: 'local' | 'google' | 'phone';
  department?: string;
  isActive: boolean;
  refreshToken?: string;
  comparePassword(candidate: string): Promise<boolean>;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
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
  },
  { timestamps: true }
);

UserSchema.pre<IUser>('save', async function (next) {
  if (!this.password || !this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password as string, salt);
    next();
  } catch (err: any) {
    next(err);
  }
});

UserSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

export const User = mongoose.model<IUser>('User', UserSchema);
