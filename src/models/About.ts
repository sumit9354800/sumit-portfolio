import mongoose, { Schema, Document } from 'mongoose';

export interface IAboutDocument extends Document {
  headline: string;
  paragraphs: string[];
  stats: Array<{ label: string; value: string }>;
  highlights: string[];
  updatedAt: Date;
}

const AboutSchema = new Schema<IAboutDocument>({
  headline: { type: String, required: true },
  paragraphs: [{ type: String }],
  stats: [{
    label: { type: String, required: true },
    value: { type: String, required: true },
  }],
  highlights: [{ type: String }],
}, { timestamps: true });

export const AboutModel: mongoose.Model<IAboutDocument> =
  (mongoose.models.About as mongoose.Model<IAboutDocument>) ||
  mongoose.model<IAboutDocument>('About', AboutSchema);

