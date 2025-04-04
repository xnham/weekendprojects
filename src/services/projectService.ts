import emailjs from '@emailjs/browser';

// Initialize EmailJS
emailjs.init(import.meta.env.VITE_EMAILJS_PUBLIC_KEY);

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
  },

  async sendNotificationEmail(projectId: number, action: string): Promise<void> {
    try {
      // First get the current project details including counts
      const { data: project, error } = await supabase
        .from('projects')
        .select('title, likes, follows')
        .eq('id', projectId)
        .single();
      
      if (error || !project) {
        console.error('Failed to fetch project details:', error);
        return;
      }
      
      // Send email with project details
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        {
          project_id: String(projectId),
          project_title: project.title,
          action: action,
          likes_count: String(project.likes || 0),
          follows_count: String(project.follows || 0),
          email: "wendyham@gmail.com" // Your email address
        }
      );
      console.log(`Notification email sent for ${action} on ${project.title}`);
    } catch (error) {
      console.error('Failed to send notification email:', error);
    }
  },

  async updateLikeCount(projectId: number, increment: boolean): Promise<void> {
    // Update the like count by incrementing or decrementing
    const { error } = await supabase.rpc('update_project_like_count', {
      p_id: projectId,
      increment_by: increment ? 1 : -1
    });
    
    if (error) throw error;
    
    // Only send notification when someone likes (not unlikes)
    if (increment) {
      await this.sendNotificationEmail(projectId, "liked");
    }
  },

  async updateFollowCount(projectId: number, increment: boolean): Promise<void> {
    // Update the follow count by incrementing or decrementing
    const { error } = await supabase.rpc('update_project_follow_count', {
      p_id: projectId,
      increment_by: increment ? 1 : -1
    });
    
    if (error) throw error;
    
    // Only send notification when someone follows (not unfollows)
    if (increment) {
      await this.sendNotificationEmail(projectId, "followed");
    }
  }
}; 