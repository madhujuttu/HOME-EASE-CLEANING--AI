import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Customer } from '../models/index.js';
import { isConnected } from '../config/db.js';
import { MemoryStore } from '../data/memoryStore.js';

export const getCustomers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { tier, search } = req.query;

    if (!isConnected) {
      let filtered = [...MemoryStore.customers];
      if (tier && tier !== 'all') filtered = filtered.filter(c => c.loyaltyTier === tier);
      if (search) {
        const s = String(search).toLowerCase();
        filtered = filtered.filter(c =>
          c.name.toLowerCase().includes(s) ||
          c.phone.toLowerCase().includes(s) ||
          (c.email && c.email.toLowerCase().includes(s)) ||
          (c.address && c.address.toLowerCase().includes(s))
        );
      }
      res.status(200).json({ success: true, count: filtered.length, customers: filtered });
      return;
    }

    const filter: any = {};
    if (tier && tier !== 'all') filter.loyaltyTier = tier;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } }
      ];
    }

    const customers = await Customer.find(filter).sort({ totalSpent: -1 });
    res.status(200).json({ success: true, count: customers.length, customers });
  } catch (err) {
    next(err);
  }
};

export const getCustomerById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!isConnected) {
      const customer = MemoryStore.customers.find(c => c.id === req.params.id);
      if (!customer) {
        res.status(404).json({ success: false, message: 'Customer not found.' });
        return;
      }
      res.status(200).json({ success: true, customer });
      return;
    }

    let customer: any = null;
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      customer = await Customer.findById(req.params.id);
    }
    if (!customer) {
      res.status(404).json({ success: false, message: 'Customer not found.' });
      return;
    }
    res.status(200).json({ success: true, customer });
  } catch (err) {
    next(err);
  }
};

export const createCustomer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, phone, email, address, servicePreferences, loyaltyTier } = req.body;

    if (!name || !phone) {
      res.status(400).json({ success: false, message: 'Customer name and phone are required.' });
      return;
    }

    if (!isConnected) {
      const newCust = {
        id: `cust-${Date.now()}`,
        name,
        phone,
        email: email || `${name.toLowerCase().replace(/\s+/g, '.')}@client.com`,
        address: address || 'San Francisco, CA',
        servicePreferences: servicePreferences || ['Deep Home Cleaning'],
        loyaltyTier: loyaltyTier || 'Silver',
        totalBookings: 0,
        totalSpent: 0,
        satisfactionScore: 5.0,
        notes: ['Profile created via CRM system.'],
        complaints: [],
        interactionTimeline: [],
        createdAt: new Date().toISOString()
      };
      MemoryStore.customers.unshift(newCust);
      res.status(201).json({ success: true, message: 'Customer created.', customer: newCust });
      return;
    }

    const customer = await Customer.create({
      name,
      phone,
      email: email || `${name.toLowerCase().replace(/\s+/g, '.')}@client.com`,
      address: address || 'San Francisco, CA',
      servicePreferences: servicePreferences || ['Deep Home Cleaning'],
      loyaltyTier: loyaltyTier || 'Silver',
      totalBookings: 0,
      totalSpent: 0,
      notes: ['Profile created via CRM system.'],
      complaints: []
    });

    res.status(201).json({ success: true, message: 'Customer created.', customer });
  } catch (err) {
    next(err);
  }
};

export const updateCustomer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!isConnected) {
      const index = MemoryStore.customers.findIndex(c => c.id === req.params.id);
      if (index === -1) {
        res.status(404).json({ success: false, message: 'Customer not found.' });
        return;
      }
      MemoryStore.customers[index] = { ...MemoryStore.customers[index], ...req.body };
      res.status(200).json({ success: true, message: 'Customer updated.', customer: MemoryStore.customers[index] });
      return;
    }

    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!customer) {
      res.status(404).json({ success: false, message: 'Customer not found.' });
      return;
    }
    res.status(200).json({ success: true, message: 'Customer updated.', customer });
  } catch (err) {
    next(err);
  }
};

export const addCustomerNote = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { note } = req.body;
    if (!note) {
      res.status(400).json({ success: false, message: 'Note text is required.' });
      return;
    }

    if (!isConnected) {
      const customer = MemoryStore.customers.find(c => c.id === req.params.id);
      if (!customer) {
        res.status(404).json({ success: false, message: 'Customer not found.' });
        return;
      }
      customer.notes.unshift(note);
      res.status(200).json({ success: true, message: 'Note added to Customer 360.', customer });
      return;
    }

    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      { $push: { notes: { $each: [note], $position: 0 } } },
      { new: true }
    );

    res.status(200).json({ success: true, message: 'Note added to Customer 360.', customer });
  } catch (err) {
    next(err);
  }
};
