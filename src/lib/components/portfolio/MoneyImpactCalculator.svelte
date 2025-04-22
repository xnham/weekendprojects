<script>
  import { onMount } from 'svelte';
  import ImpactShowcase from './ImpactShowcase.svelte';
  
  // Props
  export let project;
  
  // Money impact data
  $: impactData = project.impact_data || {};
  $: savingsAmount = impactData.savings_amount || 0;
  $: savingsFrequency = impactData.savings_frequency || 'monthly';
  $: savingsCurrency = impactData.currency || 'USD';
  
  // State for calculated impact
  let annualSavings = 0;
  let fiveYearSavings = 0;
  let tenYearSavings = 0;
  
  // Currency formatter
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: savingsCurrency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
  
  // Calculate savings based on frequency
  function calculateSavings() {
    let annualMultiplier;
    
    switch(savingsFrequency) {
      case 'daily':
        annualMultiplier = 365;
        break;
      case 'weekly':
        annualMultiplier = 52;
        break;
      case 'monthly':
        annualMultiplier = 12;
        break;
      case 'quarterly':
        annualMultiplier = 4;
        break;
      case 'yearly':
      case 'annual':
        annualMultiplier = 1;
        break;
      default:
        annualMultiplier = 12; // Default to monthly
    }
    
    annualSavings = savingsAmount * annualMultiplier;
    fiveYearSavings = annualSavings * 5;
    tenYearSavings = annualSavings * 10;
  }
  
  // Format the savings amount with frequency for display
  function formatSavingsWithFrequency() {
    return `${formatter.format(savingsAmount)} ${savingsFrequency}`;
  }
  
  onMount(() => {
    calculateSavings();
  });
</script>

<ImpactShowcase {project}>
  <div class="money-impact">
    <div class="savings-amount">
      <span class="savings-label">Saves me:</span>
      <span class="savings-value">{formatSavingsWithFrequency()}</span>
    </div>
    
    <div class="projections">
      <div class="projection">
        <span class="year">1 YR</span>
        <span class="amount">{formatter.format(annualSavings)}</span>
      </div>
      <div class="projection">
        <span class="year">5 YR</span>
        <span class="amount">{formatter.format(fiveYearSavings)}</span>
      </div>
      <div class="projection">
        <span class="year">10 YR</span>
        <span class="amount">{formatter.format(tenYearSavings)}</span>
      </div>
    </div>
  </div>
</ImpactShowcase>

<style>
  .money-impact {
    display: flex;
    flex-direction: column;
    height: 100%;
    justify-content: center;
  }
  
  .savings-amount {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 1.5rem;
  }
  
  .savings-label {
    font-size: 1rem;
    color: var(--dark-70);
    margin-bottom: 0.4rem;
  }
  
  .savings-value {
    font-size: 1.8rem;
    font-weight: 600;
    color: var(--dark-orange-100);
  }
  
  .projections {
    display: flex;
    justify-content: space-between;
    padding: 0 0.5rem;
  }
  
  .projection {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1;
    padding: 0.75rem;
    border-radius: 8px;
    background-color: var(--dark-5);
  }
  
  .year {
    font-size: 0.9rem;
    color: var(--dark-60);
    margin-bottom: 0.3rem;
  }
  
  .amount {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--dark-90);
  }
</style> 