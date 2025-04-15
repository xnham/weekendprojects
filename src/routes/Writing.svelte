<script lang="ts">
  import { onMount } from 'svelte';
  import Essays from '../components/Essays.svelte';
  import Essay from '../components/Essay.svelte';
  import { updateMetadata } from '../stores/metadataStore';
  
  let currentEssay: string | null = null;
  
  function getSlugFromUrl(): string | null {
    const path = window.location.pathname;
    const match = path.match(/\/writing\/(.+)/);
    return match ? match[1] : null;
  }
  
  function updateCurrentEssay() {
    currentEssay = getSlugFromUrl();
    
    // Update metadata for the main writing page (when no specific essay is selected)
    if (!currentEssay) {
      updateMetadata({
        title: "Writing | Wendy Ham's Weekend Projects",
        description: "Thoughts about creating software that quietly complements our lives.",
        type: "website",
      canonicalUrl: "https://xnham.com/writing"
      });
    }
    // Essay-specific metadata will be handled in the Essay component
  }
  
  onMount(() => {
    // Set initial value
    updateCurrentEssay();
    
    // Listen for popstate events (back/forward navigation)
    window.addEventListener('popstate', updateCurrentEssay);
    
    // Listen for our custom event
    window.addEventListener('urlchange', updateCurrentEssay);
    
    // Listen for spanavigate event from App.svelte
    window.addEventListener('spanavigate', updateCurrentEssay);
    
    // Clean up listener when component is destroyed
    return () => {
      window.removeEventListener('popstate', updateCurrentEssay);
      window.removeEventListener('urlchange', updateCurrentEssay);
      window.removeEventListener('spanavigate', updateCurrentEssay);
    };
  });
  
  // Create a custom event dispatcher for Essays component
  function handleLinkClick(event: MouseEvent): void {
    // Find closest anchor tag (even if we clicked on a child element)
    const target = event.target as HTMLElement;
    const anchorElement = target.closest('a');
    
    if (anchorElement) {
      const href = anchorElement.getAttribute('href');
      
      if (href && href.startsWith('/writing/')) {
        event.preventDefault();
        history.pushState({}, '', href);
        updateCurrentEssay();
      }
    }
  }
</script>

<svelte:window on:click={handleLinkClick}/>

<main class="container">
  {#if currentEssay}
    <Essay slug={currentEssay} />
  {:else}
    <h2 class="small-bottom-margin">Thoughts about <span class="purple">Software.</span></h2>
    
    <div class="future-project-intro">
      <p>How do our natural behaviors and cognitive patterns uncover opportunities to rethink software design and create tools that <span class="small-font">quietly</span> complement our lives?</p>
    </div>
    
    <Essays />
  {/if}
</main>

<style>

  .future-project-intro {
    width: 75%;
    margin-bottom: 80px;
  }

  .small-font {
    font-size: 12px;
  }
  
  /* Responsive adjustments */
  
  @media (max-width: 768px) {
    .future-project-intro {
    width: 100%;
    margin-bottom: 60px;
    }
  }
</style>