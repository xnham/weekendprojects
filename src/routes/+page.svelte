<script lang="ts">
  import { onMount } from 'svelte';
  import { updateMetadata } from '$lib/stores/metadataStore';
  import AboveTheFold from '$lib/components/AboveTheFold.svelte';
  import CompletedPortfolio from '$lib/components/CompletedPortfolio.svelte';
  
  onMount(() => {
    updateMetadata({
      title: "Wendy Ham's Weekend Projects",
      description: "Experiments in creating bespoke 'software for one' using AI tools. A look into the rising accessibility of hyperpersonal software for supercharging life tasks.",
      type: "website",
      url: "https://xnham.com",
      canonicalUrl: "https://xnham.com/"
    });
  });
</script>

<section class="container">
  <AboveTheFold />
</section>

<!-- Completed Projects Section -->
<section class="container">
  <CompletedPortfolio />
</section>

<!-- Additional home page content would go here -->

<style>
  
</style>
