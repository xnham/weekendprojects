<script>
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabase';
  import ImpactShowcase from './portfolio/ImpactShowcase.svelte';
  import InsightImpactShowcase from './portfolio/InsightImpactShowcase.svelte';
  import MoneyImpactCalculator from './portfolio/MoneyImpactCalculator.svelte';
  import SanityImpactShowcase from './portfolio/SanityImpactShowcase.svelte';
  import FunImpactShowcase from './portfolio/FunImpactShowcase.svelte';
  import TimeImpactCalculator from './portfolio/TimeImpactCalculator.svelte';

  // Project data
  let projects = [];
  let loading = true;
  let error = null;

  // Load projects from Supabase
  async function loadProjects() {
    try {
      loading = true;
      const { data, error: supabaseError } = await supabase
        .from('projects')
        .select('*')
        .order('order', { ascending: true });

      if (supabaseError) {
        throw new Error(supabaseError.message);
      }

      projects = data || [];
    } catch (err) {
      error = err.message;
      console.error('Error loading projects:', err);
    } finally {
      loading = false;
    }
  }

  // Load projects on component mount
  onMount(() => {
    loadProjects();
  });

  // Function to determine which showcase component to use based on project type
  function getShowcaseComponent(project) {
    switch (project.impact_type) {
      case 'insight':
        return InsightImpactShowcase;
      case 'money':
        return MoneyImpactCalculator;
      case 'sanity':
        return SanityImpactShowcase;
      case 'fun':
        return FunImpactShowcase;
      case 'time':
        return TimeImpactCalculator;
      default:
        return ImpactShowcase;
    }
  }
</script>

<section id="completed-projects" class="portfolio-section">
  <h2>Completed <span class="purple">Projects</span></h2>
  
  {#if loading}
    <div class="loading">Loading projects...</div>
  {:else if error}
    <div class="error">Error: {error}</div>
  {:else if projects.length === 0}
    <div class="no-projects">No projects found</div>
  {:else}
    <div class="projects-grid">
      {#each projects as project (project.id)}
        <div class="project-card">
          <svelte:component 
            this={getShowcaseComponent(project)} 
            {project} 
          />
        </div>
      {/each}
    </div>
  {/if}
</section>

<style>
  .portfolio-section {
    margin: 80px 0;
  }

  h2 {
    font-size: 2.5rem;
    margin-bottom: 2rem;
    text-align: center;
  }

  .purple {
    color: var(--purple-100);
  }

  .projects-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 2.5rem;
    margin-top: 2rem;
  }

  .project-card {
    border-radius: 12px;
    overflow: hidden;
    background-color: var(--light-100);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    height: 100%;
  }

  .project-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  }

  .loading, .error, .no-projects {
    text-align: center;
    padding: 3rem;
    font-size: 1.2rem;
    color: var(--dark-60);
  }

  .error {
    color: #d32f2f;
  }

  /* Media queries */
  @media (max-width: 768px) {
    .projects-grid {
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 1.5rem;
    }
  }

  @media (max-width: 480px) {
    .projects-grid {
      grid-template-columns: 1fr;
    }
  }
</style> 