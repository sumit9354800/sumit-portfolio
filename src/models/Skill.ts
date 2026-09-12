import mongoose, { Schema, Document } from 'mongoose';

export interface ISkillDocument extends Document {
  id: string;
  name: string;
  category: 'frontend' | 'backend' | 'database-tools';
  description?: string;
  featured: boolean;
  enabled: boolean;
  order: number;
}

const SkillSchema = new Schema<ISkillDocument>({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  category: { type: String, enum: ['frontend', 'backend', 'database-tools'], required: true, index: true },
  description: { type: String },
  featured: { type: Boolean, default: false },
  enabled: { type: Boolean, default: true, index: true },
  order: { type: Number, default: 0, index: true },
}, { timestamps: true });

export const SkillModel: mongoose.Model<ISkillDocument> =
  (mongoose.models.Skill as mongoose.Model<ISkillDocument>) ||
  mongoose.model<ISkillDocument>('Skill', SkillSchema);

