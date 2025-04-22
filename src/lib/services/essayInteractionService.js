import { supabase } from '../supabase';
import { writable, get } from 'svelte/store';

// Content type enum
export const ContentType = {
  ESSAY: 'essay'
};

// Define the structure of our interaction state
const interactionState = writable({
  likes: {},
  shares: {},
  views: {}
});

// Device ID management
const DEVICE_ID_KEY = 'device_id';

/**
 * Get or create a device ID for tracking interactions
 */
export async function getOrCreateDeviceId() {
  try {
    // Check local storage first
    let deviceId = localStorage.getItem(DEVICE_ID_KEY);
    
    // If no device ID exists, create one and store it
    if (!deviceId) {
      deviceId = crypto.randomUUID(); // Modern API replacement for uuid package
      localStorage.setItem(DEVICE_ID_KEY, deviceId);
      console.log('Created new device ID:', deviceId);
    } else {
      console.log('Retrieved existing device ID:', deviceId);
    }
    
    return deviceId;
  } catch (error) {
    console.error('Error in getOrCreateDeviceId:', error);
    // Fallback to a temporary ID if localStorage fails
    return 'temp-' + Math.random().toString(36).substring(2, 15);
  }
}

/**
 * Initialize interaction service
 */
export async function initializeInteractions() {
  const deviceId = await getOrCreateDeviceId();
  
  // Load existing interactions for this device
  await refreshInteractionState(deviceId);
}

/**
 * Refresh interaction state from Supabase
 */
async function refreshInteractionState(deviceId) {
  try {
    // Fetch all interactions for this device
    const { data, error } = await supabase
      .from('essay_interactions')
      .select('essay_id, has_liked, share_count, has_viewed')
      .eq('device_id', deviceId);
    
    if (error) throw error;
    
    // Create a new state object
    const newState = {
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
    console.log('Updated interaction state:', newState);
  } catch (error) {
    console.error('Failed to refresh interaction state:', error);
  }
}

/**
 * Subscribe to interaction state changes
 */
export function subscribeToInteractions(callback) {
  const unsubscribe = interactionState.subscribe(callback);
  return unsubscribe;
}

/**
 * Check if essay is liked by the current device
 */
export function isLiked(essayId) {
  const state = get(interactionState);
  const key = `${ContentType.ESSAY}:${essayId}`;
  return !!state.likes[key];
}

/**
 * Toggle like status for an essay
 */
export async function toggleLike(essayId) {
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
    );
    
    // Fallback if RPC isn't set up
    if (essayUpdateError) {
      console.warn('RPC failed, using fallback method for updating like count:', essayUpdateError);
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
    
    // Return the new status 
    return newLikedState;
    
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
    
    // Return the original status on error
    return currentlyLiked;
  }
}

/**
 * Record a share event
 */
export async function recordShare(essayId) {
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
    );
    
    // Fallback if RPC isn't set up
    if (essayUpdateError) {
      console.warn('RPC failed, using fallback method for updating share count:', essayUpdateError);
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
    
    // Revert the optimistic update on error
    interactionState.update(state => {
      const currentShares = state.shares[key] || 0;
      return {
        ...state,
        shares: {
          ...state.shares,
          [key]: Math.max(0, currentShares - 1)
        }
      };
    });
    
    throw error;
  }
}

/**
 * Record a view event
 */
export async function recordView(essayId) {
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
    // Check if interaction record exists for this device and essay
    const { data: existingData, error: fetchError } = await supabase
      .from('essay_interactions')
      .select('id, has_viewed')
      .eq('device_id', deviceId)
      .eq('essay_id', essayId)
      .single();
    
    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }
    
    // Check if this device has already viewed the essay (prevent duplicate view counts)
    const hasViewedBefore = existingData?.has_viewed || false;
    
    if (existingData) {
      // Just update has_viewed to true if not already
      if (!hasViewedBefore) {
        const { error: updateError } = await supabase
          .from('essay_interactions')
          .update({
            has_viewed: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingData.id);
          
        if (updateError) throw updateError;
      }
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
    
    // Always increment essay view count if they haven't viewed before
    if (!hasViewedBefore) {
      const { error: essayUpdateError } = await supabase.rpc(
        'increment_essay_view_count',
        { essay_id: essayId, increment_by: 1 }
      );
      
      // Fallback if RPC isn't set up
      if (essayUpdateError) {
        console.warn('RPC failed, using fallback method for updating view count:', essayUpdateError);
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
    }
    
    // Refresh state to ensure consistency
    await refreshInteractionState(deviceId);
    
  } catch (error) {
    console.error('Error recording view:', error);
  }
}

/**
 * Get essay interaction counts from the essays table
 */
export async function getEssayInteractionCounts(essayId) {
  try {
    const { data, error } = await supabase
      .from('essays')
      .select('like_count, share_count, view_count')
      .eq('id', essayId)
      .single();
      
    if (error) throw error;
    
    return {
      likeCount: data.like_count || 0,
      shareCount: data.share_count || 0,
      viewCount: data.view_count || 0
    };
  } catch (error) {
    console.error('Error getting essay interaction counts:', error);
    return { likeCount: 0, shareCount: 0, viewCount: 0 };
  }
}