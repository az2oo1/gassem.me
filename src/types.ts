export interface Photo {
  id: number;
  filename: string;
  title: string;
  description: string | null;
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
