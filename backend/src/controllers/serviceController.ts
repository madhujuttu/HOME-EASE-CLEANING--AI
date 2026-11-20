import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import mongoose from 'mongoose';
import { Service, Category, Lead, Booking } from '../models/index.js';
import { isConnected } from '../config/db.js';
import { MemoryStore } from '../data/memoryStore.js';
import { HOME_SERVICES_CATALOG } from '../data/homeServicesCatalog.js';
import {
  emitServiceCreated,
  emitServiceUpdated,
  emitServiceDeactivated
} from '../sockets/socketHandler.js';
import { AuthRequest } from '../middleware/auth.js';

// Setup disk storage for service images
const uploadDir = path.join(process.cwd(), 'uploads', 'services');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `service-${uniqueSuffix}${ext}`);
  }
});

export const serviceImageUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB maximum
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (allowed.includes(file.mimetype.toLowerCase())) {
      cb(null, true);
    } else {
      cb(new Error('Invalid image format. Only JPG, JPEG, PNG, and WEBP formats are supported.'));
    }
  }
});

export const uploadServiceImage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No image file uploaded.' });
      return;
    }

    const imageUrl = `/uploads/services/${req.file.filename}`;
    res.status(200).json({
      success: true,
      message: 'Service image uploaded successfully.',
      imageUrl,
      imageStorageKey: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size
    });
  } catch (err) {
    next(err);
  }
};

export const getServices = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { categoryId, status, search } = req.query;

    if (!isConnected) {
      let filtered = [...MemoryStore.services];
      if (categoryId && categoryId !== 'all') filtered = filtered.filter(s => s.categoryId === categoryId);
      if (status && status !== 'all') filtered = filtered.filter(s => s.status === status);
      if (search) {
        const queryStr = String(search).toLowerCase();
        filtered = filtered.filter(item => item.name.toLowerCase().includes(queryStr) || item.description.toLowerCase().includes(queryStr));
      }
      res.status(200).json({ success: true, count: filtered.length, services: filtered });
      return;
    }

    // Auto-seed if database is empty or has partial seed (< 20 services)
    const existingCount = await Service.countDocuments();
    if (existingCount < 20) {
      for (const catData of HOME_SERVICES_CATALOG) {
        let categoryDoc = await Category.findOne({ name: catData.name });
        if (!categoryDoc) {
          categoryDoc = await Category.create({
            name: catData.name,
            icon: catData.icon,
            description: catData.description,
            serviceCount: catData.services.length
          });
        }
        for (const s of catData.services) {
          const exists = await Service.findOne({ name: s.name });
          if (!exists) {
            await Service.create({
              categoryId: categoryDoc._id,
              categoryName: categoryDoc.name,
              name: s.name,
              description: s.description,
              price: s.price,
              pricingType: s.pricingType,
              duration: s.duration,
              estimatedDuration: s.estimatedDuration || s.duration,
              availability: s.availability,
              image: s.image,
              imageUrl: s.image,
              features: s.features,
              inclusions: s.inclusions,
              exclusions: s.exclusions,
              inspectionCharges: s.inspectionCharges || 150,
              emergencyCharges: s.emergencyCharges || 0,
              discountPercentage: s.discountPercentage || 0,
              popular: s.popular || false,
              status: s.status || 'active'
            });
          }
        }
      }
      // Ensure Ultra Deep Villa Sanitization is present
      const villa = await Service.findOne({ name: 'Ultra Deep Villa Sanitization' });
      if (!villa) {
        let cleanCat = await Category.findOne({ name: 'Home Cleaning Services' });
        await Service.create({
          categoryId: cleanCat ? cleanCat._id : undefined,
          categoryName: 'Home Cleaning Services',
          name: 'Ultra Deep Villa Sanitization',
          description: '120-point hospital grade steam sanitation, window detailing, ceiling fans, switchboards, and floor polishing.',
          price: 349,
          pricingType: 'fixed',
          duration: '5 - 6 Hours',
          availability: 'Monday - Sunday, 8 AM - 6 PM',
          image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=800',
          imageUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=800',
          features: ['Hospital-grade HEPA extraction', 'Eco-certified pet-safe detergents', '3-Person Certified Crew', '100% Satisfaction Guarantee'],
          popular: true,
          status: 'active'
        });
      }
    }

    const filter: any = {};
    if (categoryId && categoryId !== 'all') {
      if (mongoose.Types.ObjectId.isValid(String(categoryId))) {
        filter.categoryId = categoryId;
      } else {
        filter.$or = [{ categoryId }, { categoryName: categoryId }];
      }
    }
    if (status && status !== 'all') filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    let services = await Service.find(filter).sort({ price: -1 });
    if (services.length === 0 && !search && (!categoryId || categoryId === 'all')) {
      services = MemoryStore.services as any;
    }

    res.status(200).json({ success: true, count: services.length, services });
  } catch (err) {
    next(err);
  }
};

export const getCategories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!isConnected) {
      res.status(200).json({ success: true, count: MemoryStore.categories.length, categories: MemoryStore.categories });
      return;
    }

    let categories = await Category.find();
    if (categories.length < 10) {
      for (const catData of HOME_SERVICES_CATALOG) {
        const exists = await Category.findOne({ name: catData.name });
        if (!exists) {
          await Category.create({
            name: catData.name,
            icon: catData.icon,
            description: catData.description,
            serviceCount: catData.services.length
          });
        }
      }
      categories = await Category.find();
    }

    res.status(200).json({ success: true, count: categories.length, categories });
  } catch (err) {
    next(err);
  }
};

export const createService = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      name,
      description,
      price,
      pricingType,
      duration,
      estimatedDuration,
      categoryId,
      categoryName,
      image,
      imageUrl,
      imageStorageKey,
      features,
      availability,
      status
    } = req.body;

    if (!name || !name.trim()) {
      res.status(400).json({ success: false, message: 'Service name is required.' });
      return;
    }
    if (price === undefined || price === null || isNaN(Number(price))) {
      res.status(400).json({ success: false, message: 'Valid service price is required.' });
      return;
    }

    const resolvedImage = imageUrl || image || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=800';

    if (!isConnected) {
      const newService = {
        id: `srv-${Date.now()}`,
        name: name.trim(),
        description: description || 'Professional specialized cleaning service.',
        price: Number(price),
        pricingType: pricingType || 'fixed',
        duration: duration || '3 Hours',
        estimatedDuration: estimatedDuration || '3 Hours',
        categoryId: categoryId || 'cat-1',
        categoryName: categoryName || 'Deep Home Cleaning',
        image: resolvedImage,
        imageUrl: resolvedImage,
        imageStorageKey,
        features: features || ['Hospital Grade Sanitization', 'Certified Crew'],
        availability: availability || 'Daily',
        status: status || 'active',
        createdBy: req.user?.id,
        createdAt: new Date().toISOString()
      };
      MemoryStore.services.unshift(newService);
      emitServiceCreated(newService);
      res.status(201).json({ success: true, message: 'Service created.', service: newService });
      return;
    }

    const service = await Service.create({
      name: name.trim(),
      description: description || 'Professional specialized cleaning service.',
      price: Number(price),
      pricingType: pricingType || 'fixed',
      duration: duration || '3 Hours',
      estimatedDuration: estimatedDuration || '3 Hours',
      categoryId: categoryId || 'cat-1',
      categoryName: categoryName || 'Deep Home Cleaning',
      image: resolvedImage,
      imageUrl: resolvedImage,
      imageStorageKey,
      features: features || ['Hospital Grade Sanitization', 'Certified Crew'],
      availability: availability || 'Daily',
      status: status || 'active',
      createdBy: req.user?.id
    });

    emitServiceCreated(service);
    res.status(201).json({ success: true, message: 'Service created successfully.', service });
  } catch (err) {
    next(err);
  }
};

export const updateService = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const serviceId = req.params.id;

    // Always update MemoryStore cache
    const memIndex = MemoryStore.services.findIndex(s => s.id === serviceId || s.name.toLowerCase() === serviceId.toLowerCase());
    if (memIndex !== -1) {
      MemoryStore.services[memIndex] = {
        ...MemoryStore.services[memIndex],
        ...req.body,
        image: req.body.image || req.body.imageUrl || MemoryStore.services[memIndex].image,
        imageUrl: req.body.imageUrl || req.body.image || MemoryStore.services[memIndex].imageUrl
      };
    }

    if (!isConnected) {
      if (memIndex === -1) {
        res.status(404).json({ success: false, message: 'Service not found.' });
        return;
      }
      emitServiceUpdated(MemoryStore.services[memIndex]);
      res.status(200).json({ success: true, message: 'Service updated.', service: MemoryStore.services[memIndex] });
      return;
    }

    let service: any = null;
    if (mongoose.Types.ObjectId.isValid(serviceId)) {
      service = await Service.findById(serviceId);
    }
    if (!service) {
      service = await Service.findOne({
        $or: [
          { id: serviceId },
          { name: serviceId },
          { name: { $regex: new RegExp(`^${serviceId.trim()}$`, 'i') } }
        ]
      });
    }

    if (!service) {
      if (memIndex !== -1) {
        res.status(200).json({ success: true, message: 'Service updated.', service: MemoryStore.services[memIndex] });
        return;
      }
      res.status(404).json({ success: false, message: 'Service not found.' });
      return;
    }

    Object.assign(service, req.body);
    const resolvedImg = req.body.image || req.body.imageUrl;
    if (resolvedImg) {
      service.imageUrl = resolvedImg;
      service.image = resolvedImg;
    }
    const updated = await service.save();

    emitServiceUpdated(updated);
    res.status(200).json({ success: true, message: 'Service updated successfully.', service: updated });
  } catch (err) {
    next(err);
  }
};

export const deleteService = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const serviceId = req.params.id;

    if (!isConnected) {
      const index = MemoryStore.services.findIndex(s => s.id === serviceId);
      if (index === -1) {
        res.status(404).json({ success: false, message: 'Service not found.' });
        return;
      }
      // Soft-delete: mark inactive to preserve references
      MemoryStore.services[index].status = 'inactive';
      emitServiceDeactivated(serviceId, MemoryStore.services[index]);
      res.status(200).json({
        success: true,
        message: 'Service deactivated (soft-deleted) to preserve historical references in leads and bookings.',
        service: MemoryStore.services[index]
      });
      return;
    }

    const service = await Service.findById(serviceId);
    if (!service) {
      res.status(404).json({ success: false, message: 'Service not found.' });
      return;
    }

    // Always soft-delete / deactivate to preserve historical integrity in leads and bookings
    service.status = 'inactive';
    const updated = await service.save();

    emitServiceDeactivated(serviceId, updated);
    res.status(200).json({
      success: true,
      message: 'Service deactivated (soft-deleted) to preserve historical references in leads and bookings.',
      service: updated
    });
  } catch (err) {
    next(err);
  }
};
