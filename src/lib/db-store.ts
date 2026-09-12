import fs from 'fs';
import path from 'path';
import { initialPortfolioData } from './seed-data';
import { PortfolioData, Project, Skill, Experience, Education, Certification, SiteSettings, HeroContent, AboutContent, ContactSettings, SocialLinks, NavigationItem } from '../types/portfolio';
import { connectToDatabase, getDatabaseStatus } from './mongodb';
import { SiteModel } from '../models/Site';
import { HeroModel } from '../models/Hero';
import { AboutModel } from '../models/About';
import { SkillModel } from '../models/Skill';
import { ProjectModel } from '../models/Project';
import { ExperienceModel } from '../models/Experience';
import { EducationModel } from '../models/Education';
import { CertificationModel } from '../models/Certification';
import { ContactSettingsModel } from '../models/ContactSettings';
import { SocialLinksModel } from '../models/SocialLinks';
import { NavigationModel } from '../models/Navigation';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'portfolio-store.json');

// Ensure local durable fallback directory exists
function ensureLocalStore(): PortfolioData {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify(initialPortfolioData, null, 2), 'utf-8');
      return initialPortfolioData;
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.warn('[Store] Local file read error, falling back to in-memory initial data:', err);
    return initialPortfolioData;
  }
}

function saveLocalStore(data: PortfolioData): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('[Store] Failed to write local store:', err);
  }
}

export async function getPortfolioData(): Promise<PortfolioData> {
  const db = await connectToDatabase();
  if (db && getDatabaseStatus().connected) {
    try {
      const [siteDoc, heroDoc, aboutDoc, skillsDocs, projectsDocs, expDocs, eduDocs, certDocs, contactDoc, socialDoc, navDocs] = await Promise.all([
        SiteModel.findOne().lean(),
        HeroModel.findOne().lean(),
        AboutModel.findOne().lean(),
        SkillModel.find().sort({ order: 1 }).lean(),
        ProjectModel.find().sort({ order: 1 }).lean(),
        ExperienceModel.find().sort({ order: 1 }).lean(),
        EducationModel.find().sort({ order: 1 }).lean(),
        CertificationModel.find().sort({ order: 1 }).lean(),
        ContactSettingsModel.findOne().lean(),
        SocialLinksModel.findOne().lean(),
        NavigationModel.find().sort({ order: 1 }).lean(),
      ]);

      const local = ensureLocalStore();

      return {
        site: (siteDoc as unknown as SiteSettings) || local.site,
        hero: (heroDoc as unknown as HeroContent) || local.hero,
        about: (aboutDoc as unknown as AboutContent) || local.about,
        skills: skillsDocs.length > 0 ? (skillsDocs as unknown as Skill[]) : local.skills,
        projects: projectsDocs.length > 0 ? (projectsDocs as unknown as Project[]) : local.projects,
        experience: expDocs.length > 0 ? (expDocs as unknown as Experience[]) : local.experience,
        education: eduDocs.length > 0 ? (eduDocs as unknown as Education[]) : local.education,
        certifications: certDocs.length > 0 ? (certDocs as unknown as Certification[]) : local.certifications,
        contact: (contactDoc as unknown as ContactSettings) || local.contact,
        social: (socialDoc as unknown as SocialLinks) || local.social,
        navigation: navDocs.length > 0 ? (navDocs as unknown as NavigationItem[]) : local.navigation,
      };
    } catch (err) {
      console.warn('[MongoDB] Query failed, using local store:', err);
    }
  }

  return ensureLocalStore();
}

// Sync all data into MongoDB (e.g. from seed or local store)
export async function syncToMongoDB(data: PortfolioData): Promise<boolean> {
  const db = await connectToDatabase();
  if (!db || !getDatabaseStatus().connected) {
    return false;
  }

  try {
    await Promise.all([
      SiteModel.findOneAndUpdate({}, data.site, { upsert: true, new: true }),
      HeroModel.findOneAndUpdate({}, data.hero, { upsert: true, new: true }),
      AboutModel.findOneAndUpdate({}, data.about, { upsert: true, new: true }),
      ContactSettingsModel.findOneAndUpdate({}, data.contact, { upsert: true, new: true }),
      SocialLinksModel.findOneAndUpdate({}, data.social, { upsert: true, new: true }),
    ]);

    for (const skill of data.skills) {
      await SkillModel.findOneAndUpdate({ id: skill.id }, skill, { upsert: true });
    }
    await ProjectModel.deleteMany({ slug: { $in: ['fashion-e-commerce', 'fashion-ecommerce'] } });
    for (const project of data.projects) {
      await ProjectModel.findOneAndUpdate({ id: project.id }, project, { upsert: true });
    }
    for (const exp of data.experience) {
      await ExperienceModel.findOneAndUpdate({ id: exp.id }, exp, { upsert: true });
    }
    for (const edu of data.education) {
      await EducationModel.findOneAndUpdate({ id: edu.id }, edu, { upsert: true });
    }
    for (const cert of data.certifications) {
      await CertificationModel.findOneAndUpdate({ id: cert.id }, cert, { upsert: true });
    }
    for (const nav of data.navigation) {
      await NavigationModel.findOneAndUpdate({ id: nav.id }, nav, { upsert: true });
    }
    return true;
  } catch (err) {
    console.error('[MongoDB] Sync error:', err);
    return false;
  }
}

// Mutators that save to both local cache and MongoDB
export async function updateSiteSettings(site: Partial<SiteSettings>): Promise<SiteSettings> {
  const current = await getPortfolioData();
  const updated: SiteSettings = {
    ...current.site,
    ...site,
    seo: {
      ...current.site.seo,
      ...(site.seo || {}),
    },
    updatedAt: new Date().toISOString(),
  };

  current.site = updated;
  saveLocalStore(current);

  const db = await connectToDatabase();
  if (db && getDatabaseStatus().connected) {
    try {
      await SiteModel.findOneAndUpdate({}, updated, { upsert: true, new: true });
    } catch (e) {
      console.warn('[MongoDB] Site update error:', e);
    }
  }
  return updated;
}

export async function updateHeroContent(hero: Partial<HeroContent>): Promise<HeroContent> {
  const current = await getPortfolioData();
  const updated: HeroContent = {
    ...current.hero,
    ...hero,
    updatedAt: new Date().toISOString(),
  };

  current.hero = updated;
  saveLocalStore(current);

  const db = await connectToDatabase();
  if (db && getDatabaseStatus().connected) {
    try {
      await HeroModel.findOneAndUpdate({}, updated, { upsert: true, new: true });
    } catch (e) {
      console.warn('[MongoDB] Hero update error:', e);
    }
  }
  return updated;
}

export async function updateAboutContent(about: Partial<AboutContent>): Promise<AboutContent> {
  const current = await getPortfolioData();
  const updated: AboutContent = {
    ...current.about,
    ...about,
    updatedAt: new Date().toISOString(),
  };

  current.about = updated;
  saveLocalStore(current);

  const db = await connectToDatabase();
  if (db && getDatabaseStatus().connected) {
    try {
      await AboutModel.findOneAndUpdate({}, updated, { upsert: true, new: true });
    } catch (e) {
      console.warn('[MongoDB] About update error:', e);
    }
  }
  return updated;
}

// Project CRUD
export async function saveProject(project: Partial<Project> & { id?: string }): Promise<Project> {
  const current = await getPortfolioData();
  const now = new Date().toISOString();
  let saved: Project;

  if (project.id) {
    const idx = current.projects.findIndex((p) => p.id === project.id);
    if (idx >= 0) {
      saved = {
        ...current.projects[idx],
        ...project,
        updatedAt: now,
      } as Project;
      current.projects[idx] = saved;
    } else {
      saved = {
        id: project.id,
        title: project.title || 'Untitled Project',
        slug: project.slug || `project-${Date.now()}`,
        category: project.category || 'Full Stack',
        year: project.year || String(new Date().getFullYear()),
        role: project.role || 'Full Stack Developer',
        description: project.description || '',
        technologies: project.technologies || [],
        image: project.image || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200&auto=format&fit=crop',
        liveUrl: project.liveUrl || '',
        githubUrl: project.githubUrl || '',
        challenges: project.challenges || '',
        solution: project.solution || '',
        features: project.features || [],
        featured: Boolean(project.featured),
        published: project.published !== false,
        order: project.order ?? current.projects.length + 1,
        createdAt: now,
        updatedAt: now,
      };
      current.projects.push(saved);
    }
  } else {
    const newId = `proj-${Date.now()}`;
    saved = {
      id: newId,
      title: project.title || 'New Project',
      slug: project.slug || (project.title ? project.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') : newId),
      category: project.category || 'Full Stack',
      year: project.year || String(new Date().getFullYear()),
      role: project.role || 'Full Stack Developer',
      description: project.description || '',
      technologies: project.technologies || [],
      image: project.image || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200&auto=format&fit=crop',
      liveUrl: project.liveUrl || '',
      githubUrl: project.githubUrl || '',
      challenges: project.challenges || '',
      solution: project.solution || '',
      features: project.features || [],
      featured: Boolean(project.featured),
      published: project.published !== false,
      order: project.order ?? current.projects.length + 1,
      createdAt: now,
      updatedAt: now,
    };
    current.projects.push(saved);
  }

  saveLocalStore(current);

  const db = await connectToDatabase();
  if (db && getDatabaseStatus().connected) {
    try {
      await ProjectModel.findOneAndUpdate({ id: saved.id }, saved, { upsert: true, new: true });
    } catch (e) {
      console.warn('[MongoDB] Project save error:', e);
    }
  }

  return saved;
}

export async function deleteProject(id: string): Promise<boolean> {
  const current = await getPortfolioData();
  const initialLength = current.projects.length;
  current.projects = current.projects.filter((p) => p.id !== id);

  if (current.projects.length !== initialLength) {
    saveLocalStore(current);
    const db = await connectToDatabase();
    if (db && getDatabaseStatus().connected) {
      try {
        await ProjectModel.deleteOne({ id });
      } catch (e) {
        console.warn('[MongoDB] Project delete error:', e);
      }
    }
    return true;
  }
  return false;
}

// Skills CRUD
export async function saveSkill(skill: Partial<Skill> & { id?: string }): Promise<Skill> {
  const current = await getPortfolioData();
  let saved: Skill;

  if (skill.id) {
    const idx = current.skills.findIndex((s) => s.id === skill.id);
    if (idx >= 0) {
      saved = { ...current.skills[idx], ...skill } as Skill;
      current.skills[idx] = saved;
    } else {
      saved = {
        id: skill.id,
        name: skill.name || 'New Skill',
        category: skill.category || 'frontend',
        description: skill.description || '',
        featured: Boolean(skill.featured),
        enabled: skill.enabled !== false,
        order: skill.order ?? current.skills.length + 1,
      };
      current.skills.push(saved);
    }
  } else {
    const newId = `sk-${Date.now()}`;
    saved = {
      id: newId,
      name: skill.name || 'New Skill',
      category: skill.category || 'frontend',
      description: skill.description || '',
      featured: Boolean(skill.featured),
      enabled: skill.enabled !== false,
      order: skill.order ?? current.skills.length + 1,
    };
    current.skills.push(saved);
  }

  saveLocalStore(current);

  const db = await connectToDatabase();
  if (db && getDatabaseStatus().connected) {
    try {
      await SkillModel.findOneAndUpdate({ id: saved.id }, saved, { upsert: true, new: true });
    } catch (e) {
      console.warn('[MongoDB] Skill save error:', e);
    }
  }
  return saved;
}

export async function deleteSkill(id: string): Promise<boolean> {
  const current = await getPortfolioData();
  const initialLength = current.skills.length;
  current.skills = current.skills.filter((s) => s.id !== id);

  if (current.skills.length !== initialLength) {
    saveLocalStore(current);
    const db = await connectToDatabase();
    if (db && getDatabaseStatus().connected) {
      try {
        await SkillModel.deleteOne({ id });
      } catch (e) {
        console.warn('[MongoDB] Skill delete error:', e);
      }
    }
    return true;
  }
  return false;
}

// Experience CRUD
export async function saveExperience(exp: Partial<Experience> & { id?: string }): Promise<Experience> {
  const current = await getPortfolioData();
  let saved: Experience;

  if (exp.id) {
    const idx = current.experience.findIndex((e) => e.id === exp.id);
    if (idx >= 0) {
      saved = { ...current.experience[idx], ...exp } as Experience;
      current.experience[idx] = saved;
    } else {
      saved = {
        id: exp.id,
        title: exp.title || 'Role',
        role: exp.role || 'Role',
        company: exp.company || 'Company',
        location: exp.location || 'Delhi, India',
        startDate: exp.startDate || '2023',
        endDate: exp.endDate || 'Present',
        description: exp.description || '',
        responsibilities: exp.responsibilities || [],
        technologies: exp.technologies || [],
        companyUrl: exp.companyUrl || '',
        order: exp.order ?? current.experience.length + 1,
        enabled: exp.enabled !== false,
      };
      current.experience.push(saved);
    }
  } else {
    const newId = `exp-${Date.now()}`;
    saved = {
      id: newId,
      title: exp.title || 'New Experience',
      role: exp.role || 'Developer',
      company: exp.company || 'Company',
      location: exp.location || 'Delhi, India',
      startDate: exp.startDate || '2023',
      endDate: exp.endDate || 'Present',
      description: exp.description || '',
      responsibilities: exp.responsibilities || [],
      technologies: exp.technologies || [],
      companyUrl: exp.companyUrl || '',
      order: exp.order ?? current.experience.length + 1,
      enabled: exp.enabled !== false,
    };
    current.experience.push(saved);
  }

  saveLocalStore(current);

  const db = await connectToDatabase();
  if (db && getDatabaseStatus().connected) {
    try {
      await ExperienceModel.findOneAndUpdate({ id: saved.id }, saved, { upsert: true, new: true });
    } catch (e) {
      console.warn('[MongoDB] Experience save error:', e);
    }
  }
  return saved;
}

export async function deleteExperience(id: string): Promise<boolean> {
  const current = await getPortfolioData();
  const initialLength = current.experience.length;
  current.experience = current.experience.filter((e) => e.id !== id);

  if (current.experience.length !== initialLength) {
    saveLocalStore(current);
    const db = await connectToDatabase();
    if (db && getDatabaseStatus().connected) {
      try {
        await ExperienceModel.deleteOne({ id });
      } catch (e) {
        console.warn('[MongoDB] Experience delete error:', e);
      }
    }
    return true;
  }
  return false;
}

// Education CRUD
export async function saveEducation(edu: Partial<Education> & { id?: string }): Promise<Education> {
  const current = await getPortfolioData();
  let saved: Education;

  if (edu.id) {
    const idx = current.education.findIndex((e) => e.id === edu.id);
    if (idx >= 0) {
      saved = { ...current.education[idx], ...edu } as Education;
      current.education[idx] = saved;
    } else {
      saved = {
        id: edu.id,
        institution: edu.institution || 'University',
        degree: edu.degree || 'Degree',
        field: edu.field || 'Field',
        startYear: edu.startYear || '2024',
        endYear: edu.endYear || '2027',
        status: edu.status || 'In Progress',
        description: edu.description || '',
        order: edu.order ?? current.education.length + 1,
        enabled: edu.enabled !== false,
      };
      current.education.push(saved);
    }
  } else {
    const newId = `edu-${Date.now()}`;
    saved = {
      id: newId,
      institution: edu.institution || 'University',
      degree: edu.degree || 'Degree',
      field: edu.field || 'Field',
      startYear: edu.startYear || '2024',
      endYear: edu.endYear || '2027',
      status: edu.status || 'In Progress',
      description: edu.description || '',
      order: edu.order ?? current.education.length + 1,
      enabled: edu.enabled !== false,
    };
    current.education.push(saved);
  }

  saveLocalStore(current);

  const db = await connectToDatabase();
  if (db && getDatabaseStatus().connected) {
    try {
      await EducationModel.findOneAndUpdate({ id: saved.id }, saved, { upsert: true, new: true });
    } catch (e) {
      console.warn('[MongoDB] Education save error:', e);
    }
  }
  return saved;
}

export async function deleteEducation(id: string): Promise<boolean> {
  const current = await getPortfolioData();
  const initialLength = current.education.length;
  current.education = current.education.filter((e) => e.id !== id);

  if (current.education.length !== initialLength) {
    saveLocalStore(current);
    const db = await connectToDatabase();
    if (db && getDatabaseStatus().connected) {
      try {
        await EducationModel.deleteOne({ id });
      } catch (e) {
        console.warn('[MongoDB] Education delete error:', e);
      }
    }
    return true;
  }
  return false;
}

// Certifications CRUD
export async function saveCertification(cert: Partial<Certification> & { id?: string }): Promise<Certification> {
  const current = await getPortfolioData();
  let saved: Certification;

  if (cert.id) {
    const idx = current.certifications.findIndex((c) => c.id === cert.id);
    if (idx >= 0) {
      saved = { ...current.certifications[idx], ...cert } as Certification;
      current.certifications[idx] = saved;
    } else {
      saved = {
        id: cert.id,
        title: cert.title || 'Certification',
        issuer: cert.issuer || '',
        year: cert.year || '',
        description: cert.description || '',
        credentialUrl: cert.credentialUrl || '',
        order: cert.order ?? current.certifications.length + 1,
        enabled: cert.enabled !== false,
      };
      current.certifications.push(saved);
    }
  } else {
    const newId = `cert-${Date.now()}`;
    saved = {
      id: newId,
      title: cert.title || 'Certification',
      issuer: cert.issuer || '',
      year: cert.year || '',
      description: cert.description || '',
      credentialUrl: cert.credentialUrl || '',
      order: cert.order ?? current.certifications.length + 1,
      enabled: cert.enabled !== false,
    };
    current.certifications.push(saved);
  }

  saveLocalStore(current);

  const db = await connectToDatabase();
  if (db && getDatabaseStatus().connected) {
    try {
      await CertificationModel.findOneAndUpdate({ id: saved.id }, saved, { upsert: true, new: true });
    } catch (e) {
      console.warn('[MongoDB] Certification save error:', e);
    }
  }
  return saved;
}

export async function deleteCertification(id: string): Promise<boolean> {
  const current = await getPortfolioData();
  const initialLength = current.certifications.length;
  current.certifications = current.certifications.filter((c) => c.id !== id);

  if (current.certifications.length !== initialLength) {
    saveLocalStore(current);
    const db = await connectToDatabase();
    if (db && getDatabaseStatus().connected) {
      try {
        await CertificationModel.deleteOne({ id });
      } catch (e) {
        console.warn('[MongoDB] Certification delete error:', e);
      }
    }
    return true;
  }
  return false;
}

export async function updateContactSettings(contact: Partial<ContactSettings>): Promise<ContactSettings> {
  const current = await getPortfolioData();
  const updated: ContactSettings = {
    ...current.contact,
    ...contact,
    updatedAt: new Date().toISOString(),
  };

  current.contact = updated;
  saveLocalStore(current);

  const db = await connectToDatabase();
  if (db && getDatabaseStatus().connected) {
    try {
      await ContactSettingsModel.findOneAndUpdate({}, updated, { upsert: true, new: true });
    } catch (e) {
      console.warn('[MongoDB] Contact update error:', e);
    }
  }
  return updated;
}

export async function updateSocialLinks(social: Partial<SocialLinks>): Promise<SocialLinks> {
  const current = await getPortfolioData();
  const updated: SocialLinks = {
    ...current.social,
    ...social,
    updatedAt: new Date().toISOString(),
  };

  current.social = updated;
  saveLocalStore(current);

  const db = await connectToDatabase();
  if (db && getDatabaseStatus().connected) {
    try {
      await SocialLinksModel.findOneAndUpdate({}, updated, { upsert: true, new: true });
    } catch (e) {
      console.warn('[MongoDB] Social update error:', e);
    }
  }
  return updated;
}

export async function updateNavigationItems(items: NavigationItem[]): Promise<NavigationItem[]> {
  const current = await getPortfolioData();
  current.navigation = items;
  saveLocalStore(current);

  const db = await connectToDatabase();
  if (db && getDatabaseStatus().connected) {
    try {
      for (const item of items) {
        await NavigationModel.findOneAndUpdate({ id: item.id }, item, { upsert: true });
      }
    } catch (e) {
      console.warn('[MongoDB] Navigation update error:', e);
    }
  }
  return items;
}
