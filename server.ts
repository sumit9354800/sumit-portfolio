import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { z } from 'zod';
import {
  getPortfolioData,
  updateSiteSettings,
  updateHeroContent,
  updateAboutContent,
  saveProject,
  deleteProject,
  saveSkill,
  deleteSkill,
  saveExperience,
  deleteExperience,
  saveEducation,
  deleteEducation,
  saveCertification,
  deleteCertification,
  updateContactSettings,
  updateSocialLinks,
  updateNavigationItems,
  syncToMongoDB,
} from './src/lib/db-store';
import {
  verifyAdminCredentials,
  createAdminToken,
  setSessionCookie,
  clearSessionCookie,
  verifyAdminSession,
} from './src/lib/auth';
import { sendContactEmail } from './src/lib/resend';
import { checkRateLimit } from './src/lib/rate-limit';
import { sanitizeString, sanitizeEmail } from './src/lib/sanitize';
import { getDatabaseStatus } from './src/lib/mongodb';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cookieParser());

// Rate limit helper for express
function rateLimiterMiddleware(maxRequests = 10, windowMs = 60 * 1000) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown-client';
    const check = checkRateLimit(ip, maxRequests, windowMs);
    if (!check.allowed) {
      res.status(429).json({
        success: false,
        error: `Too many requests. Please try again in ${check.retryAfterSec || 30} seconds.`,
      });
      return;
    }
    next();
  };
}

// Authentication guard for admin routes
function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const session = verifyAdminSession(req);
  if (!session) {
    res.status(401).json({
      success: false,
      error: 'Unauthorized: Admin authentication session is invalid or expired.',
    });
    return;
  }
  (req as any).admin = session;
  next();
}

// ==========================================
// PUBLIC API ROUTES
// ==========================================

// Health check endpoint
app.get('/api/health', async (_req: Request, res: Response) => {
  const dbStatus = getDatabaseStatus();
  res.json({
    status: 'ok',
    database: {
      connected: dbStatus.connected,
      configured: dbStatus.configured,
      state: dbStatus.state,
    },
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// GET public portfolio data
app.get('/api/portfolio', async (_req: Request, res: Response) => {
  try {
    const data = await getPortfolioData();
    // Only return published projects and enabled skills for the public viewer
    const publicData = {
      ...data,
      projects: data.projects.filter((p) => p.published).sort((a, b) => a.order - b.order),
      skills: data.skills.filter((s) => s.enabled).sort((a, b) => a.order - b.order),
      experience: data.experience.filter((e) => e.enabled).sort((a, b) => a.order - b.order),
      education: data.education.filter((ed) => ed.enabled).sort((a, b) => a.order - b.order),
      certifications: data.certifications.filter((c) => c.enabled).sort((a, b) => a.order - b.order),
      navigation: data.navigation.filter((n) => n.enabled).sort((a, b) => a.order - b.order),
    };

    res.json({ success: true, data: publicData });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch portfolio data';
    res.status(500).json({ success: false, error: message });
  }
});

// Contact form schema
const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(3, 'Subject must be at least 3 characters').max(150),
  message: z.string().min(10, 'Message must be at least 10 characters').max(3000),
  honeypot: z.string().optional(), // Anti-spam trap
});

// POST visitor contact message
app.post('/api/contact', rateLimiterMiddleware(5, 60 * 1000), async (req: Request, res: Response) => {
  try {
    const parseResult = contactSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        error: parseResult.error.issues[0]?.message || 'Validation error',
      });
      return;
    }

    const { name, email, subject, message, honeypot } = parseResult.data;

    // Silent spam rejection if honeypot is filled
    if (honeypot && honeypot.trim().length > 0) {
      res.json({ success: true, message: 'Message sent successfully.' });
      return;
    }

    const cleanName = sanitizeString(name);
    const cleanEmail = sanitizeEmail(email);
    const cleanSubject = sanitizeString(subject);
    const cleanMessage = sanitizeString(message);

    const emailResult = await sendContactEmail({
      name: cleanName,
      email: cleanEmail,
      subject: cleanSubject,
      message: cleanMessage,
    });

    if (!emailResult.success) {
      res.status(500).json({
        success: false,
        error: emailResult.error || 'Unable to deliver message right now. Please try again later.',
      });
      return;
    }

    res.json({
      success: true,
      message: emailResult.simulated
        ? 'Message recorded in development mode. Thank you!'
        : 'Message sent successfully. I will respond within 24 hours.',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    res.status(500).json({ success: false, error: message });
  }
});

// ==========================================
// ADMIN AUTHENTICATION ROUTES
// ==========================================

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

app.post('/api/admin/login', rateLimiterMiddleware(5, 60 * 1000), async (req: Request, res: Response) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: parsed.error.issues[0]?.message || 'Validation error' });
      return;
    }

    const { email, password } = parsed.data;
    const isValid = await verifyAdminCredentials(email, password);

    if (!isValid) {
      res.status(401).json({ success: false, error: 'Invalid email or password.' });
      return;
    }

    const token = createAdminToken(email);
    setSessionCookie(res, token);

    res.json({
      success: true,
      data: {
        email,
        name: 'Sumit Shrivastav',
        role: 'admin',
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Login failed';
    res.status(500).json({ success: false, error: message });
  }
});

app.post('/api/admin/logout', (_req: Request, res: Response) => {
  clearSessionCookie(res);
  res.json({ success: true, message: 'Logged out successfully.' });
});

app.get('/api/admin/me', (req: Request, res: Response) => {
  const session = verifyAdminSession(req);
  if (!session) {
    res.status(401).json({ success: false, error: 'Not authenticated' });
    return;
  }
  res.json({ success: true, data: session });
});

// Admin System Status
app.get('/api/admin/status', requireAdmin, async (_req: Request, res: Response) => {
  try {
    const dbStatus = getDatabaseStatus();
    const data = await getPortfolioData();
    res.json({
      success: true,
      data: {
        database: {
          configured: dbStatus.configured,
          connected: dbStatus.connected,
          state: dbStatus.state,
          type: dbStatus.connected ? 'MongoDB Atlas' : 'Local Durable Store (Preview)',
        },
        counts: {
          projectsTotal: data.projects.length,
          projectsPublished: data.projects.filter((p) => p.published).length,
          skillsTotal: data.skills.length,
          experienceTotal: data.experience.length,
          educationTotal: data.education.length,
          certificationsTotal: data.certifications.length,
        },
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to get status';
    res.status(500).json({ success: false, error: message });
  }
});

// GET all content for Admin CMS (includes drafts & unlisted)
app.get('/api/admin/data', requireAdmin, async (_req: Request, res: Response) => {
  try {
    const data = await getPortfolioData();
    res.json({ success: true, data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to load CMS data';
    res.status(500).json({ success: false, error: message });
  }
});

// Site & SEO updates
app.put('/api/admin/site', requireAdmin, async (req: Request, res: Response) => {
  try {
    const updated = await updateSiteSettings(req.body);
    res.json({ success: true, data: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update site settings';
    res.status(500).json({ success: false, error: message });
  }
});

// Hero updates
app.put('/api/admin/hero', requireAdmin, async (req: Request, res: Response) => {
  try {
    const updated = await updateHeroContent(req.body);
    res.json({ success: true, data: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update hero content';
    res.status(500).json({ success: false, error: message });
  }
});

// About updates
app.put('/api/admin/about', requireAdmin, async (req: Request, res: Response) => {
  try {
    const updated = await updateAboutContent(req.body);
    res.json({ success: true, data: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update about content';
    res.status(500).json({ success: false, error: message });
  }
});

// Project CRUD
app.post('/api/admin/projects', requireAdmin, async (req: Request, res: Response) => {
  try {
    const saved = await saveProject(req.body);
    res.json({ success: true, data: saved });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create project';
    res.status(500).json({ success: false, error: message });
  }
});

app.put('/api/admin/projects/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const saved = await saveProject({ ...req.body, id: req.params.id });
    res.json({ success: true, data: saved });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update project';
    res.status(500).json({ success: false, error: message });
  }
});

app.delete('/api/admin/projects/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const deleted = await deleteProject(req.params.id);
    if (!deleted) {
      res.status(404).json({ success: false, error: 'Project not found' });
      return;
    }
    res.json({ success: true, message: 'Project deleted successfully.' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete project';
    res.status(500).json({ success: false, error: message });
  }
});

// Skills CRUD
app.post('/api/admin/skills', requireAdmin, async (req: Request, res: Response) => {
  try {
    const saved = await saveSkill(req.body);
    res.json({ success: true, data: saved });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create skill';
    res.status(500).json({ success: false, error: message });
  }
});

app.put('/api/admin/skills/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const saved = await saveSkill({ ...req.body, id: req.params.id });
    res.json({ success: true, data: saved });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update skill';
    res.status(500).json({ success: false, error: message });
  }
});

app.delete('/api/admin/skills/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const deleted = await deleteSkill(req.params.id);
    if (!deleted) {
      res.status(404).json({ success: false, error: 'Skill not found' });
      return;
    }
    res.json({ success: true, message: 'Skill deleted successfully.' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete skill';
    res.status(500).json({ success: false, error: message });
  }
});

// Experience CRUD
app.post('/api/admin/experience', requireAdmin, async (req: Request, res: Response) => {
  try {
    const saved = await saveExperience(req.body);
    res.json({ success: true, data: saved });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to save experience';
    res.status(500).json({ success: false, error: message });
  }
});

app.put('/api/admin/experience/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const saved = await saveExperience({ ...req.body, id: req.params.id });
    res.json({ success: true, data: saved });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update experience';
    res.status(500).json({ success: false, error: message });
  }
});

app.delete('/api/admin/experience/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const deleted = await deleteExperience(req.params.id);
    if (!deleted) {
      res.status(404).json({ success: false, error: 'Experience not found' });
      return;
    }
    res.json({ success: true, message: 'Experience deleted successfully.' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete experience';
    res.status(500).json({ success: false, error: message });
  }
});

// Education CRUD
app.post('/api/admin/education', requireAdmin, async (req: Request, res: Response) => {
  try {
    const saved = await saveEducation(req.body);
    res.json({ success: true, data: saved });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to save education';
    res.status(500).json({ success: false, error: message });
  }
});

app.put('/api/admin/education/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const saved = await saveEducation({ ...req.body, id: req.params.id });
    res.json({ success: true, data: saved });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update education';
    res.status(500).json({ success: false, error: message });
  }
});

app.delete('/api/admin/education/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const deleted = await deleteEducation(req.params.id);
    if (!deleted) {
      res.status(404).json({ success: false, error: 'Education not found' });
      return;
    }
    res.json({ success: true, message: 'Education deleted successfully.' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete education';
    res.status(500).json({ success: false, error: message });
  }
});

// Certifications CRUD
app.post('/api/admin/certifications', requireAdmin, async (req: Request, res: Response) => {
  try {
    const saved = await saveCertification(req.body);
    res.json({ success: true, data: saved });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to save certification';
    res.status(500).json({ success: false, error: message });
  }
});

app.put('/api/admin/certifications/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const saved = await saveCertification({ ...req.body, id: req.params.id });
    res.json({ success: true, data: saved });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update certification';
    res.status(500).json({ success: false, error: message });
  }
});

app.delete('/api/admin/certifications/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const deleted = await deleteCertification(req.params.id);
    if (!deleted) {
      res.status(404).json({ success: false, error: 'Certification not found' });
      return;
    }
    res.json({ success: true, message: 'Certification deleted successfully.' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete certification';
    res.status(500).json({ success: false, error: message });
  }
});

// Contact, Social, Navigation admin endpoints
app.put('/api/admin/contact', requireAdmin, async (req: Request, res: Response) => {
  try {
    const updated = await updateContactSettings(req.body);
    res.json({ success: true, data: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update contact settings';
    res.status(500).json({ success: false, error: message });
  }
});

app.put('/api/admin/social', requireAdmin, async (req: Request, res: Response) => {
  try {
    const updated = await updateSocialLinks(req.body);
    res.json({ success: true, data: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update social links';
    res.status(500).json({ success: false, error: message });
  }
});

app.put('/api/admin/navigation', requireAdmin, async (req: Request, res: Response) => {
  try {
    const updated = await updateNavigationItems(req.body);
    res.json({ success: true, data: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update navigation';
    res.status(500).json({ success: false, error: message });
  }
});

// Sync local store to MongoDB
const handleSyncMongo = async (_req: Request, res: Response) => {
  try {
    const data = await getPortfolioData();
    const ok = await syncToMongoDB(data);
    if (!ok) {
      res.status(503).json({ success: false, error: 'MongoDB Atlas is not connected or URI is missing.' });
      return;
    }
    res.json({ success: true, message: 'Successfully synced all portfolio items to MongoDB!' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to sync to MongoDB';
    res.status(500).json({ success: false, error: message });
  }
};

app.post('/api/admin/sync-mongodb', requireAdmin, handleSyncMongo);
app.post('/api/admin/sync-to-mongo', requireAdmin, handleSyncMongo);


// ==========================================
// VITE MIDDLEWARE / STATIC ASSETS
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Sumit Shrivastav Portfolio] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
