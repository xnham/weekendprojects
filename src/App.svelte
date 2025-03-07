<script>
  import { onMount } from 'svelte';
  import Nav from './components/Nav.svelte';
  import Footer from './components/Footer.svelte';
  import Home from './routes/Home.svelte';
  import About from './routes/About.svelte';
  import Next from './routes/Next.svelte';
  
  // State to track current page
  let currentPage = 'home';
  
  // Function to determine current page from URL
  function updateCurrentPage() {
    const path = window.location.pathname;
    
    if (path === '/about') {
      currentPage = 'about';
    } else if (path === '/next') {
      currentPage = 'next';
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
    
    return () => {
      window.removeEventListener('popstate', handleNavigation);
    };
  });
  
  // Intercept link clicks for SPA navigation
  function handleLinkClick(event) {
    // Only handle links within our app
    const target = event.target.closest('a');
    if (target && target.origin === window.location.origin) {
      event.preventDefault();
      const href = target.getAttribute('href');
      
      // Update URL without full page reload
      window.history.pushState({}, '', href);
      
      // Update the displayed page
      updateCurrentPage();
    }
  }
</script>

<div on:click={handleLinkClick}>
  <Nav currentPage={currentPage} />

  <main>
    {#if currentPage === 'home'}
      <Home />
    {:else if currentPage === 'about'}
      <About />
    {:else if currentPage === 'next'}
      <Next />
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
