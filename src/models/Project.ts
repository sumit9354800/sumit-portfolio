import mongoose, { Schema, Document } from 'mongoose';

export interface IProjectDocument extends Document {
  id: string;
  title: string;
  slug: string;
  category: string;
  year: string;
  role: string;
  description: string;
  technologies: string[];
  image: string;
  liveUrl: string;
  githubUrl: string;
  challenges: string;
  solution: string;
  features: string[];
  featured: boolean;
  published: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProjectDocument>({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true, index: true },
  category: { type: String, required: true },
  year: { type: String, required: true },
  role: { type: String, required: true },
  description: { type: String, required: true },
  technologies: [{ type: String }],
  image: { type: String, required: true },
  liveUrl: { type: String, default: '' },
  githubUrl: { type: String, default: '' },
  challenges: { type: String, default: '' },
  solution: { type: String, default: '' },
  features: [{ type: String }],
  featured: { type: Boolean, default: false, index: true },
  published: { type: Boolean, default: true, index: true },
  order: { type: Number, default: 0, index: true },
}, { timestamps: true });

export const ProjectModel: mongoose.Model<IProjectDocument> =
  (mongoose.models.Project as mongoose.Model<IProjectDocument>) ||
  mongoose.model<IProjectDocument>('Project', ProjectSchema);

