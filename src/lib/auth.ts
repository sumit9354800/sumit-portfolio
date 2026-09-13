import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import { connectToDatabase, getDatabaseStatus } from './mongodb';
import { AdminModel } from '../models/Admin';

const AUTH_SECRET = process.env.AUTH_SECRET || 'sumit-shrivastav-portfolio-cms-secret-key-2026';
const COOKIE_NAME = 'sumit_admin_session';

const ADMIN_STORE_FILE = path.resolve(process.cwd(), 'data', 'admin-store.json');

// Default initial admin credentials seeded into MongoDB / Database Store
export const DEFAULT_ADMIN = {
  email: 'sumit9354800@gmail.com',
  // bcrypt hash for '340350@Ss'
  passwordHash: '$2b$10$bKgr.w61qLvaPoDNjgzrhO52vC5pZGfzXd0LXK3B4hYLFcgRTgo3e',
  name: 'Sumit Shrivastav',
  role: 'admin',
};

export interface AdminSessionPayload {
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export function getStoredAdmin(): typeof DEFAULT_ADMIN {
  try {
    if (fs.existsSync(ADMIN_STORE_FILE)) {
      const raw = fs.readFileSync(ADMIN_STORE_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (e) {
    // fallback
  }
  return DEFAULT_ADMIN;
}

export function saveStoredAdmin(data: Partial<typeof DEFAULT_ADMIN>): void {
  try {
    const current = getStoredAdmin();
    const updated = { ...current, ...data };
    const dir = path.dirname(ADMIN_STORE_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(ADMIN_STORE_FILE, JSON.stringify(updated, null, 2), 'utf-8');
  } catch (err) {
    console.error('[Auth] Failed to write local admin store:', err);
  }
}

/**
 * Ensures admin record exists in MongoDB
 */
export async function ensureAdminInMongoDB(): Promise<void> {
  try {
    const db = await connectToDatabase();
    if (db && getDatabaseStatus().connected) {
      const stored = getStoredAdmin();
      const existing = await AdminModel.findOne({ email: stored.email });
      if (!existing) {
        await AdminModel.create({
          email: stored.email,
          passwordHash: stored.passwordHash,
          name: stored.name,
          role: stored.role,
        });
      }
    }
  } catch {
    // silent fallback
  }
}

export async function verifyAdminCredentials(email: string, passwordAttempt: string): Promise<boolean> {
  const cleanEmail = email.trim().toLowerCase();

  // 1. Check MongoDB admin collection if connected
  try {
    const db = await connectToDatabase();
    if (db && getDatabaseStatus().connected) {
      let adminDoc = await AdminModel.findOne({ email: cleanEmail });
      
      // If MongoDB is connected but has no admin doc yet, auto-seed default admin into MongoDB
      if (!adminDoc && cleanEmail === DEFAULT_ADMIN.email) {
        const stored = getStoredAdmin();
        adminDoc = await AdminModel.create({
          email: stored.email,
          passwordHash: stored.passwordHash,
          name: stored.name,
          role: stored.role,
        });
      }

      if (adminDoc && adminDoc.passwordHash) {
        const isMatch = await bcrypt.compare(passwordAttempt, adminDoc.passwordHash);
        if (isMatch) {
          adminDoc.lastLogin = new Date();
          await adminDoc.save().catch(() => {});
          return true;
        }
        return false;
      }
    }
  } catch {
    // fall back to local database store
  }

  // 2. Check local database store (fallback when MongoDB is offline)
  const stored = getStoredAdmin();
  if (cleanEmail === stored.email.toLowerCase()) {
    return await bcrypt.compare(passwordAttempt, stored.passwordHash);
  }

  return false;
}

export async function updateAdminPassword(newPassword: string): Promise<boolean> {
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(newPassword, salt);

  // 1. Save in local database store
  saveStoredAdmin({ passwordHash });

  // 2. Update in MongoDB if connected
  try {
    const db = await connectToDatabase();
    if (db && getDatabaseStatus().connected) {
      const stored = getStoredAdmin();
      await AdminModel.findOneAndUpdate(
        { email: stored.email },
        { passwordHash, updatedAt: new Date() },
        { upsert: true }
      );
    }
  } catch {
    // non-fatal
  }

  return true;
}


export function createAdminToken(email: string): string {
  return jwt.sign(
    { email, role: 'admin' },
    AUTH_SECRET,
    { expiresIn: '7d' }
  );
}

export function setSessionCookie(res: Response, token: string): void {
  const isProd = process.env.NODE_ENV === 'production';
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  });
}

export function clearSessionCookie(res: Response): void {
  const isProd = process.env.NODE_ENV === 'production';
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    path: '/',
  });
}

export function verifyAdminSession(req: Request): AdminSessionPayload | null {
  const token = req.cookies?.[COOKIE_NAME] || req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, AUTH_SECRET) as AdminSessionPayload;
    return decoded;
  } catch {
    return null;
  }
}
