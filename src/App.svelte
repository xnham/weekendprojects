<script lang="ts">
  import { onMount } from 'svelte';
  import Nav from './components/shared/Nav.svelte';
  import Footer from './components/shared/Footer.svelte';
  import Home from './routes/Home.svelte';
  import Next from './routes/Next.svelte';
  import Writing from './routes/Writing.svelte'
  import About from './routes/About.svelte';
  import Contact from './routes/Contact.svelte';
  import { initializeInteractions } from './services/interactionService';
  
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
    // Set initial page based on URL
    updateCurrentPage();
    
    // Add event listener for navigation
    window.addEventListener('popstate', handleNavigation);
    
    // Add click event listener to document for capturing link clicks
    document.addEventListener('click', handleLinkClick);
    
    // Initialize both interaction systems
    initializeInteractions();
    
    return () => {
      window.removeEventListener('popstate', handleNavigation);
      document.removeEventListener('click', handleLinkClick);
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
