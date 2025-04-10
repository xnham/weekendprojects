<script lang="ts">
  import { onMount } from 'svelte';
  import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';
  import { supabase } from '../lib/supabase';
  import { 
    toggleLike, 
    recordFollow, 
    isLiked, 
    isFollowing,
    ContentType,
    subscribeToInteractions,
  } from '../services/interactionService';
  import InteractionButton from '../components/shared/InteractionButton.svelte';
  
  // Define interfaces for our data structures
  interface Project {
    id: number;
    title: string;
    status: string;
    show: boolean;
    value: string;
    longDescription: string;
    likes: number;
    follows: number;
    beneficiary: string;
  }

  interface UserData {
    email: string;
    follows: string[];
    likes: { [key: string]: boolean };
  }
  
  // Add new interface for notifications
  interface Notification {
    projectId: number;
    message: string;
    timer: ReturnType<typeof setTimeout> | null;
  }
  
  // Projects state
  let displayProjects: Project[] = [];
  let loading = true;
  let error: string | null = null;
  
  // State for email modal
  let showEmailModal = false;
  let currentProjectId: string = '';
  let email = '';
  let isEmailValid = false;
  
  // Add notification state
  let activeNotifications: Record<number, Notification> = {};
  
  // User data state
  let userData: UserData = { 
    email: '', 
    follows: [], 
    likes: {} 
  };
  
  // Replace userData and local state management
  let projectInteractionState = { likes: {}, follows: {} };
  
  // Add reactive derived values
  $: projectLikedStatus = displayProjects.reduce((acc, project) => {
    acc[project.id] = projectInteractionState?.likes[`${ContentType.PROJECT}:${project.id}`] || false;
    return acc;
  }, {});
  
  $: projectFollowStatus = displayProjects.reduce((acc, project) => {
    acc[project.id] = projectInteractionState?.follows[`${ContentType.PROJECT}:${project.id}`] || false;
    return acc;
  }, {});
  
  // Initialize component
  onMount(() => {
    // Load user data from localStorage
    loadUserData();
    
    // Move async part to a separate function
    async function loadProjects() {
      try {
        console.log("Starting to fetch projects from Supabase...");
        // Fetch future projects from Supabase with corrected query parameters
        const { data, error: fetchError } = await supabase
          .from('projects')
          .select('*')
          .eq('status', 'future') // Changed: use 'future' status instead of array
          .eq('show', true)
          .order('id', { ascending: true }); // Changed: ascending order
        
        console.log("Supabase query result:", { data, fetchError });
        
        if (fetchError) throw fetchError;
        
        // Transform the data as needed
        displayProjects = data || [];
        console.log("Projects loaded:", displayProjects.length);
        
        loading = false;
      } catch (err) {
        console.error('Error loading projects:', err);
        error = err instanceof Error ? err.message : 'Failed to load projects';
        loading = false;
      }
    }
    
    // Call the async function
    loadProjects();
    
    // Subscribe to interaction changes
    const unsubscribe = subscribeToInteractions(state => {
      projectInteractionState = state;
    });
    
    // Return cleanup function
    return () => {
      unsubscribe();
    };
  });
  // User data management functions
  function loadUserData() {
    const data = localStorage.getItem('nextUserData');
    if (data) {
      userData = JSON.parse(data);
    }
  }
  
  function saveUserData() {
    localStorage.setItem('nextUserData', JSON.stringify(userData));
  }
  
  // Email validation
  function validateEmail(email: string): boolean {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }
  
  // Check if email is valid when input changes
  function handleEmailInput() {
    isEmailValid = validateEmail(email);
  }
  
  // Handle like button click
  function handleLike(projectId: number) {
    // Get the current status before toggling
    const currentlyLiked = projectLikedStatus[projectId];
    
    // Toggle the like status
    toggleLike(ContentType.PROJECT, projectId.toString());
    
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
  function getProjectTitle(projectId: number): string {
    const project = displayProjects.find(p => p.id === projectId);
    return project ? project.title : 'this project';
  }
  
  // Handle follow button click
  function handleFollow(projectId: number) {
    // Get the current status before toggling
    const currentlyFollowing = projectFollowStatus[projectId];
    
    // Toggle the follow status
    recordFollow(ContentType.PROJECT, projectId.toString());
    
    // Update project follows count in UI with proper reactivity
    displayProjects = displayProjects.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          follows: p.follows + (currentlyFollowing ? -1 : 1) // Decrement if unfollowing, increment if following
        };
      }
      return p;
    });
    
    // Show notification with the OPPOSITE of current state (since we're toggling)
    const message = !currentlyFollowing 
      ? `You'll be notified when ${getProjectTitle(projectId)} is updated.` 
      : `You won't be notified about ${getProjectTitle(projectId)}.`;
    
    showNotification(projectId, message);
  }
  
  // Handle email form submission
  async function handleEmailSubmit() {
    if (validateEmail(email)) {
      const projectId = parseInt(currentProjectId);
      
      // Show notification about following BEFORE database operations
      showNotification(projectId, "You are now following this project. You will receive an email when there's an update.");
      
      // Update user data
      userData.email = email;
      
      // Add project to follows in local storage
      if (!userData.follows.includes(currentProjectId)) {
        userData.follows.push(currentProjectId);
        
        try {
          // TODO: Replace projectService with appropriate API call
          // Previously: 
          // await projectService.addProjectFollower(projectId, email);
          // await projectService.updateFollowCount(projectId, true);
          
          // Update project follows count in UI with proper reactivity
          displayProjects = displayProjects.map(p => {
            if (p.id === projectId) {
              return {
                ...p,
                follows: p.follows + 1
              };
            }
            return p;
          });
        } catch (err) {
          console.error('Error recording follower in database:', err);
        }
      }
      
      // Save user data to localStorage
      saveUserData();
      
      // Close modal
      showEmailModal = false;
      
      // Reset email
      email = '';
    }
  }
  
  // Add notification functions
  function showNotification(projectId: number, message: string) {
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

  function dismissNotification(projectId: number) {
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
    return `${likes} ${likes === 1 ? 'like' : 'likes'} & ${followers} ${followers === 1 ? 'follower' : 'followers'}`;
  }
  
  // Close modal function
  function closeModal() {
    showEmailModal = false;
  }
  
  // Handle comment button click
  function handleComment(projectId: number): void {
    // Placeholder for comment functionality
    console.log('Comment clicked for project:', projectId);
    // TODO: Implement comment functionality
  }
  
  // Add a custom focus action
  function focusOnMount(node: HTMLElement) {
    node.focus();
  }
</script>

<div class="future-projects" id="projectList">
  {#if loading}
    <div class="loading-state">Loading projects...</div>
  {:else if error}
    <div class="error-state">Error: {error}</div>
  {:else}
    {#each displayProjects as project (project.id)}
      <div class="future-project-card">
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
            />
            <InteractionButton 
              type="follow"
              active={projectFollowStatus[project.id]}
              count={undefined}
              iconSize="sm"
              on:click={() => handleFollow(project.id)}
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

<!-- Replace the Modal component with direct implementation -->
{#if showEmailModal}
  <div class="future-project-modal">
    <div class="future-project-modal-content">
      <button 
        class="future-project-close-modal" 
        on:click={closeModal}
        aria-label="Close modal"
      >
        &times;
      </button>
      <div class="future-project-modal-inner-content">
        <h2 class="future-project-modal-title">Get early access to your favorite projects.</h2>
        <div class="future-project-form-and-button">
          <form on:submit|preventDefault={handleEmailSubmit}>
            <div class="future-project-form-group">
              <input 
                type="email" 
                bind:value={email} 
                on:input={handleEmailInput} 
                placeholder="Your email" 
                required
                aria-label="Email address"
                use:focusOnMount
              >
            </div>
            <button 
              type="submit" 
              class="modal-action-btn" 
              disabled={!isEmailValid}
              aria-label="Submit email"
            >
              Submit
            </button>
          </form>
        </div>
        <div class="future-project-privacy-note">
          <small>Low volume. Unsubscribe anytime.</small>
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
  
  /* Modal form */
  .future-project-form-and-button {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100%;
    margin: 0 auto;
  }
  
  .future-project-form-and-button form {
    width: 100%;
  }
  
  .future-project-form-group {
    width: 100%;
    margin: 0;
  }
  
  .future-project-form-group input {
    width: 100%;
    padding: 10px;
    border: 1px solid var(--dark-60);
    border-radius: 4px;
    font-size: 16px;
    background-color: var(--light-100);
  }
  
  .future-project-form-group input:focus {
    outline: none;
    border-color: var(--dark-80);
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
  }
  
  .modal-action-btn:disabled {
    background-color: var(--purple-30);
    cursor: not-allowed;
  }
  
  .future-project-privacy-note {
    margin-top: 15px;
    text-align: center;
    line-height: 1.4;
    color: var(--dark-80);
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
      width: 85%;
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
</style>
