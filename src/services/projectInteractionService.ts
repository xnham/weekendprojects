import { supabase } from '../lib/supabase';
import { writable, get } from 'svelte/store';

// Define content types that can be interacted with
export enum ContentType {
  PROJECT = 'project',
}

// Define interaction state interfaces
interface InteractionState {
  likes: Record<string, boolean>;
  follows: Record<string, boolean>;
  userEmail?: string;
  initialized: boolean;
}

interface FollowResult {
  success: boolean;
  needsEmail: boolean;
  newState: boolean;
}

// Create a writable store for interactions
const interactionState = writable<InteractionState>({
  likes: {},
  follows: {},
  userEmail: undefined,
  initialized: false
});

// Device ID storage and retrieval
export const getOrCreateDeviceId = (): Promise<string> => {
  return new Promise((resolve) => {
    // Try to get existing device ID from localStorage
    let deviceId = localStorage.getItem('device_id');
    
    // If no device ID exists, create one
    if (!deviceId) {
      deviceId = crypto.randomUUID();
      localStorage.setItem('device_id', deviceId);
    }
    
    resolve(deviceId);
  });
};

// Initialize interaction service and load state from Supabase
export const initializeInteractions = async (): Promise<void> => {
  try {
    const deviceId = await getOrCreateDeviceId();
    
    // Fetch existing interactions for this device
    const { data, error } = await supabase
      .from('project_interactions')
      .select('project_id, has_liked, has_followed, email')
      .eq('device_id', deviceId);
      
    if (error) {
      console.error('Error fetching interactions:', error);
      return;
    }
    
    // Transform data into state object
    const likes: Record<string, boolean> = {};
    const follows: Record<string, boolean> = {};
    let userEmail: string | undefined = undefined;
    
    data.forEach(interaction => {
      const key = `${ContentType.PROJECT}:${interaction.project_id}`;
      likes[key] = interaction.has_liked || false;
      follows[key] = interaction.has_followed || false;
      
      // If any interaction has an email, store it
      if (interaction.email) {
        userEmail = interaction.email;
      }
    });
    
    // Update state
    interactionState.update(state => ({
      ...state,
      likes,
      follows,
      userEmail,
      initialized: true
    }));
    
    console.log('Initialized interaction state:', { likes, follows, userEmail });
  } catch (err) {
    console.error('Failed to initialize interactions:', err);
  }
};

// Get interaction key for project
const getInteractionKey = (contentType: ContentType, contentId: string): string => {
  return `${contentType}:${contentId}`;
};

// Subscribe to interaction state changes
export const subscribeToInteractions = (callback: (state: InteractionState) => void) => {
  // Initialize if not already done
  const state = get(interactionState);
  if (!state.initialized) {
    initializeInteractions();
  }
  
  // Set up subscription
  const unsubscribe = interactionState.subscribe(callback);
  return unsubscribe;
};

// Check if a project is liked
export const isLiked = (contentType: ContentType, contentId: string): boolean => {
  const state = get(interactionState);
  const key = getInteractionKey(contentType, contentId);
  return state.likes[key] || false;
};

// Check if a project is followed
export const isFollowing = (contentType: ContentType, contentId: string): boolean => {
  const state = get(interactionState);
  const key = getInteractionKey(contentType, contentId);
  return state.follows[key] || false;
};

// Toggle like status for a project
export const toggleLike = async (contentType: ContentType, contentId: string): Promise<boolean> => {
  try {
    // Get the current state
    const key = getInteractionKey(contentType, contentId);
    const deviceId = await getOrCreateDeviceId();
    const currentState = get(interactionState);
    const isCurrentlyLiked = currentState.likes[key] || false;
    
    // Update local state immediately for responsive UI
    interactionState.update(state => {
      const newLikes = { ...state.likes };
      newLikes[key] = !isCurrentlyLiked;
      return { ...state, likes: newLikes };
    });
    
    console.log(`Toggling like for ${contentType}:${contentId} to ${!isCurrentlyLiked}`);
    
    // Check if we already have an interaction record
    const { data: existingInteraction, error: fetchError } = await supabase
      .from('project_interactions')
      .select('*')
      .eq('device_id', deviceId)
      .eq('project_id', contentId)
      .maybeSingle();
      
    if (fetchError) {
      console.error('Error fetching interaction:', fetchError);
      throw fetchError;
    }
    
    console.log('Existing interaction:', existingInteraction);
    
    // Update or create interaction record
    if (existingInteraction) {
      // Update existing record
      const { error: updateError } = await supabase
        .from('project_interactions')
        .update({ 
          has_liked: !isCurrentlyLiked,
          updated_at: new Date().toISOString()
        })
        .eq('device_id', deviceId)
        .eq('project_id', contentId);
        
      if (updateError) {
        console.error('Error updating interaction:', updateError);
        throw updateError;
      }
      
      console.log('Interaction updated successfully');
    } else {
      // Create new record
      const { error: insertError } = await supabase
        .from('project_interactions')
        .insert({
          device_id: deviceId,
          project_id: contentId,
          has_liked: !isCurrentlyLiked,
          has_followed: false
        });
        
      if (insertError) {
        console.error('Error inserting interaction:', insertError);
        throw insertError;
      }
      
      console.log('New interaction created successfully');
    }
    
    // Update the like count in the projects table
    if (!isCurrentlyLiked) {
      // Increment like count
      // Try RPC first (for future use)
      const { error: incrementError } = await supabase.rpc(
        'increment_project_likes',
        { project_id: contentId }
      ).single();
      
      // If RPC isn't set up yet, use standard update approach
      if (incrementError) {
        console.log('RPC failed (expected), using fallback method:', incrementError.message);
        
        // Use direct fetch and update approach
        const { data: currentProject, error: fetchError } = await supabase
          .from('projects')
          .select('likes')
          .eq('id', contentId)
          .single();
          
        if (fetchError) {
          console.error('Error fetching project:', fetchError);
          throw fetchError;
        }
        
        console.log('Current project data:', currentProject);
        
        const currentLikes = currentProject?.likes || 0;
        const newCount = currentLikes + 1;
        
        console.log(`Updating likes from ${currentLikes} to ${newCount}`);
        
        const { error: updateError } = await supabase
          .from('projects')
          .update({ likes: newCount })
          .eq('id', contentId);
          
        if (updateError) {
          console.error('Error updating project likes:', updateError);
          throw updateError;
        }
        
        console.log('Project likes updated successfully');
      }
    } else {
      // Decrement like count
      // Similar pattern as increment but decrementing instead
      const { error: decrementError } = await supabase.rpc(
        'decrement_project_likes',
        { project_id: contentId }
      ).single();
      
      if (decrementError) {
        console.log('RPC failed (expected), using fallback method:', decrementError.message);
        
        const { data: currentProject, error: fetchError } = await supabase
          .from('projects')
          .select('likes')
          .eq('id', contentId)
          .single();
          
        if (fetchError) {
          console.error('Error fetching project:', fetchError);
          throw fetchError;
        }
        
        console.log('Current project data:', currentProject);
        
        const currentLikes = currentProject?.likes || 0;
        const newCount = Math.max(0, currentLikes - 1);
        
        console.log(`Updating likes from ${currentLikes} to ${newCount}`);
        
        const { error: updateError } = await supabase
          .from('projects')
          .update({ likes: newCount })
          .eq('id', contentId);
          
        if (updateError) {
          console.error('Error updating project likes:', updateError);
          throw updateError;
        }
        
        console.log('Project likes updated successfully');
      }
    }
    
    return !isCurrentlyLiked;
  } catch (err) {
    console.error('Failed to toggle like:', err);
    
    // Revert local state on error
    const key = getInteractionKey(contentType, contentId);
    const currentState = get(interactionState);
    const isCurrentlyLiked = currentState.likes[key] || false;
    
    interactionState.update(state => {
      const newLikes = { ...state.likes };
      newLikes[key] = isCurrentlyLiked; // Revert to original state
      return { ...state, likes: newLikes };
    });
    
    return isCurrentlyLiked;
  }
};

// Toggle follow status for a project
export const toggleFollow = async (
  contentType: ContentType, 
  contentId: string, 
  email?: string
): Promise<FollowResult> => {
  try {
    const deviceId = await getOrCreateDeviceId();
    const key = getInteractionKey(contentType, contentId);
    
    // Get current state
    const currentState = get(interactionState);
    const isCurrentlyFollowing = currentState.follows[key] || false;
    
    // Check if we need an email address
    if (!isCurrentlyFollowing && !email && !currentState.userEmail) {
      return {
        success: false,
        needsEmail: true,
        newState: false
      };
    }
    
    // Update local state immediately for responsive UI
    interactionState.update(state => {
      const newFollows = { ...state.follows };
      newFollows[key] = !isCurrentlyFollowing;
      
      // Store email if provided
      const newUserEmail = email || state.userEmail;
      
      return { 
        ...state, 
        follows: newFollows,
        userEmail: newUserEmail 
      };
    });
    
    // Determine which SQL operations to run
    if (isCurrentlyFollowing) {
      // User is unfollowing
      
      // 1. Update the interactions record
      const { error: updateError } = await supabase
        .from('project_interactions')
        .update({ has_followed: false, updated_at: new Date().toISOString() })
        .eq('device_id', deviceId)
        .eq('project_id', contentId);
        
      if (updateError) throw updateError;
      
      // 2. Decrement the follow count in projects table
      const { error: decrementError } = await supabase.rpc(
        'decrement_project_follows',
        { project_id: contentId }
      ).single();
      
      // If RPC isn't set up yet, use standard update with decrement
      if (decrementError) {
        console.warn('RPC failed, using fallback method:', decrementError);
        // Use direct fetch and update approach
        const { data: currentProject, error: fetchError } = await supabase
          .from('projects')
          .select('follows')
          .eq('id', contentId)
          .single();
          
        if (fetchError) throw fetchError;
        
        if (currentProject && currentProject.follows > 0) {
          const newCount = currentProject.follows - 1;
          const { error: updateError } = await supabase
            .from('projects')
            .update({ follows: newCount })
            .eq('id', contentId);
            
          if (updateError) throw updateError;
        }
      }
      
    } else {
      // User is following
      const emailToUse = email || currentState.userEmail;
      
      // 1. Check if record exists
      const { data: existingData, error: checkError } = await supabase
        .from('project_interactions')
        .select('id')
        .eq('device_id', deviceId)
        .eq('project_id', contentId)
        .single();
        
      if (checkError && checkError.code !== 'PGRST116') throw checkError; // PGRST116 means no rows returned
      
      if (existingData) {
        // Update existing record
        const { error: updateError } = await supabase
          .from('project_interactions')
          .update({ 
            has_followed: true, 
            email: emailToUse, 
            updated_at: new Date().toISOString() 
          })
          .eq('device_id', deviceId)
          .eq('project_id', contentId);
          
        if (updateError) throw updateError;
      } else {
        // Create new record
        const { error: insertError } = await supabase
          .from('project_interactions')
          .insert({
            device_id: deviceId,
            project_id: contentId,
            has_liked: false,
            has_followed: true,
            email: emailToUse
          });
          
        if (insertError) throw insertError;
      }
      
      // 2. Increment the follow count in projects table
      const { error: incrementError } = await supabase.rpc(
        'increment_project_follows',
        { project_id: contentId }
      ).single();
      
      // If RPC isn't set up yet, use standard update with increment
      if (incrementError) {
        console.warn('RPC failed, using fallback method:', incrementError);
        // Use direct fetch and update approach
        const { data: currentProject, error: fetchError } = await supabase
          .from('projects')
          .select('follows')
          .eq('id', contentId)
          .single();
          
        if (fetchError) throw fetchError;
        
        const currentFollows = currentProject?.follows || 0;
        const newCount = currentFollows + 1;
        
        const { error: updateError } = await supabase
          .from('projects')
          .update({ follows: newCount })
          .eq('id', contentId);
          
        if (updateError) throw updateError;
      }
      
      // Update all project_interactions for this deviceId to have the same email
      if (emailToUse) {
        const { error: updateEmailError } = await supabase
          .from('project_interactions')
          .update({ email: emailToUse })
          .eq('device_id', deviceId);
          
        if (updateEmailError) {
          console.error('Error updating email for all device interactions:', updateEmailError);
        }
      }
    }
    
    return {
      success: true,
      needsEmail: false,
      newState: !isCurrentlyFollowing
    };
  } catch (err) {
    console.error('Error toggling follow:', err);
    
    // Revert local state on error
    const key = getInteractionKey(contentType, contentId);
    const currentState = get(interactionState);
    const isCurrentlyFollowing = currentState.follows[key] || false;
    
    interactionState.update(state => {
      const newFollows = { ...state.follows };
      newFollows[key] = isCurrentlyFollowing; // Revert to original state
      return { ...state, follows: newFollows };
    });
    
    return {
      success: false,
      needsEmail: false,
      newState: isCurrentlyFollowing
    };
  }
};
