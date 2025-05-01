<script lang="ts">
  import { onMount, afterUpdate } from 'svelte';
  import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';
  import { supabase } from '$lib/supabase';
  import { 
    toggleLike, 
    toggleFollow,
    isLiked,
    isFollowing,
    subscribeToInteractions,
    ContentType
  } from '$lib/services/projectInteractionService';
  import InteractionButton from '$lib/components/shared/InteractionButton.svelte';
  
  // Define interfaces for our data structures
  interface Project {
    id: string;
    order: number;
    title: string;
    status: string;
    show: boolean;
    value: string;
    longDescription: string;
    likes: number;
    follows: number;
    beneficiary: string;
    anchor?: string;
  }
  
  // Accept preloaded projects from the server
  export let preloadedProjects: Project[] = [];
  export let serverError: string | null = null;
  
  // Add interface for notifications
  interface Notification {
    projectId: string;
    message: string;
    timer: ReturnType<typeof setTimeout> | null;
  }
  
  // Projects state
  let displayProjects: Project[] = [];
  let loading = !preloadedProjects.length; // Only show loading if no preloaded data
  let error: string | null = serverError;
  
  // Add notification state
  let activeNotifications: Record<string, Notification> = {};
  
  // Email modal state
  let showEmailModal = false;
  let currentProjectId: string | null = null;
  let email: string = '';
  let submitting = false;
  
  // Define the interface to match the one from projectInteractionService
  interface InteractionState {
    likes: Record<string, boolean>;
    follows: Record<string, boolean>;
    userEmail?: string;
    initialized: boolean;
  }
  
  // Replace legacy userData with interaction state and use the proper interface
  let projectInteractionState: InteractionState = { 
    likes: {}, 
    follows: {}, 
    userEmail: undefined, 
    initialized: false 
  };
  
  // Add reactive derived values
  $: projectLikedStatus = displayProjects.reduce((acc, project) => {
    acc[project.id] = projectInteractionState?.likes[`${ContentType.PROJECT}:${project.id}`] || false;
    return acc;
  }, {} as Record<string, boolean>);
  
  $: projectFollowStatus = displayProjects.reduce((acc, project) => {
    acc[project.id] = projectInteractionState?.follows[`${ContentType.PROJECT}:${project.id}`] || false;
    return acc;
  }, {} as Record<string, boolean>);
  
  // Initialize with preloaded data if available
  $: {
    if (preloadedProjects.length > 0 && displayProjects.length === 0) {
      displayProjects = preloadedProjects;
      loading = false;
    }
  }
  
  // Add debug logging for interaction state
  afterUpdate(() => {
    if (projectInteractionState.initialized) {
      console.log('Interaction state initialized:', {
        likes: projectInteractionState.likes,
        follows: projectInteractionState.follows,
        likedStatus: projectLikedStatus,
        followStatus: projectFollowStatus
      });
    }
  });
  
  // Initialize component
  onMount(() => {
    // Move async part to a separate function
    async function loadProjects() {
      // Skip loading if we already have projects from preloading
      if (preloadedProjects.length > 0) {
        console.log('Using preloaded future projects, skipping client-side fetch');
        return;
      }
      
      try {
        console.log("Starting to fetch projects from Supabase...");
        // Fetch future projects from Supabase with corrected query parameters
        const { data, error: fetchError } = await supabase
          .from('projects')
          .select('*')
          .eq('status', 'future')
          .eq('show', true)
          .order('order', { ascending: true });
        
        console.log("Supabase query result:", { data, fetchError });
        
        if (fetchError) throw fetchError;
        
        // Transform the data as needed
        displayProjects = data || [];
        console.log("Projects loaded:", displayProjects.length);
        
        // Add debugging for project data
        console.log("Projects loaded:", displayProjects);
        
        // Force trigger to detect interaction state
        setTimeout(() => {
          console.log("Current interaction state:", {
            initialized: projectInteractionState.initialized,
            likes: projectInteractionState.likes,
            follows: projectInteractionState.follows
          });
        }, 1000);
        
        loading = false;
      } catch (err) {
        console.error('Error loading projects:', err);
        error = err instanceof Error ? err.message : 'Failed to load projects';
        loading = false;
      }
    }
    
    // Call the async function
    loadProjects();
    
    // Subscribe to interaction changes with debug logging
    const unsubscribe = subscribeToInteractions(state => {
      console.log("Interaction state updated:", state);
      projectInteractionState = { ...state, initialized: true };
      
      // Log derived values after state update
      console.log("Derived like status:", projectLikedStatus);
      console.log("Derived follow status:", projectFollowStatus);
    });
    
    // Return cleanup function
    return () => {
      unsubscribe();
    };
  });
  
  // Handle like button click
  function handleLike(projectId: string) {
    // Get the current status before toggling
    const currentlyLiked = projectLikedStatus[projectId];
    
    // Toggle the like status
    toggleLike(ContentType.PROJECT, projectId);
    
    // Update project likes count in UI with proper reactivity
    displayProjects = displayProjects.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          likes: p.likes + (currentlyLiked ? -1 : 1) // Decrement if unliking, increment if liking
        };
      }
      return p;
    });
  }
  
  // Add missing getProjectTitle function
  function getProjectTitle(projectId: string): string {
    const project = displayProjects.find(p => p.id === projectId);
    return project ? project.title : 'this project';
  }
  
  // Handle follow button click
  async function handleFollow(projectId: string) {
    try {
      // Get current state before toggle
      const currentlyFollowing = projectFollowStatus[projectId];
      const newFollowState = !currentlyFollowing;
      
      // Update local display state immediately (optimistic UI)
      displayProjects = displayProjects.map(p => {
        if (p.id === projectId) {
          return {
            ...p,
            follows: p.follows + (currentlyFollowing ? -1 : 1) // Decrement if unfollowing, increment if following
          };
        }
        return p;
      });
      
      // Show notification immediately (optimistic UI)
      showNotification(
        projectId, 
        newFollowState
          ? `You are now following ${getProjectTitle(projectId)}.` 
          : `You have unfollowed ${getProjectTitle(projectId)}.`
      );
      
      // Then perform the actual database operation
      const result = await toggleFollow(ContentType.PROJECT, projectId);
      
      if (result.needsEmail) {
        // User needs to provide email, so dismiss notification and show modal
        dismissNotification(projectId);
        showEmailModal = true;
        currentProjectId = projectId;
        
        // Revert the follow count change since we'll increment it after email submission
        displayProjects = displayProjects.map(p => {
          if (p.id === projectId) {
            return {
              ...p,
              follows: p.follows - 1 // Decrement back since we'll increment after email submission
            };
          }
          return p;
        });
      } else if (!result.success) {
        // Operation failed, revert the follow count change
        displayProjects = displayProjects.map(p => {
          if (p.id === projectId) {
            return {
              ...p,
              follows: p.follows + (newFollowState ? -1 : 1) // Revert the change
            };
          }
          return p;
        });
        
        // Show an error notification
        showNotification(
          projectId,
          "Sorry, we couldn't update your follow status. Please try again."
        );
      }
    } catch (error) {
      console.error('Failed to toggle follow:', error);
      // Show error notification
      showNotification(
        projectId,
        "An error occurred. Please try again."
      );
    }
  }
  
  // Add email submit handler
  async function submitEmail() {
    if (!currentProjectId) return;
    
    try {
      submitting = true;
      
      // Validate email
      if (!email || !email.includes('@')) {
        // Show error
        return;
      }
      
      const result = await toggleFollow(ContentType.PROJECT, currentProjectId, email);
      
      if (result.success) {
        // Get the project title before closing the modal
        const projectTitle = getProjectTitle(currentProjectId);
        const projectIdToNotify = currentProjectId; // Store ID before resetting
        
        // Update follow count after successful email submission
        displayProjects = displayProjects.map(p => {
          if (p.id === projectIdToNotify) {
            return {
              ...p,
              follows: p.follows + 1 // Now increment the follow count
            };
          }
          return p;
        });
        
        // Close modal
        showEmailModal = false;
        currentProjectId = null;
        
        // Show notification with project title after a short delay to ensure modal is closed
        setTimeout(() => {
          showNotification(
            projectIdToNotify, 
            `You are now following ${projectTitle}.`
          );
        }, 100);
      }
    } catch (error) {
      console.error('Failed to submit email:', error);
    } finally {
      submitting = false;
    }
  }
  
  // Add notification functions
  function showNotification(projectId: string, message: string) {
    // Clear existing notification timer if it exists
    if (activeNotifications[projectId]?.timer) {
      clearTimeout(activeNotifications[projectId].timer);
    }
    
    // Create new notification
    activeNotifications[projectId] = {
      projectId,
      message,
      timer: setTimeout(() => {
        dismissNotification(projectId);
      }, 2500) // Auto-dismiss after 2.5 seconds
    };
    
    // Trigger reactivity
    activeNotifications = {...activeNotifications};
  }

  function dismissNotification(projectId: string) {
    if (activeNotifications[projectId]) {
      if (activeNotifications[projectId].timer) {
        clearTimeout(activeNotifications[projectId].timer);
      }
      delete activeNotifications[projectId];
      activeNotifications = {...activeNotifications};
    }
  }
  
  // Format counters text
  function formatCounters(likes: number, followers: number): string {
    // No likes or followers
    if (likes === 0 && followers === 0) {
      return "";
    }
    
    // Only likes
    if (likes > 0 && followers === 0) {
      return `${likes} ${likes === 1 ? 'like' : 'likes'}`;
    }
    
    // Only followers
    if (likes === 0 && followers > 0) {
      return `${followers} ${followers === 1 ? 'follower' : 'followers'}`;
    }
    
    // Both likes and followers
    return `${likes} ${likes === 1 ? 'like' : 'likes'} · ${followers} ${followers === 1 ? 'follower' : 'followers'}`;
  }
  
  // Handle comment button click
  function handleComment(projectId: string): void {
    // Placeholder for comment functionality
    console.log('Comment clicked for project:', projectId);
    // TODO: Implement comment functionality
  }
  
  // Add a custom focus action
  function focusOnMount(node: HTMLElement) {
    node.focus();
  }
  
  // Add function to generate URL-friendly ID
  function getProjectAnchorId(project: Project): string {
    return `project-${project.id}-${project.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  }
</script>

<div class="future-projects" id="projectList">
  {#if loading}
    <div class="loading-state">Loading projects...</div>
  {:else if error}
    <div class="error-state">Error: {error}</div>
  {:else}
    {#each displayProjects as project (project.id)}
      <div class="future-project-card" id={project.anchor || `project-${project.id}`}>
        <div class="future-project-card-header">
          <div class="dual-pill-label">
            <span class="beneficiary-side">
              {#if project.beneficiary === "personal"}
                <FontAwesomeIcon icon={['fas', 'person']} size="sm" />
              {:else if project.beneficiary === "household"}
                <FontAwesomeIcon icon={['fas', 'house-chimney-window']} size="sm" />
              {:else if project.beneficiary === "work/business"}
                <FontAwesomeIcon icon={['fas', 'briefcase']} size="sm" />
              {:else if project.beneficiary === "community"}
                <FontAwesomeIcon icon={['fas', 'tree-city']} size="sm" />
              {/if}
              {project.beneficiary}
            </span>
            <span class="value-side {project.value}">↑ {project.value}</span>
          </div>
        </div>
        <h3 class="future-project-card-title">{project.title}</h3>
        <div class="future-project-card-details">
          {@html project.longDescription}
        </div>
        <div class="future-project-card-actions">
          <div class="future-project-buttons">
            <InteractionButton 
              type="like"
              active={projectLikedStatus[project.id]}
              count={undefined}
              iconSize="sm"
              on:click={() => handleLike(project.id)}
              loading={!projectInteractionState.initialized}
            />
            <InteractionButton 
              type="follow"
              active={projectFollowStatus[project.id]}
              count={undefined}
              iconSize="sm"
              on:click={() => handleFollow(project.id)}
              loading={!projectInteractionState.initialized}
            />
            <button 
              class="future-project-comment-button" 
              on:click={() => handleComment(project.id)}
              aria-label="Comment on this project"
            >
              <FontAwesomeIcon icon={['far', 'comment']} />
              <span>Comment</span>
            </button>
          </div>
          <div class="future-project-counters"> 
            {formatCounters(project.likes, project.follows)}
          </div>
        </div>

        <!-- Add notification element -->
        {#if activeNotifications[project.id]}
          <div class="inline-notification" role="status">
            <div class="notification-content">
              <FontAwesomeIcon icon={['fas', 'info-circle']} />
              <span>{activeNotifications[project.id].message}</span>
            </div>
            <button 
              class="dismiss-notification" 
              on:click={() => dismissNotification(project.id)}
              aria-label="Dismiss notification"
            >
              &times;
            </button>
          </div>
        {/if}
      </div>
    {/each}
  {/if}
</div>

<!-- Email collection modal -->
{#if showEmailModal}
  <div class="future-project-modal">
    <div class="future-project-modal-content">
      <button 
        class="future-project-close-modal" 
        on:click={() => showEmailModal = false} 
        aria-label="Close modal"
      >
        &times;
      </button>
      <div class="future-project-modal-inner-content">
        <h3 class="future-project-modal-title">
          Get updates about your favorite projects
        </h3>
        <div class="future-project-form-and-button">
          <div class="future-project-form-group">
            <form on:submit|preventDefault={submitEmail}>
              <input 
                type="email" 
                bind:value={email} 
                placeholder="Your email address" 
                required 
                use:focusOnMount
                class="follow-email-input"
              />
              <button 
                type="submit" 
                class="modal-action-btn" 
                disabled={submitting || !email}
              >
                <FontAwesomeIcon icon={['far', 'bell']} />
                <span class="button-icon-text">{submitting ? 'Subscribing...' : 'Subscribe to updates'}</span>
              </button>
            </form>
          </div>
          <p class="future-project-privacy-note">
            Low volume. Unsubscribe anytime.
          </p>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  /* ======================
     BASE & LAYOUT
     ====================== */
  .future-projects {
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    align-items: left;
    justify-content: center;
    gap: 50px;
    margin: 0;
    width: 65%;
  }
  
  /* Loading and error states */
  .loading-state,
  .error-state {
    padding: 2rem;
    text-align: center;
    font-size: 1.2rem;
    color: var(--dark-60);
    width: 100%;
    max-width: 600px;
    margin: 40px 0;
  }
  
  .error-state {
    color: var(--dark-pink-100);
  }
  
  /* ======================
     PROJECT CARDS
     ====================== */
  .future-project-card {
    position: relative;
    height: auto;
    margin-top: 40px;
    margin-bottom: 35px;
    border-left: 1px solid var(--dark-100);
    display: flex;
    flex-direction: column;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
  
  /* Card header and title */
  .future-project-card-header {
    padding-left: 20px;
    margin-bottom: 10px;
  }
  
  .future-project-card-title {
    padding-left: 20px;
    margin-bottom: 10px;
    word-wrap: break-word;
  }
  
  /* Card content */
  .future-project-card-details {
    flex-grow: 1;
    padding: 0 0 30px 20px;
    color: var(--dark-85);
    white-space: pre-wrap;
    line-height: 1.6;
  }
  
  .future-project-card-details :global(a) {
    color: var(--dark-85);
    text-decoration: none;
    border-bottom: 1px solid var(--dark-100);
    transition: opacity 0.2s ease;
  }
  
  .future-project-card-details :global(a:hover) {
    opacity: 0.7;
  }
  
  /* Card actions */
  .future-project-card-actions {
    display: flex;
    justify-content: space-between; 
    gap: 0px;
    padding: 14px 0 14px 20px;
    margin-top: auto;
    border-top: 1px var(--dark-100) solid;
  }
  
  .future-project-buttons {
    display: flex;
    justify-content: column;
    gap: 28px;
    padding: 0;
  }
  
  .future-project-counters {
    text-align: right;
    justify-content: flex-end;
    font-size: 14px;
    color: var(--dark-80);
  }
  
  /* Interactive elements */
  .future-project-comment-button {
    display: none; /* Hide only the comment button */
  }
  
  /* ======================
     PILL LABELS
     ====================== */
  .dual-pill-label {
    display: inline-flex;
    border-radius: 20px;
    overflow: hidden;
    font-size: 12px;
  }
  
  .beneficiary-side {
    padding: 2px 12px 2px 16px;
    background-color: transparent;
    border: 1px solid var(--dark-90);
    border-top-left-radius: 20px;
    border-bottom-left-radius: 20px;
    color: var(--dark-90);
    display: flex;
    align-items: center;
    gap: 5px;
    line-height: 1;
  }
  
  .value-side {
    padding: 2px 16px 2px 12px;
    border-top-right-radius: 20px;
    border-bottom-right-radius: 20px;
    border: 1px solid var(--dark-90);
    border-left: none;
  }
  
  /* Value variations */
  .value-side.fun {
    background-color: var(--dark-orange-100);
    color: var(--pure-white-100);
  }
  
  .value-side.time {
    background-color: var(--yellow-100);
    color: var(--dark-100);
  }
  
  .value-side.money {
    background-color: var(--purple-100);
    color: var(--pure-white-100);
  }
  
  .value-side.sanity {
    background-color: var(--dark-pink-100);
    color: var(--pure-white-100);
  }
  
  .value-side.insight {
    background-color: var(--plum-100);
    color: var(--pure-white-100);
  }
  
  /* ======================
     NOTIFICATIONS
     ====================== */
  .inline-notification {
    position: absolute;
    top: 100%;
    margin-top: 0;
    left: 20px;
    right: 20px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 8px 12px;
    background-color: #F5F6F6;
    border-radius: 4px;
    font-size: 14px;
    animation: slideUp 0.15s ease-out;
    overflow: hidden;
    will-change: opacity, transform;
    box-shadow:
      inset 0 1px 1px rgba(0, 0, 0, 0.05),
      0 1px 2px rgba(0, 0, 0, 0.08),
      0 2px 4px rgba(0, 0, 0, 0.08),
      0 4px 6px rgba(0, 0, 0, 0.08),
      0 6px 8px rgba(0, 0, 0, 0.08);
    z-index: 100;
    width: auto;
  }
  
  .notification-content {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--dark-80);
  }
  
  .notification-content :global(svg) {
    color: var(--dark-80);
  }
  
  .dismiss-notification {
    background: none;
    border: none;
    color: var(--dark-60);
    font-size: 18px;
    cursor: pointer;
    padding: 0 0 0 8px;
    line-height: 1;
  }
  
  .dismiss-notification:hover {
    color: var(--dark-90);
  }
  
  /* ======================
     MODAL DIALOG
     ====================== */
  .future-project-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: var(--dark-80);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }
  
  .future-project-modal-content {
    background-color: var(--light-100);
    padding: 0 80px;
    border-radius: 5px;
    max-width: 600px;
    width: 90%;
    position: relative;
    box-shadow: 0 5px 20px var(--dark-20);
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-height: 300px;
  }
  
  .future-project-modal-inner-content {
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 60px 0 50px 0;
  }
  
  .future-project-modal-title {
    font-family: 'DM Serif Text', serif;
    text-align: center;
    font-size: 24px;
    font-weight: 500;
    line-height: 1.3;
    margin-bottom: 40px;
  }
  
  .future-project-close-modal {
    position: absolute;
    top: 20px;
    right: 20px;
    font-size: 30px;
    font-weight: 300;
    line-height: 1;
    color: var(--dark-60);
    cursor: pointer;
    background: none;
    border: none;
    padding: 0;
    width: 30px;
    height: 30px;
    font-family: 'Roboto', sans-serif;
  }
  
  .future-project-close-modal:hover {
    color: var(--dark-90);
    transform: scale(1.2);
    transition: transform 0.3s ease;
  }
  
  .future-project-form-and-button {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100%;
    margin: 0 auto;
  }
  
  .future-project-form-group {
    width: 100%;
    margin: 0;
  }
  
  .modal-action-btn {
    display: block;
    width: 100%;
    height: 40px;
    background-color: var(--purple-100);
    color: var(--light-100);
    border: none;
    border-radius: 4px;
    font-size: 16px;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }
  
  .modal-action-btn:hover:not(:disabled) {
    background-color: var(--dark-purple-100);
    transform: scale(1.02);
    transition: transform 0.3s ease;
  }
  
  .modal-action-btn:disabled {
    background-color: var(--purple-30);
    cursor: not-allowed;
  }
  
  .future-project-privacy-note {
    margin-top: 14px;
    text-align: center;
    line-height: 1.4;
    font-size: 13px;
    color: var(--dark-70);
  }
  
  /* ======================
     ANIMATIONS
     ====================== */
  @keyframes heartPulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.3); }
    100% { transform: scale(1); }
  }
  
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  /* ======================
     RESPONSIVE STYLES
     ====================== */
  /* Small Desktop */
  @media (max-width: 900px) {
    .future-projects {
      width: 75%;
    }
  }
  
  /* Tablet */
  @media (max-width: 768px) {
    .future-projects {
      width: 90%;
    }
    
    .future-project-modal-content {
      padding: 0 70px 0 70px;
    }
  }
  
  /* Mobile */
  @media (max-width: 576px) {
    .future-project-modal-content {
      width: 95%;
      padding-top: 10px;
      padding-left: clamp(10px, 5vw, 40px);
      padding-right: clamp(10px, 5vw, 40px);
    }
    
    .future-project-modal-title {
      font-size: 22px;
    }
    
    .future-project-close-modal {
      top: 16px;
      right: 16px;
    }
    
    .inline-notification {
      width: 90%;
      font-size: 13px;
      padding: 6px 10px;
    }
    
    /* Make sure the notification message doesn't overflow */
    .notification-content span {
      white-space: normal;
      word-break: break-word;
    }
  }
  
  .follow-email-input {
    width: 100%;
    height: 40px;
    padding: 10px;
    border: 1px solid var(--dark-60);
    border-radius: 4px;
    font-size: 16px;
    background-color: var(--light-100);
  }

  .follow-email-input::placeholder {
    color: var(--dark-40);
  }
  
  .follow-email-input:focus {
    border-color: var(--dark-80);
    outline: none;
  }
  
  .button-icon-text {
    margin-left: 4px;
  }
</style>