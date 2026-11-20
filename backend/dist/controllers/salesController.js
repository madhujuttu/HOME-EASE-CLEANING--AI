import mongoose from 'mongoose';
import { Employee, User } from '../models/index.js';
import { isConnected } from '../config/db.js';
import { MemoryStore } from '../data/memoryStore.js';
export const getEmployees = async (req, res, next) => {
    try {
        if (!isConnected) {
            res.status(200).json({ success: true, count: MemoryStore.employees.length, employees: MemoryStore.employees });
            return;
        }
        const employees = await Employee.find().sort({ achievedRevenue: -1 });
        res.status(200).json({ success: true, count: employees.length, employees });
    }
    catch (err) {
        next(err);
    }
};
export const getEmployeeById = async (req, res, next) => {
    try {
        if (!isConnected) {
            const employee = MemoryStore.employees.find(e => e.id === req.params.id);
            if (!employee) {
                res.status(404).json({ success: false, message: 'Employee not found.' });
                return;
            }
            res.status(200).json({ success: true, employee });
            return;
        }
        let employee = null;
        if (mongoose.Types.ObjectId.isValid(req.params.id)) {
            employee = await Employee.findById(req.params.id);
        }
        if (!employee) {
            employee = await Employee.findOne({
                $or: [
                    { employeeId: req.params.id },
                    { email: req.params.id.toLowerCase() }
                ]
            });
        }
        if (!employee) {
            employee = MemoryStore.employees.find(e => e.id === req.params.id || e.email.toLowerCase() === req.params.id.toLowerCase());
        }
        if (!employee) {
            res.status(404).json({ success: false, message: 'Employee not found.' });
            return;
        }
        res.status(200).json({ success: true, employee });
    }
    catch (err) {
        next(err);
    }
};
export const createEmployee = async (req, res, next) => {
    try {
        const { name, email, phone, role = 'Sales Executive', team = 'Residential Metro Hub', password = 'password123', targetRevenue = 35000, status = 'active', avatar } = req.body;
        if (!name || !name.trim()) {
            res.status(400).json({ success: false, message: 'Employee name is required.' });
            return;
        }
        if (!email || !email.trim()) {
            res.status(400).json({ success: false, message: 'Employee email address is required.' });
            return;
        }
        const cleanEmail = email.toLowerCase().trim();
        const cleanPhone = phone?.trim() || '+1 (555) 019-' + Math.floor(1000 + Math.random() * 9000);
        const assignedAvatar = avatar ||
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256';
        const empId = `emp-${Date.now()}`;
        if (!isConnected) {
            // Check duplicate email
            const existingUser = MemoryStore.users.find(u => u.email.toLowerCase() === cleanEmail);
            if (existingUser) {
                res.status(409).json({ success: false, message: `An account with email '${cleanEmail}' already exists.` });
                return;
            }
            const newUser = {
                id: `usr-${Date.now()}`,
                name: name.trim(),
                email: cleanEmail,
                password: password || 'password123',
                role: 'sales',
                phone: cleanPhone,
                department: team
            };
            MemoryStore.users.push(newUser);
            const newEmp = {
                id: empId,
                name: name.trim(),
                role,
                email: cleanEmail,
                phone: cleanPhone,
                team,
                assignedLeadsCount: 0,
                closedDeals: 0,
                conversionRate: 0,
                targetRevenue: Number(targetRevenue) || 35000,
                achievedRevenue: 0,
                status,
                avatar: assignedAvatar
            };
            MemoryStore.employees.push(newEmp);
            res.status(201).json({
                success: true,
                message: `Employee "${newEmp.name}" and login account created successfully. Default Password: "${password || 'password123'}".`,
                employee: newEmp
            });
            return;
        }
        // Check duplicate email in DB
        const existing = await User.findOne({ email: cleanEmail });
        if (existing) {
            res.status(409).json({ success: false, message: `An account with email '${cleanEmail}' already exists.` });
            return;
        }
        // 1. Create User account for employee login
        const user = await User.create({
            name: name.trim(),
            email: cleanEmail,
            password: password || 'password123',
            role: 'sales',
            phone: cleanPhone,
            department: team,
            avatar: assignedAvatar
        });
        // 2. Create Employee record linked with user
        const employee = await Employee.create({
            employeeId: empId,
            userId: user._id,
            name: name.trim(),
            role,
            email: cleanEmail,
            phone: cleanPhone,
            team,
            assignedLeadsCount: 0,
            closedDeals: 0,
            conversionRate: 0,
            targetRevenue: Number(targetRevenue) || 35000,
            achievedRevenue: 0,
            status,
            avatar: assignedAvatar
        });
        // Also sync to MemoryStore cache
        MemoryStore.employees.push({
            id: empId,
            name: employee.name,
            role: employee.role,
            email: employee.email,
            phone: employee.phone,
            team: employee.team,
            assignedLeadsCount: employee.assignedLeadsCount,
            closedDeals: employee.closedDeals,
            conversionRate: employee.conversionRate,
            targetRevenue: employee.targetRevenue,
            achievedRevenue: employee.achievedRevenue,
            status: employee.status,
            avatar: employee.avatar
        });
        res.status(201).json({
            success: true,
            message: `Employee "${employee.name}" and login account created successfully. Default Password: "${password || 'password123'}".`,
            employee
        });
    }
    catch (err) {
        next(err);
    }
};
export const updateEmployee = async (req, res, next) => {
    try {
        if (!isConnected) {
            const index = MemoryStore.employees.findIndex(e => e.id === req.params.id);
            if (index === -1) {
                res.status(404).json({ success: false, message: 'Employee not found.' });
                return;
            }
            MemoryStore.employees[index] = { ...MemoryStore.employees[index], ...req.body };
            res.status(200).json({ success: true, message: 'Employee updated.', employee: MemoryStore.employees[index] });
            return;
        }
        let employee = null;
        if (mongoose.Types.ObjectId.isValid(req.params.id)) {
            employee = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true });
        }
        if (!employee) {
            employee = await Employee.findOneAndUpdate({
                $or: [
                    { employeeId: req.params.id },
                    { email: req.params.id.toLowerCase() }
                ]
            }, req.body, { new: true });
        }
        if (!employee) {
            res.status(404).json({ success: false, message: 'Employee not found.' });
            return;
        }
        res.status(200).json({ success: true, message: 'Employee updated.', employee });
    }
    catch (err) {
        next(err);
    }
};
