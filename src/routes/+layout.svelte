<script>
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import Nav from '$lib/components/shared/Nav.svelte';
  import Footer from '$lib/components/shared/Footer.svelte';
  import { metadata } from '$lib/stores/metadataStore';
  import SunnyModal from '$lib/components/SunnyModal.svelte';
  import { isSunnyModalOpen } from '$lib/stores/sunnyModalStore';
  import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';
  import '$lib/fa'; // Import FontAwesome setup
  import '../app.css';
  
  // Determine the current page for the navigation
  $: currentPage = $page.url.pathname === '/' 
    ? 'home' 
    : $page.url.pathname.split('/')[1];
    
  // For Google Analytics
  onMount(() => {
    // Check URL for sunny hash
    if (window.location.hash === '#sunny') {
      isSunnyModalOpen.set(true);
      window.history.replaceState(null, document.title, window.location.pathname + window.location.search);
    }
    
    // Watch for page changes and send to GA
    const unsubscribe = page.subscribe(($page) => {
      if (typeof gtag === 'function') {
        gtag('event', 'page_view', {
          page_title: document.title,
          page_location: $page.url.href,
          page_path: $page.url.pathname
        });
      }
    });
    
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
  
  <!-- Google tag (gtag.js) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-DN655YG1YB"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-DN655YG1YB');
  </script>
  
  <!-- Add missing Twitter meta tags -->
  <meta name="twitter:site" content="@xnham" />
  <meta name="twitter:creator" content="@xnham" />
  <meta name="twitter:image:alt" content="Software for one, for everyone." />
</svelte:head>

<div class="site-wrapper">
  <Nav {currentPage} />
  
  <main>
    <slot />
  </main>
  
  <Footer />
  
  <!-- Sunny Modal -->
  <SunnyModal isOpen={$isSunnyModalOpen} />
</div>

<style>
  .site-wrapper {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }
  
  main {
    flex: 1;
    padding-top: 70px; /* To account for fixed navigation */
  }
</style> 