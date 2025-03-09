<script lang="ts">
  import { onMount } from 'svelte';
  import Essays from '../components/Essays.svelte';
  import Essay from '../components/Essay.svelte';
  
  let currentEssay: string | null = null;
  
  function getSlugFromUrl(): string | null {
    const path = window.location.pathname;
    const match = path.match(/\/writing\/(.+)/);
    return match ? match[1] : null;
  }
  
  function updateCurrentEssay() {
    currentEssay = getSlugFromUrl();
  }
  
  onMount(() => {
    // Set initial value
    updateCurrentEssay();
    
    // Listen for popstate events (back/forward navigation)
    window.addEventListener('popstate', updateCurrentEssay);
    
    // Listen for our custom event
    window.addEventListener('urlchange', updateCurrentEssay);
    
    // Clean up listener when component is destroyed
    return () => {
      window.removeEventListener('popstate', updateCurrentEssay);
      window.removeEventListener('urlchange', updateCurrentEssay);
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
      <p>I explore ideas about software from a human-centric perspective: how our natural behaviors, cognitive patterns, and lived experiences uncover opportunities to rethink software design to create tools that quietly complement how we think and live.</p>
    </div>
    
    <Essays />
  {/if}
</main>

<style>
  .future-project-intro {
    width: 75%;
    margin-bottom: 80px;
  }
  
  /* Responsive adjustments */
  
  @media (max-width: 768px) {
    .future-project-intro {
    width: 100%;
    margin-bottom: 80px;
    }
  }
</style>