import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { app } from './app.js';
import { connectDB, isConnected } from './config/db.js';
import { setupSocketHandlers } from './sockets/socketHandler.js';
import {
  Lead,
  Customer,
  Employee,
  Meeting,
  CallLog,
  Service,
  Category,
  Provider,
  Booking,
  Payment,
  AIInsight,
  Notification,
  Task,
  User
} from './models/index.js';
import { HOME_SERVICES_CATALOG } from './data/homeServicesCatalog.js';

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// Setup Socket.IO Server
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST']
  }
});

setupSocketHandlers(io);

// Initial Database Seeder (Seeds initial enterprise records if collections are empty)
const seedInitialData = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[Database] Seeding initial enterprise users into MongoDB...');

      // Seed Users
      await User.create([
        {
          name: 'Alexander Sterling',
          email: 'alexander@homeeaseguru.com',
          password: 'password123',
          role: 'admin',
          department: 'Executive Leadership',
          phone: '+1 (555) 019-2834'
        },
        {
          name: 'Elena Rostova',
          email: 'elena.rostova@homeeaseguru.com',
          password: 'password123',
          role: 'manager',
          department: 'Sales & Operations',
          phone: '+1 (555) 019-8821'
        },
        {
          name: 'Marcus Vance',
          email: 'marcus.vance@homeeaseguru.com',
          password: 'password123',
          role: 'sales',
          department: 'Enterprise Sales',
          phone: '+1 (555) 019-4512'
        },
        {
          name: 'Sophia Montgomery',
          email: 'sophia.m@gmail.com',
          password: 'password123',
          role: 'customer',
          phone: '+1 (555) 014-9921'
        }
      ]);
    }

    // Seed Complete Home Services Module Categories and Subservices
    const serviceCount = await Service.countDocuments();
    if (serviceCount < 20) {
      console.log('[Database] Seeding 10 Home Service Categories and 86 Subservices into MongoDB...');
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
          const existingService = await Service.findOne({ name: s.name });
          if (!existingService) {
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

      // Also ensure the flagship Ultra Deep Villa Sanitization service is available
      const villaService = await Service.findOne({ name: 'Ultra Deep Villa Sanitization' });
      if (!villaService) {
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

    // Seed Default Employees
    const empCount = await Employee.countDocuments();
    if (empCount === 0) {
      const defaultEmps = [
        {
          employeeId: 'emp-1',
          name: 'Marcus Vance',
          role: 'Senior Sales Manager',
          email: 'marcus.vance@homeeaseguru.com',
          phone: '+1 (555) 019-4512',
          team: 'North Metro Tier 1',
          assignedLeadsCount: 18,
          closedDeals: 42,
          conversionRate: 34.8,
          targetRevenue: 45000,
          achievedRevenue: 38200,
          status: 'active',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256'
        },
        {
          employeeId: 'emp-2',
          name: 'Sarah Jenkins',
          role: 'Sales Executive',
          email: 'sarah.j@homeeaseguru.com',
          phone: '+1 (555) 019-3329',
          team: 'West Suburbs Residential',
          assignedLeadsCount: 14,
          closedDeals: 28,
          conversionRate: 29.2,
          targetRevenue: 32000,
          achievedRevenue: 27500,
          status: 'on_call',
          avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=256'
        },
        {
          employeeId: 'emp-3',
          name: 'David Kalu',
          role: 'Sales Executive',
          email: 'david.kalu@homeeaseguru.com',
          phone: '+1 (555) 019-7711',
          team: 'Commercial & Property Accounts',
          assignedLeadsCount: 22,
          closedDeals: 36,
          conversionRate: 31.5,
          targetRevenue: 40000,
          achievedRevenue: 35100,
          status: 'active',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=256'
        },
        {
          employeeId: 'emp-4',
          name: 'Priya Sharma',
          role: 'AI Operations Lead',
          email: 'priya.s@homeeaseguru.com',
          phone: '+1 (555) 019-1144',
          team: 'AI Automation & Inbound',
          assignedLeadsCount: 31,
          closedDeals: 58,
          conversionRate: 41.2,
          targetRevenue: 50000,
          achievedRevenue: 49200,
          status: 'active',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256'
        }
      ];

      for (const e of defaultEmps) {
        const existing = await Employee.findOne({ email: e.email });
        if (!existing) {
          await Employee.create(e as any);
        } else if (!existing.employeeId) {
          existing.employeeId = e.employeeId;
          await existing.save();
        }
      }
    }

    console.log('[Database] Seed data successfully populated.');
  } catch (err: any) {
    console.warn(`[Database] Seeder notice: ${err.message}`);
  }
};

const startServer = async () => {
  await connectDB();
  if (isConnected) {
    await seedInitialData();
  }

  server.listen(PORT, () => {
    console.log(`===================================================`);
    console.log(`  HOMEEASE GURU — ENTERPRISE AI CRM API SERVER`);
    console.log(`  Mode:        ${process.env.NODE_ENV || 'development'}`);
    console.log(`  Port:        ${PORT}`);
    console.log(`  Healthcheck: http://localhost:${PORT}/health`);
    console.log(`  API Base:    http://localhost:${PORT}/api/v1`);
    console.log(`  Socket.IO:   Listening for real-time events`);
    console.log(`===================================================`);
  });
};

startServer();
