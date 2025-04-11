/**
 * Essay Interaction Service
 * 
 * This service provides functionality for handling user interactions
 * with essays across the application.
 * 
 * Key features:
 * - Manages likes, shares, and views for essays
 * - Persistent storage using both Supabase and localStorage
 * - Reactive state management using Svelte stores
 */

import { supabase } from '../lib/supabase';
import { writable, get } from 'svelte/store';
import { v4 as uuidv4 } from 'uuid';
import { handleError, ErrorSeverity } from '../utils/errorHandler';

// Implement a simple localStorage wrapper
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
 */
export enum ContentType {
  ESSAY = 'essay'
}

/**
 * Interface for the essay interaction state store.
 * This defines the structure of user interaction data for essays.
 */
interface EssayInteractionState {
  deviceId: string;
  likes: { [key: string]: boolean };  // Format: "essay:essayId" -> boolean
  shares: { [key: string]: boolean };  // Format: "essay:essayId" -> boolean
  views: { [key: string]: boolean };   // Format: "essay:essayId" -> boolean
  initialized: boolean;
  loading: boolean;
  error?: string;
}

// Create a writable store to manage essay interaction state
const essayInteractionStore = writable<EssayInteractionState>({
  deviceId: '',
  likes: {},
  shares: {},
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
 * Initialize the essay interaction system
 */
export async function initializeEssayInteractions(): Promise<void> {
  try {
    // Get or create device ID
    const deviceId = await getOrCreateDeviceId();
    
    // Initialize store with device ID
    essayInteractionStore.update(state => ({
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
    
    // Convert to state object format
    const likesMap = {};
    const viewsMap = {};
    
    // Process essay interactions
    essayInteractions?.forEach(interaction => {
      if (interaction.has_liked) {
        likesMap[`${ContentType.ESSAY}:${interaction.essay_id}`] = true;
      }
      
      if (interaction.has_viewed) {
        viewsMap[`${ContentType.ESSAY}:${interaction.essay_id}`] = true;
      }
    });
    
    // Update store with all data
    essayInteractionStore.update(state => ({
      ...state,
      likes: { ...state.likes, ...likesMap },
      views: { ...state.views, ...viewsMap },
      initialized: true,
      loading: false
    }));
    
    // Save to localStorage for offline persistence
    storage.set('essayInteractions', get(essayInteractionStore));
    
  } catch (error) {
    handleError(
      'Failed to initialize essay interaction service',
      error,
      ErrorSeverity.ERROR,
      'essayInteractionService'
    );
    
    essayInteractionStore.update(state => ({
      ...state,
      error: error instanceof Error ? error.message : 'Failed to initialize',
      initialized: true,
      loading: false
    }));
  }
}

// Call initialize on module load
initializeEssayInteractions();

/**
 * Toggle like status for an essay
 */
export async function toggleLike(essayId: string): Promise<boolean> {
  try {
    const key = `${ContentType.ESSAY}:${essayId}`;
    const state = get(essayInteractionStore);
    
    // Toggle the like status
    const newLikeState = !state.likes[key];
    
    // Update local state immediately for responsive UI
    essayInteractionStore.update(state => ({
      ...state,
      likes: {
        ...state.likes,
        [key]: newLikeState
      }
    }));
    
    // Persist to localStorage
    storage.set('essayInteractions', get(essayInteractionStore));
    
    // Update Supabase
    await updateEssayLike(essayId, newLikeState);
    
    return newLikeState;
  } catch (error) {
    // Get the previous state before we attempted to toggle
    const state = get(essayInteractionStore);
    const key = `${ContentType.ESSAY}:${essayId}`;
    const previousLikeState = state.likes[key] || false;
    
    handleError(
      `Failed to ${previousLikeState ? 'unlike' : 'like'} essay`,
      error,
      ErrorSeverity.WARNING,
      'essayInteractionService'
    );
    
    // Revert local state on failure
    essayInteractionStore.update(currentState => ({
      ...currentState,
      likes: {
        ...currentState.likes,
        [key]: previousLikeState
      }
    }));
    
    // Persist the reverted state
    storage.set('essayInteractions', get(essayInteractionStore));
    
    return previousLikeState;
  }
}

/**
 * Updates like status for an essay in Supabase
 */
async function updateEssayLike(essayId: string, liked: boolean): Promise<void> {
  const state = get(essayInteractionStore);
  const deviceId = state.deviceId;
  
  try {
    // Check if interaction record exists
    const { data, error } = await supabase
      .from('essay_interactions')
      .select('id')
      .eq('device_id', deviceId)
      .eq('essay_id', essayId)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = not found
      throw error;
    }
    
    if (data) {
      // Update existing record
      const { error: updateError } = await supabase
        .from('essay_interactions')
        .update({ 
          has_liked: liked,
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
          has_liked: liked,
          has_viewed: true // Assume they've viewed it if they're liking it
        });
        
      if (insertError) throw insertError;
    }
    
    // Update essay like count
    const { error: countError } = await supabase.rpc('update_essay_likes', {
      essay_id: essayId,
      increment: liked ? 1 : -1
    });
    
    if (countError) throw countError;
  } catch (error) {
    console.error('Error updating essay like:', error);
    throw error;
  }
}

/**
 * Record a share for an essay
 */
export async function recordShare(essayId: string): Promise<void> {
  try {
    const key = `${ContentType.ESSAY}:${essayId}`;
    const state = get(essayInteractionStore);
    
    // Update local state
    essayInteractionStore.update(state => ({
      ...state,
      shares: {
        ...state.shares,
        [key]: true
      }
    }));
    
    // Persist to localStorage
    storage.set('essayInteractions', get(essayInteractionStore));
    
    // Update Supabase
    await updateEssayShare(essayId);
  } catch (error) {
    handleError(
      'Failed to record essay share',
      error,
      ErrorSeverity.WARNING,
      'essayInteractionService'
    );
  }
}

/**
 * Updates share count for an essay in Supabase
 * Increments the share count for each share action
 */
async function updateEssayShare(essayId: string): Promise<void> {
  const state = get(essayInteractionStore);
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
 * Record a view for an essay
 */
export async function recordView(essayId: string): Promise<void> {
  try {
    const key = `${ContentType.ESSAY}:${essayId}`;
    const state = get(essayInteractionStore);
    
    // Optimistically update UI
    essayInteractionStore.update(state => ({
      ...state,
      views: {
        ...state.views,
        [key]: true
      }
    }));
    
    // Save to localStorage
    storage.set('essayInteractions', get(essayInteractionStore));
    
    // Update Supabase
    await updateEssayView(essayId);
  } catch (error) {
    console.error('Error recording view:', error);
    // Errors with views are non-critical, so we don't revert the UI
  }
}

/**
 * Updates view count for an essay in Supabase
 */
async function updateEssayView(essayId: string): Promise<void> {
  const state = get(essayInteractionStore);
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
    
    const alreadyViewed = data?.has_viewed || false;
    
    if (data) {
      // Only update if not already viewed
      if (!alreadyViewed) {
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
          has_viewed: true
        });
        
      if (insertError) throw insertError;
    }
    
    // Only increment the essay view count if this is the first view
    if (!alreadyViewed) {
      const { error: countError } = await supabase.rpc('update_essay_views', {
        essay_id: essayId,
        increment: 1
      });
      
      if (countError) throw countError;
    }
  } catch (error) {
    console.error('Error updating essay view:', error);
    throw error;
  }
}

/**
 * Checks if an essay is liked by the current user.
 */
export function isLiked(essayId: string): boolean {
  const state = get(essayInteractionStore);
  const key = `${ContentType.ESSAY}:${essayId}`;
  return !!state.likes[key];
}

/**
 * Subscribe to essay interaction state changes
 */
export function subscribeToInteractions(callback: (state: EssayInteractionState) => void): () => void {
  const unsubscribe = essayInteractionStore.subscribe(callback);
  return unsubscribe;
}

// If loaded from a non-app page or as a module
if (typeof window !== 'undefined') {
  // Try to load from localStorage on initialization
  const storedInteractions = storage.get('essayInteractions');
  if (storedInteractions) {
    essayInteractionStore.set({
      ...storedInteractions,
      initialized: false // Still need server data
    });
  }
} 