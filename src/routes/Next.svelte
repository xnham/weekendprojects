<script lang="ts">
  import FuturePortfolio from '../components/FuturePortfolio.svelte';
  import { onMount } from 'svelte';
  import { updateMetadata } from '../stores/metadataStore';
  
  onMount(() => {
    updateMetadata({
      title: "Next | Wendy Ham's Weekend Projects",
      description: "Have a say in what I build next. Like the projects that resonate with you and follow the ones you want access to.",
      type: "website"
    });
  });
</script>

<div class="container">
  <h2 class="small-bottom-margin">Tell Me What to Build <span class="purple">Next.</span></h2>
  
  <div class="future-project-intro">
    <p>Like the projects that resonate with you. Follow the ones you want access to.</p>
    <p>If you have your own project idea, how about having a chat with <a href="/mr-benedict">Mr. Benedict</a>, my gentle robot? It will help you figure out how to best build it.</p>
  </div>
  
  <FuturePortfolio />
</div>

<style>
  
  .future-project-intro {
    margin-bottom: 60px;
    width: 75%
  }
  
  .future-project-intro a {
    color: var(--dark-85);
    text-decoration: none;
    border-bottom: 1px solid var(--dark-100);
    transition: opacity 0.2s ease;
  }
  
  .future-project-intro a:hover {
    opacity: 0.7;
  }
  
  /* Tablet responsiveness */
  @media (max-width: 768px) {
    .future-project-intro {
      margin-bottom: 40px;
      width: 100%;
    }

    .future-project-intro p {
      margin-bottom: 1.5rem;
    }
  }
</style>
