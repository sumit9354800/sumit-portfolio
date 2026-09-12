import mongoose, { Schema, Document } from 'mongoose';

export interface ISocialLinksDocument extends Document {
  github: string;
  linkedin: string;
  email: string;
  updatedAt: Date;
}

const SocialLinksSchema = new Schema<ISocialLinksDocument>({
  github: { type: String, default: 'https://github.com/sumit9354800' },
  linkedin: { type: String, default: 'https://linkedin.com/in/sumit-srivastav-6636ab379' },
  email: { type: String, default: 'mailto:sumit9354800@gmail.com' },
}, { timestamps: true });

export const SocialLinksModel: mongoose.Model<ISocialLinksDocument> =
  (mongoose.models.SocialLinks as mongoose.Model<ISocialLinksDocument>) ||
  mongoose.model<ISocialLinksDocument>('SocialLinks', SocialLinksSchema);

