import mongoose, { Schema, Document } from 'mongoose';

export interface ISiteDocument extends Document {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
    ogTitle: string;
    ogDescription: string;
    canonicalUrl: string;
  };
  updatedAt: Date;
}

const SiteSchema = new Schema<ISiteDocument>({
  name: { type: String, required: true },
  title: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  location: { type: String, required: true },
  seo: {
    metaTitle: { type: String, default: '' },
    metaDescription: { type: String, default: '' },
    keywords: [{ type: String }],
    ogTitle: { type: String, default: '' },
    ogDescription: { type: String, default: '' },
    canonicalUrl: { type: String, default: '' },
  },
}, { timestamps: true });

export const SiteModel: mongoose.Model<ISiteDocument> =
  (mongoose.models.Site as mongoose.Model<ISiteDocument>) ||
  mongoose.model<ISiteDocument>('Site', SiteSchema);

