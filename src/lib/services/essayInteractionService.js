import { supabase } from '../supabase';
import { getOrCreateDeviceId, ContentType } from './projectInteractionService';

// Initialize interactions for essays
export async function initializeInteractions() {
  await getOrCreateDeviceId();
}

// Check if user has liked a specific essay
export async function isLiked(essayId) {
  const deviceId = await getOrCreateDeviceId();
  
  const { data, error } = await supabase
    .from('interactions')
    .select('*')
    .eq('content_id', essayId)
    .eq('device_id', deviceId)
    .eq('type', 'like')
    .eq('content_type', ContentType.ESSAY)
    .single();
  
  if (error && error.code !== 'PGRST116') { // PGRST116 is "row not found" error
    console.error('Error checking if essay is liked:', error);
    return false;
  }
  
  return !!data;
}

// Toggle like status for an essay
export async function toggleLike(essayId) {
  const deviceId = await getOrCreateDeviceId();
  const alreadyLiked = await isLiked(essayId);
  
  if (alreadyLiked) {
    // Unlike the essay
    const { error } = await supabase
      .from('interactions')
      .delete()
      .eq('content_id', essayId)
      .eq('device_id', deviceId)
      .eq('type', 'like')
      .eq('content_type', ContentType.ESSAY);
    
    if (error) {
      console.error('Error unliking essay:', error);
      return false;
    }
    
    return false; // Return the new like status
  } else {
    // Like the essay
    const { error } = await supabase
      .from('interactions')
      .insert({
        content_id: essayId,
        device_id: deviceId,
        type: 'like',
        content_type: ContentType.ESSAY,
        created_at: new Date().toISOString()
      });
    
    if (error) {
      console.error('Error liking essay:', error);
      return false;
    }
    
    return true; // Return the new like status
  }
}

// Record a view for an essay
export async function recordView(essayId) {
  const deviceId = await getOrCreateDeviceId();
  
  // Check if this device has already viewed this essay recently
  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);
  
  const { data, error: checkError } = await supabase
    .from('interactions')
    .select('*')
    .eq('content_id', essayId)
    .eq('device_id', deviceId)
    .eq('type', 'view')
    .eq('content_type', ContentType.ESSAY)
    .gt('created_at', oneDayAgo.toISOString())
    .single();
  
  if (checkError && checkError.code !== 'PGRST116') {
    console.error('Error checking recent views:', checkError);
    return;
  }
  
  // If no recent view, record a new one
  if (!data) {
    const { error } = await supabase
      .from('interactions')
      .insert({
        content_id: essayId,
        device_id: deviceId,
        type: 'view',
        content_type: ContentType.ESSAY,
        created_at: new Date().toISOString()
      });
    
    if (error) {
      console.error('Error recording view:', error);
    }
  }
}

// Record a share for an essay
export async function recordShare(essayId) {
  const deviceId = await getOrCreateDeviceId();
  
  const { error } = await supabase
    .from('interactions')
    .insert({
      content_id: essayId,
      device_id: deviceId,
      type: 'share',
      content_type: ContentType.ESSAY,
      created_at: new Date().toISOString()
    });
  
  if (error) {
    console.error('Error recording share:', error);
  }
}

// Subscribe to interaction updates for an essay
export async function subscribeToInteractions(essayId, onUpdate) {
  // Initial fetch of interaction counts
  await fetchAndUpdateInteractions(essayId, onUpdate);
  
  // Set up real-time subscription
  const subscription = supabase
    .channel(`essay-interactions-${essayId}`)
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table: 'interactions',
        filter: `content_id=eq.${essayId}` 
      }, 
      () => {
        fetchAndUpdateInteractions(essayId, onUpdate);
      }
    )
    .subscribe();
  
  // Return unsubscribe function
  return () => {
    subscription.unsubscribe();
  };
}

// Helper to fetch current interaction counts
async function fetchAndUpdateInteractions(essayId, onUpdate) {
  // Get like count
  const { count: likeCount, error: likeError } = await supabase
    .from('interactions')
    .select('*', { count: 'exact', head: true })
    .eq('content_id', essayId)
    .eq('type', 'like')
    .eq('content_type', ContentType.ESSAY);
  
  // Get view count
  const { count: viewCount, error: viewError } = await supabase
    .from('interactions')
    .select('*', { count: 'exact', head: true })
    .eq('content_id', essayId)
    .eq('type', 'view')
    .eq('content_type', ContentType.ESSAY);
  
  // Get share count
  const { count: shareCount, error: shareError } = await supabase
    .from('interactions')
    .select('*', { count: 'exact', head: true })
    .eq('content_id', essayId)
    .eq('type', 'share')
    .eq('content_type', ContentType.ESSAY);
  
  if (likeError || viewError || shareError) {
    console.error('Error fetching interaction counts:', { likeError, viewError, shareError });
    return;
  }
  
  // Check if current user has liked this essay
  const liked = await isLiked(essayId);
  
  // Call the update handler with the new counts
  onUpdate({
    likes: likeCount || 0,
    views: viewCount || 0,
    shares: shareCount || 0,
    liked
  });
} 