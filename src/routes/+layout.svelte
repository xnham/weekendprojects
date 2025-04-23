<script>
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { page } from '$app/stores';
  import Nav from '$lib/components/shared/Nav.svelte';
  import Footer from '$lib/components/shared/Footer.svelte';
  import { metadata } from '$lib/stores/metadataStore';
  import SunnyModal from '$lib/components/SunnyModal.svelte';
  import { isSunnyModalOpen } from '$lib/stores/sunnyModalStore';
  import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';
  import { initFA } from '$lib/fa'; // Import the FA initialization function
  import { initSunnyLinks } from '$lib/utils/sunnyLinkHandler'; // Import Sunny link handler
  import '../app.css';
  
  // Determine the current page for the navigation
  $: currentPage = $page.url.pathname === '/' 
    ? 'home' 
    : $page.url.pathname.split('/')[1];
    
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
  
  onMount(() => {
    // Initialize FontAwesome
    if (browser) {
      initFA();
      
      // Initialize the sunny link handler
      initSunnyLinks();
    }
  
    // Check URL for sunny hash
    if (browser && window.location.hash === '#sunny') {
      isSunnyModalOpen.set(true);
      // Save the current path without the hash
      const currentPath = window.location.pathname;
      window.history.replaceState(null, document.title, currentPath + window.location.search);
    }
    
    // Watch for page changes and send to GA
    const unsubscribe = page.subscribe(($page) => {
      // Access gtag through window object to avoid reference errors
      if (browser && typeof window.gtag === 'function') {
        window.gtag('event', 'page_view', {
          page_title: document.title,
          page_location: $page.url.href,
          page_path: $page.url.pathname
        });
      }
    });
    
    // Add Google Analytics dynamically to avoid SSR issues
    if (browser) {
      // Create and append GA script
      const gaScript = document.createElement('script');
      gaScript.async = true;
      gaScript.src = 'https://www.googletagmanager.com/gtag/js?id=G-DN655YG1YB';
      document.head.appendChild(gaScript);
      
      // Add the inline GA initialization script
      window.dataLayer = window.dataLayer || [];
      function gtag() {
        window.dataLayer.push(arguments);
      }
      gtag('js', new Date());
      gtag('config', 'G-DN655YG1YB');
    }
    
    return () => {
      unsubscribe();
    };
  });
</script>

<svelte:head>
  <!-- Dynamic SEO Metadata -->
  <title>{$metadata.title || "Wendy Ham | Software for One"}</title>
  {#if $metadata.description}
    <meta name="description" content={$metadata.description} />
  {/if}
  
  <!-- SEO essentials -->
  <meta name="robots" content="index, follow">
  <meta name="author" content="Wendy Ham">
  <meta name="keywords" content="Wendy Ham, building with AI, software for one, vibe coding, coding with AI, AI tools">
  <link rel="canonical" href={$metadata.canonicalUrl || 'https://xnham.com' + $page.url.pathname}>
  
  <!-- Favicon -->
  <link rel="icon" href="/favicon.png" type="image/png">
  
  <!-- Open Graph -->
  <meta property="og:type" content={$metadata.type || "website"} />
  <meta property="og:url" content={$metadata.url || "https://xnham.com"} />
  <meta property="og:title" content={$metadata.title || "Wendy Ham | Software for One"} />
  {#if $metadata.description}
    <meta property="og:description" content={$metadata.description} />
  {/if}
  <meta property="og:image" content="/images/og-image.png" />
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={$metadata.title || "Wendy Ham | Software for One"} />
  {#if $metadata.description}
    <meta name="twitter:description" content={$metadata.description} />
  {/if}
  <meta name="twitter:image" content="/images/og-image.png" />
  
  <!-- Add missing Twitter meta tags -->
  <meta name="twitter:site" content="@xnham" />
  <meta name="twitter:creator" content="@xnham" />
  <meta name="twitter:image:alt" content="Software for one, for everyone." />
  
  <!-- JSON-LD Structured Data -->
  {@html `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`}
</svelte:head>

<div class="site-wrapper">
  <Nav {currentPage} />
  
  <main>
    <slot />
  </main>
  
  <Footer />
  
  <!-- Sunny Modal -->
  <SunnyModal />
</div>

<style>
  .site-wrapper {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }
</style> 