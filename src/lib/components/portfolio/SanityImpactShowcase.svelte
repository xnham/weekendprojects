<script>
  import ImpactShowcase from './ImpactShowcase.svelte';
  
  // Props
  export let project;
  
  // Extract sanity impact data
  $: impactData = project.impact_data || {};
  $: stressReductionLevel = impactData.stress_reduction || 'medium';
  $: stressBeforeAfter = impactData.before_after || { before: 8, after: 3 };
  $: impactQuote = impactData.quote || 'This project significantly reduced my stress levels.';
  
  // Calculate stress reduction percentage
  $: stressReduction = Math.round(((stressBeforeAfter.before - stressBeforeAfter.after) / stressBeforeAfter.before) * 100);
  
  // Determine color based on stress reduction level
  $: stressColor = 
    stressReductionLevel === 'high' ? 'var(--dark-pink-100)' :
    stressReductionLevel === 'medium' ? 'var(--purple-100)' :
    'var(--dark-purple-100)';
</script>

<ImpactShowcase {project}>
  <div class="sanity-impact">
    <div class="sanity-visualization">
      <div class="percentage-circle" style="--stress-color: {stressColor}">
        <span class="percentage">{stressReduction}%</span>
        <span class="label">less stress</span>
      </div>
    </div>
    
    <div class="stress-levels">
      <div class="stress-level">
        <span class="label">Before</span>
        <div class="meter">
          <div class="meter-fill before" style="width: {(stressBeforeAfter.before / 10 * 100)}%"></div>
        </div>
        <span class="value">{stressBeforeAfter.before}/10</span>
      </div>
      
      <div class="stress-level">
        <span class="label">After</span>
        <div class="meter">
          <div class="meter-fill after" style="width: {(stressBeforeAfter.after / 10 * 100)}%"></div>
        </div>
        <span class="value">{stressBeforeAfter.after}/10</span>
      </div>
    </div>
    
    {#if impactQuote}
      <div class="impact-quote">
        <p>"{impactQuote}"</p>
      </div>
    {/if}
  </div>
</ImpactShowcase>

<style>
  .sanity-impact {
    display: flex;
    flex-direction: column;
    height: 100%;
    justify-content: center;
    gap: 1.5rem;
  }
  
  .sanity-visualization {
    display: flex;
    justify-content: center;
  }
  
  .percentage-circle {
    width: 110px;
    height: 110px;
    border-radius: 50%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: var(--dark-5);
    border: 2px solid var(--stress-color);
  }
  
  .percentage {
    font-size: 2rem;
    font-weight: 700;
    color: var(--stress-color);
    line-height: 1;
  }
  
  .label {
    font-size: 0.85rem;
    color: var(--dark-70);
    margin-top: 0.2rem;
  }
  
  .stress-levels {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  
  .stress-level {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  
  .stress-level .label {
    width: 50px;
    text-align: right;
    margin-top: 0;
  }
  
  .meter {
    flex: 1;
    height: 8px;
    background-color: var(--dark-10);
    border-radius: 4px;
    overflow: hidden;
  }
  
  .meter-fill {
    height: 100%;
    border-radius: 4px;
  }
  
  .meter-fill.before {
    background-color: var(--dark-pink-100);
  }
  
  .meter-fill.after {
    background-color: var(--purple-100);
  }
  
  .value {
    width: 40px;
    font-size: 0.85rem;
    font-weight: 500;
    color: var(--dark-80);
  }
  
  .impact-quote {
    text-align: center;
    font-style: italic;
    color: var(--dark-70);
    margin-top: 0.5rem;
  }
  
  .impact-quote p {
    margin: 0;
    font-size: 0.9rem;
    line-height: 1.4;
  }
</style> 