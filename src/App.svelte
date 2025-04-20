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
  import metadata, { resetMetadata } from './stores/metadataStore';
  import SunnyModal from './components/SunnyModal.svelte';
  
  // State to track current page
  let currentPage = 'home';
  
  // Add this after your other variables
  let sunnyModal;
  
  // Create JSON-LD data with a reactive declaration
  $: jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": "#wendyham",
        "name": "Wendy Ham",
        "jobTitle": "Builder of Software for One",
        "description": "Building hyperpersonal software to create bespoke custom automation for individuals and small businesses.",
        "knowsAbout": [
          "AI-assisted software development",
          "Vibe coding",
          "Software for one",
          "Custom automation",
          "Hyperpersonal software solutions"
        ],
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "New York",
          "addressRegion": "NY",
          "addressCountry": "US"
        },
        "sameAs": [
          "https://www.linkedin.com/in/whamwhamwham/",
          "https://www.instagram.com/whamwhamwham/",
          "https://scholar.google.com/citations?user=vTgiK8cAAAAJ&hl=en",
          "https://www.crunchbase.com/person/wendy-ham"
        ]
      },
      {
        "@type": "WebSite",
        "@id": "#website",
        "url": "https://xnham.com",
        "name": "Wendy Ham - Builder of Software for One",
        "description": "Weekend Projects: Exploring the creation of hyperpersonal, hypertargeted software tailored to solve specific individual and small business needs.",
        "author": {"@id": "#wendyham"}
      },
      {
        "@type": "ItemList",
        "@id": "#projectCollection",
        "name": "Software for One Projects",
        "description": "Collection of hyperpersonal software solutions built by Wendy Ham",
        "itemListElement": [
          {
            "@type": "CreativeWork",
            "position": 1,
            "name": "Expeditr",
            "description": "Tool that consolidates recipe URLs into one ingredient list for easier meal planning and grocery shopping.",
            "author": {"@id": "#wendyham"},
            "url": "https://xnham.com/projects/expeditr"
          },
          {
            "@type": "SoftwareApplication",
            "position": 2,
            "name": "Miss Penny",
            "description": "Daily text notification system to track expenses against budget, reducing monthly spending by $334 on average.",
            "author": {"@id": "#wendyham"},
            "applicationCategory": "FinanceApplication",
            "url": "https://xnham.com/projects/miss-penny"
          },
          {
            "@type": "SoftwareApplication",
            "position": 3,
            "name": "Custom Google Calendar Integration",
            "description": "Automated system that extracts lesson schedules from a club's web app and posts them to Google Calendar for easy access.",
            "author": {"@id": "#wendyham"},
            "applicationCategory": "ProductivityApplication",
            "url": "https://xnham.com/projects/calendar-integration"
          }
        ]
      }
    ]
  };
  
  // Function to determine current page from URL
  function updateCurrentPage() {
    const path = window.location.pathname;
    
    // Reset metadata when page changes
    resetMetadata();
    
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
    
    // Send page view to Google Analytics when page changes
    if (typeof gtag === 'function') {
      gtag('event', 'page_view', {
        page_title: $metadata.title,
        page_location: window.location.href,
        page_path: window.location.pathname
      });
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
  
  // Intercept link clicks for SPA navigation and modals
  function handleLinkClick(event: MouseEvent) {
    // Only handle links within our app
    const target = (event.target as Element).closest('a');
    if (target && target.href && new URL(target.href).origin === window.location.origin) {
      const href = target.getAttribute('href');
      
      // Check if this is the Sunny modal link
      if (href === '/sunny') {
        event.preventDefault();
        event.stopPropagation();
        sunnyModal.open();
        return;
      }
      
      // Otherwise proceed with normal SPA navigation
      event.preventDefault();
      
      // Update URL without full page reload
      window.history.pushState({}, '', href);
      
      // Update the displayed page
      updateCurrentPage();
    }
  }
</script>

<svelte:head>
  <title>{$metadata.title}</title>
  <meta name="description" content={$metadata.description} />
  
  <!-- Canonical URL -->
  <link rel="canonical" href={$metadata.canonicalUrl || window.location.href} />
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content={$metadata.type} />
  <meta property="og:url" content={$metadata.url || window.location.href} />
  <meta property="og:title" content={$metadata.title} />
  <meta property="og:description" content={$metadata.description} />
  <meta property="og:site_name" content="Wendy Ham's Weekend Projects" />
  <meta property="og:locale" content="en_US" />
  {#if $metadata.image}
    <meta property="og:image" content={$metadata.image} />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="Software for one, for everyone." />
  {/if}
  
  <!-- Twitter -->
  <meta name="twitter:card" content={$metadata.twitterCard || "summary_large_image"} />
  <meta name="twitter:site" content="@xnham" />
  <meta name="twitter:creator" content="@xnham" />
  <meta name="twitter:title" content={$metadata.title} />
  <meta name="twitter:description" content={$metadata.description} />
  {#if $metadata.image}
    <meta name="twitter:image" content={$metadata.image} />
    <meta name="twitter:image:alt" content="Software for one, for everyone." />
  {/if}
  
  <!-- JSON-LD Structured Data -->
  {@html `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`}
</svelte:head>

<SunnyModal bind:this={sunnyModal} />

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
