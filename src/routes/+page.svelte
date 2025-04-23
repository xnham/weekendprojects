<script lang="ts">
  import { onMount } from 'svelte';
  import { updateMetadata } from '$lib/stores/metadataStore';
  import AboveTheFold from '$lib/components/AboveTheFold.svelte';
  import CompletedPortfolio from '$lib/components/CompletedPortfolio.svelte';
  
  // Accept data from page.server.js
  export let data;
  
  // Initialize metadata at component creation time, not just onMount
  updateMetadata({
    title: "Wendy Ham's Weekend Projects",
    description: "Experiments in creating bespoke 'software for one' using AI tools. A look into the rising accessibility of hyperpersonal software for supercharging life tasks.",
    type: "website",
    url: "https://xnham.com",
    canonicalUrl: "https://xnham.com/"
  });
  
  onMount(() => {
    // Any client-side only logic can still go here
  });
</script>

<section class="container">
  <AboveTheFold />
</section>

<!-- Completed Projects Section with preloaded data -->
<section class="container">
  <CompletedPortfolio preloadedProjects={data.projects} serverError={data.error} />
</section>

<!-- Additional home page content would go here -->

<style>
  
</style>
