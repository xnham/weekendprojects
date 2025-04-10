/**
 * Unified Interaction Service
 * 
 * This service provides a centralized system for handling user interactions
 * with content across the application, including essays and projects.
 * 
 * Key features:
 * - Unified data model for all interaction types (likes, shares, follows, views)
 * - Consistent identification of content using ContentType enum and IDs
 * - Persistent storage using both Supabase and localStorage
 * - Reactive state management using Svelte stores
 * - Proper error handling through centralized error handler
 * 
 * Usage examples:
 * 
 * 1. Toggle a like on an essay:
 *    toggleLike(ContentType.ESSAY, essayId);
 * 
 * 2. Record a share on a project:
 *    recordShare(ContentType.PROJECT, projectId);
 * 
 * 3. Check if content is liked:
 *    const isContentLiked = isLiked(`${ContentType.ESSAY}:${essayId}`);
 * 
 * 4. Subscribe to interaction changes:
 *    const unsubscribe = subscribeToInteractions(state => {
 *      // Update your component state based on the new interaction state
 *    });
 */

import { supabase } from '../lib/supabase';
import { writable, get } from 'svelte/store';
import { v4 as uuidv4 } from 'uuid';
import { handleError, ErrorSeverity } from '../utils/errorHandler';

// Implement a simple localStorage wrapper if your storage module is different
const storage = {
  get: (key: string, defaultValue: any = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      console.error(`Error retrieving ${key} from localStorage:`, e);
      return defaultValue;
    }
  },
  
  set: (key: string, value: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`Error saving ${key} to localStorage:`, e);
    }
  },
  
  getItem: (key: string, defaultValue: any = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      console.error(`Error retrieving ${key} from localStorage:`, e);
      return defaultValue;
    }
  },
  
  setItem: (key: string, value: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`Error saving ${key} to localStorage:`, e);
    }
  }
};

/**
 * Enum for content types to ensure consistent identification
 * across the application.
 */
export enum ContentType {
  ESSAY = 'essay',
  PROJECT = 'project'
}

/**
 * Interface for the interaction state store.
 * This defines the structure of user interaction data.
 */
interface InteractionState {
  deviceId: string;
  likes: { [key: string]: boolean };  // Format: "contentType:contentId" -> boolean
  shares: { [key: string]: boolean };  // Format: "contentType:contentId" -> boolean
  follows: { [key: string]: boolean }; // Format: "contentType:contentId" -> boolean
  views: { [key: string]: boolean };   // Format: "contentType:contentId" -> boolean
  userEmail?: string; // Store user email globally
  initialized: boolean;
  loading: boolean;
  error?: string;
}

// Create a writable store to manage interaction state
const interactionStore = writable<InteractionState>({
  deviceId: '',
  likes: {},
  shares: {},
  follows: {},
  views: {},
  initialized: false,
  loading: true
});

/**
 * Gets or creates a device ID for the current user
 */
export async function getOrCreateDeviceId(): Promise<string> {
  // Check localStorage first
  let deviceId = localStorage.getItem('deviceId');
  
  if (deviceId) {
    // Remove any quotes that might be wrapping the UUID
    deviceId = deviceId.replace(/^"(.*)"$/, '$1');
  } else {
    // Create a new UUID if none exists
    deviceId = crypto.randomUUID ? crypto.randomUUID() : 
      Math.random().toString(36).substring(2, 15) + 
      Math.random().toString(36).substring(2, 15);
    
    // Store in localStorage without quotes
    localStorage.setItem('deviceId', deviceId);
  }
  
  return deviceId;
}

/**
 * Initialize the interaction system
 */
async function initializeInteractions(): Promise<void> {
  try {
    // Get or create device ID
    const deviceId = await getOrCreateDeviceId();
    
    // Initialize store with device ID
    interactionStore.update(state => ({
      ...state,
      deviceId,
      initialized: false,
      loading: true
    }));
    
    // Load follows from project_followers table
    const { data: projectFollows, error: followsError } = await supabase
      .from('project_followers')
      .select('project_id, email')
      .eq('device_id', deviceId);
    
    if (followsError && followsError.code !== 'PGRST116') throw followsError;
    
    // Load essay likes from essay_interactions
    const { data: essayInteractions, error: essayError } = await supabase
      .from('essay_interactions')
      .select('essay_id, has_liked, has_viewed')
      .eq('device_id', deviceId);
      
    if (essayError && essayError.code !== 'PGRST116') throw essayError;
    
    // Convert to state object format
    const likesMap = {};
    const followsMap = {};
    const viewsMap = {};
    let userEmail: string | undefined;
    
    // Process project follows
    projectFollows?.forEach(follow => {
      followsMap[`${ContentType.PROJECT}:${follow.project_id}`] = true;
      
      // Get the first email we find (assuming same email for all follows)
      if (!userEmail && follow.email) {
        userEmail = follow.email;
      }
    });
    
    // Process essay interactions
    essayInteractions?.forEach(interaction => {
      if (interaction.has_liked) {
        likesMap[`${ContentType.ESSAY}:${interaction.essay_id}`] = true;
      }
      
      if (interaction.has_viewed) {
        viewsMap[`${ContentType.ESSAY}:${interaction.essay_id}`] = true;
      }
    });
    
    // Update store with loaded data
    interactionStore.update(state => ({
      ...state,
      likes: likesMap,
      follows: followsMap,
      views: viewsMap,
      userEmail,
      initialized: true,
      loading: false
    }));
    
  } catch (error) {
    console.error('Error initializing interactions:', error);
    interactionStore.update(state => ({
      ...state,
      error: 'Failed to load interaction data',
      initialized: false,
      loading: false
    }));
  }
}

// Call initialize on module load
initializeInteractions();

// Export functions
export { initializeInteractions };

/**
 * Toggle like status for content
 */
export async function toggleLike(contentType: ContentType, contentId: string): Promise<boolean> {
  try {
    const key = `${contentType}:${contentId}`;
    const state = get(interactionStore);
    
    // Toggle the like status
    const newLikeState = !state.likes[key];
    
    // Update local state immediately for responsive UI
    interactionStore.update(state => ({
      ...state,
      likes: {
        ...state.likes,
        [key]: newLikeState
      }
    }));
    
    // Persist to localStorage
    storage.set('interactions', get(interactionStore));
    
    // Update Supabase
    if (contentType === ContentType.ESSAY) {
      await updateEssayLike(contentId, newLikeState);
    } else if (contentType === ContentType.PROJECT) {
      await updateProjectLike(contentId, newLikeState);
    }
    
    return newLikeState;
  } catch (error) {
    // Get the previous state before we attempted to toggle
    const state = get(interactionStore);
    const key = `${contentType}:${contentId}`;
    const previousLikeState = state.likes[key] || false;
    
    handleError(
      `Failed to ${previousLikeState ? 'unlike' : 'like'} ${contentType}`,
      error,
      ErrorSeverity.WARNING,
      'interactionService'
    );
    
    // Revert local state on failure
    interactionStore.update(currentState => ({
      ...currentState,
      likes: {
        ...currentState.likes,
        [key]: previousLikeState
      }
    }));
    
    // Persist the reverted state
    storage.set('interactions', get(interactionStore));
    
    return previousLikeState;
  }
}

/**
 * Record a share for content
 */
export async function recordShare(contentType: ContentType, contentId: string): Promise<void> {
  try {
    const state = get(interactionStore);
    const key = `${contentType}:${contentId}`;
    
    // Update local state 
    interactionStore.update(state => ({
      ...state,
      shares: {
        ...state.shares,
        [key]: true
      }
    }));
    
    // Persist to localStorage
    storage.set('interactions', get(interactionStore));
    
    // Update Supabase
    if (contentType === ContentType.ESSAY) {
      await updateEssayShare(contentId);
    } else if (contentType === ContentType.PROJECT) {
      await updateSupabaseShare(contentType, contentId);
    }
  } catch (error) {
    handleError(
      `Failed to record share for ${contentType}`,
      error,
      ErrorSeverity.WARNING,
      'interactionService'
    );
  }
}

/**
 * Record a view for an essay
 */
export async function recordView(contentType: ContentType, contentId: string): Promise<void> {
  if (contentType !== ContentType.ESSAY) {
    return; // Only track views for essays
  }
  
  try {
    const state = get(interactionStore);
    const deviceId = state.deviceId;
    const key = `${contentType}:${contentId}`;
    
    // Skip if we've already recorded this view
    if (state.views && state.views[key]) {
      return; 
    }
    
    // Update local state
    interactionStore.update(state => ({
      ...state,
      views: {
        ...state.views,
        [key]: true
      }
    }));
    
    // Persist to localStorage
    storage.set('interactions', get(interactionStore));
    
    // Check if interaction record exists - use .match() instead of .eq() for device_id
    // This avoids issues with UUID formatting in the URL
    const { data, error } = await supabase
      .from('essay_interactions')
      .select('id, has_viewed')
      .eq('device_id', deviceId) // Supabase client will format this correctly
      .eq('essay_id', contentId)
      .single();
    
    if (error && error.code !== 'PGRST116') { // Not found
      console.error('Error checking interaction:', error);
      throw error;
    }
    
    if (data) {
      // Only update if not already viewed
      if (!data.has_viewed) {
        const { error: updateError } = await supabase
          .from('essay_interactions')
          .update({ 
            has_viewed: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', data.id);
          
        if (updateError) {
          console.error('Error updating interaction:', updateError);
        }
      }
    } else {
      // Create new record
      const { error: insertError } = await supabase
        .from('essay_interactions')
        .insert({
          device_id: deviceId,
          essay_id: contentId,
          has_liked: false,
          share_count: 0,
          has_viewed: true
        });
        
      if (insertError) {
        console.error('Error inserting interaction:', insertError);
      }
    }
    
  } catch (error) {
    console.error(`Failed to record view for essay ${contentId}:`, error);
  }
}

/**
 * Update the user's follow status for a project.
 * This handles both the follow action and collecting email if needed.
 * 
 * @param contentType - Type of content (PROJECT)
 * @param contentId - ID of the project
 * @param email - Optional email for notifications (required for first follow if no email stored)
 * @returns Promise resolving to the new follow state
 */
export async function toggleFollow(contentType: ContentType, contentId: string, email?: string): Promise<boolean> {
  try {
    const key = `${contentType}:${contentId}`;
    const state = get(interactionStore);
    
    // Toggle the follow status
    const newFollowState = !state.follows[key];
    
    // Use stored email if available and no new email provided
    const emailToUse = email || state.userEmail;
    
    // If user is following and we don't have an email, throw error
    if (newFollowState && !emailToUse && contentType === ContentType.PROJECT) {
      throw new Error('Email is required to follow a project');
    }
    
    // Update local state immediately for responsive UI
    interactionStore.update(state => ({
      ...state,
      follows: {
        ...state.follows,
        [key]: newFollowState
      },
      // Update user email if one was provided
      ...(email ? { userEmail: email } : {})
    }));
    
    // Update Supabase
    if (contentType === ContentType.PROJECT) {
      await updateProjectFollow(contentId, newFollowState, emailToUse);
    }
    
    return newFollowState;
  } catch (error) {
    // Get the previous state before we attempted to toggle
    const state = get(interactionStore);
    const key = `${contentType}:${contentId}`;
    const previousFollowState = state.follows[key] || false;
    
    console.error(`Failed to ${previousFollowState ? 'unfollow' : 'follow'} ${contentType}:`, error);
    
    // Revert local state on failure
    interactionStore.update(currentState => ({
      ...currentState,
      follows: {
        ...currentState.follows,
        [key]: previousFollowState
      }
    }));
    
    return previousFollowState;
  }
}

/**
 * Updates project follow status in Supabase.
 * This handles both follow/unfollow actions and count updates.
 */
async function updateProjectFollow(projectId: string, followed: boolean, email?: string): Promise<void> {
  try {
    const state = get(interactionStore);
    const deviceId = state.deviceId;
    
    if (followed) {
      if (!email) {
        throw new Error('Email is required for new follows');
      }
      
      // Insert new follow record
      const { error: insertError } = await supabase
        .from('project_followers')
        .insert({
          device_id: deviceId,
          project_id: projectId,
          email,
          created_at: new Date().toISOString()
        });
        
      if (insertError) throw insertError;
      
      // Update follows count using RPC
      const { error: updateError } = await supabase.rpc('update_project_follows', {
        project_id: projectId,
        increment: 1
      });
      
      if (updateError) throw updateError;
      
      // Store email in state
      interactionStore.update(currentState => ({
        ...currentState,
        userEmail: email
      }));
      
    } else {
      // Delete follow record
      const { error: deleteError } = await supabase
        .from('project_followers')
        .delete()
        .eq('device_id', deviceId)
        .eq('project_id', projectId);
        
      if (deleteError) throw deleteError;
      
      // Update follows count using RPC
      const { error: updateError } = await supabase.rpc('update_project_follows', {
        project_id: projectId,
        increment: -1
      });
      
      if (updateError) throw updateError;
    }
    
  } catch (error) {
    console.error('Error updating project follow:', error);
    throw error;
  }
}

// Replace recordFollow with toggleFollow for consistency
export { toggleFollow as recordFollow };

/**
 * Checks if a content item is liked by the current user.
 * 
 * @param contentKey - The content key in format "contentType:contentId"
 * @returns Boolean indicating if content is liked
 */
export function isLiked(contentKey: string): boolean {
  const state = get(interactionStore);
  return !!state.likes[contentKey];
}

/**
 * Checks if a project is followed by the current user.
 * 
 * @param contentKey - The content key in format "contentType:contentId"
 * @returns Boolean indicating if project is followed
 */
export function isFollowing(contentKey: string): boolean {
  const state = get(interactionStore);
  return !!state.follows[contentKey];
}

/**
 * Gets the current interaction state.
 * Useful for initial component setup.
 * 
 * @returns The current interaction state
 */
export function getInteractionState(): Omit<InteractionState, 'deviceId'> {
  const state = get(interactionStore);
  // Omit deviceId from return value for privacy
  const { deviceId, ...rest } = state;
  return rest;
}

/**
 * Subscribe to interaction state changes
 */
export function subscribeToInteractions(callback: (state: any) => void): () => void {
  // Initialize if not already done
  if (!get(interactionStore).initialized && !get(interactionStore).loading) {
    initializeInteractions();
  }
  
  return interactionStore.subscribe(callback);
}

/**
 * Updates like status for an essay in Supabase
 */
async function updateEssayLike(essayId: string, liked: boolean): Promise<void> {
  const state = get(interactionStore);
  const deviceId = state.deviceId;
  
  // Check if interaction record exists
  const { data, error } = await supabase
    .from('essay_interactions')
    .select('id, has_liked')
    .eq('device_id', deviceId)
    .eq('essay_id', essayId)
    .single();
  
  if (error && error.code !== 'PGRST116') { // PGRST116 = not found
    throw error;
  }
  
  if (data) {
    // Only update if the state has changed
    if (data.has_liked !== liked) {
      // Update existing record
      const { error: updateError } = await supabase
        .from('essay_interactions')
        .update({ 
          has_liked: liked,
          updated_at: new Date().toISOString()
        })
        .eq('id', data.id);
        
      if (updateError) throw updateError;
    }
  } else {
    // Create new record
    const { error: insertError } = await supabase
      .from('essay_interactions')
      .insert({
        device_id: deviceId,
        essay_id: essayId,
        has_liked: liked,
        share_count: 0,
        has_viewed: true // Assume they've viewed it if they're liking it
      });
      
    if (insertError) throw insertError;
  }
}

/**
 * Updates share count for an essay in Supabase
 */
async function updateEssayShare(essayId: string): Promise<void> {
  const state = get(interactionStore);
  const deviceId = state.deviceId;
  
  // Check if interaction record exists
  const { data, error } = await supabase
    .from('essay_interactions')
    .select('id, share_count')
    .eq('device_id', deviceId)
    .eq('essay_id', essayId)
    .single();
  
  if (error && error.code !== 'PGRST116') { // PGRST116 = not found
    throw error;
  }
  
  if (data) {
    // Update existing record - increment share count
    const { error: updateError } = await supabase
      .from('essay_interactions')
      .update({ 
        share_count: (data.share_count || 0) + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', data.id);
      
    if (updateError) throw updateError;
  } else {
    // Create new record
    const { error: insertError } = await supabase
      .from('essay_interactions')
      .insert({
        device_id: deviceId,
        essay_id: essayId,
        has_liked: false,
        share_count: 1,
        has_viewed: true // Assume viewed if sharing
      });
      
    if (insertError) throw insertError;
  }
}

/**
 * Updates view status for an essay in Supabase
 */
async function updateEssayView(essayId: string): Promise<void> {
  const state = get(interactionStore);
  const deviceId = state.deviceId;
  
  // Check if interaction record exists
  const { data, error } = await supabase
    .from('essay_interactions')
    .select('id, has_viewed')
    .eq('device_id', deviceId)
    .eq('essay_id', essayId)
    .single();
  
  if (error && error.code !== 'PGRST116') { // PGRST116 = not found
    throw error;
  }
  
  if (data) {
    // Only update if not already viewed
    if (!data.has_viewed) {
      const { error: updateError } = await supabase
        .from('essay_interactions')
        .update({ 
          has_viewed: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', data.id);
        
      if (updateError) throw updateError;
    }
  } else {
    // Create new record
    const { error: insertError } = await supabase
      .from('essay_interactions')
      .insert({
        device_id: deviceId,
        essay_id: essayId,
        has_liked: false,
        share_count: 0,
        has_viewed: true
      });
      
    if (insertError) throw insertError;
  }
}

/**
 * Updates like status in Supabase.
 * This uses the existing implementation for now.
 */
async function updateProjectLike(contentId: string, liked: boolean): Promise<void> {
  try {
    const state = get(interactionStore);
    
    // Update project like in legacy local storage for backward compatibility
    updateLocalProjectLikes(contentId, liked);
    
    // Update project likes count in projects table
    const { error } = await supabase.rpc('update_project_likes', {
      project_id: contentId,
      increment: liked ? 1 : -1
    });
    
    if (error) throw error;
  } catch (error) {
    // Re-throw to let the calling function handle error
    throw error;
  }
}

// These functions are kept for backward compatibility until we update the project tables
async function updateSupabaseShare(contentType: ContentType, contentId: string): Promise<void> {
  try {
    if (contentType === ContentType.PROJECT) {
      // Update project shares count
      const { error } = await supabase.rpc('update_project_shares', {
        project_id: contentId,
        increment: 1
      });
      
      if (error) throw error;
    }
  } catch (error) {
    // Re-throw to let the calling function handle error
    throw error;
  }
}

async function updateSupabaseView(contentType: ContentType, contentId: string): Promise<void> {
  try {
    if (contentType === ContentType.PROJECT) {
      // Update project views count
      const { error } = await supabase.rpc('update_project_views', {
        project_id: contentId,
        increment: 1
      });
      
      if (error) throw error;
    }
  } catch (error) {
    // Re-throw to let the calling function handle error
    throw error;
  }
}

// For backward compatibility
function updateLocalProjectLikes(projectId: string, liked: boolean) {
  try {
    // Get existing liked projects
    const likedProjectsJSON = localStorage.getItem('likedProjects');
    let likedProjects = likedProjectsJSON ? JSON.parse(likedProjectsJSON) : [];

    if (liked) {
      // Add project to liked list if not already there
      if (!likedProjects.includes(projectId)) {
        likedProjects.push(projectId);
      }
    } else {
      // Remove project from liked list
      likedProjects = likedProjects.filter(id => id !== projectId);
    }

    // Save updated list
    localStorage.setItem('likedProjects', JSON.stringify(likedProjects));
  } catch (e) {
    console.error('Error updating local project likes:', e);
  }
}

// If loaded from a non-app page or as a module
if (typeof window !== 'undefined') {
  // Try to load from localStorage on initialization
  const storedInteractions = storage.get('interactions');
  if (storedInteractions) {
    interactionStore.set({
      ...storedInteractions,
      initialized: false // Still need server data
    });
  }
}
