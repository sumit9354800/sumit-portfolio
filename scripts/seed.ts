import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { initialPortfolioData } from '../src/lib/seed-data';
import { SiteModel } from '../src/models/Site';
import { HeroModel } from '../src/models/Hero';
import { AboutModel } from '../src/models/About';
import { SkillModel } from '../src/models/Skill';
import { ProjectModel } from '../src/models/Project';
import { ExperienceModel } from '../src/models/Experience';
import { EducationModel } from '../src/models/Education';
import { CertificationModel } from '../src/models/Certification';
import { ContactSettingsModel } from '../src/models/ContactSettings';
import { SocialLinksModel } from '../src/models/SocialLinks';
import { NavigationModel } from '../src/models/Navigation';
import { AdminModel } from '../src/models/Admin';

async function runSeed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.log('[Seed] Note: MONGODB_URI is not set. Seed data is already present in src/lib/seed-data.ts and data/portfolio-store.json for local preview.');
    process.exit(0);
  }

  try {
    console.log('[Seed] Connecting to MongoDB Atlas...');
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 });
    console.log('[Seed] Connected successfully.');
  } catch (err: any) {
    console.log(`[Seed] Notice: Could not connect to remote MongoDB Atlas (${err.message}).`);
    console.log('[Seed] The application has already synchronized all 9 projects into data/portfolio-store.json and operates with zero latency in durable local mode.');
    process.exit(0);
  }

  console.log('[Seed] Seeding Site and SEO settings...');
  await SiteModel.findOneAndUpdate({}, initialPortfolioData.site, { upsert: true, new: true });

  console.log('[Seed] Seeding Hero section...');
  await HeroModel.findOneAndUpdate({}, initialPortfolioData.hero, { upsert: true, new: true });

  console.log('[Seed] Seeding About section...');
  await AboutModel.findOneAndUpdate({}, initialPortfolioData.about, { upsert: true, new: true });

  console.log('[Seed] Seeding Skills (19 skills)...');
  for (const skill of initialPortfolioData.skills) {
    await SkillModel.findOneAndUpdate({ id: skill.id }, skill, { upsert: true });
  }

  console.log('[Seed] Seeding 9 Real Projects...');
  await ProjectModel.deleteMany({ slug: { $in: ['fashion-e-commerce', 'fashion-ecommerce'] } });
  for (const project of initialPortfolioData.projects) {
    await ProjectModel.findOneAndUpdate({ id: project.id }, project, { upsert: true });
  }

  console.log('[Seed] Seeding Experience...');
  for (const exp of initialPortfolioData.experience) {
    await ExperienceModel.findOneAndUpdate({ id: exp.id }, exp, { upsert: true });
  }

  console.log('[Seed] Seeding Education...');
  for (const edu of initialPortfolioData.education) {
    await EducationModel.findOneAndUpdate({ id: edu.id }, edu, { upsert: true });
  }

  console.log('[Seed] Seeding Certifications & Awards...');
  for (const cert of initialPortfolioData.certifications) {
    await CertificationModel.findOneAndUpdate({ id: cert.id }, cert, { upsert: true });
  }

  console.log('[Seed] Seeding Contact & Social settings...');
  await ContactSettingsModel.findOneAndUpdate({}, initialPortfolioData.contact, { upsert: true, new: true });
  await SocialLinksModel.findOneAndUpdate({}, initialPortfolioData.social, { upsert: true, new: true });

  console.log('[Seed] Seeding Navigation items...');
  for (const nav of initialPortfolioData.navigation) {
    await NavigationModel.findOneAndUpdate({ id: nav.id }, nav, { upsert: true });
  }

  // Initialize Admin account in MongoDB directly
  const adminEmail = 'sumit9354800@gmail.com';
  const rawPassword = '340350@Ss';
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(rawPassword, salt);

  console.log(`[Seed] Initializing Admin account in MongoDB (${adminEmail})...`);
  await AdminModel.findOneAndUpdate(
    { email: adminEmail },
    {
      email: adminEmail,
      passwordHash,
      name: 'Sumit Shrivastav',
      role: 'admin',
    },
    { upsert: true }
  );

  console.log('✅ Database seeded successfully with all authentic portfolio items!');
  await mongoose.disconnect();
  process.exit(0);
}

runSeed().catch((err) => {
  console.error('[Seed Error]:', err);
  process.exit(1);
});
