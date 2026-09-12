import mongoose, { Schema, Document } from 'mongoose';

export interface ICertificationDocument extends Document {
  id: string;
  title: string;
  issuer: string;
  year: string;
  description: string;
  credentialUrl?: string;
  order: number;
  enabled: boolean;
}

const CertificationSchema = new Schema<ICertificationDocument>({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  issuer: { type: String, default: '' },
  year: { type: String, default: '' },
  description: { type: String, default: '' },
  credentialUrl: { type: String, default: '' },
  order: { type: Number, default: 0 },
  enabled: { type: Boolean, default: true },
}, { timestamps: true });

export const CertificationModel: mongoose.Model<ICertificationDocument> =
  (mongoose.models.Certification as mongoose.Model<ICertificationDocument>) ||
  mongoose.model<ICertificationDocument>('Certification', CertificationSchema);

