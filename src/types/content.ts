// Create shared types for essays and projects

export interface BaseContent {
  id: string; // UUID from Supabase - primary identifier
  slug?: string; // URL-friendly identifier
  numericId?: number; // Legacy numeric ID for backward compatibility
  title: string; 
  created_at: string;
  updated_at: string;
}

export interface Essay extends BaseContent {
  date: string;
  description: string;
  excerpt?: string;
  published: boolean;
  like_count: number;
  share_count: number;
  view_count: number;
}

interface TimeSavedData {
  hasCalculator: boolean;
  daily?: number;
  weekly?: number;
  alternativeUses?: string[];
}

interface MoneySavedData {
  daily?: number;
  weekly?: number;
  alternativeUses?: string[];
}

export interface Project extends BaseContent {
  status: string;
  value: string;
  beneficiary: string;
  shortDescription: string;
  longDescription: string;
  impact: boolean | string;
  extraContent?: string;
  linkText?: string;
  extraContentLinkText?: string;
  launchDate?: string | null;
  image: string;
  tools: string[];
  timeSaved?: TimeSavedData;
  moneySaved?: MoneySavedData;
  likes: number;
  follows: number;
  show: boolean;
  beforeImpact?: string | null;
  afterImpact?: string | null;
}