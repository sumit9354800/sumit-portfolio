import mongoose, { Schema, Document } from 'mongoose';

export interface INavigationDocument extends Document {
  id: string;
  label: string;
  href: string;
  enabled: boolean;
  order: number;
}

const NavigationSchema = new Schema<INavigationDocument>({
  id: { type: String, required: true, unique: true },
  label: { type: String, required: true },
  href: { type: String, required: true },
  enabled: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
}, { timestamps: true });

export const NavigationModel: mongoose.Model<INavigationDocument> =
  (mongoose.models.Navigation as mongoose.Model<INavigationDocument>) ||
  mongoose.model<INavigationDocument>('Navigation', NavigationSchema);

