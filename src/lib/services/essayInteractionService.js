// @ts-check
import { supabase } from '../supabase';
import { writable, get } from 'svelte/store';

// Content type enum
export const ContentType = {
  ESSAY: 'essay'
};

/**
 * @typedef {Object} InteractionState
 * @property {Record<string, boolean>} likes
 * @property {Record<string, number>} shares
 * @property {Record<string, boolean>} views
 */

// Define the structure of our interaction state
/** @type {import('svelte/store').Writable<InteractionState>} */
const interactionState = writable({
  likes: {},
  shares: {},
  views: {}
});

// Device ID management
const DEVICE_ID_KEY = 'device_id';

/**
 * Generate a UUID for device tracking
 * Cross-browser implementation that doesn't rely on crypto.randomUUID()
 * @returns {string}
 */
function generateUUID() {
  try {
    // Check if native crypto.randomUUID is available
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    
    // Check if we're in a browser that supports crypto.getRandomValues
    const hasCryptoValues = typeof crypto !== 'undefined' && 
                          typeof crypto.getRandomValues === 'function';
    
    // Fallback implementation that works across browsers
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      let r;
      
      // Use crypto.getRandomValues if available for better randomness
      if (hasCryptoValues) {
        const arr = new Uint8Array(1);
        crypto.getRandomValues(arr);
        r = arr[0] % 16;
      } else {
        // Last resort fallback to Math.random
        r = Math.random() * 16 | 0;
      }
      
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  } catch (error) {
    // Final fallback if any errors occur
    console.error('Error generating UUID:', error);
    const timestamp = new Date().getTime();
    const randomSuffix = Math.floor(Math.random() * 10000000);
    return `fallback-${timestamp}-${randomSuffix}`;
  }
}

/**
 * Check if localStorage is available
 * @returns {boolean}
 */
function isLocalStorageAvailable() {
  try {
    const testKey = '__test__';
    localStorage.setItem(testKey, testKey);
    const result = localStorage.getItem(testKey) === testKey;
    localStorage.removeItem(testKey);
    return result;
  } catch (e) {
    return false;
  }
}

/**
 * Get or create a device ID for tracking interactions
 * @returns {Promise<string>}
 */
export async function getOrCreateDeviceId() {
  try {
    // Check if localStorage is available
    if (!isLocalStorageAvailable()) {
      console.warn('localStorage is not available, using temporary device ID');
      return 'temp-' + generateUUID();
    }
    
    // Check localStorage for existing device ID
    let deviceId = localStorage.getItem(DEVICE_ID_KEY);
    
    // If no device ID exists, create one and store it
    if (!deviceId) {
      deviceId = generateUUID();
      localStorage.setItem(DEVICE_ID_KEY, deviceId);
      console.log('Created new device ID:', deviceId);
    } else {
      console.log('Retrieved existing device ID:', deviceId);
    }
    
    return deviceId;
  } catch (error) {
    console.error('Error in getOrCreateDeviceId:', error);
    // Fallback to a temporary ID if everything fails
    return 'temp-' + Math.random().toString(36).substring(2, 15);
  }
}

/**
 * Initialize interaction service
 * @returns {Promise<string|null>}
 */
export async function initializeInteractions() {
  console.log('Initializing interaction service');
  
  // Additional detailed logging
  console.log('Supabase client available:', !!supabase);
  
  // Check if Supabase client is properly initialized
  if (!supabase) {
    console.error('Supabase client is not initialized');
    return null;
  }
  
  try {
    // Test Supabase connection
    try {
      const { data, error } = await supabase.from('essays').select('id').limit(1);
      if (error) {
        console.error('Supabase connection test failed:', error);
      } else {
        console.log('Supabase connection test successful:', data);
      }
    } catch (connectionError) {
      console.error('Error testing Supabase connection:', connectionError);
    }
    
    const deviceId = await getOrCreateDeviceId();
    console.log('Device ID created/retrieved:', deviceId);
    
    // Log the entire interaction state before making any changes
    console.log('Current interaction state before refresh:', get(interactionState));
    
    // Load existing interactions for this device
    try {
      await refreshInteractionState(deviceId);
      console.log('Successfully refreshed interaction state');
    } catch (refreshError) {
      console.error('Error refreshing interaction state:', refreshError);
    }
    
    // Log the refreshed state
    console.log('Interaction state after refresh:', get(interactionState));
    console.log('Interaction service initialized with device ID:', deviceId);
    
    return deviceId;
  } catch (error) {
    console.error('Failed to initialize interaction service:', error);
    return null; 
  }
}

/**
 * Refresh interaction state from Supabase
 * @param {string} deviceId
 * @returns {Promise<void>}
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
    /** @type {InteractionState} */
    const newState = {
      likes: {},
      shares: {},
      views: {}
    };
    
    // Populate the state with data from Supabase
    if (data) {
      data.forEach(interaction => {
        const key = `${ContentType.ESSAY}:${interaction.essay_id}`;
        newState.likes[key] = interaction.has_liked || false;
        newState.shares[key] = interaction.share_count || 0;
        newState.views[key] = interaction.has_viewed || false;
      });
    }
    
    // Update the store
    interactionState.set(newState);
    // State updated
  } catch (error) {
    console.error('Failed to refresh interaction state:', error);
  }
}

/**
 * Subscribe to interaction state changes
 * @param {(state: InteractionState) => void} callback
 * @returns {() => void}
 */
export function subscribeToInteractions(callback) {
  const unsubscribe = interactionState.subscribe(callback);
  return unsubscribe;
}

/**
 * Check if essay is liked by the current device
 * @param {string|number} essayId
 * @returns {boolean}
 */
export function isLiked(essayId) {
  if (!essayId) {
    console.error('isLiked called without an essayId');
    return false;
  }
  
  const state = get(interactionState);
  const key = `${ContentType.ESSAY}:${essayId}`;
  const liked = !!state.likes[key];
  
  console.log(`Checking if essay ${essayId} is liked: ${liked}`);
  return liked;
}

// Track in-flight requests to prevent duplicates
/** @type {Map<string|number, Promise<boolean>>} */
const pendingLikeRequests = new Map();

/**
 * Toggle like status for an essay
 * @param {string|number} essayId
 * @returns {Promise<boolean>}
 */
export async function toggleLike(essayId) {
  // Prevent duplicate requests for the same essay
  if (pendingLikeRequests.has(essayId)) {
    console.log(`Ignoring duplicate like request for essay ${essayId}`);
    const pendingRequest = pendingLikeRequests.get(essayId);
    return pendingRequest || Promise.resolve(false);
  }
  
  const deviceId = await getOrCreateDeviceId();
  const key = `${ContentType.ESSAY}:${essayId}`;
  const currentState = get(interactionState);
  const currentlyLiked = !!currentState.likes[key];
  
  // Create a promise for this request
  const requestPromise = (async () => {
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
      
      // Update the essay's like count using RPC (which should use a database transaction)
      const increment = newLikedState ? 1 : -1;
      const { error: essayUpdateError } = await supabase.rpc(
        'increment_essay_like_count',
        { essay_id: essayId, increment_by: increment }
      );
      
      // Fallback if RPC isn't set up
      if (essayUpdateError) {
        console.warn('RPC failed, using fallback method for updating like count:', essayUpdateError);
        
        // Use a transaction if possible for the fallback to prevent race conditions
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
    } finally {
      // Remove this request from the pending map once completed
      pendingLikeRequests.delete(essayId);
    }
  })();
  
  // Store the promise in the pending requests map
  pendingLikeRequests.set(essayId, requestPromise);
  
  // Return the promise
  return requestPromise;
}

// Track in-flight share requests to prevent duplicates
/** @type {Map<string|number, Promise<boolean>>} */
const pendingShareRequests = new Map();

/**
 * Record a share event
 * @param {string|number} essayId
 * @returns {Promise<boolean>}
 */
export async function recordShare(essayId) {
  // Prevent duplicate requests for the same essay within a short time period
  if (pendingShareRequests.has(essayId)) {
    console.log(`Ignoring duplicate share request for essay ${essayId}`);
    const pendingRequest = pendingShareRequests.get(essayId);
    return pendingRequest || Promise.resolve(false);
  }
  
  const deviceId = await getOrCreateDeviceId();
  const key = `${ContentType.ESSAY}:${essayId}`;
  
  // Create a promise for this request
  const requestPromise = (async () => {
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
      
      // Update essay's share count using RPC
      const { error: essayUpdateError } = await supabase.rpc(
        'increment_essay_share_count',
        { essay_id: essayId, increment_by: 1 }
      );
      
      // Fallback if RPC isn't set up
      if (essayUpdateError) {
        console.warn('RPC failed, using fallback method for updating share count:', essayUpdateError);
        
        // Use a more robust fallback approach
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
      
      // Return success
      return true;
      
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
    } finally {
      // Clear this request from pending after a short delay
      // This prevents rapid duplicate clicks but allows sharing again after a delay
      setTimeout(() => {
        pendingShareRequests.delete(essayId);
      }, 500);
    }
  })();
  
  // Store the promise in the pending requests map
  pendingShareRequests.set(essayId, requestPromise);
  
  // Return the promise
  return requestPromise;
}

// Track in-flight view requests to prevent duplicates
/** @type {Map<string|number, Promise<boolean>>} */
const pendingViewRequests = new Map();

/**
 * Record a view event
 * @param {string|number} essayId
 * @returns {Promise<boolean>}
 */
export async function recordView(essayId) {
  // Prevent duplicate requests for the same essay within a short time period
  if (pendingViewRequests.has(essayId)) {
    console.log(`Ignoring duplicate view request for essay ${essayId}`);
    const pendingRequest = pendingViewRequests.get(essayId);
    return pendingRequest || Promise.resolve(false);
  }
  
  const deviceId = await getOrCreateDeviceId();
  const key = `${ContentType.ESSAY}:${essayId}`;
  
  // Create a promise for this request
  const requestPromise = (async () => {
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
      
      if (existingData) {
        // Always update the record when a new view happens
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
      
      // Always increment the view count for each page view
      {
        const { error: essayUpdateError } = await supabase.rpc(
          'increment_essay_view_count',
          { essay_id: essayId, increment_by: 1 }
        );
        
        // Fallback if RPC isn't set up
        if (essayUpdateError) {
          console.warn('RPC failed, using fallback method for updating view count:', essayUpdateError);
          
          // Use a more robust fallback approach
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
      
      // Return view status
      return true;
      
    } catch (error) {
      console.error('Error recording view:', error);
      
      // For views, we don't revert the UI state since it doesn't affect the user experience much
      // and they definitely did view the essay
      
      return false;
    } finally {
      // Clear this request from pending after a short delay
      // Views shouldn't really be repeated, but just in case
      setTimeout(() => {
        pendingViewRequests.delete(essayId);
      }, 1000);
    }
  })();
  
  // Store the promise in the pending requests map
  pendingViewRequests.set(essayId, requestPromise);
  
  // Return the promise
  return requestPromise;
}

/**
 * Get essay interaction counts from the essays table
 * @param {string|number} essayId
 * @returns {Promise<{likeCount: number, shareCount: number, viewCount: number}>}
 */
export async function getEssayInteractionCounts(essayId) {
  try {
    console.log(`Getting interaction counts for essay ID: ${essayId}`);
    
    const { data, error } = await supabase
      .from('essays')
      .select('like_count, share_count, view_count')
      .eq('id', essayId)
      .single();
      
    if (error) throw error;
    
    console.log(`Retrieved counts for essay ${essayId}:`, {
      likeCount: data.like_count || 0,
      shareCount: data.share_count || 0,
      viewCount: data.view_count || 0
    });
    
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