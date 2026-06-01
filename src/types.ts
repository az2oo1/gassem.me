export interface Photo {
  id: number;
  filename: string;
  title: string;
  titleAr?: string | null;
  description: string | null;
  descriptionAr?: string | null;
  location: string | null;
  createdAt: string;
  avgRating?: number | null;
  ratingCount?: number;
}

export interface LinkItem {
  id: number;
  name: string;
  url: string;
  icon: string | null;
}

export interface Skill {
  id: number;
  name: string;
  level: string;
  icon?: string | null;
}

export interface Project {
  id: number;
  title: string;
  description: string | null;
  tech_stack: string | null;
  githubUrl: string | null;
  liveUrl: string | null;
  icon?: string | null;
}

export interface Article {
  id: number;
  title: string;
  excerpt: string | null;
  content: string;
  createdAt: string;
}

export interface Certificate {
  id: number;
  title: string;
  issuer: string;
  issue_date: string | null;
  url: string | null;
  pdf_filename: string | null;
}
