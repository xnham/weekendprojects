<script lang="ts">
  import { onMount } from 'svelte';
  import { projects } from '../data/projects.js';
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
  }
  
  // Filter for completed projects only that are set to show, and sort by ID in descending order
  const completedProjects = projects
    .filter(project => project.status === 'completed' && project.show === true)
    .sort((a, b) => b.id - a.id);
  
  // Track current slide for each project
  let currentSlides: Record<number, number> = {};
  
  // Touch handling for swipe gestures
  let touchStartX = 0;
  let touchEndX = 0;
  
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
  
  onMount(() => {
    completedProjects.forEach(project => {
      currentSlides[project.id] = 0;
    });
    
    // Optional: Check if fonts are loaded
    document.fonts.ready.then(() => {
      // All fonts are loaded
      console.log('Fonts loaded');
    });
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
        <div class="completed-project-id">{String(project.id).padStart(2, '0')}</div>
      </div>
      
      <div class="completed-project-content">
        <div class="completed-project-left-column">
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
                  <div class="completed-project-description">
                    {@html formatDescription(project.longDescription)}
                  </div>
                </div>
                
                <!-- Slide 2: Impact (if impact is true) -->
                {#if hasImpact(project)}
                  <div class="slider-slide" style="min-width: {100 / getTotalSlides(project)}%">
                    <div class="completed-project-impact">
                      <div class="impact-container">
                        <ImpactShowcase project={project} />
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
              
              <!-- Slider Controls: Links + Navigation -->
              <div class="slider-controls">
                <div class="slider-links">
                  <div class="slider-back" style="visibility: {currentSlides[project.id] === 0 ? 'hidden' : 'visible'}">
                    <a href="#back"
                       class="slider-back-link" 
                       on:click|preventDefault={() => goBack(project.id)}
                       on:keydown={(e) => e.key === 'Enter' && goBack(project.id)}
                       aria-label="Go to previous slide">
                      <span class="link-arrow">&lt;</span><span class="link-text">Back</span>
                    </a>
                  </div>
                  <div class="slider-forward" 
                       style="visibility: {currentSlides[project.id] === (getTotalSlides(project) - 1) ? 'hidden' : 'visible'}">
                    <a href="#next"
                       class="slider-link" 
                       on:click|preventDefault={() => goForward(project.id, project)}
                       on:keydown={(e) => e.key === 'Enter' && goForward(project.id, project)}
                       aria-label="Go to next slide">
                      <span class="link-text">{getLinkText(project, currentSlides[project.id]).main}</span><span class="link-arrow">{getLinkText(project, currentSlides[project.id]).arrow}</span>
                    </a>
                  </div>
                </div>
                
                <!-- Only show slider navigation dots when there are multiple slides -->
                {#if getTotalSlides(project) > 1}
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
                {/if}
              </div>
            </div>
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
</div>

<style>
  /* ===== COMPLETED PROJECT CARDS ===== */
  .completed-projects {
    display: flex;
    flex-direction: column;
    gap: 3rem;
    margin: 0;
  }

  .completed-project-card {
    display: flex;
    flex-direction: column;
    background-color: var(--light-100);
    overflow: hidden;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    width: 100%;
    margin-bottom: 80px;
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

  .completed-project-left-column {
    width: 75%; /* Take up 75% of the available space */
    min-width: 0; /* Allow proper text wrapping */
    display: flex;
    flex-direction: column;
  }

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

  .completed-project-id {
    font-size: 14px;
    font-weight: 300;
    letter-spacing: 2px;
    position: absolute;
    top: 0;
    right: 10px;
    display: flex;
    justify-content: flex-end;
    align-items: flex-start;
    box-sizing: border-box;
  }

  .completed-project-description {
    padding: 0;
    margin: 0;
  }

  .completed-project-image-column {
    width: 25%; /* Take up 25% of the available space */
    max-width: 300px;
    overflow: hidden;
    align-self: flex-start;
    display: flex;
    align-items: flex-start;
    justify-content: left;
    border: 1px var(--dark-100) solid;
    aspect-ratio: 1 / 1; /* Make container a perfect square */
  }

  .completed-project-image-column img {
    width: 100%;
    height: 100%; /* Set height to 100% instead of auto */
    display: block;

    object-fit: contain;
  }

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

  /* ===== PROJECT SLIDER ===== */
  .completed-project-slider {
    position: relative;
    width: 100%;
    overflow: hidden;
    margin-bottom: 0.5rem;
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

  /* Update slider controls to stack vertically */
  .slider-controls {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 1rem;
    margin-top: 10px;
  }

  /* Center the dots horizontally */
  .slider-nav {
    display: flex;
    gap: 0.5rem;
    width: 100%;
    justify-content: center;
  }

  /* Container for navigation links */
  .slider-links {
    display: flex;
    justify-content: space-between;
    width: 100%;
  }

  /* Slider dots styling */
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
  
  :global(.completed-project-description p:last-child),
  :global(.completed-project-impact p:last-child),
  :global(.completed-project-extra p:last-child) {
    margin-bottom: 0;
  }

  /* Add these new styles for the link components */
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
  
  /* Keep these existing value styles, but we can remove the standalone .completed-project-value class */
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

  /* ===== RESPONSIVE DESIGN ===== */
  /* ===== TABLET BREAKPOINT (max-width: 768px) ===== */
  @media (max-width: 768px) {

    .completed-projects {
      gap: 2rem;
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
    /* Keep the header at the top on mobile */
    .completed-project-card {
      display: flex;
      flex-direction: column;
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
      order: 3;
      margin-top: 20px;
      margin-bottom: 40px;
    }
  
  }

  /* Look for any container that might be wrapping the impact section */
  .completed-project-impact {
    padding-top: 0;
    width: 100%;
    height: 100%;
  }

  /* If there's any additional wrapper div around the impact content */
  .impact-container {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
  }
  
  /* Moved redundant global styles to app.css */
</style>
