<script>
  import ImpactShowcase from './ImpactShowcase.svelte';
  
  // Props
  export let project;
  
  // Insights data (extract from project.impact_data or provide defaults)
  $: insightData = project.impact_data?.insights || [
    "Default insight 1 - This would normally come from your project data",
    "Default insight 2 - Add real data in your Supabase table"
  ];
</script>

<ImpactShowcase {project}>
  <div class="insights-impact">
    <h4>Key Insights</h4>
    
    <ul class="insights-list">
      {#each insightData as insight}
        <li>{insight}</li>
      {/each}
    </ul>
  </div>
</ImpactShowcase>

<style>
  .insights-impact {
    display: flex;
    flex-direction: column;
    height: 100%;
  }
  
  h4 {
    font-size: 1.2rem;
    margin: 0 0 1rem 0;
    color: var(--dark-90);
    text-align: center;
  }
  
  .insights-list {
    list-style-type: none;
    padding: 0;
    margin: 0;
  }
  
  .insights-list li {
    position: relative;
    padding-left: 1.5rem;
    margin-bottom: 0.75rem;
    line-height: 1.5;
    color: var(--dark-80);
  }
  
  .insights-list li::before {
    content: "•";
    position: absolute;
    left: 0.25rem;
    color: var(--purple-100);
    font-weight: bold;
  }
  
  .insights-list li:last-child {
    margin-bottom: 0;
  }
</style> 