import mongoose, { Schema } from 'mongoose';
const RoleSchema = new Schema({
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, trim: true },
    permissions: [{ type: String }]
}, { timestamps: true });
export const Role = mongoose.model('Role', RoleSchema);
