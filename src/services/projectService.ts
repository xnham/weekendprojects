import { supabase } from '../lib/supabase';

// Define interface for Project type
interface Project {
  id: number;
  title: string;
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
  timeSaved?: any;
  moneySaved?: any;
  likes: number;
  follows: number;
  show: boolean;
  beforeImpact?: string | null;
  afterImpact?: string | null;
}

export const projectService = {
  async getAllProjects(): Promise<Project[]> {
    const { data, error } = await supabase
      .from('projects')
      .select('*');
    
    if (error) throw error;
    return data as Project[];
  },
  
  async getCompletedProjects(): Promise<Project[]> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('status', 'completed')
      .eq('show', true)
      .order('id', { ascending: false });
    
    if (error) throw error;
    return data as Project[];
  },
  
  async getFutureProjects(): Promise<Project[]> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('status', 'future')
      .eq('show', true)
      .order('id', { ascending: true });
    
    if (error) throw error;
    return data as Project[];
  },
  
  async getProjectById(id: number): Promise<Project> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as Project;
  }
}; 