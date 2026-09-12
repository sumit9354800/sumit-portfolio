import mongoose, { Schema, Document } from 'mongoose';

export interface IExperienceDocument extends Document {
  id: string;
  title: string;
  role: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
  responsibilities: string[];
  technologies: string[];
  companyUrl: string;
  order: number;
  enabled: boolean;
}

const ExperienceSchema = new Schema<IExperienceDocument>({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  role: { type: String, required: true },
  company: { type: String, required: true },
  location: { type: String, default: '' },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  description: { type: String, required: true },
  responsibilities: [{ type: String }],
  technologies: [{ type: String }],
  companyUrl: { type: String, default: '' },
  order: { type: Number, default: 0, index: true },
  enabled: { type: Boolean, default: true, index: true },
}, { timestamps: true });

export const ExperienceModel: mongoose.Model<IExperienceDocument> =
  (mongoose.models.Experience as mongoose.Model<IExperienceDocument>) ||
  mongoose.model<IExperienceDocument>('Experience', ExperienceSchema);

