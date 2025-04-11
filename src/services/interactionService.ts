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
    
    // Load essay likes from essay_interactions
    const { data: essayInteractions, error: essayError } = await supabase
      .from('essay_interactions')
      .select('essay_id, has_liked, has_viewed')
      .eq('device_id', deviceId);
      
    if (essayError && essayError.code !== 'PGRST116') throw essayError;
    
    // Load project interactions from project_interactions
    const { data: projectInteractions, error: projectError } = await supabase
      .from('project_interactions')
      .select('project_id, has_liked, has_followed, email')
      .eq('device_id', deviceId);
      
    if (projectError && projectError.code !== 'PGRST116') throw projectError;
    
    // Convert to state object format
    const likesMap = {};
    const followsMap = {}; 
    const viewsMap = {};
    let userEmail: string | undefined;
    
    // Process essay interactions
    essayInteractions?.forEach(interaction => {
      if (interaction.has_liked) {
        likesMap[`${ContentType.ESSAY}:${interaction.essay_id}`] = true;
      }
      
      if (interaction.has_viewed) {
        viewsMap[`${ContentType.ESSAY}:${interaction.essay_id}`] = true;
      }
    });
    
    // Process project interactions
    projectInteractions?.forEach(interaction => {
      if (interaction.has_liked) {
        likesMap[`${ContentType.PROJECT}:${interaction.project_id}`] = true;
      }
      
      if (interaction.has_followed) {
        followsMap[`${ContentType.PROJECT}:${interaction.project_id}`] = true;
      }
      
      // Store user email if provided
      if (interaction.email && !userEmail) {
        userEmail = interaction.email;
      }
    });
    
    // Update store with all data
    interactionStore.update(state => ({
      ...state,
      likes: { ...state.likes, ...likesMap },
      follows: { ...state.follows, ...followsMap },
      views: { ...state.views, ...viewsMap },
      userEmail,
      initialized: true,
      loading: false
    }));
    
    // Save to localStorage for offline persistence
    storage.set('interactions', get(interactionStore));
    
  } catch (error) {
    console.error('Error initializing interactions:', error);
    handleError('Failed to initialize interaction system', error, ErrorSeverity.WARNING);
    
    interactionStore.update(state => ({
      ...state,
      initialized: true,
      loading: false,
      error: 'Failed to initialize interaction system'
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
 * Update project like in Supabase
 */
async function updateProjectLike(projectId: string, hasLiked: boolean): Promise<void> {
  try {
    const deviceId = await getOrCreateDeviceId();
    
    // Check if interaction exists
    const { data, error: checkError } = await supabase
      .from('project_interactions')
      .select('id')
      .eq('device_id', deviceId)
      .eq('project_id', projectId)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') throw checkError;
    
    if (data) {
      // Update existing interaction
      const { error: updateError } = await supabase
        .from('project_interactions')
        .update({ 
          has_liked: hasLiked,
          updated_at: new Date().toISOString()
        })
        .eq('id', data.id);
        
      if (updateError) throw updateError;
    } else {
      // Create new interaction
      const { error: insertError } = await supabase
        .from('project_interactions')
        .insert({
          device_id: deviceId,
          project_id: projectId,
          has_liked: hasLiked,
          has_followed: false
        });
        
      if (insertError) throw insertError;
    }
    
    // Update project likes count
    const updateAmount = hasLiked ? 1 : -1;
    const { error: countError } = await supabase.rpc('update_project_likes', {
      p_project_id: projectId,
      increment: updateAmount
    });
    
    if (countError) throw countError;
    
  } catch (error) {
    console.error('Error updating project like:', error);
    throw error;
  }
}

/**
 * Update user's follow status for a project.
 * This handles both the follow action and collecting email if needed.
 * 
 * @param contentType - Type of content (PROJECT)
 * @param contentId - ID of the project
 * @param email - Optional email for notifications (required for first follow if no email stored)
 * @returns Promise resolving to the new follow state
 */
export async function toggleFollow(
  contentType: ContentType, 
  contentId: string, 
  email?: string
): Promise<{ success: boolean; needsEmail: boolean; newState: boolean }> {
  try {
    // Only allow following projects
    if (contentType !== ContentType.PROJECT) {
      throw new Error(`Following ${contentType} is not supported`);
    }
    
    const key = `${contentType}:${contentId}`;
    const state = get(interactionStore);
    const deviceId = state.deviceId;
    
    // Check if we're currently following
    const currentlyFollowing = state.follows[key] || false;
    
    // Check if we need email (if following and we don't have an email)
    const needsEmail = !currentlyFollowing && !state.userEmail && !email;
    
    // If we need email and none was provided, stop and request email
    if (needsEmail) {
      return { 
        success: false, 
        needsEmail: true,
        newState: currentlyFollowing
      };
    }
    
    // Email to use
    const emailToUse = email || state.userEmail;
    
    // Toggle the follow status optimistically
    const newFollowState = !currentlyFollowing;
    
    // Update local state immediately for responsive UI
    interactionStore.update(state => ({
      ...state,
      follows: {
        ...state.follows,
        [key]: newFollowState
      },
      // If email was provided, store it
      userEmail: emailToUse || state.userEmail
    }));
    
    // Persist to localStorage
    storage.set('interactions', get(interactionStore));
    
    // Update Supabase
    await updateProjectFollow(contentId, newFollowState, emailToUse);
    
    return { 
      success: true, 
      needsEmail: false,
      newState: newFollowState 
    };
  } catch (error) {
    // Get the previous state before we attempted to toggle
    const state = get(interactionStore);
    const key = `${contentType}:${contentId}`;
    const previousFollowState = state.follows[key] || false;
    
    handleError(
      `Failed to ${previousFollowState ? 'unfollow' : 'follow'} ${contentType}`,
      error,
      ErrorSeverity.WARNING,
      'interactionService'
    );
    
    // Revert local state on failure
    interactionStore.update(currentState => ({
      ...currentState,
      follows: {
        ...currentState.follows,
        [key]: previousFollowState
      }
    }));
    
    // Persist the reverted state
    storage.set('interactions', get(interactionStore));
    
    return { 
      success: false, 
      needsEmail: false,
      newState: previousFollowState
    };
  }
}

/**
 * Update project follow in Supabase
 */
async function updateProjectFollow(
  projectId: string, 
  hasFollowed: boolean, 
  email?: string
): Promise<void> {
  try {
    const deviceId = await getOrCreateDeviceId();
    
    // Check if interaction exists
    const { data, error: checkError } = await supabase
      .from('project_interactions')
      .select('id, email')
      .eq('device_id', deviceId)
      .eq('project_id', projectId)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') throw checkError;
    
    if (data) {
      // Update existing interaction
      const { error: updateError } = await supabase
        .from('project_interactions')
        .update({ 
          has_followed: hasFollowed,
          // Only update email if provided and not already set
          ...(email && !data.email ? { email } : {}),
          updated_at: new Date().toISOString()
        })
        .eq('id', data.id);
        
      if (updateError) throw updateError;
    } else {
      // Create new interaction
      const { error: insertError } = await supabase
        .from('project_interactions')
        .insert({
          device_id: deviceId,
          project_id: projectId,
          has_followed: hasFollowed,
          has_liked: false,
          email
        });
        
      if (insertError) throw insertError;
    }
    
    // Update project follows count
    const updateAmount = hasFollowed ? 1 : -1;
    const { error: countError } = await supabase.rpc('update_project_follows', {
      p_project_id: projectId,
      increment: updateAmount
    });
    
    if (countError) throw countError;
    
  } catch (error) {
    console.error('Error updating project follow:', error);
    throw error;
  }
}

/**
 * Record a share for content (essays only)
 */
export async function recordShare(contentType: ContentType, contentId: string): Promise<void> {
  try {
    const key = `${contentType}:${contentId}`;
    const state = get(interactionStore);
    
    // Optimistically update UI
    interactionStore.update(state => ({
      ...state,
      shares: {
        ...state.shares,
        [key]: true
      }
    }));
    
    // Save to localStorage
    storage.set('interactions', get(interactionStore));
    
    // Update Supabase for essays only
    if (contentType === ContentType.ESSAY) {
      await updateEssayShare(contentId);
    }
  } catch (error) {
    console.error('Error recording share:', error);
    // Errors with shares are non-critical, so we don't revert the UI
  }
}

/**
 * Updates share count for an essay in Supabase
 * Increments the share count for each share action
 */
async function updateEssayShare(essayId: string): Promise<void> {
  const state = get(interactionStore);
  const deviceId = state.deviceId;
  
  try {
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
      // Update existing record and increment share_count
      const { error: updateError } = await supabase
        .from('essay_interactions')
        .update({ 
          share_count: (data.share_count || 0) + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', data.id);
          
      if (updateError) throw updateError;
    } else {
      // Create new record with share_count = 1
      const { error: insertError } = await supabase
        .from('essay_interactions')
        .insert({
          device_id: deviceId,
          essay_id: essayId,
          has_liked: false,
          share_count: 1,
          has_viewed: true // Assume they've viewed it if they're sharing it
        });
        
      if (insertError) throw insertError;
    }
    
    // Always increment the essay's share count
    const { error: countError } = await supabase.rpc('update_essay_shares', {
      essay_id: essayId,
      increment: 1
    });
    
    if (countError) throw countError;
  } catch (error) {
    console.error('Error updating essay share:', error);
    throw error;
  }
}

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
  
  try {
    // First, check if interaction record exists
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
        // Update existing record - the trigger will handle the essay like_count update
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
      // Create new record - the trigger will handle the essay like_count update if liked is true
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
    
    // No need to manually call an RPC function - the database trigger handles the count update
    
  } catch (error) {
    console.error('Error updating essay like:', error);
    throw error;
  }
}

/**
 * Updates view status for an essay in Supabase
 */
async function updateEssayView(essayId: string): Promise<void> {
  const state = get(interactionStore);
  const deviceId = state.deviceId;
  
  try {
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
      // Update existing record (update timestamp)
      const { error: updateError } = await supabase
        .from('essay_interactions')
        .update({ 
          has_viewed: true,
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
          share_count: 0,
          has_viewed: true
        });
        
      if (insertError) throw insertError;
    }
    
    // Always increment the view count for each view
    const { error: countError } = await supabase.rpc('update_essay_views', {
      essay_id: essayId,
      increment: 1
    });
    
    if (countError) throw countError;
  } catch (error) {
    console.error('Error updating essay view:', error);
    throw error;
  }
}

/**
 * Record a view for content
 */
export async function recordView(contentType: ContentType, contentId: string): Promise<void> {
  try {
    const key = `${contentType}:${contentId}`;
    const state = get(interactionStore);
    
    // Remove the early return condition to count every view
    // Even if it's the same essay viewed multiple times
    
    // Optimistically update UI
    interactionStore.update(state => ({
      ...state,
      views: {
        ...state.views,
        [key]: true
      }
    }));
    
    // Save to localStorage
    storage.set('interactions', get(interactionStore));
    
    // Update Supabase for essays only
    if (contentType === ContentType.ESSAY) {
      await updateEssayView(contentId);
    }
  } catch (error) {
    console.error('Error recording view:', error);
    // Errors with views are non-critical, so we don't revert the UI
  }
}

/**
 * Record a follow (LEGACY COMPATIBILITY FUNCTION) 
 * 
 * This is maintained for backwards compatibility and calls toggleFollow
 */
export async function recordFollow(contentType: ContentType, contentId: string, email?: string): Promise<void> {
  // Simply delegate to toggleFollow
  try {
    await toggleFollow(contentType, contentId, email);
  } catch (error) {
    console.error('Error in recordFollow:', error);
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
