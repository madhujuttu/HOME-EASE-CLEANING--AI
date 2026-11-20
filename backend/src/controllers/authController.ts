import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser, Customer } from '../models/index.js';
import { AuthRequest } from '../middleware/auth.js';
import { isConnected } from '../config/db.js';
import { MemoryStore } from '../data/memoryStore.js';

// In-memory OTP storage for phone verification
interface OtpEntry {
  code: string;
  expiresAt: number;
}
const phoneOtpStore = new Map<string, OtpEntry>();

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, password, role, phone, department, address, propertyType, preferredService } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
      return;
    }

    // STRICT SYSTEM RULE: Employees must be created by Admin!
    // Public registration is strictly restricted to customers.
    if (role && role !== 'customer') {
      res.status(403).json({
        success: false,
        message: 'Employee and staff accounts must be created directly by an Administrator. Please sign up as a customer or contact your system administrator.'
      });
      return;
    }

    const assignedRole: 'customer' = 'customer';

    if (!isConnected) {
      const existing = MemoryStore.users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (existing) {
        res.status(409).json({ success: false, message: 'An account with this email already exists.' });
        return;
      }
      const newUser = {
        id: `usr-${Date.now()}`,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role: 'customer' as const,
        phone: phone?.trim(),
        department: 'Residential Client'
      };
      MemoryStore.users.push(newUser);

      // Also register in MemoryStore customers
      const newCust = {
        id: `cust-${Date.now()}`,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone?.trim() || '+1 (555) 014-9921',
        address: address?.trim() || 'Address on file',
        servicePreferences: [preferredService || 'Ultra Deep Villa Sanitization'],
        loyaltyTier: 'Silver',
        totalSpent: 0,
        totalBookings: 0,
        notes: `Property: ${propertyType || 'Residential'}`,
        createdAt: new Date().toISOString()
      };
      MemoryStore.customers.unshift(newCust as any);

      const secret = process.env.JWT_SECRET || 'homeeaseguru_enterprise_jwt_super_secret_key_2026';
      const token = jwt.sign(
        { id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name },
        secret,
        { expiresIn: '7d' }
      );
      res.status(201).json({
        success: true,
        message: 'Customer account successfully registered.',
        token,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          phone: newUser.phone
        }
      });
      return;
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      res.status(409).json({ success: false, message: 'An account with this email already exists.' });
      return;
    }

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: assignedRole,
      phone: phone?.trim(),
      department: 'Residential Client'
    });

    // Also create customer entity in Customer collection if available
    try {
      await Customer.create({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone?.trim() || '+1 (555) 014-9921',
        address: address?.trim() || 'Address on file',
        servicePreferences: [preferredService || 'Ultra Deep Villa Sanitization'],
        loyaltyTier: 'Silver',
        totalSpent: 0,
        totalBookings: 0,
        notes: `Property: ${propertyType || 'Residential'}`
      });
    } catch {}

    const secret = process.env.JWT_SECRET || 'homeeaseguru_enterprise_jwt_super_secret_key_2026';
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role, name: user.name },
      secret,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Customer account successfully registered.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone
      }
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Email and password are required.' });
      return;
    }

    const cleanEmail = email.toLowerCase().trim();

    if (!isConnected) {
      const user = MemoryStore.users.find(u => u.email.toLowerCase() === cleanEmail);
      if (!user || user.password !== password) {
        res.status(401).json({ success: false, message: 'Invalid email or password.' });
        return;
      }
      const secret = process.env.JWT_SECRET || 'homeeaseguru_enterprise_jwt_super_secret_key_2026';
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role, name: user.name },
        secret,
        { expiresIn: '7d' }
      );
      res.status(200).json({
        success: true,
        message: 'Login successful.',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          phone: user.phone
        }
      });
      return;
    }

    const user = await User.findOne({ email: cleanEmail }).select('+password');
    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    const secret = process.env.JWT_SECRET || 'homeeaseguru_enterprise_jwt_super_secret_key_2026';
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role, name: user.name },
      secret,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Send Phone OTP for customer login
 */
export const sendPhoneOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { phone } = req.body;
    if (!phone || !phone.trim()) {
      res.status(400).json({ success: false, message: 'Phone number is required.' });
      return;
    }

    const cleanPhone = phone.trim();
    // Deterministic demo OTP or random 6-digit code
    const code = '123456';
    phoneOtpStore.set(cleanPhone, {
      code,
      expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes
    });

    console.log(`[Auth] Customer Phone OTP requested for ${cleanPhone}: OTP code ${code}`);

    res.status(200).json({
      success: true,
      message: `Verification code sent to ${cleanPhone}. Use OTP: ${code} to sign in.`,
      phone: cleanPhone,
      otp: code
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Login or Auto-Register Customer using Phone Number & OTP
 */
export const loginWithPhone = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { phone, otp, name } = req.body;

    if (!phone || !phone.trim()) {
      res.status(400).json({ success: false, message: 'Phone number is required.' });
      return;
    }

    if (!otp || !otp.trim()) {
      res.status(400).json({ success: false, message: 'Verification OTP code is required.' });
      return;
    }

    const cleanPhone = phone.trim();
    const stored = phoneOtpStore.get(cleanPhone);

    // Accept stored OTP or default demo OTP 123456
    const isValidOtp = otp.trim() === '123456' || (stored && stored.code === otp.trim() && stored.expiresAt > Date.now());
    if (!isValidOtp) {
      res.status(400).json({ success: false, message: 'Invalid or expired OTP code. Use demo code 123456.' });
      return;
    }

    // Phone number normalized for lookup
    const digitsOnly = cleanPhone.replace(/[^0-9]/g, '');
    const lastDigits = digitsOnly.slice(-10);

    let user: any = null;

    if (!isConnected) {
      user = MemoryStore.users.find(u => {
        if (!u.phone) return false;
        const uDigits = u.phone.replace(/[^0-9]/g, '');
        return u.phone === cleanPhone || (lastDigits.length >= 7 && uDigits.endsWith(lastDigits));
      });

      if (!user) {
        user = {
          id: `usr-cust-${Date.now()}`,
          name: name?.trim() || `Client ${lastDigits.slice(-4) || '9921'}`,
          email: `${digitsOnly || Date.now()}@customer.homeeaseguru.com`,
          phone: cleanPhone,
          role: 'customer' as const,
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=256',
          department: 'Residential Client'
        };
        MemoryStore.users.push(user);
      }
    } else {
      user = await User.findOne({
        $or: [
          { phone: cleanPhone },
          { phone: { $regex: lastDigits } }
        ]
      });

      if (!user) {
        user = await User.create({
          name: name?.trim() || `Client ${lastDigits.slice(-4) || '9921'}`,
          email: `${digitsOnly || Date.now()}@customer.homeeaseguru.com`,
          phone: cleanPhone,
          role: 'customer',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=256',
          department: 'Residential Client',
          authProvider: 'phone'
        });
      }
    }

    // Strictly enforce: Phone OTP is for customers only
    if (user && (user.role === 'admin' || user.role === 'manager' || user.role === 'sales')) {
      res.status(403).json({
        success: false,
        message: 'Phone OTP sign-in is reserved for customers only. Administrators and Sales employees must sign in using corporate email and password.'
      });
      return;
    }

    const secret = process.env.JWT_SECRET || 'homeeaseguru_enterprise_jwt_super_secret_key_2026';
    const token = jwt.sign(
      { id: user.id || user._id, email: user.email, role: user.role, name: user.name },
      secret,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      success: true,
      message: 'Phone authentication verified.',
      token,
      user: {
        id: user.id || user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || cleanPhone,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Login or Auto-Register Customer using Google OAuth Profile
 */
export const loginWithGoogle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, name, googleId, avatar } = req.body;

    if (!email || !email.trim()) {
      res.status(400).json({ success: false, message: 'Google account email is required.' });
      return;
    }

    const cleanEmail = email.toLowerCase().trim();
    let user: any = null;

    if (!isConnected) {
      user = MemoryStore.users.find(u => u.email.toLowerCase() === cleanEmail);
      if (!user) {
        user = {
          id: `usr-google-${Date.now()}`,
          name: name?.trim() || 'Google User',
          email: cleanEmail,
          role: 'customer' as const,
          avatar: avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=256',
          department: 'Residential Client'
        };
        MemoryStore.users.push(user);
      }
    } else {
      user = await User.findOne({
        $or: [
          { email: cleanEmail },
          ...(googleId ? [{ googleId }] : [])
        ]
      });

      if (!user) {
        user = await User.create({
          name: name?.trim() || 'Google User',
          email: cleanEmail,
          role: 'customer',
          avatar: avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=256',
          department: 'Residential Client',
          googleId: googleId || `goog_${Date.now()}`,
          authProvider: 'google'
        });
      }
    }

    // Strictly enforce: Google OAuth is for customers only
    if (user && (user.role === 'admin' || user.role === 'manager' || user.role === 'sales')) {
      res.status(403).json({
        success: false,
        message: 'Google sign-in is reserved for customers only. Administrators and Sales employees must sign in using corporate email and password.'
      });
      return;
    }

    const secret = process.env.JWT_SECRET || 'homeeaseguru_enterprise_jwt_super_secret_key_2026';
    const token = jwt.sign(
      { id: user.id || user._id, email: user.email, role: user.role, name: user.name },
      secret,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      success: true,
      message: 'Google authentication successful.',
      token,
      user: {
        id: user.id || user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone
      }
    });
  } catch (err) {
    next(err);
  }
};

export const getMe = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!isConnected) {
      const user = MemoryStore.users.find(u => u.id === req.user?.id) || req.user;
      res.status(200).json({ success: true, user });
      return;
    }

    const user = await User.findById(req.user?.id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User profile not found.' });
      return;
    }
    res.status(200).json({ success: true, user });
  } catch (err) {
    next(err);
  }
};
