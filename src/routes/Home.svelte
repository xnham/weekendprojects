<script>
  import AboveTheFold from '../components/AboveTheFold.svelte';
  import CompletedPortfolio from '../components/CompletedPortfolio.svelte';
  // Import other home page specific components as needed
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
    /* Small desktop breakpoint */
    @media (max-width: 1200px) {
      .container {
        padding-left: 5vw;
        padding-right: 5vw;
      }
    }
</style>
