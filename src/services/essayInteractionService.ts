import { supabase } from '../lib/supabase';
import { writable, get } from 'svelte/store';
import { v4 as uuidv4 } from 'uuid';

// Content type enum to support different content types if needed in the future
export enum ContentType {
  ESSAY = 'essay'
}

// Define the structure of our interaction state
interface InteractionState {
  likes: Record<string, boolean>;
  shares: Record<string, number>;
  views: Record<string, boolean>;
}

// Create a writable store for interaction state
const interactionState = writable<InteractionState>({
  likes: {},
  shares: {},
  views: {}
});

// Device ID management
const DEVICE_ID_KEY = 'device_id';

/**
 * Get or create a device ID for tracking interactions
 */
export async function getOrCreateDeviceId(): Promise<string> {
  // Check local storage first
  let deviceId = localStorage.getItem(DEVICE_ID_KEY);
  
  // If no device ID exists, create one and store it
  if (!deviceId) {
    deviceId = uuidv4();
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }
  
  return deviceId;
}

/**
 * Initialize interaction service
 */
export async function initializeInteractions(): Promise<void> {
  const deviceId = await getOrCreateDeviceId();
  
  // Load existing interactions for this device
  await refreshInteractionState(deviceId);
}

/**
 * Refresh interaction state from Supabase
 */
async function refreshInteractionState(deviceId: string): Promise<void> {
  try {
    // Fetch all interactions for this device
    const { data, error } = await supabase
      .from('essay_interactions')
      .select('essay_id, has_liked, share_count, has_viewed')
      .eq('device_id', deviceId);
    
    if (error) throw error;
    
    // Create a new state object
    const newState: InteractionState = {
      likes: {},
      shares: {},
      views: {}
    };
    
    // Populate the state with data from Supabase
    if (data) {
      data.forEach(interaction => {
        const key = `${ContentType.ESSAY}:${interaction.essay_id}`;
        newState.likes[key] = interaction.has_liked;
        newState.shares[key] = interaction.share_count || 0;
        newState.views[key] = interaction.has_viewed;
      });
    }
    
    // Update the store
    interactionState.set(newState);
  } catch (error) {
    console.error('Failed to refresh interaction state:', error);
  }
}

/**
 * Subscribe to interaction state changes
 */
export function subscribeToInteractions(callback: (state: InteractionState) => void) {
  const unsubscribe = interactionState.subscribe(callback);
  return unsubscribe;
}

/**
 * Check if essay is liked by the current device
 */
export function isLiked(essayId: string): boolean {
  const state = get(interactionState);
  const key = `${ContentType.ESSAY}:${essayId}`;
  return !!state.likes[key];
}

/**
 * Toggle like status for an essay
 */
export async function toggleLike(essayId: string): Promise<void> {
  const deviceId = await getOrCreateDeviceId();
  const key = `${ContentType.ESSAY}:${essayId}`;
  const currentState = get(interactionState);
  const currentlyLiked = !!currentState.likes[key];
  
  // Optimistically update UI
  interactionState.update(state => {
    return {
      ...state,
      likes: {
        ...state.likes,
        [key]: !currentlyLiked
      }
    };
  });
  
  try {
    // First, check if an interaction record exists
    const { data: existingData, error: fetchError } = await supabase
      .from('essay_interactions')
      .select('id, has_liked')
      .eq('device_id', deviceId)
      .eq('essay_id', essayId)
      .single();
    
    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
      throw fetchError;
    }
    
    const newLikedState = !currentlyLiked;
    
    if (existingData) {
      // Update existing record
      const { error: updateError } = await supabase
        .from('essay_interactions')
        .update({
          has_liked: newLikedState,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingData.id);
        
      if (updateError) throw updateError;
    } else {
      // Create new interaction record
      const { error: insertError } = await supabase
        .from('essay_interactions')
        .insert({
          device_id: deviceId,
          essay_id: essayId,
          has_liked: newLikedState,
          share_count: 0,
          has_viewed: true, // If they're liking, they've viewed
        });
        
      if (insertError) throw insertError;
    }
    
    // Update the essay's like count
    const increment = newLikedState ? 1 : -1;
    const { error: essayUpdateError } = await supabase.rpc(
      'increment_essay_like_count',
      { essay_id: essayId, increment_by: increment }
    ).single();
    
    // Fallback if RPC isn't set up
    if (essayUpdateError) {
      const { data: currentEssay, error: fetchEssayError } = await supabase
        .from('essays')
        .select('like_count')
        .eq('id', essayId)
        .single();
        
      if (fetchEssayError) throw fetchEssayError;
      
      const newCount = Math.max(0, (currentEssay.like_count || 0) + increment);
      
      const { error: updateEssayError } = await supabase
        .from('essays')
        .update({ like_count: newCount })
        .eq('id', essayId);
        
      if (updateEssayError) throw updateEssayError;
    }
    
    // Refresh state to ensure consistency
    await refreshInteractionState(deviceId);
    
  } catch (error) {
    console.error('Error toggling like:', error);
    
    // Revert the optimistic update if there was an error
    interactionState.update(state => {
      return {
        ...state,
        likes: {
          ...state.likes,
          [key]: currentlyLiked
        }
      };
    });
    
    throw error;
  }
}

/**
 * Record a share event
 */
export async function recordShare(essayId: string): Promise<void> {
  const deviceId = await getOrCreateDeviceId();
  const key = `${ContentType.ESSAY}:${essayId}`;
  
  // Optimistically update UI
  interactionState.update(state => {
    const currentShares = state.shares[key] || 0;
    return {
      ...state,
      shares: {
        ...state.shares,
        [key]: currentShares + 1
      }
    };
  });
  
  try {
    // Check if interaction record exists
    const { data: existingData, error: fetchError } = await supabase
      .from('essay_interactions')
      .select('id, share_count')
      .eq('device_id', deviceId)
      .eq('essay_id', essayId)
      .single();
    
    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }
    
    if (existingData) {
      // Update existing record
      const newShareCount = (existingData.share_count || 0) + 1;
      const { error: updateError } = await supabase
        .from('essay_interactions')
        .update({
          share_count: newShareCount,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingData.id);
        
      if (updateError) throw updateError;
    } else {
      // Create new interaction record
      const { error: insertError } = await supabase
        .from('essay_interactions')
        .insert({
          device_id: deviceId,
          essay_id: essayId,
          has_liked: false,
          share_count: 1,
          has_viewed: true, // If they're sharing, they've viewed
        });
        
      if (insertError) throw insertError;
    }
    
    // Update essay's share count
    const { error: essayUpdateError } = await supabase.rpc(
      'increment_essay_share_count',
      { essay_id: essayId, increment_by: 1 }
    ).single();
    
    // Fallback if RPC isn't set up
    if (essayUpdateError) {
      const { data: currentEssay, error: fetchEssayError } = await supabase
        .from('essays')
        .select('share_count')
        .eq('id', essayId)
        .single();
        
      if (fetchEssayError) throw fetchEssayError;
      
      const newCount = (currentEssay.share_count || 0) + 1;
      
      const { error: updateEssayError } = await supabase
        .from('essays')
        .update({ share_count: newCount })
        .eq('id', essayId);
        
      if (updateEssayError) throw updateEssayError;
    }
    
    // Refresh state to ensure consistency
    await refreshInteractionState(deviceId);
    
  } catch (error) {
    console.error('Error recording share:', error);
    throw error;
  }
}

/**
 * Record a view event
 */
export async function recordView(essayId: string): Promise<void> {
  const deviceId = await getOrCreateDeviceId();
  const key = `${ContentType.ESSAY}:${essayId}`;
  
  // Optimistically update UI
  interactionState.update(state => {
    return {
      ...state,
      views: {
        ...state.views,
        [key]: true
      }
    };
  });
  
  try {
    // Check if interaction record exists
    const { data: existingData, error: fetchError } = await supabase
      .from('essay_interactions')
      .select('id')
      .eq('device_id', deviceId)
      .eq('essay_id', essayId)
      .single();
    
    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }
    
    if (existingData) {
      // Just update has_viewed to true if not already
      const { error: updateError } = await supabase
        .from('essay_interactions')
        .update({
          has_viewed: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingData.id);
        
      if (updateError) throw updateError;
    } else {
      // Create new interaction record
      const { error: insertError } = await supabase
        .from('essay_interactions')
        .insert({
          device_id: deviceId,
          essay_id: essayId,
          has_liked: false,
          share_count: 0,
          has_viewed: true,
        });
        
      if (insertError) throw insertError;
    }
    
    // Always increment essay view count regardless of if they've viewed before
    const { error: essayUpdateError } = await supabase.rpc(
      'increment_essay_view_count',
      { essay_id: essayId, increment_by: 1 }
    ).single();
    
    // Fallback if RPC isn't set up
    if (essayUpdateError) {
      const { data: currentEssay, error: fetchEssayError } = await supabase
        .from('essays')
        .select('view_count')
        .eq('id', essayId)
        .single();
        
      if (fetchEssayError) throw fetchEssayError;
      
      const newCount = (currentEssay.view_count || 0) + 1;
      
      const { error: updateEssayError } = await supabase
        .from('essays')
        .update({ view_count: newCount })
        .eq('id', essayId);
        
      if (updateEssayError) throw updateEssayError;
    }
    
    // Refresh state to ensure consistency
    await refreshInteractionState(deviceId);
    
  } catch (error) {
    console.error('Error recording view:', error);
  }
}
