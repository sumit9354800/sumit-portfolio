export interface SiteSettings {
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
  updatedAt?: string;
}

export type SiteContent = SiteSettings;


export interface HeroContent {
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
  updatedAt?: string;
}

export interface StatItem {
  label: string;
  value: string | number;
}

export interface AboutContent {
  headline: string;
  paragraphs: string[];
  stats: StatItem[];
  highlights: string[];
  updatedAt?: string;
}

export type SkillCategory = 'frontend' | 'backend' | 'database-tools';

export interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
  description?: string;
  featured: boolean;
  enabled: boolean;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Project {
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
  createdAt?: string;
  updatedAt?: string;
}

export interface Experience {
  id: string;
  title: string;
  role: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
  responsibilities: string[];
  technologies: string[];
  companyUrl: string;
  order: number;
  enabled: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startYear: string;
  endYear: string;
  status: string;
  description: string;
  order: number;
  enabled: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Certification {
  id: string;
  title: string;
  issuer: string;
  year: string;
  description: string;
  credentialUrl?: string;
  order: number;
  enabled: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ContactSettings {
  email: string;
  phone: string;
  location: string;
  availability: string;
  description: string;
  updatedAt?: string;
}

export interface SocialLinks {
  github: string;
  linkedin: string;
  email: string;
  updatedAt?: string;
}

export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  enabled: boolean;
  order: number;
}

export interface PortfolioData {
  site: SiteSettings;
  hero: HeroContent;
  about: AboutContent;
  skills: Skill[];
  projects: Project[];
  experience: Experience[];
  education: Education[];
  certifications: Certification[];
  contact: ContactSettings;
  social: SocialLinks;
  navigation: NavigationItem[];
}
