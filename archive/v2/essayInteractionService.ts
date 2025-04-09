import { supabase } from '../lib/supabase';
import { writable, get } from 'svelte/store';
import { v4 as uuidv4 } from 'uuid';

interface EssayInteractionState {
  deviceId: string;
  likes: { [key: string]: boolean };
  shares: { [key: string]: boolean };
  views: { [key: string]: boolean };
}

// Create a store for interactions
const interactionStore = writable<EssayInteractionState>({
  deviceId: '',
  likes: {},
  shares: {},
  views: {}
});

// Initialize device ID and load existing interactions
export async function initializeEssayInteractions() {
  // Get or create device ID
  let deviceId = localStorage.getItem('essayDeviceId');
  if (!deviceId) {
    deviceId = uuidv4();
    localStorage.setItem('essayDeviceId', deviceId);
  }
  
  // Update store with device ID
  interactionStore.update(state => ({
    ...state,
    deviceId
  }));
  
  // Load existing interactions from Supabase
  await loadInteractionsFromSupabase(deviceId);
}

// Load interactions from Supabase for this device
async function loadInteractionsFromSupabase(deviceId: string) {
  const { data, error } = await supabase
    .from('essay_interactions')
    .select('essay_id, has_liked, has_shared, has_viewed')
    .eq('device_id', deviceId);
    
  if (error) {
    console.error('Error loading interactions:', error);
    return;
  }
  
  // Map the interactions to the store format
  const likes: { [key: string]: boolean } = {};
  const shares: { [key: string]: boolean } = {};
  const views: { [key: string]: boolean } = {};
  
  data.forEach(interaction => {
    if (interaction.has_liked) {
      likes[interaction.essay_id] = true;
    }
    if (interaction.has_shared) {
      shares[interaction.essay_id] = true;
    }
    if (interaction.has_viewed) {
      views[interaction.essay_id] = true;
    }
  });
  
  // Update the store
  interactionStore.update(state => ({
    ...state,
    likes,
    shares,
    views
  }));
}

// Check if an essay is liked
export function isEssayLiked(essayId: string): boolean {
  const state = get(interactionStore);
  return !!state.likes[essayId];
}

// Toggle essay like status
export async function toggleEssayLike(essayId: string): Promise<boolean> {
  const state = get(interactionStore);
  const currentLiked = !!state.likes[essayId];
  const newLiked = !currentLiked;
  
  // Update local state immediately for responsive UI
  interactionStore.update(state => ({
    ...state,
    likes: {
      ...state.likes,
      [essayId]: newLiked
    }
  }));
  
  // First, get the UUID for this essay slug
  const { data: essayData, error: essayError } = await supabase
    .from('essays')
    .select('id')
    .eq('slug', essayId)
    .single();
    
  if (essayError || !essayData) {
    console.error('Error finding essay by slug:', essayError);
    return false;
  }
  
  const essayUuid = essayData.id;
  
  // Update in Supabase using the UUID
  const { error } = await supabase
    .from('essay_interactions')
    .upsert({
      essay_id: essayUuid,  // Use UUID here, not slug
      device_id: state.deviceId,
      has_liked: newLiked,
      has_shared: !!state.shares[essayId]
    }, {
      onConflict: 'essay_id,device_id'
    });
    
  if (error) {
    console.error('Error updating like status:', error);
    // Revert local state on error
    interactionStore.update(state => ({
      ...state,
      likes: {
        ...state.likes,
        [essayId]: currentLiked
      }
    }));
    return false;
  }
  
  // Update essay like count in essays table
  await updateEssayLikeCount(essayUuid, newLiked);
  
  return true;
}

// Record an essay share
export async function recordEssayShare(essayId: string): Promise<boolean> {
  const state = get(interactionStore);
  
  // Update local state
  interactionStore.update(state => ({
    ...state,
    shares: {
      ...state.shares,
      [essayId]: true
    }
  }));
  
  // Get UUID for this essay slug
  const { data: essayData, error: essayError } = await supabase
    .from('essays')
    .select('id')
    .eq('slug', essayId)
    .single();
    
  if (essayError || !essayData) {
    console.error('Error finding essay by slug:', essayError);
    return false;
  }
  
  const essayUuid = essayData.id;
  
  // Update in Supabase using UUID
  const { error } = await supabase
    .from('essay_interactions')
    .upsert({
      essay_id: essayUuid,  // Use UUID here, not slug
      device_id: state.deviceId,
      has_liked: !!state.likes[essayId],
      has_shared: true
    }, {
      onConflict: 'essay_id,device_id'
    });
    
  if (error) {
    console.error('Error recording share:', error);
    return false;
  }
  
  // Update essay share count
  await updateEssayShareCount(essayUuid);
  
  return true;
}

// Helper function to update essay like count
async function updateEssayLikeCount(essayUuid: string, liked: boolean) {
  // Using a direct increment/decrement approach
  const delta = liked ? 1 : -1;
  
  const { error } = await supabase.rpc('increment_essay_like_count', {
    p_essay_id: essayUuid,
    p_delta: delta
  });
  
  if (error) {
    console.error('Error updating essay like count:', error);
  }
}

// Helper function to update essay share count
async function updateEssayShareCount(essayUuid: string) {
  const { error } = await supabase.rpc('increment_essay_share_count', {
    p_essay_id: essayUuid,
    p_delta: 1
  });
  
  if (error) {
    console.error('Error updating essay share count:', error);
  }
}

// Record an essay view
export async function recordEssayView(essayId: string): Promise<boolean> {
  const state = get(interactionStore);
  
  // Check if this essay has already been viewed by this device
  if (state.views && state.views[essayId]) {
    // Already viewed, don't record again
    return true;
  }
  
  // Update local state to mark as viewed
  interactionStore.update(state => ({
    ...state,
    views: {
      ...state.views || {},
      [essayId]: true
    }
  }));
  
  // Get UUID for this essay slug
  const { data: essayData, error: essayError } = await supabase
    .from('essays')
    .select('id')
    .eq('slug', essayId)
    .single();
    
  if (essayError || !essayData) {
    console.error('Error finding essay by slug:', essayError);
    return false;
  }
  
  const essayUuid = essayData.id;
  
  // Update in Supabase using UUID
  const { error } = await supabase
    .from('essay_interactions')
    .upsert({
      essay_id: essayUuid,  // Use UUID here, not slug
      device_id: state.deviceId,
      has_liked: !!state.likes[essayId],
      has_shared: !!state.shares[essayId],
      has_viewed: true
    }, {
      onConflict: 'essay_id,device_id'
    });
    
  if (error) {
    console.error('Error recording view:', error);
    return false;
  }
  
  // Update essay view count
  await updateEssayViewCount(essayUuid);
  
  return true;
}

// Helper function to update essay view count
async function updateEssayViewCount(essayUuid: string) {
  const { error } = await supabase.rpc('increment_essay_view_count', {
    p_essay_id: essayUuid,
    p_delta: 1
  });
  
  if (error) {
    console.error('Error updating essay view count:', error);
  }
}

// Subscribe to changes in the interaction store
export function subscribeToInteractions(callback: (state: EssayInteractionState) => void) {
  return interactionStore.subscribe(callback);
}

// Get current interaction state
export function getInteractionState(): EssayInteractionState {
  return get(interactionStore);
}
