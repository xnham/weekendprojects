<script lang="ts">
  import { onMount, afterUpdate } from 'svelte';
  import { projectService } from '../services/projectService';
  import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';
  import ImpactShowcase from './ImpactShowcase.svelte';
  
  // Define a type for the project structure
  interface Project {
    id: number;
    title: string;
    status: string;
    show: boolean;
    value: string;
    longDescription: string;
    impact: boolean;
    image: string;
    tools: string[];
    beneficiary: string;
    extraContent?: string | null;
    extraContentLinkText?: string | null;
    linkText?: string | null;
    beforeImpact?: string | null;
    afterImpact?: string | null;
    
    // Updated time saved structure
    timeSaved?: {
      hasCalculator: boolean;
      daily?: number;
      weekly?: number;
      alternativeUses?: string[];
    } | null;
    
    // New money saved structure
    moneySaved?: {
      daily?: number;
      weekly?: number;
      alternativeUses?: string[];
    } | null;

    launchDate?: Date | null;
    likes?: number;
  }
  
  // State for projects
  let completedProjects: Project[] = [];
  let loading = true;
  let error: string | null = null;
  
  // Replace Set with object to match FuturePortfolio approach
  let likedProjects: { [key: string]: boolean } = {};
  
  // Function to load liked projects from localStorage
  function loadLikedProjects() {
    const stored = localStorage.getItem('completedLikedProjects');
    if (stored) {
      likedProjects = JSON.parse(stored);
    }
  }
  
  // Function to save liked projects to localStorage
  function saveLikedProjects() {
    localStorage.setItem('completedLikedProjects', JSON.stringify(likedProjects));
  }
  
  // Function to toggle like status (match FuturePortfolio approach)
  async function toggleLike(projectId: number, event: MouseEvent) {
    event.stopPropagation(); // Prevent event bubbling
    
    const projectIdStr = projectId.toString();
    const wasLiked = likedProjects[projectIdStr];
    
    // Toggle the local state
    if (wasLiked) {
      delete likedProjects[projectIdStr];
    } else {
      likedProjects[projectIdStr] = true;
    }
    
    // Create a new object to ensure reactivity
    likedProjects = { ...likedProjects };
    saveLikedProjects();
    
    try {
      // Update the count in Supabase - increment if now liked, decrement if unliked
      await projectService.updateLikeCount(projectId, !wasLiked);
      
      // Optionally update the local count display if you want to show it in the UI
      const project = completedProjects.find(p => p.id === projectId);
      if (project) {
        project.likes = Math.max(0, project.likes + (!wasLiked ? 1 : -1));
      }
    } catch (err) {
      console.error('Error updating like count:', err);
      // Optionally revert the local state if the server update fails
    }
  }
  
  // Function to check if a project is liked (helps with reactivity)
  function isProjectLiked(projectId: number): boolean {
    return likedProjects[projectId.toString()] === true;
  }
  
  // Fetch projects from Supabase
  onMount(() => {
    // Load liked projects from localStorage
    loadLikedProjects();
    
    // Move the async part into a separate function
    async function loadProjects() {
      try {
        const data = await projectService.getCompletedProjects();
        // Ensure launchDate is properly converted to Date objects and impact is boolean
        completedProjects = data.map(project => ({
          ...project,
          launchDate: project.launchDate ? new Date(project.launchDate) : null,
          impact: typeof project.impact === 'string' ? project.impact === 'true' : Boolean(project.impact)
        }));
        // Initialize current slides
        completedProjects.forEach(project => {
          currentSlides[project.id] = 0;
        });
        
        loading = false;
      } catch (err: any) {
        console.error('Error loading projects:', err);
        error = err instanceof Error ? err.message : 'Failed to load projects';
        loading = false;
      }
    }
    
    // Call the async function
    loadProjects();
    
    // Optional: Check if fonts are loaded
    document.fonts.ready.then(() => {
      // All fonts are loaded
      console.log('Fonts loaded');
      positionArrows();
    });
    
    // Add window resize listener
    const handleResize = () => {
      positionArrows();
    };
    
    window.addEventListener('resize', handleResize);
    
    // Return the cleanup function directly
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  });
  
  // Track current slide for each project
  let currentSlides: Record<number, number> = {};
  
  // Touch handling for swipe gestures
  let touchStartX = 0;
  let touchEndX = 0;
  
  // References for description elements and arrow buttons
  let descriptionElements: Record<number, HTMLElement> = {};
  let leftArrows: Record<number, HTMLElement> = {};
  let rightArrows: Record<number, HTMLElement> = {};
  
  function handleTouchStart(e: TouchEvent): void {
    touchStartX = e.touches[0].clientX;
  }
  
  function handleTouchMove(e: TouchEvent): void {
    touchEndX = e.touches[0].clientX;
  }
  
  function handleTouchEnd(projectId: number, project: Project): void {
    const swipeThreshold = 50; // Minimum distance required for a swipe
    const swipeDistance = touchEndX - touchStartX;
    
    if (Math.abs(swipeDistance) > swipeThreshold) {
      if (swipeDistance > 0) {
        // Swiped right - go back
        goBack(projectId);
      } else {
        // Swiped left - go forward
        goForward(projectId, project);
      }
    }
    
    // Reset touch positions
    touchStartX = 0;
    touchEndX = 0;
  }
  
  // Function to position arrows relative to description
  function positionArrows() {
    completedProjects.forEach(project => {
      const descEl = descriptionElements[project.id];
      const leftArrow = leftArrows[project.id];
      const rightArrow = rightArrows[project.id];
      
      if (descEl && leftArrow && rightArrow) {
        const descRect = descEl.getBoundingClientRect();
        const descMiddle = descRect.top + descRect.height / 2;
        const container = descEl.closest('.slider-outer-container');
        
        // Add null check for container
        if (container) {
          const containerRect = container.getBoundingClientRect();
          
          // Set position relative to the container
          const relativeMiddle = descMiddle - containerRect.top;
          
          leftArrow.style.top = `${relativeMiddle}px`;
          leftArrow.style.transform = 'translateY(-50%)';
          
          rightArrow.style.top = `${relativeMiddle}px`;
          rightArrow.style.transform = 'translateY(-50%)';
        }
      }
    });
  }
  
  // Run positioning after DOM updates and on window resize
  afterUpdate(() => {
    positionArrows();
  });
  
  // Helper function to format description with paragraphs
  function formatDescription(description: string): string {
    return description.split('\n\n').map(paragraph => `<p>${paragraph}</p>`).join('');
  }
  
  // Helper function to check if a project has impact
  function hasImpact(project: Project): boolean {
    return project.impact === true;
  }
  
  // Helper function to get total slides for a project
  function getTotalSlides(project: Project): number {
    let count = 1; // Description slide is always present
    if (hasImpact(project)) count++; // Impact slide if flag is true
    if (project.extraContent) count++; // Extra content slide if present
    return count;
  }
  
  // Function to navigate to a specific slide
  function goToSlide(projectId: number, slideIndex: number): void {
    currentSlides[projectId] = slideIndex;
  }
  
  // Function to go forward one slide
  function goForward(projectId: number, project: Project): void {
    const numSlides = getTotalSlides(project);
    if (currentSlides[projectId] < numSlides - 1) {
      currentSlides[projectId]++;
    }
  }
  
  // Function to go back one slide
  function goBack(projectId: number): void {
    if (currentSlides[projectId] > 0) {
      currentSlides[projectId]--;
    }
  }
  
  // Function to get the appropriate link text based on current slide
  function getLinkText(project: Project, currentSlide: number): {main: string, arrow: string} {
    if (currentSlide === 0) {
      // Split the text into main part and arrow part
      const text = project.linkText || "See more";
      return { main: text.replace(/\s+>$/, ''), arrow: '>' };
    } else {
      const text = project.extraContentLinkText || "Next";
      return { main: text.replace(/\s+>$/, ''), arrow: '>' };
    }
  }
</script>

<div id="completed-projects" class="completed-projects">
  {#if loading}
    <div class="loading-state">Loading projects...</div>
  {:else if error}
    <div class="error-state">Error: {error}</div>
  {:else}
    {#each completedProjects as project (project.id)}
      <div class="completed-project-card" data-project-id={project.id}>
        <!-- Single unified header that works for both desktop and mobile -->
        <div class="completed-project-header">
          <div class="completed-project-header-left">
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
            <div class="completed-project-title">{project.title}</div>
          </div>
          <div class="completed-project-icon">
            <button 
              class="like-button {likedProjects[project.id.toString()] ? 'liked' : ''}"
              on:click={(e) => toggleLike(project.id, e)}
              aria-label={likedProjects[project.id.toString()] ? "Unlike project" : "Like project"}
            >
              {#if likedProjects[project.id.toString()]}
                <FontAwesomeIcon icon={['fas', 'heart']} size="lg" />
              {:else}
                <FontAwesomeIcon icon={['far', 'heart']} size="lg" />
              {/if}
            </button>
            {#if project.likes && project.likes > 0}
              <div class="like-count">{project.likes} {project.likes === 1 ? 'like' : 'likes'}</div>
            {/if}
            {String(project.id).padStart(2, '0')}
          </div>
        </div>
        
        <div class="completed-project-content">
          <div class="completed-project-left-column">
            <!-- Containing div with relative positioning -->
            <div class="slider-outer-container">
              <!-- Left button positioned as direct child of outer container -->
              <button 
                class="slider-arrow-button slider-arrow-left outside-positioned"
                bind:this={leftArrows[project.id]}
                on:click={() => goBack(project.id)}
                disabled={currentSlides[project.id] === 0}
                aria-label="Previous slide">
                <FontAwesomeIcon icon={['fas', 'angle-left']} />
              </button>
              
              <!-- The slider wrapper without buttons -->
              <div class="completed-project-slider-wrapper">
                <div class="completed-project-slider">
                  <div class="slider-container"
                       on:touchstart={handleTouchStart}
                       on:touchmove={handleTouchMove}
                       on:touchend={() => handleTouchEnd(project.id, project)}>
                    
                    <div class="slider-track" 
                         style="width: {getTotalSlides(project) * 100}%; 
                                transform: translateX(-{currentSlides[project.id] * (100 / getTotalSlides(project))}%);">
                      <!-- Slide 1: Long Description -->
                      <div class="slider-slide" style="min-width: {100 / getTotalSlides(project)}%">
                        <div class="completed-project-description" bind:this={descriptionElements[project.id]}>
                          {@html formatDescription(project.longDescription)}
                        </div>
                      </div>
                      
                      <!-- Slide 2: Impact (if impact is true) -->
                      {#if hasImpact(project)}
                        <div class="slider-slide" style="min-width: {100 / getTotalSlides(project)}%">
                          <div class="completed-project-impact">
                            <div class="impact-container">
                              <ImpactShowcase 
                                {project}
                              />
                            </div>
                          </div>
                        </div>
                      {/if}
                      
                      <!-- Slide 3: Extra Content (if available) -->
                      {#if project.extraContent}
                        <div class="slider-slide" style="min-width: {100 / getTotalSlides(project)}%">
                          <div class="completed-project-extra">
                            {@html formatDescription(project.extraContent)}
                          </div>
                        </div>
                      {/if}
                    </div>
                    
                    <!-- Slider controls -->
                    {#if getTotalSlides(project) > 1}
                      <div class="slider-controls">
                        <div class="slider-links">
                          <div class="slider-back" style="display: {currentSlides[project.id] === 0 ? 'none' : 'block'}">
                            <a href="#back"
                               class="slider-back-link" 
                               on:click|preventDefault={() => goBack(project.id)}
                               on:keydown={(e) => e.key === 'Enter' && goBack(project.id)}
                               aria-label="Go to previous slide">
                              <span class="link-arrow">&lt;</span><span class="link-text">Back</span>
                            </a>
                          </div>
                          <div class="slider-forward" 
                               style="display: {currentSlides[project.id] === (getTotalSlides(project) - 1) ? 'none' : 'block'}">
                            <a href="#next"
                               class="slider-link" 
                               on:click|preventDefault={() => goForward(project.id, project)}
                               on:keydown={(e) => e.key === 'Enter' && goForward(project.id, project)}
                               aria-label="Go to next slide">
                              <span class="link-text">{getLinkText(project, currentSlides[project.id]).main}</span><span class="link-arrow">{getLinkText(project, currentSlides[project.id]).arrow}</span>
                            </a>
                          </div>
                        </div>
                        
                        <div class="slider-nav">
                          <button class="slider-dot {currentSlides[project.id] === 0 ? 'active' : ''}" 
                                  on:click={() => goToSlide(project.id, 0)}
                                  aria-label="Go to slide 1"></button>
                          {#if hasImpact(project)}
                            <button class="slider-dot {currentSlides[project.id] === 1 ? 'active' : ''}" 
                                    on:click={() => goToSlide(project.id, 1)}
                                    aria-label="Go to slide 2"></button>
                          {/if}
                          {#if project.extraContent}
                            <button class="slider-dot {currentSlides[project.id] === (hasImpact(project) ? 2 : 1) ? 'active' : ''}" 
                                    on:click={() => goToSlide(project.id, hasImpact(project) ? 2 : 1)}
                                    aria-label="Go to slide {hasImpact(project) ? 3 : 2}"></button>
                          {/if}
                        </div>
                      </div>
                    {/if}
                  </div>
                </div>
              </div>
              
              <!-- Right button positioned as direct child of outer container -->
              <button 
                class="slider-arrow-button slider-arrow-right outside-positioned"
                bind:this={rightArrows[project.id]}
                on:click={() => goForward(project.id, project)}
                disabled={currentSlides[project.id] === (getTotalSlides(project) - 1)}
                aria-label="Next slide">
                <FontAwesomeIcon icon={['fas', 'angle-right']} />
              </button>
            </div>
          </div>
          
          <div class="completed-project-image-column">
            <img src="images/{project.image}" alt={project.title}>
          </div>
        </div>
        
        <div class="completed-project-tools">
          {#each project.tools as tool}
            <span class="completed-project-tool">{tool}</span>
          {/each}
        </div>
      </div>
    {/each}
  {/if}
</div>

<style>
  /* ===== BASE LAYOUT STYLES ===== */
  .completed-projects {
    display: flex;
    flex-direction: column;
    margin: 0;
  }

  .completed-project-card {
    display: flex;
    flex-direction: column;
    background-color: var(--light-100);
    overflow: visible;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    width: 100%;
    margin-bottom: 100px;
  }

  .completed-project-card:last-child {
    margin-bottom: 0;
  }

  .completed-project-content {
    display: flex;
    flex-direction: row;
    gap: clamp(20px, 2.5vw, 40px);
    width: 100%;
    align-items: stretch; /* Make all children stretch to same height */
  }

  /* ===== PROJECT HEADER STYLES ===== */
  .completed-project-header {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-start;
    padding: 0px 0px 20px 0;
    margin-bottom: 2.5rem;
    box-shadow: 0 1px 0 var(--dark-100);
    position: relative;
  }

  .completed-project-header::after {
    content: '';
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    width: 0;
    box-shadow: 0 0 0 0.5px var(--dark-100);
  }

  .completed-project-header-left {
    display: flex;
    flex-direction: column;
    width: 75%;
  }

  .completed-project-title {
    font-family: 'DM Serif Text', serif;
    font-size: 32px;
    line-height: 1.2;
    color: var(--dark-100);
    margin-bottom: 20px;
  }

  .completed-project-icon {
    font-size: 15px;
    font-weight: 300;
    letter-spacing: 2px;
    position: absolute;
    top: 0;
    right: 0px;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    box-sizing: border-box;
    gap: 8px;
    flex-direction: column; /* Changed to column to stack like button and count */
    align-items: flex-end; /* Right-align items */
  }
  
  /* Hide the project ID text but keep the container visible for the like button */
  .completed-project-icon::after {
    content: attr(data-project-id);
    display: none; /* Hide the ID */
  }
  
  /* Hide direct text nodes within .completed-project-icon */
  .completed-project-icon {
    font-size: 0; /* Hide the direct text node inside */
  }

  /* Keep normal font size for any children (like the button) */
  .completed-project-icon * {
    font-size: 15px; /* Reset font size for children */
  }

  .like-button {
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    color: var(--dark-70);
    transition: color 0.2s ease, transform 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 30px;
    width: 30px;
  }

  .like-button:hover {
    color: var(--dark-pink-100);
    transform: scale(1.1);
  }

  /* Use more prominent color when active/liked */
  .like-button.liked :global(svg) {
    color: var(--dark-pink-100);
    animation: heartPulse 0.3s ease-in-out;
  }
  
  /* Add the heart pulse animation */
  @keyframes heartPulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.3); }
    100% { transform: scale(1); }
  }

  /* ===== PROJECT LABEL STYLES ===== */
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
  
  .value-side.money {
    background-color: var(--purple-100);
    color: var(--pure-white-100);
  }

  .value-side.time {
    background-color: var(--yellow-100);
    color: var(--dark-100);
  }

  .value-side.sanity {
    background-color: var(--dark-pink-100);
    color: var(--pure-white-100);
  }

  .value-side.fun {
    background-color: var(--dark-orange-100);
    color: var(--pure-white-100);
  }

  .value-side.insight {
    background-color: var(--plum-100);
    color: var(--pure-white-100)
  }

  /* ===== PROJECT CONTENT COLUMNS ===== */
  .completed-project-left-column {
    width: 75%; /* Take up 75% of the available space */
    min-width: 0; /* Allow proper text wrapping */
    display: flex;
    flex-direction: column;
    overflow: visible;
  }

  .completed-project-description {
    padding-right: 18px;
    margin: 0;
    padding-top: 0;
  }

  .completed-project-image-column {
    width: 25%; /* Take up 25% of the available space */
    max-width: 300px;
    overflow: hidden;
    align-self: flex-start;
    display: flex;
    align-items: flex-start;
    justify-content: left;
    aspect-ratio: 1 / 1; /* Make container a perfect square */
  }

  .completed-project-image-column img {
    width: 100%;
    height: 100%; /* Set height to 100% instead of auto */
    display: block;
    border: 1px var(--dark-100) solid;
    object-fit: contain;
  }

  /* ===== PROJECT TOOLS SECTION ===== */
  .completed-project-tools {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    align-items: center;
    margin-bottom: 60px;
    padding-top: 1.5rem;
  }

  .completed-project-tool {
    font-size: 12px;
    font-weight: 400;
    color: var(--dark-60);
    background-color: var(--dark-5);
    border-radius: 20px;
    padding: 2px 16px;
  }

  /* ===== SLIDER CONTAINER STRUCTURE ===== */
  .slider-outer-container {
    position: relative;
    width: 100%;
    margin-bottom: 0.5rem;
    overflow: visible;
  }

  .completed-project-slider-wrapper {
    position: relative;
    width: 100%;
    overflow: visible; /* Allow buttons to be visible outside */
    margin-bottom: 0.5rem;
  }
  
  .completed-project-slider {
    position: relative;
    width: 100%;
    overflow: hidden; /* Keep slides hidden */
  }

  .slider-container {
    position: relative;
    width: 100%;
  }

  /* ===== SLIDER TRACK AND SLIDES ===== */
  .slider-track {
    display: flex;
    transition: transform 0.5s ease;
    width: 300%; /* Support up to 3 slides by default */
  }

  .slider-slide {
    flex: 1;
    min-width: 33.333%; /* Each slide takes up 1/3 of the track by default */
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
  }

  /* ===== SLIDER CONTROLS ===== */
  .slider-controls {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 1rem;
    margin-top: 10px;
  }

  .slider-links {
    display: flex;
    justify-content: space-between;
    width: 100%;
  }

  .slider-forward {
    margin-left: auto; /* Push to the right side */
    text-align: right; /* Right-align the text */
  }
  
  .slider-back {
    margin-right: auto; /* Push to the left side */
    text-align: left; /* Left-align the text */
  }

  .slider-nav {
    display: flex;
    gap: 0.5rem;
    width: 100%;
    justify-content: center;
  }

  /* ===== SLIDER NAVIGATION DOTS ===== */
  .slider-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: var(--dark-20);
    border: none;
    padding: 0;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }

  .slider-dot.active {
    background-color: var(--dark-80);
  }

  /* ===== SLIDER NAVIGATION ARROWS ===== */
  .slider-arrow-button {
    background-color: var(--light-100); 
    border: none;
    color: var(--dark-70);
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    z-index: 100;
  }

  .slider-arrow-button.outside-positioned {
    position: absolute;
    transform: translateY(-50%);
    z-index: 100;
    /* Layered shadow with adjusted light direction and top outline */
    box-shadow:
      /* Subtle inset shadow to create top edge definition */
      inset 0 1px 1px rgba(0, 0, 0, 0.05),
      /* Main shadow layers with slight directional shift */
      0 1px 2px rgba(0, 0, 0, 0.08),
      0 2px 4px rgba(0, 0, 0, 0.08),
      0 4px 6px rgba(0, 0, 0, 0.08),
      0 6px 8px rgba(0, 0, 0, 0.08);
  }

  .slider-arrow-button:hover {
    /* Enhanced hover effect with maintained top edge */
    box-shadow:
      inset 0 1px 1px rgba(0, 0, 0, 0.05),
      0 2px 4px rgba(0, 0, 0, 0.12),
      0 4px 6px rgba(0, 0, 0, 0.12),
      0 8px 10px rgba(0, 0, 0, 0.12),
      0 12px 16px rgba(0, 0, 0, 0.08);
    transform: translateY(calc(-50% - 1px)); /* Maintain vertical centering while moving up 1px */
  }

  .slider-arrow-left.outside-positioned {
    left: -18px;
  }

  .slider-arrow-right.outside-positioned {
    right: -18px;
  }
  
  .slider-arrow-button.center-positioned {
    position: absolute;
    transform: translateY(calc(-50% - 40px)); /* Move 40px up from center */
    z-index: 100; /* Increased z-index significantly */
    pointer-events: auto; /* Ensure clicks work */
  }
  
  .slider-arrow-left.center-positioned {
    left: 0px; /* Position at the edge instead of outside */
  }
  
  .slider-arrow-right.center-positioned {
    right: 0px; /* Position at the edge instead of outside */
  }
  
  .slider-arrow-button:disabled {
    opacity: 0; /* Hide completely when disabled instead of faded */
    cursor: not-allowed;
    pointer-events: none; /* Make it completely undetectable to mouse events */
  }

  /* ===== SLIDER LINKS STYLING ===== */
  .slider-link, .slider-back-link {
    display: inline-block;
    margin-right: 15px;
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    font-size: 14px;
    font-weight: 400;
    color: var(--dark-85);
    transition: opacity 0.2s ease;
    text-align: left;
    text-decoration: none; /* Remove default underline */
  }

  .slider-link:hover, .slider-back-link:hover {
    opacity: 0.8;
  }

  .slider-link .link-text {
    text-decoration: underline;
  }
  
  .slider-link .link-arrow {
    text-decoration: none;
    margin-left: 3px; /* Add a small space between text and arrow */
  }
  
  .slider-back-link .link-text {
    text-decoration: underline;
  }
  
  .slider-back-link .link-arrow {
    text-decoration: none;
    margin-right: 3px; /* Add a small space between arrow and text */
  }

  /* ===== IMPACT SECTION ===== */
  .completed-project-impact {
    padding-top: 0;
    width: 100%;
    height: 100%;
  }

  .impact-container {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
  }
  
  /* ===== CONTENT FORMATTING ===== */
  :global(.completed-project-description p:last-child),
  :global(.completed-project-impact p:last-child),
  :global(.completed-project-extra p:last-child) {
    margin-bottom: 0;
  }

  /* ===== RESPONSIVE DESIGN ===== */
  /* ===== TABLET BREAKPOINT (max-width: 768px) ===== */
  @media (max-width: 768px) {
    .completed-project-card {
      margin-bottom: 80px;
    }

    .completed-project-title {
      font-size: 28px;
      margin-bottom: 0.5rem;
      width: 90%;
    }
    
    .completed-project-header {
      margin-bottom: 2rem;
    }

    .completed-project-left-column {
      width: 70%;  
    }

    .completed-project-image-column {
      width: 30%;
    }
    
    .slider-controls {
      margin-top: 20px;
      gap: 0.5rem;
    }
  }

  /* ===== MOBILE BREAKPOINT (max-width: 576px) ===== */
  @media (max-width: 576px) {

    .completed-project-card {
      display: flex;
      flex-direction: column;
      margin-bottom: 40px
    }
    
    .completed-project-header {
      order: 1;
      flex-direction: column;
    }
    
    .completed-project-header-left {
      width: 100%;
      display: flex;
    }
    
    .completed-project-title {
      font-size: 24px;
      margin-bottom: 10px;
    }
    
    /* Structure the content */
    .completed-project-content {
      order: 2;
      display: flex;
      flex-direction: column;
      gap: 20px;
      overflow: visible;
    }
    
    /* Force the image above the content on mobile */
    .completed-project-image-column {
      width: 60%;
      order: 1;
      margin-bottom: 0;
      align-self: flex-start; /* Left-align the image container instead of center */
    }

    .completed-project-image-column img {
      width: 100%;
      min-width: unset; /* Remove the min-width that's causing the overflow */
      height: 100%; 
      margin: 0;
      object-fit: contain;
    }
    
    .completed-project-left-column {
      width: 100%;
      order: 2;
    }
    
    /* Tools come last */
    .completed-project-tools {
      padding-top: 10px;
      order: 3;
    }

    .slider-nav {
      margin: 10px 0;
    }

    .slider-controls {
      margin-top: 6px;
    }
    
    /* Slider arrow adjustments for mobile */
    .slider-arrow-button {
      width: 32px;
      height: 32px;
    }

    .slider-arrow-left.outside-positioned {
      left: -12px;
    }

    .slider-arrow-right.outside-positioned {
      right: -12px;
    }
    
    .slider-arrow-left.center-positioned {
      left: -5px; /* Further reduced for mobile */
    }
    
    .slider-arrow-right.center-positioned {
      right: -5px; /* Keeping symmetry */
    }
  }

  /* Add styles for loading and error states */
  .loading-state,
  .error-state {
    padding: 2rem;
    text-align: center;
    font-size: 1.2rem;
    color: var(--dark-60);
  }
  
  .error-state {
    color: var(--dark-pink-100);
  }

  /* Add style for the like counter */
  .like-count {
    font-size: 14px;
    color: var(--dark-100);
    text-align: right;
    margin-top: -5px;
    font-weight: 400;
  }
</style>
