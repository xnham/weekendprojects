<script lang="ts">
  import { onMount, afterUpdate } from 'svelte';
  import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';
  import ImpactShowcase from './ImpactShowcase.svelte';
  import { supabase } from '../lib/supabase';
  import { 
    toggleLike, 
    isLiked,
    subscribeToInteractions,
    ContentType
  } from '../services/projectInteractionService';
  import InteractionButton from './shared/InteractionButton.svelte';
  
  // Define a type for the project structure
  interface Project {
    id: string;
    order: number;
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
    extraContentTitle?: string | null;
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
  
  // Interface to match projectInteractionService
  interface InteractionState {
    likes: Record<string, boolean>;
    follows: Record<string, boolean>;
    userEmail?: string;
    initialized: boolean;
  }
  
  // State for projects
  let completedProjects: Project[] = [];
  let loading = true;
  let error: string | null = null;
  
  // Replace likedProjects with subscription, using the proper interface
  let projectInteractionState: InteractionState = { 
    likes: {}, 
    follows: {}, 
    userEmail: undefined, 
    initialized: false 
  };
  
  // Add reactive derived values
  $: projectLikedStatus = completedProjects.reduce((acc, project) => {
    acc[project.id] = projectInteractionState?.likes[`${ContentType.PROJECT}:${project.id}`] || false;
    return acc;
  }, {} as Record<string, boolean>);
  
  // Fetch projects from Supabase
  onMount(() => {
    // Subscribe to interaction changes
    const unsubscribe = subscribeToInteractions(state => {
      projectInteractionState = state;
    });
    
    // Move the async part into a separate function
    async function loadProjects() {
      try {
        // Fetch completed projects from Supabase
        const { data, error: fetchError } = await supabase
          .from('projects')
          .select('*')
          .eq('status', 'completed')
          .eq('show', true)
          .order('order', { ascending: false });
        
        if (fetchError) throw fetchError;
        
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
      unsubscribe();
    };
  });
  
  // Track current slide for each project
  let currentSlides: Record<string, number> = {};
  
  // Touch handling for swipe gestures
  let touchStartX = 0;
  let touchEndX = 0;
  
  // References for description elements and arrow buttons
  let descriptionElements: Record<string, HTMLElement> = {};
  let leftArrows: Record<string, HTMLElement> = {};
  let rightArrows: Record<string, HTMLElement> = {};
  
  function handleTouchStart(e: TouchEvent): void {
    touchStartX = e.touches[0].clientX;
  }
  
  function handleTouchMove(e: TouchEvent): void {
    touchEndX = e.touches[0].clientX;
  }
  
  function handleTouchEnd(projectId: string, project: Project): void {
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
  function goToSlide(projectId: string, slideIndex: number): void {
    currentSlides[projectId] = slideIndex;
  }
  
  // Function to go forward one slide
  function goForward(projectId: string, project: Project): void {
    const numSlides = getTotalSlides(project);
    if (currentSlides[projectId] < numSlides - 1) {
      currentSlides[projectId]++;
    }
  }
  
  // Function to go back one slide
  function goBack(projectId: string): void {
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

  // Replace handleLikeClick with service call
  function handleLikeClick(projectId: string) {
    // Find the current project
    const project = completedProjects.find(p => p.id === projectId);
    if (!project) return;
    
    // Check if currently liked
    const isCurrentlyLiked = projectInteractionState?.likes[`${ContentType.PROJECT}:${projectId}`] || false;
    
    // Update the local count immediately for responsive UI
    if (project.likes !== undefined) {
      project.likes = isCurrentlyLiked ? Math.max(0, project.likes - 1) : project.likes + 1;
    } else if (!isCurrentlyLiked) {
      // If likes is undefined but user is liking, start at 1
      project.likes = 1;
    }
    
    // Force Svelte to update by creating a new array reference
    completedProjects = [...completedProjects];
    
    // Call the service with both required arguments
    toggleLike(ContentType.PROJECT, projectId);
  }

  // Replace isProjectLiked with lookup from reactive state
  function isProjectLiked(projectId: string): boolean {
    return projectLikedStatus[projectId] || false;
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
            <InteractionButton 
              type="like"
              active={projectLikedStatus[project.id]}
              count={undefined}
              showText={false}
              iconSize="lg"
              on:click={() => handleLikeClick(project.id)}
            />
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
                            {#if project.extraContentTitle}
                              <p class="extra-content-title">{project.extraContentTitle}</p>
                            {/if}
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
  /* ===== LAYOUT & CONTAINER STYLES ===== */
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

  /* ===== HEADER STYLES ===== */
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

  /* ===== PROJECT ID & LIKE BUTTON STYLES ===== */
  .completed-project-icon {
    position: absolute;
    top: 0;
    right: 14px;
    display: flex;
    flex-direction: column;
    align-items: flex-end;  /* This aligns children to the right */
    gap: 0;
    box-sizing: border-box;
    font-size: 0; /* Hide the direct text node inside */
  }
  
  /* Add these styles to ensure the button is properly aligned */
  :global(.completed-project-icon .interaction-btn) {
    padding: 6px 0 !important;
    background: transparent;
    margin-left: auto;
    width: fit-content;
    display: flex;
    justify-content: flex-end;
  }

  .completed-project-icon::after {
    content: attr(data-project-id);
    display: none; /* Hide the ID */
  }
  
  .completed-project-icon * {
    font-size: 15px; /* Reset font size for children */
  }

  .like-button {
    background: none;
    border: none;
    height: 30px;
    width: 30px;
    margin-left: auto;
  }

  .like-count {
    font-size: 15px;
    color: var(--dark-85);
    text-align: right;
    font-weight: 400;
  }

  /* ===== LABEL STYLES ===== */
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

  /* ===== CONTENT COLUMNS STYLES ===== */
  .completed-project-left-column {
    width: 75%;
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
    width: 25%;
    max-width: 300px;
    overflow: hidden;
    align-self: flex-start;
    display: flex;
    align-items: flex-start;
    justify-content: left;
    aspect-ratio: 1 / 1;
  }

  .completed-project-image-column img {
    width: 100%;
    height: 100%;
    display: block;
    border: 1px var(--dark-100) solid;
    object-fit: contain;
  }

  /* ===== TOOLS SECTION STYLES ===== */
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

  /* ===== SLIDER STRUCTURE STYLES ===== */
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

  /* ===== SLIDER CONTROLS & NAVIGATION STYLES ===== */
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

  /* ===== SLIDER ARROWS STYLES ===== */
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

  /* ===== SLIDER LINKS STYLES ===== */
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

  .slider-link .link-text,
  .slider-back-link .link-text {
    text-decoration: underline;
  }
  
  .slider-link .link-arrow,
  .slider-back-link .link-arrow {
    text-decoration: none;
  }
  
  .slider-link .link-arrow {
    margin-left: 3px; /* Add a small space between text and arrow */
  }
  
  .slider-back-link .link-arrow {
    margin-right: 3px; /* Add a small space between arrow and text */
  }

  /* ===== IMPACT SECTION STYLES ===== */
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

  /* ===== EXTRA SECTION STYLES ===== */
  .extra-content-title {
    font-weight: 600;
    margin-bottom: 1rem;
  }

  .completed-project-extra {
    padding: 30px 40px;
    background-color: var(--dark-2);
    width: 100%;
    height: 100%;
  }
  
  /* ===== CONTENT FORMATTING ===== */
  :global(.completed-project-description p:last-child),
  :global(.completed-project-impact p:last-child),
  :global(.completed-project-extra p:last-child) {
    margin-bottom: 0;
  }

  /* ===== STATUS INDICATOR STYLES ===== */
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

  /* ===== RESPONSIVE DESIGN ===== */
  /* TABLET BREAKPOINT */
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

  /* MOBILE BREAKPOINT */
  @media (max-width: 576px) {
    .completed-project-card {
      margin-bottom: 40px;
    }
    
    .completed-project-header {
      order: 1;
      flex-direction: column;
    }
    
    .completed-project-header-left {
      width: 100%;
    }
    
    .completed-project-title {
      width: 75%;
      font-size: 24px;
      margin-bottom: 10px;
    }
    
    .completed-project-content {
      order: 2;
      flex-direction: column;
      gap: 20px;
    }
    
    .completed-project-image-column {
      width: 60%;
      order: 1;
      margin-bottom: 0;
      align-self: flex-start;
    }

    .completed-project-image-column img {
      min-width: unset; /* Remove the min-width that's causing the overflow */
    }
    
    .completed-project-left-column {
      width: 100%;
      order: 2;
    }
    
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
      left: -5px;
    }
    
    .slider-arrow-right.center-positioned {
      right: -5px;
    }
  }

  /* MOBILE BREAKPOINT */
  @media (max-width: 576px) {
    .extra-content-title {
      margin-bottom: 12px;
    }
  }
</style>
