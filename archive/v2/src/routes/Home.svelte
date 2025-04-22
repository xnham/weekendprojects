<script lang="ts">
  import { onMount } from 'svelte';
  import AboveTheFold from '../components/AboveTheFold.svelte';
  import CompletedPortfolio from '../components/CompletedPortfolio.svelte';
  import { updateMetadata } from '../stores/metadataStore';
  // Import other home page specific components as needed

  // Set page-specific metadata when component mounts
  onMount(() => {
    updateMetadata({
      title: "Wendy Ham's Weekend Projects",
      description: "Experiments in creating bespoke 'software for one' using AI tools. A look into the rising accessibility of hyperpersonal software for supercharging life tasks.",
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
