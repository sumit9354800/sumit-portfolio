import mongoose, { Schema, Document } from 'mongoose';

export interface IContactSettingsDocument extends Document {
  email: string;
  phone: string;
  location: string;
  availability: string;
  description: string;
  updatedAt: Date;
}

const ContactSettingsSchema = new Schema<IContactSettingsDocument>({
  email: { type: String, required: true },
  phone: { type: String, required: true },
  location: { type: String, required: true },
  availability: { type: String, default: 'AVAILABLE FOR OPPORTUNITIES' },
  description: { type: String, default: '' },
}, { timestamps: true });

export const ContactSettingsModel: mongoose.Model<IContactSettingsDocument> =
  (mongoose.models.ContactSettings as mongoose.Model<IContactSettingsDocument>) ||
  mongoose.model<IContactSettingsDocument>('ContactSettings', ContactSettingsSchema);

