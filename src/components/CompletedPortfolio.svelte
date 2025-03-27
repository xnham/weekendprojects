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
    impact: string;
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
  
  // Initialize current slide for each project
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
  
  // Helper function to format impact with paragraphs
  function formatImpact(impact: string): string {
    return impact.split('\n').map(line => `<p>${line}</p>`).join('');
  }
  
  // Function to navigate to a specific slide
  function goToSlide(projectId: number, slideIndex: number): void {
    currentSlides[projectId] = slideIndex;
  }
  
  // Function to go forward one slide
  function goForward(projectId: number, project: Project): void {
    const numSlides = project.extraContent ? 3 : 2;
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
            <div class="slider-container">
              <div class="slider-track" 
                   style="width: {project.extraContent ? 300 : 200}%; 
                          transform: translateX(-{currentSlides[project.id] * (project.extraContent ? 33.333 : 50)}%);">
                
                <!-- Slide 1: Long Description -->
                <div class="slider-slide">
                  <div class="completed-project-description">
                    {@html formatDescription(project.longDescription)}
                  </div>
                </div>
                
                <!-- Slide 2: Impact -->
                <div class="slider-slide">
                  <div class="completed-project-impact">
                    <ImpactShowcase project={project} />
                  </div>
                </div>
                
                <!-- Slide 3: Extra Content (if available) -->
                {#if project.extraContent}
                  <div class="slider-slide">
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
                       style="visibility: {currentSlides[project.id] === (project.extraContent ? 2 : 1) ? 'hidden' : 'visible'}">
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
                  <button class="slider-dot {currentSlides[project.id] === 1 ? 'active' : ''}" 
                          on:click={() => goToSlide(project.id, 1)}
                          aria-label="Go to slide 2"></button>
                  {#if project.extraContent}
                    <button class="slider-dot {currentSlides[project.id] === 2 ? 'active' : ''}" 
                            on:click={() => goToSlide(project.id, 2)}
                            aria-label="Go to slide 3"></button>
                  {/if}
                </div>
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
    gap: 40px;
    width: 100%;
  }

  .completed-project-left-column {
    width: 70%; /* Take up 70% of the available space */
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
    margin-bottom: 1.5rem;
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
    width: 80%;
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
    padding-top: 20px;
    margin-bottom: 1rem;
  }

  .completed-project-image-column {
    width: 30%; /* Take up 30% of the available space */
    min-width: 180px; /* But don't get smaller than this */
    max-width: 300px; /* And don't get larger than this */
    min-height: 180px;
    overflow: hidden;
    align-self: flex-start;
  }

  .completed-project-image-column img {
    width: 100%;
    height: auto;
    display: block;
    border: 1px var(--dark-100) solid;
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
    padding-right: 20px;
    box-sizing: border-box;
  }

  /* Styling for buttons that replaced links */
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
    gap: 1.5rem;
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

  /* ===== TIME CALCULATOR - COMPONENT ===== */
  .time-calculator-container {
    margin: 20px auto;
    border-radius: 0px;
    width: 75%;
    height: 200px;
    border: 1px var(--dark-100) solid;
  }

  /* svelte-ignore css-unused-selector */
  .completed-project-impact {
    padding-top: 20px;
    margin-bottom: 1.5rem;
  }
  
  :global(.completed-project-description p:last-child),
  :global(.completed-project-impact p:last-child),
  :global(.completed-project-extra p:last-child) {
    margin-bottom: 0;
  }

  /* You may want to add these global container styles too */
  :global(.completed-project-description),
  :global(.completed-project-impact),
  :global(.completed-project-extra) {
    padding-top: 20px;
    margin-bottom: 1.5rem;
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
    .completed-project-content {
      gap: 20px;
    }
    
    .completed-project-left-column {
      width: 65%; /* Slightly less on tablet */
    }
    
    .completed-project-image-column {
      width: 35%; /* Slightly more on tablet */
    }
    
    .completed-project-title {
      font-size: 28px;
      margin-bottom: 15px;
    }
    
    .completed-project-header {
      margin-bottom: 1rem;
    }
    
    .slider-controls {
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
      margin-bottom: 20px;
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
    }
    
    /* Force the image above the content on mobile */
    .completed-project-image-column {
      width: 100%;
      order: 1;
      margin-bottom: 20px;
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
    
    .completed-project-image-column img {
      width: 70%;
      min-width: 220px;
      height: auto;
      margin: 0;
      object-fit: contain;
    }
  }
</style>
