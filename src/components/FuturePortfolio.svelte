<script lang="ts">
  import { onMount } from 'svelte';
  import { projectService } from '../services/projectService';
  import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';
  
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
  
  // Projects state
  let displayProjects: Project[] = [];
  let loading = true;
  let error: string | null = null;
  
  // State for email modal
  let showEmailModal = false;
  let currentProjectId: string = '';
  let email = '';
  let isEmailValid = false;
  
  // User data state
  let userData: UserData = { 
    email: '', 
    follows: [], 
    likes: {} 
  };
  
  // Initialize component
  onMount(() => {
    // Load user data from localStorage
    loadUserData();
    
    // Move async part to a separate function
    async function loadProjects() {
      try {
        // Fetch projects from Supabase
        displayProjects = await projectService.getFutureProjects();
        loading = false;
      } catch (err) {
        console.error('Error loading projects:', err);
        error = err instanceof Error ? err.message : 'Failed to load projects';
        loading = false;
      }
    }
    
    // Call the async function
    loadProjects();
    
    // Return empty cleanup function if needed
    return () => {};
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
  async function handleLike(projectId: number): Promise<void> {
    const project = displayProjects.find(p => p.id === projectId);
    
    if (project) {
      const wasLiked = userData.likes[projectId.toString()];
      
      // Toggle the local state
      if (wasLiked) {
        delete userData.likes[projectId.toString()];
      } else {
        userData.likes[projectId.toString()] = true;
      }
      userData = { ...userData };
      saveUserData();
      
      try {
        // Update the count in Supabase - increment if now liked, decrement if unliked
        await projectService.updateLikeCount(projectId, !wasLiked);
        
        // Create a new array to ensure reactivity
        displayProjects = displayProjects.map(p => {
          if (p.id === projectId) {
            return {
              ...p,
              likes: Math.max(0, p.likes + (!wasLiked ? 1 : -1))
            };
          }
          return p;
        });
      } catch (err) {
        console.error('Error updating like count:', err);
        // Optionally revert the local state if the server update fails
      }
    }
  }
  
  // Handle follow button click
  async function handleFollow(projectId: number): Promise<void> {
    const project = displayProjects.find(p => p.id === projectId);
    
    if (project) {
      const projectIdStr = projectId.toString();
      const isFollowing = userData.follows.includes(projectIdStr);
      
      if (isFollowing) {
        userData.follows = userData.follows.filter(id => id !== projectIdStr);
        userData = { ...userData };
        saveUserData();
        
        try {
          // Update the count in Supabase
          await projectService.updateFollowCount(projectId, false);
          
          // Create a new array to ensure reactivity
          displayProjects = displayProjects.map(p => {
            if (p.id === projectId) {
              return {
                ...p,
                follows: Math.max(0, p.follows - 1)
              };
            }
            return p;
          });
        } catch (err) {
          console.error('Error updating follow count:', err);
        }
      } else {
        if (userData.email) {
          userData.follows = [...userData.follows, projectIdStr];
          saveUserData();
          
          try {
            // Update the count in Supabase
            await projectService.updateFollowCount(projectId, true);
            
            // Create a new array to ensure reactivity
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
            console.error('Error updating follow count:', err);
          }
        } else {
          currentProjectId = projectIdStr;
          showEmailModal = true;
        }
      }
    }
  }
  
  // Handle email form submission
  function handleEmailSubmit() {
    if (validateEmail(email)) {
      // Update user data
      userData.email = email;
      
      // Add project to follows
      if (!userData.follows.includes(currentProjectId)) {
        userData.follows.push(currentProjectId);
        
        // Update project follows count in UI with proper reactivity
        displayProjects = displayProjects.map(p => {
          if (p.id.toString() === currentProjectId) {
            return {
              ...p,
              follows: p.follows + 1
            };
          }
          return p;
        });
      }
      
      // Save user data
      saveUserData();
      
      // Close modal
      showEmailModal = false;
      
      // Reset email
      email = '';
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
            <button 
              class="future-project-like-button {userData.likes[project.id.toString()] ? 'future-project-liked' : ''}" 
              on:click={() => handleLike(project.id)}
              aria-label={userData.likes[project.id.toString()] ? 'Unlike this project' : 'Like this project'}
            >
              {#if userData.likes[project.id.toString()]}
                <FontAwesomeIcon icon={['fas', 'heart']} />
                <span>Liked</span>
              {:else}
                <FontAwesomeIcon icon={['far', 'heart']} />
                <span>Like</span>
              {/if}
            </button>
            <button 
              class="future-project-follow-button {userData.follows.includes(project.id.toString()) ? 'future-project-following' : ''}" 
              on:click={() => handleFollow(project.id)}
              aria-label={userData.follows.includes(project.id.toString()) ? 'Unfollow this project' : 'Follow this project'}
            >
              {#if userData.follows.includes(project.id.toString())}
                <FontAwesomeIcon icon={['fas', 'bell']} />
                <span>Following</span>
              {:else}
                <FontAwesomeIcon icon={['far', 'bell']} />
                <span>Follow</span>
              {/if}
            </button>
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
      </div>
    {/each}
  {/if}
</div>

<!-- Email Collection Modal -->
{#if showEmailModal}
  <div class="future-project-modal">
    <div class="future-project-modal-content">
      <button class="future-project-close-modal" on:click={closeModal} aria-label="Close modal">&times;</button>
      <div class="future-project-modal-inner-content">
        <h3 class="future-project-modal-title">Get early access to your favorite projects.</h3>
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
              >
            </div>
            <button 
              type="submit" 
              class="future-project-submit-button {!isEmailValid ? 'disabled' : ''}" 
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
  /* --------------------
     Layout and containers
     -------------------- */
  .future-projects {
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    align-items: left;
    justify-content: center;
    gap: 50px;
    margin: 0;
    width: 100%;
    max-width: 700px;
  }
  
  /* --------------------
     Card styling
     -------------------- */
  .future-project-card {
    position: relative;
    height: auto;
    margin-top: 40px;
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
  
  /* Card content and details */
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
  
  /* Pill labels */
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
  
  /* Card actions area */
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
  
  .future-project-like-button, 
  .future-project-follow-button {
    display: flex;
    align-items: center;
    justify-content: left;
    gap: 6px;
    border: none;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 14px;
    background-color: var(--light-100);
    padding-right: 24px;
  }
  
  .future-project-comment-button {
    display: none; /* Hide only the comment button */
  }
  
  .future-project-liked :global(svg) {
    color: var(--dark-pink-100);
    animation: heartPulse 0.3s ease-in-out;
  }
  
  .future-project-following :global(svg) {
    color: var(--dark-orange-100);
    animation: heartPulse 0.3s ease-in-out;
  }
  
  .future-project-counters {
    text-align: right;
    justify-content: flex-end;
    font-size: 14px;
    color: var(--dark-100);
  }
  
  /* --------------------
     Modal styling
     -------------------- */
  .future-project-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: var(--dark-70);
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
    padding: 40px 0 10px 0;
  }
  
  .future-project-modal-title {
    font-family: 'DM Serif Text', serif;
    text-align: center;
    font-size: 24px;
    font-weight: 500;
    line-height: 1.3;
  }
  
  .future-project-close-modal {
    font-family: 'Roboto', sans-serif;
    position: absolute;
    top: 16px;
    right: 20px;
    font-size: 30px;
    font-weight: 200;
    line-height: 1;
    color: var(--dark-60);
    cursor: pointer;
    background: none;
    border: none;
    padding: 0;
    width: 30px;
    height: 30px;
  }
  
  .future-project-close-modal:hover {
    color: var(--dark-90);
    transform: scale(1.2);
    transition: transform 0.3s ease;
  }
  
  /* Modal form elements */
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
    margin: 20px 0;
  }
  
  .future-project-form-group input {
    width: 100%;
    background-color: var(--light-100);
    padding: 12px;
    border: 1px solid var(--dark-60);
    border-radius: 5px;
    font-size: 15px;
    transition: border-color 0.3s ease;
    box-sizing: border-box;
  }
  
  .future-project-form-group input:focus {
    outline: none;
    border-color: var(--dark-80);
    box-shadow: 0 0 0 1px var(--purple-30);
  }
  
  .future-project-submit-button {
    width: 100%;
    padding: 12px;
    background-color: var(--purple-100);
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 16px;
    cursor: pointer;
    transition: background-color 0.3s;
    box-sizing: border-box;
  }
  
  .future-project-submit-button:hover {
    background-color: var(--dark-purple-100);
  }
  
  .future-project-submit-button.disabled {
    background-color: var(--purple-100);
    cursor: not-allowed;
    opacity: 0.7;
  }
  
  .future-project-privacy-note {
    margin-top: 15px;
    text-align: center;
    line-height: 1.4;
    color: var(--dark-80);
  }
  
  /* --------------------
     Animations 
     -------------------- */
  @keyframes heartPulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.3); }
    100% { transform: scale(1); }
  }
  
  /* --------------------
     Responsive styles
     -------------------- */
  @media (max-width: 768px) {
    .future-project-card {
      max-width: 90%;
    }

    .future-project-modal-content {
      padding: 30px 70px 40px 70px;
    }
  }
  
  /* Mobile styles */
  @media (max-width: 576px) {   
    .future-project-close-modal {
      top: 12px;
      right: 16px;
    }

    .future-project-modal-title {
      font-size: 22px;
    }

    .future-project-modal-content {
      width: 95%;
      padding-top: 30px;
      padding-bottom: 50px;
      padding-left: clamp(10px, 5vw, 40px);
      padding-right: clamp(10px, 5vw, 40px);
    }
  }
  
  /* Add styles for loading and error states */
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
</style>
