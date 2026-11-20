import { Provider } from '../models/index.js';
import { isConnected } from '../config/db.js';
import { MemoryStore } from '../data/memoryStore.js';
export const getProviders = async (req, res, next) => {
    try {
        const { status } = req.query;
        if (!isConnected) {
            let filtered = [...MemoryStore.providers];
            if (status && status !== 'all')
                filtered = filtered.filter(p => p.verificationStatus === status);
            res.status(200).json({ success: true, count: filtered.length, providers: filtered });
            return;
        }
        const filter = {};
        if (status && status !== 'all')
            filter.verificationStatus = status;
        const providers = await Provider.find(filter).sort({ rating: -1 });
        res.status(200).json({ success: true, count: providers.length, providers });
    }
    catch (err) {
        next(err);
    }
};
export const registerProvider = async (req, res, next) => {
    try {
        if (!isConnected) {
            const newProvider = {
                id: `prov-${Date.now()}`,
                ...req.body,
                verificationStatus: 'verified',
                jobsCompleted: 0,
                rating: 5.0,
                activeJobs: 0,
                availabilityStatus: 'available',
                joinedDate: new Date().toISOString().slice(0, 10)
            };
            MemoryStore.providers.push(newProvider);
            res.status(201).json({ success: true, message: 'Provider registered & verified.', provider: newProvider });
            return;
        }
        const provider = await Provider.create({
            ...req.body,
            verificationStatus: 'verified',
            joinedDate: new Date().toISOString().slice(0, 10)
        });
        res.status(201).json({ success: true, message: 'Provider registered & verified.', provider });
    }
    catch (err) {
        next(err);
    }
};
export const updateProvider = async (req, res, next) => {
    try {
        if (!isConnected) {
            const index = MemoryStore.providers.findIndex(p => p.id === req.params.id);
            if (index === -1) {
                res.status(404).json({ success: false, message: 'Provider not found.' });
                return;
            }
            MemoryStore.providers[index] = { ...MemoryStore.providers[index], ...req.body };
            res.status(200).json({ success: true, message: 'Provider updated.', provider: MemoryStore.providers[index] });
            return;
        }
        const provider = await Provider.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json({ success: true, message: 'Provider updated.', provider });
    }
    catch (err) {
        next(err);
    }
};
