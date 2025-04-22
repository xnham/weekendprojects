<script>
  import { onMount } from 'svelte';
  import { updateMetadata } from '$lib/stores/metadataStore';
  import AboveTheFold from '$lib/components/AboveTheFold.svelte';
  import CompletedPortfolio from '$lib/components/CompletedPortfolio.svelte';
  
  onMount(() => {
    updateMetadata({
      title: "Wendy Ham | Software for One",
      description: "Building software for one — personalized, useful, playful projects that solve human-sized problems.",
      type: "website",
      url: "https://xnham.com",
      canonicalUrl: "https://xnham.com"
    });
  });
</script>

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
