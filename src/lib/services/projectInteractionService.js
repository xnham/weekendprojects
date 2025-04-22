import { supabase } from '../supabase';
import { writable } from 'svelte/store';

export const ContentType = {
  PROJECT: 'project',
  ESSAY: 'essay'
};

// Track the device ID
const deviceIdStore = writable(null);

// Function to get or create a device ID
export async function getOrCreateDeviceId() {
  // Check local storage first
  let deviceId = localStorage.getItem('x_device_id');
  
  if (!deviceId) {
    // Generate a new UUID for the device
    deviceId = crypto.randomUUID();
    localStorage.setItem('x_device_id', deviceId);
  }
  
  // Update the store
  deviceIdStore.set(deviceId);
  
  return deviceId;
}

// Initialize interactions for projects
export async function initializeInteractions() {
  await getOrCreateDeviceId();
}

// Check if user has liked a specific project
export async function isLiked(projectId) {
  const deviceId = await getOrCreateDeviceId();
  
  const { data, error } = await supabase
    .from('interactions')
    .select('*')
    .eq('content_id', projectId)
    .eq('device_id', deviceId)
    .eq('type', 'like')
    .eq('content_type', ContentType.PROJECT)
    .single();
  
  if (error && error.code !== 'PGRST116') { // PGRST116 is "row not found" error
    console.error('Error checking if project is liked:', error);
    return false;
  }
  
  return !!data;
}

// Toggle like status for a project
export async function toggleLike(projectId) {
  const deviceId = await getOrCreateDeviceId();
  const alreadyLiked = await isLiked(projectId);
  
  if (alreadyLiked) {
    // Unlike the project
    const { error } = await supabase
      .from('interactions')
      .delete()
      .eq('content_id', projectId)
      .eq('device_id', deviceId)
      .eq('type', 'like')
      .eq('content_type', ContentType.PROJECT);
    
    if (error) {
      console.error('Error unliking project:', error);
      return false;
    }
    
    return false; // Return the new like status
  } else {
    // Like the project
    const { error } = await supabase
      .from('interactions')
      .insert({
        content_id: projectId,
        device_id: deviceId,
        type: 'like',
        content_type: ContentType.PROJECT,
        created_at: new Date().toISOString()
      });
    
    if (error) {
      console.error('Error liking project:', error);
      return false;
    }
    
    return true; // Return the new like status
  }
}

// Record a view for a project
export async function recordView(projectId) {
  const deviceId = await getOrCreateDeviceId();
  
  // Check if this device has already viewed this project recently
  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);
  
  const { data, error: checkError } = await supabase
    .from('interactions')
    .select('*')
    .eq('content_id', projectId)
    .eq('device_id', deviceId)
    .eq('type', 'view')
    .eq('content_type', ContentType.PROJECT)
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
        content_id: projectId,
        device_id: deviceId,
        type: 'view',
        content_type: ContentType.PROJECT,
        created_at: new Date().toISOString()
      });
    
    if (error) {
      console.error('Error recording view:', error);
    }
  }
}

// Record a share for a project
export async function recordShare(projectId) {
  const deviceId = await getOrCreateDeviceId();
  
  const { error } = await supabase
    .from('interactions')
    .insert({
      content_id: projectId,
      device_id: deviceId,
      type: 'share',
      content_type: ContentType.PROJECT,
      created_at: new Date().toISOString()
    });
  
  if (error) {
    console.error('Error recording share:', error);
  }
}

// Subscribe to interaction updates for a project
export async function subscribeToInteractions(projectId, onUpdate) {
  // Initial fetch of interaction counts
  await fetchAndUpdateInteractions(projectId, onUpdate);
  
  // Set up real-time subscription
  const subscription = supabase
    .channel(`project-interactions-${projectId}`)
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table: 'interactions',
        filter: `content_id=eq.${projectId}` 
      }, 
      () => {
        fetchAndUpdateInteractions(projectId, onUpdate);
      }
    )
    .subscribe();
  
  // Return unsubscribe function
  return () => {
    subscription.unsubscribe();
  };
}

// Helper to fetch current interaction counts
async function fetchAndUpdateInteractions(projectId, onUpdate) {
  // Get like count
  const { count: likeCount, error: likeError } = await supabase
    .from('interactions')
    .select('*', { count: 'exact', head: true })
    .eq('content_id', projectId)
    .eq('type', 'like')
    .eq('content_type', ContentType.PROJECT);
  
  // Get view count
  const { count: viewCount, error: viewError } = await supabase
    .from('interactions')
    .select('*', { count: 'exact', head: true })
    .eq('content_id', projectId)
    .eq('type', 'view')
    .eq('content_type', ContentType.PROJECT);
  
  // Get share count
  const { count: shareCount, error: shareError } = await supabase
    .from('interactions')
    .select('*', { count: 'exact', head: true })
    .eq('content_id', projectId)
    .eq('type', 'share')
    .eq('content_type', ContentType.PROJECT);
  
  if (likeError || viewError || shareError) {
    console.error('Error fetching interaction counts:', { likeError, viewError, shareError });
    return;
  }
  
  // Check if current user has liked this project
  const liked = await isLiked(projectId);
  
  // Call the update handler with the new counts
  onUpdate({
    likes: likeCount || 0,
    views: viewCount || 0,
    shares: shareCount || 0,
    liked
  });
} 