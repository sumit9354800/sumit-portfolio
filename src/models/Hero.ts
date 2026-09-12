import mongoose, { Schema, Document } from 'mongoose';

export interface IHeroDocument extends Document {
  name: string;
  role: string;
  rotatingTitles: string[];
  description: string;
  availability: string;
  location: string;
  primaryCtaText: string;
  primaryCtaLink: string;
  secondaryCtaText: string;
  secondaryCtaLink: string;
  enabled: boolean;
  updatedAt: Date;
}

const HeroSchema = new Schema<IHeroDocument>({
  name: { type: String, required: true },
  role: { type: String, required: true },
  rotatingTitles: [{ type: String }],
  description: { type: String, required: true },
  availability: { type: String, default: 'AVAILABLE FOR OPPORTUNITIES' },
  location: { type: String, default: 'UTTAM NAGAR, DELHI – 110059' },
  primaryCtaText: { type: String, default: 'EXPLORE WORK' },
  primaryCtaLink: { type: String, default: '#projects' },
  secondaryCtaText: { type: String, default: 'GET IN TOUCH' },
  secondaryCtaLink: { type: String, default: '#contact' },
  enabled: { type: Boolean, default: true },
}, { timestamps: true });

export const HeroModel: mongoose.Model<IHeroDocument> =
  (mongoose.models.Hero as mongoose.Model<IHeroDocument>) ||
  mongoose.model<IHeroDocument>('Hero', HeroSchema);

