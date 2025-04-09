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
}

// Create a writable store to manage interaction state
const interactionStore = writable<InteractionState>({
  deviceId: '',
  likes: {},
  shares: {},
  follows: {},
  views: {}
});

/**
 * Initialize the interaction system
 */
export async function initializeInteractions(): Promise<void> {
  try {
    // Load data from localStorage
    const storedData = storage.get('interactions');
    if (storedData) {
      interactionStore.set(storedData);
    }
    
    // Sync with Supabase
    await syncWithSupabase();
  } catch (error) {
    handleError(
      'Failed to initialize interaction system',
      error,
      ErrorSeverity.ERROR,
      'interactionService'
    );
    
    // Fallback - still try to use localStorage data
    const storedData = storage.get('interactions');
    if (storedData) {
      interactionStore.set(storedData);
    }
  }
}

/**
 * Loads all interaction data from Supabase for the given device ID.
 * This consolidates data from multiple tables into a unified state object.
 * 
 * @param deviceId - The unique identifier for the current device
 */
async function loadInteractionsFromSupabase(deviceId: string) {
  try {
    // Fetch all essay interactions
    const { data: essayData, error: essayError } = await supabase
      .from('essay_interactions')
      .select('essay_id, has_liked, has_shared, has_viewed')
      .eq('device_id', deviceId);
      
    if (essayError) {
      handleError('Error loading essay interactions', essayError);
    }
    
    // Fetch all project interactions
    const { data: projectData, error: projectError } = await supabase
      .from('project_followers')
      .select('project_id')
      .eq('device_id', deviceId);
      
    if (projectError) {
      handleError('Error loading project follows', projectError);
    }
    
    // Get liked projects from localStorage for backward compatibility
    const storedCompletedLikes = storage.getItem('completedLikedProjects');
    const storedFutureLikes = storage.getItem('nextUserData');
    
    // Initialize interaction objects
    const likes: { [key: string]: boolean } = {};
    const follows: { [key: string]: boolean } = {};
    const shares: { [key: string]: boolean } = {};
    const views: { [key: string]: boolean } = {};
    
    // Process essay interactions
    if (essayData) {
      essayData.forEach(interaction => {
        if (interaction.has_liked) {
          likes[`${ContentType.ESSAY}:${interaction.essay_id}`] = true;
        }
        if (interaction.has_shared) {
          shares[`${ContentType.ESSAY}:${interaction.essay_id}`] = true;
        }
        if (interaction.has_viewed) {
          views[`${ContentType.ESSAY}:${interaction.essay_id}`] = true;
        }
      });
    }
    
    // Process project follows
    if (projectData) {
      projectData.forEach(follow => {
        follows[`${ContentType.PROJECT}:${follow.project_id}`] = true;
      });
    }
    
    // Process legacy project likes from localStorage
    if (storedCompletedLikes) {
      try {
        const completedLikes = JSON.parse(storedCompletedLikes);
        Object.keys(completedLikes).forEach(projectId => {
          if (completedLikes[projectId]) {
            likes[`${ContentType.PROJECT}:${projectId}`] = true;
          }
        });
      } catch (error) {
        handleError('Error parsing stored completed likes', error);
      }
    }
    
    if (storedFutureLikes) {
      try {
        const userData = JSON.parse(storedFutureLikes);
        if (userData.likes) {
          Object.keys(userData.likes).forEach(projectId => {
            if (userData.likes[projectId]) {
              likes[`${ContentType.PROJECT}:${projectId}`] = true;
            }
          });
        }
      } catch (error) {
        handleError('Error parsing stored future likes', error);
      }
    }
    
    // Update the store with loaded data
    interactionStore.update(state => ({
      ...state,
      likes,
      follows,
      shares,
      views
    }));
  } catch (error) {
    handleError('Error loading interactions from Supabase', error);
  }
}

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
    
    // Update Supabase (async)
    await updateSupabaseLike(contentType, contentId, newLikeState);
    
    return newLikeState;
  } catch (error) {
    const state = get(interactionStore);
    const key = `${contentType}:${contentId}`;
    
    handleError(
      `Failed to ${state.likes[key] ? 'unlike' : 'like'} ${contentType}`,
      error,
      ErrorSeverity.WARNING,
      'interactionService'
    );
    
    // Rollback local state on failure
    interactionStore.update(currentState => ({
      ...currentState,
      likes: {
        ...currentState.likes,
        [key]: state.likes[key] || false
      }
    }));
    
    return state.likes[key] || false;
  }
}

/**
 * Record a share for content
 */
export async function recordShare(contentType: ContentType, contentId: string): Promise<void> {
  try {
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
    
    // Update Supabase (async)
    await updateSupabaseShare(contentType, contentId);
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
 * Record a view for content
 */
export async function recordView(contentType: ContentType, contentId: string): Promise<void> {
  try {
    const key = `${contentType}:${contentId}`;
    const state = get(interactionStore);
    
    // Only record view once per session
    if (state.views[key]) {
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
    
    // Update Supabase (async)
    await updateSupabaseView(contentType, contentId);
  } catch (error) {
    handleError(
      `Failed to record view for ${contentType}`,
      error,
      ErrorSeverity.WARNING,
      'interactionService'
    );
  }
}

/**
 * Record a follow for a project
 */
export async function recordFollow(contentType: ContentType, contentId: string): Promise<boolean> {
  try {
    // Only allow follows for projects
    if (contentType !== ContentType.PROJECT) {
      throw new Error('Only projects can be followed');
    }
    
    const key = `${contentType}:${contentId}`;
    const state = get(interactionStore);
    
    // Toggle the follow status
    const newFollowState = !state.follows[key];
    
    // Update local state
    interactionStore.update(state => ({
      ...state,
      follows: {
        ...state.follows,
        [key]: newFollowState
      }
    }));
    
    // Persist to localStorage
    storage.set('interactions', get(interactionStore));
    
    // Update Supabase (async)
    await updateSupabaseFollow(contentType, contentId, newFollowState);
    
    return newFollowState;
  } catch (error) {
    const state = get(interactionStore);
    const key = `${contentType}:${contentId}`;
    
    handleError(
      `Failed to ${state.follows[key] ? 'unfollow' : 'follow'} project`,
      error,
      ErrorSeverity.WARNING,
      'interactionService'
    );
    
    // Return previous state on failure
    return state.follows[key] || false;
  }
}

/**
 * Updates an essay interaction in Supabase.
 * 
 * @param essayId - The essay ID
 * @param field - The interaction field to update (has_liked, has_shared, has_viewed)
 * @param value - The new value for the field
 */
async function updateEssayInteraction(essayId: string, field: string, value: boolean): Promise<void> {
  const state = get(interactionStore);
  const deviceId = state.deviceId;
  
  // Check if interaction exists
  const { data, error } = await supabase
    .from('essay_interactions')
    .select('id')
    .eq('device_id', deviceId)
    .eq('essay_id', essayId)
    .single();
    
  if (error && error.code !== 'PGRST116') { // PGRST116 = not found, which is expected
    throw error;
  }
  
  if (data) {
    // Update existing interaction
    const { error: updateError } = await supabase
      .from('essay_interactions')
      .update({ [field]: value })
      .eq('id', data.id);
      
    if (updateError) throw updateError;
  } else {
    // Create new interaction
    const { error: insertError } = await supabase
      .from('essay_interactions')
      .insert({
        device_id: deviceId,
        essay_id: essayId,
        [field]: value
      });
      
    if (insertError) throw insertError;
  }
}

/**
 * Updates local storage for project likes to maintain backward compatibility.
 * 
 * @param projectId - The project ID
 * @param liked - Whether the project is liked or not
 */
function updateLocalProjectLikes(projectId: string, liked: boolean): void {
  // Handle completed projects
  const completedLikes = storage.getItem('completedLikedProjects', {});
  completedLikes[projectId] = liked;
  storage.setItem('completedLikedProjects', completedLikes);
  
  // Handle future projects
  const userData = storage.getItem('nextUserData', {
    email: '',
    follows: [],
    likes: {}
  });
  
  userData.likes[projectId] = liked;
  storage.setItem('nextUserData', userData);
}

/**
 * Reverts an optimistic like update in case of backend failure.
 * 
 * @param contentType - The content type
 * @param contentId - The content ID
 */
function revertOptimisticLikeUpdate(contentType: ContentType, contentId: string): void {
  const state = get(interactionStore);
  const key = `${contentType}:${contentId}`;
  const currentValue = state.likes[key] || false;
  
  interactionStore.update(state => ({
    ...state,
    likes: {
      ...state.likes,
      [key]: !currentValue // Revert to opposite of current state
    }
  }));
}

/**
 * Reverts an optimistic follow update in case of backend failure.
 * 
 * @param contentId - The content ID
 */
function revertOptimisticFollowUpdate(contentId: string): void {
  const state = get(interactionStore);
  const key = `${ContentType.PROJECT}:${contentId}`;
  const currentValue = state.follows[key] || false;
  
  interactionStore.update(state => ({
    ...state,
    follows: {
      ...state.follows,
      [key]: !currentValue // Revert to opposite of current state
    }
  }));
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
 * Subscribes to interaction state changes.
 * Components should subscribe to receive updates when interactions change.
 * 
 * @param callback - Function to call when state changes
 * @returns Unsubscribe function
 */
export function subscribeToInteractions(
  callback: (state: Omit<InteractionState, 'deviceId'>) => void
) {
  return interactionStore.subscribe(state => {
    // Omit deviceId from callback for privacy
    const { deviceId, ...rest } = state;
    callback(rest);
  });
}

/**
 * Sync with Supabase database
 */
async function syncWithSupabase(): Promise<void> {
  try {
    // Generate a device ID if not already set
    let state = get(interactionStore);
    
    if (!state.deviceId) {
      const deviceId = uuidv4();
      interactionStore.update(state => ({
        ...state,
        deviceId
      }));
      state = get(interactionStore);
    }
    
    // Load interactions from Supabase
    await loadInteractionsFromSupabase(state.deviceId);
    
  } catch (error) {
    handleError(
      'Failed to sync interaction data with server',
      error,
      ErrorSeverity.ERROR,
      'interactionService'
    );
    
    // This is a sync error, so we'll rely on local data
    // and try again next time
  }
}

/**
 * Updates like status in Supabase.
 */
async function updateSupabaseLike(contentType: ContentType, contentId: string, liked: boolean): Promise<void> {
  try {
    const state = get(interactionStore);
    
    if (contentType === ContentType.ESSAY) {
      // Update essay like in Supabase
      await updateEssayInteraction(contentId, 'has_liked', liked);
      
      // Update essay likes count in essays table
      const { error } = await supabase.rpc('update_essay_likes', { 
        essay_id: contentId, 
        increment: liked ? 1 : -1 
      });
      
      if (error) throw error;
    } 
    else if (contentType === ContentType.PROJECT) {
      // Update project like in legacy local storage for backward compatibility
      updateLocalProjectLikes(contentId, liked);
      
      // Update project likes count in projects table
      const { error } = await supabase.rpc('update_project_likes', {
        project_id: contentId,
        increment: liked ? 1 : -1
      });
      
      if (error) throw error;
    }
  } catch (error) {
    // Re-throw to let the calling function handle error
    throw error;
  }
}

/**
 * Updates share status in Supabase.
 */
async function updateSupabaseShare(contentType: ContentType, contentId: string): Promise<void> {
  try {
    const state = get(interactionStore);
    
    if (contentType === ContentType.ESSAY) {
      // Update essay share in Supabase
      await updateEssayInteraction(contentId, 'has_shared', true);
      
      // Increment essay shares count
      const { error } = await supabase.rpc('update_essay_shares', { 
        essay_id: contentId, 
        increment: 1 
      });
      
      if (error) throw error;
    } 
    else if (contentType === ContentType.PROJECT) {
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

/**
 * Updates view status in Supabase.
 */
async function updateSupabaseView(contentType: ContentType, contentId: string): Promise<void> {
  try {
    const state = get(interactionStore);
    
    if (contentType === ContentType.ESSAY) {
      // Update essay view in Supabase
      await updateEssayInteraction(contentId, 'has_viewed', true);
      
      // Increment essay views count
      const { error } = await supabase.rpc('update_essay_views', { 
        essay_id: contentId, 
        increment: 1 
      });
      
      if (error) throw error;
    } 
    else if (contentType === ContentType.PROJECT) {
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

/**
 * Updates follow status in Supabase.
 */
async function updateSupabaseFollow(contentType: ContentType, contentId: string, followed: boolean): Promise<void> {
  try {
    const state = get(interactionStore);
    
    if (contentType !== ContentType.PROJECT) {
      throw new Error('Only projects can be followed');
    }
    
    // Check if follow entry exists
    const { data, error } = await supabase
      .from('project_followers')
      .select('id')
      .eq('device_id', state.deviceId)
      .eq('project_id', contentId)
      .single();
      
    if (error && error.code !== 'PGRST116') throw error;
    
    if (followed) {
      // Create follow if it doesn't exist
      if (!data) {
        const { error: insertError } = await supabase
          .from('project_followers')
          .insert({
            device_id: state.deviceId,
            project_id: contentId,
            created_at: new Date().toISOString()
          });
          
        if (insertError) throw insertError;
      }
      
      // Update follows count
      const { error: updateError } = await supabase.rpc('update_project_follows', {
        project_id: contentId,
        increment: 1
      });
      
      if (updateError) throw updateError;
    } else {
      // Remove follow if it exists
      if (data) {
        const { error: deleteError } = await supabase
          .from('project_followers')
          .delete()
          .eq('id', data.id);
          
        if (deleteError) throw deleteError;
        
        // Update follows count
        const { error: updateError } = await supabase.rpc('update_project_follows', {
          project_id: contentId,
          increment: -1
        });
        
        if (updateError) throw updateError;
      }
    }
  } catch (error) {
    // Re-throw to let the calling function handle error
    throw error;
  }
}
