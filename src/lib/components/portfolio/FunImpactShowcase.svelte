<script>
  import ImpactShowcase from './ImpactShowcase.svelte';
  
  // Props
  export let project;
  
  // Extract fun impact data
  $: impactData = project.impact_data || {};
  $: funLevel = impactData.fun_level || 'high';
  $: funRating = impactData.fun_rating || 9;
  $: funBenefits = impactData.benefits || ['Makes me smile', 'Gets creative juices flowing'];
  
  // Map fun level to emoji
  $: funEmoji = 
    funLevel === 'extreme' ? '🤩' :
    funLevel === 'high' ? '😄' :
    funLevel === 'medium' ? '🙂' :
    '😌';
  
  // Map fun rating to color
  $: funColor = 
    funRating >= 9 ? 'var(--dark-orange-100)' :
    funRating >= 7 ? 'var(--purple-100)' :
    funRating >= 5 ? 'var(--dark-purple-100)' :
    'var(--dark-70)';
</script>

<ImpactShowcase {project}>
  <div class="fun-impact">
    <div class="fun-rating">
      <div class="emoji-container" style="--fun-color: {funColor}">{funEmoji}</div>
      <div class="rating-value" style="--fun-color: {funColor}">{funRating}/10</div>
      <div class="fun-level">Fun Factor: <span>{funLevel}</span></div>
    </div>
    
    <div class="fun-benefits">
      <h4>How it improves my day:</h4>
      <ul>
        {#each funBenefits as benefit}
          <li>{benefit}</li>
        {/each}
      </ul>
    </div>
  </div>
</ImpactShowcase>

<style>
  .fun-impact {
    display: flex;
    flex-direction: column;
    height: 100%;
    justify-content: center;
    gap: 1.5rem;
  }
  
  .fun-rating {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .emoji-container {
    font-size: 3rem;
    margin-bottom: 0.5rem;
    line-height: 1;
    filter: drop-shadow(0 0 3px rgba(0, 0, 0, 0.1));
  }
  
  .rating-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--fun-color);
    margin-bottom: 0.3rem;
  }
  
  .fun-level {
    font-size: 0.9rem;
    color: var(--dark-70);
  }
  
  .fun-level span {
    font-weight: 600;
    text-transform: capitalize;
  }
  
  .fun-benefits {
    padding: 0 0.5rem;
  }
  
  .fun-benefits h4 {
    font-size: 1rem;
    margin: 0 0 0.75rem 0;
    color: var(--dark-80);
    text-align: center;
  }
  
  .fun-benefits ul {
    list-style-type: none;
    padding: 0;
    margin: 0;
  }
  
  .fun-benefits li {
    position: relative;
    padding-left: 1.25rem;
    margin-bottom: 0.5rem;
    font-size: 0.95rem;
    color: var(--dark-70);
  }
  
  .fun-benefits li::before {
    content: "•";
    position: absolute;
    left: 0.25rem;
    color: var(--fun-color);
  }
</style> 