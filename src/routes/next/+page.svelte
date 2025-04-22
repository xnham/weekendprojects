<script>
  import { onMount } from 'svelte';
  import { metadata } from '$lib/stores/metadataStore';
  
  onMount(() => {
    metadata.set({
      title: "Next | Wendy Ham's Weekend Projects",
      description: "Upcoming projects and ideas for future software for one implementations.",
      canonicalUrl: "https://xnham.com/next",
      type: "website",
      url: window.location.href
    });
  });
</script>

<svelte:head>
  <title>Next | Wendy Ham's Weekend Projects</title>
  <meta name="description" content="Upcoming projects and ideas for future software for one implementations." />
  <link rel="canonical" href="https://xnham.com/next" />
  
  <!-- Open Graph -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://xnham.com/next" />
  <meta property="og:title" content="Next | Wendy Ham's Weekend Projects" />
  <meta property="og:description" content="Upcoming projects and ideas for future software for one implementations." />
</svelte:head>

<div class="container">
  <h2>Coming <span class="purple">Next</span></h2>
  
  <!-- We'll populate the Next content later -->
  <p>Next page content will go here.</p>
</div> 