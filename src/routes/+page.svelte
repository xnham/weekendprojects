<script>
  import { onMount } from 'svelte';
  import { metadata } from '$lib/stores/metadataStore';
  import AboveTheFold from '$lib/components/AboveTheFold.svelte';
  import CompletedPortfolio from '$lib/components/CompletedPortfolio.svelte';
  import { updateMetadata } from '$lib/stores/metadataStore';
  
  onMount(() => {
    updateMetadata({
      title: "Wendy Ham | Software for One",
      description: "Building software for one — personalized, useful, playful projects that solve human-sized problems.",
      type: "website",
      url: "https://xnham.com"
    });
  });
</script>

<svelte:head>
  <title>Wendy Ham | Software for One</title>
  <meta name="description" content="Building software for one — personalized, useful, playful projects that solve human-sized problems." />
  <link rel="canonical" href="https://xnham.com" />
  
  <!-- Open Graph -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://xnham.com" />
  <meta property="og:title" content="Wendy Ham | Software for One" />
  <meta property="og:description" content="Building software for one — personalized, useful, playful projects that solve human-sized problems." />
  <meta property="og:image" content="/images/og-image.png" />
</svelte:head>

<div class="home-layout">
  <AboveTheFold />
  <CompletedPortfolio />
</div>

<style>
  .home-layout {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }
</style>
