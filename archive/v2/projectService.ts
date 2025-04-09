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
  },

  // New methods for managing project followers

  async addProjectFollower(projectId: number, email: string): Promise<void> {
    // First check if this relationship already exists
    const { data: existingFollow, error: checkError } = await supabase
      .from('project_followers')
      .select('id')
      .eq('project_id', projectId)
      .eq('email', email.toLowerCase())
      .maybeSingle();
      
    if (checkError) throw checkError;
    
    // Only add if not already following
    if (!existingFollow) {
      const { error } = await supabase
        .from('project_followers')
        .insert({
          project_id: projectId,
          email: email.toLowerCase(),
          created_at: new Date().toISOString()
        });
        
      if (error) throw error;
    }
  },

  async removeProjectFollower(projectId: number, email: string): Promise<void> {
    const { error } = await supabase
      .from('project_followers')
      .delete()
      .eq('project_id', projectId)
      .eq('email', email.toLowerCase());
      
    if (error) throw error;
  },

  async isFollowingProject(projectId: number, email: string): Promise<boolean> {
    if (!email) return false;
    
    const { data, error } = await supabase
      .from('project_followers')
      .select('id')
      .eq('project_id', projectId)
      .eq('email', email.toLowerCase())
      .maybeSingle();
      
    if (error) throw error;
    return !!data;
  },

  async getProjectFollowers(projectId: number): Promise<string[]> {
    const { data, error } = await supabase
      .from('project_followers')
      .select('email')
      .eq('project_id', projectId);
      
    if (error) throw error;
    return data.map(row => row.email);
  },

  async getFollowedProjects(email: string): Promise<number[]> {
    if (!email) return [];
    
    const { data, error } = await supabase
      .from('project_followers')
      .select('project_id')
      .eq('email', email.toLowerCase());
      
    if (error) throw error;
    return data.map(row => row.project_id);
  }
}; 