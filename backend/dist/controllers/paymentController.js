import { Payment } from '../models/index.js';
import { AutomationEngine } from '../services/automationEngine.js';
import { isConnected } from '../config/db.js';
import { MemoryStore } from '../data/memoryStore.js';
export const getPayments = async (req, res, next) => {
    try {
        const { status } = req.query;
        if (!isConnected) {
            let filtered = [...MemoryStore.payments];
            if (status && status !== 'all')
                filtered = filtered.filter(p => p.status === status);
            res.status(200).json({ success: true, count: filtered.length, payments: filtered });
            return;
        }
        const filter = {};
        if (status && status !== 'all')
            filter.status = status;
        const payments = await Payment.find(filter).sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: payments.length, payments });
    }
    catch (err) {
        next(err);
    }
};
export const createPayment = async (req, res, next) => {
    try {
        const { customerName, customerEmail, amount, method, serviceName } = req.body;
        if (!isConnected) {
            const newPayment = {
                id: `PAY-${Math.floor(4100 + Math.random() * 900)}`,
                invoiceNumber: `INV-2026-${Math.floor(1150 + Math.random() * 800)}`,
                customerName: customerName || 'Valued Customer',
                customerEmail: customerEmail || 'billing@example.com',
                amount: Number(amount) || 250,
                method: method || 'Credit Card',
                status: 'completed',
                date: new Date().toISOString().slice(0, 16).replace('T', ' '),
                serviceName: serviceName || 'Deep Sanitization',
                providerPayout: Math.round((Number(amount) || 250) * 0.65),
                receiptNumber: `RCP-${Math.floor(889300 + Math.random() * 1000)}`
            };
            MemoryStore.payments.unshift(newPayment);
            await AutomationEngine.trigger({ event: 'payment_completed', payload: newPayment });
            res.status(201).json({ success: true, message: 'Payment recorded & receipt issued.', payment: newPayment });
            return;
        }
        const payment = await Payment.create({
            paymentRef: `PAY-${Math.floor(4100 + Math.random() * 900)}`,
            invoiceNumber: `INV-2026-${Math.floor(1150 + Math.random() * 800)}`,
            customerName: customerName || 'Valued Customer',
            customerEmail: customerEmail || 'billing@example.com',
            amount: Number(amount) || 250,
            method: method || 'Credit Card',
            status: 'completed',
            date: new Date().toISOString().slice(0, 16).replace('T', ' '),
            serviceName: serviceName || 'Deep Sanitization',
            providerPayout: Math.round((Number(amount) || 250) * 0.65),
            receiptNumber: `RCP-${Math.floor(889300 + Math.random() * 1000)}`
        });
        await AutomationEngine.trigger({
            event: 'payment_completed',
            payload: payment
        });
        res.status(201).json({ success: true, message: 'Payment recorded & receipt issued.', payment });
    }
    catch (err) {
        next(err);
    }
};
export const refundPayment = async (req, res, next) => {
    try {
        const { reason } = req.body;
        if (!isConnected) {
            const payment = MemoryStore.payments.find(p => p.id === req.params.id);
            if (!payment) {
                res.status(404).json({ success: false, message: 'Payment not found.' });
                return;
            }
            payment.status = 'refunded';
            res.status(200).json({ success: true, message: 'Refund successfully executed.', payment });
            return;
        }
        const payment = await Payment.findByIdAndUpdate(req.params.id, {
            status: 'refunded',
            refundReason: reason || 'Customer requested refund'
        }, { new: true });
        res.status(200).json({ success: true, message: 'Refund successfully executed.', payment });
    }
    catch (err) {
        next(err);
    }
};
