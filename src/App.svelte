<script lang="ts">
  import { onMount } from 'svelte';
  import Nav from './components/shared/Nav.svelte';
  import Footer from './components/shared/Footer.svelte';
  import Home from './routes/Home.svelte';
  import Next from './routes/Next.svelte';
  import Writing from './routes/Writing.svelte'
  import About from './routes/About.svelte';
  import Contact from './routes/Contact.svelte';
  import { initializeInteractions as initializeProjectInteractions, getOrCreateDeviceId } from './services/projectInteractionService';
  import { initializeInteractions as initializeEssayInteractions } from './services/essayInteractionService';
  import { supabase } from './lib/supabase';
  
  // State to track current page
  let currentPage = 'home';
  
  // Function to determine current page from URL
  function updateCurrentPage() {
    const path = window.location.pathname;
    
    if (path === '/about') {
      currentPage = 'about';
    } else if (path === '/next') {
      currentPage = 'next';
    } else if (path.startsWith('/writing')) {
      currentPage = 'writing';
    } else if (path === '/contact') {
      currentPage = 'contact';
    } else {
      currentPage = 'home';
    }
  }
  
  // Handle navigation events
  function handleNavigation() {
    updateCurrentPage();
  }
  
  // Initialize and set up listeners
  onMount(() => {
    // Define original fetch before we potentially modify it
    const originalFetch = window.fetch;
    
    // Get device ID for Supabase headers
    const setupApp = async () => {
      const deviceId = await getOrCreateDeviceId();
      
      // No longer modifying fetch to add device-id header
      // Just use the original fetch function
      
      // Set initial page based on URL
      updateCurrentPage();
      
      // Initialize interaction systems
      initializeProjectInteractions();
      initializeEssayInteractions();
    };
    
    setupApp();
    
    // Add event listener for navigation
    window.addEventListener('popstate', handleNavigation);
    
    // Add listener for custom navigation event
    window.addEventListener('spanavigate', handleNavigation);
    
    // Add click event listener to document for capturing link clicks
    document.addEventListener('click', handleLinkClick);
    
    // Return cleanup function
    return () => {
      window.removeEventListener('popstate', handleNavigation);
      window.removeEventListener('spanavigate', handleNavigation);
      document.removeEventListener('click', handleLinkClick);
      
      // No need to restore original fetch since we're not modifying it anymore
    };
  });
  
  // Intercept link clicks for SPA navigation
  function handleLinkClick(event: MouseEvent) {
    // Only handle links within our app
    const target = (event.target as Element).closest('a');
    if (target && target.href && new URL(target.href).origin === window.location.origin) {
      event.preventDefault();
      const href = target.getAttribute('href');
      
      // Update URL without full page reload
      window.history.pushState({}, '', href);
      
      // Update the displayed page
      updateCurrentPage();
    }
  }
</script>

<svelte:head>
  <title>Wendy Ham's Weekend Projects'</title>
  <meta name="description" content="Weekend Projects: Experiments in creating bespoke 'software for one' using AI tools. A look into the rising accessibility of hyperpersonal software for supercharging life tasks."/>
</svelte:head>

<div>
  <Nav currentPage={currentPage} />

  <main>
    {#if currentPage === 'home'}
      <Home />
    {:else if currentPage === 'about'}
      <About />
    {:else if currentPage === 'next'}
      <Next />
    {:else if currentPage === 'writing'}
      <Writing />
    {:else if currentPage === 'contact'}
      <Contact />
    {/if}
  </main>
  
  <Footer />
</div>

<style>
  /* Make sure the app container takes up at least the full viewport height 
     so footer stays at bottom even with minimal content */
  div {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

  main {
    flex: 1;
  }
  /* App-specific styles can go here */
</style>
