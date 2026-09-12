import mongoose, { Schema, Document } from 'mongoose';

export interface IAdminDocument extends Document {
  email: string;
  passwordHash: string;
  name: string;
  role: string;
  lastLogin?: Date;
  updatedAt: Date;
}

const AdminSchema = new Schema<IAdminDocument>({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  name: { type: String, default: 'Sumit Shrivastav' },
  role: { type: String, default: 'admin' },
  lastLogin: { type: Date },
}, { timestamps: true });

export const AdminModel: mongoose.Model<IAdminDocument> =
  (mongoose.models.Admin as mongoose.Model<IAdminDocument>) ||
  mongoose.model<IAdminDocument>('Admin', AdminSchema);

