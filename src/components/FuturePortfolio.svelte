<script lang="ts">
  import { onMount } from 'svelte';
  import { projects } from '../data/projects.js'; // Adjust path as needed
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
  
  // Filtered projects (future status and show=true)
  let displayProjects: Project[] = [];
  
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
    
    // Filter projects to display
    displayProjects = projects.filter(project => 
      project.status === 'future' && project.show === true
    );
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
  function handleLike(projectId: number): void {
    const project = projects.find(p => p.id === projectId);
    
    if (project) {
      if (userData.likes[projectId.toString()]) {
        delete userData.likes[projectId.toString()];
      } else {
        userData.likes[projectId.toString()] = true;
      }
      userData = { ...userData };
      saveUserData();
    }
  }
  
  // Handle follow button click
  function handleFollow(projectId: number): void {
    const project = projects.find(p => p.id === projectId);
    
    if (project) {
      const projectIdStr = projectId.toString();
      const isFollowing = userData.follows.includes(projectIdStr);
      
      if (isFollowing) {
        userData.follows = userData.follows.filter(id => id !== projectIdStr);
        userData = { ...userData };
        saveUserData();
      } else {
        if (userData.email) {
          userData.follows = [...userData.follows, projectIdStr];
          saveUserData();
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
</script>

<div class="future-projects" id="projectList">
  {#each displayProjects as project (project.id)}
    <div class="future-project-post-it">
      <div class="future-project-post-it-header">
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
      <h3 class="future-project-post-it-title">{project.title}</h3>
      <div class="future-project-post-it-details">
        {@html project.longDescription}
      </div>
      <div class="future-project-post-it-actions">
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
        </div>
        <div class="future-project-counters"> 
          {formatCounters(project.likes, project.follows)}
        </div>
      </div>
    </div>
  {/each}
</div>

<!-- Email Collection Modal -->
{#if showEmailModal}
  <div class="future-project-modal">
    <div class="future-project-modal-content">
      <button class="future-project-close-modal" on:click={closeModal} aria-label="Close modal">&times;</button>
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
{/if}

<style>
  /* Post-it styling */
  .future-projects {
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    align-items: left;
    justify-content: center;
    gap: 50px;
    margin: 0;
  }
  
  .future-project-post-it {
    position: relative;
    width: 100%;
    max-width: 600px;
    height: auto;
    margin-top: 40px;
    border-left: 1px solid var(--dark-100);
    display: flex;
    flex-direction: column;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
  
  .future-project-post-it-header {
    padding-left: 20px;
    margin-bottom: 10px;
  }
  
  .dual-pill-label {
    display: inline-flex;
    border-radius: 20px;
    overflow: hidden;
    margin-bottom: 10px;
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
  
  .future-project-post-it-title {
    padding-left: 20px;
    font-family: 'DM Serif Text', serif;
    font-size: 24px;
    line-height: 1.3;
    margin-top: 0;
    margin-bottom: 20px;
    color: var(--dark-100);
    word-wrap: break-word;
  }
  
  .future-project-post-it-details {
    flex-grow: 1;
    padding-left: 20px;
    margin-bottom: 30px;
    color: var(--dark-85);
    white-space: pre-wrap;
    line-height: 1.6;
  }
  
  .future-project-post-it-details :global(a) {
    color: var(--dark-85);
    text-decoration: none;
    border-bottom: 1px solid var(--dark-100);
    transition: opacity 0.2s ease;
  }
  
  .future-project-post-it-details :global(a:hover) {
    opacity: 0.7;
  }
  
  .future-project-post-it-actions {
    display: flex;
    justify-content: space-between; 
    gap: 0px;
    padding-top: 14px;
    padding-bottom: 14px;
    padding-left: 20px;
    margin-top: auto;
    border-top: 1px var(--dark-100) solid;
  }
  
  .future-project-buttons {
    display: flex;
    justify-content: column;
  }
  
  .future-project-like-button {
    width: 80px;
  }
  
  .future-project-follow-button {
    width: 100px;
  }
  
  .future-project-like-button, 
  .future-project-follow-button {
    display: flex;
    align-items: center;
    justify-content: left;
    gap: 7px;
    border: none;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 14px;
    background-color: var(--light-100);
  }
  
  .future-project-like-button {
    stroke: var(--dark-100);
  }
  
  .future-project-liked :global(svg) {
    color: var(--dark-pink-100);
    animation: heartPulse 0.3s ease-in-out;
  }
  
  .future-project-follow-button {
    color: var(--dark-100);
  }
  
  .future-project-following :global(svg) {
    color: var(--dark-orange-100);
    animation: heartPulse 0.3s ease-in-out;
  }
  
  .future-project-counters {
    display: flex;
    text-align: right;
    justify-content: flex-end;
    font-size: 14px;
    color: var(--dark-100);
  }
  
  /* Modal styling */
  .future-project-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: var(--dark-60);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }
  
  .future-project-modal-content {
    background-color: var(--light-100);
    padding: 40px 80px;
    border-radius: 5px;
    max-width: 600px;
    width: 90%;
    position: relative;
    box-shadow: 0 5px 20px var(--dark-20);
  }
  
  .future-project-close-modal {
    font-family: 'Roboto', sans-serif;
    position: absolute;
    top: 24px;
    right: 24px;
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
  
  .future-project-modal-title {
    font-family: 'DM Serif Text', serif;
    text-align: center;
    font-size: 24px;
    font-weight: 500;
    line-height: 1.4;
    padding: 60px 0 20px 0;
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
    margin: 20px 0;
  }
  
  .future-project-form-group input {
    width: 100%;
    background-color: var(--light-100);
    padding: 12px;
    border: 1px solid var(--dark-60);
    border-radius: 5px;
    font-size: 16px;
    transition: border-color 0.3s ease;
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
    padding-bottom: 40px;
  }
  
  @keyframes heartPulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.3); }
    100% { transform: scale(1); }
  }
  
  /* Responsive adjustments */
  @media (max-width: 768px) {
    .future-project-post-it {
      max-width: 90%;
    }
  }
  
  .future-project-form-and-button form {
    width: 100%;
  }
  
  /* Ensure input and button take full width */
  .future-project-form-group input,
  .future-project-submit-button {
    width: 100%;
    box-sizing: border-box;
  }
</style>
