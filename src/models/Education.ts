import mongoose, { Schema, Document } from 'mongoose';

export interface IEducationDocument extends Document {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startYear: string;
  endYear: string;
  status: string;
  description: string;
  order: number;
  enabled: boolean;
}

const EducationSchema = new Schema<IEducationDocument>({
  id: { type: String, required: true, unique: true },
  institution: { type: String, required: true },
  degree: { type: String, required: true },
  field: { type: String, required: true },
  startYear: { type: String, required: true },
  endYear: { type: String, required: true },
  status: { type: String, default: 'Completed' },
  description: { type: String, default: '' },
  order: { type: Number, default: 0 },
  enabled: { type: Boolean, default: true },
}, { timestamps: true });

export const EducationModel: mongoose.Model<IEducationDocument> =
  (mongoose.models.Education as mongoose.Model<IEducationDocument>) ||
  mongoose.model<IEducationDocument>('Education', EducationSchema);

