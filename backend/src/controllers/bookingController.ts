import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Booking, Provider, Payment, Notification } from '../models/index.js';
import { AutomationEngine } from '../services/automationEngine.js';
import { isConnected } from '../config/db.js';
import { MemoryStore } from '../data/memoryStore.js';
import {
  emitBookingCreated,
  emitBookingUpdated,
  emitNotificationCreated
} from '../sockets/socketHandler.js';

export const getBookings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status, customerPhone } = req.query;

    if (!isConnected) {
      let filtered = [...MemoryStore.bookings];
      if (status && status !== 'all') filtered = filtered.filter(b => b.status === status);
      if (customerPhone) filtered = filtered.filter(b => b.customerPhone === customerPhone);
      res.status(200).json({ success: true, count: filtered.length, bookings: filtered });
      return;
    }

    const filter: any = {};
    if (status && status !== 'all') filter.status = status;
    if (customerPhone) filter.customerPhone = customerPhone;

    const bookings = await Booking.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: bookings.length, bookings });
  } catch (err) {
    next(err);
  }
};

export const createBooking = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      customerName,
      customerPhone,
      customerEmail,
      customerAddress,
      propertyType,
      serviceId,
      serviceName,
      subserviceId,
      subserviceName,
      serviceCategory,
      dateTime,
      timeSlot,
      amount,
      pricingBreakdown,
      paymentMethod,
      problemImages,
      notes,
      providerId
    } = req.body;

    const bookingRef = `BK-${Math.floor(8830 + Math.random() * 999)}`;
    const finalAmount = Number(amount) || Number(pricingBreakdown?.finalAmount) || 349;
    const finalMethod = paymentMethod || 'Online / Card';
    const initStatus = providerId ? 'assigned' : 'confirmed';

    if (!isConnected) {
      const prov = MemoryStore.providers.find(p => p.id === providerId);
      const newBooking = {
        id: bookingRef,
        bookingRef,
        customerName: customerName || 'Valued Customer',
        customerPhone: customerPhone || '+1 (555) 000-0000',
        customerEmail: customerEmail || 'customer@client.com',
        customerAddress: customerAddress || '742 Evergreen Terrace, Pasadena, CA',
        propertyType: propertyType || 'Apartment',
        serviceId: serviceId || 'srv-clean-1',
        serviceName: serviceName || subserviceName || 'Full Home Deep Cleaning',
        subserviceId,
        subserviceName: subserviceName || serviceName,
        serviceCategory: serviceCategory || 'Home Cleaning Services',
        providerId,
        providerName: prov?.name,
        providerPhone: prov?.phone,
        dateTime: dateTime || new Date().toISOString().slice(0, 16).replace('T', ' '),
        timeSlot: timeSlot || 'Morning (09:00 AM - 11:00 AM)',
        problemImages: problemImages || [],
        amount: finalAmount,
        pricingBreakdown: pricingBreakdown || {
          basePrice: finalAmount,
          materialCharges: 0,
          inspectionCharges: 0,
          emergencyCharges: 0,
          taxAmount: Math.round(finalAmount * 0.18),
          discountAmount: 0,
          finalAmount
        },
        paymentMethod: finalMethod,
        paymentStatus: finalMethod === 'Cash on Service' ? ('pending' as const) : ('paid' as const),
        status: initStatus as any,
        notes: notes || 'Booked online',
        trackingStep: providerId ? 3 : 2,
        statusHistory: [
          {
            status: initStatus,
            timestamp: new Date().toISOString(),
            note: 'Booking successfully confirmed and logged into dispatch system'
          }
        ],
        createdAt: new Date().toISOString()
      };
      MemoryStore.bookings.unshift(newBooking as any);

      const newPayment = {
        id: `PAY-${Math.floor(4100 + Math.random() * 900)}`,
        invoiceNumber: `INV-2026-${Math.floor(1150 + Math.random() * 800)}`,
        customerName: newBooking.customerName,
        customerEmail: newBooking.customerEmail,
        amount: newBooking.amount,
        method: finalMethod === 'Cash on Service' ? ('Cash on Service' as const) : ('UPI' as const),
        status: finalMethod === 'Cash on Service' ? ('pending' as const) : ('completed' as const),
        date: new Date().toISOString().slice(0, 16).replace('T', ' '),
        serviceName: newBooking.serviceName,
        providerPayout: Math.round(newBooking.amount * 0.7),
        receiptNumber: `RCP-${Math.floor(889300 + Math.random() * 1000)}`
      };
      MemoryStore.payments.unshift(newPayment);

      emitBookingCreated(newBooking);

      const notifSales = {
        id: `notif-${Date.now()}-sales`,
        title: 'New Service Booking Received',
        message: `New booking for ${newBooking.customerName} (${newBooking.serviceName}) scheduled for ${newBooking.dateTime}.`,
        type: 'booking',
        scheduledTime: newBooking.dateTime,
        timestamp: newBooking.dateTime,
        read: false,
        recipientRole: 'sales',
        relatedEntityId: newBooking.id,
        relatedEntityType: 'booking',
        link: '/sales/meetings',
        createdAt: new Date().toISOString()
      };
      MemoryStore.notifications.unshift(notifSales as any);
      emitNotificationCreated(notifSales);

      const notifMgr = {
        id: `notif-${Date.now()}-mgr`,
        title: 'New Service Booking Received',
        message: `Booking #${newBooking.bookingRef} for ${newBooking.customerName} (${newBooking.serviceName}) scheduled for ${newBooking.dateTime}.`,
        type: 'booking',
        scheduledTime: newBooking.dateTime,
        timestamp: newBooking.dateTime,
        read: false,
        recipientRole: 'manager',
        relatedEntityId: newBooking.id,
        relatedEntityType: 'booking',
        link: '/admin/bookings',
        createdAt: new Date().toISOString()
      };
      MemoryStore.notifications.unshift(notifMgr as any);
      emitNotificationCreated(notifMgr);

      const notifAdmin = {
        id: `notif-${Date.now()}-admin`,
        title: 'New Service Booking Received',
        message: `Booking #${newBooking.bookingRef} for ${newBooking.customerName} (${newBooking.serviceName}) scheduled for ${newBooking.dateTime}.`,
        type: 'booking',
        scheduledTime: newBooking.dateTime,
        timestamp: newBooking.dateTime,
        read: false,
        recipientRole: 'admin',
        relatedEntityId: newBooking.id,
        relatedEntityType: 'booking',
        link: '/admin/bookings',
        createdAt: new Date().toISOString()
      };
      MemoryStore.notifications.unshift(notifAdmin as any);
      emitNotificationCreated(notifAdmin);

      await AutomationEngine.trigger({ event: 'booking_confirmed', payload: newBooking });
      res.status(201).json({ success: true, message: 'Booking confirmed & dispatched.', booking: newBooking });
      return;
    }

    const booking = await Booking.create({
      bookingRef,
      customerName: customerName || 'Valued Customer',
      customerPhone: customerPhone || '+1 (555) 000-0000',
      customerEmail: customerEmail || 'customer@client.com',
      customerAddress: customerAddress || '742 Evergreen Terrace, Pasadena, CA',
      propertyType: propertyType || 'Apartment',
      serviceId: serviceId || 'srv-clean-1',
      serviceName: serviceName || subserviceName || 'Full Home Deep Cleaning',
      subserviceId,
      subserviceName: subserviceName || serviceName,
      serviceCategory: serviceCategory || 'Home Cleaning Services',
      providerId,
      dateTime: dateTime || new Date().toISOString().slice(0, 16).replace('T', ' '),
      timeSlot: timeSlot || 'Morning (09:00 AM - 11:00 AM)',
      problemImages: problemImages || [],
      amount: finalAmount,
      pricingBreakdown: pricingBreakdown || {
        basePrice: finalAmount,
        materialCharges: 0,
        inspectionCharges: 0,
        emergencyCharges: 0,
        taxAmount: Math.round(finalAmount * 0.18),
        discountAmount: 0,
        finalAmount
      },
      paymentMethod: finalMethod,
      paymentStatus: finalMethod === 'Cash on Service' ? 'pending' : 'paid',
      status: initStatus,
      notes: notes || 'Booked online',
      trackingStep: providerId ? 3 : 2,
      statusHistory: [
        {
          status: initStatus,
          timestamp: new Date(),
          note: 'Booking successfully confirmed and logged into dispatch system'
        }
      ]
    });

    // Create payment ledger record
    await Payment.create({
      paymentRef: `PAY-${Math.floor(4100 + Math.random() * 900)}`,
      invoiceNumber: `INV-2026-${Math.floor(1150 + Math.random() * 800)}`,
      customerName: booking.customerName,
      customerEmail: booking.customerEmail || 'customer@example.com',
      amount: booking.amount,
      method: finalMethod === 'Cash on Service' ? 'Cash on Service' : 'UPI',
      status: finalMethod === 'Cash on Service' ? 'pending' : 'completed',
      date: new Date().toISOString().slice(0, 16).replace('T', ' '),
      serviceName: booking.serviceName,
      providerPayout: Math.round(booking.amount * 0.7),
      receiptNumber: `RCP-${Math.floor(889300 + Math.random() * 1000)}`
    });

    // Broadcast real-time booking event to sales, admin, and customer
    emitBookingCreated(booking);

    // Create persistent notifications for sales, manager, and admin
    try {
      const salesNotif = await Notification.create({
        title: 'New Service Booking Received',
        message: `New booking for ${booking.customerName} (${booking.serviceName}) scheduled for ${booking.dateTime}.`,
        type: 'booking',
        scheduledTime: booking.dateTime,
        timestamp: booking.dateTime,
        read: false,
        recipientRole: 'sales',
        relatedEntityId: booking._id,
        relatedEntityType: 'booking',
        link: '/sales/meetings'
      });
      emitNotificationCreated(salesNotif);

      const mgrNotif = await Notification.create({
        title: 'New Service Booking Received',
        message: `Booking #${bookingRef} for ${booking.customerName} (${booking.serviceName}) scheduled for ${booking.dateTime} (${booking.timeSlot || 'Standard Slot'}).`,
        type: 'booking',
        scheduledTime: booking.dateTime,
        timestamp: booking.dateTime,
        read: false,
        recipientRole: 'manager',
        relatedEntityId: booking._id,
        relatedEntityType: 'booking',
        link: '/admin/bookings'
      });
      emitNotificationCreated(mgrNotif);

      const adminNotif = await Notification.create({
        title: 'New Service Booking Received',
        message: `Booking #${bookingRef} for ${booking.customerName} (${booking.serviceName}) scheduled for ${booking.dateTime} (${booking.timeSlot || 'Standard Slot'}).`,
        type: 'booking',
        scheduledTime: booking.dateTime,
        timestamp: booking.dateTime,
        read: false,
        recipientRole: 'admin',
        relatedEntityId: booking._id,
        relatedEntityType: 'booking',
        link: '/admin/bookings'
      });
      emitNotificationCreated(adminNotif);
    } catch {}

    // Trigger Central Automation Engine
    await AutomationEngine.trigger({
      event: 'booking_confirmed',
      payload: booking
    });

    res.status(201).json({ success: true, message: 'Booking confirmed & dispatched.', booking });
  } catch (err) {
    next(err);
  }
};

export const updateBookingStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status, providerId, note } = req.body;
    const stepMap: Record<string, number> = {
      pending: 1,
      confirmed: 2,
      assigned: 3,
      accepted: 4,
      on_the_way: 5,
      in_progress: 6,
      completed: 7,
      payment_pending: 8,
      paid: 9,
      cancelled: 10,
      rejected: 11
    };

    if (!isConnected) {
      const booking: any = MemoryStore.bookings.find(b => b.id === req.params.id);
      if (!booking) {
        res.status(404).json({ success: false, message: 'Booking not found.' });
        return;
      }
      if (status) {
        booking.status = status;
        booking.trackingStep = stepMap[status] || booking.trackingStep || 1;
        booking.statusHistory = booking.statusHistory || [];
        booking.statusHistory.push({
          status,
          timestamp: new Date().toISOString(),
          note: note || `Status transitioned to ${status}`
        });
      }
      if (providerId) {
        const prov = MemoryStore.providers.find(p => p.id === providerId);
        booking.providerId = providerId;
        booking.providerName = prov?.name;
        booking.providerPhone = prov?.phone;
        booking.status = 'assigned';
        booking.trackingStep = 3;
        booking.statusHistory = booking.statusHistory || [];
        booking.statusHistory.push({
          status: 'assigned',
          timestamp: new Date().toISOString(),
          note: `Technician ${prov?.name || providerId} assigned to dispatch`
        });
      }
      emitBookingUpdated(booking);
      res.status(200).json({ success: true, message: 'Booking status updated.', booking });
      return;
    }

    const updateData: any = {};
    if (status) {
      updateData.status = status;
      updateData.trackingStep = stepMap[status] || 1;
      updateData.$push = updateData.$push || {};
      updateData.$push.statusHistory = {
        status,
        timestamp: new Date(),
        note: note || `Status transitioned to ${status}`
      };
    }

    if (providerId) {
      let prov = null;
      if (mongoose.Types.ObjectId.isValid(providerId)) {
        prov = await Provider.findById(providerId);
      }
      updateData.providerId = providerId;
      updateData.providerName = prov?.name || providerId;
      updateData.providerPhone = prov?.phone || '';
      updateData.status = 'assigned';
      updateData.trackingStep = 3;
      updateData.$push = updateData.$push || {};
      updateData.$push.statusHistory = {
        status: 'assigned',
        timestamp: new Date(),
        note: `Technician ${prov?.name || providerId} assigned to dispatch`
      };
    }

    let booking: any = null;
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      booking = await Booking.findByIdAndUpdate(req.params.id, updateData, { new: true });
    }
    if (!booking) {
      booking = await Booking.findOneAndUpdate({ bookingRef: req.params.id }, updateData, { new: true });
    }

    if (!booking) {
      res.status(404).json({ success: false, message: 'Booking not found.' });
      return;
    }

    emitBookingUpdated(booking);
    res.status(200).json({ success: true, message: 'Booking status updated.', booking });
  } catch (err) {
    next(err);
  }
};

export const addBookingReview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { rating, comment, images } = req.body;
    const ratingNum = Math.min(5, Math.max(1, Number(rating) || 5));

    if (!isConnected) {
      const booking: any = MemoryStore.bookings.find(b => b.id === req.params.id || (b as any).bookingRef === req.params.id);
      if (!booking) {
        res.status(404).json({ success: false, message: 'Booking not found.' });
        return;
      }
      booking.review = {
        rating: ratingNum,
        comment: comment || 'Service completed satisfactorily.',
        createdAt: new Date().toISOString(),
        images: images || []
      };
      emitBookingUpdated(booking);
      res.status(200).json({ success: true, message: 'Review recorded successfully.', review: booking.review });
      return;
    }

    let booking: any = null;
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      booking = await Booking.findById(req.params.id);
    }
    if (!booking) {
      booking = await Booking.findOne({ bookingRef: req.params.id });
    }
    if (!booking) {
      res.status(404).json({ success: false, message: 'Booking not found.' });
      return;
    }

    booking.review = {
      rating: ratingNum,
      comment: comment || 'Service completed satisfactorily.',
      createdAt: new Date(),
      images: images || []
    };
    await booking.save();

    // Update Provider rating if assigned
    if (booking.providerId && mongoose.Types.ObjectId.isValid(String(booking.providerId))) {
      const providerReviews = await Booking.find({ providerId: booking.providerId, 'review.rating': { $exists: true } });
      if (providerReviews.length > 0) {
        const totalRating = providerReviews.reduce((sum, b) => sum + (b.review?.rating || 5), 0);
        const avg = Number((totalRating / providerReviews.length).toFixed(1));
        await Provider.findByIdAndUpdate(booking.providerId, {
          rating: avg,
          $inc: { jobsCompleted: 1 }
        });
      }
    }

    emitBookingUpdated(booking);
    res.status(200).json({ success: true, message: 'Review recorded successfully.', review: booking.review });
  } catch (err) {
    next(err);
  }
};

export const acceptOrRejectBooking = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { action, reason } = req.body; // action: 'accept' | 'reject'
    const newStatus = action === 'accept' ? 'accepted' : 'rejected';
    const trackingStep = action === 'accept' ? 4 : 11;

    if (!isConnected) {
      const booking: any = MemoryStore.bookings.find(b => b.id === req.params.id || (b as any).bookingRef === req.params.id);
      if (!booking) {
        res.status(404).json({ success: false, message: 'Booking not found.' });
        return;
      }
      booking.status = newStatus;
      booking.trackingStep = trackingStep;
      booking.statusHistory = booking.statusHistory || [];
      booking.statusHistory.push({
        status: newStatus,
        timestamp: new Date().toISOString(),
        note: reason || `Provider ${action === 'accept' ? 'accepted' : 'rejected'} booking assignment`
      });
      emitBookingUpdated(booking);
      res.status(200).json({ success: true, message: `Booking ${newStatus}.`, booking });
      return;
    }

    let booking: any = null;
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      booking = await Booking.findById(req.params.id);
    }
    if (!booking) {
      booking = await Booking.findOne({ bookingRef: req.params.id });
    }
    if (!booking) {
      res.status(404).json({ success: false, message: 'Booking not found.' });
      return;
    }

    booking.status = newStatus;
    booking.trackingStep = trackingStep;
    booking.statusHistory.push({
      status: newStatus,
      timestamp: new Date(),
      note: reason || `Provider ${action === 'accept' ? 'accepted' : 'rejected'} booking assignment`
    });
    await booking.save();

    emitBookingUpdated(booking);
    res.status(200).json({ success: true, message: `Booking ${newStatus}.`, booking });
  } catch (err) {
    next(err);
  }
};
