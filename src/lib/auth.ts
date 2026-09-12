import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import { connectToDatabase } from './mongodb';
import { AdminModel } from '../models/Admin';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'sumit9354800@gmail.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'adminpassword123';
const AUTH_SECRET = process.env.AUTH_SECRET || 'sumit-shrivastav-portfolio-cms-secret-key-2026';
const COOKIE_NAME = 'sumit_admin_session';

export interface AdminSessionPayload {
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export async function verifyAdminCredentials(email: string, passwordAttempt: string): Promise<boolean> {
  const cleanEmail = email.trim().toLowerCase();

  // 1. Check MongoDB admin if available
  try {
    const db = await connectToDatabase();
    if (db) {
      const adminDoc = await AdminModel.findOne({ email: cleanEmail });
      if (adminDoc && adminDoc.passwordHash) {
        const isMatch = await bcrypt.compare(passwordAttempt, adminDoc.passwordHash);
        if (isMatch) {
          adminDoc.lastLogin = new Date();
          await adminDoc.save().catch(() => {});
          return true;
        }
      }
    }
  } catch (err) {
    console.warn('[Auth] MongoDB check error:', err);
  }

  // 2. Check environment credentials
  if (cleanEmail === ADMIN_EMAIL.trim().toLowerCase()) {
    // If admin password is provided directly or matches
    if (passwordAttempt === ADMIN_PASSWORD) {
      return true;
    }
    // Check if env password was stored as a bcrypt hash
    try {
      if (ADMIN_PASSWORD.startsWith('$2a$') || ADMIN_PASSWORD.startsWith('$2b$')) {
        const isMatch = await bcrypt.compare(passwordAttempt, ADMIN_PASSWORD);
        if (isMatch) return true;
      }
    } catch {
      // not a hash
    }
  }

  return false;
}

export function createAdminToken(email: string): string {
  return jwt.sign(
    { email, role: 'admin' },
    AUTH_SECRET,
    { expiresIn: '7d' }
  );
}

export function setSessionCookie(res: Response, token: string): void {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  });
}

export function clearSessionCookie(res: Response): void {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
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
